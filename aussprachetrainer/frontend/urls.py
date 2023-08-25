from django.urls import path
from .views import index, contact, legal_notice, privacy_policy, initiate_analysis, check_status

urlpatterns = [
    path('', index, name='index'), # Render index at the root URL
    path('contact/', contact, name='contact'),
    path('legal_notice/', legal_notice, name='legal_notice'),
    path('privacy_policy/', privacy_policy, name='privacy_policy'),
    path('analyze/', initiate_analysis, name='initiate_analysis'),
    path('check_status/<str:task_id>/', check_status, name='check_status'),
    # other URL patterns...
]
