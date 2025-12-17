import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Check, AlertTriangle, Settings, Sparkles, RefreshCcw, PartyPopper, RotateCcw, Pencil, Flame, X, ChevronDown, Stethoscope, Thermometer, ShieldAlert, HeartPulse } from 'lucide-react';
import { format, differenceInDays, subDays, isSameDay } from 'date-fns';
import it from 'date-fns/locale/it';
import { getLogs, saveLog, getStartDate, setStartDate, getRoutineSettings, getProducts, getUserName, saveRoutineSettings } from '../services/storageService';
import { DailyLog, RoutineSettings, CycleNightConfig, RoutineStep, Product, SkinCondition } from '../types';
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
    onEdit: () => void;
    imageUrl?: string;
    customColor?: string;
    disabled?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, checked, onClick, onEdit, imageUrl, customColor, disabled }) => {
    const getStepColor = (label: string) => {
        const l = label.toLowerCase();
        if (l.includes('spf')) return '#fde047'; 
        return '#e7e5e4'; 
    };

    const barColor = customColor || getStepColor(step.label);

    return (
        <div 
            className={`relative overflow-hidden group bg-white/90 backdrop-blur-md rounded-2xl p-3 pr-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-white/60 flex items-center gap-4 transition-all duration-300 ${!disabled ? 'hover:bg-white' : ''} ${checked ? 'opacity-70' : ''}`}
        >
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: barColor }} />

            <div 
                onClick={!disabled ? onClick : undefined}
                className={`w-6 h-6 rounded-full border-2 flex shrink-0 items-center justify-center transition-all duration-300 ml-2 cursor-pointer ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-stone-300 bg-white hover:border-stone-400'}`}
            >
                {checked && <Check size={14} className="text-white animate-bounce-custom" />}
            </div>

            <div className="w-12 h-12 rounded-lg bg-white border border-stone-100 flex items-center justify-center overflow-hidden shrink-0">
                {imageUrl ? (
                    <img src={imageUrl} alt={step.productName} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-xs text-stone-600 font-serif italic opacity-70">{step.label.charAt(0)}</span>
                )}
            </div>

            <div className="flex-1 min-w-0 flex justify-between items-center">
                <div onClick={!disabled ? onClick : undefined} className="cursor-pointer truncate pr-2">
                    <h4 className={`font-nunito font-bold text-base text-stone-900 drop-shadow-sm truncate ${checked ? 'line-through text-stone-400' : ''}`}>
                        {step.label}
                    </h4>
                    {step.productName && <p className="text-xs text-stone-600 font-medium mt-0.5 tracking-wide truncate">{step.productName}</p>}
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-2 text-stone-300 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                >
                    <Pencil size={14} />
                </button>
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
  const [streak, setStreak] = useState(0);
  
  // Smart Coach State
  const [isRescueMode, setIsRescueMode] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<{ type: 'AM' | 'PM', stepId: string, currentProduct: string } | null>(null);
  
  const [celebration, setCelebration] = useState<'AM' | 'PM' | null>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];

  const calculateStreak = (logs: Record<string, DailyLog>) => {
      let currentStreak = 0;
      let tempDate = new Date();
      if (!logs[format(tempDate, 'yyyy-MM-dd')]?.pmCompleted) {
          tempDate = subDays(tempDate, 1);
      }
      for(let i = 0; i < 365; i++) {
          const dStr = format(tempDate, 'yyyy-MM-dd');
          const l = logs[dStr];
          if (l && l.pmCompleted) {
              currentStreak++;
              tempDate = subDays(tempDate, 1);
          } else {
              break;
          }
      }
      setStreak(currentStreak);
  };

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

    calculateStreak(logs);

    if (logs[todayStr]) {
      setTodayLog(logs[todayStr]);
      if (logs[todayStr].amCompleted) {
        setAmChecks(new Set(storedSettings.amRoutine.map(s => s.id)));
      } else {
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
        cycleDay: cycleIndex + 1,
        skinCondition: 'Normale'
      });
      setAmChecks(new Set());
      setPmChecks(new Set());
    }
    
    setIsRescueMode(false);
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
          if (type === 'AM') newLog.amCompleted = true;
          else newLog.pmCompleted = true;
          newLog.cycleDay = currentNightIndex;
          setCelebration(type);
          setTimeout(() => setCelebration(null), 4000);
      } else {
          if (type === 'AM') newLog.amCompleted = false;
          else newLog.pmCompleted = false;
      }
      
      setTodayLog(newLog);
      saveLog(newLog);
      if (type === 'PM') {
        const logs = getLogs();
        logs[todayStr] = newLog;
        calculateStreak(logs);
      }
  };

  const handleSkinConditionChange = (condition: SkinCondition) => {
      if (!todayLog) return;
      const newLog = { ...todayLog, skinCondition: condition };
      setTodayLog(newLog);
      saveLog(newLog);
  };

  const handleCycleSwitch = (index: number) => {
    const newStart = subDays(new Date(), index);
    setStartDate(format(newStart, 'yyyy-MM-dd'));
    loadData();
  };

  const openEditModal = (type: 'AM' | 'PM', step: RoutineStep) => {
      setEditingStep({
          type,
          stepId: step.id,
          currentProduct: step.productName
      });
      setIsEditModalOpen(true);
  };

  const saveProductChange = (newProductName: string) => {
      if (!settings || !editingStep || !activeCycleNight) return;
      const newSettings = { ...settings };
      if (editingStep.type === 'AM') {
          const stepIndex = newSettings.amRoutine.findIndex(s => s.id === editingStep.stepId);
          if (stepIndex !== -1) {
              newSettings.amRoutine[stepIndex] = { ...newSettings.amRoutine[stepIndex], productName: newProductName };
          }
      } else {
          const nightIndex = newSettings.pmCycle.findIndex(n => n.id === activeCycleNight.id);
          if (nightIndex !== -1) {
              const stepIndex = newSettings.pmCycle[nightIndex].steps.findIndex(s => s.id === editingStep.stepId);
              if (stepIndex !== -1) {
                  const newSteps = [...newSettings.pmCycle[nightIndex].steps];
                  newSteps[stepIndex] = { ...newSteps[stepIndex], productName: newProductName };
                  newSettings.pmCycle[nightIndex] = { ...newSettings.pmCycle[nightIndex], steps: newSteps };
              }
          }
      }
      saveRoutineSettings(newSettings);
      setSettings(newSettings);
      loadData();
      setIsEditModalOpen(false);
      setEditingStep(null);
  };

  const getProductImage = (productName: string): string | undefined => {
      if (!productName) return undefined;
      const local = products.find(p => p.name === productName);
      if (local && local.imageUrl) return local.imageUrl;
      const initial = INITIAL_PRODUCTS.find(p => p.name === productName);
      return initial?.imageUrl;
  };

  // SMART COACH LOGIC - UPDATED TO BE ALWAYS VISIBLE FOR TESTING
  const isSkinStressed = todayLog?.skinCondition === 'Irritata' || todayLog?.skinCondition === 'Secca' || todayLog?.skinCondition === 'Breakout';
  const isActiveNight = activeCycleNight?.dayNumber === 1 || activeCycleNight?.dayNumber === 2;
  
  const getDisplayPmSteps = () => {
      if (isRescueMode) {
          return [
              { id: 'rescue_1', label: 'Detersione Delicata', productName: 'Hydro Boost Aqua Reinigungsgel' },
              { id: 'rescue_2', label: 'Idratazione Extra', productName: 'Pro-Collagen Peptide Plumping Moisturizer' },
          ];
      }
      return activeCycleNight?.steps || [];
  };

  if (!settings || !activeCycleNight) return <div className="p-10 text-center text-stone-400 font-light">Preparazione Spa...</div>;

  const amSteps = settings.amRoutine;
  const pmSteps = getDisplayPmSteps();

  const isNightTime = new Date().getHours() >= 18;
  const heroIcon = isNightTime ? <Moon strokeWidth={1} size={42} className="text-rose-400" /> : <Sun strokeWidth={1} size={42} className="text-amber-400" />;
  const themeHex = isRescueMode ? '#10b981' : (activeCycleNight.colorTheme === 'orange' ? NIGHT_COLORS.night_1 : activeCycleNight.colorTheme === 'pink' ? NIGHT_COLORS.night_2 : NIGHT_COLORS.night_3_4);

  return (
    <div className="pt-8 pb-32 px-5 max-w-md mx-auto space-y-8">
      <style>{`
        @keyframes bounce { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .animate-bounce-custom { animation: bounce 0.4s ease-in-out; }
        @keyframes firework-explode { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 50% { opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; } }
        .firework-particle { position: absolute; width: 8px; height: 8px; border-radius: 50%; animation: firework-explode 0.8s ease-out forwards; }
      `}</style>

      {/* Celebration Overlay */}
      {celebration && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden w-full max-w-sm animate-bounce-custom transform border border-white/60">
                <FireworkParticles />
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <PartyPopper className="text-amber-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-nunito font-bold text-stone-800 mb-3">Ottimo Lavoro!</h2>
                    <p className="text-stone-500 font-medium text-lg leading-relaxed">
                        {celebration === 'AM' ? "Hai iniziato la giornata splendendo! ✨" : "Routine completata. Sogni d'oro. 🌙"}
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Header & Badges */}
      <div className="flex justify-between items-start">
        <div className="drop-shadow-sm">
           <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-1 shadow-black/10">
             {format(new Date(), 'EEEE d MMMM', { locale: it })}
           </p>
           <h1 className="text-3xl font-nunito font-bold text-stone-900 tracking-tight drop-shadow-sm">
             Ciao, <span className="text-rose-600">{userName}</span>
           </h1>
           {streak > 2 && (
             <div className="inline-flex items-center gap-1 mt-1 bg-gradient-to-r from-amber-100 to-orange-100 px-2 py-0.5 rounded-full border border-orange-200/50">
                <Flame size={12} className="text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-orange-700">{streak} Giorni di fila</span>
             </div>
           )}
        </div>
        <button onClick={onOpenSettings} className="p-3 bg-white/70 backdrop-blur-md rounded-full shadow-sm text-stone-800 hover:text-rose-600 transition-colors border border-white/60 hover:bg-white/90">
            <Settings strokeWidth={1.5} size={22} />
        </button>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/80 transition-all duration-500">
         <div className="w-full h-2.5 absolute top-0 left-0" style={{ backgroundColor: themeHex }} />
         <div className="p-7 pt-9">
            <div className="flex items-start justify-between">
                <div>
                    <div 
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 border backdrop-blur-sm bg-white/50"
                        style={{ color: themeHex, borderColor: `${themeHex}30` }}
                    >
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeHex }}></span>
                       {isRescueMode ? 'MODALITÀ SOS' : `Notte ${currentNightIndex} di ${enabledNights.length}`}
                    </div>
                    <h2 className="text-4xl font-nunito font-extrabold text-stone-900 leading-[0.9] tracking-tight mb-2 drop-shadow-sm">
                        {isRescueMode ? 'Recupero SOS' : activeCycleNight.title}
                    </h2>
                    <p className="text-sm text-stone-500 font-medium max-w-[200px] leading-snug">
                        {isRescueMode ? 'Idratazione e protezione barriera.' : activeCycleNight.description}
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-stone-100 rounded-full blur-xl opacity-50"></div>
                    <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-stone-100/50">
                        {heroIcon}
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Skin Condition Selector - More Compact & Visible */}
      <div className="space-y-2">
          <div className="ml-1 mb-1">
             <span className="text-xs font-extrabold text-blue-900 bg-white/60 px-2 py-1 rounded-md backdrop-blur-md border border-white/40 uppercase tracking-wider shadow-sm">
                 Come senti la pelle oggi?
             </span>
          </div>
          <div className="overflow-x-auto no-scrollbar pb-1 px-1">
              <div className="flex gap-1.5">
                  {(['Normale', 'Secca', 'Sensibile', 'Irritata', 'Breakout'] as SkinCondition[]).map((cond) => {
                      const isSelected = todayLog?.skinCondition === cond;
                      return (
                          <button
                            key={cond}
                            onClick={() => handleSkinConditionChange(cond)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border shadow-sm whitespace-nowrap ${
                                isSelected 
                                ? 'bg-stone-800 text-white border-stone-800 scale-105' 
                                : 'bg-white/80 text-stone-600 border-white/50 hover:bg-white'
                            }`}
                          >
                              {cond}
                          </button>
                      );
                  })}
              </div>
          </div>
      </div>

      {/* Smart Coach Alert - ALWAYS VISIBLE if relevant, even on rest nights */}
      {todayLog?.skinCondition && !todayLog?.pmCompleted && (
          <div className={`p-4 rounded-[1.5rem] border transition-all duration-500 relative overflow-hidden animate-fade-in ${isSkinStressed || isRescueMode ? (isRescueMode ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100') : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex items-start gap-4 relative z-10">
                  <div className={`p-2.5 rounded-full shrink-0 ${isRescueMode ? 'bg-emerald-100 text-emerald-600' : (isSkinStressed ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500')}`}>
                      {isRescueMode ? <Stethoscope size={20} /> : (isSkinStressed ? <ShieldAlert size={20} /> : <HeartPulse size={20} />)}
                  </div>
                  <div>
                      <h4 className={`font-bold text-sm mb-1 ${isRescueMode ? 'text-emerald-800' : (isSkinStressed ? 'text-rose-800' : 'text-blue-800')}`}>
                          {isRescueMode 
                            ? 'Modalità SOS Attiva' 
                            : (isSkinStressed ? 'Coach Alert: Pelle Stressata' : 'Pelle in Equilibrio')}
                      </h4>
                      <p className={`text-xs leading-relaxed mb-3 ${isRescueMode ? 'text-emerald-700' : (isSkinStressed ? 'text-rose-700' : 'text-blue-700')}`}>
                          {isRescueMode 
                            ? 'Ottima scelta. Focus totale sulla riparazione.' 
                            : (isSkinStressed 
                                ? (isActiveNight ? 'Attenzione: Stasera avresti attivi forti. Meglio saltare?' : 'Hai fatto bene a scegliere una notte di riposo.')
                                : 'Tutto procede bene. Continua così!')}
                      </p>
                      
                      {/* Show Rescue Button IF irritated AND not already in rescue AND it's an active night */}
                      {isSkinStressed && !isRescueMode && isActiveNight && (
                          <button 
                            onClick={() => setIsRescueMode(true)}
                            className="bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-rose-200 active:scale-95 transition-transform"
                          >
                              ATTIVA MODALITÀ SOS
                          </button>
                      )}
                      {isRescueMode && (
                          <button onClick={() => setIsRescueMode(false)} className="text-[10px] font-bold text-emerald-600 underline">
                              Torna alla routine normale
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Cycle Switcher */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mask-fade-right">
          {enabledNights.map((night, idx) => {
              const isActive = (idx + 1) === currentNightIndex;
              const color = isActive && isRescueMode ? '#10b981' : (night.colorTheme === 'orange' ? NIGHT_COLORS.night_1 : night.colorTheme === 'pink' ? NIGHT_COLORS.night_2 : NIGHT_COLORS.night_3_4);
              return (
                  <button
                    key={night.id}
                    onClick={() => handleCycleSwitch(idx)}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 whitespace-nowrap backdrop-blur-md
                        ${isActive 
                            ? 'bg-stone-800 text-white border-stone-800 shadow-md scale-[1.02]' 
                            : 'bg-white/70 text-stone-700 border-white/60 hover:bg-white/90'
                        }
                    `}
                  >
                      <div 
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`} 
                        style={{ backgroundColor: isActive ? color : '#a8a29e' }}
                      />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-stone-600'}`}>Notte {idx + 1}</span>
                  </button>
              );
          })}
      </div>

      {/* AM Section */}
      <section>
          <div className="flex items-center gap-3 mb-4 pl-1">
              <div className="w-8 h-8 rounded-full bg-amber-100/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                 <Sun size={16} className="text-amber-600" />
              </div>
              <h3 className="font-nunito font-bold text-lg text-stone-900 drop-shadow-sm">Rituale Mattina</h3>
          </div>
          <div className="space-y-3">
             {amSteps.map(step => (
                 <StepCard 
                    key={step.id} 
                    step={step} 
                    checked={amChecks.has(step.id)} 
                    onClick={() => !todayLog?.amCompleted && toggleCheck(step.id, 'AM')} 
                    onEdit={() => openEditModal('AM', step)}
                    imageUrl={getProductImage(step.productName)}
                    disabled={!!todayLog?.amCompleted}
                 />
             ))}
          </div>
          <button 
            onClick={() => toggleCompletion('AM')}
            disabled={!todayLog?.amCompleted && amChecks.size < amSteps.length}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-3 border-b-4 active:border-b-0 active:translate-y-1 ${
                todayLog?.amCompleted
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200'
                : amChecks.size === amSteps.length 
                    ? 'bg-stone-800 text-white border-stone-900 shadow-stone-300 hover:bg-stone-900' 
                    : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none'
            }`}
          >
            {todayLog?.amCompleted ? <><div className="bg-white/20 p-1 rounded-full"><Check size={16} strokeWidth={3} /></div> MATTINA COMPLETATA</> : "CONCLUDI MATTINA"}
          </button>
      </section>

      {/* PM Section */}
      <section>
          <div className="flex items-center gap-3 mb-4 pl-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm`} style={{ backgroundColor: `${themeHex}40` }}>
                 <Moon size={16} style={{ color: themeHex }} />
              </div>
              <h3 className="font-nunito font-bold text-lg text-stone-900 drop-shadow-sm">Rituale Sera</h3>
          </div>
          
          <div className="space-y-3 animate-fade-in">
             {pmSteps.map(step => (
                 <StepCard 
                    key={step.id} 
                    step={step} 
                    checked={pmChecks.has(step.id)} 
                    onClick={() => !todayLog?.pmCompleted && toggleCheck(step.id, 'PM')} 
                    onEdit={() => !isRescueMode && openEditModal('PM', step)} // Disable edit in rescue
                    imageUrl={getProductImage(step.productName)}
                    customColor={themeHex}
                    disabled={!!todayLog?.pmCompleted}
                 />
             ))}
          </div>

          <button 
            onClick={() => toggleCompletion('PM')}
            disabled={!todayLog?.pmCompleted && pmChecks.size < pmSteps.length}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-md flex items-center justify-center gap-3 border-b-4 active:border-b-0 active:translate-y-1 ${
                todayLog?.pmCompleted
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-emerald-200'
                : pmChecks.size === pmSteps.length 
                    ? 'text-white border-black/20 hover:brightness-110 shadow-lg' 
                    : 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed shadow-none'
            }`}
            style={(!todayLog?.pmCompleted && pmChecks.size === pmSteps.length) ? { backgroundColor: themeHex, borderColor: `${themeHex}CC` } : {}}
          >
            {todayLog?.pmCompleted ? <><div className="bg-white/20 p-1 rounded-full"><Check size={16} strokeWidth={3} /></div> GIORNATA COMPLETATA</> : "CONCLUDI GIORNATA"}
          </button>
          
          {todayLog?.pmCompleted && (
              <button onClick={() => toggleCompletion('PM')} className="w-full text-center mt-4 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors">
                  Annulla e riapri
              </button>
          )}
      </section>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 animate-slide-up shadow-2xl m-0 sm:m-4">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-nunito font-bold text-stone-900">Cambia Prodotto</h3>
                      <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-stone-100 rounded-full text-stone-500">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="space-y-4">
                      <div className="relative">
                        <select 
                            className="w-full appearance-none bg-stone-50 border border-stone-200 text-stone-800 text-sm rounded-xl px-4 py-3 font-bold outline-none focus:ring-2 ring-rose-200"
                            value={editingStep?.currentProduct}
                            onChange={(e) => setEditingStep(prev => prev ? { ...prev, currentProduct: e.target.value } : null)}
                        >
                            <option value="">Seleziona un prodotto...</option>
                            {products.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                      </div>
                      <button 
                        onClick={() => editingStep && saveProductChange(editingStep.currentProduct)}
                        className="w-full py-3.5 bg-stone-800 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-stone-900 transition-colors"
                      >
                          AGGIORNA STEP
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="h-8"></div>
    </div>
  );
};

export default TodayView;