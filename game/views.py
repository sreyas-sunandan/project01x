from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import GameScore
import json
from django.db.models import Max


# Create your views here.
def home(request):
    return render(request, 'game/home.html')
    
@csrf_exempt
@login_required
def save_score(request):
    if request.method == "POST":
        data = json.loads(request.body)
        new_score = int(data.get("score", 0))

        # 🔍 Get current high score (if exists)
        last_high = (
            GameScore.objects
            .filter(user=request.user)
            .order_by('-score')
            .first()
        )

        # If no score yet OR new score is higher → save
        if last_high is None or new_score > last_high.score:
            GameScore.objects.create(
                user=request.user,
                score=new_score
            )
            high_score = new_score
        else:
            high_score = last_high.score

        return JsonResponse({
            "status": "ok",
            "high_score": high_score
        })
        
#-------------------------------------------------------
def get_best_score_for_user(user):
    """
    Returns the best score for a given user
    """
    result = GameScore.objects.filter(user=user).aggregate(
        best_score=Max("score")
    )
    return result["best_score"] or 0

