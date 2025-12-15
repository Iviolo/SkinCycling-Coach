import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, Eye, EyeOff, ChevronDown, User, Database, Layout } from 'lucide-react';
import { RoutineSettings, RoutineStep, CycleNightConfig, Product } from '../types';
import { getRoutineSettings, saveRoutineSettings, getProducts, getUserName, saveUserName } from '../services/storageService';
import { NIGHT_COLORS } from '../constants';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<RoutineSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'AM' | 'PM'>('AM');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  const [name, setName] = useState('Iviolo');
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);

  useEffect(() => {
    setSettings(getRoutineSettings());
    setAvailableProducts(getProducts());
    setName(getUserName());
  }, []);

  const handleSaveAll = () => {
    if (settings) {
      saveRoutineSettings(settings);
    }
    saveUserName(name);
    onBack();
  };

  const handleReset = () => {
      // RESET NUCLEARE: Cancellazione manuale e ricaricamento forzato
      if (window.confirm("SEI SICURO? Tutti i tuoi dati, prodotti e storici verranno cancellati per sempre.")) {
          try {
              // 1. Cancella chiavi specifiche (per sicurezza)
              localStorage.removeItem('skincycling_logs');
              localStorage.removeItem('skincycling_products');
              localStorage.removeItem('skincycling_start_date');
              localStorage.removeItem('skincycling_settings');
              localStorage.removeItem('skincycling_username');
              
              // 2. Cancella tutto il resto
              localStorage.clear();
              sessionStorage.clear();
              
              // 3. Ricarica la pagina forzatamente
              window.location.reload();
          } catch (e) {
              alert("Errore nel reset. Prova a ricaricare la pagina manualmente.");
              localStorage.clear();
              window.location.reload();
          }
      }
  };

  const updateAmStep = (index: number, field: keyof RoutineStep, value: string) => {
    if (!settings) return;
    const newAm = [...settings.amRoutine];
    newAm[index] = { ...newAm[index], [field]: value };
    setSettings({ ...settings, amRoutine: newAm });
  };
  const addAmStep = () => {
    if (!settings) return;
    const newStep: RoutineStep = { id: `am_${Date.now()}`, label: 'Nuovo Step', productName: '' };
    setSettings({ ...settings, amRoutine: [...settings.amRoutine, newStep] });
  };
  const removeAmStep = (index: number) => {
    if (!settings) return;
    const newAm = [...settings.amRoutine];
    newAm.splice(index, 1);
    setSettings({ ...settings, amRoutine: newAm });
  };
  const toggleNightEnabled = (index: number) => {
    if (!settings) return;
    const newPm = [...settings.pmCycle];
    newPm[index] = { ...newPm[index], isEnabled: !newPm[index].isEnabled };
    setSettings({ ...settings, pmCycle: newPm });
  };
  const updateNightField = (index: number, field: keyof CycleNightConfig, value: string) => {
    if (!settings) return;
    const newPm = [...settings.pmCycle];
    // @ts-ignore
    newPm[index] = { ...newPm[index], [field]: value };
    setSettings({ ...settings, pmCycle: newPm });
  };
  const updateNightStep = (nightIndex: number, stepIndex: number, field: keyof RoutineStep, value: string) => {
    if (!settings) return;
    const newPm = [...settings.pmCycle];
    const newSteps = [...newPm[nightIndex].steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
    newPm[nightIndex] = { ...newPm[nightIndex], steps: newSteps };
    setSettings({ ...settings, pmCycle: newPm });
  };
  const addNightStep = (nightIndex: number) => {
    if (!settings) return;
    const newPm = [...settings.pmCycle];
    const newStep: RoutineStep = { id: `pm_${nightIndex}_${Date.now()}`, label: 'Nuovo Step', productName: '' };
    newPm[nightIndex] = { ...newPm[nightIndex], steps: [...newPm[nightIndex].steps, newStep] };
    setSettings({ ...settings, pmCycle: newPm });
  };
  const removeNightStep = (nightIndex: number, stepIndex: number) => {
    if (!settings) return;
    const newPm = [...settings.pmCycle];
    const newSteps = [...newPm[nightIndex].steps];
    newSteps.splice(stepIndex, 1);
    newPm[nightIndex] = { ...newPm[nightIndex], steps: newSteps };
    setSettings({ ...settings, pmCycle: newPm });
  };

  const getNightColor = (index: number) => {
      if (index === 0) return NIGHT_COLORS.night_1;
      if (index === 1) return NIGHT_COLORS.night_2;
      return NIGHT_COLORS.night_3_4;
  };

  const ProductSelect = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => (
    <div className="relative">
        <select 
            value={value || ""} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-xs text-stone-600 font-bold bg-stone-100/60 rounded-lg px-3 py-2 outline-none appearance-none pr-8 truncate transition-all focus:bg-stone-100 focus:ring-2 ring-stone-200"
        >
            <option value="">{placeholder}</option>
            {availableProducts.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                <option key={p.id} value={p.name}>
                    {p.brand ? `${p.brand} - ${p.name}` : p.name}
                </option>
            ))}
            {value && value !== "" && !availableProducts.find(p => p.name === value) && (
                <option value={value}>{value} (Archiviato)</option>
            )}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
    </div>
  );

  if (!settings) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar bg-[#FDFCF8]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#FDFCF8]/90 backdrop-blur-md pt-2 pb-4 z-10">
        <button onClick={onBack} className="p-3 rounded-full hover:bg-stone-100 transition-colors">
          <ArrowLeft className="text-stone-700" size={24} />
        </button>
        <h1 className="text-xl font-nunito font-bold text-stone-800">Impostazioni</h1>
        <button onClick={handleSaveAll} className="px-5 py-2 rounded-full bg-stone-800 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform">
          SALVA
        </button>
      </div>

      <div className="space-y-6">
          
          {/* Profile Section */}
          <section className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-rose-400">
                 <User size={20} />
                 <h2 className="font-bold text-stone-700">Profilo</h2>
             </div>
             <div>
                 <label className="text-xs font-bold text-stone-400 ml-1 mb-1 block">Nome visualizzato</label>
                 <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 outline-none focus:ring-2 ring-stone-200"
                 />
             </div>
          </section>

          {/* Routine Toggle Section */}
          <section className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowRoutineEditor(!showRoutineEditor)}
              >
                 <div className="flex items-center gap-3 text-amber-400">
                    <Layout size={20} />
                    <h2 className="font-bold text-stone-700">Personalizzazione Routine</h2>
                 </div>
                 <ChevronDown size={20} className={`text-stone-400 transition-transform ${showRoutineEditor ? 'rotate-180' : ''}`} />
              </div>

              {showRoutineEditor && (
                  <div className="mt-6 animate-fade-in border-t border-stone-50 pt-6">
                        <div className="flex p-1 bg-stone-50 border border-stone-100 rounded-2xl mb-6">
                            <button 
                            onClick={() => setActiveTab('AM')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'AM' ? 'bg-white shadow-sm text-amber-600' : 'text-stone-400'}`}
                            >
                            Mattina
                            </button>
                            <button 
                            onClick={() => setActiveTab('PM')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'PM' ? 'bg-white shadow-sm text-rose-600' : 'text-stone-400'}`}
                            >
                            Sera (Ciclo)
                            </button>
                        </div>

                        {activeTab === 'AM' && (
                            <div className="space-y-4">
                            {settings.amRoutine.map((step, idx) => (
                                <div key={step.id} className="bg-stone-50/50 p-3 rounded-2xl border border-stone-100 flex items-start gap-3">
                                <span className="text-stone-300 cursor-move mt-3"><GripVertical size={16} /></span>
                                <div className="flex-1 space-y-2">
                                    <input 
                                    value={step.label}
                                    onChange={(e) => updateAmStep(idx, 'label', e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-stone-700 outline-none placeholder-stone-300 border-b border-stone-100 focus:border-stone-300 py-1"
                                    placeholder="Nome step"
                                    />
                                    <ProductSelect 
                                        value={step.productName} 
                                        onChange={(val) => updateAmStep(idx, 'productName', val)}
                                        placeholder="Scegli prodotto..."
                                    />
                                </div>
                                <button onClick={() => removeAmStep(idx)} className="p-2 text-stone-300 hover:text-white hover:bg-rose-400 rounded-lg transition-all">
                                    <Trash2 size={16} />
                                </button>
                                </div>
                            ))}

                            <button onClick={addAmStep} className="w-full py-3 border border-dashed border-stone-300 rounded-2xl text-stone-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors">
                                <Plus size={16} /> AGGIUNGI STEP
                            </button>
                            </div>
                        )}

                        {activeTab === 'PM' && (
                            <div className="space-y-6">
                            {settings.pmCycle.map((night, nIdx) => (
                                <div key={night.id} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${night.isEnabled ? 'bg-white border-stone-100' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                                    <div className="p-4 border-b border-stone-50 flex items-center justify-between bg-stone-50/50">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs text-white`}
                                            style={{ backgroundColor: night.isEnabled ? getNightColor(nIdx) : '#d6d3d1' }}
                                        >
                                            {nIdx + 1}
                                        </div>
                                        <input 
                                            value={night.title}
                                            onChange={(e) => updateNightField(nIdx, 'title', e.target.value)}
                                            className="font-nunito font-bold text-stone-700 bg-transparent outline-none text-sm w-32"
                                            disabled={!night.isEnabled}
                                        />
                                    </div>
                                    <button onClick={() => toggleNightEnabled(nIdx)} className="text-stone-400 hover:text-stone-600">
                                        {night.isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    </div>
                                    {night.isEnabled && (
                                    <div className="p-3 space-y-4">
                                        <div className="space-y-3">
                                            {night.steps.map((step, sIdx) => (
                                            <div key={step.id} className="flex gap-2 items-start bg-stone-50/30 p-2 rounded-xl border border-stone-50">
                                                <div className="flex-1 space-y-1">
                                                <input 
                                                    value={step.label} 
                                                    onChange={(e) => updateNightStep(nIdx, sIdx, 'label', e.target.value)}
                                                    className="w-full text-xs font-bold text-stone-700 bg-transparent outline-none"
                                                    placeholder="Nome step"
                                                />
                                                <ProductSelect 
                                                        value={step.productName} 
                                                        onChange={(val) => updateNightStep(nIdx, sIdx, 'productName', val)}
                                                        placeholder="Scegli prodotto..."
                                                    />
                                                </div>
                                                <button onClick={() => removeNightStep(nIdx, sIdx)} className="text-stone-300 hover:text-white hover:bg-rose-400 rounded-lg mt-1 p-1.5 transition-all">
                                                <Trash2 size={14} />
                                                </button>
                                            </div>
                                            ))}
                                            <button onClick={() => addNightStep(nIdx)} className="w-full py-2 text-[10px] font-bold text-stone-400 hover:text-rose-400 flex items-center justify-center gap-1 border border-dashed border-stone-200 rounded-lg">
                                            <Plus size={12} /> Aggiungi Step
                                            </button>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            ))}
                            </div>
                        )}
                  </div>
              )}
          </section>

          {/* Danger Zone */}
          <section className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4 text-stone-400">
                 <Database size={20} />
                 <h2 className="font-bold text-stone-700">Area Reset</h2>
             </div>
             <p className="text-xs text-stone-400 mb-4 leading-relaxed">
                 Usa questo tasto solo se l'app ha problemi o vuoi ricominciare da zero. Cancellerà tutto.
             </p>
             <button 
                onClick={handleReset}
                className="w-full py-3 border border-rose-200 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-50 transition-colors"
             >
                 RESETTA TUTTO (IRREVERSIBILE)
             </button>
          </section>

      </div>
    </div>
  );
};

export default SettingsView;