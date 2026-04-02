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
  Upload
} from 'lucide-react';
import { Match, House, ScheduleItem, Category } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPanelProps {
  matches: Match[];
  houses: House[];
  schedule: ScheduleItem[];
  categories: Category[];
  settings: Record<string, string>;
  refresh: () => void;
}

type AdminTab = 'dashboard' | 'matches' | 'schedule' | 'houses' | 'categories' | 'brochure' | 'settings';

export default function AdminPanel({ matches, houses, schedule, categories, settings, refresh }: AdminPanelProps) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else setSession(data.session);
    setLoading(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  };

  const updateMatch = async (matchId: number, updates: Partial<Match>) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('matches').update(updates).eq('id', matchId);
    if (error) setError(error.message);
    else {
      await supabase.rpc('recompute_points');
      refresh();
    }
    setLoading(false);
  };

  const addMatch = async () => {
    if (!supabase) return;
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
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const deleteMatch = async (id: number) => {
    if (!supabase || !window.confirm('Delete this match?')) return;
    setLoading(true);
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const updateSchedule = async (itemId: number, updates: Partial<ScheduleItem>) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('schedule').update(updates).eq('id', itemId);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const addSchedule = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('schedule').insert([{
      day_label: 'Day 1',
      day_date: 'April 10, 2026',
      time_start: '09:00 AM',
      title: 'New Event',
      status: 'upcoming',
      sort_order: schedule.length + 1
    }]);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const deleteSchedule = async (id: number) => {
    if (!supabase || !window.confirm('Delete this event?')) return;
    setLoading(true);
    const { error } = await supabase.from('schedule').delete().eq('id', id);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const updateHouse = async (houseId: string, updates: Partial<House>) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('houses').update(updates).eq('id', houseId);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const updateCategory = async (catId: string, updates: Partial<Category>) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('categories').update(updates).eq('id', catId);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const addCategory = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('categories').insert([{
      name: 'New Sport',
      icon: '🏆',
      sort_order: categories.length + 1
    }]);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const deleteCategory = async (id: string) => {
    if (!supabase || !window.confirm('Delete this category? This might affect matches linked to it.')) return;
    setLoading(true);
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const addHouse = async () => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('houses').insert([{
      name: 'New House',
      color: '#ffffff',
      mascot: '🛡️',
      points: 0,
      rank_pos: houses.length + 1
    }]);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const deleteHouse = async (id: string) => {
    if (!supabase || !window.confirm('Delete this house? This might affect matches linked to it.')) return;
    setLoading(true);
    const { error } = await supabase.from('houses').delete().eq('id', id);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

  const updateSetting = async (key: string, val: string) => {
    if (!supabase) return;
    setLoading(true);
    const { error } = await supabase.from('settings').update({ val }).eq('key_name', key);
    if (error) setError(error.message);
    else refresh();
    setLoading(false);
  };

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
              <div className="w-20 h-20 bg-maple flex items-center justify-center text-bg mx-auto mb-8 shadow-[0_0_30px_rgba(245,197,24,0.3)] skew-x-[-12deg]">
                <Shield size={40} className="skew-x-[12deg]" />
              </div>
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
                <div className="w-10 h-10 bg-maple/20 flex items-center justify-center text-maple skew-x-[-12deg]">
                  <Shield size={20} className="skew-x-[12deg]" />
                </div>
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
                                value={match.category_id}
                                onChange={(e) => updateMatch(match.id, { category_id: e.target.value })}
                                className="form-select py-1 text-[10px] w-auto"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
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
                                value={match.team1_id}
                                onChange={(e) => updateMatch(match.id, { team1_id: e.target.value })}
                                className="form-select py-1 text-[11px]"
                              >
                                {houses.map(h => (
                                  <option key={h.id} value={h.id}>{h.mascot} {h.name}</option>
                                ))}
                              </select>
                              <select
                                value={match.team2_id}
                                onChange={(e) => updateMatch(match.id, { team2_id: e.target.value })}
                                className="form-select py-1 text-[11px]"
                              >
                                {houses.map(h => (
                                  <option key={h.id} value={h.id}>{h.mascot} {h.name}</option>
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
                              value={match.status}
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
                              value={item.status}
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
              <div className="flex justify-end">
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
                      <div className="relative group">
                        <div className="w-24 h-24 bg-white/5 flex items-center justify-center text-5xl filter drop-shadow-lg border border-border">
                          {house.mascot}
                        </div>
                        <input
                          type="text"
                          defaultValue={house.mascot || ''}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onBlur={(e) => updateHouse(house.id, { mascot: e.target.value })}
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-maple text-bg flex items-center justify-center rounded-full shadow-lg pointer-events-none">
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
                        <input
                          type="text"
                          defaultValue={house.mascot_name || ''}
                          placeholder="Mascot Name"
                          className="w-full bg-transparent border-b border-border font-ui text-[10px] font-bold text-muted uppercase tracking-widest focus:border-maple outline-none"
                          onBlur={(e) => updateHouse(house.id, { mascot_name: e.target.value })}
                        />
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
                        {cat.icon}
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
                              .from('brochures')
                              .upload(fileName, file, {
                                cacheControl: '3600',
                                upsert: true
                              });

                            if (uploadError) throw uploadError;

                            const { data: { publicUrl } } = supabase.storage
                              .from('brochures')
                              .getPublicUrl(fileName);

                            await updateSetting('brochure_url', publicUrl);
                            alert('Brochure uploaded successfully!');
                          } catch (err: any) {
                            console.error('Upload error:', err);
                            setError(`Upload failed: ${err.message}. Make sure the 'brochures' bucket exists in Supabase Storage and is public.`);
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

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="card-glass p-8">
                <h3 className="text-2xl text-text mb-8 tracking-wide">General Settings</h3>
                <div className="space-y-8">
                  {Object.entries(settings).map(([key, val]) => (
                    <div key={key} className="form-group">
                      <label className="form-label">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <div className="flex gap-4">
                        <input
                          type="text"
                          defaultValue={val}
                          className="form-input"
                          onBlur={(e) => updateSetting(key, e.target.value)}
                        />
                        <button className="btn-ghost px-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <Save size={16} />
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  </div>
</div>
  );
}
