import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Ciao! Sono il tuo Skin Coach AI. Chiedimi della tua routine di skincare!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `Grazie per la tua domanda: "${userMessage}". Questo è un chatbot di skincare virtuale. Puoi fare domande sulla tua routine!` 
      }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 flex items-center gap-2">
        <MessageCircle size={24} />
        <h1 className="text-xl font-bold">Skin AI Coach</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-rose-500 text-white' 
                : 'bg-gray-200 text-gray-900'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-500 text-sm">Sto scrivendo...</div>}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Chiedimi della tua routine..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-rose-500 hover:bg-rose-600 disabled:bg-gray-400 text-white p-2 rounded-lg transition"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatView;
