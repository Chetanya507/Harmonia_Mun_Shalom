import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { House, Match, ScheduleItem, Setting, Category, GalleryItem, Notice } from '../types';

export function useUCSFData() {
  const [houses, setHouses] = useState<House[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const fetchGallery = async () => {
    const { data } = await supabase!.from('gallery').select('*').order('year', { ascending: false }).order('created_at', { ascending: false });
    if (data) setGallery(data);
  };

  const fetchNotices = async () => {
    const { data } = await supabase!.from('notices').select('*').order('created_at', { ascending: false });
    if (data) setNotices(data);
  };

  const fetchData = async (isInitial = false) => {
    if (!supabase) {
      setError('Supabase credentials missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables in the Secrets panel.');
      setLoading(false);
      return;
    }

    try {
      if (isInitial) setLoading(true);
      else setIsRefreshing(true);

      console.log('Starting data fetch from Supabase...');
      
      await Promise.all([
        fetchHouses().catch(e => { console.error('Houses fetch failed:', e); throw e; }),
        fetchMatches().catch(e => { console.error('Matches fetch failed:', e); throw e; }),
        fetchSchedule().catch(e => { console.error('Schedule fetch failed:', e); throw e; }),
        fetchSettings().catch(e => { console.error('Settings fetch failed:', e); throw e; }),
        fetchCategories().catch(e => { console.error('Categories fetch failed:', e); throw e; }),
        fetchGallery().catch(e => { console.error('Gallery fetch failed:', e); throw e; }),
        fetchNotices().catch(e => { console.error('Notices fetch failed:', e); throw e; })
      ]);
      console.log('Data fetch successful');
    } catch (err: any) {
      console.error('Error fetching UCSF data:', err);
      setError(err.message || 'Failed to fetch data from Supabase. Please check your connection and project status.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    
    fetchData(true);

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

    const gallerySub = supabase.channel('gallery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchGallery)
      .subscribe();

    const noticesSub = supabase.channel('notices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchNotices)
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(housesSub);
        supabase.removeChannel(matchesSub);
        supabase.removeChannel(scheduleSub);
        supabase.removeChannel(settingsSub);
        supabase.removeChannel(categoriesSub);
        supabase.removeChannel(gallerySub);
        supabase.removeChannel(noticesSub);
      }
    };
  }, []);

  const refresh = React.useCallback(() => fetchData(false), []);

  return { houses, matches, schedule, settings, categories, gallery, notices, loading, isRefreshing, error, refresh };
}
