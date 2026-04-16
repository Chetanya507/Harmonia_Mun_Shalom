import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { House, Match, ScheduleItem, Setting, Category, GalleryItem, Notice, CulturalResult, StagedChange, Profile } from '../types';
import { HARDCODED_CATEGORIES } from '../constants/hardcodedData';

// Global cache to persist data across component remounts
const globalCache: Record<string, any> = {
  houses: null,
  matches: null,
  schedule: null,
  settings: null,
  categories: null,
  gallery: null,
  notices: null,
  culturalResults: null,
  stagedChanges: null,
  profile: null,
  lastFetched: 0
};

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.message?.includes('fetch') || err.message?.includes('lock'))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export function useUCSFData() {
  const [houses, setHouses] = useState<House[]>(globalCache.houses || []);
  const [matches, setMatches] = useState<Match[]>(globalCache.matches || []);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(globalCache.schedule || []);
  const [settings, setSettings] = useState<Record<string, string>>(globalCache.settings || {});
  const [categories, setCategories] = useState<Category[]>(globalCache.categories || []);
  const [gallery, setGallery] = useState<GalleryItem[]>(globalCache.gallery || []);
  const [notices, setNotices] = useState<Notice[]>(globalCache.notices || []);
  const [culturalResults, setCulturalResults] = useState<CulturalResult[]>(globalCache.culturalResults || []);
  const [stagedChanges, setStagedChanges] = useState<StagedChange[]>(globalCache.stagedChanges || []);
  const [profile, setProfile] = useState<Profile | null>(globalCache.profile || null);
  const [loading, setLoading] = useState(!globalCache.lastFetched);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHouses = async () => {
    const { data } = await supabase!.from('houses').select('*').order('rank_pos', { ascending: true });
    if (data) {
      setHouses(data);
      globalCache.houses = data;
    }
  };

  const fetchMatches = async () => {
    const { data } = await supabase!.from('matches').select('*, team1:team1_id(*), team2:team2_id(*), category:category_id(*)').order('id', { ascending: true });
    if (data) {
      setMatches(data);
      globalCache.matches = data;
    }
  };

  const fetchSchedule = async () => {
    const { data } = await supabase!.from('schedule').select('*').order('sort_order', { ascending: true });
    if (data) {
      setSchedule(data);
      globalCache.schedule = data;
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase!.from('settings').select('*');
    if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach((s: Setting) => {
        settingsMap[s.key_name] = s.val;
      });
      setSettings(settingsMap);
      globalCache.settings = settingsMap;
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase!.from('categories').select('*').order('sort_order', { ascending: true });
    if (data) {
      const mergedCategories = data.map((cat: Category) => {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const hardcoded = HARDCODED_CATEGORIES[slug] || HARDCODED_CATEGORIES[cat.name.toLowerCase()];
        if (hardcoded) {
          return {
            ...cat,
            ...hardcoded,
            category_type: cat.category_type || hardcoded.category_type,
            team_size: cat.team_size || hardcoded.team_size,
            duration: cat.duration || hardcoded.duration,
            special_rules: cat.special_rules || hardcoded.special_rules,
            judging_criteria: (cat.judging_criteria && cat.judging_criteria.length > 0) ? cat.judging_criteria : hardcoded.judging_criteria,
          } as Category;
        }
        return cat;
      });
      setCategories(mergedCategories);
      globalCache.categories = mergedCategories;
    }
  };

  const fetchGallery = async () => {
    const { data } = await supabase!.from('gallery').select('*').order('year', { ascending: false }).order('created_at', { ascending: false });
    if (data) {
      setGallery(data);
      globalCache.gallery = data;
    }
  };

  const fetchNotices = async () => {
    const { data } = await supabase!.from('notices').select('*').order('created_at', { ascending: false });
    if (data) {
      setNotices(data);
      globalCache.notices = data;
    }
  };

  const fetchCulturalResults = async () => {
    const { data } = await supabase!.from('cultural_results').select('*, house:house_id(*), category:category_id(*)').order('rank', { ascending: true });
    if (data) {
      setCulturalResults(data);
      globalCache.culturalResults = data;
    }
  };

  const fetchStagedChanges = async () => {
    const { data } = await supabase!.from('staged_changes').select('*').order('created_at', { ascending: false });
    if (data) {
      setStagedChanges(data);
      globalCache.stagedChanges = data;
    }
  };

  const fetchProfile = async () => {
    // Use getSession first as it's faster and less likely to cause lock issues
    const { data: { session } } = await supabase!.auth.getSession();
    const user = session?.user;
    
    if (!user) {
      setProfile(null);
      globalCache.profile = null;
      return;
    }

    try {
      const { data, error } = await supabase!.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        globalCache.profile = data;
      } else if (error && error.code === 'PGRST116') { // Not found
        // Create profile if it doesn't exist
        const isSuperAdmin = user.email === 'kotadia.ean@gmail.com';
        const { data: newProfile } = await supabase!.from('profiles').insert([{
          id: user.id,
          email: user.email,
          is_super_admin: isSuperAdmin
        }]).select().single();
        
        if (newProfile) {
          setProfile(newProfile);
          globalCache.profile = newProfile;
        }
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    }
  };

  const fetchData = async (isInitial = false) => {
    if (!supabase) {
      setError('Supabase credentials missing.');
      setLoading(false);
      return;
    }

    // Skip fetch if cache is fresh
    if (isInitial && globalCache.lastFetched && (Date.now() - globalCache.lastFetched < CACHE_EXPIRY)) {
      setLoading(false);
      return;
    }

    try {
      if (isInitial && !globalCache.lastFetched) setLoading(true);
      else setIsRefreshing(true);

      // Fetch profile first and separately to avoid auth lock contention
      await withRetry(fetchProfile);

      // Fetch other data in parallel
      await Promise.all([
        withRetry(fetchHouses),
        withRetry(fetchMatches),
        withRetry(fetchSchedule),
        withRetry(fetchSettings),
        withRetry(fetchCategories),
        withRetry(fetchGallery),
        withRetry(fetchNotices),
        withRetry(fetchCulturalResults),
        withRetry(fetchStagedChanges)
      ]);
      
      globalCache.lastFetched = Date.now();
      setError(null);
    } catch (err: any) {
      console.error('Error fetching UCSF data:', err);
      // Don't show lock errors to user, they are usually transient
      if (!err.message?.includes('lock')) {
        setError(err.message || 'An error occurred while fetching data.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    
    fetchData(true);

    const handleFocus = () => {
      fetchData(false);
    };
    window.addEventListener('focus', handleFocus);

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

    const culturalSub = supabase.channel('cultural-results-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cultural_results' }, fetchCulturalResults)
      .subscribe();

    const stagedSub = supabase.channel('staged-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staged_changes' }, fetchStagedChanges)
      .subscribe();

    const profileSub = supabase.channel('profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfile)
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (supabase) {
        supabase.removeChannel(housesSub);
        supabase.removeChannel(matchesSub);
        supabase.removeChannel(scheduleSub);
        supabase.removeChannel(settingsSub);
        supabase.removeChannel(categoriesSub);
        supabase.removeChannel(gallerySub);
        supabase.removeChannel(noticesSub);
        supabase.removeChannel(culturalSub);
        supabase.removeChannel(stagedSub);
        supabase.removeChannel(profileSub);
      }
    };
  }, []);

  const refresh = useCallback(() => fetchData(false), []);

  return { houses, matches, schedule, settings, categories, gallery, notices, culturalResults, stagedChanges, profile, loading, isRefreshing, error, refresh };
}
