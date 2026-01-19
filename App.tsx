import { Users, BookOpen, Download, Plus, MessageSquare, Linkedin, Mail, Phone, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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
  // --- 1. GOOGLE IDENTITY INITIALIZATION ---
  const handleGoogleLogin = (response: any) => {
    console.log("Google token:", response.credential);
    alert("Login successful!");
  };

  useEffect(() => {
    const initGoogle = () => {
      const google = (window as any).google;
      if (google && google.accounts) {
        google.accounts.id.initialize({
          //@ts-ignore
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });
        const btn = document.getElementById("googleSignInBtn");
        if (btn) {
          google.accounts.id.renderButton(btn, { theme: "outline", size: "large" });
        }
      } else {
        setTimeout(initGoogle, 500);
      }
    };
    initGoogle();
  }, []);

  // --- 2. STATE INITIALIZATION ---
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('itp_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  const [interviews, setInterviews] = useState(() => {
    const saved = localStorage.getItem('itp_interviews');
    return saved ? JSON.parse(saved) : [
      { id: 1, company: 'Meta', date: 'Oct 12', questions: 'How do you scale React apps?', rating: 4, aiResponse: 'Focus on code-splitting and state management optimization.' }
    ];
  });

  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [user, setUser] = useState<UserProfile>({ name: 'Future Intern', goal: 'Land a top-tier tech internship', targetIndustry: 'Technology' });
  const [showForm, setShowForm] = useState(false);
  // Removed 'list' from view type
  const [view, setView] = useState<'dashboard' | 'kanban' | 'calendar' | 'profile'>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved'>('idle');

  // --- 3. AUTO-SAVE & INITIAL LOAD ---
  useEffect(() => { localStorage.setItem('itp_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('itp_interviews', JSON.stringify(interviews)); }, [interviews]);

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

  // --- 4. HANDLERS ---
  const handleAddContact = () => {
    const name = prompt("Expert's Name:");
    const company = prompt("Company:");
    const email = prompt("Email:");
    const phone = prompt("Phone Number:");
    const linkedin = prompt("LinkedIn URL:");

    if (name && company) {
      const newContact = {
        id: Date.now(),
        name,
        company,
        email: email || 'No email',
        phone: phone || 'No phone',
        link: linkedin?.startsWith('http') ? linkedin : '#'
      };
      setContacts((prev: any) => [newContact, ...prev]);
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('saved'), 800);
    }
  };

  const handleAddInterview = async () => {
    const company = prompt("Company Name:");
    const questions = prompt("Which question was asked?");
    const rating = prompt("Rate your performance (1-5):");

    if (company && questions) {
      setSyncStatus('syncing');
      let geminiAnswer = "AI is generating feedback...";
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `Provide a short professional answer: ${questions}` }] }] })
        });
        const data = await response.json();
        geminiAnswer = data.candidates[0].content.parts[0].text;
      } catch (e) {
        geminiAnswer = "Could not fetch AI advice.";
      }

      const newEntry = {
        id: Date.now(),
        company,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        questions,
        rating: parseInt(rating) || 5,
        aiResponse: geminiAnswer
      };
      setInterviews((prev: any) => [newEntry, ...prev]);
      setSyncStatus('saved');
    }
  };

  const handleDeleteContact = (id: number) => {
    if (window.confirm("Remove this expert?")) {
      setContacts((prev: any) => prev.filter((c: any) => c.id !== id));
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('saved'), 800);
    }
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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
      case 'calendar':
        return <CalendarView applications={applications} />;
      case 'profile':
        return (
          <div className="max-w-7xl mx-auto space-y-10 p-4 pb-20">
            {/* PROFILE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500"><Users size={22} /></div>
                   <h3 className="text-xl font-black dark:text-white uppercase tracking-tight">Profile Strategy</h3>
                </div>
                <div className="space-y-6">
                  <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none text-slate-900 dark:text-white font-bold" placeholder="Name" />
                  <input type="text" value={user.goal} onChange={e => setUser({...user, goal: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border-none text-slate-900 dark:text-white font-bold" placeholder="Career Goal" />
                </div>
              </div>
              <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <h4 className="font-black text-2xl mb-2 italic">Database Synced</h4>
                <p className="text-indigo-100 text-sm mb-6 opacity-80">Your networking contacts and interview vault are stored locally.</p>
              </div>
            </div>

            {/* NETWORKING CRM */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500"><Linkedin size={22} /></div>
                  <h2 className="text-2xl font-black dark:text-white tracking-tight">Networking Hub</h2>
                </div>
                <button onClick={handleAddContact} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><Plus size={24} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact: any) => (
                  <div key={contact.id} className="relative group p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-transparent hover:border-indigo-500/30 transition-all flex flex-col gap-5">
                    <button onClick={() => handleDeleteContact(contact.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl">{contact.name[0]}</div>
                      <div>
                        <div className="text-sm font-black dark:text-white">{contact.name}</div>
                        <div className="text-[10px] text-indigo-500 uppercase font-black">{contact.company}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
                       <div className="flex items-center gap-2"><Mail size={12} /> {contact.email}</div>
                       <div className="flex items-center gap-2"><Phone size={12} /> {contact.phone}</div>
                    </div>
                  </div>
                ))}
                <button onClick={handleAddContact} className="p-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 transition-all">
                  <Plus size={32} /> <span className="text-[10px] font-black uppercase">Add New Expert</span>
                </button>
              </div>
            </div>

            {/* INTERVIEW VAULT ( handleGenerateAI logic removed ) */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500"><BookOpen size={22} /></div>
                  <h2 className="text-2xl font-black dark:text-white tracking-tight">Interview Knowledge Vault</h2>
                </div>
                <button onClick={handleAddInterview} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-indigo-500"><Plus size={24} /></button>
              </div>
              <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                     <tr>
                       <th className="p-5">Company</th>
                       <th className="p-5">Questions & AI Response</th>
                       <th className="p-5 text-center">Score</th>
                     </tr>
                   </thead>
                   <tbody className="dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
                     {interviews.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="p-5 font-black dark:text-white text-base">{item.company}</td>
                        <td className="p-5">
                          <div className="font-bold mb-1">"{item.questions}"</div>

                        </td>
                        <td className="p-5 text-center">
                          <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black">{item.rating}/5</span>
                        </td>
                      </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-10 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">I</div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">InternTrack<span className="text-indigo-500 italic">Pro</span></h1>
        </div>
        <nav className="flex-1 px-6 space-y-2">
          {/* Removed 'Pipeline' from navigation array */}
          {[{ id: 'dashboard', label: 'Dashboard' }, { id: 'kanban', label: 'Kanban Board' }, { id: 'calendar', label: 'Timeline' }, { id: 'profile', label: 'Database' }].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id as any)} className={`w-full text-left px-6 py-4 rounded-2xl font-bold transition-all ${view === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'}`}>{tab.label}</button>
          ))}
        </nav>
        <div className="p-8">
           {syncStatus === 'syncing' && <div className="text-indigo-500 font-bold text-[10px] uppercase animate-pulse">Saving...</div>}
           {syncStatus === 'saved' && <div className="text-emerald-500 font-bold text-[10px] uppercase">Synced ✅</div>}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-40 flex items-center justify-between px-10 py-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{view === 'profile' ? 'Intelligence Hub' : view.charAt(0).toUpperCase() + view.slice(1)}</h2>
          <div className="flex items-center gap-5">
            <div id="googleSignInBtn"></div>
            <ThemeToggle theme={theme} toggle={toggleTheme} />
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Log App</button>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {showForm && <ApplicationForm onSubmit={handleAddApplication} onCancel={() => setShowForm(false)} />}
    </div>
  );
};

export default App;