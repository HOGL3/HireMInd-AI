"""
AI Engine v2: Enhanced matching with multi-factor scoring.
Factors: Semantic similarity, Source weight, Location match, Recency, Fresher bonus.
Full fallback without OpenAI API.
"""
import math
import os
import re
from datetime import datetime, timezone
from typing import List, Dict, Optional

# ── Skill vocabulary (English + India tech ecosystem) ──────────────
COMMON_SKILLS = [
    # Languages
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby',
    'kotlin', 'swift', 'php', 'scala', 'dart', 'r',
    # Frontend
    'react', 'next.js', 'vue', 'angular', 'flutter', 'react native',
    'html', 'css', 'tailwind', 'bootstrap', 'figma',
    # Backend
    'node.js', 'express', 'fastapi', 'django', 'flask', 'spring boot',
    'rails', 'laravel', 'asp.net',
    # Data / ML / AI
    'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch',
    'scikit-learn', 'pandas', 'numpy', 'keras', 'opencv', 'langchain', 'llm',
    'data science', 'data analysis', 'tableau', 'power bi',
    # Databases
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'sqlite', 'firebase', 'dynamodb', 'cassandra',
    # DevOps / Cloud
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform',
    'ci/cd', 'git', 'github actions', 'jenkins', 'linux',
    # API / Architecture
    'rest api', 'graphql', 'microservices', 'kafka', 'rabbitmq',
    'websocket', 'grpc',
    # Agile / Process
    'agile', 'scrum', 'jira', 'confluence',
    # Indian ecosystem extras
    'salesforce', 'sap', 'oracle', 'hadoop', 'spark', 'airflow',
    'selenium', 'appium', 'postman', 'cypress',
]

INDIA_CITIES = [
    'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai',
    'pune', 'kolkata', 'ahmedabad', 'jaipur', 'noida', 'gurgaon', 'gurugram',
    'remote', 'work from home', 'wfh',
]

FRESHER_SIGNALS = [
    'fresher', 'fresh graduate', '0-1 years', '0 to 1 year', 'entry level',
    'entry-level', 'no experience', 'graduate trainee', 'campus hiring',
    'college graduate', 'trainee', 'junior',
]

INTERNSHIP_SIGNALS = [
    'internship', 'intern', 'stipend', 'summer intern', 'winter intern',
    '3 months', '6 months internship',
]

SENIOR_SIGNALS = [
    'senior', 'lead', 'principal', 'architect', 'manager', 'director',
    '5+ years', '7+ years', '10+ years', 'head of', 'vp of',
]


# ── Skill extraction ───────────────────────────────────────────────
def extract_skills_from_text(text: str) -> List[str]:
    text_lower = text.lower()
    return list({skill for skill in COMMON_SKILLS if skill in text_lower})


# ── Experience level detection ─────────────────────────────────────
def detect_experience_level(text: str) -> str:
    """Detect fresher / mid / senior from job description."""
    text_lower = text.lower()
    if any(s in text_lower for s in INTERNSHIP_SIGNALS):
        return 'fresher'
    if any(s in text_lower for s in FRESHER_SIGNALS):
        return 'fresher'
    if any(s in text_lower for s in SENIOR_SIGNALS):
        return 'senior'
    return 'mid'


def is_fresher_friendly(text: str) -> bool:
    text_lower = text.lower()
    return any(s in text_lower for s in FRESHER_SIGNALS + INTERNSHIP_SIGNALS)


def is_internship_job(text: str, title: str) -> bool:
    combined = (text + ' ' + title).lower()
    return any(s in combined for s in INTERNSHIP_SIGNALS)


# ── Competition level estimation ────────────────────────────────────
def estimate_competition_level(source: str, posted_at=None, is_fresher: bool = False) -> str:
    """
    Estimate competition:
    - High: popular sources + fresher roles (many applicants)
    - Low: niche/old listings
    """
    high_sources = {'naukri', 'internshala', 'linkedin'}
    if source in high_sources or is_fresher:
        return 'high'
    if posted_at:
        try:
            if hasattr(posted_at, 'timestamp'):
                age_days = (datetime.now(timezone.utc) - posted_at).days
            else:
                age_days = 0
            if age_days > 7:
                return 'low'
        except Exception:
            pass
    return 'medium'


# ── Salary normalization (INR) ─────────────────────────────────────
def normalize_salary_inr(salary_min, salary_max, currency: str = 'INR') -> str:
    """
    Convert salary to human-friendly INR string.
    Handles: INR (assume annual), USD (convert), LPA strings.
    """
    if not salary_min and not salary_max:
        return ''

    # Currency conversion (rough)
    usd_to_inr = 83.5
    gbp_to_inr = 106.0

    def convert(val, curr):
        if curr == 'USD':
            return val * usd_to_inr
        if curr in ('GBP', 'GBP_HOUR'):
            return val * gbp_to_inr
        return val  # assume INR

    curr = (currency or 'INR').upper()
    mn = convert(float(salary_min), curr) if salary_min else None
    mx = convert(float(salary_max), curr) if salary_max else None

    def to_lpa(v):
        lpa = v / 100000
        if lpa >= 1:
            return f"₹{lpa:.1f}".rstrip('0').rstrip('.') + ' LPA'
        monthly = v / 12
        if monthly >= 1000:
            return f"₹{monthly/1000:.0f}k/mo"
        return f"₹{monthly:.0f}/mo"

    if mn and mx:
        lpa_mn = mn / 100000
        lpa_mx = mx / 100000
        if lpa_mx >= 1:
            return f"₹{lpa_mn:.0f}–{lpa_mx:.0f} LPA"
        return f"{to_lpa(mn)} – {to_lpa(mx)}"
    if mx:
        return f"Up to {to_lpa(mx)}"
    if mn:
        return f"From {to_lpa(mn)}"
    return ''


# ── Embedding helpers ──────────────────────────────────────────────
def simple_embedding(text: str) -> List[float]:
    text_lower = text.lower()
    return [1.0 if skill in text_lower else 0.0 for skill in COMMON_SKILLS]


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def get_embedding(text: str) -> List[float]:
    openai_key = os.environ.get('OPENAI_API_KEY', '')
    if openai_key and openai_key not in ('your_openai_key', ''):
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            response = client.embeddings.create(
                model='text-embedding-3-small',
                input=text[:8000]
            )
            return response.data[0].embedding
        except Exception:
            pass
    return simple_embedding(text)


# ── Location match scoring ─────────────────────────────────────────
def location_match_score(user_location: str, job_location: str) -> float:
    """Returns 0.0–1.0. 1.0 = exact city match or both remote."""
    if not user_location or not job_location:
        return 0.5  # neutral
    ul = user_location.lower()
    jl = job_location.lower()
    # Remote always matches
    if any(w in jl for w in ['remote', 'wfh', 'work from home']):
        return 1.0
    # Check city name overlap
    for city in INDIA_CITIES:
        if city in ul and city in jl:
            return 1.0
    # Partial match (state/region)
    ul_words = set(ul.split())
    jl_words = set(jl.split())
    overlap = ul_words & jl_words
    if overlap:
        return 0.7
    return 0.2  # different locations


# ── Recency scoring ────────────────────────────────────────────────
def recency_score(created_at) -> float:
    """1.0 = today, 0.0 = 30+ days old."""
    try:
        if created_at is None:
            return 0.5
        now = datetime.now(timezone.utc)
        if hasattr(created_at, 'tzinfo') and created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        age_days = max(0, (now - created_at).days)
        return max(0.0, 1.0 - age_days / 30.0)
    except Exception:
        return 0.5


# ── Core fit scoring (multi-factor) ───────────────────────────────
def calculate_fit_score(
    user_embedding: List[float],
    job_embedding: List[float],
    user_skills: List[str],
    job_skills: List[str],
    source_weight: float = 1.0,
    user_location: str = '',
    job_location: str = '',
    job_created_at=None,
    user_experience_years: int = 0,
    job_experience_level: str = 'mid',
) -> Dict:
    """
    Multi-factor job fit score.
    Final = semantic(50%) + source(15%) + location(15%) + recency(10%) + fresher_fit(10%)
    """
    # 1. Semantic similarity
    semantic = cosine_similarity(user_embedding, job_embedding)

    # 2. Source weight bonus (normalize to 0-1, max weight ~2.0)
    src_bonus = min(1.0, (source_weight - 1.0) / 1.0)

    # 3. Location
    loc = location_match_score(user_location, job_location)

    # 4. Recency
    rec = recency_score(job_created_at)

    # 5. Fresher fit bonus
    fresher_bonus = 0.0
    if user_experience_years <= 1 and job_experience_level == 'fresher':
        fresher_bonus = 1.0
    elif user_experience_years <= 1 and job_experience_level == 'mid':
        fresher_bonus = 0.3
    elif user_experience_years >= 3 and job_experience_level == 'senior':
        fresher_bonus = 0.7

    # Weighted composite
    raw = (
        semantic   * 0.50 +
        src_bonus  * 0.15 +
        loc        * 0.15 +
        rec        * 0.10 +
        fresher_bonus * 0.10
    )
    score = min(99, max(10, round(raw * 100)))

    # Skill gap
    user_lc = {s.lower() for s in user_skills}
    job_lc  = {s.lower() for s in job_skills}
    missing  = [s for s in job_lc if s not in user_lc]
    matched  = [s for s in job_lc if s in user_lc]

    # Grade
    if score >= 85:
        grade = "🔥 Excellent"
    elif score >= 70:
        grade = "✅ Good"
    elif score >= 50:
        grade = "🟡 Moderate"
    else:
        grade = "📉 Low"

    # "Why this fits" explanation
    why = _build_why(score, matched, missing, job_location, user_location,
                     source_weight, rec, user_experience_years, job_experience_level)

    return {
        'score': score,
        'grade': grade,
        'missing_skills': missing,
        'matched_skills': matched,
        'explanation': why,
        'factors': {
            'semantic': round(semantic * 100),
            'source_boost': round(src_bonus * 100),
            'location_match': round(loc * 100),
            'recency': round(rec * 100),
        },
    }


def _build_why(score, matched, missing, job_loc, user_loc,
               source_weight, recency, user_exp, job_exp_level) -> str:
    """Build a human-readable 'Why this fits' string."""
    parts = []
    if matched:
        top = ', '.join(matched[:3])
        parts.append(f"Matches your {top} skills")
    loc_lc = job_loc.lower()
    if any(w in loc_lc for w in ['remote', 'wfh', 'work from home']):
        parts.append("fully remote — works anywhere")
    elif user_loc and any(c in loc_lc for c in [user_loc.lower().split(',')[0]]):
        parts.append(f"in your city ({job_loc.split(',')[0].strip()})")
    if user_exp <= 1 and job_exp_level == 'fresher':
        parts.append("fresher-friendly role")
    if source_weight >= 1.5:
        parts.append("high-trust source")
    if recency >= 0.85:
        parts.append("posted very recently")
    if missing:
        parts.append(f"missing: {', '.join(missing[:2])}")
    return '. '.join(parts).capitalize() + '.' if parts else f"Score: {score}%"


# ── Cover letter ───────────────────────────────────────────────────
def generate_cover_letter(user_profile: Dict, job: Dict) -> str:
    openai_key = os.environ.get('OPENAI_API_KEY', '')
    if openai_key and openai_key not in ('your_openai_key', ''):
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            prompt = (
                f"Write a professional cover letter for:\n"
                f"Job: {job.get('title')} at {job.get('company')}\n"
                f"Applicant skills: {', '.join(user_profile.get('skills', []))}\n"
                f"Experience: {user_profile.get('experience_years', 0)} years\n"
                f"Keep it concise, professional, and under 300 words."
            )
            response = client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=500,
            )
            return response.choices[0].message.content
        except Exception:
            pass
    skills_str = ', '.join(user_profile.get('skills', [])[:3])
    return (
        f"Dear Hiring Manager,\n\n"
        f"I am excited to apply for the {job.get('title')} position at {job.get('company')}. "
        f"With my background in {skills_str}, I am confident I can contribute significantly.\n\n"
        f"Sincerely,\n[Your Name]"
    )


# ── Career Copilot ─────────────────────────────────────────────────
def copilot_chat(message: str, user_profile: Dict, recent_jobs: List[Dict]) -> str:
    openai_key = os.environ.get('OPENAI_API_KEY', '')
    job_titles = [j.get('title', '') for j in recent_jobs[:5]]
    user_city = user_profile.get('location', 'India')
    context = (
        f"User skills: {', '.join(user_profile.get('skills', []))}. "
        f"Experience: {user_profile.get('experience_years', 0)} years. "
        f"Location: {user_city}. "
        f"Recent jobs available: {', '.join(job_titles)}."
    )

    if openai_key and openai_key not in ('your_openai_key', ''):
        try:
            import openai
            client = openai.OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {'role': 'system', 'content': (
                        'You are HireMind AI Career Copilot, an expert career advisor '
                        'specializing in the Indian tech job market. Help users find jobs, '
                        'negotiate salaries in LPA, improve their skills, and advance their careers. '
                        f'Context: {context}'
                    )},
                    {'role': 'user', 'content': message},
                ],
                max_tokens=600,
            )
            return response.choices[0].message.content
        except Exception:
            pass

    # ── Smart fallback responses (India-context) ──
    msg = message.lower()
    if any(w in msg for w in ['bangalore', 'bengaluru', 'blr']):
        return "Bangalore has 3,200+ active tech openings right now! Top hiring companies: Infosys, Wipro, Flipkart, Swiggy, Ola. Python, React, and DevOps roles are hottest. 🏙️"
    if any(w in msg for w in ['fresher', 'fresher jobs', 'no experience', 'graduate']):
        return "Great news for freshers! Check the 'Fresher' filter in your dashboard. Top fresher-friendly companies: TCS, Infosys, Wipro, Cognizant, HCL. Focus on: Python basics, Data Structures, and one cloud platform. 🎓"
    if any(w in msg for w in ['internship', 'intern']):
        return "Internshala has 500+ active internships! Filter 'Internships' in your dashboard. Stipends range ₹10k–₹40k/month. Top categories: Web Dev, Data Science, Marketing. Apply to 5–10 early! 💼"
    if any(w in msg for w in ['salary', 'lpa', 'package', 'ctc']):
        return "Indian tech salaries: Fresher (0–2 yr): ₹3–8 LPA. Mid-level (3–5 yr): ₹8–20 LPA. Senior (5+ yr): ₹20–45 LPA. Product companies (Google, Amazon, Flipkart) pay 2–3x more than service firms. 💰"
    if any(w in msg for w in ['remote', 'wfh', 'work from home']):
        return "Remote roles make up 40%+ of listings on HireMind. Best remote-friendly stacks: Python backend, React frontend, DevOps/Cloud. Toggle 'Remote' in your dashboard filters. 🏠"
    if any(w in msg for w in ['skill', 'learn', 'upskill', 'course']):
        return "Top in-demand skills for 2025 India market: Python (+22%), TypeScript (+18%), Docker (+15%), AWS (+12%), LLM/AI Engineering (+55%). Start with free tiers on AWS/GCP. 📚"
    if any(w in msg for w in ['naukri', 'internshala', 'foundit', 'linkedin']):
        return "HireMind aggregates jobs from Naukri, Internshala, Foundit, TimesJobs and more — all in one place with AI match scores. No need to check each site manually! 🤖"
    return (
        "I'm your HireMind Career Copilot! I can help you:\n"
        "• Find fresher / remote / city-specific jobs\n"
        "• Understand salary expectations in LPA\n"
        "• Identify skills to upskill\n"
        "• Prepare for interviews\n\n"
        "Try: 'Show me fresher Python jobs in Bangalore' 🚀"
    )
