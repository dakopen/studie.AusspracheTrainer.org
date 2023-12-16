from django.urls import path
from .views import learn_view

urlpatterns = [
    path('', learn_view, name='learn'),
]