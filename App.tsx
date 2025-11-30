
import React, { useState, useEffect } from 'react';
import { ViewState, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import DietPlanner from './components/DietPlanner';
import WorkoutCoach from './components/WorkoutCoach';
import ChatAssistant from './components/ChatAssistant';
import NearbyFinder from './components/NearbyFinder';
import Onboarding from './components/Onboarding';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [showChat, setShowChat] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Check local storage for profile
    const saved = localStorage.getItem('fitcoach_profile');
    if (saved) {
        setUserProfile(JSON.parse(saved));
    }
  }, []);

  const handleProfileComplete = (profile: UserProfile) => {
      setUserProfile(profile);
      localStorage.setItem('fitcoach_profile', JSON.stringify(profile));
      setCurrentView(ViewState.DASHBOARD);
  };

  if (!userProfile) {
      return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 pb-20 md:pb-0 font-sans">
      
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-green-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-white text-lg">F</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">FitCoach <span className="text-blue-400">AI</span></h1>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
           <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className={currentView === ViewState.DASHBOARD ? 'text-white' : 'hover:text-white transition-colors'}>Dashboard</button>
           <button onClick={() => setCurrentView(ViewState.DIET)} className={currentView === ViewState.DIET ? 'text-white' : 'hover:text-white transition-colors'}>Diet Plan</button>
           <button onClick={() => setCurrentView(ViewState.WORKOUT)} className={currentView === ViewState.WORKOUT ? 'text-white' : 'hover:text-white transition-colors'}>Workouts</button>
           <button onClick={() => setCurrentView(ViewState.MAPS)} className={currentView === ViewState.MAPS ? 'text-white' : 'hover:text-white transition-colors'}>Nearby</button>
        </div>
        <button 
            onClick={() => { localStorage.removeItem('fitcoach_profile'); setUserProfile(null); }}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400 hover:border-blue-400 transition-colors"
            title="Sign Out"
        >
           {userProfile.name.charAt(0).toUpperCase()}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
        {currentView === ViewState.DASHBOARD && <Dashboard profile={userProfile} />}
        {currentView === ViewState.DIET && <DietPlanner profile={userProfile} />}
        {currentView === ViewState.WORKOUT && <WorkoutCoach profile={userProfile} />}
        {currentView === ViewState.MAPS && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-150px)]">
             <NearbyFinder />
             <div className="hidden md:block bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center p-8 text-center text-slate-500 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <p>Select a location from the list to view details.</p>
             </div>
          </div>
        )}
      </main>

      {/* Floating Chat Button */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50">
        <button 
          onClick={() => setShowChat(!showChat)}
          className="bg-blue-600 hover:bg-blue-500 text-white w-14 h-14 rounded-full shadow-2xl shadow-blue-900/50 flex items-center justify-center transition-transform hover:scale-105"
        >
          {showChat ? (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          )}
        </button>
      </div>

      {/* Chat Interface Modal/Overlay */}
      {showChat && (
        <div className="fixed bottom-28 md:bottom-24 right-4 md:right-8 w-[90vw] md:w-96 h-[500px] z-40 animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl">
           <ChatAssistant profile={userProfile} />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around py-4 z-40 safe-area-pb">
        <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className={`flex flex-col items-center gap-1 text-xs ${currentView === ViewState.DASHBOARD ? 'text-blue-400' : 'text-slate-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          Home
        </button>
        <button onClick={() => setCurrentView(ViewState.DIET)} className={`flex flex-col items-center gap-1 text-xs ${currentView === ViewState.DIET ? 'text-blue-400' : 'text-slate-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Diet
        </button>
        <button onClick={() => setCurrentView(ViewState.WORKOUT)} className={`flex flex-col items-center gap-1 text-xs ${currentView === ViewState.WORKOUT ? 'text-blue-400' : 'text-slate-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Workout
        </button>
        <button onClick={() => setCurrentView(ViewState.MAPS)} className={`flex flex-col items-center gap-1 text-xs ${currentView === ViewState.MAPS ? 'text-blue-400' : 'text-slate-500'}`}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Nearby
        </button>
      </nav>
    </div>
  );
};

export default App;
