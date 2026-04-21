from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Periodic task schedule
app.conf.beat_schedule = {
    'fetch-jobs-every-6-hours': {
        'task': 'jobs.tasks.fetch_all_jobs',
        'schedule': crontab(minute=0, hour='*/6'),
    },
    'expire-old-jobs-daily': {
        'task': 'jobs.tasks.expire_old_jobs',
        'schedule': crontab(minute=0, hour=3),
    },
    'update-embeddings-daily': {
        'task': 'jobs.tasks.update_job_embeddings',
        'schedule': crontab(minute=30, hour=4),
    },
}
