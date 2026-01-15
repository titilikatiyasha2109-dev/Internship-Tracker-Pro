
import React, { useState, useEffect } from 'react';
import { InternshipApplication } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { googleCalendarService } from '../services/googleCalendarService';

interface CalendarViewProps {
  applications: InternshipApplication[];
}

// Access the global 'google' object from the script in index.html
declare const google: any;

export const CalendarView: React.FC<CalendarViewProps> = ({ applications }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncedIds, setSyncedIds] = useState<Set<string>>(new Set());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const valid = googleCalendarService.isTokenValid();
    setIsAuthenticated(valid);
    
    const savedSynced = localStorage.getItem('synced_calendar_events');
    if (savedSynced) {
      setSyncedIds(new Set(JSON.parse(savedSynced)));
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = () => {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        //@ts-ignore
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1009349046392-9c1idl0q30o1mn3joe77qvfeitmfeo5d.apps.googleusercontent.com', // Replace with real ID
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (response: any) => {
          if (response.access_token) {
            googleCalendarService.setAccessToken(response.access_token);
            setIsAuthenticated(true);
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error("Google Auth Initialization Error:", err);
      alert("Failed to initialize Google Login. Ensure you have provided a valid Client ID in your environment variables.");
    }
  };

  const handleLogout = () => {
    googleCalendarService.logout();
    setIsAuthenticated(false);
    setSyncedIds(new Set());
  };

  const handleSync = async (app: InternshipApplication) => {
    if (!isAuthenticated) {
      handleLogin();
      return;
    }

    setSyncingId(app.id);
    const success = await googleCalendarService.createEvent(app);
    
    if (success) {
      const newSynced = new Set(syncedIds);
      newSynced.add(app.id);
      setSyncedIds(newSynced);
      localStorage.setItem('synced_calendar_events', JSON.stringify(Array.from(newSynced)));
    } else if (!googleCalendarService.isTokenValid()) {
      setIsAuthenticated(false);
      alert("Session expired. Please log in to Google again.");
    } else {
      alert("There was an error syncing to your Google Calendar. Please check your permissions.");
    }
    
    setSyncingId(null);
  };

  const events = applications
    .filter(app => app.interviewDate)
    .sort((a, b) => new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime());

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Calendar Sync</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Connect your Google account to manage interview dates.</p>
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Connection Active</span>
              <span className="text-xs text-slate-400">Google Calendar API V3</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black hover:bg-rose-500 hover:text-white transition-all shadow-sm"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-black text-slate-900 dark:text-white hover:border-indigo-500 hover:scale-[1.02] shadow-xl shadow-indigo-500/5 transition-all active:scale-95"
          >
            <svg className="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {events.length > 0 ? (
          events.map((app, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={app.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden relative"
            >
              <div className="flex items-center gap-8 w-full md:w-auto relative z-10">
                <div className="bg-indigo-600 dark:bg-indigo-500 p-5 rounded-3xl text-center min-w-[100px] shadow-lg shadow-indigo-500/20">
                  <div className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">
                    {new Date(app.interviewDate!).toLocaleString('default', { month: 'short' })}
                  </div>
                  <div className="text-white text-3xl font-black">
                    {new Date(app.interviewDate!).getDate()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase rounded-md">Interview Phase</span>
                     <span className="text-slate-400 text-xs font-bold">• {app.location || 'Location Pending'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                    {app.company}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">{app.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
                {!isAuthenticated ? (
                  <button
                    onClick={handleLogin}
                    className="w-full md:w-auto px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl"
                  >
                    Authorize & Sync
                  </button>
                ) : syncedIds.has(app.id) ? (
                  <div className="w-full md:w-auto px-10 py-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-sm flex items-center justify-center gap-3 border-2 border-emerald-500/30 backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Synced to Google
                  </div>
                ) : (
                  <button
                    onClick={() => handleSync(app)}
                    disabled={syncingId === app.id}
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 hover:scale-105 transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {syncingId === app.id ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Push to Calendar
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Decorative background element for events */}
              <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 p-24 rounded-[4rem] text-center shadow-inner">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 ring-8 ring-slate-100/50 dark:ring-slate-800/20">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No Interviews Scheduled</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium text-lg leading-relaxed">
              Log an interview for any application to unlock automated Google Calendar syncing.
            </p>
          </div>
        )}
      </div>
      
      {/* Help Card */}
      <div className="bg-indigo-600 p-1 rounded-[3rem] shadow-2xl shadow-indigo-500/20">
        <div className="bg-white dark:bg-slate-950 rounded-[2.8rem] p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem]">
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">How it works</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              We use official Google Calendar API V3. Once you sign in, we create a temporary access token locally in your browser. No data is stored on our servers; events are pushed directly from your browser to your Google account.
            </p>
          </div>
          <a 
            href="https://support.google.com/calendar/answer/37095" 
            target="_blank" 
            className="px-8 py-4 border-2 border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all whitespace-nowrap"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};
