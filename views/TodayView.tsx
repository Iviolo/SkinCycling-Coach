import React, { useState, useEffect } from 'react';
import { Sun, Moon, Check, AlertTriangle, Settings, Sparkles } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import it from 'date-fns/locale/it';
import { getLogs, saveLog, getStartDate, getRoutineSettings, getProducts } from '../services/storageService';
import { DailyLog, RoutineSettings, CycleNightConfig, RoutineStep, Product } from '../types';
import { INITIAL_PRODUCTS } from '../constants';

interface TodayViewProps {
  onOpenSettings: () => void;
}

// Helper to replace missing parseISO export
const parseISO = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

interface StepCardProps {
    step: RoutineStep;
    checked: boolean;
    onClick: () => void;
    imageUrl?: string;
    customColorClass?: string;
}

const StepCard: React.FC<StepCardProps> = ({ step, checked, onClick, imageUrl, customColorClass }) => {
    // Default color logic for AM if no custom class is passed
    const getStepColor = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('spf')) return 'bg-amber-200';
        return 'bg-stone-200';
    };

    const barColor = customColorClass || getStepColor(step.label);

    return (
        <div 
            onClick={onClick}
            className={`relative overflow-hidden bg-white rounded-2xl p-3 pr-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-stone-50 flex items-center gap-4 transition-all duration-300 active:scale-[0.98] ${checked ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            {/* Color Strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor}`} />

            <div className={`w-6 h-6 rounded-full border-2 flex shrink-0 items-center justify-center transition-all duration-300 ml-2 ${checked ? 'bg-emerald-400 border-emerald-400' : 'border-stone-200 bg-stone-50'}`}>
                {checked && <Check size={14} className="text-white animate-pop-bounce" />}
            </div>

            {/* Product Image */}
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
  const [cycleLength, setCycleLength] = useState<number>(4);
  const [amChecks, setAmChecks] = useState<Set<string>>(new Set());
  const [pmChecks, setPmChecks] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load data
    const storedSettings = getRoutineSettings();
    setSettings(storedSettings);
    setProducts(getProducts());
    
    const logs = getLogs();
    const startDate = getStartDate();
    
    const enabledNights = storedSettings.pmCycle.filter(n => n.isEnabled);
    const cLength = enabledNights.length || 1;
    setCycleLength(cLength);

    const daysPassed = differenceInDays(parseISO(todayStr), parseISO(startDate));
    const cycleIndex = ((daysPassed % cLength) + cLength) % cLength;
    const currentConfig = enabledNights[cycleIndex];
    
    setActiveCycleNight(currentConfig);
    setCurrentNightIndex(cycleIndex + 1);

    if (logs[todayStr]) {
      setTodayLog(logs[todayStr]);
      if (logs[todayStr].amCompleted) {
        setAmChecks(new Set(storedSettings.amRoutine.map(s => s.id)));
      }
      if (logs[todayStr].pmCompleted) {
        setPmChecks(new Set(currentConfig.steps.map(s => s.id)));
      }
    } else {
      setTodayLog({
        date: todayStr,
        amCompleted: false,
        pmCompleted: false,
        notes: '',
        cycleDay: cycleIndex + 1
      });
    }
  }, [todayStr]);

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

  const completeRoutine = (type: 'AM' | 'PM') => {
    if (!todayLog) return;
    const newLog = { ...todayLog };
    if (type === 'AM') newLog.amCompleted = true;
    else newLog.pmCompleted = true;
    setTodayLog(newLog);
    saveLog(newLog);
  };

  // Helper to find image URL: check local products first, then fallback to initial constant if ID/Name matches
  const getProductImage = (productName: string): string | undefined => {
      if (!productName) return undefined;
      const local = products.find(p => p.name === productName);
      if (local && local.imageUrl) return local.imageUrl;
      
      // Fallback to INITIAL_PRODUCTS for static images if local storage missed them
      const initial = INITIAL_PRODUCTS.find(p => p.name === productName);
      return initial?.imageUrl;
  };

  if (!settings || !activeCycleNight) return <div className="p-10 text-center text-stone-400 font-light">Preparazione Spa...</div>;

  const amSteps = settings.amRoutine;
  const pmSteps = activeCycleNight.steps;

  // Aesthetic Configs
  const isNightTime = new Date().getHours() >= 18;
  const heroIcon = isNightTime ? <Moon strokeWidth={1} size={48} className="text-rose-300" /> : <Sun strokeWidth={1} size={48} className="text-amber-300" />;
  const motivation = isNightTime ? "Serata relax per la tua pelle." : "Pelle coccolata e protetta oggi.";

  // Specific Colors Hex
  const colors = {
      orange: '#f4a460',
      pink: '#e084d9',
      green: '#7db8a8'
  };

  // Cycle Night Colors
  const getThemeHex = (theme: string) => {
      switch(theme) {
          case 'orange': return colors.orange;
          case 'pink': return colors.pink;
          default: return colors.green;
      }
  };
  
  const themeHex = getThemeHex(activeCycleNight.colorTheme);
  
  // Tailwind arbitrary values for Badge
  const getBadgeClass = (theme: string) => {
     switch(theme) {
         case 'orange': return 'bg-[#f4a460]/10 text-[#f4a460] border-[#f4a460]/20';
         case 'pink': return 'bg-[#e084d9]/10 text-[#e084d9] border-[#e084d9]/20';
         case 'green': return 'bg-[#7db8a8]/10 text-[#7db8a8] border-[#7db8a8]/20';
         default: return 'bg-stone-100 text-stone-600 border-stone-200';
     }
  };
  const badgeClass = getBadgeClass(activeCycleNight.colorTheme);

  // Side bar color for PM steps
  const pmStepBarClass = `bg-[${themeHex}]`;

  return (
    <div className="pt-8 pb-32 px-5 max-w-md mx-auto space-y-8">
      {/* Inject Keyframes */}
      <style>{`
        @keyframes pop-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-pop-bounce {
          animation: pop-bounce 0.4s ease-in-out;
        }
      `}</style>

      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div>
           <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-1">
             {format(new Date(), 'EEEE d MMMM', { locale: it })}
           </p>
           <h1 className="text-3xl font-nunito font-bold text-stone-800 tracking-tight">
             Ciao, <span className="text-rose-400">Beauty</span>
           </h1>
        </div>
        <button onClick={onOpenSettings} className="p-3 bg-white rounded-full shadow-sm text-stone-400 hover:text-rose-400 transition-colors">
            <Settings strokeWidth={1.5} size={22} />
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(244,63,94,0.06)] border border-rose-50/50">
         <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles size={120} className="text-rose-300" />
         </div>
         
         <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-stone-50 rounded-full shadow-inner">
                {heroIcon}
            </div>
            <div>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border ${badgeClass}`}>
                    Notte {currentNightIndex} / {cycleLength}
                </span>
                <h2 className="text-xl font-nunito font-bold text-stone-700 leading-tight">
                    {motivation}
                </h2>
                <p className="text-sm text-stone-400 mt-1 font-light">
                    Focus: {activeCycleNight.title}
                </p>
            </div>
         </div>
      </div>

      {/* Warning if needed */}
      {(activeCycleNight.title.includes('Esfolia') || activeCycleNight.title.includes('Retin')) && (
        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border-l-4 border-amber-300 shadow-sm">
           <AlertTriangle className="text-amber-300 w-5 h-5 shrink-0" strokeWidth={1.5} />
           <p className="text-xs text-stone-500 font-medium leading-relaxed">
             Stasera usi attivi potenti. Domani mattina l'<strong>SPF</strong> è il tuo migliore amico.
           </p>
        </div>
      )}

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
                    onClick={() => !todayLog?.amCompleted && toggleCheck(step.id, 'AM')} 
                    imageUrl={getProductImage(step.productName)}
                 />
             ))}
          </div>

          {!todayLog?.amCompleted && (
              <button 
                onClick={() => completeRoutine('AM')}
                disabled={amChecks.size < amSteps.length}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 shadow-lg ${
                    amChecks.size === amSteps.length 
                    ? 'bg-stone-800 text-white shadow-stone-200 hover:scale-[1.02]' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
                }`}
              >
                CONCLUDI MATTINA
              </button>
          )}
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
                    customColorClass={pmStepBarClass}
                 />
             ))}
          </div>

           {!todayLog?.pmCompleted && (
              <button 
                onClick={() => completeRoutine('PM')}
                disabled={pmChecks.size < pmSteps.length}
                className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-500 shadow-lg ${
                    pmChecks.size === pmSteps.length 
                    ? 'text-white hover:scale-[1.02]' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed shadow-none'
                }`}
                style={pmChecks.size === pmSteps.length ? { backgroundColor: themeHex, boxShadow: `0 10px 30px -10px ${themeHex}80` } : {}}
              >
                CONCLUDI GIORNATA
              </button>
          )}
      </section>

      {/* Footer Space */}
      <div className="h-8"></div>
    </div>
  );
};

export default TodayView;