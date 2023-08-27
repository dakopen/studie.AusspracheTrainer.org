from celery import shared_task, states
import time
from .pronunciation_assessment import pronunciation_assessment_continuous_from_file

@shared_task()
def async_pronunciation_assessment(filename, reference_text, language):
    print(f"Filename: {filename}")
    result = pronunciation_assessment_continuous_from_file(filename, reference_text, language)
    print(result)
    
    return "<p>Your analysis result here.</p>"
    # Do something with result, like saving to the database or sending to the client

