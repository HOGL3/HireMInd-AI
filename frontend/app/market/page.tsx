'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Zap, MapPin, Brain, BarChart2, DollarSign, 
  Users, Star, ArrowUpRight, Globe, Sparkles, Building2,
  ChevronRight, Activity
} from 'lucide-react'
import Link from 'next/link'
import ResumeAnalyzer from '@/components/ResumeAnalyzer'

// ── Static market data (real API would populate this) ─────────────
const TOP_SKILLS = [
  { skill: 'Python', count: 1240, pct: 100, trend: '+12%', desc: 'Dominates backend & AI' },
  { skill: 'React', count: 1180, pct: 95, trend: '+8%', desc: 'Standard for modern UIs' },
  { skill: 'TypeScript', count: 980, pct: 79, trend: '+18%', desc: 'Growing preference in India' },
  { skill: 'Docker', count: 870, pct: 70, trend: '+15%', desc: 'Essential DevOps skill' },
  { skill: 'AWS', count: 820, pct: 66, trend: '+9%', desc: 'Primary cloud infrastructure' },
]

const SALARY_DATA = [
  { role: 'ML / AI Engineer', avg: '₹22–45 LPA', growth: '+31%', icon: Brain, color: 'text-violet-600', bg: 'bg-violet-50' },
  { role: 'Senior Python Dev', avg: '₹18–35 LPA', growth: '+12%', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { role: 'DevOps / Cloud Eng', avg: '₹16–32 LPA', growth: '+15%', icon: Activity, color: 'text-sky-600', bg: 'bg-sky-50' },
  { role: 'Full Stack Developer', avg: '₹10–25 LPA', growth: '+9%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
]

const TRENDING = [
  { title: 'AI/LLM Engineering demand surged 55% in Tier 1 cities.', tag: 'AI/ML', color: 'bg-violet-100 text-violet-600' },
  { title: 'Remote India jobs now 40% of listings — a new standard.', tag: 'Remote', color: 'bg-sky-100 text-sky-600' },
  { title: 'Naukri listings up 22% for Senior Cloud Architect roles.', tag: 'Hiring', color: 'bg-emerald-100 text-emerald-600' },
]

export default function MarketPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHoveringGoo, setIsHoveringGoo] = useState(false)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) return <div className="min-h-screen bg-zinc-50" />

  return (
    <div className="relative min-h-screen text-zinc-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden pt-20">
      
      {/* Dynamic Gooey Background Matching Home */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-zinc-50/50">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white" />
        
        <motion.div
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
            scale: isHoveringGoo ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 20, damping: 25 }}
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[140px] opacity-30 mix-blend-multiply"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #10b981 0deg, #38bdf8 180deg, #10b981 360deg)'
          }}
        />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200/50 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="HireMind Logo" className="w-10 h-10 object-contain transition-transform group-hover:scale-105" />
            <span className="text-lg font-bold tracking-tight text-zinc-900">HireMind</span>
          </Link>
          <div className="flex items-center gap-8 text-sm font-semibold">
            <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 transition-colors">Dashboard</Link>
            <Link href="/profile" className="text-zinc-500 hover:text-zinc-900 transition-colors">Profile</Link>
            <Link href="/dashboard" className="bg-zinc-900 text-white px-5 py-2 rounded-full hover:bg-emerald-600 transition-all">Start Searching</Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-6 pb-24 z-10">
        
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-3xl mb-16 pt-12"
          onMouseEnter={() => setIsHoveringGoo(true)}
          onMouseLeave={() => setIsHoveringGoo(false)}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[12px] font-bold text-emerald-600 uppercase tracking-wider mb-6">
            <Activity className="w-3.5 h-3.5" /> Market Intelligence Live
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-[1.05] mb-6">
            Architected for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500">Career Precision.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
            Real-time tracking of the Indian tech ecosystem. We analyze 12,000+ data points daily to give you an unfair technical edge.
          </p>
        </motion.div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Active Openings', value: '17,560', sub: '+12% this week', color: 'text-emerald-600' },
            { label: 'Avg Fresher CTC', value: '₹5 LPA', sub: 'Historical high', color: 'text-sky-600' },
            { label: 'Remote Roles', value: '40.2%', sub: 'India average', color: 'text-indigo-600' },
            { label: 'AI Demand Score', value: '98/100', sub: 'Rising steeply', color: 'text-violet-600' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] font-bold text-zinc-400 mt-1">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Insights Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Skills Velocity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-zinc-200/80 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                    <Zap className="w-6 h-6 text-emerald-500" /> Skill Velocity
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-1">Which stacks are actually hiring in Q2 2026.</p>
                </div>
                <div className="hidden sm:flex bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                  <button className="px-3 py-1.5 bg-white shadow-sm border border-zinc-100 text-[11px] font-bold rounded-lg tracking-wide uppercase">Volume</button>
                  <button className="px-3 py-1.5 text-zinc-400 text-[11px] font-bold tracking-wide uppercase">Growth</button>
                </div>
              </div>

              <div className="space-y-6">
                {TOP_SKILLS.map((s, i) => (
                  <motion.div key={s.skill} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="group">
                    <div className="flex items-center justify-between mb-3 text-sm font-bold">
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-zinc-400 tabular-nums">0{i+1}</span>
                        <span className="text-zinc-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{s.skill}</span>
                        <span className="text-emerald-500 text-[10px] font-black">{s.trend}</span>
                      </div>
                      <span className="text-zinc-500 tabular-nums">{s.count} listings</span>
                    </div>
                    <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1, ease: "circOut", delay: i * 0.1 }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 rounded-full"
                      />
                    </div>
                    <p className="text-[12px] text-zinc-400 font-medium mt-2">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Salary Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-md rounded-[32px] p-8 border border-zinc-200/80 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2 mb-8">
                <DollarSign className="w-6 h-6 text-emerald-500" /> Salary Frontiers
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {SALARY_DATA.map((row, i) => (
                  <div key={row.role} className="group bg-zinc-50/50 hover:bg-white p-6 rounded-2xl border border-zinc-100/50 hover:border-zinc-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${row.bg} ${row.color} flex items-center justify-center shadow-sm`}>
                        <row.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{row.growth} YoY</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">{row.role}</h3>
                    <p className="text-2xl font-black text-zinc-900">{row.avg}</p>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                       Normalized in INR <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Career Intelligence Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* NEW AI Resume Analyzer */}
            <ResumeAnalyzer />

            {/* Trending Alerts */}
            <div className="bg-zinc-900 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[60px]" />
               <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                 <Building2 className="w-5 h-5 text-emerald-400" /> Hiring Signals
               </h3>
               <div className="space-y-6">
                 {TRENDING.map((t, i) => (
                   <div key={i} className="group cursor-pointer">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${t.color} mb-3`}>
                        {t.tag}
                      </span>
                      <p className="text-sm font-medium text-zinc-400 leading-relaxed group-hover:text-white transition-colors">
                        {t.title}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase group-hover:text-emerald-400">
                        Read Story <ArrowUpRight className="w-3 h-3" />
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Community/CTA */}
            <div className="bg-emerald-500 rounded-[32px] p-8 text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
               <Star className="w-10 h-10 mb-4 text-emerald-200 fill-emerald-200" />
               <h3 className="text-xl font-bold mb-2">Architect Your Future</h3>
               <p className="text-sm font-medium text-emerald-50 opacity-90 mb-6">Join 40,000+ developers receiving weekly architectural deep-dives.</p>
               <button className="w-full bg-white text-emerald-600 py-3 rounded-xl font-bold text-sm shadow-sm hover:translate-y-[-2px] transition-all">
                  Join Newsletter
               </button>
            </div>

          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200/50 bg-white/50 backdrop-blur-md px-6 py-12 text-center text-zinc-400 font-medium text-sm">
         <div className="flex items-center justify-center gap-2 text-zinc-900 font-bold mb-4">
            <Sparkles className="w-4 h-4" /> HireMind AI
         </div>
         © 2026 Architected for clarity. All rights reserved.
      </footer>
    </div>
  )
}
