'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const MARKET_SIGNALS = [
  "New role at OpenAI just indexed.",
  "React Native salaries updated.",
  "Stripe is actively reviewing applicants."
];

export function MarketTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MARKET_SIGNALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-center py-2 px-4 bg-zinc-50 dark:bg-[#1a1a1a] border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="flex items-center gap-2 max-w-full overflow-hidden">
        <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <span className="text-[11px] font-bold uppercase text-zinc-400 dark:text-zinc-500 hidden sm:inline-block shrink-0">
          Live Signal
        </span>
        
        {/* Fade Transition instead of marquee for better mobile UX */}
        <div className="relative h-[18px] flex-1 overflow-hidden min-w-[200px]">
          <AnimatePresence mode="popLayout">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate"
            >
              {MARKET_SIGNALS[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
