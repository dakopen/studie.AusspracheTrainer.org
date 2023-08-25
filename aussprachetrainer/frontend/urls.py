from django.urls import path
from .views import index, contact, legal_notice, privacy_policy

urlpatterns = [
    path('', index, name='index'), # Render index at the root URL
    path('contact/', contact, name='contact'),
    path('legal_notice/', legal_notice, name='legal_notice'),
    path('privacy_policy/', privacy_policy, name='privacy_policy'),
    # other URL patterns...
]
