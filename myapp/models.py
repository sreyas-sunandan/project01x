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


class Notification(models.Model):
    TARGET_CHOICES = [
        ('user', 'Specific User'),
        ('all', 'All Users'),
        ('public', 'Public'),
    ]

    title = models.CharField(max_length=100)
    message = models.TextField()

    target = models.CharField(max_length=10, choices=TARGET_CHOICES)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Complaint(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('replied', 'Replied'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    subject = models.CharField(max_length=150)
    message = models.TextField()

    admin_reply = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='open'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    replied_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject}"


