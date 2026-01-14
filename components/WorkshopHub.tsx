
import React from 'react';
import { InternshipApplication, ApplicationStatus } from '../types';

interface WorkshopHubProps {
  applications: InternshipApplication[];
}

interface Resource {
  title: string;
  description: string;
  link: string;
  tag: string;
  icon: React.ReactNode;
  color: string;
}

const resources: Resource[] = [
  {
    title: "Google Interview Warmup",
    description: "Practice answering key interview questions and get insights into your answers using AI.",
    link: "https://grow.google/certificates/interview-warmup/",
    tag: "Preparation",
    color: "bg-blue-500",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
  },
  {
    title: "Google Tech Dev Guide",
    description: "Comprehensive guides for software engineering, including data structures and algorithms.",
    link: "https://techdevguide.withgoogle.com/",
    tag: "Technical",
    color: "bg-emerald-500",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
  },
  {
    title: "Grow with Google",
    description: "Professional certificates and training in UX design, Data Analytics, and Project Management.",
    link: "https://grow.google/",
    tag: "Certification",
    color: "bg-amber-500",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  },
  {
    title: "Cloud Skills Boost",
    description: "Hands-on labs and training for Google Cloud Platform technologies and certifications.",
    link: "https://www.cloudskillsboost.google/",
    tag: "Cloud",
    color: "bg-indigo-500",
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
  }
];

export const WorkshopHub: React.FC<WorkshopHubProps> = ({ applications }) => {
  const isInterviewing = applications.some(a => a.status === ApplicationStatus.INTERVIEWING);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Google Career Workshop</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Enhance your job hunt with official Google resources. From technical prep to interview simulation, 
            everything you need to land your next internship.
          </p>
          {isInterviewing && (
            <div className="mt-6 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl text-amber-400 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Recommended: You have active interviews! Use Interview Warmup.
            </div>
          )}
        </div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, i) => (
          <a 
            key={i} 
            href={res.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group bg-slate-800/40 border border-slate-700 p-6 rounded-3xl hover:border-slate-500 hover:bg-slate-800/60 transition-all duration-300 flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl ${res.color} bg-opacity-10 text-white shadow-lg`}>
                {res.icon}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-700">
                {res.tag}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{res.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed flex-1">{res.description}</p>
            <div className="mt-6 flex items-center text-indigo-400 text-sm font-bold gap-2">
              Explore Resource
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </a>
        ))}
      </div>
      
      <div className="bg-slate-900/50 border border-dashed border-slate-700 p-8 rounded-3xl text-center">
        <p className="text-slate-500 text-sm italic">
          "The best way to predict your future is to create it." — Curated for your growth.
        </p>
      </div>
    </div>
  );
};
