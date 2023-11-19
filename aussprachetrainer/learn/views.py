from django.shortcuts import render
from frontend.views import render_into_base
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from analyze.models import PronunciationAssessmentResult

@login_required
def learn_view(request):

    user = request.user
    selected_language = request.GET.get('language')

    # Fetch PronunciationAssessmentResults for the user
    results = PronunciationAssessmentResult.objects.filter(user=user)
    # Get the latest used language if none is selected
    if not selected_language:
        latest_result = results.order_by('-created_at').first()
        selected_language = latest_result.language if latest_result else "de-DE"

    
    context = {
        'selected_language': selected_language,
    }
    
    return render_into_base(request, _('Lernen'), 'learn.html', context,
                            css='frontend/assets/css/dashboard.css')