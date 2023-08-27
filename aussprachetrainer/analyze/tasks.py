from celery import shared_task, states
import time
from .pronunciation_assessment import pronunciation_assessment_continuous_from_file

@shared_task()
def async_pronunciation_assessment(filename, reference_text, language):

    result = pronunciation_assessment_continuous_from_file(filename, reference_text, language)
    # Do something with result, like saving to the database or sending to the client

    return result

