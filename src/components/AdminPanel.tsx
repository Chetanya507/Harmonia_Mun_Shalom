import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Shield, 
  LogIn, 
  LogOut, 
  RefreshCw, 
  Save, 
  Trophy, 
  Activity, 
  Calendar, 
  Settings as SettingsIcon,
  Search,
  Filter,
  AlertCircle,
  Users,
  Plus,
  Trash2,
  Edit2,
  Layers,
  FileText,
  Upload,
  Image as ImageIcon,
  X,
  Bell,
  Eye,
  FileWarning,
  Share2
} from 'lucide-react';
import { Match, House, ScheduleItem, Category, Notice } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab = 'matches' | 'schedule' | 'houses' | 'categories' | 'brochure' | 'notices' | 'settings';

interface AdminPanelProps {
  matches: Match[];
  houses: House[];
  schedule: ScheduleItem[];
  categories: Category[];
  notices: Notice[];
  settings: Record<string, string>;
  refresh: () => void;
}

export default function AdminPanel({ matches, houses, schedule, categories, notices, settings, refresh }: AdminPanelProps) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('matches');
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings when settings prop changes
  React.useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = (key: string, val: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const saveAllSettings = async () => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Confirm Changes',
      message: 'Are you sure you want to save all configuration changes? This will update the live site immediately.',
      onConfirm: async () => {
        setLoading(true);
        try {
          const updates = Object.entries(localSettings).map(([key, val]) => ({
            key_name: key,
            val: val
          }));
          
          const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key_name' });
          if (error) throw error;
          
          setSuccess('All settings saved successfully!');
          setTimeout(() => setSuccess(null), 3000);
          refresh();
        } catch (err: any) {
          handleSupabaseError(err, 'Failed to save settings');
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const [noticeModal, setNoticeModal] = useState<{ isOpen: boolean; notice?: Notice } | null>(null);
  const [noticeFormData, setNoticeFormData] = useState({ title: '', content: '', priority: 'low' as 'low' | 'medium' | 'high' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setSession(data.session);
      setError(null);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  const handleSupabaseError = (err: any, context: string) => {
    console.error(`Error in ${context}:`, err);
    if (err.message?.includes('JWT expired') || err.message?.includes('invalid_token')) {
      setError('Your session has expired. Please log in again.');
      setSession(null);
    } else {
      setError(`${context}: ${err.message}`);
    }
    setLoading(false);
  };

  const checkSession = async () => {
    if (!supabase) return false;
    const { data: { session: currentSession }, error } = await supabase.auth.getSession();
    if (error || !currentSession) {
      setSession(null);
      setError('Session expired. Please log in again.');
      return false;
    }
    setSession(currentSession);
    return true;
  };

  const updateMatch = async (matchId: number, updates: Partial<Match>) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('matches').update(updates).eq('id', matchId);
    if (error) handleSupabaseError(error, 'Failed to update match');
    else {
      await supabase.rpc('recompute_points');
      refresh();
      setLoading(false);
    }
  };

  const addMatch = async () => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('matches').insert([{
      category_id: categories[0]?.id,
      match_no: matches.length + 1,
      team1_id: houses[0]?.id,
      team2_id: houses[1]?.id,
      status: 'upcoming',
      score1: 0,
      score2: 0
    }]);
    if (error) handleSupabaseError(error, 'Failed to add match');
    else {
      refresh();
      setLoading(false);
    }
  };

  const deleteMatch = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Match',
      message: 'Are you sure you want to delete this match? This action cannot be undone.',
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('matches').delete().eq('id', id);
        if (error) handleSupabaseError(error, 'Failed to delete match');
        else {
          refresh();
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const updateSchedule = async (itemId: number, updates: Partial<ScheduleItem>) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('schedule').update(updates).eq('id', itemId);
    if (error) handleSupabaseError(error, 'Failed to update schedule');
    else {
      refresh();
      setLoading(false);
    }
  };

  const addSchedule = async () => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('schedule').insert([{
      day_label: 'Day 1',
      day_date: 'April 10, 2026',
      time_start: '09:00 AM',
      title: 'New Event',
      status: 'upcoming',
      sort_order: schedule.length + 1
    }]);
    if (error) handleSupabaseError(error, 'Failed to add schedule item');
    else {
      refresh();
      setLoading(false);
    }
  };

  const deleteSchedule = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event',
      message: 'Are you sure you want to delete this event? This action cannot be undone.',
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('schedule').delete().eq('id', id);
        if (error) handleSupabaseError(error, 'Failed to delete schedule item');
        else {
          refresh();
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const updateHouse = async (houseId: string, updates: Partial<House>) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    setError(null);
    
    // Clean up numeric values
    if ('points' in updates && typeof updates.points === 'number' && isNaN(updates.points)) {
      updates.points = 0;
    }
    if ('rank_pos' in updates && typeof updates.rank_pos === 'number' && isNaN(updates.rank_pos)) {
      updates.rank_pos = 1;
    }

    const { error } = await supabase.from('houses').update(updates).eq('id', houseId);
    if (error) {
      handleSupabaseError(error, 'Failed to update house');
    } else {
      refresh();
      setLoading(false);
    }
  };

  const updateCategory = async (catId: string, updates: Partial<Category>) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('categories').update(updates).eq('id', catId);
    if (error) handleSupabaseError(error, 'Failed to update category');
    else {
      refresh();
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('categories').insert([{
      name: 'New Sport',
      icon: '',
      sort_order: categories.length + 1
    }]);
    if (error) handleSupabaseError(error, 'Failed to add category');
    else {
      refresh();
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This might affect matches linked to it.',
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) handleSupabaseError(error, 'Failed to delete category');
        else {
          refresh();
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const addHouse = async () => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('houses').insert([{
      name: 'New House',
      color: '#ffffff',
      mascot: '',
      points: 0,
      rank_pos: houses.length + 1,
      logo_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NewHouse',
      banner_url: 'https://picsum.photos/seed/house/1200/400'
    }]);
    if (error) handleSupabaseError(error, 'Failed to add house');
    else {
      refresh();
      setLoading(false);
    }
  };

  const deleteHouse = async (id: string) => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete House',
      message: 'Are you sure you want to delete this house? This might affect matches linked to it.',
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('houses').delete().eq('id', id);
        if (error) handleSupabaseError(error, 'Failed to delete house');
        else {
          refresh();
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const updateSetting = async (key: string, val: string) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('settings').upsert({ key_name: key, val }, { onConflict: 'key_name' });
    if (error) handleSupabaseError(error, 'Failed to update setting');
    else {
      setSuccess('Setting updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      refresh();
      setLoading(false);
    }
  };

  const handleNoticeSubmit = async () => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    try {
      if (noticeModal?.notice) {
        const { error } = await supabase.from('notices').update(noticeFormData).eq('id', noticeModal.notice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notices').insert([noticeFormData]);
        if (error) throw error;
      }
      setNoticeModal(null);
      setNoticeFormData({ title: '', content: '', priority: 'low' });
      refresh();
    } catch (err: any) {
      handleSupabaseError(err, 'Failed to save notice');
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Notice',
      message: 'Are you sure you want to permanently delete this notice?',
      onConfirm: async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('notices').delete().eq('id', id);
          if (error) throw error;
          refresh();
        } catch (err: any) {
          handleSupabaseError(err, 'Failed to delete notice');
        } finally {
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  React.useEffect(() => {
    if (!supabase) return;

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchesSearch = 
        m.team1?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.team2?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.venue?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || m.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [matches, searchQuery, categoryFilter]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
        {/* Hero Orbs */}
        <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-ebony opacity-[0.18] blur-[100px] rounded-full animate-[orbdrift_10s_ease-in-out_infinite_alternate]" />
        <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-maple opacity-[0.15] blur-[100px] rounded-full animate-[orbdrift_12s_ease-in-out_infinite_alternate-reverse]" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="card-glass overflow-hidden shadow-2xl">
            <div className="p-10">
              <h2 className="text-4xl text-center text-text mb-2 tracking-wider uppercase">Admin Access</h2>
              <p className="sec-label justify-center mb-10">Secure Control Interface • UCSF 2026</p>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="admin@ucsf.local"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-danger text-[10px] font-bold justify-center uppercase tracking-widest bg-danger/10 py-2"
                  >
                    <AlertCircle size={12} />
                    {error}
                  </motion.div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {loading ? <RefreshCw className="animate-spin" size={20} /> : <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />}
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0c] text-white flex overflow-hidden">
        {/* Sidebar */}
      <aside className="w-72 bg-[#121214] border-r border-white/5 flex flex-col flex-shrink-0 z-50">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-maple rounded-xl flex items-center justify-center text-bg shadow-lg shadow-maple/20">
              <Shield size={22} />
            </div>
            <div>
              <h3 className="text-lg font-display tracking-wider">UCSF ADMIN</h3>
              <p className="font-ui text-[8px] font-bold text-muted uppercase tracking-widest">Control Center v1.1</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {[
            { id: 'matches', label: 'Matches', icon: Activity },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'houses', label: 'Houses', icon: Trophy },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'brochure', label: 'Brochure', icon: FileText },
            { id: 'notices', label: 'Notices', icon: Bell },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3.5 font-ui text-[11px] font-bold uppercase tracking-widest transition-all group rounded-xl",
                activeTab === item.id 
                  ? "bg-maple text-bg shadow-lg shadow-maple/10" 
                  : "text-muted hover:text-text hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} className={cn(
                  "transition-transform group-hover:scale-110",
                  activeTab === item.id ? "text-bg" : "text-muted group-hover:text-maple"
                )} />
                {item.label}
              </div>
              {item.id === 'settings' && hasChanges && (
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_10px_rgba(230,57,70,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          {hasChanges && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-danger/10 border border-danger/20 rounded-xl"
            >
              <p className="font-ui text-[9px] font-bold text-danger uppercase tracking-widest mb-3 text-center">Unsaved Changes</p>
              <button 
                onClick={saveAllSettings}
                className="w-full py-3 bg-danger text-white font-ui text-[10px] font-bold uppercase tracking-widest hover:bg-danger/90 transition-all shadow-lg shadow-danger/20 rounded-lg"
              >
                Save Now
              </button>
            </motion.div>
          )}

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-xl bg-maple/20 flex items-center justify-center text-maple font-ui text-xs font-bold border border-maple/20">
              {session.user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-ui text-[10px] font-bold text-text truncate">{session.user.email}</p>
              <p className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest">System Admin</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-3 font-ui text-[9px] font-bold uppercase tracking-widest text-danger bg-danger/5 hover:bg-danger/10 transition-all rounded-xl border border-danger/10"
            >
              <LogOut size={14} />
              Sign Out
            </button>
            <a
              href="/"
              className="flex items-center justify-center gap-2 py-3 font-ui text-[9px] font-bold uppercase tracking-widest text-muted bg-white/5 hover:text-text hover:bg-white/10 transition-all rounded-xl border border-white/5"
            >
              <Activity size={14} />
              Live Site
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#121214]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-display tracking-widest uppercase text-white">{activeTab}</h2>
            {loading && (
              <div className="flex items-center gap-2 text-maple font-ui text-[9px] font-bold uppercase tracking-widest bg-maple/10 px-3 py-1 rounded-full border border-maple/20">
                <RefreshCw size={12} className="animate-spin" />
                Syncing...
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">System Online</span>
            </div>
            <button 
              onClick={refresh}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-muted hover:text-text transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-danger/30 bg-danger/5 rounded-2xl flex items-center gap-4 text-danger shadow-lg shadow-danger/5"
              >
                <div className="w-10 h-10 bg-danger/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-ui text-[10px] font-bold uppercase tracking-widest mb-1">System Error</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-2 hover:bg-danger/10 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-success/30 bg-success/5 rounded-2xl flex items-center gap-4 text-success shadow-lg shadow-success/5"
              >
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-ui text-[10px] font-bold uppercase tracking-widest mb-1">Success</p>
                  <p className="text-xs opacity-80">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="p-2 hover:bg-success/10 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'matches' && (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Search & Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-6 bg-[#121214] p-6 rounded-3xl border border-white/5 shadow-xl">
                    <div className="flex-1 min-w-[300px] relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-maple transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search matches, teams, venues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 focus:border-maple/50 focus:bg-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                        <Filter className="text-muted" size={16} />
                        <select 
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest outline-none cursor-pointer text-muted hover:text-text transition-colors"
                        >
                          <option value="all">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-[#121214]">{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={addMatch}
                        className="bg-maple hover:bg-maple/90 text-bg py-4 px-8 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 flex items-center gap-3 group"
                      >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Add New Match
                      </button>
                    </div>
                  </div>

                  {/* Matches List */}
                  <div className="grid grid-cols-1 gap-6">
                    {filteredMatches.length > 0 ? (
                      filteredMatches.map((match) => (
                        <motion.div 
                          key={match.id}
                          layout
                          className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden group hover:border-maple/30 transition-all shadow-xl"
                        >
                          <div className="p-8 flex flex-col lg:flex-row items-center gap-10">
                            {/* Match Meta */}
                            <div className="w-full lg:w-48 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted border border-white/5">
                                  <Activity size={18} />
                                </div>
                                <div>
                                  <select
                                    value={match.category_id || ''}
                                    onChange={(e) => updateMatch(match.id, { category_id: e.target.value })}
                                    className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-maple outline-none cursor-pointer"
                                  >
                                    {categories.map(cat => (
                                      <option key={cat.id} value={cat.id} className="bg-[#121214]">{cat.name}</option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Match #</span>
                                    <input
                                      type="number"
                                      defaultValue={match.match_no}
                                      className="w-10 bg-transparent border-b border-white/10 text-white text-[10px] text-center outline-none focus:border-maple"
                                      onBlur={(e) => updateMatch(match.id, { match_no: parseInt(e.target.value) })}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="relative group/venue">
                                <input
                                  type="text"
                                  defaultValue={match.venue || ''}
                                  placeholder="Set Venue"
                                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all"
                                  onBlur={(e) => updateMatch(match.id, { venue: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* Teams & Score */}
                            <div className="flex-1 flex items-center justify-center gap-8">
                              <div className="flex-1 text-right space-y-3">
                                <select
                                  value={match.team1_id || ''}
                                  onChange={(e) => updateMatch(match.id, { team1_id: e.target.value })}
                                  className="w-full bg-transparent border-none text-xl font-display uppercase tracking-widest text-right outline-none cursor-pointer hover:text-maple transition-colors"
                                >
                                  {houses.map(h => (
                                    <option key={h.id} value={h.id} className="bg-[#121214]">{h.name}</option>
                                  ))}
                                </select>
                                <p className="font-ui text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Team One</p>
                              </div>

                              <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
                                <input
                                  type="number"
                                  defaultValue={match.score1 ?? 0}
                                  className="w-16 bg-transparent border-none text-4xl font-display text-center text-white outline-none focus:text-maple transition-colors"
                                  onBlur={(e) => updateMatch(match.id, { score1: parseInt(e.target.value) })}
                                />
                                <div className="w-px h-10 bg-white/10" />
                                <input
                                  type="number"
                                  defaultValue={match.score2 ?? 0}
                                  className="w-16 bg-transparent border-none text-4xl font-display text-center text-white outline-none focus:text-maple transition-colors"
                                  onBlur={(e) => updateMatch(match.id, { score2: parseInt(e.target.value) })}
                                />
                              </div>

                              <div className="flex-1 text-left space-y-3">
                                <select
                                  value={match.team2_id || ''}
                                  onChange={(e) => updateMatch(match.id, { team2_id: e.target.value })}
                                  className="w-full bg-transparent border-none text-xl font-display uppercase tracking-widest text-left outline-none cursor-pointer hover:text-maple transition-colors"
                                >
                                  {houses.map(h => (
                                    <option key={h.id} value={h.id} className="bg-[#121214]">{h.name}</option>
                                  ))}
                                </select>
                                <p className="font-ui text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Team Two</p>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="w-full lg:w-64 flex flex-col gap-4">
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <select
                                    value={match.status || 'upcoming'}
                                    onChange={(e) => updateMatch(match.id, { status: e.target.value as any })}
                                    className={cn(
                                      "w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 font-ui text-[10px] font-bold uppercase tracking-widest outline-none transition-all",
                                      match.status === 'live' ? "text-danger border-danger/30 bg-danger/5" : 
                                      match.status === 'completed' ? "text-success border-success/30 bg-success/5" : "text-muted"
                                    )}
                                  >
                                    <option value="upcoming" className="bg-[#121214]">Upcoming</option>
                                    <option value="live" className="bg-[#121214]">Live Now</option>
                                    <option value="completed" className="bg-[#121214]">Completed</option>
                                  </select>
                                </div>
                                <button 
                                  onClick={() => deleteMatch(match.id)}
                                  className="p-3 bg-danger/5 hover:bg-danger/20 text-danger border border-danger/10 rounded-2xl transition-all"
                                  title="Delete Match"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>

                              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                                <Trophy size={14} className="text-maple" />
                                <select
                                  value={match.winner_id || ''}
                                  onChange={(e) => updateMatch(match.id, { winner_id: e.target.value || null })}
                                  className="flex-1 bg-transparent border-none text-[9px] font-bold uppercase tracking-widest text-muted outline-none cursor-pointer"
                                >
                                  <option value="" className="bg-[#121214]">Draw / None</option>
                                  <option value={match.team1_id} className="bg-[#121214]">{match.team1?.name}</option>
                                  <option value={match.team2_id} className="bg-[#121214]">{match.team2?.name}</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-40 text-center bg-[#121214] rounded-3xl border border-dashed border-white/10">
                        <Activity size={48} className="mx-auto text-muted mb-6 opacity-20" />
                        <h3 className="text-xl font-display uppercase tracking-widest text-muted">No Matches Found</h3>
                        <p className="text-subtle text-sm mt-2">Try adjusting your search or filters.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 pb-20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display uppercase tracking-widest text-white">Event Schedule</h2>
                      <p className="text-muted text-sm mt-1">Manage the timeline of sports and cultural events.</p>
                    </div>
                    <button 
                      onClick={addSchedule}
                      className="bg-maple hover:bg-maple/90 text-bg py-4 px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 flex items-center gap-3 group"
                    >
                      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                      Add Event
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {schedule.map((item) => (
                      <motion.div 
                        key={item.id} 
                        layout
                        className="bg-[#121214] border border-white/5 rounded-[2rem] p-8 shadow-2xl group hover:border-maple/30 transition-all flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-maple">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  defaultValue={item.day_label}
                                  className="w-16 bg-transparent border-none font-ui text-[10px] font-bold uppercase tracking-widest text-maple outline-none focus:text-white"
                                  onBlur={(e) => updateSchedule(item.id, { day_label: e.target.value })}
                                />
                                <input
                                  type="text"
                                  defaultValue={item.day_date}
                                  className="w-24 bg-transparent border-none font-ui text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:text-white"
                                  onBlur={(e) => updateSchedule(item.id, { day_date: e.target.value })}
                                />
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="text"
                                  defaultValue={item.time_start}
                                  className="w-16 bg-transparent border-none font-ui text-[9px] font-bold uppercase tracking-widest text-subtle outline-none focus:text-white"
                                  onBlur={(e) => updateSchedule(item.id, { time_start: e.target.value })}
                                />
                                <span className="text-subtle text-[8px]">-</span>
                                <input
                                  type="text"
                                  defaultValue={item.time_end || ''}
                                  className="w-16 bg-transparent border-none font-ui text-[9px] font-bold uppercase tracking-widest text-subtle outline-none focus:text-white"
                                  onBlur={(e) => updateSchedule(item.id, { time_end: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => deleteSchedule(item.id)}
                              className="w-10 h-10 bg-white/5 hover:bg-danger/10 rounded-xl flex items-center justify-center text-danger transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4 flex-1">
                          <input
                            type="text"
                            defaultValue={item.title}
                            className="w-full bg-transparent border-none text-xl font-display uppercase tracking-widest text-white outline-none focus:text-maple transition-colors"
                            onBlur={(e) => updateSchedule(item.id, { title: e.target.value })}
                          />
                          <textarea
                            defaultValue={item.subtitle || ''}
                            placeholder="Add a subtitle or description..."
                            className="w-full bg-transparent border-none text-muted text-sm leading-relaxed outline-none resize-none focus:text-text transition-colors"
                            rows={2}
                            onBlur={(e) => updateSchedule(item.id, { subtitle: e.target.value })}
                          />
                        </div>

                        <div className="pt-6 mt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Venue</label>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                              <Activity size={14} className="text-muted" />
                              <input
                                type="text"
                                defaultValue={item.venue || ''}
                                className="w-full bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-white outline-none"
                                onBlur={(e) => updateSchedule(item.id, { venue: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Status</label>
                            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                item.status === 'live' ? "bg-maple animate-pulse" :
                                item.status === 'completed' ? "bg-success" : "bg-muted"
                              )} />
                              <select
                                value={item.status || 'upcoming'}
                                onChange={(e) => updateSchedule(item.id, { status: e.target.value as any })}
                                className="w-full bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-white outline-none cursor-pointer"
                              >
                                <option value="upcoming" className="bg-[#121214]">Upcoming</option>
                                <option value="live" className="bg-[#121214]">Live</option>
                                <option value="completed" className="bg-[#121214]">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {schedule.length === 0 && (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center bg-[#121214] border border-white/5 border-dashed rounded-[3rem] text-muted gap-4">
                        <Calendar size={64} className="opacity-10" />
                        <p className="font-ui text-xs font-bold uppercase tracking-widest">No events scheduled yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'houses' && (
                <motion.div
                  key="houses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display uppercase tracking-widest text-white">Houses</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-muted text-xs font-bold uppercase tracking-widest">Mascots: Maple (Snake), Ebony (Bull), Cedar (Panther), Oak (Cheetah)</p>
                        <button 
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'Recompute All Points',
                              message: 'This will recalculate all house points based on current match results. Continue?',
                              onConfirm: async () => {
                                if (supabase) {
                                  await supabase.rpc('recompute_points');
                                  refresh();
                                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                  setSuccess('Points recomputed successfully');
                                  setTimeout(() => setSuccess(null), 3000);
                                }
                              }
                            });
                          }}
                          className="flex items-center gap-2 text-[10px] font-bold text-maple uppercase tracking-widest hover:text-white transition-colors"
                        >
                          <RefreshCw size={12} />
                          Recompute Points
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={addHouse}
                      className="bg-maple hover:bg-maple/90 text-bg py-4 px-8 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 flex items-center gap-3 group"
                    >
                      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                      Add New House
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {houses.map((house) => (
                      <motion.div 
                        key={house.id}
                        layout
                        className="bg-[#121214] border border-white/5 rounded-[2rem] overflow-hidden group hover:border-maple/30 transition-all shadow-2xl flex flex-col"
                      >
                        <div className="p-8 flex items-center gap-8">
                          {/* Logo Area */}
                          <div className="relative group/logo cursor-pointer" onClick={() => document.getElementById(`house-logo-${house.id}`)?.click()}>
                            <input 
                              type="file"
                              id={`house-logo-${house.id}`}
                              className="hidden"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file || !supabase) return;
                                setLoading(true);
                                try {
                                  const fileName = `house_${house.id}_logo_${Date.now()}`;
                                  const { error: uploadError } = await supabase.storage.from('ucsf-media').upload(fileName, file);
                                  if (uploadError) throw uploadError;
                                  const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
                                  await updateHouse(house.id, { logo_url: publicUrl });
                                } catch (err: any) {
                                  handleSupabaseError(err, 'Logo upload failed');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                            />
                            <div className="w-28 h-28 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 overflow-hidden group-hover/logo:border-maple/50 transition-all">
                              {house.logo_url ? (
                                <img src={house.logo_url} alt={house.name} className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
                              ) : (
                                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${house.name}`} alt={house.name} className="w-full h-full object-contain p-4 opacity-50" referrerPolicy="no-referrer" />
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                                <Upload size={20} className="text-white" />
                              </div>
                            </div>
                          </div>

                          {/* Info Area */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                defaultValue={house.name}
                                className="bg-transparent border-none text-3xl font-display uppercase tracking-widest text-white outline-none focus:text-maple transition-colors"
                                onBlur={(e) => updateHouse(house.id, { name: e.target.value })}
                              />
                              <button 
                                onClick={() => deleteHouse(house.id)}
                                className="p-3 bg-danger/5 hover:bg-danger/20 text-danger border border-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <Trophy size={16} className="text-maple" />
                                <input
                                  type="number"
                                  defaultValue={house.points}
                                  className="w-16 bg-transparent border-none text-xl font-display text-white outline-none focus:text-maple transition-colors"
                                  onBlur={(e) => updateHouse(house.id, { points: parseInt(e.target.value) })}
                                />
                                <span className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Points</span>
                              </div>
                              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: house.color || '#ffffff' }} />
                                <input
                                  type="text"
                                  defaultValue={house.color || '#ffffff'}
                                  className="w-20 bg-transparent border-none text-[10px] font-mono text-muted outline-none focus:text-white transition-colors"
                                  onBlur={(e) => updateHouse(house.id, { color: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Mascot & Rank */}
                        <div className="px-8 pb-8 grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Mascot & Name</label>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                defaultValue={house.mascot || ''}
                                placeholder="🐍"
                                className="w-12 bg-white/5 border border-white/5 rounded-xl py-3 text-center text-xl outline-none focus:border-maple/50"
                                onBlur={(e) => updateHouse(house.id, { mascot: e.target.value })}
                              />
                              <input
                                type="text"
                                defaultValue={house.mascot_name || ''}
                                placeholder="The Viper"
                                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text"
                                onBlur={(e) => updateHouse(house.id, { mascot_name: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Rank Position</label>
                            <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl px-4 py-3">
                              <Activity size={16} className="text-muted" />
                              <input
                                type="number"
                                defaultValue={house.rank_pos}
                                className="w-full bg-transparent border-none text-sm font-bold text-white outline-none"
                                onBlur={(e) => updateHouse(house.id, { rank_pos: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display uppercase tracking-widest text-white">Categories</h2>
                      <p className="text-muted text-sm mt-1">Define sports and cultural event categories.</p>
                    </div>
                    <button 
                      onClick={addCategory}
                      className="bg-maple hover:bg-maple/90 text-bg py-4 px-8 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 flex items-center gap-3 group"
                    >
                      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                      Add New Category
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {categories.map((cat) => (
                      <motion.div 
                        key={cat.id}
                        layout
                        className="bg-[#121214] border border-white/5 rounded-3xl p-8 group hover:border-maple/30 transition-all shadow-xl space-y-6"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="relative group/icon w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-4xl border border-white/5 group-hover:border-maple/50 transition-all">
                            {cat.icon || <Layers size={28} className="text-muted" />}
                            <input
                              type="text"
                              defaultValue={cat.icon || ''}
                              placeholder="Emoji"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onBlur={(e) => updateCategory(cat.id, { icon: e.target.value })}
                            />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                defaultValue={cat.name}
                                className="w-full bg-transparent border-none text-2xl font-display uppercase tracking-widest text-white outline-none focus:text-maple transition-colors"
                                onBlur={(e) => updateCategory(cat.id, { name: e.target.value })}
                              />
                              <button 
                                onClick={() => deleteCategory(cat.id)}
                                className="p-3 bg-danger/5 hover:bg-danger/20 text-danger border border-danger/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <span className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Order</span>
                                <input
                                  type="number"
                                  defaultValue={cat.sort_order}
                                  className="w-8 bg-transparent border-none text-white text-[10px] text-center outline-none"
                                  onBlur={(e) => updateCategory(cat.id, { sort_order: parseInt(e.target.value) })}
                                />
                              </div>
                              <select
                                value={cat.type || 'sport'}
                                onChange={(e) => updateCategory(cat.id, { type: e.target.value as any })}
                                className="bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 font-ui text-[9px] font-bold uppercase tracking-widest text-maple outline-none"
                              >
                                <option value="sport" className="bg-[#121214]">Sport</option>
                                <option value="cultural" className="bg-[#121214]">Cultural</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-2">
                            <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Gender</label>
                            <input
                              type="text"
                              defaultValue={cat.gender || ''}
                              placeholder="e.g. Boys/Girls"
                              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all"
                              onBlur={(e) => updateCategory(cat.id, { gender: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Eligibility</label>
                            <input
                              type="text"
                              defaultValue={cat.eligible_years || ''}
                              placeholder="e.g. 9-12"
                              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all"
                              onBlur={(e) => updateCategory(cat.id, { eligible_years: e.target.value })}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'brochure' && (
                <motion.div
                  key="brochure"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 pb-20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display uppercase tracking-widest text-white">Brochure Management</h2>
                      <p className="text-muted text-sm mt-1">Upload and manage the official event brochure PDF.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                      <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-10 space-y-8 shadow-2xl">
                        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                          <div className="w-12 h-12 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                            <FileText size={24} />
                          </div>
                          <h3 className="text-xl font-display uppercase tracking-widest text-white">Configuration</h3>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Brochure URL</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                defaultValue={settings.brochure_url || ''}
                                className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                                placeholder="https://..."
                                onBlur={(e) => updateSetting('brochure_url', e.target.value)}
                              />
                              <button className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-maple transition-all">
                                <Save size={20} />
                              </button>
                            </div>
                          </div>

                          <div className="pt-6 border-t border-white/5">
                            <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest mb-4 block">Upload New PDF</label>
                            <div className="relative group">
                              <input
                                type="file"
                                accept=".pdf"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file || !supabase) return;
                                  setLoading(true);
                                  try {
                                    const fileName = `brochure_${Date.now()}.pdf`;
                                    const { error: uploadError } = await supabase.storage
                                      .from('ucsf-media')
                                      .upload(fileName, file, { cacheControl: '3600', upsert: true });
                                    if (uploadError) throw uploadError;
                                    const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
                                    await updateSetting('brochure_url', publicUrl);
                                    setSuccess('Brochure uploaded successfully!');
                                    setTimeout(() => setSuccess(null), 3000);
                                  } catch (err: any) {
                                    handleSupabaseError(err, 'Brochure upload failed');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              />
                              <div className="w-full aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 group-hover:bg-white/10 group-hover:border-maple/30 transition-all">
                                <div className="w-16 h-16 bg-maple/10 rounded-full flex items-center justify-center text-maple group-hover:scale-110 transition-transform">
                                  <Upload size={32} />
                                </div>
                                <div className="text-center">
                                  <p className="font-ui text-[10px] font-bold text-white uppercase tracking-widest">Drop PDF Here</p>
                                  <p className="font-ui text-[8px] font-bold text-muted uppercase tracking-widest mt-1">Max 10MB</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-10 h-full shadow-2xl flex flex-col">
                        <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-8">
                          <div className="w-12 h-12 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                            <Eye size={24} />
                          </div>
                          <h3 className="text-xl font-display uppercase tracking-widest text-white">Live Preview</h3>
                        </div>

                        {settings.brochure_url ? (
                          <div className="flex-1 rounded-[1.5rem] overflow-hidden border border-white/5 bg-ebony">
                            <iframe
                              src={settings.brochure_url}
                              className="w-full h-full border-none"
                              title="Brochure Preview"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4">
                            <FileWarning size={64} className="opacity-20" />
                            <p className="font-ui text-xs font-bold uppercase tracking-widest">No brochure uploaded yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notices' && (
                <motion.div
                  key="notices"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 pb-20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display uppercase tracking-widest text-white">Notices & Bulletins</h2>
                      <p className="text-muted text-sm mt-1">Broadcast important information to all participants.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setNoticeModal({ isOpen: true });
                        setNoticeFormData({ title: '', content: '', priority: 'low' });
                      }}
                      className="bg-maple hover:bg-maple/90 text-bg py-4 px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 flex items-center gap-3 group"
                    >
                      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                      Create New Notice
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {notices.map(notice => (
                      <motion.div 
                        key={notice.id} 
                        layout
                        className="bg-[#121214] border border-white/5 rounded-[2rem] p-8 shadow-2xl group hover:border-maple/30 transition-all flex flex-col"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className={cn(
                            "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                            notice.priority === 'high' ? "bg-danger/10 text-danger border border-danger/20" :
                            notice.priority === 'medium' ? "bg-maple/10 text-maple border border-maple/20" :
                            "bg-white/5 text-muted border border-white/10"
                          )}>
                            {notice.priority} priority
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setNoticeModal({ isOpen: true, notice });
                                setNoticeFormData({ title: notice.title, content: notice.content, priority: notice.priority });
                              }}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-maple transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteNotice(notice.id)}
                              className="w-10 h-10 bg-white/5 hover:bg-danger/10 rounded-xl flex items-center justify-center text-danger transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-xl font-display uppercase tracking-widest text-white mb-4 line-clamp-2">{notice.title}</h4>
                        <p className="text-muted text-sm leading-relaxed mb-8 flex-1 line-clamp-4">{notice.content}</p>
                        
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted">
                            <Calendar size={14} />
                            <span className="font-ui text-[10px] font-bold uppercase tracking-widest">
                              {new Date(notice.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted">
                            <Bell size={14} />
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {notices.length === 0 && (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center bg-[#121214] border border-white/5 border-dashed rounded-[3rem] text-muted gap-4">
                        <Bell size={64} className="opacity-10" />
                        <p className="font-ui text-xs font-bold uppercase tracking-widest">No notices published yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 pb-20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-display uppercase tracking-widest text-white">General Settings</h2>
                      <p className="text-muted text-sm mt-1">Configure global application parameters and social links.</p>
                    </div>
                    {hasChanges && (
                      <button 
                        onClick={saveAllSettings}
                        className="bg-maple hover:bg-maple/90 text-bg py-4 px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 flex items-center gap-3 group"
                      >
                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                        Save All Changes
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Core Info */}
                    <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-10 space-y-8 shadow-2xl">
                      <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                          <SettingsIcon size={24} />
                        </div>
                        <h3 className="text-xl font-display uppercase tracking-widest text-white">Core Configuration</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Festival Name</label>
                          <input
                            type="text"
                            value={localSettings['festival_name'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            onChange={(e) => handleSettingChange('festival_name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Contact Email</label>
                          <input
                            type="email"
                            value={localSettings['contact_email'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Master Spreadsheet URL</label>
                          <input
                            type="text"
                            value={localSettings['master_spreadsheet_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            placeholder="https://docs.google.com/spreadsheets/..."
                            onChange={(e) => handleSettingChange('master_spreadsheet_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status & Announcements */}
                    <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-10 space-y-8 shadow-2xl">
                      <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                          <Activity size={24} />
                        </div>
                        <h3 className="text-xl font-display uppercase tracking-widest text-white">Announcements</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Global Announcement Banner</label>
                          <textarea
                            value={localSettings['announcement_text'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all min-h-[120px] resize-none"
                            placeholder="Enter global announcement..."
                            onChange={(e) => handleSettingChange('announcement_text', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Footer Copyright Text</label>
                          <input
                            type="text"
                            value={localSettings['footer_text'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            placeholder="e.g. © 2026 UCSF. All rights reserved."
                            onChange={(e) => handleSettingChange('footer_text', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-10 space-y-8 shadow-2xl lg:col-span-2">
                      <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                        <div className="w-12 h-12 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                          <Share2 size={24} />
                        </div>
                        <h3 className="text-xl font-display uppercase tracking-widest text-white">Social & External Links</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Instagram URL</label>
                          <input
                            type="text"
                            value={localSettings['instagram_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            onChange={(e) => handleSettingChange('instagram_url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Facebook URL</label>
                          <input
                            type="text"
                            value={localSettings['facebook_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            onChange={(e) => handleSettingChange('facebook_url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">YouTube Stream URL</label>
                          <input
                            type="text"
                            value={localSettings['youtube_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                            onChange={(e) => handleSettingChange('youtube_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Section */}
                  <div className="opacity-40 hover:opacity-100 transition-opacity pt-12">
                    <h4 className="font-ui text-[10px] font-bold uppercase tracking-[0.3em] text-muted mb-6 text-center">System Registry Keys</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(settings).map(([key, val]) => (
                        <div key={key} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-1 overflow-hidden">
                          <span className="font-mono text-[8px] text-muted truncate">{key}</span>
                          <span className="font-ui text-[9px] font-bold text-white truncate">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>

      {/* Notice Modal */}
      <AnimatePresence>
        {noticeModal?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ebony/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#121214] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-14 h-14 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                  <Bell size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-display uppercase tracking-widest text-white">
                    {noticeModal.notice ? 'Edit Notice' : 'Create New Notice'}
                  </h3>
                  <p className="text-muted text-xs font-ui font-bold uppercase tracking-widest mt-1">Broadcast to all participants</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Notice Title</label>
                  <input
                    type="text"
                    value={noticeFormData.title}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all"
                    placeholder="e.g. Football Schedule Update"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setNoticeFormData({ ...noticeFormData, priority: p as any })}
                        className={cn(
                          "py-3 rounded-xl font-ui text-[9px] font-bold uppercase tracking-widest transition-all border",
                          noticeFormData.priority === p 
                            ? (p === 'high' ? "bg-danger/20 border-danger text-danger" : p === 'medium' ? "bg-maple/20 border-maple text-maple" : "bg-white/10 border-white/20 text-white")
                            : "bg-white/5 border-white/5 text-muted hover:bg-white/10"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Content Body</label>
                  <textarea
                    value={noticeFormData.content}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, content: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-maple/50 transition-all min-h-[180px] resize-none leading-relaxed"
                    placeholder="Enter detailed notice content..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setNoticeModal(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-muted py-4 rounded-2xl font-ui text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNoticeSubmit}
                  disabled={loading || !noticeFormData.title || !noticeFormData.content}
                  className="flex-1 bg-maple hover:bg-maple/90 text-bg py-4 rounded-2xl font-ui text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Publish Notice'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-ebony/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#121214] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                <div className="w-14 h-14 bg-maple/10 rounded-2xl flex items-center justify-center text-maple">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-display uppercase tracking-widest text-white">{confirmModal.title}</h3>
                  <p className="text-muted text-[10px] font-ui font-bold uppercase tracking-widest mt-1">Action Required</p>
                </div>
              </div>
              
              <p className="text-muted text-sm leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-muted py-4 rounded-2xl font-ui text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-maple hover:bg-maple/90 text-bg py-4 rounded-2xl font-ui text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20"
                >
                  {confirmModal.title.toLowerCase().includes('delete') ? 'Confirm Delete' : 'Confirm Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
