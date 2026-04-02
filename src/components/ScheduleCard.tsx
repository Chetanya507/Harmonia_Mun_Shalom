import React from 'react';
import { ScheduleItem, Category } from '../types';
import { cn } from '../lib/utils';
import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface ScheduleCardProps {
  item: ScheduleItem;
  category?: Category;
  index?: number;
  key?: any;
}

const ScheduleCard = React.memo(({ item, category, index = 0 }: ScheduleCardProps) => {
  const isLive = item.status === 'live';
  const isCompleted = item.status === 'completed';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-0 items-start relative group",
        isLive ? "st-live" : isCompleted ? "st-completed" : "st-upcoming"
      )}
    >
      {/* Time Column */}
      <div className="pt-7 pr-4 md:pr-8 text-right flex-shrink-0">
        <div className="font-display text-lg md:text-2xl tracking-wider text-text leading-none">
          {item.time_start}
        </div>
        {item.time_end && (
          <div className="font-ui text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
            — {item.time_end}
          </div>
        )}
      </div>

      {/* Body Column */}
      <div className="relative pl-8 md:pl-12 pb-12 border-l border-border group-last:pb-0">
        {/* Node Dot */}
        <div className={cn(
          "absolute left-[-6px] top-7 w-3 h-3 rounded-full border-2 border-bg z-10 transition-all duration-500",
          isLive ? "bg-danger shadow-[0_0_15px_rgba(230,57,70,0.8)] scale-125 animate-pulse" : 
          isCompleted ? "bg-success" : "bg-bg3 ring-1 ring-border"
        )} />

        {/* Card */}
        <div className={cn(
          "card-glass p-6 transition-all duration-300 hover:translate-x-1 group-hover:border-white/20",
          "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]",
          isLive ? "before:bg-danger bg-danger/5 border-danger/20" : 
          isCompleted ? "before:bg-success bg-success/5 border-success/10" : 
          "before:bg-border"
        )}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl md:text-2xl text-text tracking-wide uppercase">
                  {item.title}
                </h4>
              </div>
              {(category?.gender || category?.eligible_years) && (
                <div className="font-ui text-[9px] font-bold text-maple uppercase tracking-widest mb-2">
                  {category.gender} {category.eligible_years && `· ${category.eligible_years}`}
                </div>
              )}
              {item.subtitle && (
                <p className="font-sans text-xs text-muted leading-relaxed">
                  {item.subtitle}
                </p>
              )}
            </div>
            
            <div className={cn(
              "badge",
              isLive ? "badge-live" : isCompleted ? "badge-completed" : "badge-upcoming"
            )}>
              {isLive ? "Live Now" : isCompleted ? "Completed" : "Upcoming"}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border">
            {item.venue && (
              <div className="flex items-center gap-2 font-ui text-[10px] text-muted font-bold uppercase tracking-widest">
                <MapPin size={14} className="text-maple" />
                {item.venue}
              </div>
            )}
            {item.house_ids && (
              <div className="flex items-center gap-2">
                {item.house_ids.split(',').map((id) => (
                  <span 
                    key={id}
                    className="badge badge-upcoming border border-border text-[9px]"
                  >
                    {id.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default ScheduleCard;
