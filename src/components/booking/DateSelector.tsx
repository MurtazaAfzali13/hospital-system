"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

type DateSelectorProps = {
  availableDates: Date[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isRTL: boolean;
  t: (key: string) => string;
};

export default function DateSelector({
  availableDates,
  selectedDate,
  onDateSelect,
  isRTL,
  t
}: DateSelectorProps) {
  
  const getDateLabel = (date: Date, index: number): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('booking.today') || "امروز";
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return t('booking.tomorrow') || "فردا";
    }
    
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (isRTL) {
      return `+${diffDays} روز`;
    } else {
      return `+${diffDays} days`;
    }
  };

  const getDayName = (date: Date): string => {
    if (isRTL) {
      return date.toLocaleDateString('fa-IR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const getMonthName = (date: Date): string => {
    if (isRTL) {
      return date.toLocaleDateString('fa-IR', { month: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-cyan-400" />
        {t('booking.selectDate') || "انتخاب تاریخ"}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {availableDates.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          const isPast = date < new Date() && !isToday;
          
          return (
            <motion.button
              key={index}
              whileHover={{ scale: isPast ? 1 : 1.05 }}
              whileTap={{ scale: isPast ? 1 : 0.95 }}
              onClick={() => !isPast && onDateSelect(date)}
              disabled={isPast}
              className={`
                flex flex-col items-center justify-center min-w-[90px] p-3 rounded-xl
                backdrop-blur-sm transition-all duration-300
                ${isPast 
                  ? 'bg-slate-800/30 text-slate-500 cursor-not-allowed opacity-60'
                  : isSelected 
                  ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-700/70'
                }
              `}
            >
              <span className="text-sm font-medium">
                {getDateLabel(date, index)}
              </span>
              <span className="text-lg font-bold mt-1">
                {date.getDate()}
              </span>
              <span className="text-xs opacity-80 mt-1">
                {getDayName(date)}
              </span>
              {isToday && !isSelected && (
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse"></div>
              )}
              {isSelected && (
                <div className="w-2 h-2 bg-white rounded-full mt-2"></div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}