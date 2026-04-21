from django.db import models


# Source weight table — higher = more trusted/relevant for Indian ecosystem
SOURCE_WEIGHTS = {
    'naukri': 1.8,
    'internshala': 1.7,
    'foundit': 1.6,
    'timesjobs': 1.5,
    'adzuna': 1.2,
    'jooble': 1.1,
    'rss': 1.0,
    'manual': 1.0,
}


class Job(models.Model):
    SOURCE_CHOICES = [
        ('adzuna', 'Adzuna'),
        ('jooble', 'Jooble'),
        ('naukri', 'Naukri'),
        ('internshala', 'Internshala'),
        ('foundit', 'Foundit (Monster)'),
        ('timesjobs', 'TimesJobs'),
        ('rss', 'RSS Feed'),
        ('manual', 'Manual'),
    ]
    EXPERIENCE_CHOICES = [
        ('fresher', 'Fresher (0–1 yr)'),
        ('mid', 'Mid-level (2–5 yr)'),
        ('senior', 'Senior (5+ yr)'),
    ]
    COMPETITION_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='INR')
    normalized_salary_inr = models.CharField(max_length=100, blank=True)  # e.g. "₹6–10 LPA"
    job_type = models.CharField(max_length=50, blank=True)
    remote = models.BooleanField(default=False)
    skills_required = models.JSONField(default=list)
    apply_url = models.URLField(max_length=1000)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='manual')
    source_id = models.CharField(max_length=255, blank=True)
    source_weight = models.FloatField(default=1.0)          # ranking boost per platform
    is_verified = models.BooleanField(default=False)
    is_scam_flagged = models.BooleanField(default=False)
    experience_level = models.CharField(max_length=10, choices=EXPERIENCE_CHOICES, default='mid')
    is_internship = models.BooleanField(default=False)
    is_fresher_friendly = models.BooleanField(default=False)
    competition_level = models.CharField(max_length=10, choices=COMPETITION_CHOICES, default='medium')
    embedding = models.JSONField(default=list)
    posted_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['source', 'source_id']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['company']),
            models.Index(fields=['remote']),
            models.Index(fields=['location']),
            models.Index(fields=['experience_level']),
            models.Index(fields=['is_internship']),
            models.Index(fields=['is_fresher_friendly']),
            models.Index(fields=['created_at']),
            models.Index(fields=['source_weight']),
        ]

    def __str__(self):
        return f"{self.title} at {self.company}"



class SavedJob(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['user', 'job']

    def __str__(self):
        return f"{self.user.username} saved {self.job.title}"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interviewing', 'Interviewing'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        unique_together = ['user', 'job']

    def __str__(self):
        return f"{self.user.username} applied to {self.job.title}"
