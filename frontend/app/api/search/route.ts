import { NextResponse } from 'next/server';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  normalized_salary_inr: string | null;
  job_type: string;
  remote: boolean;
  skills_required: string[];
  apply_link: string;
  source: string;
  india_relevant: boolean;
}

// ─── Indian cities & keywords for relevance scoring ──────────────────────────
const INDIA_CITIES = [
  'bangalore', 'bengaluru', 'hyderabad', 'pune', 'mumbai', 'delhi', 'noida',
  'gurgaon', 'gurugram', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'kochi',
  'thiruvananthapuram', 'coimbatore', 'nagpur', 'indore', 'bhubaneswar',
  'chandigarh', 'lucknow', 'remote india', 'india',
];

function isIndiaRelevant(location: string): boolean {
  const loc = location.toLowerCase();
  return INDIA_CITIES.some(city => loc.includes(city));
}

// ─── Data validation — filter out fake/suspicious listings ───────────────────
function isValidJob(job: NormalizedJob): boolean {
  // Must have a real title (not empty or too short)
  if (!job.title || job.title.trim().length < 3) return false;
  // Must have a real company name
  if (!job.company || job.company.trim().length < 2) return false;
  if (['unknown company', 'n/a', 'confidential', ''].includes(job.company.toLowerCase())) return false;
  // Must have an apply link
  if (!job.apply_link || !job.apply_link.startsWith('http')) return false;
  // Salary sanity check: if provided, INR min can't be unrealistically low or high
  if (job.salary_min !== null && job.salary_currency === 'INR') {
    if (job.salary_min < 60000) return false;           // < ₹60k/yr is suspicious
    if (job.salary_min > 100_000_000) return false;     // > ₹10 Cr is suspicious
  }
  return true;
}

// ─── Cached Indian fallback jobs — always India-relevant ─────────────────────
function getIndiaFallbackJobs(query: string): NormalizedJob[] {
  const q = query || 'Software Engineer';
  return [
    {
      id: 'fb-in-1', title: `Senior ${q} – React & Node.js`,
      company: 'Razorpay', location: 'Bangalore, India',
      salary_min: 2500000, salary_max: 4000000, salary_currency: 'INR',
      normalized_salary_inr: '₹25 – 40 LPA',
      job_type: 'full-time', remote: false,
      skills_required: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      apply_link: 'https://razorpay.com/jobs', source: 'hiremind-india-cache',
      india_relevant: true,
    },
    {
      id: 'fb-in-2', title: `${q} – Python / ML`,
      company: 'Swiggy', location: 'Bangalore, India',
      salary_min: 2000000, salary_max: 3500000, salary_currency: 'INR',
      normalized_salary_inr: '₹20 – 35 LPA',
      job_type: 'full-time', remote: false,
      skills_required: ['Python', 'PyTorch', 'Spark', 'AWS'],
      apply_link: 'https://bytes.swiggy.com/careers', source: 'hiremind-india-cache',
      india_relevant: true,
    },
    {
      id: 'fb-in-3', title: `${q} Intern – Summer 2025`,
      company: 'Internshala', location: 'Remote, India',
      salary_min: 360000, salary_max: 500000, salary_currency: 'INR',
      normalized_salary_inr: '₹30k – 42k/mo',
      job_type: 'internship', remote: true,
      skills_required: ['JavaScript', 'React', 'CSS'],
      apply_link: 'https://internshala.com/jobs', source: 'hiremind-india-cache',
      india_relevant: true,
    },
    {
      id: 'fb-in-4', title: `Backend ${q} – Go / Microservices`,
      company: 'Zepto', location: 'Mumbai, India',
      salary_min: 2200000, salary_max: 3800000, salary_currency: 'INR',
      normalized_salary_inr: '₹22 – 38 LPA',
      job_type: 'full-time', remote: false,
      skills_required: ['Go', 'Kubernetes', 'gRPC', 'Redis'],
      apply_link: 'https://www.zeptonow.com/careers', source: 'hiremind-india-cache',
      india_relevant: true,
    },
    {
      id: 'fb-in-5', title: `Full Stack ${q} – MERN`,
      company: 'Paytm', location: 'Noida, India',
      salary_min: 1500000, salary_max: 2500000, salary_currency: 'INR',
      normalized_salary_inr: '₹15 – 25 LPA',
      job_type: 'full-time', remote: false,
      skills_required: ['MongoDB', 'Express', 'React', 'Node.js'],
      apply_link: 'https://paytm.com/careers', source: 'hiremind-india-cache',
      india_relevant: true,
    },
    {
      id: 'fb-in-6', title: `DevOps / SRE – ${q}`,
      company: 'Ola', location: 'Bangalore, India',
      salary_min: 1800000, salary_max: 3000000, salary_currency: 'INR',
      normalized_salary_inr: '₹18 – 30 LPA',
      job_type: 'full-time', remote: false,
      skills_required: ['Terraform', 'AWS', 'Kubernetes', 'Linux'],
      apply_link: 'https://www.olacabs.com/careers', source: 'hiremind-india-cache',
      india_relevant: true,
    },
  ];
}

// ─── Source 1: Adzuna (India endpoint) ───────────────────────────────────────
async function fetchAdzuna(query: string, location: string, remote: boolean): Promise<NormalizedJob[]> {
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;
  if (!APP_ID || !APP_KEY) return [];

  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location || 'India')}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || []).map((j: any): NormalizedJob => ({
    id: `adzuna-${j.id}`,
    title: j.title || '',
    company: j.company?.display_name || '',
    location: j.location?.display_name || location || 'India',
    salary_min: j.salary_min || null,
    salary_max: j.salary_max || null,
    salary_currency: 'INR',
    normalized_salary_inr: j.salary_min ? `₹${(j.salary_min / 100000).toFixed(1)} LPA` : null,
    job_type: j.contract_type || 'full-time',
    remote,
    skills_required: extractSkills(j.description || ''),
    apply_link: j.redirect_url || '',
    source: 'adzuna',
    india_relevant: true, // Adzuna /in/ endpoint is always India
  }));
}

// ─── Source 2: Remotive (Remote Jobs) ────────────────────────────────────────
async function fetchRemotive(query: string): Promise<NormalizedJob[]> {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=15`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.jobs || []).map((j: any): NormalizedJob => {
    const loc = j.candidate_required_location || 'Worldwide (Remote)';
    return {
      id: `remotive-${j.id}`,
      title: j.title || '',
      company: j.company_name || '',
      location: loc,
      salary_min: null, salary_max: null,
      salary_currency: 'USD',
      normalized_salary_inr: j.salary || null,
      job_type: j.job_type || 'full-time',
      remote: true,
      skills_required: (j.tags || []).slice(0, 6),
      apply_link: j.url || '',
      source: 'remotive',
      india_relevant: isIndiaRelevant(loc) || loc.toLowerCase().includes('worldwide') || loc === '',
    };
  });
}

// ─── Source 3: Arbeitnow ─────────────────────────────────────────────────────
async function fetchArbeitnow(query: string, remote: boolean): Promise<NormalizedJob[]> {
  const params = new URLSearchParams({ search: query });
  if (remote) params.set('remote', 'true');
  const url = `https://www.arbeitnow.com/api/job-board-api?${params}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.data || []).slice(0, 15).map((j: any): NormalizedJob => {
    const loc = j.location || (j.remote ? 'Remote' : 'Europe');
    return {
      id: `arbeitnow-${j.slug}`,
      title: j.title || '',
      company: j.company_name || '',
      location: loc,
      salary_min: null, salary_max: null,
      salary_currency: 'EUR',
      normalized_salary_inr: null,
      job_type: j.job_types?.[0]?.toLowerCase() || 'full-time',
      remote: j.remote || false,
      skills_required: (j.tags || []).slice(0, 6),
      apply_link: j.url || '',
      source: 'arbeitnow',
      india_relevant: isIndiaRelevant(loc),
    };
  });
}

// ─── Source 4: The Muse ───────────────────────────────────────────────────────
async function fetchTheMuse(query: string): Promise<NormalizedJob[]> {
  const url = `https://www.themuse.com/api/public/jobs?descending=true&page=1&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || []).slice(0, 10).map((j: any): NormalizedJob => {
    const loc = j.locations?.[0]?.name || 'USA / Remote';
    return {
      id: `muse-${j.id}`,
      title: j.name || '',
      company: j.company?.name || '',
      location: loc,
      salary_min: null, salary_max: null,
      salary_currency: 'USD',
      normalized_salary_inr: null,
      job_type: j.type?.toLowerCase() || 'full-time',
      remote: (j.locations || []).some((l: any) => l.name?.toLowerCase().includes('remote')),
      skills_required: (j.categories || []).map((c: any) => c.name).slice(0, 5),
      apply_link: j.refs?.landing_page || '',
      source: 'the-muse',
      india_relevant: isIndiaRelevant(loc),
    };
  });
}

// ─── Source 5: RemoteOK ───────────────────────────────────────────────────────
async function fetchRemoteOK(query: string): Promise<NormalizedJob[]> {
  const tag = query.split(' ')[0].toLowerCase();
  const url = `https://remoteok.com/api?tag=${encodeURIComponent(tag)}`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
    headers: { 'User-Agent': 'HireMindAI/1.0' },
  });
  if (!res.ok) return [];

  const raw = await res.json();
  const jobs = Array.isArray(raw) ? raw.slice(1, 12) : [];
  return jobs.map((j: any): NormalizedJob => ({
    id: `remoteok-${j.id}`,
    title: j.position || '',
    company: j.company || '',
    location: 'Remote (Worldwide)',
    salary_min: j.salary_min ? Number(j.salary_min) : null,
    salary_max: j.salary_max ? Number(j.salary_max) : null,
    salary_currency: 'USD',
    normalized_salary_inr: j.salary_min ? `$${j.salary_min}–$${j.salary_max}/yr` : null,
    job_type: 'full-time',
    remote: true,
    skills_required: (j.tags || []).slice(0, 6),
    apply_link: j.url || `https://remoteok.com/remote-jobs/${j.slug}`,
    source: 'remoteok',
    india_relevant: true, // Remote worldwide jobs accessible from India
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractSkills(description: string): string[] {
  const knownSkills = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
    'Node.js', 'Django', 'FastAPI', 'Go', 'Rust', 'Java', 'Kotlin', 'Swift',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'PostgreSQL',
    'MongoDB', 'Redis', 'GraphQL', 'REST', 'PyTorch', 'TensorFlow', 'SQL',
    'Tailwind', 'CSS', 'HTML', 'Git', 'Linux', 'Figma', 'Flutter', 'C++',
  ];
  const desc = description.toLowerCase();
  return knownSkills.filter(s => desc.includes(s.toLowerCase())).slice(0, 6);
}

function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// India-first sort: india_relevant jobs first, then by source priority
function sortByIndiaRelevance(jobs: NormalizedJob[]): NormalizedJob[] {
  const sourcePriority: Record<string, number> = {
    adzuna: 0, 'hiremind-india-cache': 1, remotive: 2,
    remoteok: 3, 'arbeitnow': 4, 'the-muse': 5,
  };
  return [...jobs].sort((a, b) => {
    if (a.india_relevant && !b.india_relevant) return -1;
    if (!a.india_relevant && b.india_relevant) return 1;
    return (sourcePriority[a.source] ?? 9) - (sourcePriority[b.source] ?? 9);
  });
}

// ─── Main Route Handler ───────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query    = searchParams.get('q') || 'software engineer';
  const location = searchParams.get('location') || 'India';
  const remote   = searchParams.get('remote') === 'true';

  try {
    const [adzunaRes, remotiveRes, arbeitnowRes, theMuseRes, remoteOKRes] =
      await Promise.allSettled([
        fetchAdzuna(query, location, remote),
        fetchRemotive(query),
        fetchArbeitnow(query, remote),
        fetchTheMuse(query),
        remote ? fetchRemoteOK(query) : Promise.resolve([]),
      ]);

    const allJobs: NormalizedJob[] = [
      ...(adzunaRes.status    === 'fulfilled' ? adzunaRes.value    : []),
      ...(remotiveRes.status  === 'fulfilled' ? remotiveRes.value  : []),
      ...(arbeitnowRes.status === 'fulfilled' ? arbeitnowRes.value : []),
      ...(theMuseRes.status   === 'fulfilled' ? theMuseRes.value   : []),
      ...(remoteOKRes.status  === 'fulfilled' ? remoteOKRes.value  : []),
    ];

    // Validate → deduplicate → sort India-first
    const validJobs     = allJobs.filter(isValidJob);
    const deduplicated  = deduplicateJobs(validJobs);
    const sorted        = sortByIndiaRelevance(deduplicated);

    if (sorted.length === 0) {
      return NextResponse.json(getIndiaFallbackJobs(query), {
        headers: { 'X-Jobs-Source': 'fallback-india' },
      });
    }

    return NextResponse.json(sorted, {
      headers: {
        'X-Jobs-Source': 'live',
        'X-Jobs-Count': String(sorted.length),
        'X-India-Jobs': String(sorted.filter(j => j.india_relevant).length),
      },
    });
  } catch (error) {
    console.error('[search/route] Unexpected error:', error);
    return NextResponse.json(getIndiaFallbackJobs(query), {
      headers: { 'X-Jobs-Source': 'fallback-india' },
    });
  }
}
