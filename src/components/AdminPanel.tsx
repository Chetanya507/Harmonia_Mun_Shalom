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
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutDashboard,
  ChevronRight,
  TrendingUp,
  Users,
  Plus,
  Trash2,
  Edit2,
  Layers,
  FileText,
  Upload,
  Image as ImageIcon,
  Video,
  Play,
  ExternalLink,
  X
} from 'lucide-react';
import { Match, House, ScheduleItem, Category, Registration, GalleryItem } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab = 'dashboard' | 'matches' | 'schedule' | 'houses' | 'categories' | 'brochure' | 'gallery' | 'settings';

interface AdminPanelProps {
  matches: Match[];
  houses: House[];
  schedule: ScheduleItem[];
  categories: Category[];
  gallery: GalleryItem[];
  settings: Record<string, string>;
  refresh: () => void;
}

export default function AdminPanel({ matches, houses, schedule, categories, gallery, settings, refresh }: AdminPanelProps) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
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
    const { error } = await supabase.from('settings').update({ val }).eq('key_name', key);
    if (error) handleSupabaseError(error, 'Failed to update setting');
    else {
      refresh();
      setLoading(false);
    }
  };

  const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('gallery').insert([item]);
    if (error) handleSupabaseError(error, 'Failed to add gallery item');
    else {
      refresh();
      setLoading(false);
    }
  };

  const deleteGalleryItem = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Gallery Item',
      message: 'Are you sure you want to delete this item from the gallery?',
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) handleSupabaseError(error, 'Failed to delete gallery item');
        else {
          refresh();
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

  const stats = useMemo(() => ({
    totalMatches: matches.length,
    liveMatches: matches.filter(m => m.status === 'live').length,
    completedMatches: matches.filter(m => m.status === 'completed').length,
    topHouse: houses[0]?.name || 'N/A',
    totalPoints: houses.reduce((acc, h) => acc + h.points, 0)
  }), [matches, houses]);

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
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Hero Orbs */}
      <div className="fixed top-[-200px] left-[-100px] w-[500px] h-[500px] bg-ebony opacity-[0.1] blur-[100px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-maple opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 space-y-4">
            <div className="card-glass p-6">
              <div className="flex items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl text-text tracking-wider">UCSF ADMIN</h3>
                  <p className="font-ui text-[8px] font-bold text-muted uppercase tracking-widest">v1.0.4 Stable</p>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'matches', label: 'Matches', icon: Activity },
                  { id: 'schedule', label: 'Schedule', icon: Calendar },
                  { id: 'houses', label: 'Houses', icon: Trophy },
                  { id: 'categories', label: 'Categories', icon: Layers },
                  { id: 'brochure', label: 'Brochure', icon: FileText },
                  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                  { id: 'settings', label: 'Settings', icon: SettingsIcon },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTab)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 font-ui text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeTab === item.id 
                        ? "bg-maple text-bg shadow-[0_0_20px_rgba(245,197,24,0.2)]" 
                        : "text-muted hover:text-text hover:bg-white/5"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                    {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                ))}
              </nav>

              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted font-ui text-[10px]">
                    {session.user.email[0].toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-ui text-[10px] font-bold text-text truncate">{session.user.email}</p>
                    <p className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest">System Admin</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 font-ui text-[10px] font-bold uppercase tracking-widest text-danger hover:bg-danger/10 transition-all mb-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
                <a
                  href="/"
                  className="w-full flex items-center gap-3 px-4 py-3 font-ui text-[10px] font-bold uppercase tracking-widest text-muted hover:text-text hover:bg-white/5 transition-all"
                >
                  <Activity size={16} />
                  View Live Site
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl text-text tracking-wider uppercase">{activeTab}</h2>
              {loading && (
                <div className="flex items-center gap-2 text-maple font-ui text-[10px] font-bold uppercase tracking-widest">
                  <RefreshCw size={14} className="animate-spin" />
                  Syncing...
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-4 border-danger/30 bg-danger/5 flex items-center gap-4 text-danger"
              >
                <AlertCircle size={20} />
                <div className="flex-1">
                  <p className="font-ui text-[10px] font-bold uppercase tracking-widest">System Error</p>
                  <p className="text-xs opacity-80">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="p-2 hover:bg-danger/10 rounded-full transition-colors">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[
                      { label: 'Live Events', val: stats.liveMatches, icon: Activity, color: 'text-danger', bg: 'bg-danger/10' },
                      { label: 'Total Matches', val: stats.totalMatches, icon: TrendingUp, color: 'text-maple', bg: 'bg-maple/10' },
                      { label: 'Leading House', val: stats.topHouse, icon: Trophy, color: 'text-text', bg: 'bg-white/10' },
                      { label: 'Total Points', val: stats.totalPoints, icon: Users, color: 'text-muted', bg: 'bg-white/5' },
                    ].map((stat, i) => (
                      <div key={i} className="card-glass p-6 group overflow-hidden">
                        <div className={cn("absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity", stat.color)}>
                          <stat.icon size={120} />
                        </div>
                        <div className={cn("w-10 h-10 flex items-center justify-center mb-4 skew-x-[-12deg]", stat.bg, stat.color)}>
                          <stat.icon size={20} className="skew-x-[12deg]" />
                        </div>
                        <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-4xl text-text tracking-wider">{stat.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity / Quick Actions */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="card-glass p-8">
                      <h3 className="text-2xl text-text mb-6 tracking-wide">Quick Actions</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => supabase?.rpc('recompute_points').then(() => refresh())}
                          className="flex flex-col items-center justify-center p-6 bg-bg2 border border-border hover:border-maple/30 hover:bg-white/5 transition-all gap-3 group"
                        >
                          <RefreshCw size={24} className="text-maple group-hover:rotate-180 transition-transform duration-500" />
                          <span className="font-ui text-[10px] font-bold text-text uppercase tracking-widest">Recompute Points</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('matches')}
                          className="flex flex-col items-center justify-center p-6 bg-bg2 border border-border hover:border-danger/30 hover:bg-white/5 transition-all gap-3 group"
                        >
                          <Activity size={24} className="text-danger group-hover:scale-110 transition-transform" />
                          <span className="font-ui text-[10px] font-bold text-text uppercase tracking-widest">Manage Live</span>
                        </button>
                      </div>
                    </div>

                    <div className="card-glass p-8">
                      <h3 className="text-2xl text-text mb-6 tracking-wide">System Status</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-bg2 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                            <span className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Database Connection</span>
                          </div>
                          <span className="font-ui text-[10px] font-bold text-danger uppercase tracking-widest">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-bg2 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                            <span className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">Real-time Sync</span>
                          </div>
                          <span className="font-ui text-[10px] font-bold text-danger uppercase tracking-widest">Healthy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="card-glass p-6 flex flex-wrap items-center justify-between gap-6">
                <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search matches, teams, venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-12"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Filter className="text-subtle" size={18} />
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-select w-auto"
                  >
                    <option value="all">All Sports</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={addMatch}
                    className="btn-primary py-2.5 px-4"
                  >
                    <Plus size={16} />
                    Add Match
                  </button>
                </div>
              </div>

              <div className="card-glass overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 font-ui text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
                        <th className="px-8 py-6">Details</th>
                        <th className="px-8 py-6">Teams</th>
                        <th className="px-8 py-6">Score</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">Winner</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3 mb-2">
                              <select
                                value={match.category_id || ''}
                                onChange={(e) => updateMatch(match.id, { category_id: e.target.value })}
                                className="form-select py-1 text-[10px] w-auto"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                defaultValue={match.match_no}
                                className="w-12 px-2 py-1 bg-bg2 border border-border text-text text-[10px] text-center"
                                onBlur={(e) => updateMatch(match.id, { match_no: parseInt(e.target.value) })}
                              />
                            </div>
                            <input
                              type="text"
                              defaultValue={match.venue || ''}
                              placeholder="Venue"
                              className="form-input py-1 text-[10px]"
                              onBlur={(e) => updateMatch(match.id, { venue: e.target.value })}
                            />
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-2">
                              <select
                                value={match.team1_id || ''}
                                onChange={(e) => updateMatch(match.id, { team1_id: e.target.value })}
                                className="form-select py-1 text-[11px]"
                              >
                                {houses.map(h => (
                                  <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                              </select>
                              <select
                                value={match.team2_id || ''}
                                onChange={(e) => updateMatch(match.id, { team2_id: e.target.value })}
                                className="form-select py-1 text-[11px]"
                              >
                                {houses.map(h => (
                                  <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                defaultValue={match.score1 ?? 0}
                                className="w-14 px-2 py-2 bg-bg2 border border-border text-text text-center font-display text-xl focus:border-accent outline-none"
                                onBlur={(e) => updateMatch(match.id, { score1: parseInt(e.target.value) })}
                              />
                              <span className="text-subtle font-display text-xl">:</span>
                              <input
                                type="number"
                                defaultValue={match.score2 ?? 0}
                                className="w-14 px-2 py-2 bg-bg2 border border-border text-text text-center font-display text-xl focus:border-accent outline-none"
                                onBlur={(e) => updateMatch(match.id, { score2: parseInt(e.target.value) })}
                              />
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={match.status || 'upcoming'}
                              onChange={(e) => updateMatch(match.id, { status: e.target.value as any })}
                              className={cn(
                                "form-select w-auto py-2",
                                match.status === 'live' ? "text-danger border-danger/30" : "text-text"
                              )}
                            >
                              <option value="upcoming" className="text-text">Upcoming</option>
                              <option value="live" className="text-danger">Live</option>
                              <option value="completed" className="text-muted">Completed</option>
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={match.winner_id || ''}
                              onChange={(e) => updateMatch(match.id, { winner_id: e.target.value || null })}
                              className="form-select w-auto py-2"
                            >
                              <option value="">Draw / None</option>
                              <option value={match.team1_id}>{match.team1?.name}</option>
                              <option value={match.team2_id}>{match.team2?.name}</option>
                            </select>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => deleteMatch(match.id)}
                              className="p-2 text-subtle hover:text-danger transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-end">
                <button 
                  onClick={addSchedule}
                  className="btn-primary py-2.5 px-4"
                >
                  <Plus size={16} />
                  Add Event
                </button>
              </div>

              <div className="card-glass overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 font-ui text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
                        <th className="px-8 py-6">Time & Day</th>
                        <th className="px-8 py-6">Event Details</th>
                        <th className="px-8 py-6">Venue</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {schedule.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  defaultValue={item.time_start}
                                  className="w-20 px-2 py-1 bg-bg2 border border-border text-text text-[10px]"
                                  onBlur={(e) => updateSchedule(item.id, { time_start: e.target.value })}
                                />
                                <span className="text-subtle">-</span>
                                <input
                                  type="text"
                                  defaultValue={item.time_end || ''}
                                  className="w-20 px-2 py-1 bg-bg2 border border-border text-text text-[10px]"
                                  onBlur={(e) => updateSchedule(item.id, { time_end: e.target.value })}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  defaultValue={item.day_label}
                                  className="w-16 px-2 py-1 bg-bg2 border border-border text-text text-[10px]"
                                  onBlur={(e) => updateSchedule(item.id, { day_label: e.target.value })}
                                />
                                <input
                                  type="text"
                                  defaultValue={item.day_date}
                                  className="flex-1 px-2 py-1 bg-bg2 border border-border text-text text-[10px]"
                                  onBlur={(e) => updateSchedule(item.id, { day_date: e.target.value })}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <input
                              type="text"
                              defaultValue={item.title}
                              className="w-full px-2 py-1 bg-bg2 border border-border text-text text-sm mb-2"
                              onBlur={(e) => updateSchedule(item.id, { title: e.target.value })}
                            />
                            <input
                              type="text"
                              defaultValue={item.subtitle || ''}
                              placeholder="Subtitle"
                              className="w-full px-2 py-1 bg-bg2 border border-border text-text text-[10px]"
                              onBlur={(e) => updateSchedule(item.id, { subtitle: e.target.value })}
                            />
                          </td>
                          <td className="px-8 py-6">
                            <input
                              type="text"
                              defaultValue={item.venue || ''}
                              className="w-full px-2 py-1 bg-bg2 border border-border text-text text-xs"
                              onBlur={(e) => updateSchedule(item.id, { venue: e.target.value })}
                            />
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={item.status || 'upcoming'}
                              onChange={(e) => updateSchedule(item.id, { status: e.target.value as any })}
                              className="form-select w-auto py-2"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="live">Live</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => deleteSchedule(item.id)}
                              className="p-2 text-subtle hover:text-danger transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'houses' && (
            <motion.div
              key="houses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">
                  Mascot Reference: Maple (Snake), Ebony (Bull), Cedar (Panther), Oak (Cheetah)
                </p>
                <button 
                  onClick={addHouse}
                  className="btn-primary py-2.5 px-4"
                >
                  <Plus size={16} />
                  Add House
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {houses.map((house) => (
                  <div key={house.id} className="card-glass p-8 space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer" onClick={() => document.getElementById(`house-logo-${house.id}`)?.click()}>
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
                        <div className="w-24 h-24 bg-white/5 flex items-center justify-center text-5xl filter drop-shadow-lg border border-border overflow-hidden">
                          {house.logo_url ? (
                            <img src={house.logo_url} alt={house.name} className="w-full h-full object-contain p-4" referrerPolicy="no-referrer" />
                          ) : (
                            <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${house.name}`} alt={house.name} className="w-full h-full object-contain p-4 opacity-50" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-maple text-bg flex items-center justify-center rounded-full shadow-lg">
                          <Edit2 size={14} />
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="text"
                            defaultValue={house.name}
                            className="flex-1 bg-transparent border-b border-border text-3xl text-text tracking-wider uppercase focus:border-maple outline-none"
                            onBlur={(e) => updateHouse(house.id, { name: e.target.value })}
                          />
                          <div className="flex items-center gap-2 bg-bg2 px-3 py-1 border border-border">
                            <span className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Rank:</span>
                            <input
                              type="number"
                              defaultValue={house.rank_pos}
                              className="w-8 bg-transparent text-text text-center outline-none"
                              onBlur={(e) => updateHouse(house.id, { rank_pos: parseInt(e.target.value) })}
                            />
                          </div>
                          <button 
                            onClick={() => deleteHouse(house.id)}
                            className="p-2 text-subtle hover:text-danger transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-1">
                            <label className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest">Mascot Emoji</label>
                            <input
                              type="text"
                              defaultValue={house.mascot || ''}
                              placeholder="e.g. 🐍"
                              className="w-full bg-transparent border-b border-border font-ui text-xl text-text focus:border-maple outline-none"
                              onBlur={(e) => updateHouse(house.id, { mascot: e.target.value })}
                            />
                          </div>
                          <div className="flex-[2] space-y-1">
                            <label className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest">Mascot Name</label>
                            <input
                              type="text"
                              defaultValue={house.mascot_name || ''}
                              placeholder="e.g. The Viper"
                              className="w-full bg-transparent border-b border-border font-ui text-[10px] font-bold text-muted uppercase tracking-widest focus:border-maple outline-none"
                              onBlur={(e) => updateHouse(house.id, { mascot_name: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Logo URL</label>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-white/5 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {house.logo_url ? (
                            <img src={house.logo_url} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon size={16} className="text-muted" />
                          )}
                        </div>
                        <input
                          type="text"
                          defaultValue={house.logo_url || ''}
                          placeholder="https://example.com/logo.png"
                          className="flex-1 px-3 py-2 bg-bg2 border border-border text-text text-xs"
                          onBlur={(e) => updateHouse(house.id, { logo_url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Banner URL</label>
                      <div className="flex gap-3">
                        <div 
                          className="w-10 h-10 bg-white/5 border border-border flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => document.getElementById(`house-banner-${house.id}`)?.click()}
                        >
                          <input 
                            type="file"
                            id={`house-banner-${house.id}`}
                            className="hidden"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !supabase) return;
                              setLoading(true);
                              try {
                                const fileName = `house_${house.id}_banner_${Date.now()}`;
                                const { error: uploadError } = await supabase.storage.from('ucsf-media').upload(fileName, file);
                                if (uploadError) throw uploadError;
                                const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
                                await updateHouse(house.id, { banner_url: publicUrl });
                              } catch (err: any) {
                                handleSupabaseError(err, 'Banner upload failed');
                              } finally {
                                setLoading(false);
                              }
                            }}
                          />
                          {house.banner_url ? (
                            <img src={house.banner_url} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <ImageIcon size={16} className="text-muted" />
                          )}
                        </div>
                        <input
                          type="text"
                          defaultValue={house.banner_url || ''}
                          placeholder="https://example.com/banner.jpg"
                          className="flex-1 px-3 py-2 bg-bg2 border border-border text-text text-xs"
                          onBlur={(e) => updateHouse(house.id, { banner_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">House Color</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          defaultValue={house.color}
                          className="w-10 h-10 bg-transparent border-none cursor-pointer"
                          onBlur={(e) => updateHouse(house.id, { color: e.target.value })}
                        />
                        <input
                          type="text"
                          defaultValue={house.color}
                          className="flex-1 px-3 py-2 bg-bg2 border border-border text-text text-xs font-mono"
                          onBlur={(e) => updateHouse(house.id, { color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Total Points</label>
                      <input
                        type="number"
                        defaultValue={house.points}
                        className="w-full px-3 py-2 bg-bg2 border border-border text-text text-xl font-display"
                        onBlur={(e) => updateHouse(house.id, { points: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Motto</label>
                    <textarea
                      defaultValue={house.motto || ''}
                      className="w-full px-3 py-2 bg-bg2 border border-border text-text text-xs italic min-h-[60px] focus:border-maple outline-none"
                      onBlur={(e) => updateHouse(house.id, { motto: e.target.value })}
                    />
                  </div>
                </div>
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
              className="space-y-6"
            >
              <div className="flex justify-end">
                <button 
                  onClick={addCategory}
                  className="btn-primary py-2.5 px-4"
                >
                  <Plus size={16} />
                  Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <div key={cat.id} className="card-glass p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative group w-16 h-16 bg-white/5 flex items-center justify-center text-3xl border border-border">
                        {cat.icon || <Layers size={24} className="text-muted" />}
                        <input
                          type="text"
                          defaultValue={cat.icon || ''}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onBlur={(e) => updateCategory(cat.id, { icon: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          defaultValue={cat.name}
                          className="w-full bg-transparent border-b border-border text-xl text-text tracking-wide uppercase focus:border-maple outline-none mb-2"
                          onBlur={(e) => updateCategory(cat.id, { name: e.target.value })}
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Order:</span>
                          <input
                            type="number"
                            defaultValue={cat.sort_order}
                            className="w-12 bg-bg2 border border-border text-text text-center text-[10px]"
                            onBlur={(e) => updateCategory(cat.id, { sort_order: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="space-y-1">
                            <label className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest">Gender</label>
                            <input
                              type="text"
                              defaultValue={cat.gender || ''}
                              placeholder="e.g. Boys/Girls"
                              className="w-full bg-bg2 border border-border text-text text-[10px] px-2 py-1"
                              onBlur={(e) => updateCategory(cat.id, { gender: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest">Years/Grades</label>
                            <input
                              type="text"
                              defaultValue={cat.eligible_years || ''}
                              placeholder="e.g. 9-12"
                              className="w-full bg-bg2 border border-border text-text text-[10px] px-2 py-1"
                              onBlur={(e) => updateCategory(cat.id, { eligible_years: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 text-subtle hover:text-danger transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
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
              className="space-y-6"
            >
              <div className="card-glass p-8">
                <h3 className="text-2xl text-text mb-8 tracking-wide">Brochure Management</h3>
                <div className="space-y-8">
                  <div className="form-group">
                    <label className="form-label">Brochure URL (Direct Link)</label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        defaultValue={settings.brochure_url || ''}
                        className="form-input"
                        placeholder="https://example.com/brochure.pdf"
                        onBlur={(e) => updateSetting('brochure_url', e.target.value)}
                      />
                      <button className="btn-ghost px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Save size={16} />
                        Save
                      </button>
                    </div>
                    <p className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest mt-2">
                      Enter a direct link to a PDF file or upload one below.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-border">
                    <label className="form-label mb-4">Upload PDF Brochure</label>
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border bg-white/5 hover:bg-white/10 transition-all group relative">
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !supabase) return;
                          
                          setLoading(true);
                          setError(null);
                          
                          try {
                            const fileName = `brochure_${Date.now()}.pdf`;
                            const { data, error: uploadError } = await supabase.storage
                              .from('ucsf-media')
                              .upload(fileName, file, {
                                cacheControl: '3600',
                                upsert: true
                              });

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('ucsf-media')
                              .getPublicUrl(fileName);

                            await updateSetting('brochure_url', publicUrl);
                            alert('Brochure uploaded successfully!');
                          } catch (err: any) {
                            handleSupabaseError(err, 'Brochure upload failed');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                      <Upload size={48} className="text-muted group-hover:text-maple transition-colors mb-4" />
                      <p className="font-ui text-xs font-bold text-text uppercase tracking-widest mb-2">Click or drag to upload PDF</p>
                      <p className="font-ui text-[10px] font-bold text-subtle uppercase tracking-widest">Max size: 10MB</p>
                    </div>
                  </div>

                  {settings.brochure_url && (
                    <div className="pt-8 border-t border-border">
                      <label className="form-label mb-4">Current Brochure Preview</label>
                      <div className="aspect-[16/9] card-glass overflow-hidden">
                        <iframe
                          src={settings.brochure_url}
                          className="w-full h-full border-none"
                          title="Brochure Preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="card-glass p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl text-text tracking-wide">Media Gallery</h3>
                  <div className="flex gap-4">
                    <div className="relative">
                      <input 
                        type="file"
                        id="gallery-upload"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !supabase) return;
                          setLoading(true);
                          try {
                            const title = prompt('Enter title for this media:', file.name.split('.')[0]);
                            if (!title) return;
                            const yearStr = prompt('Enter year (2025 or 2026):', '2026');
                            const year = parseInt(yearStr || '2026');
                            
                            const fileName = `gallery_${Date.now()}_${file.name}`;
                            const { error: uploadError } = await supabase.storage.from('ucsf-media').upload(fileName, file);
                            if (uploadError) throw uploadError;
                            const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
                            
                            const type = file.type.startsWith('video/') ? 'video' : 'image';
                            await addGalleryItem({ title, type, url: publicUrl, thumbnail_url: null, year });
                          } catch (err: any) {
                            handleSupabaseError(err, 'Gallery upload failed');
                          } finally {
                            setLoading(false);
                          }
                        }}
                      />
                      <button 
                        onClick={() => document.getElementById('gallery-upload')?.click()}
                        className="btn-primary flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                      >
                        <Upload size={16} />
                        Upload Media
                      </button>
                    </div>
                    <button 
                      onClick={() => {
                        const title = prompt('Enter title:');
                        const url = prompt('Enter image URL:');
                        const yearStr = prompt('Enter year (2025 or 2026):', '2026');
                        const year = parseInt(yearStr || '2026');
                        if (title && url) addGalleryItem({ title, type: 'image', url, thumbnail_url: null, year });
                      }}
                      className="btn-ghost flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                      <ImageIcon size={16} />
                      Add via URL
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gallery.map(item => (
                    <div key={item.id} className="card-glass overflow-hidden group">
                      <div className="aspect-video relative">
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-ebony flex items-center justify-center text-maple">
                            <Play size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-bg/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => deleteGalleryItem(item.id)}
                            className="p-3 bg-danger text-white rounded-full hover:scale-110 transition-transform"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-display text-lg tracking-wide uppercase truncate">{item.title}</p>
                        <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                          {item.type} • {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {gallery.length === 0 && (
                    <div className="col-span-full py-20 text-center card-glass border-dashed">
                      <ImageIcon size={48} className="mx-auto text-muted mb-4" />
                      <p className="font-ui text-xs font-bold text-muted uppercase tracking-widest">No media in gallery yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="card-glass p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-maple/10 rounded-xl text-maple">
                    <SettingsIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl text-text tracking-wide">General Configuration</h3>
                    <p className="text-muted font-ui text-[10px] font-bold uppercase tracking-widest mt-1">Manage festival-wide parameters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Basic Info */}
                  <div className="space-y-8">
                    <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-maple pb-4 border-b border-white/5">Basic Information</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Festival Name</label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          defaultValue={settings['festival_name'] || 'UCSF 2026'}
                          className="form-input"
                          onBlur={(e) => updateSetting('festival_name', e.target.value)}
                        />
                        <button className="btn-ghost px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Festival Dates</label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          defaultValue={settings['festival_dates'] || 'April 15-20, 2026'}
                          className="form-input"
                          onBlur={(e) => updateSetting('festival_dates', e.target.value)}
                        />
                        <button className="btn-ghost px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Festival Subtitle</label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          defaultValue={settings['festival_subtitle'] || 'Union of Culture & Sports Fest'}
                          className="form-input"
                          onBlur={(e) => updateSetting('festival_subtitle', e.target.value)}
                        />
                        <button className="btn-ghost px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Email</label>
                      <div className="flex gap-4">
                        <input
                          type="email"
                          defaultValue={settings['contact_email'] || 'info@ucsf2026.com'}
                          className="form-input"
                          onBlur={(e) => updateSetting('contact_email', e.target.value)}
                        />
                        <button className="btn-ghost px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <Save size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Registration & Status */}
                  <div className="space-y-8">
                    <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-maple pb-4 border-b border-white/5">System Status</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Registration Status</label>
                      <select
                        className="form-input"
                        defaultValue={settings['registration_open'] || 'true'}
                        onChange={(e) => updateSetting('registration_open', e.target.value)}
                      >
                        <option value="true">Open (Accepting Entries)</option>
                        <option value="false">Closed (Disabled)</option>
                      </select>
                      <p className="text-[10px] text-muted mt-2 uppercase tracking-widest">Controls the visibility of the registration form</p>
                    </div>

                    <div className="space-y-6 pt-8 border-t border-border">
                      <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-maple pb-4 border-b border-white/5">Google Form Links</h4>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="form-label">Sports Registration Form URL</label>
                          <input
                            type="text"
                            defaultValue={settings['google_form_sports'] || ''}
                            onBlur={(e) => updateSetting('google_form_sports', e.target.value)}
                            className="form-input"
                            placeholder="https://forms.gle/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="form-label">Cultural Registration Form URL</label>
                          <input
                            type="text"
                            defaultValue={settings['google_form_cultural'] || ''}
                            onBlur={(e) => updateSetting('google_form_cultural', e.target.value)}
                            className="form-input"
                            placeholder="https://forms.gle/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="form-label">Volunteer Signup Form URL</label>
                          <input
                            type="text"
                            defaultValue={settings['google_form_volunteer'] || ''}
                            onBlur={(e) => updateSetting('google_form_volunteer', e.target.value)}
                            className="form-input"
                            placeholder="https://forms.gle/..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Announcement Banner</label>
                      <div className="flex gap-4">
                        <textarea
                          defaultValue={settings['announcement_text'] || ''}
                          className="form-input min-h-[100px] py-4"
                          placeholder="Enter global announcement..."
                          onBlur={(e) => updateSetting('announcement_text', e.target.value)}
                        />
                        <button className="btn-ghost px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest h-fit">
                          <Save size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Footer Copyright Text</label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          defaultValue={settings['footer_text'] || ''}
                          className="form-input"
                          placeholder="e.g. © 2026 UCSF. All rights reserved."
                          onBlur={(e) => updateSetting('footer_text', e.target.value)}
                        />
                        <button className="btn-ghost px-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <Save size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="space-y-8 lg:col-span-2">
                    <h4 className="font-ui text-xs font-bold uppercase tracking-[0.2em] text-maple pb-4 border-b border-white/5">Social & External Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="form-group">
                        <label className="form-label">Instagram URL</label>
                        <input
                          type="text"
                          defaultValue={settings['instagram_url'] || ''}
                          className="form-input"
                          onBlur={(e) => updateSetting('instagram_url', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Facebook URL</label>
                        <input
                          type="text"
                          defaultValue={settings['facebook_url'] || ''}
                          className="form-input"
                          onBlur={(e) => updateSetting('facebook_url', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">YouTube Stream URL</label>
                        <input
                          type="text"
                          defaultValue={settings['youtube_url'] || ''}
                          className="form-input"
                          onBlur={(e) => updateSetting('youtube_url', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw Settings (For power users) */}
              <div className="card-glass p-8 opacity-50 hover:opacity-100 transition-opacity">
                <h4 className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted mb-6">Advanced: All Settings Keys</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(settings).map(([key, val]) => (
                    <div key={key} className="p-4 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                      <span className="font-mono text-[10px] text-muted truncate mr-4">{key}</span>
                      <span className="font-ui text-[10px] font-bold text-text truncate max-w-[150px]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md card-glass p-8 shadow-2xl border-maple/20"
            >
              <div className="flex items-center gap-4 mb-6 text-maple">
                <div className="w-12 h-12 rounded-full bg-maple/10 flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-ui font-bold uppercase tracking-widest">{confirmModal.title}</h3>
              </div>
              
              <p className="text-muted mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 btn-ghost py-4 font-ui text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 bg-maple hover:bg-maple/90 text-white py-4 font-ui text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-maple/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
</div>
  );
}
