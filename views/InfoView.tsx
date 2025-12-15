import React from 'react';
import { HelpCircle, AlertOctagon, BookOpen, Feather, Sparkles } from 'lucide-react';

const InfoView: React.FC = () => {
  return (
    <div className="pb-24 pt-6 px-5 max-w-md mx-auto h-screen overflow-y-auto no-scrollbar">
      <h1 className="text-3xl font-nunito font-bold text-stone-900 mb-8 mt-2 drop-shadow-sm">Guida<br/><span className="text-rose-600 italic">Skin Cycling</span></h1>

      <div className="space-y-8">
        
        {/* Editorial Intro */}
        <div className="relative bg-white/30 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-lg">
           <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-300 to-rose-100 rounded-l-3xl"></div>
           <p className="text-lg font-nunito text-stone-800 leading-relaxed">
             Un metodo strategico di 4 notti per bilanciare <span className="font-bold text-rose-600">esfoliazione</span>, <span className="font-bold text-rose-600">rinnovamento</span> e <span className="font-bold text-emerald-600">recupero</span>.
           </p>
        </div>

        {/* The Cycle Steps */}
        <section className="space-y-4">
            {[
                { n: 1, title: 'Esfoliazione', desc: 'Acidi (AHA/BHA) per liberare i pori.', icon: Feather, color: 'text-emerald-700', bg: 'bg-emerald-100/40' },
                { n: 2, title: 'Retinoide', desc: 'Potenzia collagene e texture.', icon: Sparkles, color: 'text-rose-600', bg: 'bg-rose-100/40' },
                { n: 3, title: 'Recupero', desc: 'Idratazione e riparazione barriera.', icon: BookOpen, color: 'text-sky-700', bg: 'bg-sky-100/40' },
                { n: 4, title: 'Recupero', desc: 'Calma e nutre la pelle.', icon: BookOpen, color: 'text-sky-700', bg: 'bg-sky-100/40' },
            ].map((step) => (
                <div key={step.n} className="flex gap-5 items-center bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-sm hover:bg-white/40 transition-colors">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${step.bg}`}>
                        <span className={`font-nunito font-bold text-xl ${step.color}`}>{step.n}</span>
                    </div>
                    <div>
                        <h3 className="font-nunito font-bold text-stone-900 text-lg">{step.title}</h3>
                        <p className="text-sm text-stone-700 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                </div>
            ))}
        </section>

        {/* Warning Box */}
        <div className="p-6 bg-white/30 backdrop-blur-md border border-rose-100/50 rounded-3xl shadow-lg relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50/50 rounded-full opacity-50"></div>
             <div className="relative z-10">
                <h4 className="font-bold text-rose-600 flex items-center gap-2 mb-2">
                    <AlertOctagon size={18} /> Regole d'Oro
                </h4>
                <ul className="text-sm text-stone-800 space-y-2 list-disc list-inside marker:text-rose-300 font-medium">
                    <li>Mai miscelare acidi e retinolo.</li>
                    <li>SPF 50+ ogni mattina, senza scuse.</li>
                    <li>Ascolta la tua pelle: se brucia, fai una pausa.</li>
                </ul>
             </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-stone-600 text-center px-4 leading-relaxed opacity-80 backdrop-blur-sm rounded-lg py-2 bg-white/10">
            Questa applicazione è una guida di lifestyle e non sostituisce il parere medico.
        </p>

      </div>
    </div>
  );
};

export default InfoView;