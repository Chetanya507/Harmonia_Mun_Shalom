import React from 'react';
import { Match } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { MapPin, Clock, Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
  onClick?: () => void;
}

const MatchCard = React.memo(({ match, compact, onClick }: MatchCardProps) => {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onClick={onClick}
        className={cn(
          "bg-white/5 border border-border p-4 rounded-2xl flex items-center justify-between gap-4 group cursor-pointer hover:border-maple/30 transition-all",
          isLive && "border-danger/30 bg-danger/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-maple/30 flex items-center justify-center overflow-hidden shadow-lg">
              <img src={match.team1?.logo_url || ''} alt={match.team1?.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-maple/30 flex items-center justify-center overflow-hidden shadow-lg">
              <img src={match.team2?.logo_url || ''} alt={match.team2?.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xs uppercase tracking-wider">{match.team1?.name} vs {match.team2?.name}</span>
            <span className="font-ui text-[8px] font-bold text-muted uppercase tracking-widest">{match.venue}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-lg text-maple leading-none">
            {match.score1 ?? '-'}:{match.score2 ?? '-'}
          </div>
          <div className={cn(
            "font-ui text-[8px] font-bold uppercase tracking-widest mt-1",
            isLive ? "text-danger animate-pulse" : "text-muted"
          )}>
            {match.status}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className={cn(
        "card-glass rounded-none border-border overflow-hidden group relative",
        onClick && "cursor-pointer hover:border-maple/30",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]",
        isLive ? "before:bg-danger bg-danger/5 border-danger/20" : 
        isCompleted ? "before:bg-success bg-success/5 border-success/10" : 
        "before:bg-border"
      )}
    >
      {/* Match Header */}
      <div className="px-5 py-3 bg-white/5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-ui text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
              {match.category?.name} <span className="mx-2 text-subtle">|</span> M{match.match_no}
            </span>
            {match.category?.gender && (
              <span className="font-ui text-[8px] font-bold text-subtle uppercase tracking-widest mt-0.5">
                {match.category?.gender} {match.eligible_years && <span className="mx-1 text-muted/30">|</span>} {match.eligible_years}
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "badge",
          isLive ? "badge-live" : isCompleted ? "badge-completed" : "badge-upcoming"
        )}>
          {isLive ? "Live" : isCompleted ? "Completed" : "Upcoming"}
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between gap-6">
          {/* Team 1 */}
          <div className="flex-1 flex flex-col items-center text-center gap-3 group/team">
            <div 
              className="w-16 h-16 rounded-full bg-white/10 border-2 border-maple/30 flex items-center justify-center relative transition-transform group-hover/team:scale-110 overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 blur-xl opacity-20" style={{ backgroundColor: match.team1?.color }} />
              {match.team1?.logo_url ? (
                <img 
                  src={match.team1?.logo_url} 
                  alt={match.team1?.name} 
                  className="w-full h-full object-cover rounded-full relative z-10" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="relative z-10 text-xl font-display text-muted">{match.team1?.name?.[0]}</span>
              )}
            </div>
            <span className="font-display text-lg text-text tracking-wide uppercase">{match.team1?.name}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <span className={cn(
                "text-5xl font-display tabular-nums leading-none",
                isCompleted && match.score1! > match.score2! ? "text-maple" : "text-text"
              )}>
                {match.score1 ?? '-'}
              </span>
              <span className="text-subtle font-display text-3xl">:</span>
              <span className={cn(
                "text-5xl font-display tabular-nums leading-none",
                isCompleted && match.score2! > match.score1! ? "text-maple" : "text-text"
              )}>
                {match.score2 ?? '-'}
              </span>
            </div>
          </div>

          {/* Team 2 */}
          <div className="flex-1 flex flex-col items-center text-center gap-3 group/team">
            <div 
              className="w-16 h-16 rounded-full bg-white/10 border-2 border-maple/30 flex items-center justify-center relative transition-transform group-hover/team:scale-110 overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 blur-xl opacity-20" style={{ backgroundColor: match.team2?.color }} />
              {match.team2?.logo_url ? (
                <img 
                  src={match.team2?.logo_url} 
                  alt={match.team2?.name} 
                  className="w-full h-full object-cover rounded-full relative z-10" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="relative z-10 text-xl font-display text-muted">{match.team2?.name?.[0]}</span>
              )}
            </div>
            <span className="font-display text-lg text-text tracking-wide uppercase">{match.team2?.name}</span>
          </div>
        </div>

        {/* Venue & Time */}
        <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-6 justify-center">
          {match.venue && (
            <div className="flex items-center gap-2 font-ui text-[10px] text-muted font-bold uppercase tracking-widest">
              <MapPin size={14} className="text-maple" />
              {match.venue}
            </div>
          )}
          {match.match_time && (
            <div className="flex items-center gap-2 font-ui text-[10px] text-muted font-bold uppercase tracking-widest">
              <Clock size={14} className="text-maple" />
              {new Date(match.match_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {match.man_of_the_match && (
            <div className="flex items-center gap-2 font-ui text-[10px] text-maple font-bold uppercase tracking-widest bg-maple/10 px-4 py-1 rounded-full border border-maple/20">
              <Trophy size={14} />
              MOTM: {match.man_of_the_match}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default MatchCard;
