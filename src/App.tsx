import React, { useState } from 'react';
import Layout from './components/Layout';
import HouseCard from './components/HouseCard';
import MatchCard from './components/MatchCard';
import ScheduleCard from './components/ScheduleCard';
import { useUCSFData } from './hooks/useUCSFData';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Activity, Calendar, Shield, Loader2, AlertCircle, ChevronRight, Play, Image as ImageIcon, Video, ExternalLink } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [galleryYear, setGalleryYear] = useState<'all' | 2025 | 2026>('all');
  const { houses, matches, schedule, settings, categories, gallery, loading, error, refresh } = useUCSFData();
  const liveItems = React.useMemo(() => schedule.filter(s => s.status === 'live'), [schedule]);
  const upcomingItems = React.useMemo(() => schedule.filter(s => s.status === 'upcoming').slice(0, 3), [schedule]);

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
          We couldn't connect to the UCSF database. Please check your credentials.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const festivalName = settings['festival_name'] || 'UCSF 2026';
  const festivalSubtitle = settings['festival_subtitle'] || 'Union of Culture & Sports Fest';
  const festivalDates = settings['festival_dates'] || 'April 2026 - Shalom Hills';
  const registrationOpen = settings['registration_open'] !== 'false';
  const announcementText = settings['announcement_text'];
  const footerText = settings['footer_text'];

  const renderContent = () => {
    switch (activeTab) {
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
                  <button onClick={() => {
                    const el = document.getElementById('scoreboard');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} className="btn-primary">Live Standings</button>
                  <button onClick={() => setActiveTab('matches')} className="btn-ghost">View Fixtures</button>
                  <button onClick={() => setActiveTab('schedule')} className="btn-ghost">Full Schedule</button>
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

            {/* HOUSES */}
            <section className="py-32">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20">
                  <p className="sec-label">The Houses</p>
                  <h2 className="mb-6">Four Houses.<br />One Crown.</h2>
                  <p className="text-muted max-w-xl text-lg">Each house carries the spirit, pride, and legacy of its warriors.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {houses.map((house) => (
                    <HouseCard key={house.id} house={house} isTop={house.rank_pos === 1} />
                  ))}
                </div>
              </div>
            </section>

            {/* SCOREBOARD */}
            <section id="scoreboard" className="py-32 bg-bg2/50 border-y border-border">
              <div className="max-w-7xl mx-auto px-6">
                <div className="mb-20">
                  <p className="sec-label">Live Standings</p>
                  <h2 className="text-5xl md:text-7xl">The Leaderboard</h2>
                </div>
                
                <div className="card-glass overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                          <th className="px-8 py-6">#</th>
                          <th className="px-8 py-6">House</th>
                          <th className="px-8 py-6 text-center">Points</th>
                          <th className="px-8 py-6 text-right">Motto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {houses.map((house) => (
                          <tr key={house.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <span className={cn(
                                "font-display text-3xl",
                                house.rank_pos === 1 ? "text-maple" : "text-muted"
                              )}>
                                {house.rank_pos.toString().padStart(2, '0')}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-6">
                                <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-border overflow-hidden">
                                  {house.logo_url ? (
                                    <img 
                                      src={house.logo_url} 
                                      alt={house.name} 
                                      className="w-full h-full object-contain p-2" 
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-xl font-display text-muted">{house.name[0]}</span>
                                  )}
                                </div>
                                <span className="font-display text-3xl tracking-wide uppercase">{house.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="font-display text-4xl text-maple">{house.points}</span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-subtle group-hover:text-muted transition-colors">
                                {house.motto}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

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
                        { val: '3', label: 'Sports' },
                        { val: '6', label: 'Matches' },
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
                      onClick={() => setActiveTab('schedule')}
                      className="mt-8 font-ui text-xs font-bold uppercase tracking-widest text-maple flex items-center gap-2 hover:gap-4 transition-all"
                    >
                      View Full Schedule <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'schedule':
        const days = Array.from(new Set(schedule.map(s => s.day_label)));
        return (
          <div id="schedule" className="max-w-7xl mx-auto px-6 py-32 relative z-10">
            <div className="mb-20">
              <p className="sec-label">Event Schedule</p>
              <h2 className="text-6xl md:text-8xl">The Timeline</h2>
              <p className="text-muted mt-4 text-lg">Full Two-Day Programme — UCSF 2026</p>
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
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'matches':
        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16">
              <p className="sec-label">Fixtures & Results</p>
              <h2 className="text-6xl md:text-7xl">Match Schedule</h2>
              <p className="text-white/40 mt-4">Browse results by sport. Real-time updates enabled.</p>
            </div>

            <div className="space-y-24">
              {categories.map(cat => {
                const catMatches = matches.filter(m => m.category_id === cat.id);
                if (catMatches.length === 0) return null;
                return (
                  <section key={cat.id} className="space-y-12">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                      <h3 className="text-4xl tracking-wider uppercase font-display">{cat.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {catMatches.map(match => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        );

      case 'houses':
        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16">
              <p className="sec-label">Houses</p>
              <h2 className="text-6xl md:text-7xl">The Houses</h2>
              <p className="text-white/40 mt-4">The four pillars of UCSF 2026.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {houses.map((house) => (
                <HouseCard key={house.id} house={house} isTop={house.rank_pos === 1} />
              ))}
            </div>
          </div>
        );

      case 'brochure':
        return (
          <div className="max-w-7xl mx-auto px-6 py-24 h-[calc(100vh-62px)] flex flex-col">
            <div className="mb-8">
              <p className="sec-label">Event Guide</p>
              <h2 className="text-6xl md:text-7xl">Brochure</h2>
              <p className="text-white/40 mt-4">Download or view the official UCSF 2026 brochure below.</p>
            </div>
            <div className="flex-grow card-glass overflow-hidden relative">
              <iframe 
                src={settings.brochure_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} 
                className="w-full h-full border-none"
                title="UCSF 2026 Brochure"
              />
              <div className="absolute bottom-4 right-4">
                <a 
                  href={settings.brochure_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        );

      case 'register':
        const googleForms = [
          { title: 'Sports Registration', url: settings['google_form_sports'] || 'https://forms.google.com' },
          { title: 'Cultural Registration', url: settings['google_form_cultural'] || 'https://forms.google.com' },
          { title: 'Volunteer Signup', url: settings['google_form_volunteer'] || 'https://forms.google.com' },
        ];

        return (
          <div className="max-w-4xl mx-auto px-6 py-24">
            <div className="mb-16">
              <p className="sec-label">Join the Battle</p>
              <h2 className="text-6xl md:text-7xl">Register</h2>
              <p className="text-white/40 mt-4">
                {registrationOpen 
                  ? "Sign up for your favorite events via the official Google Forms below."
                  : "Registrations are currently closed. Please check back later."}
              </p>
            </div>
            {registrationOpen ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {googleForms.map((form, i) => (
                  <motion.a
                    key={i}
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="card-glass p-8 flex flex-col items-start gap-4 group hover:border-maple/40 transition-all"
                  >
                    <div className="w-12 h-12 bg-maple/10 text-maple rounded-xl flex items-center justify-center border border-maple/20 group-hover:bg-maple group-hover:text-bg transition-colors">
                      <ExternalLink size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display tracking-wider mb-2">{form.title}</h3>
                      <p className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted">Open in Google Forms</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="card-glass p-12 text-center">
                <AlertCircle size={48} className="mx-auto text-muted mb-6" />
                <p className="font-ui text-sm font-bold text-muted uppercase tracking-widest">Registrations are closed</p>
              </div>
            )}
          </div>
        );

      case 'gallery':
        const filteredGallery = gallery.filter(item => galleryYear === 'all' || item.year === galleryYear);

        return (
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="sec-label">Moments</p>
                <h2 className="text-6xl md:text-7xl">Gallery</h2>
                <p className="text-white/40 mt-4">Relive the highlights of UCSF 2025 & 2026.</p>
              </div>
              
              <div className="flex items-center gap-2 bg-white/5 p-1 border border-border rounded-lg self-start">
                {['all', 2026, 2025].map((year) => (
                  <button
                    key={year}
                    onClick={() => setGalleryYear(year as any)}
                    className={cn(
                      "px-6 py-2 font-ui text-[11px] font-bold uppercase tracking-widest transition-all rounded-md",
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

      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      title={festivalName}
      subtitle={festivalSubtitle}
      announcement={announcementText}
      footerText={footerText}
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
