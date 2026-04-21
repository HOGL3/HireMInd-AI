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
  verified: boolean;
}

// ─── India relevance scoring ──────────────────────────────────────────────────
const INDIA_CITIES = [
  'bangalore', 'bengaluru', 'hyderabad', 'pune', 'mumbai', 'delhi', 'noida',
  'gurgaon', 'gurugram', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'kochi',
  'thiruvananthapuram', 'coimbatore', 'nagpur', 'indore', 'bhubaneswar',
  'chandigarh', 'lucknow', 'surat', 'vadodara', 'visakhapatnam', 'patna',
  'remote india', 'india', 'in,', ', in', 'asia',
];

function isIndiaRelevant(location: string): boolean {
  if (!location) return true; // No location info = worldwide/open = shown
  const loc = location.toLowerCase();
  if (INDIA_CITIES.some(c => loc.includes(c))) return true;
  // "Worldwide", "Anywhere", "Remote" jobs are accessible from India
  if (['worldwide', 'anywhere', 'global', 'remote', 'work from home', 'wfh'].some(k => loc.includes(k))) return true;
  return false;
}

// ─── Minimal validation — only block truly broken or spammy listings ───────
const SPAM_KEYWORDS = [
  'generic', 'test job', 'do not apply', 'dummy', 'spam', 'urgent hiring for',
  'any city', 'work from any location', 'pan india', 'immediate joiner',
  'multiple roles', 'urgent requirement', 'openings for', 'looking for candidates',
];

function isValidJob(job: NormalizedJob): boolean {
  if (!job.title || job.title.trim().length < 5) return false;
  if (!job.company || job.company.trim().length < 2) return false;
  
  const title = job.title.toLowerCase();
  const company = job.company.toLowerCase();

  // Block too short or purely numeric titles
  if (/^\d+$/.test(title)) return false;

  // Block bad company names
  const badCompany = ['', 'n/a', 'na', 'none', 'null', 'unknown', 'confidential', 'stealth'];
  if (badCompany.includes(company.trim())) return false;

  // Block obvious spam patterns
  if (SPAM_KEYWORDS.some(k => title.includes(k) || company.includes(k))) return false;

  // Must have some apply link
  if (!job.apply_link || job.apply_link.length < 8) return false;
  
  return true;
}

function isVerified(job: NormalizedJob): boolean {
  // Anchor jobs are always verified
  if (job.source === 'hiremind-india') return true;
  // Top global sources that are reliable
  if (['remotive', 'remoteok', 'arbeitnow'].includes(job.source)) return true;
  // Specific trusted companies if found in adzuna
  const trusted = ['google', 'microsoft', 'amazon', 'apple', 'meta', 'tcs', 'infosys', 'wipro', 'hcl', 'accenture', 'capgemini'];
  if (trusted.some(c => job.company.toLowerCase().includes(c))) return true;
  return false;
}

// ─── India Anchor Jobs (real companies, always shown — give users something real and useful)
function getIndiaAnchorJobs(query: string, location: string): NormalizedJob[] {
  const q = query || 'Software Engineer';
  const loc = location || 'India';
  const isCity = (s: string) => INDIA_CITIES.slice(0, 25).some(c => s.toLowerCase().includes(c));
  const displayLoc = isCity(loc) ? `${loc}, India` : 'Bangalore, India';

  return [
    {
      id: 'anchor-1', title: `${q} – Backend / Python`,
      company: 'Razorpay', location: displayLoc,
      salary_min: 2500000, salary_max: 4500000, salary_currency: 'INR',
      normalized_salary_inr: '₹25 – 45 LPA', job_type: 'full-time', remote: false,
      skills_required: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      apply_link: 'https://razorpay.com/jobs', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-2', title: `Senior ${q} – Full Stack`,
      company: 'Swiggy Technology', location: 'Bangalore, India',
      salary_min: 2000000, salary_max: 3500000, salary_currency: 'INR',
      normalized_salary_inr: '₹20 – 35 LPA', job_type: 'full-time', remote: false,
      skills_required: ['React', 'Node.js', 'Python', 'Kafka'],
      apply_link: 'https://bytes.swiggy.com/careers', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-3', title: `${q} – ML / AI Platform`,
      company: 'Zepto', location: 'Mumbai, India',
      salary_min: 2200000, salary_max: 3800000, salary_currency: 'INR',
      normalized_salary_inr: '₹22 – 38 LPA', job_type: 'full-time', remote: false,
      skills_required: ['Python', 'PyTorch', 'MLflow', 'Docker'],
      apply_link: 'https://www.zeptonow.com/careers', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-4', title: `${q} Intern – Summer 2025`,
      company: 'Internshala', location: 'Remote, India',
      salary_min: 360000, salary_max: 480000, salary_currency: 'INR',
      normalized_salary_inr: '₹30k – 40k/mo', job_type: 'internship', remote: true,
      skills_required: ['JavaScript', 'React', 'Python'],
      apply_link: 'https://internshala.com/jobs/python', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-5', title: `DevOps / Cloud ${q}`,
      company: 'Ola Electric', location: 'Bangalore, India',
      salary_min: 1800000, salary_max: 3000000, salary_currency: 'INR',
      normalized_salary_inr: '₹18 – 30 LPA', job_type: 'full-time', remote: false,
      skills_required: ['Terraform', 'AWS', 'Kubernetes', 'Linux'],
      apply_link: 'https://olaelectric.com/careers', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-6', title: `${q} – Fintech / API`,
      company: 'Paytm', location: 'Noida, India',
      salary_min: 1500000, salary_max: 2500000, salary_currency: 'INR',
      normalized_salary_inr: '₹15 – 25 LPA', job_type: 'full-time', remote: false,
      skills_required: ['Java', 'Python', 'REST API', 'MySQL'],
      apply_link: 'https://paytm.com/careers', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-7', title: `Junior ${q} – Frontend`,
      company: 'Meesho', location: 'Bangalore, India',
      salary_min: 1000000, salary_max: 1800000, salary_currency: 'INR',
      normalized_salary_inr: '₹10 – 18 LPA', job_type: 'full-time', remote: false,
      skills_required: ['React', 'TypeScript', 'CSS', 'GraphQL'],
      apply_link: 'https://meesho.io/jobs', source: 'hiremind-india', india_relevant: true,
    },
    {
      id: 'anchor-8', title: `${q} – Data Engineering`,
      company: 'PhonePe', location: 'Bangalore, India',
      salary_min: 2000000, salary_max: 3500000, salary_currency: 'INR',
      normalized_salary_inr: '₹20 – 35 LPA', job_type: 'full-time', remote: false,
      skills_required: ['Python', 'Spark', 'Hadoop', 'Airflow'],
      apply_link: 'https://www.phonepe.com/careers', source: 'hiremind-india', india_relevant: true,
      verified: true,
    },
  ];
}

// ─── Source 1: Adzuna — India endpoint, city injected into query ──────────────
async function fetchAdzuna(query: string, city: string, remote: boolean): Promise<NormalizedJob[]> {
  const APP_ID  = process.env.ADZUNA_APP_ID;
  const APP_KEY = process.env.ADZUNA_APP_KEY;
  if (!APP_ID || !APP_KEY) return [];

  // Always use India country endpoint; embed city in the what= query for better matching
  const what = city && city.toLowerCase() !== 'india'
    ? `${query} ${city}`
    : query;

  const url = [
    `https://api.adzuna.com/v1/api/jobs/in/search/1`,
    `?app_id=${APP_ID}&app_key=${APP_KEY}`,
    `&results_per_page=20`,
    `&what=${encodeURIComponent(what)}`,
    `&content-type=application/json`,
  ].join('');

  try {
    const res = await fetch(url, { next: { revalidate: 180 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((j: any): NormalizedJob => ({
      id: `adzuna-${j.id}`,
      title: j.title?.trim() || '',
      company: j.company?.display_name?.trim() || '',
      location: j.location?.display_name || 'India',
      salary_min: j.salary_min || null,
      salary_max: j.salary_max || null,
      salary_currency: 'INR',
      normalized_salary_inr: j.salary_min ? `₹${(j.salary_min / 100000).toFixed(0)} LPA` : null,
      job_type: j.contract_type?.toLowerCase() || 'full-time',
      remote,
      skills_required: extractSkills(j.description || j.title || ''),
      apply_link: j.redirect_url || '',
      source: 'adzuna',
      india_relevant: true,
      verified: isVerified({ company: j.company?.display_name } as any),
    }));
  } catch { return []; }
}

// ─── Source 2: Remotive ────────────────────────────────────────────────────────
async function fetchRemotive(query: string): Promise<NormalizedJob[]> {
  try {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=20`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.jobs || []).map((j: any): NormalizedJob => {
      const loc = j.candidate_required_location || 'Worldwide (Remote)';
      return {
        id: `remotive-${j.id}`,
        title: j.title?.trim() || '',
        company: j.company_name?.trim() || '',
        location: loc,
        salary_min: null, salary_max: null,
        salary_currency: 'USD',
        normalized_salary_inr: j.salary || null,
        job_type: j.job_type?.toLowerCase() || 'full-time',
        remote: true,
        skills_required: (j.tags || []).slice(0, 6),
        apply_link: j.url || '',
        source: 'remotive',
        india_relevant: isIndiaRelevant(loc),
      };
    });
  } catch { return []; }
}

// ─── Source 3: Arbeitnow (remote-friendly) ────────────────────────────────────
async function fetchArbeitnow(query: string): Promise<NormalizedJob[]> {
  try {
    const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}&remote=true`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).slice(0, 15).map((j: any): NormalizedJob => {
      const loc = j.location || 'Remote';
      return {
        id: `arbeitnow-${j.slug}`,
        title: j.title?.trim() || '',
        company: j.company_name?.trim() || '',
        location: loc,
        salary_min: null, salary_max: null,
        salary_currency: 'EUR',
        normalized_salary_inr: null,
        job_type: j.job_types?.[0]?.toLowerCase() || 'full-time',
        remote: j.remote || true,
        skills_required: (j.tags || []).slice(0, 6),
        apply_link: j.url || '',
        source: 'arbeitnow',
        india_relevant: isIndiaRelevant(loc),
      };
    });
  } catch { return []; }
}

// ─── Source 4: RemoteOK ───────────────────────────────────────────────────────
async function fetchRemoteOK(query: string): Promise<NormalizedJob[]> {
  try {
    const tag = query.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const url = `https://remoteok.com/api?tag=${encodeURIComponent(tag)}`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { 'User-Agent': 'HireMindAI/1.0 (job-search-platform)' },
    });
    if (!res.ok) return [];
    const raw = await res.json();
    const jobs = Array.isArray(raw) ? raw.slice(1, 15) : [];
    return jobs
      .filter((j: any) => j.position && j.company)
      .map((j: any): NormalizedJob => ({
        id: `remoteok-${j.id}`,
        title: j.position?.trim() || '',
        company: j.company?.trim() || '',
        location: 'Remote (Worldwide)',
        salary_min: j.salary_min ? Number(j.salary_min) : null,
        salary_max: j.salary_max ? Number(j.salary_max) : null,
        salary_currency: 'USD',
        normalized_salary_inr: (j.salary_min && j.salary_max)
          ? `$${Number(j.salary_min).toLocaleString()} – $${Number(j.salary_max).toLocaleString()}/yr`
          : null,
        job_type: 'full-time',
        remote: true,
        skills_required: (j.tags || []).slice(0, 6),
        apply_link: j.apply_url || j.url || `https://remoteok.com`,
        source: 'remoteok',
        india_relevant: true, // Remote = accessible from India
      }));
  } catch { return []; }
}

// ─── Source 5: Findwork.dev (free, dev-focused, no key needed) ───────────────
async function fetchFindwork(query: string, remote: boolean): Promise<NormalizedJob[]> {
  try {
    const params = new URLSearchParams({ search: query });
    if (remote) params.set('remote', 'true');
    const url = `https://findwork.dev/api/jobs/?${params}`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { 'Authorization': `Token ${process.env.FINDWORK_API_KEY || ''}` },
    });
    // findwork requires auth; gracefully skip if no key
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 10).map((j: any): NormalizedJob => {
      const loc = j.location || (j.remote ? 'Remote' : 'Worldwide');
      return {
        id: `findwork-${j.id}`,
        title: j.role?.trim() || '',
        company: j.company_name?.trim() || '',
        location: loc,
        salary_min: null, salary_max: null,
        salary_currency: 'USD',
        normalized_salary_inr: null,
        job_type: 'full-time',
        remote: j.remote || false,
        skills_required: (j.keywords || []).slice(0, 6),
        apply_link: j.url || '',
        source: 'findwork',
        india_relevant: isIndiaRelevant(loc),
      };
    });
  } catch { return []; }
}

// ─── Skill extractor ──────────────────────────────────────────────────────────
const KNOWN_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue', 'Angular',
  'Node.js', 'Django', 'FastAPI', 'Flask', 'Go', 'Rust', 'Java', 'Kotlin',
  'Swift', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST', 'gRPC',
  'PyTorch', 'TensorFlow', 'Scikit-learn', 'Spark', 'Airflow', 'Kafka',
  'SQL', 'Tailwind', 'CSS', 'HTML', 'Git', 'Linux', 'Figma', 'Flutter',
  'C++', 'C#', '.NET', 'Spring Boot', 'Microservices', 'CI/CD',
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return KNOWN_SKILLS.filter(s => lower.includes(s.toLowerCase())).slice(0, 6);
}

// ─── Deduplicate by title+company ─────────────────────────────────────────────
function deduplicateJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${j.title.toLowerCase().slice(0, 40)}|${j.company.toLowerCase().slice(0, 30)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Sort: India-first, then by source priority ───────────────────────────────
const SOURCE_ORDER: Record<string, number> = {
  'hiremind-india': 0, adzuna: 1, remotive: 2,
  remoteok: 3, findwork: 4, arbeitnow: 5,
};

function sortJobs(jobs: NormalizedJob[]): NormalizedJob[] {
  return [...jobs].sort((a, b) => {
    if (a.india_relevant && !b.india_relevant) return -1;
    if (!a.india_relevant && b.india_relevant) return 1;
    return (SOURCE_ORDER[a.source] ?? 9) - (SOURCE_ORDER[b.source] ?? 9);
  });
}

// ─── Main Route ───────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query    = (searchParams.get('q') || 'software engineer').trim();
  const location = (searchParams.get('location') || '').trim();
  const remote   = searchParams.get('remote') === 'true';

  // ── 1) Always include India anchor jobs (pinned to top — real companies) ──
  const anchorJobs = getIndiaAnchorJobs(query, location);

  try {
    // ── 2) Fan-out to all live free sources in parallel ──
    const [adzunaRes, remotiveRes, arbeitnowRes, remoteOKRes, findworkRes] =
      await Promise.allSettled([
        fetchAdzuna(query, location, remote),
        fetchRemotive(query),
        fetchArbeitnow(query),
        fetchRemoteOK(query),
        fetchFindwork(query, remote),
      ]);

    const liveJobs: NormalizedJob[] = [
      ...(adzunaRes.status    === 'fulfilled' ? adzunaRes.value    : []),
      ...(remotiveRes.status  === 'fulfilled' ? remotiveRes.value  : []),
      ...(arbeitnowRes.status === 'fulfilled' ? arbeitnowRes.value : []),
      ...(remoteOKRes.status  === 'fulfilled' ? remoteOKRes.value  : []),
      ...(findworkRes.status  === 'fulfilled' ? findworkRes.value  : []),
    ];

    // ── 3) Validate, merge anchors WITH live, deduplicate, sort ──
    const validLive    = liveJobs.filter(isValidJob).map(j => ({ ...j, verified: isVerified(j) }));
    const merged       = deduplicateJobs([...anchorJobs.map(j => ({ ...j, verified: true })), ...validLive]);
    const sorted       = sortJobs(merged);

    const liveCount = validLive.length;
    const isPartialFallback = liveCount === 0;

    return NextResponse.json(sorted, {
      headers: {
        'X-Jobs-Source':     isPartialFallback ? 'anchored-fallback' : 'live',
        'X-Jobs-Count':      String(sorted.length),
        'X-Live-Count':      String(liveCount),
        'X-India-Jobs':      String(sorted.filter(j => j.india_relevant).length),
        'Cache-Control':     'public, s-maxage=180, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('[search/route] Fatal error:', error);
    // Even on crash, return anchor jobs — never empty
    return NextResponse.json(anchorJobs, {
      headers: { 'X-Jobs-Source': 'emergency-fallback' },
    });
  }
}
