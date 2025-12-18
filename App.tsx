import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TodayView from './views/TodayView';
import CalendarView from './views/CalendarView';
import ProductsView from './views/ProductsView';
import InfoView from './views/InfoView';
import SettingsView from './views/SettingsView';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'today' | 'calendar' | 'products' | 'info'>('today');
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'settings'>('none');

  const handleOpenSettings = () => setActiveOverlay('settings');
  const handleCloseSettings = () => setActiveOverlay('none');

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
    <div className="flex flex-col h-screen bg-gradient-to-b from-rose-50 to-white">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>
      {activeOverlay === 'settings' && (
        <SettingsView onClose={handleCloseSettings} />
      )}
    </div>
  );
};

export default App;
