from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    skills = models.JSONField(default=list)           # ["Python", "Django", ...]
    preferred_roles = models.JSONField(default=list)  # ["Backend Developer", ...]
    preferred_locations = models.JSONField(default=list)
    remote_preference = models.CharField(
        max_length=20,
        choices=[('remote', 'Remote'), ('hybrid', 'Hybrid'), ('onsite', 'On-site'), ('any', 'Any')],
        default='any'
    )
    resume_text = models.TextField(blank=True)  # Parsed resume text
    resume_file = models.FileField(upload_to='resumes/', blank=True, null=True)
    embedding = models.JSONField(default=list)  # Stored resume embedding vector
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
