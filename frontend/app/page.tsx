'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Brain, Zap, Target, Shield, TrendingUp, MessageSquare,
  ArrowRight, Search, MapPin, Sparkles, Building2
} from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'Precision Fit Score',
    desc: 'Our engine computes exact match percentages based on deep tech-stack analysis, bypassing keyword spammers.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Search,
    title: 'Live Market Fetch',
    desc: 'Direct integrations with Adzuna and premium global boards. No stale data, no fake listings.',
    color: 'bg-sky-100 text-sky-600',
  },
  {
    icon: Shield,
    title: 'Verified Trust Layer',
    desc: 'Proprietary scam filtering ensures that every company you apply to is thoroughly vetted and secure.',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: TrendingUp,
    title: 'Compensation Intelligence',
    desc: 'See normalized salary curves in pure INR Lakhs Per Annum instantly, without guessing.',
    color: 'bg-rose-100 text-rose-600',
  },
  {
    icon: Zap,
    title: 'Zero Friction',
    desc: 'No mandatory profiles, no paywalls. Start searching and applying within sub-seconds.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MessageSquare,
    title: 'AI Copilot Edge',
    desc: 'Talk directly with an AI trained specifically on the modern tech hiring landscape to negotiate offers.',
    color: 'bg-zinc-100 text-zinc-600',
  },
]

const SAMPLE_JOBS = [
  { title: 'Senior Machine Learning Engineer', company: 'Automata Systems', location: 'Remote', type: 'Full-time', skills: ['Python', 'Docker', 'PyTorch'] },
  { title: 'React UI Developer', company: 'FinTech India', location: 'Bangalore', type: 'Contract', skills: ['React', 'Next.js', 'Tailwind'] },
  { title: 'Systems Architect', company: 'Global Cloud Corp', location: 'Hyderabad', type: 'Full-time', skills: ['AWS', 'Go', 'Kubernetes'] },
]

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringGoo, setIsHoveringGoo] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="relative min-h-screen text-zinc-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      
      {/* Dynamic Gooey Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Static base gradient to avoid total darkness when mouse is away */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white" />
        
        {/* Dynamic tracking blob */}
        <motion.div
          animate={{
            x: mousePosition.x - 300,
            y: mousePosition.y - 300,
            scale: isHoveringGoo ? 1.2 : 1,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20, mass: 1 }}
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 mix-blend-multiply"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #10b981 0deg, #38bdf8 180deg, #10b981 360deg)'
          }}
        />
        
        {/* Secondary counter-tracking blob for complex mixing */}
        <motion.div
          animate={{
            x: typeof window !== 'undefined' ? window.innerWidth - mousePosition.x - 400 : 0,
            y: typeof window !== 'undefined' ? window.innerHeight - mousePosition.y - 400 : 0,
          }}
          transition={{ type: "spring", stiffness: 20, damping: 30, mass: 1.5 }}
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[140px] opacity-30 mix-blend-multiply bg-indigo-200"
        />

        {/* Grain overlay for premium texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025] mix-blend-overlay" />

        {/* Floating Geometric Parallax Elements */}
        {typeof window !== 'undefined' && (
          <>
            <motion.div
              animate={{
                x: (mousePosition.x - window.innerWidth / 2) * -0.05,
                y: (mousePosition.y - window.innerHeight / 2) * -0.05,
              }}
              transition={{ type: "spring", stiffness: 40, damping: 30 }}
              className="absolute top-[15%] left-[10%] w-64 h-64 border-[1px] border-emerald-200/40 rounded-full animate-float-slow opacity-60"
            />
            <motion.div
              animate={{
                x: (mousePosition.x - window.innerWidth / 2) * 0.08,
                y: (mousePosition.y - window.innerHeight / 2) * 0.08,
              }}
              transition={{ type: "spring", stiffness: 30, damping: 40 }}
              className="absolute top-[40%] right-[15%] w-96 h-96 border-[1px] border-sky-200/30 rounded-full animate-float-slow opacity-60"
              style={{ animationDelay: '2s' }}
            />
            <motion.div
              animate={{
                x: (mousePosition.x - window.innerWidth / 2) * -0.03,
                y: (mousePosition.y - window.innerHeight / 2) * -0.03,
                rotate: (mousePosition.x - window.innerWidth / 2) * -0.05,
              }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
              className="absolute bottom-[20%] left-[25%] w-32 h-32 bg-indigo-50/50 backdrop-blur-3xl border border-indigo-100 rounded-3xl rotate-12 opacity-80"
            />
          </>
        )}
      </div>

      {/* Modern Navigation */}
      <nav className="relative z-50 border-b border-zinc-200/60 bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">
                HireMind
              </span>
            </Link>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-6">
            <Link href="/market" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">Market Intelligence</Link>
            <Link href="/dashboard" className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-600 shadow-sm transition-all duration-300">
              Start Searching
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-24 px-6 z-10"
        onMouseEnter={() => setIsHoveringGoo(true)}
        onMouseLeave={() => setIsHoveringGoo(false)}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200 shadow-sm text-[13px] font-semibold text-zinc-600 mb-8 tracking-wide uppercase"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500" /> V4 Engine Now Live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[1.05] mb-8"
          >
            Find work that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 animate-gradient-x inline-block">moves the needle.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-zinc-500 font-medium max-w-2xl mx-auto mb-14 leading-relaxed"
          >
            Live architectural tracking of the world's best tech roles. No stale jobs, no fluff. Just pure signal.
          </motion.p>

          {/* Search bar command center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex items-center max-w-2xl mx-auto bg-white rounded-full p-2.5 mb-8 border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/[0.02]"
          >
            <Search className="w-5 h-5 text-zinc-400 ml-4 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Try "Machine Learning in Bangalore"...'
              className="flex-1 bg-transparent px-4 py-3 text-zinc-900 font-medium placeholder-zinc-400 outline-none text-base"
            />
            <Link
              href={`/dashboard?q=${searchQuery}`}
              className="bg-zinc-900 text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm shrink-0 flex items-center gap-2"
            >
              Search <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 flex-wrap text-sm font-medium text-zinc-500"
          >
            <span className="text-zinc-400 mr-2">Trending:</span>
            {['React', 'Deep Learning', 'Remote India', 'Go'].map((tag) => (
              <Link key={tag} href={`/dashboard?q=${tag}`} className="hover:text-zinc-900 px-3 py-1 rounded-full bg-white/50 border border-zinc-200/60 shadow-sm transition-colors">
                {tag}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Sample Jobs Section */}
      <section className="relative px-6 pb-32 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">Architected for clarity</h2>
            <p className="text-zinc-500 font-medium">Glanceable, highly dense cards instantly surface the data that matters.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SAMPLE_JOBS.map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-[24px] p-6 border border-zinc-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-[14px] bg-zinc-50 border border-zinc-100 flex items-center justify-center font-bold text-xl text-zinc-900 shrink-0 shadow-sm">
                    {job.company[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                    <Building2 className="w-4 h-4 text-zinc-400" /> {job.company}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                    <MapPin className="w-4 h-4 text-zinc-400" /> {job.location} · {job.type}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-100 mt-auto">
                  {job.skills.map(s => (
                    <span key={s} className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-32 bg-white border-t border-zinc-200/50 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-5 tracking-tight">
              An <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 animate-gradient-x">unfair</span> technical edge.
            </h2>
            <p className="text-zinc-500 text-lg font-medium leading-relaxed">
              We stripped away the complexity of traditional boards, leaving only raw intelligence and seamless applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[24px] p-8 border border-zinc-200/60 shadow-sm hover:border-emerald-200 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-zinc-900 text-xl mb-3">{f.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-6 py-32 z-10">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-emerald-50 blur-[80px] rounded-full -z-10" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-white/60 backdrop-blur-xl rounded-[40px] p-12 py-20 border border-zinc-200/80 shadow-[0_8px_40px_rgb(0,0,0,0.04)]"
          >
            <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-6">
              Ready to accelerate?
            </h2>
            <p className="text-zinc-500 font-medium text-lg mb-10 max-w-xl mx-auto">
              Join the platform architected specifically for elite engineers across India. Bypass the noise.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
            >
              Enter Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-zinc-200/60 px-6 py-10 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-zinc-400 font-medium text-sm gap-4">
          <div className="flex items-center gap-2 text-zinc-900 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>HireMind AI</span>
          </div>
          <span>Architected for the future of work. © 2025</span>
        </div>
      </footer>
    </div>
  )
}
