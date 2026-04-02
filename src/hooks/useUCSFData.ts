import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { House, Match, ScheduleItem, Setting, Category } from '../types';

export function useUCSFData() {
  const [houses, setHouses] = useState<House[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHouses = async () => {
    const { data } = await supabase!.from('houses').select('*').order('rank_pos', { ascending: true });
    if (data) setHouses(data);
  };

  const fetchMatches = async () => {
    const { data } = await supabase!.from('matches').select('*, team1:team1_id(*), team2:team2_id(*), category:category_id(*)').order('id', { ascending: true });
    if (data) setMatches(data);
  };

  const fetchSchedule = async () => {
    const { data } = await supabase!.from('schedule').select('*').order('sort_order', { ascending: true });
    if (data) setSchedule(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase!.from('settings').select('*');
    if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((s: Setting) => {
        settingsMap[s.key_name] = s.val;
      });
      setSettings(settingsMap);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase!.from('categories').select('*').order('sort_order', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchData = async () => {
    if (!supabase) {
      setError('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in the Secrets panel.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await Promise.all([
        fetchHouses(),
        fetchMatches(),
        fetchSchedule(),
        fetchSettings(),
        fetchCategories()
      ]);
    } catch (err: any) {
      console.error('Error fetching UCSF data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    
    fetchData();

    // Real-time subscriptions - more targeted
    const housesSub = supabase.channel('houses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'houses' }, fetchHouses)
      .subscribe();

    const matchesSub = supabase.channel('matches-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchMatches)
      .subscribe();

    const scheduleSub = supabase.channel('schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, fetchSchedule)
      .subscribe();

    const settingsSub = supabase.channel('settings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchSettings)
      .subscribe();

    const categoriesSub = supabase.channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, fetchCategories)
      .subscribe();

    return () => {
      supabase.removeChannel(housesSub);
      supabase.removeChannel(matchesSub);
      supabase.removeChannel(scheduleSub);
      supabase.removeChannel(settingsSub);
      supabase.removeChannel(categoriesSub);
    };
  }, []);

  return { houses, matches, schedule, settings, categories, loading, error, refresh: fetchData };
}
