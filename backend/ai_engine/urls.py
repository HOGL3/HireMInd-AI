from django.urls import path
from .views import recommended_jobs, copilot, cover_letter, parse_resume, market_insights, resume_analyze

urlpatterns = [
    path('recommendations/', recommended_jobs, name='recommendations'),
    path('copilot/', copilot, name='copilot'),
    path('cover-letter/', cover_letter, name='cover-letter'),
    path('resume/parse/', parse_resume, name='parse-resume'),
    path('resume/analyze/', resume_analyze, name='resume-analyze'),
    path('market-insights/', market_insights, name='market-insights'),
]
