web: sh -c 'cd aussprachetrainer && gunicorn aussprachetrainer.wsgi:application --log-file -'
worker: sh -c 'cd aussprachetrainer && celery -A aussprachetrainer worker --loglevel=info'
