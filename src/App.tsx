import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TodayView from './views/TodayView';
import CalendarView from './views/CalendarView';
import ProductsView from './views/ProductsView';
import InfoView from './views/InfoView';
import SettingsView from './views/SettingsView';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('today');
  // Sub-navigation state for views that need to overlay the main tabs
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'settings'>('none');

  const handleOpenSettings = () => setActiveOverlay('settings');
  const handleCloseSettings = () => setActiveOverlay('none');

  if (activeOverlay === 'settings') {
    return <SettingsView onBack={handleCloseSettings} />;
  }

  const renderView = () => {
    switch (currentTab) {
      case 'today':
        return <TodayView onOpenSettings={handleOpenSettings} />;
      case 'calendar':
        return <CalendarView />;
      case 'products':
        return <ProductsView />;
      case 'info':
        return <InfoView />;
      default:
        return <TodayView onOpenSettings={handleOpenSettings} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-700 antialiased selection:bg-rose-100">
      <main className="h-full pb-20">
        {renderView()}
      </main>
      <Navbar currentTab={currentTab} setTab={setCurrentTab} />
    </div>
  );
};

export default App;