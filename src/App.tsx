import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import MatchCard from './components/MatchCard';
import ScheduleCard from './components/ScheduleCard';
import EventsSection from './components/EventsSection';
import AdminPanel from './components/AdminPanel';
import { useUCSFData } from './hooks/useUCSFData';
import { Match } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Activity, Calendar, Shield, Loader2, AlertCircle, ChevronRight, Play, Image as ImageIcon, Video, ExternalLink, Bell, Info, FileText, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [galleryYear, setGalleryYear] = useState<'all' | 2025 | 2026>('all');
  const [noticePriority, setNoticePriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);
  const [selectedLeaderboardGrade, setSelectedLeaderboardGrade] = useState<'all' | '7-8th' | '9-10th' | '11th' | '12th'>('all');
  const [selectedLeaderboardEventId, setSelectedLeaderboardEventId] = useState<string | 'all'>('all');
  const { houses, matches, schedule, settings, categories, gallery, notices, culturalResults, stagedChanges, profile, loading, error, refresh } = useUCSFData();
  
  useEffect(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setActiveTab('admin');
    }
  }, []);

  const liveItems = useMemo(() => schedule.filter(s => s.status === 'live'), [schedule]);
  const upcomingItems = useMemo(() => schedule.filter(s => s.status === 'upcoming').slice(0, 3), [schedule]);

  const gradePoints = useMemo(() => {
    const points: Record<string, Record<string, number>> = {};
    houses.forEach(h => {
      // 'all' category should just use the pre-computed points from the database
      // to match the Admin Panel's source of truth.
      points[h.id] = { '7-8th': 0, '9-10th': 0, '11th': 0, '12th': 0, 'all': h.points || 0 };
    });

    // Sports Points (Grade-specific)
    matches.filter(m => m.status === 'completed' && m.winner_id).forEach(m => {
      const winnerId = m.winner_id!;
      const grade = m.eligible_years;
      if (points[winnerId] && grade) {
        let category = '';
        if (grade.includes('7') || grade.includes('8')) category = '7-8th';
        else if (grade.includes('9') || grade.includes('10')) category = '9-10th';
        else if (grade.includes('11')) category = '11th';
        else if (grade.includes('12')) category = '12th';

        if (category) {
          points[winnerId][category] += 10;
        }
      }
    });

    // We don't add culturalResults to 'all' here because h.points already includes them
    // after the admin recomputes points.

    return points;
  }, [houses, matches]);

  const eventPoints = useMemo(() => {
    if (selectedLeaderboardEventId === 'all') return null;
    
    const points: Record<string, number> = {};
    houses.forEach(h => points[h.id] = 0);

    // Sports
    matches.filter(m => m.category_id === selectedLeaderboardEventId && m.status === 'completed' && m.winner_id).forEach(m => {
      points[m.winner_id!] += 10;
    });

    // Cultural
    culturalResults.filter(r => r.category_id === selectedLeaderboardEventId).forEach(r => {
      points[r.house_id] += (r.points || 0);
    });

    return points;
  }, [houses, matches, culturalResults, selectedLeaderboardEventId]);

  const sortedHousesForLeaderboard = useMemo(() => {
    return [...houses].sort((a, b) => {
      if (selectedLeaderboardEventId !== 'all' && eventPoints) {
        return (eventPoints[b.id] || 0) - (eventPoints[a.id] || 0);
      }
      const pointsA = gradePoints[a.id]?.[selectedLeaderboardGrade] || 0;
      const pointsB = gradePoints[b.id]?.[selectedLeaderboardGrade] || 0;
      return pointsB - pointsA;
    });
  }, [houses, gradePoints, eventPoints, selectedLeaderboardGrade, selectedLeaderboardEventId]);

  const handleTabChange = (tab: string) => {
    if (tab !== 'matches') {
      setSelectedCategory(null);
    }
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-maple/20 border-t-maple rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy className="text-maple" size={24} />
          </div>
        </div>
        <p className="font-ui text-xs font-bold uppercase tracking-[0.4em] text-maple animate-pulse">Loading Fest Data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark p-6 text-center">
        <div className="w-20 h-20 bg-cedar/10 text-cedar rounded-3xl flex items-center justify-center mb-6 border border-cedar/20">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-3xl font-display text-white mb-4">Connection Error</h2>
        <p className="text-white/40 max-w-md mb-8 font-medium">
          {error}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry Connection
          </button>
          <button 
            onClick={() => refresh()}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-ui text-xs font-bold uppercase tracking-widest text-white transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  const festivalName = settings['festival_name'] || 'UCSF 2026';
  const festivalSubtitle = settings['festival_subtitle'] || 'Union of Culture & Sports Fest';
  const festivalDates = settings['festival_dates'] || 'April 2026 - Shalom Hills';
  const announcementText = settings['announcement_text'];
  const footerText = settings['footer_text'];
  const schoolLogoUrl = settings['school_logo_url'];

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

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventsSection categories={categories} matches={matches} setActiveTab={setActiveTab} />;
      case 'home':
        return (
          <div className="space-y-0">
            {/* HERO */}
            <section className="relative py-32 md:py-48 overflow-hidden border-b border-border">
              {/* Hero Orbs */}
              <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] bg-ebony opacity-[0.18] blur-[100px] rounded-full animate-[orbdrift_10s_ease-in-out_infinite_alternate]" />
              <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-maple opacity-[0.15] blur-[100px] rounded-full animate-[orbdrift_12s_ease-in-out_infinite_alternate-reverse]" />
              
              <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 flex justify-center"
                >
                  <img 
                    src={schoolLogoUrl || "https://www.shalomhills.com/images/logo.png"} 
                    alt="School Logo" 
                    className="h-20 md:h-24 object-contain opacity-90 hover:opacity-100 transition-opacity"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hero-eyebrow mx-auto"
                >
                  {festivalDates}
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="hero-title mb-6"
                >
                  {festivalName.split(' ')[0]}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-maple to-white">{festivalName.split(' ')[1] || ''}</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hero-sub mb-12"
                >
                  {festivalSubtitle}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  <button 
                    onClick={() => setActiveTab('events')}
                    className="btn-primary group flex items-center gap-2"
                  >
                    Explore Events
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => handleTabChange('schedule')} className="btn-ghost">Full Schedule</button>
                </motion.div>
              </div>
            </section>

            {/* LIVE BAR */}
            <div className="sticky top-[62px] z-40 bg-bg3/90 backdrop-blur-md border-b border-border py-3 px-6 overflow-x-auto">
              <div className="max-w-7xl mx-auto flex items-center gap-6 whitespace-nowrap">
                <div className="font-ui text-[10px] font-bold text-muted uppercase tracking-[3px] flex-shrink-0">
                  Live & Up Next
                </div>
                {liveItems.length > 0 ? (
                  liveItems.map(item => (
                    <div key={item.id} className="flex items-center gap-2 px-4 py-1.5 bg-danger/10 border border-danger/30 text-danger font-ui text-xs font-bold tracking-wider flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                      LIVE: {item.title}
                    </div>
                  ))
                ) : (
                  <div className="text-muted font-ui text-xs font-bold tracking-wider">No live events right now</div>
                )}
                {upcomingItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-border text-muted font-ui text-xs font-bold tracking-wider flex-shrink-0">
                    {item.time_start} {item.title}
                  </div>
                ))}
              </div>
            </div>

            {/* ABOUT */}
            <section className="py-24 bg-bg-dark">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-24 items-start">
                  <div>
                    <p className="sec-label">The Festival</p>
                    <h2 className="text-5xl md:text-6xl mb-8">What Is UCSF?</h2>
                    <p className="text-white/60 mb-6 leading-relaxed">
                      The <strong className="text-white">Union of Culture & Sports Fest</strong> is the premier inter-school championship hosted by Shalom Hills International School.
                    </p>
                    <p className="text-white/60 mb-12 leading-relaxed">
                      Four legendary houses — Maple, Cedar, Ebony, and Oak — battle across disciplines, each vying for the ultimate crown and the glory of their house.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { val: '4', label: 'Houses' },
                        { val: '5', label: 'Sports' },
                        { val: '5', label: 'Culture Events' },
                        { val: '1', label: 'Champion' },
                      ].map((stat, i) => (
                        <div key={i} className="card-glass p-8 text-center">
                          <div className="font-display text-5xl text-maple leading-none mb-2">{stat.val}</div>
                          <div className="font-ui text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="sec-label">Events</p>
                    <h2 className="text-5xl md:text-6xl mb-8">The Battlegrounds</h2>
                    <div className="space-y-4">
                      {schedule.slice(0, 5).map((item) => (
                        <div key={item.id} className="card-glass p-6 flex items-center justify-between group hover:border-maple/30 transition-all">
                          <div>
                            <h4 className="font-display text-xl tracking-wide mb-1">{item.title}</h4>
                            <p className="font-ui text-[10px] font-bold uppercase tracking-widest text-white/40">{item.venue}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-ui text-xs font-bold text-maple mb-1">{item.time_start}</div>
                            <div className={cn(
                              "text-[10px] font-bold uppercase tracking-widest",
                              item.status === 'live' ? "text-red-500" : "text-white/20"
                            )}>
                              {item.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleTabChange('schedule')}
                      className="mt-8 font-ui text-xs font-bold uppercase tracking-widest text-maple flex items-center gap-2 hover:gap-4 transition-all"
                    >
                      View Full Schedule <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* SPORTS SECTION */}
            <section className="py-24 bg-bg2/30 border-y border-border">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16">
                  <p className="sec-label">Athletics</p>
                  <h2 className="text-5xl md:text-6xl mb-6">Sports Section</h2>
                  <p className="text-muted max-w-xl">The arena where strength meets strategy. Dynamic categories from the field.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {categories.filter(c => c.category_type === 'sport').map((sport, i) => (
                    <motion.div 
                      key={sport.id}
                      whileHover={{ y: -10 }}
                      className="card-glass overflow-hidden group h-full flex flex-col"
                    >
                      <div className="aspect-[4/5] relative bg-white/5 flex items-center justify-center overflow-hidden">
                        {sport.image_url ? (
                          <img 
                            src={sport.image_url} 
                            alt={sport.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-6xl mb-4 group-hover:scale-110 transition-transform relative z-10">{sport.icon || '🏆'}</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                          <h4 className="text-2xl font-display uppercase tracking-wider mb-4 text-white drop-shadow-lg">{sport.name}</h4>
                          <button 
                            onClick={() => {
                              setActiveTab('events');
                            }}
                            className="w-full py-3 bg-white/10 hover:bg-maple hover:text-bg-dark border border-white/10 hover:border-maple transition-all font-ui text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CULTURAL SECTION */}
            <section className="py-24">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 text-right">
                  <p className="sec-label">Arts & Expression</p>
                  <h2 className="text-5xl md:text-6xl mb-6">Culture Events</h2>
                  <p className="text-muted max-w-xl ml-auto">Where creativity takes center stage. A dynamic showcase of talent across all categories.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {categories.filter(c => c.category_type === 'cultural').map((event, i) => (
                    <motion.div 
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className="card-glass p-1 group overflow-hidden h-full flex flex-col"
                    >
                      <div className="aspect-square relative overflow-hidden rounded-lg mb-4 bg-white/5 flex items-center justify-center">
                        {event.image_url ? (
                          <img 
                            src={event.image_url} 
                            alt={event.name} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-6xl group-hover:scale-110 transition-transform relative z-10">
                            {event.icon || '🎭'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-maple/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-4 pt-0 flex-1 flex flex-col">
                        <h4 className="text-xl font-display uppercase tracking-widest mb-4">{event.name}</h4>
                        <div className="mt-auto">
                          <button 
                            onClick={() => {
                              setActiveTab('events');
                            }}
                            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-ui text-[9px] font-bold uppercase tracking-widest text-muted hover:text-text"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* NOTICES PREVIEW */}
          </div>
        );

      case 'schedule':
        const days = Array.from(new Set(schedule.map(s => s.day_label)));
        return (
          <div id="schedule" className="max-w-7xl mx-auto px-6 py-32 relative z-10">
            <div className="mb-20">
              <p className="sec-label">Event Schedule</p>
              <h2 className="text-6xl md:text-8xl">The Timeline</h2>
              <p className="text-muted mt-4 text-lg">Full Three-Day Programme — UCSF 2026</p>
            </div>
            
            <div className="space-y-32">
              {days.map(day => (
                <div key={day} className="space-y-16">
                  <div className="flex items-end gap-6 border-b border-border pb-6">
                    <h3 className="text-5xl text-maple uppercase tracking-wider">{day}</h3>
                    <span className="font-ui text-sm font-bold uppercase tracking-[0.3em] text-muted mb-2">
                      {schedule.find(s => s.day_label === day)?.day_date}
                    </span>
                  </div>
                  <div className="timeline">
                    {schedule.filter(s => s.day_label === day).map((item, idx) => (
                      <ScheduleCard 
                        key={item.id} 
                        item={item} 
                        index={idx} 
                        category={categories.find(c => c.name === item.category)}
                        onCategoryClick={() => setActiveTab('events')}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notices':
        const filteredNotices = notices.filter(n => noticePriority === 'all' || n.priority === noticePriority);
        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <p className="sec-label">Announcements</p>
                <h2 className="text-4xl sm:text-6xl md:text-7xl">Official Notices</h2>
                <p className="text-white/40 mt-4">Stay updated with the latest fest news and alerts.</p>
              </div>
              
              <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-border rounded-lg overflow-x-auto no-scrollbar pb-2">
                {['all', 'high', 'medium', 'low'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setNoticePriority(p as any)}
                    className={cn(
                      "px-6 py-2 font-ui text-[11px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap shrink-0",
                      noticePriority === p ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                    )}
                  >
                    {p === 'all' ? 'All' : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredNotices.map((notice) => (
                  <motion.div 
                    key={notice.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "card-glass p-8 group hover:border-maple/30 transition-all cursor-pointer",
                      expandedNoticeId === notice.id && "border-maple/50"
                    )}
                    onClick={() => setExpandedNoticeId(expandedNoticeId === notice.id ? null : notice.id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest",
                          notice.priority === 'high' ? "bg-danger/20 text-danger" :
                          notice.priority === 'medium' ? "bg-maple/20 text-maple" :
                          "bg-white/5 text-muted"
                        )}>
                          {notice.priority} priority
                        </span>
                        <span className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">
                          {new Date(notice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-maple">
                        {expandedNoticeId === notice.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-display tracking-wide uppercase mb-4">{notice.title}</h3>
                    
                    <AnimatePresence>
                      {expandedNoticeId === notice.id ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="prose prose-invert max-w-none prose-p:text-muted prose-p:text-lg prose-p:leading-relaxed prose-headings:text-white prose-headings:font-display prose-headings:uppercase prose-headings:tracking-widest prose-strong:text-maple prose-a:text-maple hover:prose-a:underline mt-6 pt-6 border-t border-white/10">
                            <ReactMarkdown>{notice.content}</ReactMarkdown>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-muted text-lg leading-relaxed line-clamp-2">{notice.content}</p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredNotices.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-40 text-center card-glass"
                >
                  <Bell size={48} className="mx-auto text-muted mb-4" />
                  <p className="font-ui text-sm font-bold text-muted uppercase tracking-widest">No notices found for this category.</p>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'gallery':
        const filteredGallery = gallery.filter(item => galleryYear === 'all' || item.year === galleryYear);

        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="sec-label">Moments</p>
                <h2 className="text-4xl sm:text-6xl md:text-7xl">Gallery</h2>
                <p className="text-white/40 mt-4">Relive the highlights of UCSF 2025 & 2026.</p>
              </div>
              
              <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-border rounded-lg self-start overflow-x-auto no-scrollbar pb-2 w-full max-w-full">
                {['all', 2026, 2025].map((year) => (
                  <button
                    key={year}
                    onClick={() => setGalleryYear(year as any)}
                    className={cn(
                      "px-6 py-2 font-ui text-[11px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap shrink-0",
                      galleryYear === year ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                    )}
                  >
                    {year === 'all' ? 'All Years' : year}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredGallery.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="card-glass overflow-hidden group cursor-pointer"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {item.type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-ebony flex items-center justify-center text-maple">
                          <Play size={64} className="group-hover:scale-125 transition-transform duration-500" />
                        </div>
                      )}
                      
                      {/* Year Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-bg/80 backdrop-blur-md border border-border px-3 py-1 font-ui text-[9px] font-bold uppercase tracking-widest text-maple">
                        {item.year || 2026}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                        <div className="flex items-center gap-3 text-white font-ui text-xs font-bold uppercase tracking-widest">
                          {item.type === 'image' ? <ImageIcon size={16} /> : <Video size={16} />}
                          View {item.type}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-display tracking-wide uppercase truncate">{item.title}</h3>
                      <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest mt-2">
                        {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredGallery.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-40 text-center card-glass"
                >
                  <p className="font-ui text-sm font-bold text-muted uppercase tracking-widest">No items found for this year. Check back soon!</p>
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'leaderboards':
        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div>
                <p className="sec-label">Rankings</p>
                <h2 className="text-4xl sm:text-6xl md:text-7xl">Leaderboards</h2>
                <p className="text-white/40 mt-4">Current standings of all dynasties across UCSF 2026.</p>
              </div>
              
              <div className="flex flex-col gap-4 w-full md:w-auto max-w-full overflow-hidden">
                <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-border rounded-lg overflow-x-auto no-scrollbar pb-2 w-full">
                  {['all', '7-8th', '9-10th', '11th', '12th'].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => {
                        setSelectedLeaderboardGrade(grade as any);
                        setSelectedLeaderboardEventId('all');
                      }}
                      className={cn(
                        "px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap shrink-0",
                        selectedLeaderboardGrade === grade && selectedLeaderboardEventId === 'all' ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                      )}
                    >
                      {grade === 'all' ? 'Overall' : grade}
                    </button>
                  ))}
                </div>

                <div className="flex items-center flex-nowrap gap-2 bg-white/5 p-1 border border-border rounded-lg overflow-x-auto no-scrollbar pb-2 w-full">
                  <button
                    onClick={() => {
                      setSelectedLeaderboardEventId('all');
                      setSelectedLeaderboardGrade('all');
                    }}
                    className={cn(
                      "px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap shrink-0",
                      selectedLeaderboardEventId === 'all' ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                    )}
                  >
                    All Events
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedLeaderboardEventId(cat.id);
                        setSelectedLeaderboardGrade('all');
                      }}
                      className={cn(
                        "px-4 py-2 font-ui text-[10px] font-bold uppercase tracking-widest transition-all rounded-md whitespace-nowrap shrink-0",
                        selectedLeaderboardEventId === cat.id ? "bg-maple text-bg shadow-lg" : "text-muted hover:text-text"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {sortedHousesForLeaderboard.map((house, index) => {
                const points = selectedLeaderboardEventId !== 'all' && eventPoints 
                  ? (eventPoints[house.id] || 0) 
                  : (gradePoints[house.id]?.[selectedLeaderboardGrade] || 0);
                
                return (
                  <motion.div
                    key={house.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card-glass p-8 flex flex-col items-center text-center gap-6 group"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-maple/30 flex items-center justify-center overflow-hidden shadow-2xl shadow-maple/10">
                        <img 
                          src={house.logo_url || ''} 
                          alt={house.name} 
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-maple text-bg rounded-full flex items-center justify-center font-display text-xl shadow-lg">
                        #{index + 1}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-display text-white uppercase tracking-wider">{house.name}</h3>
                      <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.3em] mt-2 italic">"{house.motto}"</p>
                    </div>

                    <div className="w-full pt-6 border-t border-border">
                      <div className="text-5xl font-display text-maple">{points}</div>
                      <div className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest mt-2">
                        {selectedLeaderboardEventId !== 'all' ? 'Event Points' : 'Total Points'}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'spreadsheet':
        const spreadsheetUrl = settings['spreadsheet_url'];
        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="sec-label">Management</p>
                <h2 className="text-6xl md:text-7xl">Data Sheet</h2>
                <p className="text-white/40 mt-4">Detailed event and participant management via Google Sheets.</p>
              </div>
              {spreadsheetUrl && (
                <a 
                  href={spreadsheetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-3"
                >
                  <ExternalLink size={20} />
                  Open Full Sheet
                </a>
              )}
            </div>

            <div className="card-glass h-[800px] overflow-hidden shadow-2xl relative">
              {spreadsheetUrl ? (
                <iframe 
                  src={getEmbedUrl(spreadsheetUrl)} 
                  className="w-full h-full border-none"
                  title="Data Spreadsheet"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-4">
                  <FileText size={64} className="opacity-10" />
                  <p className="font-ui text-sm font-bold uppercase tracking-widest">No spreadsheet URL configured</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (activeTab === 'admin') {
    return (
      <AdminPanel 
        matches={matches} 
        houses={houses} 
        schedule={schedule}
        categories={categories}
        notices={notices}
        gallery={gallery}
        culturalResults={culturalResults}
        stagedChanges={stagedChanges}
        profile={profile}
        settings={settings}
        refresh={refresh}
        onBack={() => setActiveTab('home')}
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleTabChange}
      title={festivalName}
      subtitle={festivalSubtitle}
      announcement={announcementText}
      footerText={footerText}
      schoolLogoUrl={schoolLogoUrl}
      profile={profile}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
