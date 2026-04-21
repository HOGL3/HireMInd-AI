from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(name='jobs.tasks.fetch_all_jobs')
def fetch_all_jobs():
    """Celery task: fetch jobs from all sources every 6–12 hours."""
    from jobs.aggregator import run_aggregation
    result = run_aggregation()
    logger.info(f'Job fetch complete: {result}')
    return result


@shared_task(name='jobs.tasks.expire_old_jobs')
def expire_old_jobs():
    """Remove jobs older than 14 days."""
    from django.utils import timezone
    from datetime import timedelta
    from jobs.models import Job
    cutoff = timezone.now() - timedelta(days=14)
    deleted, _ = Job.objects.filter(created_at__lt=cutoff).delete()
    logger.info(f'Expired {deleted} old jobs.')
    return deleted


@shared_task(name='jobs.tasks.update_job_embeddings')
def update_job_embeddings():
    """Re-embed jobs that have empty embeddings."""
    from jobs.models import Job
    from ai_engine.services import get_embedding, extract_skills_from_text
    jobs = Job.objects.filter(embedding=[])[:50]
    updated = 0
    for job in jobs:
        emb = get_embedding(job.description[:2000])
        skills = extract_skills_from_text(job.description)
        Job.objects.filter(pk=job.pk).update(embedding=emb, skills_required=skills)
        updated += 1
    logger.info(f'Updated embeddings for {updated} jobs.')
    return updated
