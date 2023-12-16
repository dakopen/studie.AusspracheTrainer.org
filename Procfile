web: gunicorn aussprachetrainer.aussprachetrainer.wsgi:application --log-file -
worker: celery -A aussprachetrainer worker --loglevel=info
