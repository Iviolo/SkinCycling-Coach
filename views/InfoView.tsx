import React from 'react';
import { AlertOctagon, Droplet, Sparkles, ShieldCheck, Zap, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { NIGHT_COLORS } from '../constants';

const InfoView: React.FC = () => {
  const sections = [
    {
      night: 1,
      title: 'Esfoliazione',
      hero: 'Libera i pori e illumina l’incarnato.',
      color: NIGHT_COLORS.night_1,
      dos: [
        'Usa: Esfolianti chimici (AHA per luminosità, BHA per i pori).',
        'Applica su pelle perfettamente asciutta.',
        'Sport: Detergi il viso subito dopo l\'allenamento per evitare pori ostruiti.'
      ],
      donts: [
        'Evita: Scrub fisici granulosi o spazzole rotanti.',
        'Evita: Retinolo o altri attivi forti la stessa sera.'
      ],
      emergency: 'Se la pelle brucia o è rossa: Salta l\'acido, usa solo detergente delicato e crema idratante.'
    },
    {
      night: 2,
      title: 'Retinoide',
      hero: 'Accelera il rinnovamento e stimola il collagene.',
      color: NIGHT_COLORS.night_2,
      dos: [
        'Usa: Retinolo o Retinale (quantità: un chicco di riso per tutto il viso).',
        'Tecnica Sandwich: Crema idratante → Retinolo → Crema (se hai pelle sensibile).',
        'Attendi che la pelle sia asciutta prima di applicare.'
      ],
      donts: [
        'Evita: Vitamina C o acidi esfolianti nella stessa sera.',
        'Evita: Zone sensibili come contorno occhi e angoli della bocca.'
      ],
      emergency: 'Se noti desquamazione eccessiva: Riduci la frequenza o aumenta le notti di recupero.'
    },
    {
      night: 3,
      title: 'Recupero I',
      hero: 'Idratazione profonda e riparazione barriera.',
      color: NIGHT_COLORS.night_3_4,
      dos: [
        'Usa: Acido Ialuronico, Ceramidi, Pantenolo, Peptidi.',
        'Abbonda con la crema idratante.',
        'Ascolta la tua pelle: deve sentirsi confortevole e lenita.'
      ],
      donts: [
        'Evita: Qualsiasi attivo esfoliante o irritante.',
        'Evita: Acqua troppo calda durante la detersione.'
      ],
      emergency: 'Se la pelle tira ancora: Applica un secondo strato di crema prima di dormire.'
    },
    {
      night: 4,
      title: 'Recupero II',
      hero: 'Consolida i risultati e calma la pelle.',
      color: NIGHT_COLORS.night_3_4,
      dos: [
        'Usa: Prodotti ricchi e nutrienti (Oli viso se graditi).',
        'Sport all\'aperto? Idrata extra per contrastare vento/sole.',
        'Preparati a ricominciare il ciclo domani.'
      ],
      donts: [
        'Evita: Tentazione di "fare di più". Il riposo è parte del trattamento.',
      ],
      emergency: 'Se la barriera è danneggiata: Prosegui con notti di recupero finché non è sana.'
    }
  ];

  return (
    <div className="pb-28 pt-8 px-5 max-w-md mx-auto min-h-screen overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-nunito font-bold text-stone-900 drop-shadow-sm leading-tight">
          Guida <span className="text-rose-600">Skin Cycling</span>
        </h1>
        <p className="text-stone-600 font-medium text-sm mt-2 leading-relaxed">
          Il tuo programma strategico di 4 notti per una pelle sana, rigenerata e luminosa.
        </p>
      </div>

      {/* Golden Rules */}
      <div className="relative overflow-hidden bg-rose-50/80 backdrop-blur-md border border-rose-100 rounded-[2rem] p-6 shadow-lg mb-8">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertOctagon size={80} className="text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-rose-700 mb-4 flex items-center gap-2 relative z-10">
            <ShieldCheck size={20} /> Regole d'Oro
        </h3>
        <ul className="space-y-3 relative z-10">
            {[
                'SPF 50+ obbligatorio ogni singola mattina.',
                'Mai miscelare Acidi e Retinoidi la stessa sera.',
                'Se la pelle brucia, interrompi tutto e passa al Recupero.',
                'Costanza batte intensità: meglio poco e spesso.'
            ].map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm text-stone-800 font-medium leading-snug">
                    <span className="text-rose-500 font-bold">•</span>
                    {rule}
                </li>
            ))}
        </ul>
      </div>

      {/* Night Sections */}
      <div className="space-y-6 mb-10">
        {sections.map((section) => (
            <div key={section.night} className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-md overflow-hidden transition-transform active:scale-[0.99]">
                <div className="p-1 h-2 w-full" style={{ backgroundColor: section.color }}></div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-nunito font-bold text-stone-900">{section.title}</h2>
                        <span 
                            className="text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider"
                            style={{ backgroundColor: `${section.color}20`, color: section.color }}
                        >
                            Notte {section.night}
                        </span>
                    </div>
                    
                    <p className="text-stone-600 font-medium italic text-sm mb-5 border-l-2 pl-3 py-1" style={{ borderColor: section.color }}>
                        "{section.hero}"
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
                                <CheckCircle2 size={14} /> Cosa Fare
                            </h4>
                            <ul className="space-y-1.5">
                                {section.dos.map((d, i) => (
                                    <li key={i} className="text-xs text-stone-700 leading-relaxed pl-1">• {d}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-rose-500 uppercase tracking-wide mb-2">
                                <AlertTriangle size={14} /> Cosa Evitare
                            </h4>
                            <ul className="space-y-1.5">
                                {section.donts.map((d, i) => (
                                    <li key={i} className="text-xs text-stone-700 leading-relaxed pl-1">• {d}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100">
                        <p className="text-[11px] font-bold text-stone-500 uppercase mb-1 flex items-center gap-1">
                            <Activity size={12} /> SOS Pelle
                        </p>
                        <p className="text-xs text-stone-600 bg-stone-50/80 p-2 rounded-lg border border-stone-100">
                            {section.emergency}
                        </p>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Summary Table Grid */}
      <div className="mb-8">
          <h3 className="text-lg font-nunito font-bold text-stone-900 mb-4 px-2">Riepilogo Ciclo</h3>
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 bg-stone-100/50 border-b border-stone-200/50 py-2 px-3">
                  <div className="col-span-2 text-[10px] font-bold text-stone-400 uppercase">Notte</div>
                  <div className="col-span-4 text-[10px] font-bold text-stone-400 uppercase">Obiettivo</div>
                  <div className="col-span-6 text-[10px] font-bold text-stone-400 uppercase text-right">Attivi Chiave</div>
              </div>
              
              <div className="divide-y divide-stone-100">
                  <div className="grid grid-cols-12 py-3 px-3 items-center hover:bg-white/60 transition-colors">
                      <div className="col-span-2 font-bold text-sm text-stone-900">1</div>
                      <div className="col-span-4 text-xs font-bold text-stone-600">Esfoliazione</div>
                      <div className="col-span-6 text-xs text-stone-500 text-right">AHA / BHA</div>
                  </div>
                  <div className="grid grid-cols-12 py-3 px-3 items-center hover:bg-white/60 transition-colors">
                      <div className="col-span-2 font-bold text-sm text-stone-900">2</div>
                      <div className="col-span-4 text-xs font-bold text-stone-600">Rinnovo</div>
                      <div className="col-span-6 text-xs text-stone-500 text-right">Retinolo / Retinale</div>
                  </div>
                  <div className="grid grid-cols-12 py-3 px-3 items-center hover:bg-white/60 transition-colors">
                      <div className="col-span-2 font-bold text-sm text-stone-900">3</div>
                      <div className="col-span-4 text-xs font-bold text-stone-600">Recupero</div>
                      <div className="col-span-6 text-xs text-stone-500 text-right">Ialuronico / Peptidi</div>
                  </div>
                  <div className="grid grid-cols-12 py-3 px-3 items-center hover:bg-white/60 transition-colors">
                      <div className="col-span-2 font-bold text-sm text-stone-900">4</div>
                      <div className="col-span-4 text-xs font-bold text-stone-600">Recupero</div>
                      <div className="col-span-6 text-xs text-stone-500 text-right">Ceramidi / Oli</div>
                  </div>
              </div>
          </div>
          <p className="text-[10px] text-stone-400 text-center mt-4">
              * Mattina: Sempre Detergente + Vitamina C (opz) + Crema + SPF.
          </p>
      </div>

    </div>
  );
};

export default InfoView;
