import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Plus, GripVertical, Eye, EyeOff } from 'lucide-react';
import { RoutineSettings, RoutineStep, CycleNightConfig } from '../types';
import { getRoutineSettings, saveRoutineSettings } from '../services/storageService';
import { NIGHT_COLORS } from '../constants';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<RoutineSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    setSettings(getRoutineSettings());
  }, []);

  const handleSave = () => {
    if (settings) {
      saveRoutineSettings(settings);
      onBack();
    }
  };

  // Helper functions (same logic as before, just UI update)
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
      // 0=night1(orange), 1=night2(pink), 2=night3(green), 3=night4(green)
      if (index === 0) return NIGHT_COLORS.night_1;
      if (index === 1) return NIGHT_COLORS.night_2;
      return NIGHT_COLORS.night_3_4;
  };

  if (!settings) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar bg-[#FDFCF8]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#FDFCF8]/90 backdrop-blur-md pt-2 pb-4 z-10">
        <button onClick={onBack} className="p-3 rounded-full hover:bg-stone-100 transition-colors">
          <ArrowLeft className="text-stone-700" size={24} />
        </button>
        <h1 className="text-xl font-nunito font-bold text-stone-800">Personalizza</h1>
        <button onClick={handleSave} className="px-5 py-2 rounded-full bg-stone-800 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform">
          SALVA
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-stone-100 rounded-2xl mb-8 shadow-sm">
        <button 
          onClick={() => setActiveTab('AM')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'AM' ? 'bg-amber-100 text-amber-800' : 'text-stone-400'}`}
        >
          Mattina
        </button>
        <button 
          onClick={() => setActiveTab('PM')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'PM' ? 'bg-rose-100 text-rose-800' : 'text-stone-400'}`}
        >
          Sera (Ciclo)
        </button>
      </div>

      {/* AM Settings */}
      {activeTab === 'AM' && (
        <div className="space-y-4 animate-slide-up">
          {settings.amRoutine.map((step, idx) => (
            <div key={step.id} className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex items-center gap-4">
              <span className="text-stone-200 cursor-move"><GripVertical size={20} /></span>
              <div className="flex-1 space-y-2">
                <input 
                  value={step.label}
                  onChange={(e) => updateAmStep(idx, 'label', e.target.value)}
                  className="w-full text-base font-bold text-stone-700 outline-none placeholder-stone-300"
                  placeholder="Nome step"
                />
                <input 
                  value={step.productName}
                  onChange={(e) => updateAmStep(idx, 'productName', e.target.value)}
                  className="w-full text-sm text-stone-400 outline-none placeholder-stone-200"
                  placeholder="Prodotto associato"
                />
              </div>
              <button onClick={() => removeAmStep(idx)} className="p-2 text-stone-300 hover:text-rose-400 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button onClick={addAmStep} className="w-full py-4 border border-dashed border-stone-300 rounded-2xl text-stone-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors">
            <Plus size={18} /> AGGIUNGI STEP
          </button>
        </div>
      )}

      {/* PM Settings */}
      {activeTab === 'PM' && (
        <div className="space-y-6 animate-slide-up">
           {settings.pmCycle.map((night, nIdx) => (
             <div key={night.id} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${night.isEnabled ? 'bg-white border-stone-100 shadow-sm' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                
                <div className="p-5 border-b border-stone-50 flex items-center justify-between bg-stone-50/50">
                   <div className="flex items-center gap-4">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white`}
                        style={{ backgroundColor: night.isEnabled ? getNightColor(nIdx) : '#d6d3d1' }}
                      >
                        {nIdx + 1}
                      </div>
                      <input 
                        value={night.title}
                        onChange={(e) => updateNightField(nIdx, 'title', e.target.value)}
                        className="font-nunito font-bold text-stone-700 bg-transparent outline-none text-lg w-40"
                        disabled={!night.isEnabled}
                      />
                   </div>
                   <button onClick={() => toggleNightEnabled(nIdx)} className="text-stone-400 hover:text-stone-600">
                      {night.isEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
                   </button>
                </div>

                {night.isEnabled && (
                  <div className="p-5 space-y-4">
                    <input 
                        value={night.description}
                        onChange={(e) => updateNightField(nIdx, 'description', e.target.value)}
                        className="w-full text-sm text-stone-500 bg-transparent outline-none italic"
                        placeholder="Descrizione obiettivo..."
                    />

                    <div className="space-y-3">
                        {night.steps.map((step, sIdx) => (
                          <div key={step.id} className="flex gap-3 items-center bg-stone-50/50 p-3 rounded-xl border border-stone-50">
                             <div className="flex-1">
                               <input 
                                 value={step.label} 
                                 onChange={(e) => updateNightStep(nIdx, sIdx, 'label', e.target.value)}
                                 className="w-full text-sm font-bold text-stone-700 bg-transparent outline-none mb-0.5" 
                               />
                               <input 
                                 value={step.productName} 
                                 onChange={(e) => updateNightStep(nIdx, sIdx, 'productName', e.target.value)}
                                 className="w-full text-xs text-stone-400 bg-transparent outline-none" 
                               />
                             </div>
                             <button onClick={() => removeNightStep(nIdx, sIdx)} className="text-stone-300 hover:text-rose-400">
                               <Trash2 size={16} />
                             </button>
                          </div>
                        ))}
                        <button onClick={() => addNightStep(nIdx)} className="w-full py-2 text-xs font-bold text-stone-400 hover:text-rose-400 flex items-center justify-center gap-1">
                           <Plus size={14} /> Aggiungi Prodotto
                        </button>
                    </div>
                  </div>
                )}
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SettingsView;