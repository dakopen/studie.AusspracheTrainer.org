from django.urls import path
from .views import index, contact, legal_notice, privacy_policy, \
                   initiate_analysis, check_status, waiting_page, \
                   analysis_error, change_language, generate_random_sentence

urlpatterns = [
    path('', index, name='index'), # Render index at the root URL
    path('change_language/', change_language, name='change_language'),
    path('contact/', contact, name='contact'),
    path('legal_notice/', legal_notice, name='legal_notice'),
    path('privacy_policy/', privacy_policy, name='privacy_policy'),
    path('analyze/', initiate_analysis, name='initiate_analysis'),
    path('check_status/<str:task_id>/', check_status, name='check_status'),
    path('waiting_page/<str:task_id>/', waiting_page, name='waiting_page'),
    path('analysis_error/', analysis_error, name='analysis_error'),
    path('generate_random_sentence/', generate_random_sentence, name='generate_random_sentence')
    # other URL patterns...
]
