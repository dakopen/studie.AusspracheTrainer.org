from celery import shared_task, states, current_task

@shared_task(bind = True)
def analyze_task(self, text, audio_file):
    self.update_state(state=states.STARTED)
    # Perform the analysis here
    result = "<p>Your analysis result here.</p>"
    return result
