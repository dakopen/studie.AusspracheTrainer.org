from celery import shared_task, states
import time

@shared_task(bind = True)
def analyze_task(self, text, audio_file):
    self.update_state(state=states.STARTED)
    time.sleep(10)
    # Perform the analysis here
    result = "<p>Your analysis result here.</p>"
    return result
