import React, { useState, useEffect } from 'react';
import { endOfMonth, eachDayOfInterval, format, isSameDay, getDay, differenceInDays, isAfter, isBefore, endOfDay, subDays, startOfDay } from 'date-fns';
import it from 'date-fns/locale/it';
import { getLogs, getStartDate, getRoutineSettings } from '../services/storageService';
import { Check, X, Zap, Droplet, Sparkles, Leaf, BarChart2, Flame, Layers, Info } from 'lucide-react';
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

  // Nuove Icone e logica per renderlo "Bello e Comprensibile"
  const getCycleIcon = (nightNum: number, size: number = 14) => {
      // Night 1 (Exfo): Sparkles (Pulizia/Luminosità)
      if (nightNum === 1) return <Sparkles size={size} className="text-orange-600" fill="currentColor" fillOpacity={0.2} />; 
      // Night 2 (Retinoid): Zap (Potenza/Attivo)
      if (nightNum === 2) return <Zap size={size} className="text-fuchsia-600" fill="currentColor" fillOpacity={0.2} />; 
      // Night 3/4 (Recovery): Leaf (Natura/Guarigione)
      return <Leaf size={size} className="text-emerald-600" fill="currentColor" fillOpacity={0.2} />; 
  };

  const calculateStats = () => {
    const pastDaysInMonth = daysInMonth.filter(d => isBefore(d, endOfDay(today)));
    const totalDays = pastDaysInMonth.length || 1;
    let amCount = 0;
    let pmCount = 0;
    
    let currentStreak = 0;
    let tempDate = today;
    
    for(let i = 0; i < 365; i++) {
        const dStr = format(tempDate, 'yyyy-MM-dd');
        const l = logs[dStr];
        if (l && l.pmCompleted) {
            currentStreak++;
            tempDate = subDays(tempDate, 1);
        } else if (isSameDay(tempDate, today) && (!l || !l.pmCompleted)) {
            tempDate = subDays(tempDate, 1);
        } else {
            break;
        }
    }

    pastDaysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = logs[dateStr];
        if (log) {
            if (log.amCompleted) amCount++;
            if (log.pmCompleted) pmCount++;
        }
    });

    return {
        streak: currentStreak,
        totalSessions: amCount + pmCount
    };
  };

  const stats = calculateStats();
  const last7Days = Array.from({length: 7}, (_, i) => subDays(today, 6 - i));

  if (!settings) return <div className="p-10 text-center text-stone-300">Caricamento...</div>;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar relative">
       <div className="flex items-center gap-3 mb-6 pl-2 drop-shadow-sm">
            <BarChart2 className="text-stone-700" size={24} />
            <h1 className="text-2xl font-nunito font-bold text-stone-900">Analisi & Ciclo</h1>
       </div>

       {/* Weekly Graph - Compact Version */}
       <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-5 shadow-lg border border-white/60 mb-6">
           <div className="flex justify-between items-end h-24 px-1">
               {last7Days.map((day) => {
                   const dateStr = format(day, 'yyyy-MM-dd');
                   const log = logs[dateStr];
                   const isAmDone = log?.amCompleted;
                   const isPmDone = log?.pmCompleted;
                   const dayLabel = format(day, 'EEEE', {locale: it}).charAt(0).toUpperCase();
                   const info = getCycleInfo(day);
                   
                   let pmColor = '#e7e5e4';
                   if (isPmDone && info) {
                       if (info.index === 1) pmColor = NIGHT_COLORS.night_1;
                       else if (info.index === 2) pmColor = NIGHT_COLORS.night_2;
                       else pmColor = NIGHT_COLORS.night_3_4;
                   }

                   return (
                       <div key={dateStr} className="flex flex-col items-center gap-2">
                           <div className="flex flex-col gap-1 w-2">
                               <div className={`w-full rounded-full transition-all duration-500 ${isPmDone ? 'h-10 opacity-100' : 'h-1 opacity-20 bg-stone-300'}`} style={{ backgroundColor: isPmDone ? pmColor : undefined }} />
                               <div className={`w-full bg-amber-300 rounded-full transition-all duration-500 ${isAmDone ? 'h-6 opacity-100' : 'h-1 opacity-20 bg-stone-300'}`} />
                           </div>
                           <span className={`text-[9px] font-bold ${isSameDay(day, today) ? 'text-stone-900' : 'text-stone-400'}`}>{dayLabel}</span>
                       </div>
                   )
               })}
           </div>
       </div>

       {/* Stats Cards */}
       <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-3xl border border-orange-100 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
              <Flame size={40} className="text-orange-200 absolute -right-2 -top-2" />
              <span className="text-3xl font-nunito font-extrabold text-orange-600 relative z-10">{stats.streak}</span>
              <p className="text-[10px] uppercase tracking-widest text-orange-800/60 font-bold mt-1 relative z-10">Streak Giorni</p>
          </div>
          <div className="bg-gradient-to-br from-stone-50 to-gray-50 p-4 rounded-3xl border border-stone-100 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
              <Layers size={40} className="text-stone-200 absolute -right-2 -top-2" />
              <span className="text-3xl font-nunito font-extrabold text-stone-600 relative z-10">{stats.totalSessions}</span>
              <p className="text-[10px] uppercase tracking-widest text-stone-500/60 font-bold mt-1 relative z-10">Sessioni Tot</p>
          </div>
       </div>

       {/* CALENDAR LEGEND */}
       <div className="flex justify-center gap-4 mb-4 px-2">
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg border border-white/60">
                <Sparkles size={10} className="text-orange-500" />
                <span className="text-[10px] font-bold text-stone-600">Esfo</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg border border-white/60">
                <Zap size={10} className="text-fuchsia-500" />
                <span className="text-[10px] font-bold text-stone-600">Retin</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 px-2 py-1 rounded-lg border border-white/60">
                <Leaf size={10} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-stone-600">Recup</span>
            </div>
       </div>

       {/* Calendar Grid */}
       <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-5 shadow-2xl border border-white/80 mb-8">
         <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="font-nunito font-bold text-xl capitalize text-stone-800">
                {format(today, 'MMMM yyyy', { locale: it })}
            </h2>
            <div className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">{format(today, 'yyyy')}</div>
         </div>

         <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-stone-400 font-extrabold">
                {d}
              </div>
            ))}
         </div>

         <div className="grid grid-cols-7 gap-1.5">
           {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
           
           {daysInMonth.map((day) => {
             const dateStr = format(day, 'yyyy-MM-dd');
             const isToday = isSameDay(day, today);
             const log = logs[dateStr];
             const info = getCycleInfo(day);
             const isDone = log?.pmCompleted;
             
             // Dynamic Styles based on Cycle Type
             let cellClass = "bg-stone-50 text-stone-400 border-stone-100"; // default
             let icon = null;

             if (info) {
                 icon = getCycleIcon(info.index, 12);
                 if (info.index === 1) { // Esfo
                     cellClass = isDone 
                        ? "bg-orange-400 text-white border-orange-500 shadow-md shadow-orange-200" 
                        : "bg-orange-50 text-orange-800 border-orange-100";
                     if (isDone) icon = <Sparkles size={12} className="text-white" />;
                 } else if (info.index === 2) { // Retin
                     cellClass = isDone 
                        ? "bg-fuchsia-400 text-white border-fuchsia-500 shadow-md shadow-fuchsia-200" 
                        : "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100";
                     if (isDone) icon = <Zap size={12} className="text-white" />;
                 } else { // Recup
                     cellClass = isDone 
                        ? "bg-emerald-400 text-white border-emerald-500 shadow-md shadow-emerald-200" 
                        : "bg-emerald-50 text-emerald-800 border-emerald-100";
                     if (isDone) icon = <Leaf size={12} className="text-white" />;
                 }
             }

             return (
               <div key={dateStr} className="aspect-square">
                   <button 
                     onClick={() => setSelectedDay(day)}
                     className={`
                        w-full h-full rounded-2xl flex flex-col items-center justify-center border relative transition-all duration-300
                        ${cellClass}
                        ${isToday ? 'ring-2 ring-stone-800 ring-offset-2' : ''}
                        active:scale-95
                     `}
                   >
                     <span className={`text-xs font-bold mb-0.5`}>{format(day, 'd')}</span>
                     {/* The Icon */}
                     <div className="opacity-90">
                        {icon}
                     </div>
                   </button>
               </div>
             );
           })}
         </div>
       </div>

       {/* Bottom Sheet Details */}
       {selectedDay && (() => {
           const dateStr = format(selectedDay, 'yyyy-MM-dd');
           const log = logs[dateStr];
           const info = getCycleInfo(selectedDay);
           
           return (
             <>
               <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50 transition-opacity animate-fade-in" onClick={() => setSelectedDay(null)} />
               <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] p-8 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-slide-up max-w-md mx-auto border-t border-white/60">
                   <div className="w-12 h-1 bg-stone-400 rounded-full mx-auto mb-6" />
                   
                   <div className="flex justify-between items-start mb-6">
                       <div>
                           <h3 className="text-2xl font-nunito font-bold text-stone-900 capitalize">
                               {format(selectedDay, 'EEEE d MMMM', { locale: it })}
                           </h3>
                           <div className="flex items-center gap-2 mt-2">
                               {info && getCycleIcon(info.index, 16)}
                               <span className="text-sm text-stone-700 font-medium">Notte {info?.index}: <span className="font-bold">{info?.config.title}</span></span>
                           </div>
                       </div>
                       <button onClick={() => setSelectedDay(null)} className="p-2 bg-stone-200/50 rounded-full text-stone-600 hover:bg-stone-300/50">
                           <X size={20} />
                       </button>
                   </div>

                   <div className="space-y-4">
                       <div className={`p-4 rounded-2xl border flex items-center justify-between ${log?.amCompleted ? 'bg-amber-100/60 border-amber-200/60' : 'bg-white/60 border-white/60'}`}>
                           <span className="text-sm font-bold text-stone-700">Routine Mattina (SPF)</span>
                           {log?.amCompleted ? <Check className="text-amber-500" size={20} /> : <span className="text-xs text-stone-500">Non fatta</span>}
                       </div>
                       <div className={`p-4 rounded-2xl border flex items-center justify-between ${log?.pmCompleted ? 'bg-rose-100/60 border-rose-200/60' : 'bg-white/60 border-white/60'}`}>
                           <span className="text-sm font-bold text-stone-700">Routine Sera</span>
                           {log?.pmCompleted ? <Check className="text-rose-400" size={20} /> : <span className="text-xs text-stone-500">Non fatta</span>}
                       </div>
                   </div>

                   {log?.notes && (
                       <div className="mt-6">
                           <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Note Pelle</h4>
                           <p className="text-sm text-stone-700 italic bg-white/60 p-3 rounded-xl border border-white/60">"{log.notes}"</p>
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