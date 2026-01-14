
import React, { useState, useEffect } from 'react';
import { InternshipApplication, UserProfile } from '../types';
import { getAIInsights } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface AIInsightsProps {
  applications: InternshipApplication[];
  user: UserProfile;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ applications, user }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<{ summary: string; tips: string[] } | null>(null);

  const fetchInsights = async () => {
    if (applications.length === 0) return;
    setLoading(true);
    const data = await getAIInsights(applications, user);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    if (applications.length > 0 && !insights) {
      fetchInsights();
    }
  }, [applications]);

  if (applications.length === 0) {
    return (
      <div className="bg-white dark:bg-indigo-950/20 border border-slate-200 dark:border-indigo-500/30 p-10 rounded-[2.5rem] text-center shadow-sm">
        <p className="text-slate-500 dark:text-indigo-200 font-medium">Hey {user.name}! Add some applications to unlock your personalized career strategy!</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-1 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 relative overflow-hidden group"
    >
      <div className="bg-white dark:bg-slate-950 rounded-[2.4rem] p-8 lg:p-10">
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={fetchInsights}
            disabled={loading}
            className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-full disabled:opacity-50 transition-all active:rotate-180 duration-500"
            title="Refresh Insights"
          >
            <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10">
             <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Strategy for {user.name}</h2>
            
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 animate-pulse py-4"
                >
                  <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/2"></div>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <p className="text-slate-600 dark:text-indigo-100 text-xl font-medium leading-relaxed italic">
                    "{insights?.summary}"
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {insights?.tips.map((tip, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 items-start bg-slate-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/5 dark:border-indigo-500/10 hover:border-indigo-500/40 transition-all cursor-default"
                      >
                        <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                          {i + 1}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-semibold text-sm leading-snug">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
