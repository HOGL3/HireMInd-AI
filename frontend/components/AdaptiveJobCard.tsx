'use client'
import { motion } from 'framer-motion';
import { Building2, MapPin, ChevronRight, Check, X } from 'lucide-react';

// PrecisionFit component extracted directly inside this file for simplicity since it's used closely with JobCards
export function PrecisionFit({ requiredSkills, userSkills }: { requiredSkills: string[], userSkills: string[] }) {
  const matchCount = requiredSkills.filter(s => userSkills.includes(s)).length;
  const matchPct = Math.round((matchCount / requiredSkills.length) * 100);

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
          Precision Fit
        </span>
        <span className={`text-xs font-black ${matchPct >= 80 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500'}`}>
          {matchPct}%
        </span>
      </div>

      {/* Desktop: Visual Progress Bar */}
      <div className="hidden md:flex h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${matchPct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
          style={{ width: `${matchPct}%` }} 
        />
      </div>

      {/* Mobile: Compact visual pills */}
      <div className="flex md:hidden flex-wrap gap-1">
        {requiredSkills.map(skill => {
          const isMatch = userSkills.includes(skill);
          return (
            <div 
              key={skill}
              className={`flex items-center justify-center h-6 px-2 rounded-[4px] border ${
                isMatch 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                  : 'bg-zinc-50 dark:bg-[#1a1a1a] border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {isMatch ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1 opacity-50" />}
              <span className="text-[10px] font-bold uppercase">{skill}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdaptiveJobCard({ job, userSkills = ['Python', 'Docker', 'React'] }: { job: any, userSkills?: string[] }) {
  // Mobile: Show only top 3 skills to prevent vertical crowding
  const displaySkills = job.skills.slice(0, 3);
  const remainingSkills = job.skills.length - 3;

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="group relative flex flex-col p-4 md:p-5 rounded-[6px] bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-colors shadow-sm cursor-pointer z-10"
    >
      {/* Desktop Hover Glow Effect */}
      <div className="absolute inset-0 rounded-[6px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300" />
      
      {/* Main Info */}
      <div className="flex flex-col gap-1.5 md:gap-1 z-10 w-full mb-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
            {job.title}
          </h3>
          {job.verified && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 text-[10px] font-black uppercase tracking-tighter shrink-0">
              <Check className="w-3 h-3" /> Verified
            </div>
          )}
        </div>
        
        {/* Metadata Stack */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-[13px] md:text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> {job.company}
          </span>
          <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {job.location} · {job.type || 'Full-time'}
          </span>
        </div>
      </div>

      {/* Skills & Action Stack */}
      <div className="mt-auto flex items-center justify-between md:gap-6 z-10 w-full md:w-auto pt-3">
        {/* Mobile: Top 3 Tags | Desktop: Full Tags (handled by wrap) */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {displaySkills.map((skill: string) => (
            <span key={skill} className="px-2 py-1 rounded-[4px] bg-zinc-100 dark:bg-[#242424] text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide border border-zinc-200/50 dark:border-zinc-700/50">
              {skill}
            </span>
          ))}
          {remainingSkills > 0 && (
            <span className="md:hidden px-2 py-1 rounded-[4px] text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
              +{remainingSkills}
            </span>
          )}
          {job.skills.slice(3).map((skill: string) => (
            <span key={skill} className="hidden md:inline-block px-2 py-1 rounded-[4px] bg-zinc-100 dark:bg-[#242424] text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide border border-zinc-200/50 dark:border-zinc-700/50">
              {skill}
            </span>
          ))}
        </div>

        {/* 44px Min Tap Target for Mobile UX */}
        <button className="flex items-center justify-center min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:px-3 md:py-2 rounded-[4px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ml-2">
          <span className="hidden md:block text-sm font-semibold mr-1">View</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <PrecisionFit requiredSkills={job.skills} userSkills={userSkills} />
    </motion.div>
  );
}
