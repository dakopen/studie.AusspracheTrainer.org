from django.urls import path
from .views import UserLoginView, UserLogoutView, register_view, check_username

urlpatterns = [
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('register/', register_view, name='register'),
    path('check_username/', check_username, name='check_username')
]
