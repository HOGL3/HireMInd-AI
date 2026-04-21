from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from jobs.models import Job
from jobs.serializers import JobSerializer
from accounts.models import Profile
from .services import (
    get_embedding, calculate_fit_score, generate_cover_letter,
    copilot_chat, extract_skills_from_text, analyze_resume, extract_text_from_file
)


@api_view(['POST'])
@permission_classes([AllowAny])
def resume_analyze(request):
    """Analyze resume text or file and return rating/suggestions."""
    text = request.data.get('text', '')
    
    # Check for file upload
    if 'file' in request.FILES:
        uploaded_file = request.FILES['file']
        text = extract_text_from_file(uploaded_file)
        if not text:
            return Response({'error': 'Failed to extract text from file.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    if not text:
        return Response({'error': 'Resume text or file required.'}, status=status.HTTP_400_BAD_REQUEST)

    analysis = analyze_resume(text)
    return Response(analysis)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_jobs(request):
    """Return top 20 jobs ranked by AI fit score for this user."""
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)

    jobs = Job.objects.filter(is_scam_flagged=False).order_by('-created_at')[:100]

    user_emb = profile.embedding or get_embedding(
        ' '.join(profile.skills) + ' ' + profile.resume_text
    )

    scored_jobs = []
    job_fits = {}
    for job in jobs:
        job_emb = job.embedding or get_embedding(job.description[:2000])
        fit = calculate_fit_score(user_emb, job_emb, profile.skills, job.skills_required)
        job_fits[job.id] = fit
        scored_jobs.append((fit['score'], job))

    scored_jobs.sort(key=lambda x: x[0], reverse=True)
    top_jobs = [job for _, job in scored_jobs[:20]]

    request._job_fits = job_fits
    serializer = JobSerializer(top_jobs, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def copilot(request):
    """Career Copilot chat endpoint."""
    message = request.data.get('message', '').strip()
    if not message:
        return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        profile = request.user.profile
        user_data = {
            'skills': profile.skills,
            'experience_years': profile.experience_years,
        }
    except Exception:
        user_data = {'skills': [], 'experience_years': 0}

    recent_jobs = list(
        Job.objects.filter(is_scam_flagged=False)
        .order_by('-created_at')[:10]
        .values('title', 'company', 'location')
    )

    reply = copilot_chat(message, user_data, recent_jobs)
    return Response({'reply': reply})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cover_letter(request):
    """Generate AI cover letter for a specific job."""
    job_id = request.data.get('job_id')
    if not job_id:
        return Response({'error': 'job_id required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        job = Job.objects.get(pk=job_id)
    except Job.DoesNotExist:
        return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        profile = request.user.profile
        user_data = {
            'skills': profile.skills,
            'experience_years': profile.experience_years,
        }
    except Exception:
        user_data = {'skills': [], 'experience_years': 0}

    letter = generate_cover_letter(user_data, {'title': job.title, 'company': job.company})
    return Response({'cover_letter': letter})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_resume(request):
    """Extract skills from pasted resume text."""
    text = request.data.get('text', '')
    if not text:
        return Response({'error': 'Resume text required.'}, status=status.HTTP_400_BAD_REQUEST)

    skills = extract_skills_from_text(text)
    emb = get_embedding(text[:4000])

    profile, _ = Profile.objects.get_or_create(user=request.user)
    profile.resume_text = text
    profile.embedding = emb
    if skills:
        existing = set(profile.skills)
        profile.skills = list(existing | set(skills))
    profile.save()

    return Response({'extracted_skills': skills, 'message': 'Resume parsed and profile updated.'})


@api_view(['GET'])
@permission_classes([AllowAny])
def market_insights(request):
    """Return simple market intelligence: top skills in demand across all jobs."""
    from collections import Counter
    jobs = Job.objects.filter(is_scam_flagged=False).values_list('skills_required', flat=True)
    all_skills = []
    for skill_list in jobs:
        if isinstance(skill_list, list):
            all_skills.extend(skill_list)
    top_skills = Counter(all_skills).most_common(15)
    return Response({
        'top_skills': [{'skill': s, 'count': c} for s, c in top_skills],
        'total_jobs': Job.objects.filter(is_scam_flagged=False).count(),
    })
