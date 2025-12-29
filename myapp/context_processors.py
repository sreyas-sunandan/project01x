from .models import Notification

def notifications(request):
    public_notifications = Notification.objects.filter(
        target="public"
    ).order_by("-created_at")[:5]

    user_notifications = Notification.objects.none()

    if request.user.is_authenticated:
        user_notifications = (
            Notification.objects.filter(target="public") |
            Notification.objects.filter(target="all") |
            Notification.objects.filter(
                target="user",
                user=request.user
            )
        ).order_by("-created_at")[:5]

    return {
        "public_notifications": public_notifications,
        "user_notifications": user_notifications,
    }

