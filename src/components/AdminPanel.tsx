import React, { useState, useMemo, useEffect, useRef } from 'react';
import Papa from 'papaparse';
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
  ExternalLink,
  Image as ImageIcon,
  X,
  Bell,
  Eye,
  FileWarning,
  Share2,
  Clock,
  MapPin,
  CheckCircle,
  History
} from 'lucide-react';
import { Match, House, ScheduleItem, Category, Notice, StagedChange, Profile, CulturalResult } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

function CategoryCard({ 
  cat, 
  deleteCategory, 
  updateCategory, 
  handleSupabaseError,
  culturalResults,
  houses,
  addCulturalResult,
  updateCulturalResult,
  deleteCulturalResult
}: { 
  cat: Category, 
  deleteCategory: (id: string) => void, 
  updateCategory: (id: string, updates: Partial<Category>) => void,
  handleSupabaseError: (err: any, context: string) => void,
  culturalResults: CulturalResult[],
  houses: House[],
  addCulturalResult: (catId: string) => void,
  updateCulturalResult: (id: number, updates: Partial<CulturalResult>) => void,
  deleteCulturalResult: (id: number) => void
}) {
  const [loading, setLoading] = useState(false);
  const [showDynasty, setShowDynasty] = useState(false);
  
  const catResults = culturalResults.filter(r => r.category_id === cat.id);

  return (
    <motion.div 
      layout
      className="bg-bg2 border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-10 group hover:border-maple/30 transition-all shadow-2xl space-y-6 sm:space-y-8 relative flex flex-col h-full"
    >
      <button 
        onClick={() => deleteCategory(cat.id)}
        className="absolute top-6 right-6 w-10 h-10 bg-danger/10 hover:bg-danger text-danger hover:text-white rounded-xl transition-all border border-danger/20 flex items-center justify-center active:scale-90 z-30"
        title="Delete Category"
      >
        <Trash2 size={18} />
      </button>

    <div className="flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8 pr-12">
      <div className="relative group/icon w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-[1.2rem] sm:rounded-[2rem] flex items-center justify-center text-3xl sm:text-5xl border border-white/5 group-hover:border-maple/50 transition-all overflow-hidden shadow-inner shrink-0">
        {cat.image_url ? (
          <img 
            src={cat.image_url} 
            alt={cat.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="relative z-10">{cat.icon || <Layers size={24} className="text-muted/30" />}</span>
        )}
        <input
          type="text"
          value={cat.icon || ''}
          placeholder="Emoji"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          onChange={(e) => updateCategory(cat.id, { icon: e.target.value })}
        />
        <div className="absolute inset-0 bg-maple/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="text-[7px] font-bold uppercase tracking-widest text-maple mt-10 sm:mt-14">Edit Icon</span>
        </div>
      </div>
      <div className="flex-1 space-y-4 sm:space-y-5 w-full">
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            value={cat.name}
            className="flex-1 bg-transparent border-none text-xl sm:text-3xl font-display uppercase tracking-tighter text-white outline-none focus:text-maple transition-colors min-w-0"
            onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 shadow-inner">
            <span className="font-ui text-[8px] sm:text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Order</span>
            <input
              type="number"
              value={cat.sort_order}
              className="w-8 sm:w-10 bg-transparent border-none text-white text-[10px] sm:text-[11px] font-bold text-center outline-none focus:text-maple"
              onChange={(e) => updateCategory(cat.id, { sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 p-1 border border-white/5 rounded-lg sm:rounded-xl">
            {['sport', 'cultural'].map((type) => (
              <button
                key={type}
                onClick={() => updateCategory(cat.id, { category_type: type as any })}
                className={cn(
                  "px-3 sm:px-4 py-1.5 sm:py-2 font-ui text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] transition-all rounded-md sm:rounded-lg whitespace-nowrap",
                  (cat.category_type || 'sport') === type ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-3 sm:space-y-4 pt-4 border-t border-white/5">
      <div className="space-y-2">
        <label className="font-ui text-[8px] sm:text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Image URL</label>
        <div className="relative group/img flex gap-3">
          <input
            type="text"
            value={cat.image_url || ''}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-[9px] sm:text-[10px] font-bold tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all shadow-inner pr-10 sm:pr-12"
            onChange={(e) => updateCategory(cat.id, { image_url: e.target.value })}
            id={`cat-img-${cat.id}`}
          />
          <button 
            onClick={() => document.getElementById(`cat-upload-${cat.id}`)?.click()}
            className="bg-white/5 hover:bg-white/10 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 transition-all active:scale-90 shadow-lg"
            title="Upload Image"
          >
            <Upload size={16} />
          </button>
          <input 
            type="file"
            id={`cat-upload-${cat.id}`}
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !supabase) return;
              setLoading(true);
              try {
                const fileName = `cat_${cat.id}_${Date.now()}`;
                const { error: uploadError } = await supabase.storage.from('ucsf-media').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
                updateCategory(cat.id, { image_url: publicUrl });
                const input = document.getElementById(`cat-img-${cat.id}`) as HTMLInputElement;
                if (input) input.value = publicUrl;
              } catch (err: any) {
                handleSupabaseError(err, 'Category image upload failed');
              } finally {
                setLoading(false);
              }
            }}
          />
          <div className="absolute right-16 top-1/2 -translate-y-1/2 text-muted/30 group-focus-within/img:text-maple transition-colors pointer-events-none">
            <ImageIcon size={16} />
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
      {[
        { label: 'Gender', key: 'gender', placeholder: 'Boys/Girls' },
        { label: 'Team Size', key: 'team_size', placeholder: '11 Players' },
        { label: 'Duration', key: 'duration', placeholder: '20 mins' }
      ].map((field) => (
        <div key={field.key} className="space-y-2">
          <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">{field.label}</label>
          <input
            type="text"
            value={(cat[field.key as keyof typeof cat] as any) || ''}
            placeholder={field.placeholder}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all shadow-inner"
            onChange={(e) => updateCategory(cat.id, { [field.key]: e.target.value })}
          />
        </div>
      ))}

      <div className="col-span-2 space-y-2">
        <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Special Rules & Regulations</label>
        <textarea
          value={cat.special_rules || ''}
          placeholder="Enter rules and regulations..."
          className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-[10px] font-bold tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all shadow-inner min-h-[120px]"
          onChange={(e) => updateCategory(cat.id, { special_rules: e.target.value })}
        />
      </div>

      <div className="col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Judging Criteria</label>
          <button 
            onClick={() => {
              const current = cat.judging_criteria || [];
              updateCategory(cat.id, { judging_criteria: [...current, { criterion: 'New Criterion', weight: '10 pts' }] });
            }}
            className="text-maple hover:text-white transition-colors flex items-center gap-2 font-ui text-[8px] font-bold uppercase tracking-widest"
          >
            <Plus size={12} /> Add Criterion
          </button>
        </div>
        <div className="space-y-3">
          {(cat.judging_criteria || []).map((item, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <input
                type="text"
                value={item.criterion}
                placeholder="Criterion"
                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold text-muted outline-none focus:border-maple/50 focus:text-text min-w-0"
                onChange={(e) => {
                  const newCriteria = [...(cat.judging_criteria || [])];
                  newCriteria[idx] = { ...newCriteria[idx], criterion: e.target.value };
                  updateCategory(cat.id, { judging_criteria: newCriteria });
                }}
              />
              <input
                type="text"
                value={item.weight}
                placeholder="Weight"
                className="w-24 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold text-maple text-center outline-none focus:border-maple/50"
                onChange={(e) => {
                  const newCriteria = [...(cat.judging_criteria || [])];
                  newCriteria[idx] = { ...newCriteria[idx], weight: e.target.value };
                  updateCategory(cat.id, { judging_criteria: newCriteria });
                }}
              />
              <button 
                onClick={() => {
                  const newCriteria = (cat.judging_criteria || []).filter((_, i) => i !== idx);
                  updateCategory(cat.id, { judging_criteria: newCriteria });
                }}
                className="p-2 text-danger/50 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {cat.category_type === 'cultural' && (
        <div className="col-span-2 pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={18} className="text-maple" />
              <h4 className="font-display text-lg uppercase tracking-wider text-white">Dynasty Points</h4>
            </div>
            <button 
              onClick={() => addCulturalResult(cat.id)}
              className="bg-maple/10 hover:bg-maple/20 text-maple py-2 px-4 rounded-lg font-ui text-[9px] font-bold uppercase tracking-widest transition-all border border-maple/20 flex items-center gap-2"
            >
              <Plus size={14} /> Add Entry
            </button>
          </div>

          <div className="space-y-3">
            {catResults.sort((a, b) => (a.rank || 0) - (b.rank || 0)).map((result) => (
              <div key={result.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center font-display text-sm text-maple shrink-0">
                  <input
                    type="number"
                    value={result.rank || ''}
                    placeholder="R"
                    className="w-full bg-transparent border-none text-center outline-none"
                    onChange={(e) => updateCulturalResult(result.id, { rank: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <select
                  value={result.house_id}
                  onChange={(e) => updateCulturalResult(result.id, { house_id: e.target.value })}
                  className="flex-1 bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-white outline-none"
                >
                  {houses.map(h => <option key={h.id} value={h.id} className="bg-bg-dark">{h.name}</option>)}
                </select>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-[8px] font-bold text-muted uppercase">Pts</span>
                  <input
                    type="number"
                    value={result.points || ''}
                    className="w-10 bg-transparent border-none text-[10px] font-bold text-maple text-center outline-none"
                    onChange={(e) => updateCulturalResult(result.id, { points: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <button 
                  onClick={() => deleteCulturalResult(result.id)}
                  className="p-2 text-danger/50 hover:text-danger rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {catResults.length === 0 && (
              <p className="text-center py-4 text-[9px] font-bold text-muted uppercase tracking-widest opacity-40">No dynasty points entered yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  </motion.div>
  );
};

type AdminTab = 'results' | 'matches' | 'schedule' | 'categories' | 'notices' | 'gallery' | 'leaderboards' | 'settings' | 'changes';

interface AdminPanelProps {
  matches: Match[];
  houses: House[];
  schedule: ScheduleItem[];
  categories: Category[];
  notices: Notice[];
  gallery: any[];
  culturalResults: any[];
  stagedChanges: StagedChange[];
  profile: Profile | null;
  settings: Record<string, string>;
  refresh: () => void;
  onBack?: () => void;
}

export default function AdminPanel({ matches, houses, schedule, categories, notices, gallery, culturalResults, stagedChanges, profile, settings, refresh, onBack }: AdminPanelProps) {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [discardKey, setDiscardKey] = useState(0);
  const [pendingChanges, setPendingChanges] = useState<Record<string, Record<string, any>>>({
    categories: {},
    matches: {},
    schedule: {},
    notices: {},
    gallery: {},
    cultural_results: {},
    houses: {},
    settings: {}
  });

  // Merged data for live preview
  const displayCategories = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      ...(pendingChanges.categories?.[cat.id] || {})
    }));
  }, [categories, pendingChanges.categories]);

  const displayMatches = useMemo(() => {
    return matches.map(m => ({
      ...m,
      ...(pendingChanges.matches?.[m.id] || {})
    }));
  }, [matches, pendingChanges.matches]);

  const displaySchedule = useMemo(() => {
    return schedule.map(s => ({
      ...s,
      ...(pendingChanges.schedule?.[s.id] || {})
    }));
  }, [schedule, pendingChanges.schedule]);

  const displayNotices = useMemo(() => {
    return notices.map(n => ({
      ...n,
      ...(pendingChanges.notices?.[n.id] || {})
    }));
  }, [notices, pendingChanges.notices]);

  const displayGallery = useMemo(() => {
    return gallery.map(item => ({
      ...item,
      ...(pendingChanges.gallery?.[item.id] || {})
    }));
  }, [gallery, pendingChanges.gallery]);

  const displayCulturalResults = useMemo(() => {
    return culturalResults.map(r => ({
      ...r,
      ...(pendingChanges.cultural_results?.[r.id] || {})
    }));
  }, [culturalResults, pendingChanges.cultural_results]);
  // Nested CategoryCard removed

  const [activeTab, setActiveTab] = useState<AdminTab>('results');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedResultCategory, setSelectedResultCategory] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [matchVenueFilter, setMatchVenueFilter] = useState<string>('all');
  const [scheduleVenueFilter, setScheduleVenueFilter] = useState<string>('all');

  const allVenues = useMemo(() => {
    const venues = new Set<string>();
    schedule.forEach(s => { if (s.venue) venues.add(s.venue); });
    matches.forEach(m => { if (m.venue) venues.add(m.venue); });
    return Array.from(venues).sort();
  }, [schedule, matches]);

  const categoriesByVenue = useMemo(() => {
    const map: Record<string, Set<string>> = { 'all': new Set(categories.map(c => c.id)) };
    
    allVenues.forEach(v => map[v] = new Set());

    schedule.forEach(s => {
      if (s.venue && s.category) {
        const cat = categories.find(c => c.name === s.category);
        if (cat) map[s.venue].add(cat.id);
      }
    });

    matches.forEach(m => {
      if (m.venue && m.category_id) {
        map[m.venue].add(m.category_id);
      }
    });

    return map;
  }, [categories, allVenues, schedule, matches]);

  // Load pending changes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ucsf_pending_changes');
    if (saved) {
      try {
        setPendingChanges(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load pending changes', e);
      }
    }
  }, []);

  // Auto-save pending changes to localStorage
  useEffect(() => {
    localStorage.setItem('ucsf_pending_changes', JSON.stringify(pendingChanges));
  }, [pendingChanges]);

  const hasPendingChanges = useMemo(() => {
    return Object.values(pendingChanges).some(table => Object.keys(table).length > 0) || hasChanges;
  }, [pendingChanges, hasChanges]);

  const stageChange = (table: string, id: string | number, updates: any) => {
    setPendingChanges(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [id]: {
          ...(prev[table][id] || {}),
          ...updates
        }
      }
    }));
  };

  const publishAllChanges = async () => {
    if (!supabase || !(await checkSession())) return;
    
    // If super admin, publish directly. If not, submit for approval.
    const isSuperAdmin = profile?.is_super_admin;

    setConfirmModal({
      isOpen: true,
      title: isSuperAdmin ? 'Publish All Changes' : 'Submit for Approval',
      message: isSuperAdmin 
        ? 'This will push all staged changes to the live website. Are you sure?'
        : 'Your changes will be submitted to the Super Admin for approval. Continue?',
      onConfirm: async () => {
        setLoading(true);
        try {
          if (isSuperAdmin) {
            // 1. Settings
            if (hasChanges) {
              const updates = Object.entries(localSettings).map(([key, val]) => ({
                key_name: key,
                val: val
              }));
              const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key_name' });
              if (error) throw error;
            }

            // 2. Other tables
            for (const [table, changes] of Object.entries(pendingChanges)) {
              if (table === 'settings') continue;
              for (const [id, updates] of Object.entries(changes)) {
                const { error } = await supabase.from(table).update(updates).eq('id', id);
                if (error) throw error;
              }
            }

            await supabase.rpc('recompute_points');
            setSuccess('All changes published successfully!');
          } else {
            // Submit to staged_changes table
            const stagedEntries: any[] = [];
            
            // Handle settings
            if (hasChanges) {
              stagedEntries.push({
                table_name: 'settings',
                record_id: 'batch_settings',
                updates: localSettings,
                created_by: session.user.id,
                created_by_email: session.user.email
              });
            }

            // Handle other tables
            for (const [table, changes] of Object.entries(pendingChanges)) {
              if (table === 'settings') continue;
              for (const [id, updates] of Object.entries(changes)) {
                stagedEntries.push({
                  table_name: table,
                  record_id: String(id),
                  updates: updates,
                  created_by: session.user.id,
                  created_by_email: session.user.email
                });
              }
            }

            if (stagedEntries.length > 0) {
              const { error } = await supabase.from('staged_changes').insert(stagedEntries);
              if (error) throw error;
              setSuccess('Changes submitted for approval!');
            }
          }

          setPendingChanges({
            categories: {},
            matches: {},
            schedule: {},
            notices: {},
            cultural_results: {},
            houses: {},
            settings: {}
          });
          localStorage.removeItem('ucsf_pending_changes');
          setHasChanges(false);
          setTimeout(() => setSuccess(null), 3000);
          refresh();
        } catch (err: any) {
          handleSupabaseError(err, isSuperAdmin ? 'Failed to publish changes' : 'Failed to submit changes');
        } finally {
          setLoading(true); // Keep loading until refresh completes
          setTimeout(() => setLoading(false), 1000);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const approveChange = async (change: StagedChange) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    try {
      if (change.table_name === 'settings') {
        const updates = Object.entries(change.updates).map(([key, val]) => ({
          key_name: key,
          val: val
        }));
        const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key_name' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from(change.table_name).update(change.updates).eq('id', change.record_id);
        if (error) throw error;
      }

      const { error: updateError } = await supabase.from('staged_changes').update({ status: 'approved' }).eq('id', change.id);
      if (updateError) throw updateError;

      await supabase.rpc('recompute_points');
      setSuccess('Change approved and published!');
      setTimeout(() => setSuccess(null), 3000);
      refresh();
    } catch (err: any) {
      handleSupabaseError(err, 'Failed to approve change');
    } finally {
      setLoading(false);
    }
  };

  const discardStagedChange = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('staged_changes').update({ status: 'discarded' }).eq('id', id);
      if (error) throw error;
      setSuccess('Change discarded');
      setTimeout(() => setSuccess(null), 3000);
      refresh();
    } catch (err: any) {
      handleSupabaseError(err, 'Failed to discard change');
    } finally {
      setLoading(false);
    }
  };

  const discardAllChanges = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all staged changes? This cannot be undone.',
      onConfirm: () => {
        setPendingChanges({
          categories: {},
          matches: {},
          schedule: {},
          notices: {},
          gallery: {},
          cultural_results: {},
          houses: {},
          settings: {}
        });
        localStorage.removeItem('ucsf_pending_changes');
        setLocalSettings(settings);
        setHasChanges(false);
        setDiscardKey(prev => prev + 1);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Sync local settings when settings prop changes
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleSettingChange = (key: string, val: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: val }));
    setHasChanges(true);
  };

  const saveAllSettings = async () => {
    await publishAllChanges();
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
    stageChange('matches', matchId, updates);
  };

  const addMatch = async (categoryId?: string) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('matches').insert([{
      category_id: categoryId || categories[0]?.id,
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
    stageChange('schedule', itemId, updates);
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

  const updateCategory = async (catId: string, updates: Partial<Category>) => {
    stageChange('categories', catId, updates);
  };

  const addCategory = async () => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('categories').insert([{
      name: 'New Sport',
      icon: '',
      category_type: 'sport',
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

  const updateNotice = async (id: number, updates: Partial<Notice>) => {
    stageChange('notices', id, updates);
  };

  const handleNoticeSubmit = async () => {
    if (!supabase || !(await checkSession())) return;
    
    if (noticeModal?.notice) {
      // It's an update, stage it
      stageChange('notices', noticeModal.notice.id, noticeFormData);
      setNoticeModal(null);
      setNoticeFormData({ title: '', content: '', priority: 'low' });
    } else {
      // It's a new notice, we'll insert it immediately as it's hard to stage without ID
      setLoading(true);
      try {
        const { error } = await supabase.from('notices').insert([noticeFormData]);
        if (error) throw error;
        setNoticeModal(null);
        setNoticeFormData({ title: '', content: '', priority: 'low' });
        refresh();
      } catch (err: any) {
        handleSupabaseError(err, 'Failed to save notice');
      } finally {
        setLoading(false);
      }
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

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('docs.google.com/spreadsheets')) {
      if (url.includes('/edit')) {
        return url.split('/edit')[0] + '/preview';
      }
      if (!url.includes('/preview') && !url.includes('/pubhtml')) {
        return url + (url.includes('?') ? '&' : '?') + 'rm=minimal';
      }
    }
    return url;
  };

  const updateGalleryItem = (id: number, updates: any) => {
    stageChange('gallery', id, updates);
  };

  const addGalleryItems = async (files: FileList) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const { error: uploadError } = await supabase.storage.from('ucsf-media').upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
        
        return {
          title: '', // No name initially as requested
          url: publicUrl,
          type: file.type.startsWith('video') ? 'video' : 'image',
          year: '2026'
        };
      });

      const newItems = await Promise.all(uploadPromises);
      const { error } = await supabase.from('gallery').insert(newItems);
      if (error) throw error;
      
      refresh();
      setSuccess(`Successfully uploaded ${files.length} items to gallery`);
    } catch (err: any) {
      handleSupabaseError(err, 'Failed to upload gallery items');
    } finally {
      setLoading(false);
    }
  };

  const deleteGalleryItem = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Media',
      message: 'Are you sure you want to delete this gallery item?',
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

  const syncFromGoogleSheets = async () => {
    const spreadsheetUrl = settings['spreadsheet_url'];
    if (!spreadsheetUrl) {
      setError('No spreadsheet URL configured in settings');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert Google Sheets URL to CSV export URL
      let csvUrl = spreadsheetUrl;
      if (spreadsheetUrl.includes('/edit')) {
        csvUrl = spreadsheetUrl.split('/edit')[0] + '/export?format=csv';
      } else if (!spreadsheetUrl.endsWith('format=csv')) {
        csvUrl = spreadsheetUrl + (spreadsheetUrl.includes('?') ? '&' : '?') + 'format=csv';
      }

      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Failed to fetch spreadsheet data');
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as any[];
          if (data.length === 0) {
            setError('No data found in spreadsheet');
            setLoading(false);
            return;
          }

          // Expected columns: name, house, category, grade, section, role
          // Map house names and category names to IDs
          const houseMap = new Map(houses.map(h => [h.name.toLowerCase(), h.id]));
          const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

          const newStudents = data.map(row => ({
            name: row.name || row.Name || '',
            house_id: houseMap.get((row.house || row.House || row.house_name || '').toLowerCase()),
            category_id: categoryMap.get((row.category || row.Category || row.category_name || '').toLowerCase()),
            grade: row.grade || row.Grade || '',
            section: row.section || row.Section || '',
            role: row.role || row.Role || ''
          })).filter(s => s.name && s.house_id && s.category_id);

          if (newStudents.length === 0) {
            setError('No valid students found. Check column names (name, house, category, grade, section, role)');
            setLoading(false);
            return;
          }

          // Delete existing students and insert new ones
          // Note: selected_students table is removed, so we should probably remove this logic or update it to something else
          // For now, I'll just comment it out as the user wants to remove the feature.
          /*
          const { error: deleteError } = await supabase!.from('selected_students').delete().neq('id', 0);
          if (deleteError) throw deleteError;

          const { error: insertError } = await supabase!.from('selected_students').insert(newStudents);
          if (insertError) throw insertError;
          */

          setSuccess(`Successfully imported ${newStudents.length} students (Note: selected students feature is disabled)`);
          refresh();
          setLoading(false);
        },
        error: (err: any) => {
          setError(`CSV Parsing Error: ${err.message}`);
          setLoading(false);
        }
      });
    } catch (err: any) {
      setError(`Import Error: ${err.message}`);
      setLoading(false);
    }
  };

  const updateCulturalResult = async (id: number, updates: any) => {
    stageChange('cultural_results', id, updates);
  };

  const addCulturalResult = async (catId: string) => {
    if (!supabase || !(await checkSession())) return;
    setLoading(true);
    const { error } = await supabase.from('cultural_results').insert([{
      category_id: catId,
      house_id: houses[0]?.id,
      rank: 1,
      points: 0
    }]);
    if (error) handleSupabaseError(error, 'Failed to add cultural result');
    else {
      refresh();
      setLoading(false);
    }
  };

  const deleteCulturalResult = async (id: number) => {
    if (!supabase || !(await checkSession())) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Result',
      message: 'Are you sure you want to delete this cultural result?',
      onConfirm: async () => {
        setLoading(true);
        const { error } = await supabase.from('cultural_results').delete().eq('id', id);
        if (error) handleSupabaseError(error, 'Failed to delete result');
        else {
          refresh();
          setLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  useEffect(() => {
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
      <div className="min-h-screen bg-bg text-white flex overflow-hidden relative">
        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[60] lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-72 bg-[#0d1b33] border-r border-white/5 flex flex-col flex-shrink-0 z-[70] transition-transform duration-300 lg:translate-x-0 lg:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-10 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center justify-center flex-1">
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={localSettings['school_logo_url'] || "https://www.shalomhills.com/images/logo.png"} 
                alt="School Logo" 
                className="h-14 object-contain drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-muted hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
            {[
              { id: 'results', label: 'Event Results', icon: Trophy },
              { id: 'matches', label: 'Matches', icon: Activity },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'categories', label: 'Categories', icon: Layers },
              { id: 'notices', label: 'Notices', icon: Bell },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
              ...(profile?.is_super_admin ? [{ id: 'changes', label: 'Approvals', icon: CheckCircle }] : []),
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 font-sans text-[11px] font-bold uppercase tracking-[0.2em] transition-all group rounded-2xl border border-transparent",
                  activeTab === item.id 
                    ? "bg-maple text-bg shadow-xl shadow-maple/20 border-maple/50" 
                    : "text-muted hover:text-text hover:bg-white/5 hover:border-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={cn(
                    "transition-all duration-300",
                    activeTab === item.id ? "text-bg scale-110" : "text-muted group-hover:text-maple group-hover:scale-110"
                  )} />
                  {item.label}
                </div>
                {item.id === 'settings' && hasChanges && (
                  <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-[0_0_15px_rgba(230,57,70,0.8)]" />
                )}
                {item.id === 'changes' && stagedChanges.filter(c => c.status === 'pending').length > 0 && (
                  <div className="bg-danger text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    {stagedChanges.filter(c => c.status === 'pending').length}
                  </div>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5 space-y-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-ui text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 border border-white/5"
              >
                <ExternalLink size={14} />
                Back to Site
              </button>
            )}
            {hasPendingChanges && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-maple/10 border border-maple/30 rounded-[2rem] backdrop-blur-sm space-y-3"
            >
              <div className="flex items-center justify-center gap-2 text-maple mb-1">
                <AlertCircle size={14} />
                <p className="font-ui text-[9px] font-bold uppercase tracking-[0.3em]">
                  {profile?.is_super_admin ? 'Unpublished Changes' : 'Pending Approval'}
                </p>
              </div>
              <button 
                onClick={publishAllChanges}
                className="w-full py-4 bg-maple text-bg font-ui text-[10px] font-bold uppercase tracking-widest hover:bg-maple/90 transition-all shadow-xl shadow-maple/30 rounded-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={14} />
                {profile?.is_super_admin ? 'Publish Changes' : 'Submit for Approval'}
              </button>
              <button 
                onClick={discardAllChanges}
                className="w-full py-3 bg-white/5 text-muted font-ui text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all rounded-xl active:scale-95"
              >
                Discard All
              </button>
            </motion.div>
          )}

          <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all cursor-default">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-maple to-maple/50 flex items-center justify-center text-bg font-display text-lg font-bold shadow-lg shadow-maple/20">
              {session.user.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-ui text-[11px] font-bold text-text truncate">{session.user.email}</p>
              <p className="font-ui text-[8px] font-bold text-subtle uppercase tracking-[0.4em] mt-1">System Admin</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-4 font-ui text-[9px] font-bold uppercase tracking-widest text-danger bg-danger/5 hover:bg-danger/10 transition-all rounded-2xl border border-danger/10 active:scale-95"
            >
              <LogOut size={14} />
              Exit
            </button>
            <a
              href="/"
              target="_blank"
              className="flex items-center justify-center gap-2 py-4 font-ui text-[9px] font-bold uppercase tracking-widest text-muted bg-white/5 hover:text-text hover:bg-white/10 transition-all rounded-2xl border border-white/5 active:scale-95"
            >
              <Eye size={14} />
              View Site
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-[#0d1b33]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 lg:px-12 flex-shrink-0 z-40">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-white/5 rounded-xl text-muted hover:text-white transition-all"
            >
              <Shield size={20} />
            </button>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-maple border border-white/5">
              {activeTab === 'results' && <Trophy size={20} />}
              {activeTab === 'matches' && <Activity size={20} />}
              {activeTab === 'schedule' && <Calendar size={20} />}
              {activeTab === 'categories' && <Layers size={20} />}
              {activeTab === 'notices' && <Bell size={20} />}
              {activeTab === 'settings' && <SettingsIcon size={20} />}
              {activeTab === 'gallery' && <ImageIcon size={20} />}
              {activeTab === 'leaderboards' && <Trophy size={20} />}
              {activeTab === 'changes' && <CheckCircle size={20} />}
            </div>
            <div>
              <h2 className="text-xl lg:text-3xl font-display tracking-tighter uppercase text-white leading-none">{activeTab}</h2>
              <p className="hidden sm:block font-sans text-[10px] font-bold text-muted uppercase tracking-[0.4em] mt-2">Management Portal</p>
            </div>
            {loading && (
              <div className="hidden md:flex items-center gap-3 text-maple font-ui text-[9px] font-bold uppercase tracking-[0.3em] bg-maple/10 px-4 py-2 rounded-full border border-maple/20 ml-4 animate-pulse">
                <RefreshCw size={12} className="animate-spin" />
                Synchronizing...
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden xl:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/5 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="font-sans text-[10px] font-bold text-muted uppercase tracking-[0.2em]">System Status: Online</span>
            </div>
            <button 
              onClick={refresh}
              className="w-10 h-10 lg:w-12 lg:h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-muted hover:text-maple transition-all flex items-center justify-center active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <main key={discardKey} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
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
              {activeTab === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 sm:gap-8 max-w-full overflow-hidden">
                    <div className="w-full lg:w-auto text-center lg:text-left">
                      <h2 className="text-2xl sm:text-5xl font-display uppercase tracking-tighter text-white">Event Results</h2>
                      <p className="text-muted mt-2 font-sans text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em]">Enter scores and rankings for real-time feedback</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 w-full lg:w-auto">
                      {/* Venue Selector */}
                      <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-white/5 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar max-w-full w-full pb-2">
                        <button
                          onClick={() => {
                            setSelectedVenue('all');
                            setSelectedResultCategory(null);
                          }}
                          className={cn(
                            "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                            selectedVenue === 'all' ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                          )}
                        >
                          All Venues
                        </button>
                        {allVenues.map(venue => (
                          <button
                            key={venue}
                            onClick={() => {
                              setSelectedVenue(venue);
                              setSelectedResultCategory(null);
                            }}
                            className={cn(
                              "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                              selectedVenue === venue ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                            )}
                          >
                            {venue}
                          </button>
                        ))}
                      </div>

                      {/* Category Selector */}
                      <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-white/5 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar max-w-full w-full pb-2">
                        {displayCategories
                          .filter(cat => categoriesByVenue[selectedVenue].has(cat.id))
                          .map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedResultCategory(cat.id)}
                            className={cn(
                              "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                              selectedResultCategory === cat.id ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                            )}
                          >
                            {cat.name}
                          </button>
                        ))}
                        {displayCategories.filter(cat => categoriesByVenue[selectedVenue].has(cat.id)).length === 0 && (
                          <p className="px-6 py-2 text-[10px] font-bold text-muted uppercase tracking-widest">No events at this venue</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedResultCategory ? (
                    <div className="space-y-12">
                      {/* Sports Matches Section (if applicable) */}
                      {displayCategories.find(c => c.id === selectedResultCategory)?.category_type === 'sport' && (
                        <div className="space-y-8">
                          <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-4">
                              <Activity size={20} className="text-maple" />
                              <h3 className="text-xl sm:text-2xl font-display uppercase tracking-tighter text-white">Match Scores</h3>
                            </div>
                            <button 
                              onClick={() => addMatch(selectedResultCategory)}
                              className="bg-maple/10 hover:bg-maple/20 text-maple py-2 px-4 rounded-lg font-ui text-[9px] font-bold uppercase tracking-[0.2em] transition-all border border-maple/20 flex items-center gap-2 active:scale-95"
                            >
                              <Plus size={14} /> Add Match
                            </button>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {displayMatches.filter(m => m.category_id === selectedResultCategory).map(match => (
                              <div key={match.id} className="bg-bg2 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 space-y-6 relative group">
                                <button 
                                  onClick={() => deleteMatch(match.id)}
                                  className="absolute top-4 right-4 w-8 h-8 bg-danger/5 hover:bg-danger text-danger hover:text-white rounded-lg transition-all border border-danger/10 flex items-center justify-center active:scale-90 opacity-0 group-hover:opacity-100 z-10"
                                  title="Delete Match"
                                >
                                  <Trash2 size={14} />
                                </button>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                  <span className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Match #{match.match_no}</span>
                                  <span className="font-ui text-[9px] font-bold text-maple uppercase tracking-widest">{match.eligible_years}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                                  <div className="text-center space-y-2">
                                    <p className="font-display text-base sm:text-lg uppercase truncate">{houses.find(h => h.id === match.team1_id)?.name}</p>
                                    <input 
                                      type="number" 
                                      value={match.score1}
                                      onChange={(e) => updateMatch(match.id, { score1: parseInt(e.target.value) })}
                                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-center text-2xl font-display text-white outline-none focus:border-maple/50"
                                    />
                                  </div>
                                  <div className="text-center text-muted font-display text-xl sm:text-2xl py-2 sm:py-0">VS</div>
                                  <div className="text-center space-y-2">
                                    <p className="font-display text-base sm:text-lg uppercase truncate">{houses.find(h => h.id === match.team2_id)?.name}</p>
                                    <input 
                                      type="number" 
                                      value={match.score2}
                                      onChange={(e) => updateMatch(match.id, { score2: parseInt(e.target.value) })}
                                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 text-center text-2xl font-display text-white outline-none focus:border-maple/50"
                                    />
                                  </div>
                                </div>

                                <div className="pt-4 space-y-4">
                                  <label className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest block">Winner</label>
                                  <select
                                    value={match.winner_id || ''}
                                    onChange={(e) => updateMatch(match.id, { winner_id: e.target.value || null, status: 'completed' })}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-maple outline-none"
                                  >
                                    <option value="" className="bg-bg-dark">Select Winner</option>
                                    <option value={match.team1_id} className="bg-bg-dark">{houses.find(h => h.id === match.team1_id)?.name}</option>
                                    <option value={match.team2_id} className="bg-bg-dark">{houses.find(h => h.id === match.team2_id)?.name}</option>
                                    <option value="draw" className="bg-bg-dark">Draw</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                            {displayMatches.filter(m => m.category_id === selectedResultCategory).length === 0 && (
                              <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <p className="text-muted font-ui text-[10px] font-bold uppercase tracking-widest">No matches found for this category</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Manual Point Entry Section (Dynasty Rankings) moved to Categories tab */}
                    </div>
                  ) : (
                    <div className="py-40 text-center card-glass">
                      <Trophy size={48} className="mx-auto text-muted mb-4 opacity-20" />
                      <p className="font-ui text-xs font-bold text-muted uppercase tracking-[0.3em]">Select a category to enter results</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'matches' && (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Search & Filter Bar */}
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-[#0d1b33] p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 shadow-2xl max-w-full overflow-hidden">
                    <div className="w-full lg:flex-1 min-w-0 lg:min-w-[300px] relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-maple transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search matches, teams, venues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 focus:border-maple/50 focus:bg-white/10 rounded-xl sm:rounded-2xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 sm:pr-8 text-[12px] sm:text-sm outline-none transition-all placeholder:text-muted/50"
                      />
                    </div>
                    <div className="w-full lg:w-auto flex flex-col gap-4 max-w-full overflow-hidden">
                      <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-white/5 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar max-w-full w-full pb-2">
                        <button
                          onClick={() => setMatchVenueFilter('all')}
                          className={cn(
                            "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                            matchVenueFilter === 'all' ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                          )}
                        >
                          All Venues
                        </button>
                        {allVenues.map(venue => (
                          <button
                            key={venue}
                            onClick={() => setMatchVenueFilter(venue)}
                            className={cn(
                              "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                              matchVenueFilter === venue ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                            )}
                          >
                            {venue}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-white/5 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar max-w-full w-full pb-2">
                          <button
                            onClick={() => setCategoryFilter('all')}
                            className={cn(
                              "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                              categoryFilter === 'all' ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                            )}
                          >
                            All Categories
                          </button>
                          {displayCategories.map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setCategoryFilter(cat.id)}
                              className={cn(
                                "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                                categoryFilter === cat.id ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                              )}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => addMatch(categoryFilter !== 'all' ? categoryFilter : undefined)}
                          className="bg-maple hover:bg-maple/90 text-bg py-4 px-6 rounded-xl font-ui text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center gap-2 shrink-0 active:scale-95"
                        >
                          <Plus size={16} />
                          Add Match
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Matches List - Grouped by Category and Grade */}
                  <div className="space-y-16 pb-20">
                    {displayCategories.map(cat => {
                      const catMatches = displayMatches.filter(m => m.category_id === cat.id);
                      
                      // Only show if category matches filter and search
                      const matchesFilter = categoryFilter === 'all' || categoryFilter === cat.id;
                      const venueFilter = matchVenueFilter === 'all' || catMatches.some(m => m.venue === matchVenueFilter);
                      const matchesSearch = searchQuery === '' || 
                        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        catMatches.some(m => 
                          houses.find(h => h.id === m.team1_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          houses.find(h => h.id === m.team2_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.venue?.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                      if (!matchesFilter || !venueFilter || !matchesSearch) return null;

                      // Group matches by grade
                      const matchesByGrade: Record<string, Match[]> = {};
                      catMatches
                        .filter(m => matchVenueFilter === 'all' || m.venue === matchVenueFilter)
                        .forEach(m => {
                        const grade = m.eligible_years || 'Grade Not Set';
                        if (!matchesByGrade[grade]) matchesByGrade[grade] = [];
                        matchesByGrade[grade].push(m);
                      });

                      return (
                        <div key={cat.id} className="space-y-10">
                          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-6 w-full sm:w-auto">
                              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-maple/10 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center text-maple text-2xl sm:text-3xl border border-maple/20 shadow-inner shrink-0">
                                {cat.icon || '🏆'}
                              </div>
                              <div>
                                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tighter text-white">{cat.name}</h3>
                                <p className="font-sans text-[10px] font-bold text-muted uppercase tracking-[0.4em] mt-2">
                                  {catMatches.length} Active Records
                                </p>
                              </div>
                            </div>
                            <button 
                              onClick={() => addMatch(cat.id)}
                              className="w-full sm:w-auto sm:ml-auto bg-maple/10 hover:bg-maple/20 text-maple py-3 px-6 rounded-xl font-ui text-[10px] font-bold uppercase tracking-[0.2em] transition-all border border-maple/20 flex items-center justify-center gap-2 active:scale-95"
                            >
                              <Plus size={16} />
                              Add Match
                            </button>
                          </div>

                          <div className="space-y-16 pl-6 border-l-2 border-white/5">
                            {Object.entries(matchesByGrade).map(([grade, gradeMatches]) => (
                              <div key={grade} className="space-y-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-3 h-3 rounded-full bg-maple shadow-[0_0_10px_rgba(188,138,44,0.5)]" />
                                  <h4 className="text-lg font-display uppercase tracking-widest text-maple/90">{grade}</h4>
                                  <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-bold text-muted uppercase tracking-widest">{gradeMatches.length} Matches</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  {gradeMatches.map((match) => (
                                    <motion.div 
                                      key={match.id}
                                      layout
                                      className="bg-bg2 border border-white/5 rounded-3xl overflow-hidden group hover:border-maple/30 transition-all shadow-xl"
                                    >
                                      <div className="p-5 sm:p-8 flex flex-col lg:flex-row items-center gap-6 sm:gap-10">
                                        {/* Match Meta */}
                                        <div className="w-full lg:w-56 space-y-4">
                                          <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-muted border border-white/5 group-hover:text-maple transition-colors shrink-0">
                                              <Activity size={18} />
                                            </div>
                                            <div>
                                              <div className="font-ui text-[10px] sm:text-[11px] font-bold text-maple uppercase tracking-[0.2em]">{cat.name}</div>
                                              <div className="flex items-center gap-2 mt-1">
                                                <span className="font-ui text-[8px] sm:text-[9px] font-bold text-muted uppercase tracking-widest">Match #</span>
                                                <input
                                                  type="number"
                                                  value={match.match_no || ''}
                                                  className="w-10 sm:w-12 bg-white/5 border border-white/5 rounded-lg text-white text-[10px] sm:text-xs font-bold text-center py-1 outline-none focus:border-maple transition-all"
                                                  onChange={(e) => updateMatch(match.id, { match_no: parseInt(e.target.value) || 0 })}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                                            <div className="relative">
                                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/30" size={12} />
                                              <input
                                                type="text"
                                                value={match.venue || ''}
                                                placeholder="Venue"
                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all"
                                                onChange={(e) => updateMatch(match.id, { venue: e.target.value })}
                                              />
                                            </div>
                                            <div className="relative">
                                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/30" size={12} />
                                              <input
                                                type="text"
                                                value={match.eligible_years || ''}
                                                placeholder="Eligible Years"
                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all"
                                                onChange={(e) => updateMatch(match.id, { eligible_years: e.target.value })}
                                              />
                                            </div>
                                            <div className="relative">
                                              <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/30" size={12} />
                                              <input
                                                type="text"
                                                value={match.man_of_the_match || ''}
                                                placeholder="Man of the Match"
                                                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted outline-none focus:border-maple/50 focus:text-text transition-all"
                                                onChange={(e) => updateMatch(match.id, { man_of_the_match: e.target.value })}
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        {/* Teams & Score */}
                                        <div className="w-full flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 bg-white/5 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-white/5">
                                          <div className="w-full sm:flex-1 flex flex-col items-center sm:items-end gap-3">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border-2 border-maple/30 overflow-hidden shrink-0 shadow-lg">
                                              <img 
                                                src={houses.find(h => h.id === match.team1_id)?.logo_url || ''} 
                                                alt="Team 1" 
                                                className="w-full h-full object-cover rounded-full"
                                                referrerPolicy="no-referrer"
                                              />
                                            </div>
                                            <select
                                              value={match.team1_id || ''}
                                              onChange={(e) => updateMatch(match.id, { team1_id: e.target.value })}
                                              className="w-full bg-transparent border-none text-lg sm:text-xl font-display uppercase tracking-tighter text-center sm:text-right outline-none cursor-pointer hover:text-maple transition-colors"
                                            >
                                              {houses.map(h => (
                                                <option key={h.id} value={h.id} className="bg-[#121214]">{h.name}</option>
                                              ))}
                                            </select>
                                          </div>

                                          <div className="flex flex-row sm:flex-col items-center gap-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                              <input
                                                type="number"
                                                value={match.score1}
                                                onChange={(e) => updateMatch(match.id, { score1: parseInt(e.target.value) })}
                                                className="w-12 h-12 sm:w-16 sm:h-16 bg-bg border-2 border-white/10 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-3xl font-display text-white outline-none focus:border-maple transition-all shadow-inner"
                                              />
                                              <div className="text-muted font-display text-lg sm:text-xl opacity-30">VS</div>
                                              <input
                                                type="number"
                                                value={match.score2}
                                                onChange={(e) => updateMatch(match.id, { score2: parseInt(e.target.value) })}
                                                className="w-12 h-12 sm:w-16 sm:h-16 bg-bg border-2 border-white/10 rounded-xl sm:rounded-2xl text-center text-2xl sm:text-3xl font-display text-white outline-none focus:border-maple transition-all shadow-inner"
                                              />
                                            </div>
                                            <select
                                              value={match.status}
                                              onChange={(e) => updateMatch(match.id, { status: e.target.value as any })}
                                              className={cn(
                                                "px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-ui text-[8px] sm:text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer",
                                                match.status === 'live' ? "bg-success/10 text-success border-success/30 animate-pulse" :
                                                match.status === 'completed' ? "bg-muted/10 text-muted border-muted/30" :
                                                "bg-maple/10 text-maple border-maple/30"
                                              )}
                                            >
                                              <option value="upcoming" className="bg-[#121214]">Upcoming</option>
                                              <option value="live" className="bg-[#121214]">Live Now</option>
                                              <option value="completed" className="bg-[#121214]">Completed</option>
                                            </select>
                                          </div>

                                          <div className="w-full sm:flex-1 flex flex-col items-center sm:items-start gap-3">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 border-2 border-maple/30 overflow-hidden shrink-0 shadow-lg">
                                              <img 
                                                src={houses.find(h => h.id === match.team2_id)?.logo_url || ''} 
                                                alt="Team 2" 
                                                className="w-full h-full object-cover rounded-full"
                                                referrerPolicy="no-referrer"
                                              />
                                            </div>
                                            <select
                                              value={match.team2_id || ''}
                                              onChange={(e) => updateMatch(match.id, { team2_id: e.target.value })}
                                              className="w-full bg-transparent border-none text-lg sm:text-xl font-display uppercase tracking-tighter text-center sm:text-left outline-none cursor-pointer hover:text-maple transition-colors"
                                            >
                                              {houses.map(h => (
                                                <option key={h.id} value={h.id} className="bg-[#121214]">{h.name}</option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto justify-center">
                                          <button 
                                            onClick={() => deleteMatch(match.id)}
                                            className="w-10 h-10 sm:w-12 sm:h-12 bg-danger/5 hover:bg-danger text-danger hover:text-white rounded-xl sm:rounded-2xl transition-all border border-danger/10 flex items-center justify-center active:scale-90"
                                            title="Delete Match"
                                          >
                                            <Trash2 size={20} />
                                          </button>
                                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-muted/30 border border-white/5">
                                            <Edit2 size={20} />
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {filteredMatches.length === 0 && (
                      <div className="py-32 flex flex-col items-center justify-center bg-[#121214] border border-white/5 border-dashed rounded-[3rem] text-muted gap-4">
                        <Activity size={64} className="opacity-10" />
                        <p className="font-ui text-xs font-bold uppercase tracking-widest">No matches found matching your criteria</p>
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
                  className="space-y-12 pb-20"
                >
                  <div className="flex flex-col lg:flex-row items-center justify-between bg-[#0d1b33] p-10 rounded-[3rem] border border-white/5 shadow-2xl gap-8">
                    <div>
                      <h2 className="text-4xl font-display uppercase tracking-tighter text-white">Event Schedule</h2>
                      <p className="text-muted text-sm mt-2 font-ui uppercase tracking-[0.2em] opacity-60">Timeline of sports and cultural events</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-white/5 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar max-w-full w-full pb-2">
                        <button
                          onClick={() => setScheduleVenueFilter('all')}
                          className={cn(
                            "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                            scheduleVenueFilter === 'all' ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                          )}
                        >
                          All Venues
                        </button>
                        {allVenues.map(venue => (
                          <button
                            key={venue}
                            onClick={() => setScheduleVenueFilter(venue)}
                            className={cn(
                              "px-4 sm:px-6 py-2 sm:py-3 font-ui text-[8px] sm:text-[10px] font-bold uppercase tracking-widest transition-all rounded-lg sm:rounded-xl whitespace-nowrap shrink-0",
                              scheduleVenueFilter === venue ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                            )}
                          >
                            {venue}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={addSchedule}
                        className="w-full sm:w-auto bg-maple hover:bg-maple/90 text-bg py-5 px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center justify-center gap-3 group active:scale-95"
                      >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Add Event
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {displaySchedule
                      .filter(item => scheduleVenueFilter === 'all' || item.venue === scheduleVenueFilter)
                      .map((item) => (
                      <motion.div 
                        key={item.id} 
                        layout
                        className="bg-[#0d1b33] border border-white/5 rounded-[3rem] p-10 shadow-2xl group hover:border-maple/30 transition-all flex flex-col relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-10">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-maple/10 rounded-[1.5rem] flex items-center justify-center text-maple border border-maple/20 shadow-inner">
                              <Calendar size={28} />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <input
                                  type="text"
                                  value={item.day_label}
                                  className="w-20 bg-white/5 border border-white/5 rounded-lg font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-maple outline-none focus:border-maple/50 px-2 py-1 transition-all"
                                  onChange={(e) => updateSchedule(item.id, { day_label: e.target.value })}
                                />
                                <input
                                  type="text"
                                  value={item.day_date}
                                  className="w-28 bg-white/5 border border-white/5 rounded-lg font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-muted outline-none focus:border-maple/50 px-2 py-1 transition-all"
                                  onChange={(e) => updateSchedule(item.id, { day_date: e.target.value })}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-muted/30" />
                                <input
                                  type="text"
                                  value={item.time_start}
                                  className="w-16 bg-transparent border-none font-ui text-[10px] font-bold uppercase tracking-widest text-subtle outline-none focus:text-white"
                                  onChange={(e) => updateSchedule(item.id, { time_start: e.target.value })}
                                />
                                <span className="text-subtle text-[10px] opacity-30">→</span>
                                <input
                                  type="text"
                                  value={item.time_end || ''}
                                  className="w-16 bg-transparent border-none font-ui text-[10px] font-bold uppercase tracking-widest text-subtle outline-none focus:text-white"
                                  onChange={(e) => updateSchedule(item.id, { time_end: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteSchedule(item.id)}
                            className="w-12 h-12 bg-danger/5 hover:bg-danger text-danger hover:text-white rounded-2xl transition-all border border-danger/10 flex items-center justify-center active:scale-90 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="space-y-6 flex-1">
                          <input
                            type="text"
                            value={item.title}
                            className="w-full bg-transparent border-none text-3xl font-display uppercase tracking-tighter text-white outline-none focus:text-maple transition-colors"
                            onChange={(e) => updateSchedule(item.id, { title: e.target.value })}
                          />
                          <textarea
                            value={item.subtitle || ''}
                            placeholder="Add a subtitle or description..."
                            className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] p-6 text-muted text-sm leading-relaxed outline-none resize-none focus:border-maple/30 focus:text-text transition-all"
                            rows={3}
                            onChange={(e) => updateSchedule(item.id, { subtitle: e.target.value })}
                          />
                        </div>

                        <div className="pt-10 mt-10 border-t border-white/5 grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Venue</label>
                            <div className="relative group/input">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/30 group-focus-within/input:text-maple transition-colors" size={16} />
                              <input
                                type="text"
                                value={item.venue || ''}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-[11px] font-bold uppercase tracking-widest text-white outline-none focus:border-maple/50 transition-all"
                                onChange={(e) => updateSchedule(item.id, { venue: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Status</label>
                            <div className="relative group/input">
                              <div className={cn(
                                "absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                                item.status === 'live' ? "bg-maple animate-pulse" :
                                item.status === 'completed' ? "bg-success" : "bg-muted"
                              )} />
                              <select
                                value={item.status || 'upcoming'}
                                onChange={(e) => updateSchedule(item.id, { status: e.target.value as any })}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-[11px] font-bold uppercase tracking-widest text-white outline-none cursor-pointer focus:border-maple/50 transition-all"
                              >
                                <option value="upcoming" className="bg-[#121214]">Upcoming</option>
                                <option value="live" className="bg-[#121214]">Live Now</option>
                                <option value="completed" className="bg-[#121214]">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {schedule.length === 0 && (
                      <div className="col-span-full py-40 flex flex-col items-center justify-center bg-[#0d1b33] border border-white/5 border-dashed rounded-[4rem] text-muted gap-6">
                        <Calendar size={80} className="opacity-10" />
                        <div className="text-center">
                          <p className="font-display text-2xl uppercase tracking-widest opacity-30">No events scheduled</p>
                          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-20">Click 'Add Event' to begin</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16 pb-20"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-bg2 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl gap-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-tighter text-white">Event Categories</h2>
                      <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Define sports and cultural event specifications</p>
                    </div>
                    <button 
                      onClick={addCategory}
                      className="w-full sm:w-auto bg-maple hover:bg-maple/90 text-bg py-4 sm:py-5 px-8 sm:px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center justify-center gap-3 group active:scale-95"
                    >
                      <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                      Add Category
                    </button>
                  </div>

                  {/* Sports Section */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-6 px-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      <h3 className="font-display text-2xl uppercase tracking-[0.3em] text-maple">Sports Categories</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                      {displayCategories.filter(c => c.category_type === 'sport' || !c.category_type).map((cat) => (
                        <div key={cat.id} className="h-full">
                          <CategoryCard 
                            cat={cat} 
                            deleteCategory={deleteCategory}
                            updateCategory={updateCategory}
                            handleSupabaseError={handleSupabaseError}
                            culturalResults={displayCulturalResults}
                            houses={houses}
                            addCulturalResult={addCulturalResult}
                            updateCulturalResult={updateCulturalResult}
                            deleteCulturalResult={deleteCulturalResult}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural Section */}
                  <div className="space-y-10">
                    <div className="flex items-center gap-6 px-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      <h3 className="font-display text-2xl uppercase tracking-[0.3em] text-maple">Cultural Categories</h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                      {displayCategories.filter(c => c.category_type === 'cultural').map((cat) => (
                        <div key={cat.id} className="h-full">
                          <CategoryCard 
                            cat={cat} 
                            deleteCategory={deleteCategory}
                            updateCategory={updateCategory}
                            handleSupabaseError={handleSupabaseError}
                            culturalResults={displayCulturalResults}
                            houses={houses}
                            addCulturalResult={addCulturalResult}
                            updateCulturalResult={updateCulturalResult}
                            deleteCulturalResult={deleteCulturalResult}
                          />
                        </div>
                      ))}
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
                  className="space-y-12 pb-20"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0d1b33] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl gap-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-4xl font-display uppercase tracking-tighter text-white">Media Gallery</h2>
                      <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Manage photos and videos for the gallery</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <input 
                        type="file" 
                        id="gallery-multi-upload" 
                        multiple 
                        accept="image/*,video/*" 
                        className="hidden" 
                        onChange={(e) => e.target.files && addGalleryItems(e.target.files)}
                      />
                      <button 
                        onClick={() => document.getElementById('gallery-multi-upload')?.click()}
                        disabled={loading}
                        className="w-full sm:w-auto bg-maple hover:bg-maple/90 text-bg py-4 sm:py-5 px-8 sm:px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center justify-center gap-3 group active:scale-95 disabled:opacity-50"
                      >
                        <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                        {loading ? 'Uploading...' : 'Mass Upload'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
                    {displayGallery.map((item) => (
                      <motion.div 
                        key={item.id}
                        layout
                        className="bg-[#0d1b33] border border-white/5 rounded-[2rem] sm:rounded-[3rem] overflow-hidden group hover:border-maple/30 transition-all shadow-2xl"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button onClick={() => deleteGalleryItem(item.id)} className="w-12 h-12 bg-danger/20 hover:bg-danger text-danger hover:text-white rounded-2xl transition-all flex items-center justify-center">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        <div className="p-8 space-y-4">
                          <input
                            type="text"
                            value={item.title}
                            className="w-full bg-transparent border-none text-xl font-display uppercase tracking-widest text-white outline-none focus:text-maple"
                            onChange={(e) => updateGalleryItem(item.id, { title: e.target.value })}
                          />
                          <div className="flex items-center gap-4">
                            <select
                              value={item.type}
                              onChange={(e) => updateGalleryItem(item.id, { type: e.target.value })}
                              className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 font-ui text-[9px] font-bold uppercase tracking-[0.2em] text-muted outline-none"
                            >
                              <option value="image" className="bg-[#0d1b33]">Image</option>
                              <option value="video" className="bg-[#0d1b33]">Video</option>
                            </select>
                            <input
                              type="text"
                              value={item.year}
                              className="w-20 bg-white/5 border border-white/5 rounded-xl px-4 py-2 font-ui text-[9px] font-bold uppercase tracking-[0.2em] text-muted outline-none"
                              onChange={(e) => updateGalleryItem(item.id, { year: e.target.value })}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'leaderboards' && (
                <motion.div
                  key="leaderboards"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12 pb-20"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0d1b33] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl gap-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-4xl font-display uppercase tracking-tighter text-white">House Leaderboards</h2>
                      <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Real-time house standings and point distribution</p>
                    </div>
                    <button 
                      onClick={() => supabase?.rpc('recompute_points').then(() => refresh())}
                      className="w-full sm:w-auto bg-maple hover:bg-maple/90 text-bg py-4 sm:py-5 px-8 sm:px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center justify-center gap-3 group active:scale-95"
                    >
                      <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                      Recompute Points
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {houses.sort((a, b) => (b.points || 0) - (a.points || 0)).map((house, idx) => (
                      <div key={house.id} className="bg-[#0d1b33] border border-white/5 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 group hover:border-maple/30 transition-all shadow-2xl">
                        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/5 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center font-display text-xl sm:text-4xl text-maple border border-white/5 shadow-inner shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden border border-white/5 shadow-inner shrink-0">
                            <img src={house.logo_url} alt={house.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 sm:hidden">
                            <h3 className="text-lg font-display uppercase tracking-widest text-white">{house.name}</h3>
                            <p className="font-ui text-[8px] font-bold text-muted uppercase tracking-[0.4em] mt-1">{house.motto || 'Striving for Excellence'}</p>
                          </div>
                        </div>
                        <div className="hidden sm:block flex-1">
                          <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-widest text-white">{house.name}</h3>
                          <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.4em] mt-2">{house.motto || 'Striving for Excellence'}</p>
                        </div>
                        <div className="text-center sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                          <div className="text-3xl sm:text-5xl font-display text-maple tracking-tighter">{house.points || 0}</div>
                          <div className="font-ui text-[8px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-1">Total Points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'notices' && (
                <motion.div
                  key="notices"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12 pb-20"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0d1b33] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl gap-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-4xl font-display uppercase tracking-tighter text-white">Notices & Bulletins</h2>
                      <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Broadcast important information to all participants</p>
                    </div>
                    <button 
                      onClick={() => {
                        setNoticeModal({ isOpen: true });
                        setNoticeFormData({ title: '', content: '', priority: 'low' });
                      }}
                      className="w-full sm:w-auto bg-maple hover:bg-maple/90 text-bg py-4 sm:py-5 px-8 sm:px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center justify-center gap-3 group active:scale-95"
                    >
                      <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                      Create Notice
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
                    {displayNotices.map(notice => (
                      <motion.div 
                        key={notice.id} 
                        layout
                        className="bg-[#0d1b33] border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-10 shadow-2xl group hover:border-maple/30 transition-all flex flex-col relative overflow-hidden"
                      >
                        {/* Priority Accent */}
                        <div className={cn(
                          "absolute top-0 left-0 w-full h-1.5",
                          notice.priority === 'high' ? "bg-danger" :
                          notice.priority === 'medium' ? "bg-maple" :
                          "bg-muted/30"
                        )} />

                        <div className="flex justify-between items-center mb-8">
                          <div className={cn(
                            "px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border shadow-sm",
                            notice.priority === 'high' ? "bg-danger/10 text-danger border-danger/20" :
                            notice.priority === 'medium' ? "bg-maple/10 text-maple border-maple/20" :
                            "bg-white/5 text-muted border-white/10"
                          )}>
                            {notice.priority} priority
                          </div>
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button 
                              onClick={() => {
                                setNoticeModal({ isOpen: true, notice });
                                setNoticeFormData({ title: notice.title, content: notice.content, priority: notice.priority });
                              }}
                              className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-maple transition-all border border-white/5 active:scale-90"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteNotice(notice.id)}
                              className="w-10 h-10 bg-danger/5 hover:bg-danger text-danger hover:text-white rounded-xl flex items-center justify-center transition-all border border-danger/10 active:scale-90"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-2xl font-display uppercase tracking-tighter text-white mb-5 line-clamp-2 leading-tight">{notice.title}</h4>
                        <p className="text-muted text-[13px] leading-relaxed mb-10 flex-1 line-clamp-4 font-medium opacity-80">{notice.content}</p>
                        
                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-3 text-muted/40">
                            <Calendar size={16} className="text-maple/50" />
                            <span className="font-ui text-[10px] font-bold uppercase tracking-[0.2em]">
                              {new Date(notice.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-muted/30 group-hover:text-maple transition-colors shadow-inner">
                            <Bell size={16} />
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {displayNotices.length === 0 && (
                      <div className="col-span-full py-40 flex flex-col items-center justify-center bg-[#0d1b33] border border-white/5 border-dashed rounded-[4rem] text-muted gap-6">
                        <Bell size={80} className="opacity-10" />
                        <div className="text-center">
                          <p className="font-display text-2xl uppercase tracking-widest opacity-30">No active notices</p>
                          <p className="font-ui text-[10px] font-bold uppercase tracking-[0.4em] mt-2 opacity-20">Create a notice to broadcast information</p>
                        </div>
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
                  className="space-y-12 pb-20"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0d1b33] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl gap-6">
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-4xl font-display uppercase tracking-tighter text-white">General Settings</h2>
                      <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60">Configure global application parameters and social links</p>
                    </div>
                    {hasChanges && (
                      <button 
                        onClick={saveAllSettings}
                        className="w-full sm:w-auto bg-maple hover:bg-maple/90 text-bg py-4 sm:py-5 px-8 sm:px-12 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 flex items-center justify-center gap-3 group active:scale-95"
                      >
                        <Save size={20} className="group-hover:scale-110 transition-transform" />
                        Save Changes
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                    {/* Core Info */}
                    <div className="bg-[#0d1b33] border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-12 space-y-6 sm:space-y-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-maple/30" />
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-white/5">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-maple/10 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center text-maple shadow-inner shrink-0">
                          <SettingsIcon size={24} />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-xl sm:text-2xl font-display uppercase tracking-tighter text-white">Core Configuration</h3>
                          <p className="text-muted text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-40">Basic festival information</p>
                        </div>
                      </div>

                      <div className="space-y-6 sm:space-y-8">
                        <div className="space-y-2 sm:space-y-3">
                          <label className="font-ui text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Festival Name</label>
                          <input
                            type="text"
                            value={localSettings['festival_name'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-8 py-4 sm:py-5 text-[12px] sm:text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            onChange={(e) => handleSettingChange('festival_name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="font-ui text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Contact Email</label>
                          <input
                            type="email"
                            value={localSettings['contact_email'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-8 py-4 sm:py-5 text-[12px] sm:text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            onChange={(e) => handleSettingChange('contact_email', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="font-ui text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">School Logo</label>
                          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center border border-white/5 overflow-hidden shadow-inner group/logo relative shrink-0">
                              {localSettings['school_logo_url'] ? (
                                <img src={localSettings['school_logo_url']} alt="School Logo" className="w-full h-full object-contain p-3 sm:p-4" referrerPolicy="no-referrer" />
                              ) : (
                                <ImageIcon size={28} className="text-muted/20" />
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" onClick={() => document.getElementById('school-logo-upload')?.click()}>
                                <Upload size={20} className="text-white" />
                              </div>
                            </div>
                            <div className="flex-1 space-y-3 w-full">
                              <div className="flex gap-2 sm:gap-3">
                                <input
                                  type="text"
                                  value={localSettings['school_logo_url'] || ''}
                                  className="flex-1 bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-[11px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner min-w-0"
                                  placeholder="Logo URL..."
                                  onChange={(e) => handleSettingChange('school_logo_url', e.target.value)}
                                />
                                <button 
                                  onClick={() => document.getElementById('school-logo-upload')?.click()}
                                  className="bg-white/5 hover:bg-white/10 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/5 transition-all active:scale-90 shadow-lg shrink-0"
                                  title="Upload Logo"
                                >
                                  <Upload size={20} />
                                </button>
                                <input 
                                  type="file"
                                  id="school-logo-upload"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file || !supabase) return;
                                    setLoading(true);
                                    try {
                                      const fileName = `school_logo_${Date.now()}`;
                                      const { error: uploadError } = await supabase.storage.from('ucsf-media').upload(fileName, file);
                                      if (uploadError) throw uploadError;
                                      const { data: { publicUrl } } = supabase.storage.from('ucsf-media').getPublicUrl(fileName);
                                      handleSettingChange('school_logo_url', publicUrl);
                                    } catch (err: any) {
                                      handleSupabaseError(err, 'Logo upload failed');
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-[8px] sm:text-[9px] text-muted uppercase tracking-[0.2em] ml-1 opacity-40">Upload a file or provide a direct URL</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="font-ui text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Master Spreadsheet URL</label>
                          <input
                            type="text"
                            value={localSettings['spreadsheet_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-8 py-4 sm:py-5 text-[12px] sm:text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            placeholder="https://docs.google.com/spreadsheets/..."
                            onChange={(e) => handleSettingChange('spreadsheet_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Status & Announcements */}
                    <div className="bg-[#0d1b33] border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] p-5 sm:p-12 space-y-6 sm:space-y-10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-maple/30" />
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-white/5">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-maple/10 rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center text-maple shadow-inner shrink-0">
                          <Activity size={24} />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-xl sm:text-2xl font-display uppercase tracking-tighter text-white">Announcements</h3>
                          <p className="text-muted text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-40">Global messaging & footer</p>
                        </div>
                      </div>

                      <div className="space-y-6 sm:space-y-8">
                        <div className="space-y-2 sm:space-y-3">
                          <label className="font-ui text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Global Announcement Banner</label>
                          <textarea
                            value={localSettings['announcement_text'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] px-5 sm:px-8 py-4 sm:py-6 text-[12px] sm:text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all min-h-[120px] sm:min-h-[160px] resize-none shadow-inner leading-relaxed"
                            placeholder="Enter global announcement..."
                            onChange={(e) => handleSettingChange('announcement_text', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="font-ui text-[9px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Footer Copyright Text</label>
                          <input
                            type="text"
                            value={localSettings['footer_text'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl px-5 sm:px-8 py-4 sm:py-5 text-[12px] sm:text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            placeholder="e.g. © 2026 UCSF. All rights reserved."
                            onChange={(e) => handleSettingChange('footer_text', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-[#0d1b33] border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 space-y-8 sm:space-y-10 shadow-2xl lg:col-span-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-maple/30" />
                      <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-maple/10 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center text-maple shadow-inner">
                          <Share2 size={24} />
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className="text-xl sm:text-2xl font-display uppercase tracking-tighter text-white">Social & External Links</h3>
                          <p className="text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-40">Connect your community</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="space-y-3">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Instagram URL</label>
                          <input
                            type="text"
                            value={localSettings['instagram_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-[12px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            onChange={(e) => handleSettingChange('instagram_url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Facebook URL</label>
                          <input
                            type="text"
                            value={localSettings['facebook_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-[12px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            onChange={(e) => handleSettingChange('facebook_url', e.target.value)}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">YouTube Stream URL</label>
                          <input
                            type="text"
                            value={localSettings['youtube_url'] || ''}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-[12px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                            onChange={(e) => handleSettingChange('youtube_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Section */}
                  <div className="opacity-20 hover:opacity-100 transition-all pt-12">
                    <h4 className="font-ui text-[10px] font-bold uppercase tracking-[0.4em] text-muted mb-8 text-center">System Registry Keys</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {Object.entries(settings).map(([key, val]) => (
                        <div key={key} className="p-6 bg-[#0d1b33] rounded-[2rem] border border-white/5 flex flex-col gap-2 overflow-hidden shadow-inner">
                          <span className="font-mono text-[8px] text-muted/50 truncate uppercase tracking-widest">{key}</span>
                          <span className="font-ui text-[10px] font-bold text-white truncate">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'changes' && profile?.is_super_admin && (
                <motion.div
                  key="changes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                      <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tighter text-white">Pending Approvals</h2>
                      <p className="text-muted mt-2 font-sans text-[10px] font-bold uppercase tracking-[0.3em]">Review and confirm changes submitted by other admins</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {stagedChanges.filter(c => c.status === 'pending').length === 0 ? (
                      <div className="bg-bg2 border border-white/5 rounded-[2rem] sm:rounded-[3rem] p-12 sm:p-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-muted/20">
                          <CheckCircle size={48} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl sm:text-2xl font-display uppercase tracking-tighter text-white">All Caught Up!</h3>
                          <p className="text-muted text-[10px] font-bold uppercase tracking-widest">No pending changes require your approval.</p>
                        </div>
                      </div>
                    ) : (
                      stagedChanges.filter(c => c.status === 'pending').map((change) => (
                        <div key={change.id} className="bg-bg2 border border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 flex flex-col xl:flex-row gap-6 sm:gap-8 items-start xl:items-center group hover:border-maple/30 transition-all">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-maple flex-shrink-0">
                            <History size={24} />
                          </div>
                          
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-maple/10 text-maple text-[8px] font-bold uppercase tracking-widest rounded-lg border border-maple/20">
                                {change.table_name}
                              </span>
                              <span className="text-muted text-[10px] font-bold uppercase tracking-widest">
                                ID: {change.record_id}
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-display uppercase text-white">
                              Change by <span className="text-maple">{change.created_by_email}</span>
                            </h4>
                            <div className="bg-black/20 p-4 rounded-xl font-mono text-[9px] sm:text-[10px] text-muted/80 overflow-x-auto max-w-full">
                              <pre>{JSON.stringify(change.updates, null, 2)}</pre>
                            </div>
                            <p className="text-[8px] sm:text-[9px] text-muted/40 font-bold uppercase tracking-widest">
                              Submitted {new Date(change.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex flex-row xl:flex-col gap-3 w-full xl:w-auto">
                            <button 
                              onClick={() => approveChange(change)}
                              className="flex-1 xl:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-success/10 hover:bg-success text-success hover:text-bg font-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-success/20 flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => discardStagedChange(change.id)}
                              className="flex-1 xl:flex-none px-4 sm:px-6 py-3 sm:py-4 bg-danger/10 hover:bg-danger text-danger hover:text-white font-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-danger/20 flex items-center justify-center gap-2"
                            >
                              <X size={14} /> Discard
                            </button>
                          </div>
                        </div>
                      ))
                    )}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-bg/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#0d1b33] border border-white/10 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-2xl space-y-8 sm:space-y-10 relative overflow-hidden my-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-maple/30" />
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-maple/10 rounded-[1.2rem] sm:rounded-[1.5rem] flex items-center justify-center text-maple shadow-inner">
                  <Bell size={24} />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tighter text-white">
                    {noticeModal.notice ? 'Edit Notice' : 'Create Notice'}
                  </h3>
                  <p className="text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-40">Broadcast to all participants</p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Notice Title</label>
                  <input
                    type="text"
                    value={noticeFormData.title}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all shadow-inner"
                    placeholder="e.g. Football Schedule Update"
                  />
                </div>

                <div className="space-y-3">
                  <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Priority Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['low', 'medium', 'high'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setNoticeFormData({ ...noticeFormData, priority: p as any })}
                        className={cn(
                          "py-4 rounded-2xl font-ui text-[10px] font-bold uppercase tracking-[0.2em] transition-all border shadow-sm active:scale-95",
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

                <div className="space-y-3">
                  <label className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] ml-1">Content Body</label>
                  <textarea
                    value={noticeFormData.content}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, content: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-8 py-6 text-[13px] font-bold text-white outline-none focus:border-maple/50 transition-all min-h-[200px] resize-none leading-relaxed shadow-inner"
                    placeholder="Enter detailed notice content..."
                  />
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button
                  onClick={() => setNoticeModal(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-muted py-5 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNoticeSubmit}
                  disabled={loading || !noticeFormData.title || !noticeFormData.content}
                  className="flex-1 bg-maple hover:bg-maple/90 text-bg py-5 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-maple/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0d1b33] border border-white/10 rounded-[3rem] p-12 shadow-2xl space-y-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-danger/30" />
              <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                <div className="w-16 h-16 bg-danger/10 rounded-[1.5rem] flex items-center justify-center text-danger shadow-inner">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-display uppercase tracking-tighter text-white">{confirmModal.title}</h3>
                  <p className="text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1 opacity-40">Action Required</p>
                </div>
              </div>
              
              <p className="text-muted text-[13px] leading-relaxed font-medium opacity-80">
                {confirmModal.message}
              </p>

              <div className="flex gap-6 pt-6">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-muted py-5 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className={cn(
                    "flex-1 py-5 rounded-2xl font-ui text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95",
                    confirmModal.title.toLowerCase().includes('delete') 
                      ? "bg-danger hover:bg-danger/90 text-white shadow-danger/20" 
                      : "bg-maple hover:bg-maple/90 text-bg shadow-maple/20"
                  )}
                >
                  {confirmModal.title.toLowerCase().includes('delete') ? 'Confirm Delete' : 'Confirm Action'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
