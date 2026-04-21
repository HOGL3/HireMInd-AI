from django.urls import path
from .views import (
    JobListView, JobDetailView, SavedJobListView, SavedJobDeleteView,
    ApplicationListView, ApplicationDetailView, job_search
)

urlpatterns = [
    path('', JobListView.as_view(), name='job-list'),
    path('search/', job_search, name='job-search'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
    path('saved/', SavedJobListView.as_view(), name='saved-jobs'),
    path('saved/<int:pk>/', SavedJobDeleteView.as_view(), name='saved-job-delete'),
    path('applications/', ApplicationListView.as_view(), name='applications'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application-detail'),
]
