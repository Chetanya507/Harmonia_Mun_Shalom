import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Match } from '../types';
import { Trophy, Music, Palette, Film, Theater, Swords, Target, Users, Clock, Calendar, Info, ChevronRight, X, ArrowRight } from 'lucide-react';
import MatchCard from './MatchCard';
import { cn } from '../lib/utils';

interface EventsSectionProps {
  categories: Category[];
  matches: Match[];
  setActiveTab: (tab: string) => void;
}

export default function EventsSection({ categories, matches, setActiveTab }: EventsSectionProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  
  // Group categories by base name (e.g., "Football Boys" and "Football Girls" -> "Football")
  const groupCategories = (cats: Category[]) => {
    const groups: Record<string, Category[]> = {};
    cats.forEach(cat => {
      // Simple heuristic: take the first word or everything before " Boys" or " Girls"
      const baseName = cat.name.replace(/\s+(Boys|Girls|U-\d+|Grade\s+\d+).*/i, '').trim();
      if (!groups[baseName]) groups[baseName] = [];
      groups[baseName].push(cat);
    });
    return groups;
  };

  const sportsGroups = groupCategories(categories.filter(c => c.category_type === 'sport'));
  const culturalGroups = groupCategories(categories.filter(c => c.category_type === 'cultural'));
  const otherGroups = groupCategories(categories.filter(c => !c.category_type));

  const generalGuidelines = [
    "Each student can represent only their own house.",
    "It is mandatory to fill out the Google Form and complete the registration process.",
    "A student may participate in a maximum of three events (including both sports and cultural events).",
    "For cultural events, registration and audition submissions will close on 8th April 2026.",
    "All submissions must be made online through the link shared by the school."
  ];

  const allGroups = { ...sportsGroups, ...culturalGroups, ...otherGroups };
  const expandedGroup = expandedGroupId ? allGroups[expandedGroupId] : null;

  const renderEventCard = (groupName: string, groupCategories: Category[]) => {
    const firstCat = groupCategories[0];
    const groupMatches = matches.filter(m => groupCategories.some(c => c.id === m.category_id));
    
    return (
      <motion.div
        key={groupName}
        layoutId={`card-${groupName}`}
        onClick={() => setExpandedGroupId(groupName)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/5 border border-border rounded-[32px] p-8 flex flex-col h-full hover:border-maple/30 transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-6">
          <motion.div layoutId={`icon-${groupName}`} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden">
            {firstCat.icon || '🏆'}
          </motion.div>
          <div className="text-right">
            <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted block mb-1">
              {firstCat.category_type || 'Event'}
            </span>
            <div className="flex flex-wrap justify-end gap-1">
              {groupCategories.map(c => (
                <span key={c.id} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-full font-ui text-[8px] font-bold uppercase tracking-widest text-maple/70">
                  {c.gender || c.name.match(/(Boys|Girls)/i)?.[0] || 'Mixed'}
                </span>
              ))}
            </div>
          </div>
        </div>

        <motion.h3 layoutId={`title-${groupName}`} className="text-3xl font-display uppercase tracking-wider mb-4">{groupName}</motion.h3>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="space-y-1">
            <p className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Categories</p>
            <p className="text-sm font-medium text-text">{groupCategories.length}</p>
          </div>
          <div className="space-y-1">
            <p className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Total Matches</p>
            <p className="text-sm font-medium text-text">{groupMatches.length}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between text-maple font-ui text-[10px] font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
          View Details & Matches
          <ArrowRight size={14} />
        </div>
      </motion.div>
    );
  };

  return (
    <div id="events" className="max-w-7xl mx-auto px-6 py-24 space-y-32">
      <AnimatePresence>
        {expandedGroupId && expandedGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedGroupId(null)}
              className="absolute inset-0 bg-bg-dark/95 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId={`card-${expandedGroupId}`}
              className="relative w-full max-w-6xl max-h-[90vh] bg-bg2 border border-border rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
            >
              <button 
                onClick={() => setExpandedGroupId(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto p-8 md:p-16">
                <div className="mb-16">
                  <div className="flex items-center gap-8">
                    <motion.div layoutId={`icon-${expandedGroupId}`} className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-6xl overflow-hidden">
                      {expandedGroup[0].icon || '🏆'}
                    </motion.div>
                    <div>
                      <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-maple mb-2 block">
                        {expandedGroup[0].category_type} · {expandedGroup.length} Categories
                      </span>
                      <motion.h2 layoutId={`title-${expandedGroupId}`} className="text-5xl md:text-7xl font-display uppercase tracking-tighter">
                        {expandedGroupId}
                      </motion.h2>
                    </div>
                  </div>
                </div>

                <div className="space-y-24">
                  {expandedGroup.map((cat) => {
                    const catMatches = matches.filter(m => m.category_id === cat.id);
                    return (
                      <div key={cat.id} className="space-y-12 pb-12 border-b border-white/5 last:border-0">
                        <div className="flex flex-col md:flex-row gap-12 items-start">
                          <div className="flex-1 space-y-12">
                            <div>
                              <h3 className="text-3xl md:text-4xl font-display uppercase tracking-wider text-white mb-2">{cat.name}</h3>
                              <div className="flex flex-wrap gap-4">
                                {[
                                  { label: 'Gender', val: cat.gender },
                                  { label: 'Team Size', val: cat.team_size },
                                  { label: 'Duration', val: cat.duration },
                                ].filter(s => s.val).map((stat, i) => (
                                  <div key={i} className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                    <p className="font-ui text-[8px] font-bold text-muted uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-xs font-bold text-text uppercase">{stat.val}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                              <div className="space-y-6">
                                <h4 className="text-xl font-display uppercase tracking-widest flex items-center gap-3">
                                  <Info className="text-maple" size={20} />
                                  Rules
                                </h4>
                                <div className="bg-white/5 border border-border rounded-3xl p-6">
                                  <p className="text-sm text-text/70 leading-relaxed whitespace-pre-line">
                                    {cat.special_rules || "General rules apply."}
                                  </p>
                                </div>
                              </div>

                              {cat.judging_criteria && cat.judging_criteria.length > 0 && (
                                <div className="space-y-6">
                                  <h4 className="text-xl font-display uppercase tracking-widest">Criteria</h4>
                                  <div className="grid grid-cols-1 gap-3">
                                    {cat.judging_criteria.map((item, i) => (
                                      <div key={i} className="bg-white/5 border border-border p-4 rounded-2xl flex justify-between items-center">
                                        <span className="text-sm font-medium">{item.criterion}</span>
                                        <span className="text-[10px] font-bold text-maple bg-maple/10 px-3 py-1 rounded-full">{item.weight}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="w-full md:w-96 shrink-0 space-y-8">
                            <h4 className="text-xl font-display uppercase tracking-widest flex items-center justify-between">
                              Matches
                              <span className="text-[10px] font-bold text-muted">{catMatches.length} Total</span>
                            </h4>
                            
                            <div className="space-y-12">
                              {catMatches.length > 0 ? (
                                (() => {
                                  const matchesByGrade: Record<string, Match[]> = {};
                                  catMatches.forEach(m => {
                                    const grade = m.eligible_years || 'General';
                                    if (!matchesByGrade[grade]) matchesByGrade[grade] = [];
                                    matchesByGrade[grade].push(m);
                                  });

                                  return Object.entries(matchesByGrade).map(([grade, gradeMatches]) => (
                                    <div key={grade} className="space-y-6">
                                      <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-maple" />
                                        <h5 className="text-sm font-display uppercase tracking-widest text-maple/90">{grade}</h5>
                                      </div>
                                      <div className="grid grid-cols-1 gap-4">
                                        {gradeMatches.map(match => (
                                          <MatchCard key={match.id} match={match} compact />
                                        ))}
                                      </div>
                                    </div>
                                  ));
                                })()
                              ) : (
                                <div className="bg-white/5 border border-border border-dashed rounded-3xl p-8 text-center">
                                  <p className="text-muted text-[10px] font-bold uppercase tracking-widest">No matches scheduled</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* General Guidelines */}
      <section>
        <div className="mb-16">
          <p className="sec-label">Rules & Instructions</p>
          <h2 className="text-6xl md:text-8xl">General Guidelines</h2>
          <p className="text-muted mt-4 text-lg">Essential information for all UCSF 2026 participants.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-border p-10 rounded-3xl">
            <ul className="space-y-6">
              {generalGuidelines.slice(0, 3).map((item, i) => (
                <li key={i} className="flex gap-4 text-text/80 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-maple mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 border border-border p-10 rounded-3xl">
            <ul className="space-y-6">
              {generalGuidelines.slice(3).map((item, i) => (
                <li key={i} className="flex gap-4 text-text/80 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-maple mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {Object.keys(sportsGroups).length > 0 && (
        <section>
          <div className="mb-16">
            <p className="sec-label">UCSF 2026</p>
            <h2 className="text-6xl md:text-8xl">Sports Events</h2>
            <p className="text-muted mt-4 text-lg">Competitive house matches across various disciplines.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(sportsGroups).map(([name, cats]) => renderEventCard(name, cats))}
          </div>
        </section>
      )}

      {Object.keys(culturalGroups).length > 0 && (
        <section>
          <div className="mb-16">
            <p className="sec-label">Arts & Expression</p>
            <h2 className="text-6xl md:text-8xl">Culture Events</h2>
            <p className="text-muted mt-4 text-lg">Showcasing talent, creativity, and artistic excellence across all categories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(culturalGroups).map(([name, cats]) => renderEventCard(name, cats))}
          </div>
        </section>
      )}

      {Object.keys(otherGroups).length > 0 && (
        <section>
          <div className="mb-16">
            <p className="sec-label">Browse</p>
            <h2 className="text-6xl md:text-8xl">Categories</h2>
            <p className="text-muted mt-4 text-lg">Explore additional event categories and participation guidelines.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(otherGroups).map(([name, cats]) => renderEventCard(name, cats))}
          </div>
        </section>
      )}
    </div>
  );
}
