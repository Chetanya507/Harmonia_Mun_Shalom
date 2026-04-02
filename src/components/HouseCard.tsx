import React from 'react';
import { motion } from 'motion/react';
import { House } from '../types';
import { cn } from '../lib/utils';
import { Trophy } from 'lucide-react';

interface HouseCardProps {
  house: House;
  isTop?: boolean;
  key?: any;
}

const HouseCard = React.memo(({ house, isTop }: HouseCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "card-glass relative overflow-hidden rounded-none transition-all duration-300 group",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]",
        isTop ? "before:bg-maple border-maple/20 bg-maple/5 shadow-[0_0_30px_rgba(245,197,24,0.05)]" : "before:bg-border"
      )}
    >
      {/* Rank Badge */}
      <div className={cn(
        "absolute top-0 right-0 w-12 h-12 flex items-center justify-center font-display text-2xl skew-x-[-12deg] origin-top-right",
        house.rank_pos === 1 ? "bg-maple text-bg" :
        house.rank_pos === 2 ? "bg-slate-300 text-bg" :
        house.rank_pos === 3 ? "bg-orange-400 text-bg" : "bg-white/10 text-muted"
      )}>
        <span className="skew-x-[12deg]">{house.rank_pos}</span>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-5 mb-8">
          <div 
            className="w-20 h-20 flex items-center justify-center text-5xl relative"
          >
            <div className="absolute inset-0 blur-2xl opacity-20" style={{ backgroundColor: house.color }} />
            <span className="relative z-10 filter drop-shadow-lg">{house.mascot || '🛡️'}</span>
          </div>
          <div>
            <h3 className="text-2xl font-display tracking-wider text-text group-hover:text-maple transition-colors">{house.name}</h3>
            <p className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted">{house.mascot_name}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative group/points">
            <div className="absolute -inset-1 bg-gradient-to-r from-maple/20 to-transparent opacity-0 group-hover/points:opacity-100 transition-opacity blur-sm" />
            <div className="relative flex items-center justify-between p-4 bg-white/5 border border-border">
              <div className="flex items-center gap-3 font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                <Trophy size={16} className="text-maple" />
                Points
              </div>
              <span className="text-4xl font-display text-maple leading-none">{house.points}</span>
            </div>
          </div>

          {house.motto && (
            <div className="relative pl-4 border-l border-maple/30">
              <p className="text-xs text-muted italic font-medium leading-relaxed">
                "{house.motto}"
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default HouseCard;
