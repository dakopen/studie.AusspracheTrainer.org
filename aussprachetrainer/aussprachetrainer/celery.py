import os
from celery import Celery
from django.conf import settings
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aussprachetrainer.settings')

app = Celery('aussprachetrainer')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
app.conf.result_backend = 'redis://localhost:6379/0'

app.conf.beat_schedule = {
    'run-my-task-every-6-hours': {
        'task': 'analyze.tasks.clean_synthesized_audio_files',
        'schedule': crontab(hour='*/6'),
    },
}