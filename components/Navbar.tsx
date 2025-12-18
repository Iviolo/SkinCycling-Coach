
import React from 'react';
// Fix: Use MessageCircle instead of non-existent MessageCircleSparkles
import { Calendar, Droplet, Info, LayoutDashboard, MessageCircle } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: 'today', label: 'Oggi', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'chat', label: 'Skin AI', icon: MessageCircle },
    { id: 'products', label: 'Prodotti', icon: Droplet },
    { id: 'info', label: 'Info', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/40 pb-safe pt-2 px-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl bg-gradient-to-b from-[#f5ebe0] to-[#e6d5cc]">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 space-y-1 transition-all duration-300 group`}
            >
              <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                 <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 1.5} 
                    className={`transition-colors duration-300 drop-shadow-sm ${
                        isActive ? 'text-rose-600 fill-rose-600/10' : 'text-stone-500'
                    }`} 
                 />
                 {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full animate-fade-in" />
                 )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'text-stone-800' : 'text-stone-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
