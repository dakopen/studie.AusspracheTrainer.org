from django.shortcuts import render
from frontend.views import render_into_base
from django.contrib.auth.decorators import login_required
from django.utils.translation import gettext as _
from analyze.models import PronunciationAssessmentResult
import csv
from aussprachetrainer.settings import BASE_DIR
from os import path

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

    csv_file_path = str(BASE_DIR) + (f'/learn/csv_sentences/{selected_language}.csv')
    sentences = []
    
    # TODO: create csv file for every language
    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile, delimiter='|')
        next(reader)
        for row in reader:
            sentence, difficulty = row
            best_result = results.filter(sentence=sentence).order_by('-accuracy').first()
            score = str(round(best_result.accuracy, 1)) if best_result else "?"

            difficulty_stars = range(int(difficulty))
            sentences.append({'text': sentence, 'difficulty': difficulty_stars, 'score': score})

    context = {
        'selected_language': selected_language,
        'sentences': sentences,
    }
    


    return render_into_base(request, _('Lernen'), 'learn.html', context,
                            css='frontend/assets/css/learn.css')