from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Job, SavedJob, JobApplication
from .serializers import JobSerializer, JobListSerializer, SavedJobSerializer, JobApplicationSerializer


class JobListView(generics.ListAPIView):
    serializer_class = JobListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company', 'location', 'description']
    ordering_fields = ['created_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Job.objects.filter(is_scam_flagged=False)
        remote = self.request.query_params.get('remote')
        job_type = self.request.query_params.get('job_type')
        location = self.request.query_params.get('location')
        source = self.request.query_params.get('source')

        if remote == 'true':
            qs = qs.filter(remote=True)
        if job_type:
            qs = qs.filter(job_type__icontains=job_type)
        if location:
            qs = qs.filter(location__icontains=location)
        if source:
            qs = qs.filter(source=source)
        return qs


class JobDetailView(generics.RetrieveAPIView):
    queryset = Job.objects.filter(is_scam_flagged=False)
    serializer_class = JobSerializer
    permission_classes = [permissions.AllowAny]


class SavedJobListView(generics.ListCreateAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user).select_related('job')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SavedJobDeleteView(generics.DestroyAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)


class ApplicationListView(generics.ListCreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user).select_related('job')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JobApplication.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def job_search(request):
    """Simple keyword + filter search."""
    q = request.query_params.get('q', '')
    location = request.query_params.get('location', '')
    remote = request.query_params.get('remote')

    qs = Job.objects.filter(is_scam_flagged=False)

    if q:
        qs = qs.filter(
            Q(title__icontains=q) |
            Q(company__icontains=q) |
            Q(description__icontains=q) |
            Q(skills_required__icontains=q)
        )
    
    if location:
        qs = qs.filter(location__icontains=location)
        
    if remote == 'true':
        qs = qs.filter(remote=True)

    qs = qs.order_by('-created_at')[:50]
    return Response(JobListSerializer(qs, many=True).data)
