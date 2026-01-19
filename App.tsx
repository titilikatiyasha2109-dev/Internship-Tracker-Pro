import { Users, BookOpen, Download, Plus, MessageSquare, Linkedin, ExternalLink } from 'lucide-react';
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

const [contacts, setContacts] = useState(() => {
  const saved = localStorage.getItem('itp_contacts');
  return saved ? JSON.parse(saved) : [
    { id: 1, name: 'Sarah Chen', company: 'Google', role: 'Technical Recruiter', link: '#' }
  ];
});

const [interviews, setInterviews] = useState(() => {
  const saved = localStorage.getItem('itp_interviews');
  return saved ? JSON.parse(saved) : [
    { id: 1, company: 'Meta', date: 'Oct 12', questions: 'System design, React hooks', rating: 4 }
  ];
});

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
  //Handle Add contact
const handleAddContact = () => {
  const name = prompt("Enter Contact Name:");
  const company = prompt("Enter Company:");
  const role = prompt("Enter Role (e.g. Recruiter):");
  const contactNo = prompt("Contact Number / LinkedIn:");

  if (name && company) {
    const newContact = {
      id: Date.now(), // Unique ID generator
      name,
      company,
      role: contactNo || 'N/A', // Storing contact/link here
      link: contactNo?.startsWith('http') ? contactNo : '#'
    };
    setContacts(prev => [...prev, newContact]);
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('saved'), 800);
  }
};
  const updateStatus = (id: string, newStatus: ApplicationStatus) => {
    setApplications(prev => prev.map(app => 
      app.id === id ? { ...app, status: newStatus, lastUpdate: new Date().toISOString() } : app
    ));
  };

//Handle Add Interview
const handleAddInterview = async () => {
  const company = prompt("Company Name:");
  const questions = prompt("Which question was asked?");
  const rating = prompt("Rate your performance (1-5):");

  if (company && questions) {
    setSyncStatus('syncing');

    let geminiAnswer = "AI is thinking...";

    try {
      // Yahan hum Gemini API ko call kar rahe hain
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Provide a short, 2-sentence professional answer for this interview question: ${questions}` }] }]
        })
      });

      const data = await response.json();
      geminiAnswer = data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini Error:", error);
      geminiAnswer = "Could not fetch AI answer. Try checking your API key.";
    }

    const newInterview = {
      id: Date.now(),
      company,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      questions,
      rating: parseInt(rating) || 5,
      aiResponse: geminiAnswer // Gemini ka answer yahan store hoga
    };

    setInterviews(prev => [newInterview, ...prev]);
    setSyncStatus('saved');
  }
};

// App.tsx mein baaki useEffects ke saath daalein
useEffect(() => {
  localStorage.setItem('itp_contacts', JSON.stringify(contacts));
}, [contacts]);

useEffect(() => {
  localStorage.setItem('itp_interviews', JSON.stringify(interviews));
}, [interviews]);
// Save Interviews whenever they change
useEffect(() => {
  localStorage.setItem('interviews_data', JSON.stringify(interviews));
}, [interviews]);

// Initial Load mein ise bhi uthayein
useEffect(() => {
  const savedInterviews = localStorage.getItem('interviews_data');
  if (savedInterviews) setInterviews(JSON.parse(savedInterviews));
}, []);
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
          <div className="max-w-7xl mx-auto space-y-6 p-4 overflow-y-auto">
            {/* TOP ROW: Profile Settings & Deployment Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
              {/* 1. User Profile Settings (Your original logic, but better looking) */}
              <div className="bg-white dark:bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500"><Users size={20} /></div>
                   <h3 className="text-xl font-bold dark:text-white">Profile Intelligence</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={user.name} 
                      onChange={e => setUser({...user, name: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Primary Career Goal</label>
                    <input 
                      type="text" 
                      value={user.goal} 
                      onChange={e => setUser({...user, goal: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none focus:ring-2 ring-indigo-500 text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                </div>
              </div>
                  
              {/* 2. Deployment Status & Integrations (Merged) */}
              <div className="space-y-6">
                <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                  <h4 className="font-black text-xl mb-2 italic">Deployment Status</h4>
                  <p className="text-indigo-100 text-sm mb-6">Database is synced to cloud storage.</p>
                  <div className="flex gap-3">
                    <div className="px-4 py-2 bg-white/20 rounded-xl font-bold text-[10px] uppercase">Vercel Ready</div>
                    <div className="px-4 py-2 bg-emerald-400 text-indigo-900 rounded-xl font-black text-[10px] uppercase">Production Live</div>
                  </div>
                </div>
                  
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] p-6 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <MessageSquare size={14} /> Gemini Strategy Insight
                  </div>
                  <p className="text-indigo-100/70 text-xs leading-relaxed italic">
                    "Goal: {user.goal}. Gemini suggests adding 2 more FAANG contacts to your CRM this week to increase offer probability by 15%."
                  </p>
                </div>
              </div>
            </div>
                  
            {/* MIDDLE ROW: NETWORKING CRM */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Linkedin size={20} /></div>
                  <h2 className="text-xl font-bold dark:text-white">Networking CRM</h2>
                </div>
                <button 
                onClick={handleAddContact} 
                className="p-4 border-2 border-dashed               border-slate-200 dark:border-slate-800 rounded-2xl              flex items-center justify-center gap-2              text-slate-400 hover:border-indigo-500            hover:text-indigo-500 transition-all">             
                <Plus size={16} /> <span className="text-xs               font-bold uppercase">Add Expert</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="...">
                <div className="text-white font-bold">{contact.name}</div>
              </div>
              ))}
            </div>
                  

            </div>
                  
            {/* BOTTOM ROW: INTERVIEW KNOWLEDGE VAULT */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><BookOpen size={20} /></div>
                <h2 className="text-xl font-bold dark:text-white">Interview Knowledge Vault</h2>
              </div>
                  <button 
                    onClick={handleAddInterview}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <Plus size={20} />
                  </button>
              <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
                     <tr>
                       <th className="p-4">Company</th>
                       <th className="p-4">Key Questions Noted</th>
                       <th className="p-4 text-center">Status</th>
                     </tr>
                   </thead>
                   <tbody>
                    {interviews.map((item) => (
                      <tr key={item.id} className="...">
                        <td className="p-4 font-bold">{item.company}</td>
                        </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
            </div>
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
