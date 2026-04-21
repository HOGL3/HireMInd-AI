import { NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────
interface NormalizedJob {
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
}

// ─── Fallback Mock Data (always shows something) ──────────────────────────────
function getMockJobs(query: string, location: string, remote: boolean): NormalizedJob[] {
  const q = query || 'Software Engineer';
  return [
    {
      id: 'mock-1',
      title: `${q} - React / Next.js`,
      company: 'TechNova India',
      location: location || 'Bangalore, India',
      salary_min: 1500000, salary_max: 2500000,
      salary_currency: 'INR',
      normalized_salary_inr: '₹15 – 25 LPA',
      job_type: 'full-time', remote,
      skills_required: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      apply_link: 'https://remoteok.com',
      source: 'hiremind-fallback',
    },
    {
      id: 'mock-2',
      title: `Senior ${q} - Python / ML`,
      company: 'Innovate AI Labs',
      location: remote ? 'Remote' : (location || 'Hyderabad, India'),
      salary_min: 2000000, salary_max: 3500000,
      salary_currency: 'INR',
      normalized_salary_inr: '₹20 – 35 LPA',
      job_type: 'full-time', remote: true,
      skills_required: ['Python', 'PyTorch', 'Docker', 'AWS'],
      apply_link: 'https://remoteok.com',
      source: 'hiremind-fallback',
    },
    {
      id: 'mock-3',
      title: `${q} Intern`,
      company: 'StartupXcel',
      location: 'Mumbai, India',
      salary_min: 360000, salary_max: null,
      salary_currency: 'INR',
      normalized_salary_inr: '₹30k/mo',
      job_type: 'internship', remote: false,
      skills_required: ['Figma', 'Product Management'],
      apply_link: 'https://internshala.com',
      source: 'hiremind-fallback',
    },
    {
      id: 'mock-4',
      title: `Full Stack ${q}`,
      company: 'GlobalSoft Solutions',
      location: location || 'Pune, India',
      salary_min: 1200000, salary_max: 1800000,
      salary_currency: 'INR',
      normalized_salary_inr: '₹12 – 18 LPA',
      job_type: 'full-time', remote,
      skills_required: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
      apply_link: 'https://weworkremotely.com',
      source: 'hiremind-fallback',
    },
    {
      id: 'mock-5',
      title: `DevOps / ${q} Engineer`,
      company: 'CloudScale Inc.',
      location: 'Remote, India',
      salary_min: 1800000, salary_max: 2800000,
      salary_currency: 'INR',
      normalized_salary_inr: '₹18 – 28 LPA',
      job_type: 'contract', remote: true,
      skills_required: ['Kubernetes', 'Terraform', 'Go', 'GCP'],
      apply_link: 'https://remotive.com',
      source: 'hiremind-fallback',
    },
    {
      id: 'mock-6',
      title: `Junior ${q} Developer`,
      company: 'CodeFactory',
      location: location || 'Chennai, India',
      salary_min: 600000, salary_max: 900000,
      salary_currency: 'INR',
      normalized_salary_inr: '₹6 – 9 LPA',
      job_type: 'full-time', remote: false,
      skills_required: ['JavaScript', 'Vue.js', 'PHP'],
      apply_link: 'https://indeed.com',
      source: 'hiremind-fallback',
    },
  ];
}

// ─── Source 1: Adzuna API (Free 250 req/mo) ──────────────────────────────────
async function fetchAdzuna(query: string, location: string, remote: boolean): Promise<NormalizedJob[]> {
  const APP_ID = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;
  if (!APP_ID || !APP_KEY) return [];

  const country = 'in'; // India
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || []).map((j: any): NormalizedJob => ({
    id: `adzuna-${j.id}`,
    title: j.title || 'Software Engineer',
    company: j.company?.display_name || 'Unknown Company',
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
  }));
}

// ─── Source 2: Remotive (100% Free, Remote Jobs) ─────────────────────────────
async function fetchRemotive(query: string): Promise<NormalizedJob[]> {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=15`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.jobs || []).map((j: any): NormalizedJob => ({
    id: `remotive-${j.id}`,
    title: j.title || 'Remote Role',
    company: j.company_name || 'Remote Company',
    location: j.candidate_required_location || 'Worldwide (Remote)',
    salary_min: null,
    salary_max: null,
    salary_currency: 'USD',
    normalized_salary_inr: j.salary ? j.salary : null,
    job_type: j.job_type || 'full-time',
    remote: true,
    skills_required: (j.tags || []).slice(0, 6),
    apply_link: j.url || '',
    source: 'remotive',
  }));
}

// ─── Source 3: Arbeitnow (Free, EU+Remote) ───────────────────────────────────
async function fetchArbeitnow(query: string, remote: boolean): Promise<NormalizedJob[]> {
  const params = new URLSearchParams({ search: query });
  if (remote) params.set('remote', 'true');
  const url = `https://www.arbeitnow.com/api/job-board-api?${params}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.data || []).slice(0, 15).map((j: any): NormalizedJob => ({
    id: `arbeitnow-${j.slug}`,
    title: j.title || 'Engineering Role',
    company: j.company_name || 'Company',
    location: j.location || (j.remote ? 'Remote' : 'Europe'),
    salary_min: null,
    salary_max: null,
    salary_currency: 'EUR',
    normalized_salary_inr: null,
    job_type: j.job_types?.[0]?.toLowerCase() || 'full-time',
    remote: j.remote || false,
    skills_required: (j.tags || []).slice(0, 6),
    apply_link: j.url || '',
    source: 'arbeitnow',
  }));
}

// ─── Source 4: The Muse (Free, US+Remote) ────────────────────────────────────
async function fetchTheMuse(query: string): Promise<NormalizedJob[]> {
  const url = `https://www.themuse.com/api/public/jobs?descending=true&page=1&query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || []).slice(0, 10).map((j: any): NormalizedJob => ({
    id: `muse-${j.id}`,
    title: j.name || 'Software Role',
    company: j.company?.name || 'Tech Company',
    location: j.locations?.[0]?.name || 'USA / Remote',
    salary_min: null,
    salary_max: null,
    salary_currency: 'USD',
    normalized_salary_inr: null,
    job_type: j.type?.toLowerCase() || 'full-time',
    remote: (j.locations || []).some((l: any) => l.name?.toLowerCase().includes('remote')),
    skills_required: (j.categories || []).map((c: any) => c.name).slice(0, 5),
    apply_link: j.refs?.landing_page || '',
    source: 'the-muse',
  }));
}

// ─── Source 5: RemoteOK (100% Free, Hacker Remote Jobs) ─────────────────────
async function fetchRemoteOK(query: string): Promise<NormalizedJob[]> {
  const url = `https://remoteok.com/api?tag=${encodeURIComponent(query.split(' ')[0].toLowerCase())}`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
    headers: { 'User-Agent': 'HireMindAI/1.0' },
  });
  if (!res.ok) return [];

  const raw = await res.json();
  // remoteok returns first item as metadata object, skip it
  const jobs = Array.isArray(raw) ? raw.slice(1, 12) : [];
  return jobs.map((j: any): NormalizedJob => ({
    id: `remoteok-${j.id}`,
    title: j.position || 'Remote Developer',
    company: j.company || 'Remote Company',
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
  }));
}

// ─── Skill extractor helper ──────────────────────────────────────────────────
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

// ─── Deduplicate by title+company ────────────────────────────────────────────
function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Main Route Handler ──────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query    = searchParams.get('q') || 'software engineer';
  const location = searchParams.get('location') || 'India';
  const remote   = searchParams.get('remote') === 'true';

  try {
    // Fan out to all free sources in parallel
    const [adzunaJobs, remotiveJobs, arbeitnowJobs, theMuseJobs, remoteOKJobs] =
      await Promise.allSettled([
        fetchAdzuna(query, location, remote),
        fetchRemotive(query),
        fetchArbeitnow(query, remote),
        fetchTheMuse(query),
        remote ? fetchRemoteOK(query) : Promise.resolve([]),
      ]);

    const allJobs: NormalizedJob[] = [
      ...(adzunaJobs.status  === 'fulfilled' ? adzunaJobs.value  : []),
      ...(remotiveJobs.status === 'fulfilled' ? remotiveJobs.value : []),
      ...(arbeitnowJobs.status === 'fulfilled' ? arbeitnowJobs.value : []),
      ...(theMuseJobs.status === 'fulfilled' ? theMuseJobs.value  : []),
      ...(remoteOKJobs.status === 'fulfilled' ? remoteOKJobs.value : []),
    ];

    const deduplicated = deduplicateJobs(allJobs);

    // If all APIs failed or returned nothing, return helpful fallback data
    if (deduplicated.length === 0) {
      return NextResponse.json(getMockJobs(query, location, remote), {
        headers: { 'X-Jobs-Source': 'fallback' },
      });
    }

    return NextResponse.json(deduplicated, {
      headers: {
        'X-Jobs-Source': 'live',
        'X-Jobs-Count': String(deduplicated.length),
      },
    });
  } catch (error) {
    console.error('[search/route] Unexpected error:', error);
    // Always return usable data to the UI — never an empty screen
    return NextResponse.json(getMockJobs(query, location, remote), {
      headers: { 'X-Jobs-Source': 'fallback-error' },
    });
  }
}
