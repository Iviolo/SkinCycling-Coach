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
    <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-stone-100 pb-safe pt-2 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-50 rounded-t-3xl">
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
                    strokeWidth={1.5} 
                    className={`transition-colors duration-300 ${
                        isActive ? 'text-rose-400 fill-rose-50' : 'text-stone-400'
                    }`} 
                 />
                 {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-400 rounded-full animate-fade-in" />
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