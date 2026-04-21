'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Briefcase, Bookmark, ChevronRight, Zap,
  Globe, ExternalLink, Filter, DollarSign, Brain, ArrowRight, Building2, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  normalized_salary_inr: string | null
  job_type: string
  remote: boolean
  skills_required: string[]
  apply_link: string
  source: string
}

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Search Context
  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams?.get('q') || '')

  // Filters
  const [filterLocation, setFilterLocation] = useState(searchParams?.get('location') || '')
  const [filterRemote, setFilterRemote] = useState(searchParams?.get('remote') === 'true')
  const [filterJobType, setFilterJobType] = useState('all')

  // Effect to debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => clearTimeout(handler)
  }, [query])

  // Fetch logic
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        if (debouncedQuery) params.append('q', debouncedQuery)
        if (filterLocation) params.append('location', filterLocation)
        if (filterRemote) params.append('remote', 'true')

        const res = await fetch(`http://127.0.0.1:8000/api/jobs/search/?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch jobs')
        
        const data = await res.json()
        setJobs(data)
      } catch (err) {
        console.error(err)
        setError('Unable to fetch live jobs. Displaying fallback data.')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [debouncedQuery, filterLocation, filterRemote])

  // Post-fetch UI filtering
  const displayJobs = jobs.filter(j => {
    if (filterJobType !== 'all' && j.job_type.toLowerCase() !== filterJobType.toLowerCase()) return false
    return true
  })

  return (
    <div className="min-h-screen text-zinc-900 font-sans relative selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden">
      
      {/* Decorative Premium Background Mesh */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[150px] left-[50%] -translate-x-[50%] w-[1200px] h-[500px] bg-gradient-to-br from-emerald-100/60 via-sky-100/40 to-indigo-100/30 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay"></div>
      </div>

      {/* Modern Navigation */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-md shadow-zinc-200 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              HireMind
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 transition-colors">Find Jobs</Link>
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 transition-colors">Market Intel</Link>
            <a href="#" className="bg-zinc-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 transition-all duration-300 shadow-sm">
              Post a Role
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Premium Hero Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-sm text-xs font-semibold text-emerald-600 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Real-time Search
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 mb-5 leading-[1.1]">
            Find roles that <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">define the future.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Curated opportunities for premium tech talent in India and beyond.
          </motion.p>
        </div>

        {/* Polished Command Bar (Search & Filter) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-3 border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 ring-1 ring-black/[0.02]"
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-3 bg-zinc-50/50 hover:bg-zinc-50 border border-transparent focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-2xl px-5 py-4 transition-all duration-300">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search job title, skills, or company...'
                className="bg-transparent text-zinc-900 w-full placeholder-zinc-400 outline-none text-base font-medium"
              />
            </div>

            {/* Location Input */}
            <div className="flex-[0.5] flex items-center gap-3 bg-zinc-50/50 hover:bg-zinc-50 border border-transparent focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-2xl px-5 py-4 transition-all duration-300">
              <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="City (e.g. Bangalore)"
                className="bg-transparent text-zinc-900 w-full placeholder-zinc-400 outline-none text-base font-medium"
              />
            </div>

            {/* Remote Toggle */}
            <button
              onClick={() => setFilterRemote(!filterRemote)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                filterRemote 
                ? 'bg-emerald-50 border-transparent text-emerald-700 ring-1 ring-emerald-200' 
                : 'bg-zinc-50 border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Globe className={`w-5 h-5 ${filterRemote ? 'text-emerald-500' : 'text-zinc-400'}`} /> Remote
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4 px-2 pb-1 overflow-x-auto no-scrollbar">
            {['all', 'full-time', 'contract', 'internship'].map(type => (
              <button
                key={type}
                onClick={() => setFilterJobType(type)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  filterJobType === type
                  ? 'bg-zinc-900 text-white shadow-md shadow-zinc-900/20'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Status Row */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl mb-8 text-sm font-medium flex items-center gap-3 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" /> {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6 px-1">
          <p className="text-zinc-500 text-sm font-medium">
            {loading ? 'Scanning market data...' : (
              <span><strong className="text-zinc-900 font-bold">{displayJobs.length}</strong> premium roles available</span>
            )}
          </p>
        </div>

        {/* Results Grid - High End Cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm opacity-60">
                <div className="flex gap-4 mb-6">
                  <div className="w-14 h-14 rounded-[16px] bg-zinc-100 animate-pulse shrink-0" />
                  <div className="flex-1 pt-1">
                    <div className="h-5 w-3/4 bg-zinc-100 rounded animate-pulse mb-3" />
                    <div className="h-4 w-1/2 bg-zinc-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-full bg-zinc-100 rounded-lg animate-pulse mb-6" />
                <div className="h-12 w-full bg-zinc-100 rounded-[14px] animate-pulse" />
              </div>
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[32px] p-16 text-center border border-zinc-200/60 shadow-sm max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-zinc-100">
              <Search className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">No open roles found</h3>
            <p className="text-zinc-500 text-lg">Try adjusting your filters or search constraints to uncover more opportunities.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayJobs.map(job => (
                <motion.div
                  layout
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-[24px] p-6 border border-zinc-200/60 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-[16px] bg-zinc-50 border border-zinc-100 flex items-center justify-center font-bold text-2xl text-zinc-900 shrink-0">
                      {job.company[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 pr-4">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                        <p className="text-sm font-medium text-zinc-500">{job.company}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1.5 bg-zinc-50 text-zinc-600 border border-zinc-200/60 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1.5 bg-zinc-50 text-zinc-600 border border-zinc-200/60 rounded-lg capitalize">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400" /> {job.job_type}
                    </span>
                    {job.normalized_salary_inr && (
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> {job.normalized_salary_inr}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {job.skills_required.slice(0, 4).map(s => (
                      <span key={s} className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded-md">
                        {s}
                      </span>
                    ))}
                    {job.skills_required.length > 4 && (
                      <span className="text-[11px] font-bold tracking-wide px-2.5 py-1 bg-zinc-50 text-zinc-400 border border-zinc-200/50 rounded-md">
                        +{job.skills_required.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Push button to bottom */}
                  <div className="mt-auto">
                    {job.apply_link ? (
                      <a
                        href={job.apply_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white px-5 py-3.5 rounded-[16px] font-semibold text-sm hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-600/20 transition-all duration-300 group/btn"
                      >
                        Start Application
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <button disabled className="w-full py-3.5 rounded-[16px] font-semibold text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed">
                        Application Closed
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
