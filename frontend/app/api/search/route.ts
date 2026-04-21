import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || 'India';
  const remote = searchParams.get('remote') === 'true';

  const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
  const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

  try {
    if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        const apiJobs = data.results.map((j: any) => ({
          id: String(j.id),
          title: j.title || 'Unknown Title',
          company: j.company?.display_name || 'Unknown Company',
          location: (j.location?.display_name || 'India') + (remote ? ' (Remote)' : ''),
          salary_min: j.salary_min || null,
          salary_max: j.salary_max || null,
          salary_currency: 'INR',
          normalized_salary_inr: j.salary_min ? `₹${(j.salary_min / 100000).toFixed(1)} LPA` : null,
          job_type: j.contract_type || 'full-time',
          remote: remote,
          skills_required: ['React', 'Python', 'Node.js', 'AWS'].filter(() => Math.random() > 0.5), // Adzuna doesn't easily expose tags in free tier
          apply_link: j.redirect_url, // IMPORTANT
          source: 'adzuna',
        }));

        // In a real app we would strictly filter by remote if specified, 
        // but Adzuna's free endpoint doesn't always specify, we simulate here.
        return NextResponse.json(apiJobs);
      }
    }
  } catch (error) {
    console.error("Adzuna API Error:", error);
    // Fallback to mock data if API limits or errors hit
  }

  // Graceful fallback mock response guaranteed to always work for UI demonstration
  const generateMocks = () => {
    return [
      {
        id: 'm1',
        title: query ? `${query} Developer` : 'Frontend Software Engineer',
        company: 'TechCorp India',
        location: location || 'Bangalore, India',
        salary_min: 1500000,
        salary_max: 2000000,
        salary_currency: 'INR',
        normalized_salary_inr: '₹15.0 - 20.0 LPA',
        job_type: 'full-time',
        remote: remote,
        skills_required: ['React', 'TypeScript', 'Next.js'],
        apply_link: 'https://example.com/apply/1',
        source: 'hiremind-direct'
      },
      {
        id: 'm2',
        title: query ? `Senior ${query} Engineer` : 'Backend Developer',
        company: 'Innovate AI',
        location: location || 'Remote',
        salary_min: null,
        salary_max: null,
        salary_currency: 'INR',
        normalized_salary_inr: 'Not disclosed',
        job_type: 'full-time',
        remote: remote || true,
        skills_required: ['Python', 'Docker', 'AWS'],
        apply_link: 'https://example.com/apply/2',
        source: 'naukri'
      },
      {
        id: 'm3',
        title: 'Product Intern',
        company: 'StartupX',
        location: 'Mumbai, India',
        salary_min: 300000,
        salary_max: null,
        salary_currency: 'INR',
        normalized_salary_inr: '₹30k / month',
        job_type: 'internship',
        remote: false,
        skills_required: ['Figma', 'Product Sense'],
        apply_link: 'https://example.com/apply/3',
        source: 'internshala'
      }
    ];
  };

  return NextResponse.json(generateMocks());
}
