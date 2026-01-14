
import React, { useEffect } from 'react';
import { useSalesStore } from './store.ts';
import { AppTab } from './types.ts';
import ROICalculator from './components/ROICalculator.tsx';
import LicenseConfigurator from './components/LicenseConfigurator.tsx';
import ScopeOfWork from './components/ScopeOfWork.tsx';
import ResearchModule from './components/Research/ResearchModule.tsx'; // Import ResearchModule
import LineItemsManager from './components/LineItemsManager.tsx';
import HubSpotSync from './components/HubSpotSync.tsx';
import SummaryAggregator from './components/SummaryAggregator.tsx';
import LoginScreen from './components/Auth/LoginScreen.tsx';
import UserProfile from './components/Auth/UserProfile.tsx';
import Dictionaries from './components/Dictionaries.tsx';
import SettingsPanel from './components/Admin/SettingsPanel.tsx';
import AuditLogs from './components/Admin/AuditLogs.tsx';

const App: React.FC = () => {
  const { activeTab, setActiveTab, calculateROI, isAuthenticated, currentUser } = useSalesStore();

  useEffect(() => {
    calculateROI();
  }, []);

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Optimakers</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sales Suite</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-1">
              <NavButton active={activeTab === AppTab.ROI} onClick={() => setActiveTab(AppTab.ROI)} label="ROI" icon="fa-calculator" />
              <NavButton active={activeTab === AppTab.CONFIG} onClick={() => setActiveTab(AppTab.CONFIG)} label="Oferta" icon="fa-box-open" />
              <NavButton active={activeTab === AppTab.SCOPE} onClick={() => setActiveTab(AppTab.SCOPE)} label="SOW" icon="fa-shield-halved" />
              <NavButton active={activeTab === AppTab.RESEARCH} onClick={() => setActiveTab(AppTab.RESEARCH)} label="Research" icon="fa-brain" />
              <NavButton active={activeTab === AppTab.LINE_ITEMS} onClick={() => setActiveTab(AppTab.LINE_ITEMS)} label="Items" icon="fa-list-check" />
              <NavButton active={activeTab === AppTab.SYNC} onClick={() => setActiveTab(AppTab.SYNC)} label="Sync" icon="fa-sync" />
              <NavButton active={activeTab === AppTab.SETTINGS} onClick={() => setActiveTab(AppTab.SETTINGS)} label="Ustawienia" icon="fa-gear" />
            </nav>

            <button onClick={() => setActiveTab(AppTab.PROFILE)} className="flex items-center space-x-3 p-1.5 pl-4 rounded-2xl hover:bg-slate-50 transition-all">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                  {currentUser?.firstName[0]}
               </div>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in fade-in duration-500">
        {activeTab === AppTab.ROI && <ROICalculator />}
        {activeTab === AppTab.CONFIG && <LicenseConfigurator />}
        {activeTab === AppTab.SCOPE && <ScopeOfWork />}
        {activeTab === AppTab.RESEARCH && <ResearchModule />}
        {activeTab === AppTab.LINE_ITEMS && <LineItemsManager />}
        {activeTab === AppTab.SYNC && <HubSpotSync />}
        {activeTab === AppTab.SUMMARY && <SummaryAggregator />}
        {activeTab === AppTab.DICTIONARIES && <Dictionaries />}
        {activeTab === AppTab.SETTINGS && <SettingsPanel />}
        {activeTab === AppTab.PROFILE && <UserProfile />}
        {activeTab === AppTab.LOGS && <AuditLogs />}
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'}`}>
    <i className={`fas ${icon} ${active ? 'opacity-100' : 'opacity-40'}`}></i>
    <span className="hidden xl:inline">{label}</span>
  </button>
);

export default App;
