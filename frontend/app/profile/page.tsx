'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Briefcase, MapPin, Mail, Star, Plus, X,
  Upload, Brain, CheckCircle, Sparkles, TrendingUp,
  Edit3, Save, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
  'Django', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'GCP', 'Machine Learning', 'PyTorch', 'TensorFlow',
  'GraphQL', 'REST API', 'CI/CD', 'Git', 'Linux', 'Terraform',
]

const EXPERIENCE_OPTIONS = ['< 1 year', '1–2 years', '3–5 years', '5–8 years', '8+ years']
const ROLE_OPTIONS = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'ML Engineer', 'Data Scientist', 'DevOps Engineer', 'Product Manager']

function SkillTag({ skill, onRemove }: { skill: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/25 text-sm"
    >
      {skill}
      <button onClick={onRemove} className="hover:text-red-400 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/6 text-center">
      <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    location: 'San Francisco, CA',
    bio: 'Passionate software engineer with a love for building AI-powered products.',
    experience: '3–5 years',
    role: 'Full Stack Developer',
    remote: 'remote',
    skills: ['Python', 'React', 'Django', 'Docker', 'PostgreSQL'],
  })
  const [skillInput, setSkillInput] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState(false)
  const [missingSkills, setMissingSkills] = useState<string[]>([])
  const [detectedExp, setDetectedExp] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSavedState] = useState(false)
  const [activeSection, setActiveSection] = useState<'info' | 'skills' | 'resume'>('info')

  const addSkill = (s: string) => {
    const skill = s.trim()
    if (skill && !profile.skills.includes(skill)) {
      setProfile(p => ({ ...p, skills: [...p.skills, skill] }))
    }
    setSkillInput('')
  }

  const removeSkill = (skill: string) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))
  }

  const parseResume = () => {
    if (!resumeText.trim()) return
    setParsing(true)
    setTimeout(() => {
      const text = resumeText.toLowerCase()
      // Extract skills
      const found = SKILL_SUGGESTIONS.filter(s => text.includes(s.toLowerCase()))
      const currentLower = profile.skills.map(s => s.toLowerCase())
      const actuallyNew = found.filter(s => !currentLower.includes(s.toLowerCase()))
      
      // Extract experience
      let exp = profile.experience
      if (text.includes('fresher') || text.includes('intern') || text.includes('0 years')) exp = '< 1 year'
      else if (text.includes('5 years') || text.includes('senior')) exp = '5–8 years'
      else if (text.includes('2 years') || text.includes('3 years')) exp = '3–5 years'
      
      // Calculate 'missing' important skills not in resume
      const coreSkills = ['Python', 'React', 'Docker', 'AWS', 'JavaScript', 'TypeScript', 'Git']
      const missing = coreSkills.filter(s => !text.includes(s.toLowerCase()) && !currentLower.includes(s.toLowerCase()))

      setProfile(p => ({
        ...p,
        skills: [...new Set([...p.skills, ...found])],
        experience: exp
      }))
      setMissingSkills(missing)
      setDetectedExp(exp !== profile.experience ? exp : '')
      setParsing(false)
      setParsed(true)
    }, 1500)
  }

  const saveProfile = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSavedState(true)
      setTimeout(() => setSavedState(false), 3000)
    }, 1000)
  }

  const fitScore = Math.min(95, 50 + profile.skills.length * 5)
  const completeness = Math.round(
    ([profile.name, profile.location, profile.bio, profile.experience, profile.role].filter(Boolean).length / 5) * 50 +
    Math.min(profile.skills.length * 4, 50)
  )

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-30 border-b border-white/5 glass sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">HireMind <span className="gradient-text">AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">Dashboard</Link>
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Avatar + Stats */}
          <div className="space-y-5">
            {/* Avatar card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6 border border-white/6 text-center"
            >
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center text-white text-3xl font-black mx-auto">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-[#030712] flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
              <p className="text-violet-400 text-sm font-medium mb-2">{profile.role}</p>
              <div className="flex items-center justify-center gap-1 text-slate-500 text-xs">
                <MapPin className="w-3 h-3" /> {profile.location || 'Location not set'}
              </div>

              {/* Completeness bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">Profile Strength</span>
                  <span className={completeness >= 80 ? 'text-green-400' : completeness >= 60 ? 'text-amber-400' : 'text-slate-400'}>
                    {completeness}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              <StatCard label="Avg Fit Score" value={`${fitScore}%`} icon={Sparkles} color="text-violet-400" />
              <StatCard label="Skills" value={profile.skills.length} icon={Star} color="text-blue-400" />
              <StatCard label="Applications" value={3} icon={Briefcase} color="text-amber-400" />
              <StatCard label="Saved Jobs" value={5} icon={TrendingUp} color="text-green-400" />
            </motion.div>

            {/* Quick nav */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl border border-white/6 overflow-hidden"
            >
              {[
                { id: 'info', label: 'Personal Info', icon: User },
                { id: 'skills', label: 'Skills & Preferences', icon: Star },
                { id: 'resume', label: 'Resume Intelligence', icon: Upload },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id as any)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all border-b border-white/5 last:border-0 ${
                    activeSection === id
                      ? 'bg-violet-500/10 text-violet-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" /> {label}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </motion.div>
          </div>

          {/* Right: Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            {activeSection === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-3xl p-8 border border-white/6"
              >
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-violet-400" /> Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', key: 'name', icon: User, placeholder: 'Your name' },
                    { label: 'Email', key: 'email', icon: Mail, placeholder: 'your@email.com' },
                  ].map(({ label, key, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-slate-400 mb-1.5 block font-medium">{label}</label>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                        <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                        <input
                          value={(profile as any)[key]}
                          onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="bg-transparent text-white text-sm outline-none flex-1 placeholder-slate-600"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Location with datalist */}
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Location</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        list="india-cities"
                        value={profile.location}
                        onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                        placeholder="City, Country"
                        className="bg-transparent text-white text-sm outline-none flex-1 placeholder-slate-600"
                      />
                      <datalist id="india-cities">
                        <option value="Bangalore, India" />
                        <option value="Hyderabad, India" />
                        <option value="Mumbai, India" />
                        <option value="Pune, India" />
                        <option value="Delhi / NCR, India" />
                        <option value="Chennai, India" />
                        <option value="Remote India" />
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <select
                      value={profile.experience}
                      onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/50 transition-colors"
                    >
                      {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0F0F1A]">{o}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Target Role</label>
                    <select
                      value={profile.role}
                      onChange={e => setProfile(p => ({ ...p, role: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/50 transition-colors"
                    >
                      {ROLE_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0F0F1A]">{o}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-medium">Work Preference</label>
                    <div className="flex gap-2">
                      {['remote', 'hybrid', 'onsite'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => setProfile(p => ({ ...p, remote: opt }))}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all capitalize ${
                            profile.remote === opt
                              ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                              : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    placeholder="Tell companies about yourself..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-violet-500/50 transition-colors resize-none placeholder-slate-600"
                  />
                </div>
              </motion.div>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <motion.div
                key="skills"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-3xl p-8 border border-white/6"
              >
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-400" /> Skills & Expertise
                </h3>

                {/* Add skill */}
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-colors">
                    <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSkill(skillInput)}
                      placeholder="Add a skill..."
                      className="bg-transparent text-white text-sm outline-none flex-1 placeholder-slate-600"
                    />
                  </div>
                  <button
                    onClick={() => addSkill(skillInput)}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Add
                  </button>
                </div>

                {/* Current skills */}
                <div className="flex flex-wrap gap-2 mb-6 min-h-[60px]">
                  {profile.skills.length === 0 && (
                    <p className="text-slate-600 text-sm">No skills added yet. Add or pick from suggestions below.</p>
                  )}
                  {profile.skills.map(s => (
                    <SkillTag key={s} skill={s} onRemove={() => removeSkill(s)} />
                  ))}
                </div>

                {/* Suggestions */}
                <div>
                  <p className="text-xs text-slate-500 mb-3 font-medium">Quick Add — Popular Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {SKILL_SUGGESTIONS
                      .filter(s => !profile.skills.includes(s))
                      .slice(0, 16)
                      .map(s => (
                        <button
                          key={s}
                          onClick={() => addSkill(s)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-white/10 text-slate-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/10 transition-all"
                        >
                          + {s}
                        </button>
                      ))
                    }
                  </div>
                </div>

                {/* AI Fit preview */}
                <div className="mt-6 glass-brand rounded-2xl p-5 border border-violet-500/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-violet-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Estimated Fit Score
                    </span>
                    <span className="text-2xl font-black gradient-text">{fitScore}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${fitScore}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Add more skills to improve your average match score across all jobs.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Resume */}
            {activeSection === 'resume' && (
              <motion.div
                key="resume"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-3xl p-8 border border-white/6"
              >
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" /> Resume Intelligence
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Paste your resume text below. AI will extract your skills and auto-update your profile.
                </p>

                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  rows={10}
                  placeholder={`Paste your resume here...\n\nExample:\nExperienced Python developer with 4 years of experience building web applications using Django, FastAPI, and PostgreSQL. Proficient in Docker, Kubernetes, and AWS cloud services. Machine learning background with PyTorch and scikit-learn...`}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-violet-500/50 transition-colors resize-none placeholder-slate-600 mb-4 font-mono"
                />

                <button
                  onClick={parseResume}
                  disabled={!resumeText.trim() || parsing}
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {parsing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" /> Extract Skills with AI
                    </>
                  )}
                </button>

                {parsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-green-400 text-sm glass-brand border border-green-500/20 p-3 rounded-xl bg-green-500/5">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <div>
                        <p className="font-medium">Resume parsed successfully</p>
                        <p className="text-xs text-slate-400 mt-0.5">Skills added to your profile.</p>
                      </div>
                    </div>
                    
                    {detectedExp && (
                      <div className="glass border border-white/10 p-3 rounded-xl flex items-center gap-2 text-sm text-white">
                        <Briefcase className="w-4 h-4 text-violet-400" />
                        Detected Experience Level: <span className="font-bold text-violet-300">{detectedExp}</span>
                      </div>
                    )}

                    {missingSkills.length > 0 && (
                      <div className="glass border border-amber-500/20 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4" /> AI Recommendation
                        </h4>
                        <p className="text-xs text-slate-400 mb-3">
                          Top tech jobs in your field often require these skills. Consider learning them to boost your match score:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {missingSkills.map(s => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
