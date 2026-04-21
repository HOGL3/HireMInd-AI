"""
Job Aggregator v2: Adzuna, Jooble + Indian sources via RSS.
Indian platforms prioritized with higher source_weight.
"""
import os
import logging
import xml.etree.ElementTree as ET
from typing import List, Dict
import requests

logger = logging.getLogger(__name__)

# Source weights imported from model (duplicated here to avoid circular imports)
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

# ── Indian RSS feeds (publicly available) ─────────────────────────
INDIAN_RSS_FEEDS = {
    'naukri': [
        'https://www.naukri.com/rss/jobs-by-skill/python.rss',
        'https://www.naukri.com/rss/jobs-by-skill/react.rss',
    ],
    'timesjobs': [
        'https://www.timesjobs.com/candidate/get-rss-feed.html?searchType=personalizedSearch&from=submit&txtKeywords=software+engineer&txtLocation=bangalore',
    ],
}


def _parse_rss(feed_url: str, source: str) -> List[Dict]:
    """Generic RSS parser for job feeds."""
    try:
        resp = requests.get(feed_url, timeout=10, headers={'User-Agent': 'HireMindBot/2.0'})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
        jobs = []
        for item in root.findall('.//item'):
            title = item.findtext('title', '').strip()
            link  = item.findtext('link', '').strip()
            desc  = item.findtext('description', '').strip()
            # Remove HTML tags from description
            desc = _strip_html(desc)
            pub   = item.findtext('pubDate', '')
            if not title or not link:
                continue
            jobs.append({
                'title': title,
                'company': _extract_company(title, desc),
                'location': _extract_location(title + ' ' + desc),
                'description': desc,
                'salary_min': None,
                'salary_max': None,
                'salary_currency': 'INR',
                'apply_url': link,
                'source': source,
                'source_id': link,
                'posted_at': pub or None,
            })
        return jobs[:25]
    except Exception as e:
        logger.warning(f'RSS parse error [{source}] {feed_url}: {e}')
        return []


def _strip_html(text: str) -> str:
    import re
    return re.sub(r'<[^>]+>', '', text).strip()


def _extract_company(title: str, desc: str) -> str:
    """Try to extract company name from title patterns like 'Role at Company'."""
    import re
    m = re.search(r'\bat\s+([A-Z][A-Za-z\s&\.]+?)(?:\s*[-|,\n]|$)', title)
    if m:
        return m.group(1).strip()[:100]
    return 'Via ' + desc[:20].strip() or 'Unknown'


def _extract_location(text: str) -> str:
    """Extract Indian city from text."""
    cities = ['Bangalore', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai',
              'Pune', 'Kolkata', 'Noida', 'Gurgaon', 'Gurugram', 'Ahmedabad']
    text_lower = text.lower()
    for city in cities:
        if city.lower() in text_lower:
            return city
    if any(w in text_lower for w in ['remote', 'work from home', 'wfh']):
        return 'Remote'
    return 'India'


# ── Adzuna ─────────────────────────────────────────────────────────
def fetch_from_adzuna(query: str = 'software engineer', country: str = 'in', count: int = 20) -> List[Dict]:
    app_id  = os.environ.get('ADZUNA_APP_ID', '')
    app_key = os.environ.get('ADZUNA_APP_KEY', '')
    if not app_id or app_id == 'your_adzuna_id':
        return []
    try:
        url = f'https://api.adzuna.com/v1/api/jobs/{country}/search/1'
        params = {
            'app_id': app_id,
            'app_key': app_key,
            'results_per_page': count,
            'what': query,
            'content-type': 'application/json',
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        jobs = []
        for r in data.get('results', []):
            jobs.append({
                'title': r.get('title', ''),
                'company': r.get('company', {}).get('display_name', 'Unknown'),
                'location': r.get('location', {}).get('display_name', ''),
                'description': r.get('description', ''),
                'salary_min': r.get('salary_min'),
                'salary_max': r.get('salary_max'),
                'salary_currency': 'INR',
                'apply_url': r.get('redirect_url', ''),
                'source': 'adzuna',
                'source_id': r.get('id', ''),
                'posted_at': r.get('created'),
            })
        return jobs
    except Exception as e:
        logger.error(f'Adzuna fetch error: {e}')
        return []


# ── Jooble ─────────────────────────────────────────────────────────
def fetch_from_jooble(keywords: str = 'python developer', location: str = 'India') -> List[Dict]:
    api_key = os.environ.get('JOOBLE_API_KEY', '')
    if not api_key or api_key == 'your_jooble_key':
        return []
    try:
        url = f'https://jooble.org/api/{api_key}'
        payload = {'keywords': keywords, 'location': location}
        resp = requests.post(url, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        jobs = []
        for r in data.get('jobs', []):
            jobs.append({
                'title': r.get('title', ''),
                'company': r.get('company', 'Unknown'),
                'location': r.get('location', 'India'),
                'description': r.get('snippet', ''),
                'salary_min': None,
                'salary_max': None,
                'salary_currency': 'INR',
                'apply_url': r.get('link', ''),
                'source': 'jooble',
                'source_id': r.get('id', ''),
                'posted_at': r.get('updated'),
            })
        return jobs
    except Exception as e:
        logger.error(f'Jooble fetch error: {e}')
        return []


# ── Indian RSS fetchers ────────────────────────────────────────────
def fetch_from_naukri_rss() -> List[Dict]:
    jobs = []
    for url in INDIAN_RSS_FEEDS.get('naukri', []):
        jobs.extend(_parse_rss(url, 'naukri'))
    return jobs


def fetch_from_timesjobs_rss() -> List[Dict]:
    jobs = []
    for url in INDIAN_RSS_FEEDS.get('timesjobs', []):
        jobs.extend(_parse_rss(url, 'timesjobs'))
    return jobs


# ── Save to DB ─────────────────────────────────────────────────────
def save_jobs(job_data_list: List[Dict]) -> int:
    from jobs.models import Job
    from ai_engine.services import (
        get_embedding, extract_skills_from_text,
        normalize_salary_inr, detect_experience_level,
        is_fresher_friendly, is_internship_job, estimate_competition_level,
    )
    created = 0
    for data in job_data_list:
        source_id = str(data.get('source_id', ''))
        source    = data.get('source', 'manual')
        title     = data.get('title', '').strip()

        if not source_id or not title:
            continue
        if Job.objects.filter(source=source, source_id=source_id).exists():
            continue

        desc  = data.get('description', '')
        skills = extract_skills_from_text(desc + ' ' + title)
        emb    = get_embedding((desc + ' ' + title)[:2000]) if desc or title else []

        sal_inr = normalize_salary_inr(
            data.get('salary_min'),
            data.get('salary_max'),
            data.get('salary_currency', 'INR'),
        )
        exp_level   = detect_experience_level(desc + ' ' + title)
        fresher     = is_fresher_friendly(desc + ' ' + title)
        internship  = is_internship_job(desc, title)
        competition = estimate_competition_level(source, None, fresher)
        sw          = SOURCE_WEIGHTS.get(source, 1.0)

        remote = any(w in (desc + title).lower() for w in ['remote', 'wfh', 'work from home'])

        try:
            Job.objects.create(
                title=title[:255],
                company=data.get('company', 'Unknown')[:255],
                location=data.get('location', 'India')[:255],
                description=desc,
                salary_min=data.get('salary_min'),
                salary_max=data.get('salary_max'),
                salary_currency=data.get('salary_currency', 'INR'),
                normalized_salary_inr=sal_inr,
                job_type=data.get('job_type', 'full-time')[:50],
                remote=remote,
                apply_url=data.get('apply_url', '')[:1000],
                source=source,
                source_id=source_id[:255],
                source_weight=sw,
                skills_required=skills,
                embedding=emb,
                experience_level=exp_level,
                is_fresher_friendly=fresher,
                is_internship=internship,
                competition_level=competition,
                is_verified=(sw >= 1.5),
            )
            created += 1
        except Exception as e:
            logger.error(f'Error saving job "{title}": {e}')

    return created


# ── Master aggregation ─────────────────────────────────────────────
def run_aggregation() -> Dict:
    total = 0
    sources: Dict[str, int] = {}

    for fetch_fn, label in [
        (fetch_from_adzuna, 'adzuna'),
        (fetch_from_jooble, 'jooble'),
        (fetch_from_naukri_rss, 'naukri'),
        (fetch_from_timesjobs_rss, 'timesjobs'),
    ]:
        try:
            jobs = fetch_fn()
            if jobs:
                n = save_jobs(jobs)
                sources[label] = n
                total += n
        except Exception as e:
            logger.error(f'Aggregation error [{label}]: {e}')

    return {'total_new_jobs': total, 'by_source': sources}
