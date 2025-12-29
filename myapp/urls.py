"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from myapp import views

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', views.home_page, name='home'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('admin_home/', views.admin_home_page, name='admin_home'),
    path('user_home/', views.user_home_page, name='user_home'),
    path("logout/", views.user_logout, name="logout"),
   	path("tic-tac-toe/", views.tic_tac_toe, name="tic_tac_toe"),
   	path("update-result/", views.update_result, name="update_result"),
	path("leaderboard/", views.leaderboard, name="leaderboard"),
	path("games/rps/", views.rps, name="rps"),
	path("games/", views.games, name="games"),
	path("player/<int:user_id>/", views.player_profile, name="player_profile"),
	path("manage-users/", views.manage_users, name="manage_users"),
    path("manage-users/delete/<int:user_id>/", views.delete_user, name="delete_user"),
    path("notifications/", views.admin_notifications, name="admin_notifications"),
	path("notifications/send/", views.send_notification, name="send_notification"),
	path("notifications/delete/<int:pk>/", views.delete_notification, name="delete_notification"),
	path("complaints/send/", views.send_complaint, name="send_complaint"),
	path("complaints/my/", views.my_complaints, name="my_complaints"),

    path("admin-panel/complaints/", views.admin_complaints, name="admin_complaints"),




]

