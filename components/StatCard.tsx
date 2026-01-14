
import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center transition-colors group-hover:scale-110 duration-300`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-wide uppercase">{label}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
};
