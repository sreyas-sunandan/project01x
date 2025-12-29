from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from .models import *
from game.models import GameScore
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Sum, Max, Q
from collections import defaultdict
from game.views import get_best_score_for_user 
from django.views.decorators.cache import never_cache
from django.utils import timezone
# ------------------------------------------------------------
# Template views

def home_page(request):
    return render(request, 'public_home.html')
    

# ✅ admin check
def is_admin(user):
    return user.is_superuser


def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            #  Role-based redirect
            if user.is_staff or user.is_superuser:
                return redirect('admin_home')
            else:
                return redirect('user_home')

        else:
            messages.error(request, "Invalid credentials")

    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect("login") 

def register_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm = request.POST.get('confirm_password')

        if password != confirm:
            messages.error(request, "Passwords do not match")
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return redirect('register')

        User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        messages.success(request, "Account created successfully")
        return redirect('login')

    return render(request, 'register.html')

@user_passes_test(is_admin)
def admin_home_page(request):
    return render(request, 'admin_home.html')
    
@login_required
def user_home_page(request):
    return render(request, 'user_home.html')

def games(request):
    return render(request, "games.html")
#-------------------------------------------------------------


@login_required
@user_passes_test(is_admin)
def manage_users(request):
    users = User.objects.filter(is_superuser=False)

    return render(request, "admin_manage_users.html", {
        "users": users
    })
    
@login_required
@user_passes_test(is_admin)
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id, is_superuser=False)

    if request.method == "POST":
        user.delete()
        return redirect("manage_users")

    return redirect("manage_users")


@user_passes_test(is_admin)
def send_notification(request):
    users = User.objects.filter(is_superuser=False)

    if request.method == "POST":
        title = request.POST.get("title")
        message = request.POST.get("message")
        target = request.POST.get("target")
        user_id = request.POST.get("user")

        if target == "user" and user_id:
            Notification.objects.create(
                title=title,
                message=message,
                target="user",
                user_id=user_id
            )
        else:
            Notification.objects.create(
                title=title,
                message=message,
                target=target
            )

        return redirect("send_notification")

    return render(request, "admin_send_notification.html", {
        "users": users
    })


@user_passes_test(is_admin)
def delete_notification(request, pk):
    notification = get_object_or_404(Notification, pk=pk)

    if request.method == "POST":
        notification.delete()
        return redirect("admin_notifications")

    return redirect("admin_notifications")
    
@user_passes_test(is_admin)
def admin_notifications(request):
    notifications = Notification.objects.all().order_by("-created_at")
    return render(request, "admin_notifications.html", {
        "notifications": notifications
    })


@user_passes_test(is_admin)
def admin_complaints(request):

    if request.method == "POST":
        complaint_id = request.POST.get("complaint_id")
        reply = request.POST.get("reply")

        # ✅ SAFETY CHECK
        if complaint_id and reply:
            complaint = get_object_or_404(Complaint, id=complaint_id)
            complaint.admin_reply = reply
            complaint.status = "replied"
            complaint.replied_at = timezone.now()
            complaint.save()

        return redirect("admin_complaints")

    complaints = Complaint.objects.all().order_by("-created_at")
    return render(request, "admin_complaints.html", {
        "complaints": complaints
    })
# ------------------------------------------------------------

def tic_tac_toe(request):
    return render(request, "tic_tac_toe.html")
    
def rps(request):
    return render(request, "rps.html")

@login_required
def send_complaint(request):
    if request.method == "POST":
        Complaint.objects.create(
            user=request.user,
            subject=request.POST["subject"],
            message=request.POST["message"]
        )
        return redirect("my_complaints")

    return render(request, "send_complaint.html")  

@login_required
def my_complaints(request):
    complaints = Complaint.objects.filter(user=request.user).order_by("-created_at")
    return render(request, "my_complaints.html", {
        "complaints": complaints
    })


@login_required
def update_result(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid method"}, status=405)

    game = request.GET.get("game")
    result = request.GET.get("result")

    if not game or not result:
        return JsonResponse({"error": "Missing parameters"}, status=400)

    stats, created = GameStats.objects.get_or_create(
        user=request.user,
        game=game
    )

    if result == "win":
        stats.wins = stats.wins + 1
    elif result == "lose":
        stats.losses = stats.losses + 1

    stats.save()
    return JsonResponse({"status": "ok"})
    


# ---------- HELPER FUNCTION (TTT / RPS) ----------
def get_game_stats_for_user(user, game_code):
    data = GameStats.objects.filter(
        user=user,
        game=game_code
    ).aggregate(
        wins=Sum("wins"),
        losses=Sum("losses")
    )

    wins = data["wins"] or 0
    losses = data["losses"] or 0

    return {
        "wins": wins,
        "losses": losses,
        "score": wins - losses
    }


# ---------- LEADERBOARD ----------
@login_required
@never_cache
def leaderboard(request):
    users = User.objects.select_related("userprofile")

    # ==============================
    # OVERALL LEADERBOARD
    # ==============================
    combined = []

    for user in users:
        ttt = get_game_stats_for_user(user, "ttt")
        rps = get_game_stats_for_user(user, "rps")
        best_score = get_best_score_for_user(user)

        total_score = ttt["score"] + rps["score"] + best_score

        combined.append({
            "user": user,
            "score": total_score
        })

    combined.sort(key=lambda x: x["score"], reverse=True)

    # ==============================
    # TIC TAC TOE LEADERBOARD
    # ==============================
    ttt_all = (
        User.objects
        .filter(gamestats__game="ttt")
        .select_related("userprofile")
        .annotate(
            wins=Sum(
                "gamestats__wins",
                filter=Q(gamestats__game="ttt")
            ),
            losses=Sum(
                "gamestats__losses",
                filter=Q(gamestats__game="ttt")
            ),
        )
        .distinct()
        .order_by("-wins")
    )

    for user in ttt_all:
        user.score = (user.wins or 0) - (user.losses or 0)

    # ==============================
    # ROCK PAPER SCISSORS LEADERBOARD
    # ==============================
    rps_all = (
        User.objects
        .filter(gamestats__game="rps")
        .select_related("userprofile")
        .annotate(
            wins=Sum(
                "gamestats__wins",
                filter=Q(gamestats__game="rps")
            ),
            losses=Sum(
                "gamestats__losses",
                filter=Q(gamestats__game="rps")
            ),
        )
        .distinct()
        .order_by("-wins")
    )

    for user in rps_all:
        user.score = (user.wins or 0) - (user.losses or 0)

    # ==============================
    # SCORE-BASED GAME LEADERBOARD
    # ==============================
    score_game = (
        User.objects
        .filter(gamescore__isnull=False)
        .select_related("userprofile")
        .annotate(best_score=Max("gamescore__score"))
        .distinct()
        .order_by("-best_score")
    )

    # ==============================
    # RENDER
    # ==============================
    return render(request, "leaderboard.html", {
        "top3": combined[:10],
        "ttt_all": ttt_all,
        "rps_all": rps_all,
        "score_game": score_game,
    })
# ---------- PLAYER PROFILE ----------
@login_required
def player_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)

    # 🔐 Handle avatar upload (ONLY profile owner)
    if request.method == "POST" and request.user == user:
        if request.FILES.get("avatar"):
            profile = user.userprofile
            profile.avatar = request.FILES["avatar"]
            profile.save()

    # ---------- GAME STATS ----------
    ttt = get_game_stats_for_user(user, "ttt")
    rps = get_game_stats_for_user(user, "rps")
    best_score = get_best_score_for_user(user)

    overall_score = ttt["score"] + rps["score"] + best_score

    # ---------- RANK LOGIC ----------
    if overall_score >= 200:
        rank = "🥇 Gold"
    elif overall_score >= 100:
        rank = "🥈 Silver"
    else:
        rank = "🥉 Bronze"

    context = {
        "player": user,
        "overall_score": overall_score,
        "rank": rank,
        "ttt": ttt,
        "rps": rps,
        "best_score": best_score,
    }

    return render(request, "player_profile.html", context)

