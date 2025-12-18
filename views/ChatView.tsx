
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { getRoutineSettings, getProducts, getUserName, getLogs, getStartDate } from '../services/storageService';
import { ChatMessage } from '../types';
import { format, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale/it';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Ciao! Sono il tuo Skin Coach AI. Sono aggiornata sulla tua routine e sui tuoi prodotti. Come posso aiutarti oggi?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Fix: Always create a new GoogleGenAI instance right before making an API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Estrazione contesto per l'AI
      const settings = getRoutineSettings();
      const products = getProducts();
      const userName = getUserName();
      const logs = getLogs();
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayLog = logs[todayStr];
      const startDate = getStartDate();
      const daysPassed = differenceInDays(new Date(), new Date(startDate));
      const enabledNights = settings.pmCycle.filter(n => n.isEnabled);
      const cycleIndex = ((daysPassed % enabledNights.length) + enabledNights.length) % enabledNights.length;
      const currentConfig = enabledNights[cycleIndex];

      const systemInstructionText = `
        Sei "Skin Coach AI", un'esperta dermatologa estetica virtuale specializzata nel metodo Skin Cycling di 4 notti.
        
        DATI UTENTE ATTUALI:
        - Nome: ${userName}
        - Notte del Ciclo Oggi: Notte ${cycleIndex + 1} (${currentConfig.title})
        - Prodotti nell'armadietto: ${products.map(p => p.name).join(', ')}
        - Stato pelle oggi: ${todayLog?.skinCondition || 'Non specificato'}
        
        REGOLE:
        1. Sii professionale, gentile e concisa. Usa un tono da "skincare guru".
        2. Se l'utente segnala "Breakout" o "Irritazione", suggerisci di dare priorità al recupero o di consultare un medico se grave.
        3. Consiglia l'uso corretto dei prodotti basandoti sul loro tipo (es. SPF sempre la mattina).
        4. Rispondi in Italiano.
        5. Non dare prescrizioni mediche farmaceutiche, solo consigli cosmetici.
      `;

      // Fix: Use the dedicated systemInstruction field in the config and pass input directly to contents
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: systemInstructionText,
        },
      });

      // Fix: Access response.text as a property, not a method
      const aiText = response.text || "Scusami, ho avuto un piccolo problema tecnico. Puoi ripetere?";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Mmm, sembra che la mia connessione sia un po' irritata. Riprova tra un attimo!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-transparent relative overflow-hidden">
      {/* Header */}
      <div className="p-6 pt-8 bg-white/70 backdrop-blur-xl border-b border-white/40 flex items-center gap-4 sticky top-0 z-20">
         <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
            <Bot size={28} />
         </div>
         <div>
            <h1 className="text-xl font-nunito font-bold text-stone-900 leading-none">Skin Coach AI</h1>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online • Esperta
            </p>
         </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar pb-32">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-rose-500 text-white' : 'bg-white text-stone-600'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} className="text-amber-500" />}
               </div>
               <div className={`p-4 rounded-2xl shadow-sm border ${
                 msg.role === 'user' 
                 ? 'bg-rose-600 text-white border-rose-500 rounded-tr-none' 
                 : 'bg-white/90 backdrop-blur-md text-stone-800 border-white/60 rounded-tl-none'
               }`}>
                  <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
               </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
             <div className="flex gap-3 items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/40">
                <Loader2 size={18} className="text-rose-400 animate-spin" />
                <span className="text-xs font-bold text-stone-500 tracking-wider">L'AI sta analizzando la tua pelle...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 p-4 max-w-md mx-auto z-20">
         <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Chiedimi della tua routine..."
              className="w-full bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-3xl py-4 pl-6 pr-14 text-sm font-medium text-stone-800 outline-none ring-offset-4 focus:ring-2 ring-rose-400/50 transition-all placeholder-stone-400"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all ${
                input.trim() ? 'bg-rose-500 text-white shadow-lg' : 'bg-stone-100 text-stone-300'
              }`}
            >
              <Send size={18} />
            </button>
         </div>
         <p className="text-[9px] text-center text-stone-400 mt-2 font-bold uppercase tracking-widest opacity-60">Powered by Gemini AI Technology</p>
      </div>
    </div>
  );
};

export default ChatView;
