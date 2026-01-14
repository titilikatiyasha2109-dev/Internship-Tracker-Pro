
import React from 'react';
import { InternshipApplication, ApplicationStatus } from '../types';
import { motion } from 'framer-motion';

interface KanbanViewProps {
  applications: InternshipApplication[];
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ applications, onStatusChange }) => {
  const columns = Object.values(ApplicationStatus);

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
      {columns.map((status) => (
        <div key={status} className="min-w-[320px] flex-1">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                status === ApplicationStatus.OFFER ? 'bg-emerald-500' :
                status === ApplicationStatus.REJECTED ? 'bg-rose-500' :
                status === ApplicationStatus.INTERVIEWING ? 'bg-amber-500' :
                'bg-indigo-500'
              }`}></span>
              {status}
              <span className="ml-2 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px]">
                {applications.filter(a => a.status === status).length}
              </span>
            </h3>
          </div>
          
          <div className="space-y-4 min-h-[500px] bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            {applications.filter(a => a.status === status).map((app) => (
              <motion.div
                layoutId={app.id}
                key={app.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
              >
                <div className="font-bold text-slate-900 dark:text-white mb-1">{app.company}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-4">{app.role}</div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </div>
                  <div className="flex gap-1">
                    {columns.filter(s => s !== status).map(s => (
                      <button
                        key={s}
                        onClick={() => onStatusChange(app.id, s)}
                        title={`Move to ${s}`}
                        className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-indigo-500 hover:text-white flex items-center justify-center text-[10px] transition-colors"
                      >
                        {s.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
