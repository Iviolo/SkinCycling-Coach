
import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TodayView from './views/TodayView';
import CalendarView from './views/CalendarView';
import ProductsView from './views/ProductsView';
import InfoView from './views/InfoView';
import SettingsView from './views/SettingsView';
import ChatView from './views/ChatView';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('today');
  // Sub-navigation state for views that need to overlay the main tabs
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'settings'>('none');

  const handleOpenSettings = () => setActiveOverlay('settings');
  const handleCloseSettings = () => setActiveOverlay('none');

  const renderView = () => {
    switch (currentTab) {
      case 'today':
        return <TodayView onOpenSettings={handleOpenSettings} />;
      case 'calendar':
        return <CalendarView />;
      case 'chat':
        return <ChatView />;
      case 'products':
        return <ProductsView />;
      case 'info':
        return <InfoView />;
      default:
        return <TodayView onOpenSettings={handleOpenSettings} />;
    }
  };

  return (
    <>
      {/* GLOBAL BACKGROUND 
          Fixed position ensures it never scrolls. 
          z-index -1 ensures it stays behind all content.
      */}
      <div 
        className="fixed inset-0 z-[-1] bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: "url('https://i.pinimg.com/736x/bb/13/99/bb13992b3fe41f8ea010c02fec133987.jpg')",
          width: '100vw',
          height: '100vh'
        }}
      />
      
      {/* Content Wrapper */}
      <div className="min-h-screen text-stone-700 antialiased selection:bg-rose-100 relative z-0">
        {activeOverlay === 'settings' ? (
          <SettingsView onBack={handleCloseSettings} />
        ) : (
          <>
            <main className="h-full pb-20 overflow-x-hidden">
              {renderView()}
            </main>
            <Navbar currentTab={currentTab} setTab={setCurrentTab} />
          </>
        )}
      </div>
    </>
  );
};

export default App;
