
import React, { useState } from 'react';
import { InternshipApplication, ApplicationStatus } from '../types';
import { motion } from 'framer-motion';

interface ApplicationFormProps {
  onSubmit: (app: Omit<InternshipApplication, 'id' | 'lastUpdate'>) => void;
  onCancel: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    status: ApplicationStatus.APPLIED,
    appliedDate: new Date().toISOString().split('T')[0],
    interviewDate: '',
    salary: '',
    url: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400";
  const labelClass = "block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Track New Opportunity</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Capture the details while they're fresh.</p>
            </div>
            <button 
              onClick={onCancel}
              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Company *</label>
                <input
                  required
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className={inputClass}
                  placeholder="e.g. NVIDIA"
                />
              </div>
              <div>
                <label className={labelClass}>Role *</label>
                <input
                  required
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className={inputClass}
                  placeholder="Software Engineer Intern"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as ApplicationStatus})}
                  className={`${inputClass} appearance-none`}
                >
                  {Object.values(ApplicationStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Applied Date</label>
                <input
                  type="date"
                  value={formData.appliedDate}
                  onChange={e => setFormData({...formData, appliedDate: e.target.value})}
                  className={inputClass}
                />
              </div>
            </div>

            {formData.status === ApplicationStatus.INTERVIEWING && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border-2 border-dashed border-amber-200 dark:border-amber-500/20"
              >
                <label className="block text-xs font-black text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-widest">Interview Schedule</label>
                <input
                  type="datetime-local"
                  value={formData.interviewDate}
                  onChange={e => setFormData({...formData, interviewDate: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-amber-100 dark:border-amber-500/30 rounded-2xl px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium"
                />
              </motion.div>
            )}

            <div>
              <label className={labelClass}>Application Link</label>
              <input
                type="url"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
                className={inputClass}
                placeholder="https://nvidia.com/careers/..."
              />
            </div>

            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-8 py-5 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-2 px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] hover:bg-indigo-500 transition-all font-black shadow-xl shadow-indigo-500/20 active:scale-95"
              >
                Log Opportunity
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};
