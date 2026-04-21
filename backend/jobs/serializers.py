from rest_framework import serializers
from .models import Job, SavedJob, JobApplication


class JobSerializer(serializers.ModelSerializer):
    fit_score = serializers.SerializerMethodField()
    missing_skills = serializers.SerializerMethodField()
    ai_explanation = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'description',
            'salary_min', 'salary_max', 'salary_currency', 'job_type',
            'remote', 'skills_required', 'apply_url', 'source',
            'is_verified', 'is_scam_flagged', 'posted_at', 'expires_at',
            'created_at', 'fit_score', 'missing_skills', 'ai_explanation',
        ]

    def get_fit_score(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, '_job_fits'):
            return request._job_fits.get(obj.id, {}).get('score')
        return None

    def get_missing_skills(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, '_job_fits'):
            return request._job_fits.get(obj.id, {}).get('missing_skills', [])
        return []

    def get_ai_explanation(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, '_job_fits'):
            return request._job_fits.get(obj.id, {}).get('explanation')
        return None


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job list view."""
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company', 'location', 'salary_min', 'salary_max',
            'job_type', 'remote', 'skills_required', 'source', 'is_verified',
            'posted_at', 'created_at',
        ]


class SavedJobSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), source='job', write_only=True
    )

    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'job_id', 'saved_at', 'notes']
        read_only_fields = ['saved_at']


class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobListSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), source='job', write_only=True
    )

    class Meta:
        model = JobApplication
        fields = ['id', 'job', 'job_id', 'status', 'applied_at', 'cover_letter', 'notes']
        read_only_fields = ['applied_at']
