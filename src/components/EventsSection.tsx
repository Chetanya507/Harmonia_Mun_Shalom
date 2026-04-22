import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Match } from '../types';
import { Trophy, Music, Palette, Film, Theater, Swords, Target, Users, Clock, Calendar, Info, ChevronRight, X, ArrowRight, FileText } from 'lucide-react';
import MatchCard from './MatchCard';
import { cn } from '../lib/utils';

interface EventsSectionProps {
  categories: Category[];
  matches: Match[];
  setActiveTab: (tab: string) => void;
}

export default function EventsSection({ categories, matches, setActiveTab }: EventsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const sports = categories.filter(c => c.category_type === 'sport'); // These represent committees
  const cultural = categories.filter(c => c.category_type === 'cultural');
  const other = categories.filter(c => !c.category_type);

  const expandedCategory = categories.find(c => c.id === expandedId);
  const expandedMatches = expandedId ? matches.filter(m => m.category_id === expandedId) : [];

  const generalGuidelines = [
    "Each student can represent only their own house.",
    "It is mandatory to fill out the Google Form and complete the registration process.",
    "A student may participate in a maximum of three events (including both sports and cultural events).",
    "For cultural events, registration and audition submissions will close on 8th April 2026.",
    "All submissions must be made online through the link shared by the school."
  ];

  const renderEventCard = (cat: Category) => {
    const catMatches = matches.filter(m => m.category_id === cat.id);
    
    return (
      <motion.div
        key={cat.id}
        layoutId={`card-${cat.id}`}
        onClick={() => setExpandedId(cat.id)}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white/5 border border-border rounded-[32px] p-8 flex flex-col h-full hover:border-maple/30 transition-all group cursor-pointer"
      >
        <div className="flex items-start justify-between mb-6">
          <motion.div layoutId={`icon-${cat.id}`} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden">
            {cat.icon || '🏆'}
          </motion.div>
          <div className="text-right">
            <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted block mb-1">
              {cat.category_type || 'Event'}
            </span>
            <span className="px-3 py-1 bg-white/5 border border-border rounded-full font-ui text-[9px] font-bold uppercase tracking-widest text-maple">
              {cat.gender || 'Mixed'}
            </span>
          </div>
        </div>

        <motion.h3 layoutId={`title-${cat.id}`} className="text-3xl font-display uppercase tracking-wider mb-4">{cat.name}</motion.h3>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          {cat.team_size && (
            <div className="space-y-1">
              <p className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Team Size</p>
              <p className="text-sm font-medium text-text">{cat.team_size}</p>
            </div>
          )}
          {cat.duration && (
            <div className="space-y-1">
              <p className="font-ui text-[9px] font-bold text-muted uppercase tracking-widest">Duration</p>
              <p className="text-sm font-medium text-text">{cat.duration}</p>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between text-maple font-ui text-[10px] font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
          View Agendas & Guide
          <ArrowRight size={14} />
        </div>
      </motion.div>
    );
  };

  return (
    <div id="committees" className="max-w-7xl mx-auto px-6 py-24 space-y-32">
      <AnimatePresence>
        {expandedId && expandedCategory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedId(null)}
              className="absolute inset-0 bg-bg-dark/95 backdrop-blur-xl"
            />
            
            <motion.div
              layoutId={`card-${expandedId}`}
              className="relative w-full max-w-5xl max-h-[90vh] bg-bg2 border border-border rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
            >
              <button 
                onClick={() => setExpandedId(null)}
                className="absolute top-8 right-8 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all z-10"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto p-8 md:p-16">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="flex-1 space-y-12">
                    <div className="flex items-center gap-8">
                      <motion.div layoutId={`icon-${expandedId}`} className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center text-6xl overflow-hidden">
                        {expandedCategory.icon || '🏆'}
                      </motion.div>
                      <div>
                        <span className="font-ui text-xs font-bold uppercase tracking-[0.3em] text-maple mb-2 block">
                          {expandedCategory.category_type} · {expandedCategory.gender || 'Mixed'}
                        </span>
                        <motion.h2 layoutId={`title-${expandedId}`} className="text-5xl md:text-7xl font-display uppercase tracking-tighter">
                          {expandedCategory.name}
                        </motion.h2>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                      {[
                        { label: 'Team Size', val: expandedCategory.team_size },
                        { label: 'Duration', val: expandedCategory.duration },
                      ].filter(s => s.val).map((stat, i) => (
                        <div key={i} className="space-y-2">
                          <p className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest">{stat.label}</p>
                          <p className="text-xl font-medium text-text">{stat.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-2xl font-display uppercase tracking-widest mb-6 flex items-center gap-3">
                          <Info className="text-maple" />
                          Agenda & Background Guide
                        </h4>
                        <div className="bg-white/5 border border-border rounded-3xl p-8 md:p-10">
                          <p className="text-lg text-text/80 leading-relaxed whitespace-pre-line mb-4">
                            {expandedCategory.special_rules || "Agenda details and background guide will be available soon."}
                          </p>
                          <a href="#" className="inline-flex items-center gap-2 text-maple font-ui text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                            <FileText size={16} />
                            Download Background Guide
                          </a>
                        </div>
                      </div>

                      {expandedCategory.judging_criteria && expandedCategory.judging_criteria.length > 0 && (
                        <div>
                          <h4 className="text-2xl font-display uppercase tracking-widest mb-6">Judging Criteria</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {expandedCategory.judging_criteria.map((item, i) => (
                              <div key={i} className="bg-white/5 border border-border p-6 rounded-2xl flex justify-between items-center">
                                <span className="text-lg font-medium">{item.criterion}</span>
                                <span className="text-sm font-bold text-maple bg-maple/10 px-3 py-1 rounded-full">{item.weight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-80 shrink-0 space-y-8">
                    <h4 className="text-2xl font-display uppercase tracking-widest flex items-center justify-between">
                      Matches
                      <span className="text-xs font-bold text-muted">{expandedMatches.length} Total</span>
                    </h4>
                    
                    <div className="space-y-4">
                      {expandedMatches.length > 0 ? (
                        expandedMatches.map(match => (
                          <MatchCard key={match.id} match={match} />
                        ))
                      ) : (
                        <div className="bg-white/5 border border-border border-dashed rounded-3xl p-12 text-center">
                          <p className="text-muted text-sm">No matches scheduled yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
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
          <p className="text-muted mt-4 text-lg">Essential information for all Harmonia MUN 2026 participants.</p>
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

      {sports.length > 0 && (
        <section>
          <div className="mb-16">
            <p className="sec-label">Harmonia MUN 2026</p>
            <h2 className="text-6xl md:text-8xl">Committees</h2>
            <p className="text-muted mt-4 text-lg">Detailed agendas and background guides for all committees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sports.map(renderEventCard)}
          </div>
        </section>
      )}

      {cultural.length > 0 && (
        <section>
          <div className="mb-16">
            <p className="sec-label">Arts & Expression</p>
            <h2 className="text-6xl md:text-8xl">Culture Events</h2>
            <p className="text-muted mt-4 text-lg">Showcasing talent, creativity, and artistic excellence across all categories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cultural.map(renderEventCard)}
          </div>
        </section>
      )}

      {other.length > 0 && (
        <section>
          <div className="mb-16">
            <p className="sec-label">Browse</p>
            <h2 className="text-6xl md:text-8xl">Categories</h2>
            <p className="text-muted mt-4 text-lg">Explore additional event categories and participation guidelines.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {other.map(renderEventCard)}
          </div>
        </section>
      )}
    </div>
  );
}
