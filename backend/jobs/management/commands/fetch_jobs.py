from django.core.management.base import BaseCommand
from jobs.aggregator import run_aggregation


class Command(BaseCommand):
    help = 'Fetch new jobs from all configured sources (Adzuna, Jooble, RSS)'

    def handle(self, *args, **options):
        self.stdout.write('Running job aggregation...')
        result = run_aggregation()
        self.stdout.write(self.style.SUCCESS(
            f"Done. {result['total_new_jobs']} new jobs added. By source: {result['by_source']}"
        ))
