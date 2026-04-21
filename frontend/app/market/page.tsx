'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, MapPin, Brain, BarChart2, DollarSign, Users, Star, ArrowUpRight, Globe } from 'lucide-react'
import Link from 'next/link'

// ── Static market data (real API would populate this) ─────────────
const TOP_SKILLS = [
  { skill: 'Python', count: 1240, pct: 100, trend: '+12%' },
  { skill: 'React', count: 1180, pct: 95, trend: '+8%' },
  { skill: 'TypeScript', count: 980, pct: 79, trend: '+18%' },
  { skill: 'Docker', count: 870, pct: 70, trend: '+15%' },
  { skill: 'AWS', count: 820, pct: 66, trend: '+9%' },
  { skill: 'Node.js', count: 760, pct: 61, trend: '+5%' },
  { skill: 'PostgreSQL', count: 680, pct: 55, trend: '+3%' },
  { skill: 'Kubernetes', count: 620, pct: 50, trend: '+22%' },
  { skill: 'Machine Learning', count: 580, pct: 47, trend: '+31%' },
  { skill: 'Go', count: 430, pct: 35, trend: '+28%' },
  { skill: 'GraphQL', count: 390, pct: 31, trend: '+11%' },
  { skill: 'Terraform', count: 350, pct: 28, trend: '+19%' },
]

const SALARY_DATA = [
  { role: 'ML / AI Engineer', avg: '₹22–45 LPA', range: '₹15–60 LPA', growth: '+31%', flag: '🔥' },
  { role: 'Senior Python Dev', avg: '₹18–35 LPA', range: '₹12–50 LPA', growth: '+12%', flag: '⚡' },
  { role: 'DevOps / Cloud Eng', avg: '₹16–32 LPA', range: '₹10–45 LPA', growth: '+15%', flag: '📈' },
  { role: 'Full Stack Developer', avg: '₹10–25 LPA', range: '₹6–35 LPA', growth: '+9%', flag: '💻' },
  { role: 'Data Scientist', avg: '₹12–28 LPA', range: '₹8–40 LPA', growth: '+18%', flag: '📊' },
  { role: 'Frontend Dev (React)', avg: '₹8–20 LPA', range: '₹5–30 LPA', growth: '+8%', flag: '🎨' },
]

const LOCATION_DATA = [
  { city: 'Bangalore', jobs: 4820, avgSalary: '₹18 LPA', remote: 52, flag: '🏙️' },
  { city: 'Hyderabad', jobs: 3140, avgSalary: '₹15 LPA', remote: 44, flag: '🔷' },
  { city: 'Pune', jobs: 2680, avgSalary: '₹14 LPA', remote: 48, flag: '🟢' },
  { city: 'Mumbai', jobs: 2200, avgSalary: '₹16 LPA', remote: 40, flag: '🌃' },
  { city: 'Delhi / NCR', jobs: 1960, avgSalary: '₹15 LPA', remote: 36, flag: '🏛️' },
  { city: 'Chennai', jobs: 1540, avgSalary: '₹13 LPA', remote: 42, flag: '🌊' },
  { city: 'Remote India', jobs: 1220, avgSalary: '₹12 LPA', remote: 100, flag: '🏠' },
]

const TRENDING = [
  { title: 'AI/LLM Engineering demand surged 55% — highest growth in India', tag: 'AI/ML', color: 'from-violet-500 to-purple-600' },
  { title: 'Naukri listings up 22% — highest volume source for tech hires', tag: '🇮🇳 Naukri', color: 'from-orange-500 to-amber-500' },
  { title: 'Fresher Python roles grew 18% — TCS, Infosys, Wipro mass hiring', tag: 'Fresher', color: 'from-green-500 to-emerald-500' },
  { title: 'Remote India jobs now 40% of listings — post-pandemic normal', tag: 'Remote', color: 'from-blue-500 to-cyan-500' },
]

function fmt(s: string) { return s }

export default function MarketPage() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-30 border-b border-white/5 glass sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">HireMind <span className="gradient-text">AI</span></span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/profile" className="text-slate-400 hover:text-white transition-colors">Profile</Link>
          </div>
        </div>
      </nav>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 glass-brand px-4 py-2 rounded-full text-sm text-violet-300 mb-4">
            <TrendingUp className="w-4 h-4" /> Live Market Intelligence
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Tech Job Market <span className="gradient-text">Insights</span>
          </h1>
          <p className="text-slate-400">Real-time trends across 12,000+ tech job listings. Updated daily.</p>
        </motion.div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Indian Jobs', value: '17,560', icon: BarChart2, color: 'text-violet-400', sub: '+12% this week' },
            { label: 'Avg Fresher CTC', value: '₹5 LPA', icon: DollarSign, color: 'text-green-400', sub: '+8% vs last year' },
            { label: 'Remote Jobs', value: '40%', icon: Globe, color: 'text-blue-400', sub: 'of India listings' },
            { label: 'Hot Role', value: 'AI Eng', icon: Star, color: 'text-amber-400', sub: '+55% demand 🔥' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-white/6"
            >
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-slate-500">{kpi.label}</span>
              </div>
              <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-slate-600 mt-1">{kpi.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skill demand chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 border border-white/6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-violet-400" /> Skills in Demand
                </h2>
                <span className="text-xs text-slate-500">Based on 12k+ jobs</span>
              </div>
              <div className="space-y-3">
                {TOP_SKILLS.map((s, i) => (
                  <motion.div
                    key={s.skill}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`group cursor-pointer rounded-xl p-3 transition-all ${activeSkill === s.skill ? 'bg-violet-500/10 border border-violet-500/20' : 'hover:bg-white/5'}`}
                    onClick={() => setActiveSkill(activeSkill === s.skill ? null : s.skill)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                        <span className="text-sm font-medium text-white">{s.skill}</span>
                        <span className="text-xs text-green-400 font-semibold">{s.trend}</span>
                      </div>
                      <span className="text-xs text-slate-500">{s.count.toLocaleString()} jobs</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.04, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Salary insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 border border-white/6"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-green-400" /> Salary Insights by Role
              </h2>
              <div className="space-y-3">
                {SALARY_DATA.map((row, i) => (
                  <motion.div
                    key={row.role}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-4 glass rounded-xl p-4 border border-white/5 hover:border-green-500/20 transition-all"
                  >
                    <span className="text-2xl">{row.flag}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{row.role}</span>
                        <span className="text-xs text-green-400 font-semibold">{row.growth}</span>
                      </div>
                      <span className="text-xs text-slate-500">{row.range}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-green-400">{row.avg}</p>
                      <p className="text-xs text-slate-600">avg CTC</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Trending alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-3xl p-6 border border-white/6"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-400" /> Trending Signals
              </h2>
              <div className="space-y-3">
                {TRENDING.map((t, i) => (
                  <motion.div
                    key={t.tag}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${t.color} text-white mb-2`}>
                      {t.tag}
                    </div>
                    <p className="text-sm text-slate-300 leading-snug group-hover:text-white transition-colors">{t.title}</p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 mt-2 group-hover:text-violet-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Location heatmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-3xl p-6 border border-white/6"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-400" /> Top Hiring Locations
              </h2>
              <div className="space-y-3">
                {LOCATION_DATA.map((loc) => (
                  <div key={loc.city} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{loc.flag}</span>
                      <div>
                        <p className="text-sm text-white font-medium">{loc.city}</p>
                        <p className="text-xs text-slate-500">{loc.jobs.toLocaleString()} openings · {loc.remote}% remote</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-400">{loc.avgSalary}</span>
                  </div>
                ))}
              </div>

            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-brand rounded-3xl p-6 border border-violet-500/20 text-center"
            >
              <Star className="w-8 h-8 text-violet-400 mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Update Your Skills</h3>
              <p className="text-sm text-slate-400 mb-4">TypeScript & Kubernetes are trending. Add them to boost your Fit Score.</p>
              <Link
                href="/profile?section=skills"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
              >
                <Users className="w-4 h-4" /> Update Profile
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
