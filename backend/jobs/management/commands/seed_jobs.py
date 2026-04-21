from django.core.management.base import BaseCommand
from jobs.models import Job
from ai_engine.services import (
    normalize_salary_inr, detect_experience_level,
    is_fresher_friendly, is_internship_job, estimate_competition_level,
    extract_skills_from_text,
)

SOURCE_WEIGHTS = {
    'naukri': 1.8, 'internshala': 1.7, 'foundit': 1.6, 'timesjobs': 1.5,
    'adzuna': 1.2, 'jooble': 1.1, 'rss': 1.0, 'manual': 1.0,
}

SAMPLE_JOBS = [
    # ── Global / existing ────────────────────────────────────────
    {
        "title": "Senior Python Engineer", "company": "TechCorp AI",
        "location": "Remote", "salary_min": 150000, "salary_max": 200000, "salary_currency": "USD",
        "job_type": "full-time", "remote": True,
        "description": "Build scalable Python microservices. Work with Django, FastAPI, PostgreSQL, Redis, Docker, Kubernetes. Design AI-powered REST APIs. 5+ years experience required.",
        "apply_url": "https://example.com/apply/1", "source": "adzuna", "source_id": "seed-001",
    },
    {
        "title": "Full Stack Developer (React + Node.js)", "company": "StartupXYZ",
        "location": "New York, NY", "salary_min": 110000, "salary_max": 150000, "salary_currency": "USD",
        "job_type": "full-time", "remote": False,
        "description": "Join a fast-growing startup. Build React frontends and robust Node.js backends. TypeScript, GraphQL, PostgreSQL required. 2+ years experience.",
        "apply_url": "https://example.com/apply/2", "source": "adzuna", "source_id": "seed-002",
    },
    {
        "title": "Machine Learning Engineer", "company": "DeepMind Labs",
        "location": "Remote", "salary_min": 160000, "salary_max": 220000, "salary_currency": "USD",
        "job_type": "full-time", "remote": True,
        "description": "Design and train ML models. Work with PyTorch, TensorFlow, scikit-learn. Deploy models via REST APIs. Strong Python and math background required. 3+ years.",
        "apply_url": "https://example.com/apply/3", "source": "adzuna", "source_id": "seed-003",
    },
    # ── Indian ecosystem — Bangalore ─────────────────────────────
    {
        "title": "Python Developer", "company": "Infosys",
        "location": "Bangalore", "salary_min": 600000, "salary_max": 1200000, "salary_currency": "INR",
        "job_type": "full-time", "remote": False,
        "description": "We are hiring Python developers for our digital practice. Work with Django REST framework, PostgreSQL, Docker, and AWS. 2–4 years experience preferred. Freshers with strong Python may apply.",
        "apply_url": "https://infosys.com/careers", "source": "naukri", "source_id": "seed-in-001",
    },
    {
        "title": "React.js Frontend Developer", "company": "Flipkart",
        "location": "Bangalore", "salary_min": 800000, "salary_max": 1800000, "salary_currency": "INR",
        "job_type": "full-time", "remote": True,
        "description": "Join India's leading e-commerce platform. Build next-gen shopping experience with React, TypeScript, Next.js. Experience with performance optimization and mobile-first design. 2–5 years.",
        "apply_url": "https://flipkart.com/careers", "source": "naukri", "source_id": "seed-in-002",
    },
    {
        "title": "Data Scientist — NLP/ML", "company": "Swiggy",
        "location": "Bangalore", "salary_min": 1200000, "salary_max": 2200000, "salary_currency": "INR",
        "job_type": "full-time", "remote": False,
        "description": "Build recommendation systems and NLP pipelines for food delivery. Python, PyTorch, scikit-learn, Spark required. Work on real-time ML systems serving millions. 3+ years.",
        "apply_url": "https://swiggy.com/careers", "source": "foundit", "source_id": "seed-in-003",
    },
    # ── Indian ecosystem — Hyderabad ─────────────────────────────
    {
        "title": "Java Backend Developer", "company": "Wipro",
        "location": "Hyderabad", "salary_min": 500000, "salary_max": 1000000, "salary_currency": "INR",
        "job_type": "full-time", "remote": False,
        "description": "Develop enterprise Java applications using Spring Boot, Hibernate, MySQL. Microservices architecture experience preferred. REST API design and Docker knowledge required. 2–6 years experience.",
        "apply_url": "https://wipro.com/careers", "source": "timesjobs", "source_id": "seed-in-004",
    },
    {
        "title": "DevOps Engineer — AWS/GCP", "company": "Amazon India",
        "location": "Hyderabad", "salary_min": 1500000, "salary_max": 2800000, "salary_currency": "INR",
        "job_type": "full-time", "remote": False,
        "description": "Manage cloud infrastructure on AWS. CI/CD pipelines, Kubernetes, Terraform, Linux. Strong scripting with Python or Bash. Work with world-class teams. 4+ years. Senior role.",
        "apply_url": "https://amazon.jobs", "source": "naukri", "source_id": "seed-in-005",
    },
    # ── Fresher-friendly ─────────────────────────────────────────
    {
        "title": "Junior Python Developer (Fresher)", "company": "TCS",
        "location": "Chennai", "salary_min": 350000, "salary_max": 550000, "salary_currency": "INR",
        "job_type": "full-time", "remote": False,
        "description": "Great opportunity for fresh graduates. Learn Django, REST APIs, PostgreSQL. Structured training and mentorship provided. Python basics and eagerness to learn required. Fresher / 0–1 year experience.",
        "apply_url": "https://tcs.com/careers", "source": "naukri", "source_id": "seed-in-006",
    },
    {
        "title": "Frontend Dev Intern (React/Next.js)", "company": "Razorpay",
        "location": "Bangalore", "salary_min": 25000, "salary_max": 40000, "salary_currency": "INR",
        "job_type": "internship", "remote": True,
        "description": "6-month internship at India's leading fintech. Build React and Next.js components. Stipend ₹25k–₹40k/month. Pre-placement offer for top performers. Freshers and final year students encouraged. Internship.",
        "apply_url": "https://razorpay.com/careers", "source": "internshala", "source_id": "seed-in-007",
    },
    {
        "title": "Data Science Intern", "company": "Ola",
        "location": "Bangalore", "salary_min": 20000, "salary_max": 35000, "salary_currency": "INR",
        "job_type": "internship", "remote": False,
        "description": "3-month data science internship. Work on real-world datasets with Python, pandas, scikit-learn. Stipend ₹20k–₹35k/month. Learn from experienced data scientists. Internship for college students / freshers.",
        "apply_url": "https://ola.com/careers", "source": "internshala", "source_id": "seed-in-008",
    },
    # ── Remote India ─────────────────────────────────────────────
    {
        "title": "Full Stack Developer (Remote India)", "company": "Remote-First Startup",
        "location": "Remote", "salary_min": 900000, "salary_max": 1600000, "salary_currency": "INR",
        "job_type": "full-time", "remote": True,
        "description": "Work from home full stack developer. React, Node.js, PostgreSQL, Docker. 2–4 years experience. Work with international clients. Great work-life balance. Remote work from home India.",
        "apply_url": "https://example.com/apply/remote-1", "source": "foundit", "source_id": "seed-in-009",
    },
    {
        "title": "DevOps / Cloud Engineer (Remote)", "company": "CloudBase Inc",
        "location": "Remote", "salary_min": 1300000, "salary_max": 1700000, "salary_currency": "INR",
        "job_type": "full-time", "remote": True,
        "description": "Own CI/CD pipelines, cloud infrastructure on AWS. Terraform, Docker, Kubernetes, Linux. Work from home. 4+ years. Senior DevOps role for experienced engineers.",
        "apply_url": "https://example.com/apply/5", "source": "adzuna", "source_id": "seed-005",
    },
]


class Command(BaseCommand):
    help = 'Seed database with sample jobs (global + India ecosystem)'

    def handle(self, *args, **options):
        count = 0
        for data in SAMPLE_JOBS:
            desc  = data['description']
            title = data['title']
            source = data['source']
            sw = SOURCE_WEIGHTS.get(source, 1.0)

            sal_inr = normalize_salary_inr(
                data.get('salary_min'), data.get('salary_max'), data.get('salary_currency', 'INR')
            )
            exp_lv  = detect_experience_level(desc + ' ' + title)
            fresher = is_fresher_friendly(desc + ' ' + title)
            intern  = is_internship_job(desc, title)
            comp    = estimate_competition_level(source, None, fresher)
            skills  = extract_skills_from_text(desc + ' ' + title)

            _, created = Job.objects.get_or_create(
                source=source,
                source_id=data['source_id'],
                defaults={
                    **data,
                    'normalized_salary_inr': sal_inr,
                    'source_weight': sw,
                    'experience_level': exp_lv,
                    'is_fresher_friendly': fresher,
                    'is_internship': intern,
                    'competition_level': comp,
                    'skills_required': skills,
                    'is_verified': (sw >= 1.5),
                }
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {count} new sample jobs ({len(SAMPLE_JOBS)} total in seed set).'
        ))
