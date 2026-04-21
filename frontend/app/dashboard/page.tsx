'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Search, MapPin, Briefcase, Globe, DollarSign,
  ArrowRight, Building2, Sparkles, RefreshCw, Info,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { INDIAN_CITIES, JOB_ROLE_SUGGESTIONS } from '../lib/suggestions'

// ─── Types ────────────────────────────────────────────────────────────────────
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
  india_relevant: boolean
}

// ─── Source label map ─────────────────────────────────────────────────────────
const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  'adzuna':          { label: 'Adzuna',    color: 'bg-blue-50 text-blue-600 border-blue-100' },
  'remotive':        { label: 'Remotive',  color: 'bg-purple-50 text-purple-600 border-purple-100' },
  'remoteok':        { label: 'RemoteOK',  color: 'bg-rose-50 text-rose-600 border-rose-100' },
  'arbeitnow':       { label: 'Arbeitnow', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  'the-muse':        { label: 'The Muse',  color: 'bg-pink-50 text-pink-600 border-pink-100' },
  'findwork':        { label: 'Findwork',  color: 'bg-sky-50 text-sky-600 border-sky-100' },
  'hiremind-india':  { label: '🇮🇳 India',  color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'hiremind-india-cache': { label: '🇮🇳 India', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'hiremind-fallback': { label: '🇮🇳 India', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
}

// ─── Fetcher (used by React Query) ───────────────────────────────────────────
async function fetchJobs(query: string, location: string, remote: boolean): Promise<{ jobs: Job[]; source: string; liveCount: number }> {
  const params = new URLSearchParams()
  if (query)    params.append('q', query)
  if (location) params.append('location', location)
  if (remote)   params.append('remote', 'true')

  const res = await fetch(`/api/search?${params.toString()}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('Invalid response')
  return {
    jobs: data as Job[],
    source:    res.headers.get('X-Jobs-Source') ?? 'unknown',
    liveCount: Number(res.headers.get('X-Live-Count') ?? 0),
  }
}

// ─── Autocomplete hook ────────────────────────────────────────────────────────
function useAutocomplete(value: string, list: string[], minLen = 1) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  useEffect(() => {
    if (value.trim().length < minLen) { setSuggestions([]); return }
    const lower = value.toLowerCase()
    setSuggestions(list.filter(s => s.toLowerCase().includes(lower)).slice(0, 7))
  }, [value, list, minLen])
  return suggestions
}

// ─── Autocomplete Input component ────────────────────────────────────────────
function AutocompleteInput({
  value, onChange, placeholder, icon: Icon, suggestions, onSelect, id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  icon: any
  suggestions: string[]
  onSelect: (v: string) => void
  id: string
}) {
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(suggestions.length > 0 && value.trim().length > 0)
    setActiveIdx(-1)
  }, [suggestions, value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)) }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); onSelect(suggestions[activeIdx]); setOpen(false) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-center gap-3 bg-zinc-50/50 hover:bg-zinc-50 border border-transparent focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 rounded-2xl px-5 py-4 transition-all duration-300">
        <Icon className="w-5 h-5 text-zinc-400 shrink-0" />
        <input
          id={id}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="bg-transparent text-zinc-900 w-full placeholder-zinc-400 outline-none text-base font-medium"
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(false) }} className="text-zinc-300 hover:text-zinc-500 transition-colors ml-auto shrink-0 text-lg leading-none">×</button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <li key={s}>
                <button
                  onMouseDown={e => { e.preventDefault(); onSelect(s); setOpen(false) }}
                  className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                    i === activeIdx ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {s}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Dashboard Content ────────────────────────────────────────────────────────
function DashboardContent() {
  const searchParams = useSearchParams()

  const [query,          setQuery]         = useState(searchParams?.get('q') || '')
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams?.get('q') || '')
  const [location,       setLocation]      = useState(searchParams?.get('location') || '')
  const [debouncedLoc,   setDebouncedLoc]  = useState(searchParams?.get('location') || '')
  const [filterRemote,   setFilterRemote]  = useState(searchParams?.get('remote') === 'true')
  const [filterJobType,  setFilterJobType] = useState('all')

  // 400ms debounce for both inputs
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLoc(location), 400)
    return () => clearTimeout(t)
  }, [location])

  // Autocomplete suggestions
  const roleSuggestions = useAutocomplete(query, JOB_ROLE_SUGGESTIONS)
  const citySuggestions = useAutocomplete(location, INDIAN_CITIES)

  // ── React Query: auto-retry 3×, cache 5 min ──────────────────────────────
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['jobs', debouncedQuery, debouncedLoc, filterRemote],
    queryFn:  () => fetchJobs(debouncedQuery, debouncedLoc, filterRemote),
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 8000),
    staleTime: 5 * 60 * 1000,
    placeholderData: prev => prev, // keeps old data while refetching
  })

  const jobs: Job[]   = data?.jobs ?? []
  const apiSource     = data?.source ?? ''
  const liveCount     = data?.liveCount ?? 0
  const isFallback    = liveCount === 0 && jobs.length > 0

  const displayJobs = jobs.filter(j =>
    filterJobType === 'all' || j.job_type.toLowerCase() === filterJobType
  )
  const indiaCount = displayJobs.filter(j => j.india_relevant).length

  return (
    <div className="min-h-screen text-zinc-900 font-sans relative selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden">

      {/* Background */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[150px] left-[50%] -translate-x-[50%] w-[1200px] h-[500px] bg-gradient-to-br from-emerald-100/60 via-sky-100/40 to-indigo-100/30 blur-[100px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-md shadow-zinc-200 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">HireMind</span>
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/"       className="text-zinc-500 hover:text-zinc-900 transition-colors">Home</Link>
            <Link href="/market" className="text-zinc-500 hover:text-zinc-900 transition-colors">Market Intel</Link>
            <a href="#" className="bg-zinc-900 text-white px-5 py-2.5 rounded-full hover:bg-emerald-600 transition-all duration-300 shadow-sm">
              Post a Role
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-sm text-xs font-semibold text-emerald-600 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live India-First Job Search
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 mb-5 leading-[1.1]">
            Find roles that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">define the future.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Curated opportunities for premium tech talent across India and beyond.
          </motion.p>
        </div>

        {/* ── Search Command Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl p-3 border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 ring-1 ring-black/[0.02]"
        >
          <div className="flex flex-col md:flex-row gap-3">

            {/* Job Title Autocomplete */}
            <AutocompleteInput
              id="job-search-input"
              value={query}
              onChange={setQuery}
              onSelect={v => { setQuery(v); setDebouncedQuery(v) }}
              placeholder="Search job title, skills, or company..."
              icon={Search}
              suggestions={roleSuggestions}
            />

            {/* City Autocomplete */}
            <div className="md:w-64">
              <AutocompleteInput
                id="city-search-input"
                value={location}
                onChange={setLocation}
                onSelect={v => { setLocation(v); setDebouncedLoc(v) }}
                placeholder="City (e.g. Bangalore)"
                icon={MapPin}
                suggestions={citySuggestions}
              />
            </div>

            {/* Remote Toggle */}
            <button
              id="remote-toggle"
              onClick={() => setFilterRemote(r => !r)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                filterRemote
                  ? 'bg-emerald-50 border-transparent text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-zinc-50 border border-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              <Globe className={`w-5 h-5 ${filterRemote ? 'text-emerald-500' : 'text-zinc-400'}`} />
              Remote
            </button>
          </div>

          {/* Job Type Pills */}
          <div className="flex items-center gap-3 mt-4 px-2 pb-1 overflow-x-auto">
            {['all', 'full-time', 'contract', 'internship'].map(type => (
              <button
                key={type}
                id={`filter-${type}`}
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

        {/* ── Status & Alerts ── */}
        <AnimatePresence mode="wait">
          {isError && !isFetching && (
            <motion.div key="error"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-2xl mb-6 text-sm font-medium flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span>Live job sources unreachable after 3 retries. Showing curated Indian company listings below.</span>
              </div>
              <button onClick={() => refetch()} id="retry-btn"
                className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </motion.div>
          )}

          {!isError && isFallback && !isLoading && (
            <motion.div key="fallback"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 shadow-sm"
            >
              <Info className="w-4 h-4 shrink-0" />
              Live APIs returned no results — showing curated Indian tech company listings.
              Add <code className="mx-1 text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">ADZUNA_APP_ID</code> &amp;
              <code className="mx-1 text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">ADZUNA_APP_KEY</code> in your <code className="mx-1 text-xs bg-amber-100 px-1.5 py-0.5 rounded font-mono">.env</code> for 250 live results/day.
            </motion.div>
          )}

          {!isError && !isFallback && liveCount > 0 && !isLoading && (
            <motion.div key="live"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl mb-6 text-sm font-medium flex items-center gap-3 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span><strong>{liveCount}</strong> live jobs fetched · <strong>{indiaCount}</strong> India-relevant listings shown first</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Count Row */}
        <div className="flex justify-between items-center mb-6 px-1">
          <p className="text-zinc-500 text-sm font-medium">
            {isLoading || isFetching ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin inline-block" /> Scanning Indian job market...</span>
            ) : (
              <span>
                <strong className="text-zinc-900 font-bold">{displayJobs.length}</strong> roles found
                {indiaCount > 0 && (
                  <span className="ml-2 text-emerald-600 font-semibold">· <span className="font-bold">{indiaCount}</span> 🇮🇳 India-relevant</span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* ── Job Cards Grid ── */}
        {isLoading && !data ? (
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-[32px] p-16 text-center border border-zinc-200/60 shadow-sm max-w-2xl mx-auto mt-10">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-zinc-100">
              <Search className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">No matching roles</h3>
            <p className="text-zinc-500 text-lg">Try a different title or clear the location filter.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {displayJobs.map((job, i) => {
                const srcMeta = SOURCE_LABELS[job.source] ?? { label: job.source, color: 'bg-zinc-100 text-zinc-500 border-zinc-200' }
                return (
                  <motion.div
                    layout
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`group bg-white rounded-[24px] p-6 border shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                      job.india_relevant ? 'border-emerald-100/60' : 'border-zinc-200/60'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-[16px] bg-zinc-50 border border-zinc-100 flex items-center justify-center font-bold text-2xl text-zinc-900 shrink-0">
                          {job.company[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-zinc-900 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2 pr-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                            <p className="text-sm font-medium text-zinc-500">{job.company}</p>
                          </div>
                        </div>
                      </div>
                      {/* Source Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${srcMeta.color}`}>
                        {srcMeta.label}
                      </span>
                    </div>

                    {/* Meta Tags */}
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
                      {job.remote && (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-2.5 py-1.5 bg-sky-50 border border-sky-100 text-sky-700 rounded-lg">
                          <Globe className="w-3.5 h-3.5 text-sky-400" /> Remote
                        </span>
                      )}
                    </div>

                    {/* Skills */}
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

                    {/* Apply CTA */}
                    <div className="mt-auto">
                      {job.apply_link ? (
                        <a
                          href={job.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`apply-btn-${job.id}`}
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
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Provider wrapper ─────────────────────────────────────────────────────────
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </QueryClientProvider>
  )
}
