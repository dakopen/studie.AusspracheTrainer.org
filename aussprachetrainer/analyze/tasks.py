from celery import shared_task
from .pronunciation_assessment import pronunciation_assessment_continuous_from_file
from .models import PronunciationAssessmentResult, PhonemeAssessmentResult
from django.contrib.auth import get_user_model


@shared_task()
def async_pronunciation_assessment(filename, reference_text, language, user_id=None):
    print("async_pronunciation_assessment")
    result, word_offset_duration, phoneme_dicts = pronunciation_assessment_continuous_from_file(filename, reference_text, language)

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
        language=language
    )

    if user is not None:
        for phoneme_dict in phoneme_dicts:
            phoneme_result, created = PhonemeAssessmentResult.objects.get_or_create(
                user=user, 
                phoneme_id=phoneme_dict["phoneme_id"], 
                language=language,
                defaults={"how_many_times": 1, "score": phoneme_dict["score"]}
            )
            
            if not created:
                phoneme_result.how_many_times += 1
                phoneme_result.score = (phoneme_dict["score"] + phoneme_result.score * phoneme_result.how_many_times) / (phoneme_result.how_many_times + 1)
                phoneme_result.save()



    return result, word_offset_duration

