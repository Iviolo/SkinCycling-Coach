import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, Eye, EyeOff, ChevronDown, User, Database, Layout, Download, Upload } from 'lucide-react';
import { RoutineSettings, RoutineStep, CycleNightConfig, Product } from '../types';
import { getRoutineSettings, saveRoutineSettings, getProducts, getUserName, saveUserName, saveProducts } from '../services/storageService';
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
      if (window.confirm("SEI SICURO? Tutti i tuoi dati, prodotti e storici verranno cancellati per sempre.")) {
          try {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
          } catch (e) {
              alert("Errore nel reset. Prova a ricaricare la pagina manualmente.");
              localStorage.clear();
              window.location.reload();
          }
      }
  };

  const handleExport = () => {
      const data = {
          logs: localStorage.getItem('skincycling_logs'),
          products: localStorage.getItem('skincycling_products'),
          startDate: localStorage.getItem('skincycling_start_date'),
          settings: localStorage.getItem('skincycling_settings'),
          username: localStorage.getItem('skincycling_username'),
      };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skincycling_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              if (data.logs) localStorage.setItem('skincycling_logs', data.logs);
              if (data.products) localStorage.setItem('skincycling_products', data.products);
              if (data.startDate) localStorage.setItem('skincycling_start_date', data.startDate);
              if (data.settings) localStorage.setItem('skincycling_settings', data.settings);
              if (data.username) localStorage.setItem('skincycling_username', data.username);
              alert("Backup ripristinato con successo!");
              window.location.reload();
          } catch (err) {
              alert("File di backup non valido.");
          }
      };
      reader.readAsText(file);
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
            className="w-full text-xs text-stone-700 font-bold bg-white/60 rounded-lg px-3 py-2 outline-none appearance-none pr-8 truncate transition-all focus:bg-white focus:ring-2 ring-stone-200 border border-white/60"
        >
            <option value="">{placeholder}</option>
            {availableProducts.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                <option key={p.id} value={p.name}>
                    {p.name}
                </option>
            ))}
            {value && value !== "" && !availableProducts.find(p => p.name === value) && (
                <option value={value}>{value} (Archiviato)</option>
            )}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
    </div>
  );

  if (!settings) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar bg-transparent">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-transparent pt-2 pb-4 z-10">
        <button onClick={onBack} className="p-3 rounded-full hover:bg-white/80 backdrop-blur-sm transition-colors bg-white/60 border border-white/60">
          <ArrowLeft className="text-stone-800" size={24} />
        </button>
        <h1 className="text-xl font-nunito font-bold text-stone-900 drop-shadow-sm">Impostazioni</h1>
        <button onClick={handleSaveAll} className="px-5 py-2 rounded-full bg-stone-800 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform">
          SALVA
        </button>
      </div>

      <div className="space-y-6">
          
          {/* Profile Section */}
          <section className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-lg animate-fade-in">
             <div className="flex items-center gap-3 mb-4 text-rose-600">
                 <User size={20} />
                 <h2 className="font-bold text-stone-800">Profilo</h2>
             </div>
             <div>
                 <label className="text-xs font-bold text-stone-600 ml-1 mb-1 block">Nome visualizzato</label>
                 <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/60 rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 outline-none focus:ring-2 ring-stone-200 border border-white/60 placeholder-stone-400"
                 />
             </div>
          </section>

          {/* Backup Section (New) */}
          <section className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-lg animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-3 mb-4 text-emerald-600">
                 <Database size={20} />
                 <h2 className="font-bold text-stone-800">Dati & Backup</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleExport} className="flex flex-col items-center justify-center p-4 bg-white/60 border border-white/60 rounded-2xl hover:bg-white transition-colors gap-2">
                      <Download size={24} className="text-stone-600" />
                      <span className="text-xs font-bold text-stone-700">Esporta Backup</span>
                  </button>
                  <label className="flex flex-col items-center justify-center p-4 bg-white/60 border border-white/60 rounded-2xl hover:bg-white transition-colors gap-2 cursor-pointer">
                      <Upload size={24} className="text-stone-600" />
                      <span className="text-xs font-bold text-stone-700">Importa Backup</span>
                      <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>
              </div>
          </section>

          {/* Routine Toggle Section */}
          <section className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-lg animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowRoutineEditor(!showRoutineEditor)}
              >
                 <div className="flex items-center gap-3 text-amber-600">
                    <Layout size={20} />
                    <h2 className="font-bold text-stone-800">Personalizzazione Routine</h2>
                 </div>
                 <ChevronDown size={20} className={`text-stone-500 transition-transform ${showRoutineEditor ? 'rotate-180' : ''}`} />
              </div>

              {showRoutineEditor && (
                  <div className="mt-6 animate-slide-up border-t border-stone-200/30 pt-6">
                        {/* ... editor code ... */}
                        <div className="flex p-1 bg-white/60 border border-white/60 rounded-2xl mb-6">
                            <button 
                            onClick={() => setActiveTab('AM')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'AM' ? 'bg-white/95 shadow-sm text-amber-600' : 'text-stone-500'}`}
                            >
                            Mattina
                            </button>
                            <button 
                            onClick={() => setActiveTab('PM')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'PM' ? 'bg-white/95 shadow-sm text-rose-600' : 'text-stone-500'}`}
                            >
                            Sera (Ciclo)
                            </button>
                        </div>

                        {activeTab === 'AM' && (
                            <div className="space-y-4">
                            {settings.amRoutine.map((step, idx) => (
                                <div key={step.id} className="bg-white/60 p-3 rounded-2xl border border-white/60 flex items-start gap-3">
                                <span className="text-stone-400 cursor-move mt-3"><GripVertical size={16} /></span>
                                <div className="flex-1 space-y-2">
                                    <input 
                                    value={step.label}
                                    onChange={(e) => updateAmStep(idx, 'label', e.target.value)}
                                    className="w-full bg-transparent text-sm font-bold text-stone-800 outline-none placeholder-stone-400 border-b border-stone-200 focus:border-stone-400 py-1"
                                    placeholder="Nome step"
                                    />
                                    <ProductSelect 
                                        value={step.productName} 
                                        onChange={(val) => updateAmStep(idx, 'productName', val)}
                                        placeholder="Scegli prodotto..."
                                    />
                                </div>
                                <button onClick={() => removeAmStep(idx)} className="p-2 text-stone-400 hover:text-white hover:bg-rose-400 rounded-lg transition-all">
                                    <Trash2 size={16} />
                                </button>
                                </div>
                            ))}

                            <button onClick={addAmStep} className="w-full py-3 border border-dashed border-stone-300 rounded-2xl text-stone-600 font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/60 transition-colors">
                                <Plus size={16} /> AGGIUNGI STEP
                            </button>
                            </div>
                        )}

                        {activeTab === 'PM' && (
                            <div className="space-y-6">
                            {settings.pmCycle.map((night, nIdx) => (
                                <div key={night.id} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${night.isEnabled ? 'bg-white/60 border-white/60' : 'bg-stone-50/30 border-stone-100 opacity-60'}`}>
                                    <div className="p-4 border-b border-white/30 flex items-center justify-between bg-white/40">
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
                                            className="font-nunito font-bold text-stone-800 bg-transparent outline-none text-sm w-32"
                                            disabled={!night.isEnabled}
                                        />
                                    </div>
                                    <button onClick={() => toggleNightEnabled(nIdx)} className="text-stone-500 hover:text-stone-700">
                                        {night.isEnabled ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    </div>
                                    {night.isEnabled && (
                                    <div className="p-3 space-y-4">
                                        <div className="space-y-3">
                                            {night.steps.map((step, sIdx) => (
                                            <div key={step.id} className="flex gap-2 items-start bg-white/60 p-2 rounded-xl border border-white/60">
                                                <div className="flex-1 space-y-1">
                                                <input 
                                                    value={step.label} 
                                                    onChange={(e) => updateNightStep(nIdx, sIdx, 'label', e.target.value)}
                                                    className="w-full text-xs font-bold text-stone-800 bg-transparent outline-none"
                                                    placeholder="Nome step"
                                                />
                                                <ProductSelect 
                                                        value={step.productName} 
                                                        onChange={(val) => updateNightStep(nIdx, sIdx, 'productName', val)}
                                                        placeholder="Scegli prodotto..."
                                                    />
                                                </div>
                                                <button onClick={() => removeNightStep(nIdx, sIdx)} className="text-stone-400 hover:text-white hover:bg-rose-400 rounded-lg mt-1 p-1.5 transition-all">
                                                <Trash2 size={14} />
                                                </button>
                                            </div>
                                            ))}
                                            <button onClick={() => addNightStep(nIdx)} className="w-full py-2 text-[10px] font-bold text-stone-500 hover:text-rose-500 flex items-center justify-center gap-1 border border-dashed border-stone-300 rounded-lg">
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
          <section className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-lg animate-fade-in" style={{animationDelay: '0.3s'}}>
             <div className="flex items-center gap-3 mb-4 text-stone-600">
                 <Trash2 size={20} />
                 <h2 className="font-bold text-stone-800">Area Reset</h2>
             </div>
             <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                 Usa questo tasto solo se l'app ha problemi o vuoi ricominciare da zero. Cancellerà tutto.
             </p>
             <button 
                onClick={handleReset}
                className="w-full py-3 border border-rose-200/50 bg-white/60 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50/50 transition-colors"
             >
                 RESETTA TUTTO (IRREVERSIBILE)
             </button>
          </section>

          <div className="text-center pb-8">
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Versione 2.0 (Pro PWA)</span>
          </div>

      </div>
    </div>
  );
};

export default SettingsView;