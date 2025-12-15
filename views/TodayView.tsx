import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Check, AlertTriangle, Settings, Sparkles, RefreshCcw, PartyPopper, RotateCcw } from 'lucide-react';
import { format, differenceInDays, subDays } from 'date-fns';
import it from 'date-fns/locale/it';
import { getLogs, saveLog, getStartDate, setStartDate, getRoutineSettings, getProducts, getUserName } from '../services/storageService';
import { DailyLog, RoutineSettings, CycleNightConfig, RoutineStep, Product } from '../types';
import { INITIAL_PRODUCTS, NIGHT_COLORS } from '../constants';

interface TodayViewProps {
  onOpenSettings: () => void;
}

// Helper to replace missing parseISO export
const parseISO = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

// --- FIREWORKS COMPONENT ---
const FireworkParticles = () => {
    const particles = Array.from({ length: 50 }).map((_, i) => {
        const angle = Math.random() * 360;
        const dist = 60 + Math.random() * 120;
        const x = Math.cos(angle * Math.PI / 180) * dist;
        const y = Math.sin(angle * Math.PI / 180) * dist;
        const colors = ['#fbbf24', '#f43f5e', '#34d399', '#60a5fa', '#a78bfa'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const delay = Math.random() * 0.3;

        return (
            <div 
                key={i} 
                className="firework-particle"
                style={{
                    '--tx': `${x}px`,
                    '--ty': `${y}px`,
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                    top: '50%',
                    left: '50%'
                } as React.CSSProperties}
            />
        );
    });
    return <div className="absolute inset-0 pointer-events-none overflow-hidden">{particles}</div>;
};

interface StepCardProps {
    step: RoutineStep;
    checked: boolean;
    onClick: () => void;
    imageUrl?: string;
    customColor?: string;
    disabled?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, checked, onClick, imageUrl, customColor, disabled }) => {
    const getStepColor = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('spf')) return '#fde047'; 
        return '#e7e5e4'; 
    };

    const barColor = customColor || getStepColor(step.label);

    return (
        <div 
            onClick={!disabled ? onClick : undefined}
            className={`relative overflow-hidden bg-white rounded-2xl p-3 pr-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-stone-50 flex items-center gap-4 transition-all duration-300 ${!disabled ? 'active:scale-[0.98]' : ''} ${checked ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: barColor }} />

            <div className={`w-6 h-6 rounded-full border-2 flex shrink-0 items-center justify-center transition-all duration-300 ml-2 ${checked ? 'bg-emerald-400 border-emerald-400' : 'border-stone-200 bg-stone-50'}`}>
                {checked && <Check size={14} className="text-white animate-bounce-custom" />}
            </div>

            <div className="w-12 h-12 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                {imageUrl ? (
                    <img src={imageUrl} alt={step.productName} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs text-stone-300 font-serif italic opacity-50">{step.label.charAt(0)}</span>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className={`font-nunito font-bold text-base text-stone-700 truncate ${checked ? 'line-through text-stone-400' : ''}`}>
                    {step.label}
                </h4>
                {step.productName && <p className="text-xs text-stone-400 font-light mt-0.5 tracking-wide truncate">{step.productName}</p>}
            </div>
        </div>
    );
};

const TodayView: React.FC<TodayViewProps> = ({ onOpenSettings }) => {
  const [settings, setSettings] = useState<RoutineSettings | null>(null);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [activeCycleNight, setActiveCycleNight] = useState<CycleNightConfig | null>(null);
  const [currentNightIndex, setCurrentNightIndex] = useState<number>(1);
  const [enabledNights, setEnabledNights] = useState<CycleNightConfig[]>([]);
  const [amChecks, setAmChecks] = useState<Set<string>>(new Set());
  const [pmChecks, setPmChecks] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [userName, setUserName] = useState('Iviolo');
  
  const [celebration, setCelebration] = useState<'AM' | 'PM' | null>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];

  const loadData = useCallback(() => {
    const storedSettings = getRoutineSettings();
    setSettings(storedSettings);
    setProducts(getProducts());
    setUserName(getUserName());
    
    const logs = getLogs();
    const startDate = getStartDate();
    
    const eNights = storedSettings.pmCycle.filter(n => n.isEnabled);
    setEnabledNights(eNights);
    const cLength = eNights.length || 1;

    const daysPassed = differenceInDays(parseISO(todayStr), parseISO(startDate));
    const cycleIndex = ((daysPassed % cLength) + cLength) % cLength;
    const currentConfig = eNights[cycleIndex];
    
    setActiveCycleNight(currentConfig);
    setCurrentNightIndex(cycleIndex + 1);

    if (logs[todayStr]) {
      setTodayLog(logs[todayStr]);
      if (logs[todayStr].amCompleted) {
        setAmChecks(new Set(storedSettings.amRoutine.map(s => s.id)));
      } else {
         // Reset checks if not completed, so you can start over
         setAmChecks(new Set());
      }

      if (logs[todayStr].pmCompleted) {
        setPmChecks(new Set(currentConfig.steps.map(s => s.id)));
      } else {
         setPmChecks(new Set());
      }
    } else {
      setTodayLog({
        date: todayStr,
        amCompleted: false,
        pmCompleted: false,
        notes: '',
        cycleDay: cycleIndex + 1
      });
      setAmChecks(new Set());
      setPmChecks(new Set());
    }
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleCheck = (id: string, type: 'AM' | 'PM') => {
    if (type === 'AM') {
      const newChecks = new Set(amChecks);
      if (newChecks.has(id)) newChecks.delete(id);
      else newChecks.add(id);
      setAmChecks(newChecks);
    } else {
      const newChecks = new Set(pmChecks);
      if (newChecks.has(id)) newChecks.delete(id);
      else newChecks.add(id);
      setPmChecks(newChecks);
    }
  };

  const toggleCompletion = (type: 'AM' | 'PM') => {
      if (!todayLog) return;
      const isComplete = type === 'AM' ? todayLog.amCompleted : todayLog.pmCompleted;
      
      const newLog = { ...todayLog };
      
      if (!isComplete) {
          // Marking as Complete
          if (type === 'AM') newLog.amCompleted = true;
          else newLog.pmCompleted = true;
          newLog.cycleDay = currentNightIndex;
          
          setCelebration(type);
          setTimeout(() => setCelebration(null), 4000);
      } else {
          // Undoing (Reopening)
          if (type === 'AM') newLog.amCompleted = false;
          else newLog.pmCompleted = false;
      }
      
      setTodayLog(newLog);
      saveLog(newLog);
  };

  const handleCycleSwitch = (index: number) => {
    const newStart = subDays(new Date(), index);
    setStartDate(format(newStart, 'yyyy-MM-dd'));
    loadData();
  };

  const getProductImage = (productName: string): string | undefined => {
      if (!productName) return undefined;
      const local = products.find(p => p.name === productName);
      if (local && local.imageUrl) return local.imageUrl;
      const initial = INITIAL_PRODUCTS.find(p => p.name === productName);
      return initial?.imageUrl;
  };

  if (!settings || !activeCycleNight) return <div className="p-10 text-center text-stone-400 font-light">Preparazione Spa...</div>;

  const amSteps = settings.amRoutine;
  const pmSteps = activeCycleNight.steps;

  const isNightTime = new Date().getHours() >= 18;
  const heroIcon = isNightTime ? <Moon strokeWidth={1} size={48} className="text-rose-300" /> : <Sun strokeWidth={1} size={48} className="text-amber-300" />;
  const motivation = isNightTime ? "Serata relax per la tua pelle." : "Pelle coccolata e protetta oggi.";

  const getThemeHex = (theme: string) => {
      switch(theme) {
          case 'orange': return NIGHT_COLORS.night_1;
          case 'pink': return NIGHT_COLORS.night_2;
          default: return NIGHT_COLORS.night_3_4;
      }
  };
  
  const themeHex = getThemeHex(activeCycleNight.colorTheme);

  return (
    <div className="pt-8 pb-32 px-5 max-w-md mx-auto space-y-6">
      <style>{`
        @keyframes bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-custom {
          animation: bounce 0.4s ease-in-out;
        }
        @keyframes firework-explode {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
        }
        .firework-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: firework-explode 0.8s ease-out forwards;
        }
      `}</style>

      {/* Celebration Overlay - Z-INDEX 60 to appear above navbar */}
      {celebration && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden w-full max-w-sm animate-bounce-custom transform">
                <FireworkParticles />
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <PartyPopper className="text-amber-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-nunito font-bold text-stone-800 mb-3">Ottimo Lavoro!</h2>
                    <p className="text-stone-500 font-medium text-lg leading-relaxed">
                        {celebration === 'AM' 
                            ? "Hai iniziato la giornata splendendo! ✨" 
                            : "Routine completata. Sogni d'oro, bellezza. 🌙"}
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
           <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">
             {format(new Date(), 'EEEE d MMMM', { locale: it })}
           </p>
           <h1 className="text-3xl font-nunito font-bold text-stone-800 tracking-tight">
             Ciao, <span className="text-rose-400">{userName}</span>
           </h1>
        </div>
        <button onClick={onOpenSettings} className="p-3 bg-white rounded-full shadow-sm text-stone-400 hover:text-rose-400 transition-colors">
            <Settings strokeWidth={1.5} size={22} />
        </button>
      </div>

      {/* Cycle Switcher */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mask-fade-right">
          {enabledNights.map((night, idx) => {
              const isActive = (idx + 1) === currentNightIndex;
              const color = getThemeHex(night.colorTheme);
              return (
                  <button
                    key={night.id}
                    onClick={() => handleCycleSwitch(idx)}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 whitespace-nowrap
                        ${isActive 
                            ? 'bg-stone-800 text-white border-stone-800 shadow-md shadow-stone-200 scale-[1.02]' 
                            : 'bg-white text-stone-400 border-stone-100 hover:border-stone-200'
                        }
                    `}
                  >
                      <div 
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`} 
                        style={{ backgroundColor: isActive ? color : '#d6d3d1' }}
                      />
                      <div className="flex flex-col items-start leading-none gap-0.5">
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${isActive ? 'text-stone-400' : 'text-stone-300'}`}>Notte {idx + 1}</span>
                          <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-stone-500'}`}>{night.title}</span>
                      </div>
                  </button>
              );
          })}
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(244,63,94,0.06)] border border-rose-50/50 transition-all duration-500">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-rose-300" />
         </div>
         <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-stone-50 rounded-full shadow-inner">
                {heroIcon}
            </div>
            <div>
                <div 
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border"
                    style={{ backgroundColor: `${themeHex}1A`, color: themeHex, borderColor: `${themeHex}33` }}
                >
                    Notte {currentNightIndex} / {enabledNights.length}
                </div>
                <h2 className="text-xl font-nunito font-bold text-stone-700 leading-tight">{motivation}</h2>
                <p className="text-sm text-stone-400 mt-1 font-light">Focus: <span className="font-semibold text-stone-500">{activeCycleNight.description}</span></p>
            </div>
         </div>
      </div>

      {/* AM Section */}
      <section>
          <div className="flex items-center gap-3 mb-4 pl-1">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                 <Sun size={16} className="text-amber-400" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-stone-700">Rituale Mattina</h3>
          </div>
          
          <div className="space-y-3">
             {amSteps.map(step => (
                 <StepCard 
                    key={step.id} 
                    step={step} 
                    checked={amChecks.has(step.id)} 
                    // Allow toggling checks only if NOT complete. To change checks, user must click "Riapri".
                    onClick={() => !todayLog?.amCompleted && toggleCheck(step.id, 'AM')} 
                    imageUrl={getProductImage(step.productName)}
                    disabled={!!todayLog?.amCompleted}
                 />
             ))}
          </div>

          <button 
            onClick={() => toggleCompletion('AM')}
            disabled={!todayLog?.amCompleted && amChecks.size < amSteps.length}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 shadow-lg flex items-center justify-center gap-2 ${
                todayLog?.amCompleted
                ? 'bg-white text-stone-400 border border-stone-200 shadow-sm hover:text-stone-600'
                : amChecks.size === amSteps.length 
                    ? 'bg-stone-800 text-white shadow-stone-200 hover:scale-[1.02]' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
            }`}
          >
            {todayLog?.amCompleted ? (
                <>
                    <RotateCcw size={16} /> RIAPRI MATTINA (Annulla)
                </>
            ) : (
                "CONCLUDI MATTINA"
            )}
          </button>
      </section>

      {/* PM Section */}
      <section>
          <div className="flex items-center gap-3 mb-4 pl-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: `${themeHex}20` }}>
                 <Moon size={16} style={{ color: themeHex }} />
              </div>
              <h3 className="font-nunito font-bold text-lg text-stone-700">Rituale Sera</h3>
          </div>
          
          <div className="space-y-3">
             {pmSteps.map(step => (
                 <StepCard 
                    key={step.id} 
                    step={step} 
                    checked={pmChecks.has(step.id)} 
                    onClick={() => !todayLog?.pmCompleted && toggleCheck(step.id, 'PM')} 
                    imageUrl={getProductImage(step.productName)}
                    customColor={themeHex}
                    disabled={!!todayLog?.pmCompleted}
                 />
             ))}
          </div>

          <button 
            onClick={() => toggleCompletion('PM')}
            disabled={!todayLog?.pmCompleted && pmChecks.size < pmSteps.length}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 shadow-lg flex items-center justify-center gap-2 ${
                todayLog?.pmCompleted
                ? 'bg-white text-stone-400 border border-stone-200 shadow-sm hover:text-stone-600'
                : pmChecks.size === pmSteps.length 
                    ? 'text-white hover:scale-[1.02]' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
            }`}
            style={(!todayLog?.pmCompleted && pmChecks.size === pmSteps.length) ? { backgroundColor: themeHex, boxShadow: `0 10px 30px -10px ${themeHex}80` } : {}}
          >
            {todayLog?.pmCompleted ? (
                <>
                     <RotateCcw size={16} /> RIAPRI SERATA (Annulla)
                </>
            ) : (
                "CONCLUDI GIORNATA"
            )}
          </button>
      </section>

      <div className="h-8"></div>
    </div>
  );
};

export default TodayView;