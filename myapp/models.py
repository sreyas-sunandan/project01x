from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

# Create your models here.

class GameStats(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.CharField(max_length=20)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    
class RankThreshold(models.Model):
    name = models.CharField(max_length=50)   # Gold, Silver, Bronze
    emoji = models.CharField(max_length=5)   # 🥇 🥈 🥉
    min_score = models.IntegerField()

    class Meta:
        ordering = ["-min_score"]

    def __str__(self):
        return f"{self.emoji} {self.name} ({self.min_score}+)"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="avatars/", default="avatars/default.png")

    def __str__(self):
        return self.user.username

