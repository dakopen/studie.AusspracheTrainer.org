from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'), # Render index at the root URL
    # other URL patterns...
]
