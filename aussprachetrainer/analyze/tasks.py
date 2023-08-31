from celery import shared_task
from .pronunciation_assessment import pronunciation_assessment_continuous_from_file
from .models import PronunciationAssessmentResult
from django.contrib.auth import get_user_model

@shared_task()
def async_pronunciation_assessment(filename, reference_text, language, user_id=None):

    result = pronunciation_assessment_continuous_from_file(filename, reference_text, language)

    if user_id:
        User = get_user_model()
        user = User.objects.get(id=user_id)
    else:
        user = None

    PronunciationAssessmentResult.objects.create(
        user=user,
        accuracy=result["Paragraph"]["accuracy_score"],
        completeness=result["Paragraph"]["completeness_score"],
        fluency=result["Paragraph"]["fluency_score"],
        sentence=reference_text,
        recognized_sentence=" ".join(result["RecognizedWords"]),
        word_assessment=result["Words"],
        language=language
    )

    return result

