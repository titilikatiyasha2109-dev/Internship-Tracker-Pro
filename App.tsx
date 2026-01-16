
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InternshipApplication, ApplicationStatus, UserProfile } from './types';
import { dbService } from './services/dbService';
import { Dashboard } from './components/Dashboard';
import { ApplicationForm } from './components/ApplicationForm';
import { AIInsights } from './components/AIInsights';
import { CalendarView } from './components/CalendarView';
import { KanbanView } from './components/KanbanView';
import { ThemeToggle } from './components/ThemeToggle';



const App: React.FC = () => {
    const handleGoogleLogin = (response: any) => {
    console.log("Google token:", response.credential);
    alert("Login successful!");
  };
    useEffect(() => {
    if (!(window as any).google) return;

    (window as any).google.accounts.id.initialize({
      //@ts-ignore
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    (window as any).google.accounts.id.renderButton(
      document.getElementById("googleSignInBtn"),
      { theme: "outline", size: "large" }
    );
  }, []);
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [user, setUser] = useState<UserProfile>({ name: 'Future Intern', goal: 'Land a top-tier tech internship', targetIndustry: 'Technology' });
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'dashboard' | 'list' | 'kanban' | 'calendar' | 'profile'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved'>('idle');

  // Initial Load from DB Service
  useEffect(() => {
    const init = async () => {
      const savedApps = await dbService.getApplications();
      const savedUser = await dbService.getUser();
      setApplications(savedApps);
      setUser(savedUser);
    };
    init();

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // Save to DB Service
  useEffect(() => {
    if (applications.length > 0) {
      setSyncStatus('syncing');
      dbService.saveApplications(applications).then(() => setSyncStatus('saved'));
    }
  }, [applications]);

  useEffect(() => {
    dbService.saveUser(user);
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleAddApplication = (newApp: Omit<InternshipApplication, 'id' | 'lastUpdate'>) => {
    const appWithId: InternshipApplication = {
      ...newApp,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdate: new Date().toISOString()
    };
    setApplications(prev => [...prev, appWithId]);
    setShowForm(false);
  };

  const updateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus, lastUpdate: new Date().toISOString() } : app
    ));
  };


  const syncWithGoogle = async () => {
    setSyncStatus('syncing');
    await dbService.syncFromGoogleForm();
    setSyncStatus('saved');
    alert("Database synchronized with your Google Form / Sheet!");
  };

  const deleteApplication = (id: string) => {
    if (confirm('Permanently remove this application tracking?')) {
      setApplications(prev => prev.filter(app => app.id !== id));
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            <AIInsights applications={applications} user={user} />
            <Dashboard applications={applications} onViewCalendar={() => setView('calendar')} />
          </div>
        );
      case 'kanban':
        return <KanbanView applications={applications} onStatusChange={updateStatus} />;
      case 'list':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Company</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.length > 0 ? applications.map(app => (
                    <tr key={app.id} className="hover:bg-indigo-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{app.company}</td>
                      <td className="px-8 py-6 text-slate-600 dark:text-slate-300">{app.role}</td>
                      <td className="px-8 py-6">
                        <select 
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                          className="text-xs font-black px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700"
                        >
                          {Object.values(ApplicationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => deleteApplication(app.id)} className="p-2 text-slate-400 hover:text-rose-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">No applications logged yet. Click "Log App" to begin.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        );
      case 'calendar':
        return <CalendarView applications={applications} />;
      case 'profile':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">User Database Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-bold"/>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Primary Career Goal</label>
                    <input type="text" value={user.goal} onChange={e => setUser({...user, goal: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-bold"/>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20">
                  <h4 className="font-black text-2xl mb-2 italic">Deployment Status</h4>
                  <p className="text-indigo-100 text-sm mb-8">Your dashboard is active and synced to cloud storage.</p>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/20 rounded-xl font-bold text-xs">Vercel Ready</div>
                    <div className="px-4 py-2 bg-emerald-400 text-indigo-900 rounded-xl font-black text-xs">PRODUCTION LIVE</div>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h4 className="text-sm font-black text-slate-400 uppercase mb-6">Integrations</h4>
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs">G</div>
                        <span className="font-bold text-slate-900 dark:text-white">Google Identity</span>
                     </div>
                     <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs">AI</div>
                        <span className="font-bold text-slate-900 dark:text-white">Gemini Insights</span>
                     </div>
                     <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1"><div className="w-4 h-4 bg-white rounded-full"></div></div>
                   </div>
                </div>
              </div>
            </div>

            {/* <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-indigo-500/30">
              <div className="text-center md:text-left">
                <h4 className="font-black text-xl italic mb-1">Google Forms Sync</h4>
                <p className="text-slate-400 text-sm">Update your local database with external sheet responses.</p>
              </div>
              <button onClick={syncWithGoogle} className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95">
                Sync Pipeline
              </button>
            </div> */}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl hidden lg:flex flex-col sticky top-0 h-screen z-40">
        <div className="p-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-2xl">I</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">InternTrack<span className="text-indigo-500 italic">Pro</span></h1>
        </div>
        
        <nav className="flex-1 px-6 space-y-3">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'kanban', label: 'Kanban Board' },
            { id: 'list', label: 'Pipeline' },
            { id: 'calendar', label: 'Timeline' },
            { id: 'profile', label: 'Database' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as any)} 
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${view === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-4">
           {syncStatus === 'syncing' && <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase animate-pulse"><div className="w-2 h-2 rounded-full bg-indigo-500"></div>Saving to DB...</div>}
           {syncStatus === 'saved' && <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Database Synced</div>}
           <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-center">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Member</p>
             <p className="text-slate-900 dark:text-white font-black truncate text-sm">{user.name}</p>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
             <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">I</div>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize tracking-tight">
               {view === 'profile' ? 'Settings' : view === 'kanban' ? 'Visual Funnel' : view === 'calendar' ? 'Smart Calendar' : `Dashboard`}
             </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div id="googleSignInBtn"></div>
            <ThemeToggle theme={theme} toggle={toggleTheme} />
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
              Log App
            </button>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {showForm && <ApplicationForm onSubmit={handleAddApplication} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default App;
