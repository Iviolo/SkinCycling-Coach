import React, { useState, useEffect } from 'react';
import { endOfMonth, eachDayOfInterval, format, isSameDay, getDay, differenceInDays, isAfter, isBefore, endOfDay, subDays, startOfDay } from 'date-fns';
import it from 'date-fns/locale/it';
import { getLogs, getStartDate, getRoutineSettings } from '../services/storageService';
import { Check, X, Zap, Droplet, Sparkles, Leaf, BarChart2, Flame, Layers } from 'lucide-react';
import { RoutineSettings, DailyLog } from '../types';
import { NIGHT_COLORS } from '../constants';

// Helpers to replace missing/problematic exports
const parseISO = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

const CalendarView: React.FC = () => {
  const [settings, setSettings] = useState<RoutineSettings | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const today = new Date();
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });

  useEffect(() => {
    setSettings(getRoutineSettings());
  }, []);

  const logs = getLogs();
  const startDate = parseISO(getStartDate());
  const startingDayIndex = getDay(startOfMonth(today)) === 0 ? 6 : getDay(startOfMonth(today)) - 1;

  const getCycleInfo = (date: Date) => {
    if (!settings) return null;
    const enabledNights = settings.pmCycle.filter(n => n.isEnabled);
    const len = enabledNights.length || 1;
    const diff = differenceInDays(date, startDate);
    const cycleIndex = ((diff % len) + len) % len;
    return { config: enabledNights[cycleIndex], index: cycleIndex + 1 };
  };

  const getCycleIcon = (nightNum: number) => {
      // 1: Orange, 2: Pink, 3,4: Green
      if (nightNum === 1) return <Droplet size={10} style={{color: NIGHT_COLORS.night_1}} fill="currentColor" fillOpacity={0.2} />; 
      if (nightNum === 2) return <Sparkles size={10} style={{color: NIGHT_COLORS.night_2}} fill="currentColor" fillOpacity={0.2} />; 
      return <Leaf size={10} style={{color: NIGHT_COLORS.night_3_4}} fill="currentColor" fillOpacity={0.2} />; 
  };

  const calculateStats = () => {
    // Basic Counts
    const pastDaysInMonth = daysInMonth.filter(d => isBefore(d, endOfDay(today)));
    const totalDays = pastDaysInMonth.length || 1;
    let amCount = 0;
    let pmCount = 0;
    
    // Streak Calculation
    let currentStreak = 0;
    let streakBroken = false;
    let tempDate = today;
    
    // Check backwards from today for streak
    // Using a loop for max 365 days to be safe
    for(let i = 0; i < 365; i++) {
        const dStr = format(tempDate, 'yyyy-MM-dd');
        const l = logs[dStr];
        // Streak counts if at least one routine (AM or PM) was done? Or strictly PM? 
        // Let's say if PM completed -> strict skincare.
        if (l && l.pmCompleted) {
            currentStreak++;
            tempDate = subDays(tempDate, 1);
        } else if (isSameDay(tempDate, today) && (!l || !l.pmCompleted)) {
            // If today is not done yet, don't break streak immediately, check yesterday
            tempDate = subDays(tempDate, 1);
        } else {
            break;
        }
    }

    // Monthly Totals
    pastDaysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = logs[dateStr];
        if (log) {
            if (log.amCompleted) amCount++;
            if (log.pmCompleted) pmCount++;
        }
    });

    return {
        amPercent: Math.round((amCount / totalDays) * 100),
        pmPercent: Math.round((pmCount / totalDays) * 100),
        streak: currentStreak,
        totalSessions: amCount + pmCount
    };
  };

  const stats = calculateStats();

  // Weekly Graph Data (Last 7 Days)
  const last7Days = Array.from({length: 7}, (_, i) => subDays(today, 6 - i));

  if (!settings) return <div className="p-10 text-center text-stone-300">Caricamento...</div>;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar relative">
       <div className="flex items-center gap-3 mb-6 pl-2">
            <BarChart2 className="text-stone-300" size={24} />
            <h1 className="text-2xl font-nunito font-bold text-stone-800">Analisi</h1>
       </div>

       {/* NEW: Weekly Activity Graph */}
       <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-50 mb-6">
           <h3 className="font-nunito font-bold text-stone-700 mb-6">Ultimi 7 Giorni</h3>
           <div className="flex justify-between items-end h-32 px-2">
               {last7Days.map((day) => {
                   const dateStr = format(day, 'yyyy-MM-dd');
                   const log = logs[dateStr];
                   const isAmDone = log?.amCompleted;
                   const isPmDone = log?.pmCompleted;
                   const dayLabel = format(day, 'EEEE', {locale: it}).charAt(0).toUpperCase();
                   const info = getCycleInfo(day);
                   
                   // Determine color for PM bar based on cycle
                   let pmColor = '#e7e5e4'; // default stone
                   if (isPmDone && info) {
                       if (info.index === 1) pmColor = NIGHT_COLORS.night_1;
                       else if (info.index === 2) pmColor = NIGHT_COLORS.night_2;
                       else pmColor = NIGHT_COLORS.night_3_4;
                   }

                   return (
                       <div key={dateStr} className="flex flex-col items-center gap-2 group">
                           {/* Bars Container */}
                           <div className="flex flex-col gap-1 w-2.5">
                               {/* PM Bar (Top) */}
                               <div 
                                    className={`w-full rounded-full transition-all duration-500 ${isPmDone ? 'h-14 opacity-100' : 'h-1 opacity-20 bg-stone-200'}`} 
                                    style={{ backgroundColor: isPmDone ? pmColor : undefined }}
                               />
                               {/* AM Bar (Bottom) */}
                               <div 
                                    className={`w-full bg-amber-300 rounded-full transition-all duration-500 ${isAmDone ? 'h-10 opacity-100' : 'h-1 opacity-20 bg-stone-200'}`} 
                               />
                           </div>
                           <span className={`text-[10px] font-bold ${isSameDay(day, today) ? 'text-stone-800' : 'text-stone-300'}`}>{dayLabel}</span>
                       </div>
                   )
               })}
           </div>
           <div className="flex items-center justify-center gap-4 mt-6">
               <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-amber-300"></div>
                   <span className="text-[10px] text-stone-400 font-bold uppercase">Mattina</span>
               </div>
               <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-stone-800"></div>
                   <span className="text-[10px] text-stone-400 font-bold uppercase">Sera</span>
               </div>
           </div>
       </div>

       {/* Detailed Stats Grid */}
       <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-stone-50 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-5">
                  <Flame size={60} />
              </div>
              <div className="relative z-10">
                  <span className="text-3xl font-nunito font-bold text-stone-800">{stats.streak}</span>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Giorni Streak</p>
              </div>
          </div>
          
          <div className="bg-white p-5 rounded-3xl border border-stone-50 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 p-4 opacity-5">
                  <Layers size={60} />
              </div>
              <div className="relative z-10">
                  <span className="text-3xl font-nunito font-bold text-stone-800">{stats.totalSessions}</span>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">Routine Totali</p>
              </div>
          </div>
       </div>

       {/* Calendar Card (Monthly View) */}
       <div className="bg-white rounded-[2rem] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-stone-50 mb-8">
         <div className="text-center font-nunito font-bold text-lg capitalize text-stone-700 mb-6">
            {format(today, 'MMMM yyyy', { locale: it })}
         </div>

         <div className="grid grid-cols-7 gap-y-4 mb-2">
            {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-stone-400 font-bold tracking-widest">
                {d}
              </div>
            ))}
         </div>

         <div className="grid grid-cols-7 gap-y-4 gap-x-1">
           {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
           
           {daysInMonth.map((day) => {
             const dateStr = format(day, 'yyyy-MM-dd');
             const isToday = isSameDay(day, today);
             const log = logs[dateStr];
             const info = getCycleInfo(day);
             
             // Bubble Styling with explicit Hex from Constants
             let bubbleBgStyle = { backgroundColor: '#f9fafb' }; // Default stone-50
             let bubbleBorderStyle = { borderColor: 'transparent' };

             if (info?.index === 1) bubbleBgStyle = { backgroundColor: `${NIGHT_COLORS.night_1}1A` }; // 10% opacity
             if (info?.index === 2) bubbleBgStyle = { backgroundColor: `${NIGHT_COLORS.night_2}1A` }; 
             if (info?.index === 3 || info?.index === 4) bubbleBgStyle = { backgroundColor: `${NIGHT_COLORS.night_3_4}1A` }; 

             // Completion Status
             const isDone = log?.pmCompleted;
             if (isDone) {
                 if (info?.index === 1) bubbleBorderStyle = { borderColor: NIGHT_COLORS.night_1 };
                 else if (info?.index === 2) bubbleBorderStyle = { borderColor: NIGHT_COLORS.night_2 };
                 else bubbleBorderStyle = { borderColor: NIGHT_COLORS.night_3_4 };
             }

             return (
               <div key={dateStr} className="flex flex-col items-center gap-1" onClick={() => setSelectedDay(day)}>
                   <div 
                     className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 relative transition-all duration-300 active:scale-90
                        ${isToday ? 'ring-2 ring-stone-800 ring-offset-2' : ''}
                     `}
                     style={{ ...bubbleBgStyle, ...bubbleBorderStyle }}
                   >
                     <span className={`text-xs font-semibold ${isDone ? 'text-stone-800' : 'text-stone-400'}`}>{format(day, 'd')}</span>
                     {/* Mini Icon */}
                     <div className="absolute -bottom-1.5 bg-white rounded-full p-0.5 shadow-sm border border-stone-50">
                        {info && getCycleIcon(info.index)}
                     </div>
                   </div>
               </div>
             );
           })}
         </div>
       </div>

       {/* Bottom Sheet Overlay */}
       {selectedDay && (() => {
           const dateStr = format(selectedDay, 'yyyy-MM-dd');
           const log = logs[dateStr];
           const info = getCycleInfo(selectedDay);
           
           return (
             <>
               <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 transition-opacity" onClick={() => setSelectedDay(null)} />
               <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] p-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-slide-up max-w-md mx-auto">
                   <div className="w-12 h-1 bg-stone-200 rounded-full mx-auto mb-6" />
                   
                   <div className="flex justify-between items-start mb-6">
                       <div>
                           <h3 className="text-2xl font-nunito font-bold text-stone-800 capitalize">
                               {format(selectedDay, 'EEEE d MMMM', { locale: it })}
                           </h3>
                           <div className="flex items-center gap-2 mt-2">
                               {info && getCycleIcon(info.index)}
                               <span className="text-sm text-stone-500 font-medium">Notte {info?.index}: {info?.config.title}</span>
                           </div>
                       </div>
                       <button onClick={() => setSelectedDay(null)} className="p-2 bg-stone-100 rounded-full text-stone-400">
                           <X size={20} />
                       </button>
                   </div>

                   <div className="space-y-4">
                       <div className={`p-4 rounded-2xl border flex items-center justify-between ${log?.amCompleted ? 'bg-amber-50 border-amber-100' : 'bg-stone-50 border-stone-100'}`}>
                           <span className="text-sm font-bold text-stone-600">Routine Mattina (SPF)</span>
                           {log?.amCompleted ? <Check className="text-amber-500" size={20} /> : <span className="text-xs text-stone-400">Non fatta</span>}
                       </div>
                       <div className={`p-4 rounded-2xl border flex items-center justify-between ${log?.pmCompleted ? 'bg-rose-50 border-rose-100' : 'bg-stone-50 border-stone-100'}`}>
                           <span className="text-sm font-bold text-stone-600">Routine Sera</span>
                           {log?.pmCompleted ? <Check className="text-rose-400" size={20} /> : <span className="text-xs text-stone-400">Non fatta</span>}
                       </div>
                   </div>

                   {log?.notes && (
                       <div className="mt-6">
                           <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Note Pelle</h4>
                           <p className="text-sm text-stone-600 italic bg-stone-50 p-3 rounded-xl border border-stone-100">"{log.notes}"</p>
                       </div>
                   )}
               </div>
             </>
           );
       })()}
    </div>
  );
};

export default CalendarView;