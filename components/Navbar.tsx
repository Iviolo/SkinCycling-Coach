import React from 'react';
import { Calendar, Droplet, Info, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: 'today', label: 'Oggi', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'products', label: 'Prodotti', icon: Droplet },
    { id: 'info', label: 'Info', icon: Info },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/40 pb-safe pt-2 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl bg-gradient-to-b from-[#f5ebe0] to-[#e6d5cc]">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 space-y-1.5 transition-all duration-300 group`}
            >
              <div className={`relative transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                 <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2 : 1.5} 
                    className={`transition-colors duration-300 drop-shadow-sm ${
                        isActive ? 'text-stone-800 fill-stone-800/10' : 'text-stone-500'
                    }`} 
                 />
                 {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-stone-800 rounded-full animate-fade-in" />
                 )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
