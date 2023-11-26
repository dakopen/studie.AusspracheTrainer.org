from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from frontend.views import render_into_base
from analyze.models import PronunciationAssessmentResult
from django.db.models import Avg, Count

@login_required
def dashboard_view(request):
    user = request.user
    selected_language = request.GET.get('language')

    # Fetch PronunciationAssessmentResults for the user
    results = PronunciationAssessmentResult.objects.filter(user=user)

    # Get the latest used language if none is selected
    if not selected_language:
        latest_result = results.order_by('-created_at').first()
        selected_language = latest_result.language if latest_result else "de-DE"

    # Filter results by the selected language
    if selected_language:
        results = results.filter(language=selected_language)

    averages = results.aggregate(
        avg_accuracy=Avg('accuracy'),
        avg_fluency=Avg('fluency'),
    )

    # Handling None values
    averages['avg_accuracy'] = round(averages['avg_accuracy']) if averages['avg_accuracy'] is not None else "?"
    averages['avg_fluency'] = round(averages['avg_fluency']) if averages['avg_fluency'] is not None else "?"

    context = {
        'avg_accuracy': averages['avg_accuracy'],
        'avg_fluency': averages['avg_fluency'],
        'avg_aussprachetrainer': 'Coming soon', #round(90.34),  # Mock data
        'selected_language': selected_language,
        # Add other context data as needed
    }

    return render_into_base(request, 'Dashboard', 'dashboard.html', context,
                            css='frontend/assets/css/dashboard.css')


# TODO: add user profile settings and move logout there (from the header)