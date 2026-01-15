
import React, { useEffect } from 'react';
import { useSalesStore } from './store.ts';
import { AppTab } from './types.ts';
import ROICalculator from './components/ROICalculator.tsx';
import LicenseConfigurator from './components/LicenseConfigurator.tsx';
import ScopeOfWork from './components/ScopeOfWork.tsx';
import ResearchModule from './components/Research/ResearchModule.tsx'; 
import LineItemsManager from './components/LineItemsManager.tsx';
import HubSpotSync from './components/HubSpotSync.tsx';
import SummaryAggregator from './components/SummaryAggregator.tsx';
import LoginScreen from './components/Auth/LoginScreen.tsx';
import UserProfile from './components/Auth/UserProfile.tsx';
import Dictionaries from './components/Dictionaries.tsx';
import SettingsPanel from './components/Admin/SettingsPanel.tsx';
import AuditLogs from './components/Admin/AuditLogs.tsx';
import AIIntegrationsPanel from './components/Admin/AIIntegrationsPanel.tsx';
import AIChatModule from './components/Chat/AIChatModule.tsx';

const App: React.FC = () => {
  const { activeTab, setActiveTab, calculateROI, isAuthenticated, currentUser } = useSalesStore();

  useEffect(() => {
    calculateROI();
  }, []);

  if (!isAuthenticated) return <LoginScreen />;

  return (
    // MAIN BACKGROUND: Vibrant Deep Blue Gradient
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e3a8a] via-[#0f172a] to-[#020617] flex flex-col font-['Inter'] text-white overflow-x-hidden selection:bg-pink-500 selection:text-white relative">
      
      {/* Decorative Fluid Shapes (Simulating the image 3D elements) */}
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-r from-orange-500 to-pink-600 rounded-full blur-[130px] opacity-20 pointer-events-none"></div>

      {/* GLASS HEADER */}
      <header className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 mt-4">
        <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Subtle sheen on header */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="px-6 h-20 flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF512F] to-[#DD2476] rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                <i className="fas fa-chart-line text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight leading-none mb-0.5">Optimakers</h1>
                <p className="text-[10px] text-cyan-300 font-bold uppercase tracking-[0.2em] drop-shadow-md">Sales Suite</p>
              </div>
            </div>
            
            <nav className="hidden xl:flex items-center space-x-1 bg-black/20 p-1.5 rounded-xl border border-white/5">
              <NavButton active={activeTab === AppTab.ROI} onClick={() => setActiveTab(AppTab.ROI)} label="ROI" icon="fa-calculator" />
              <NavButton active={activeTab === AppTab.CONFIG} onClick={() => setActiveTab(AppTab.CONFIG)} label="Oferta" icon="fa-box-open" />
              <NavButton active={activeTab === AppTab.SCOPE} onClick={() => setActiveTab(AppTab.SCOPE)} label="SOW" icon="fa-shield-halved" />
              <NavButton active={activeTab === AppTab.RESEARCH} onClick={() => setActiveTab(AppTab.RESEARCH)} label="Research" icon="fa-brain" />
              <NavButton active={activeTab === AppTab.CHAT} onClick={() => setActiveTab(AppTab.CHAT)} label="AI Chat" icon="fa-comments" />
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <NavButton active={activeTab === AppTab.LINE_ITEMS} onClick={() => setActiveTab(AppTab.LINE_ITEMS)} label="Items" icon="fa-list-check" />
              <NavButton active={activeTab === AppTab.SYNC} onClick={() => setActiveTab(AppTab.SYNC)} label="Sync" icon="fa-sync" />
              <NavButton active={activeTab === AppTab.SETTINGS} onClick={() => setActiveTab(AppTab.SETTINGS)} label="Ustawienia" icon="fa-gear" />
            </nav>

            <button onClick={() => setActiveTab(AppTab.PROFILE)} className="flex items-center space-x-3 pl-4 group">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{currentUser?.firstName} {currentUser?.lastName}</p>
                  <p className="text-[10px] text-blue-200 font-medium">{currentUser?.position}</p>
               </div>
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold border border-white/20 shadow-sm group-hover:bg-white/20 transition-all backdrop-blur-md">
                  {currentUser?.firstName[0]}
               </div>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full animate-in fade-in duration-500 relative z-10">
        {activeTab === AppTab.ROI && <ROICalculator />}
        {activeTab === AppTab.CONFIG && <LicenseConfigurator />}
        {activeTab === AppTab.SCOPE && <ScopeOfWork />}
        {activeTab === AppTab.RESEARCH && <ResearchModule />}
        {activeTab === AppTab.CHAT && <AIChatModule />}
        {activeTab === AppTab.LINE_ITEMS && <LineItemsManager />}
        {activeTab === AppTab.SYNC && <HubSpotSync />}
        {activeTab === AppTab.SUMMARY && <SummaryAggregator />}
        {activeTab === AppTab.DICTIONARIES && <Dictionaries />}
        {activeTab === AppTab.SETTINGS && <SettingsPanel />}
        {activeTab === AppTab.AI_INTEGRATION && <AIIntegrationsPanel />}
        {activeTab === AppTab.PROFILE && <UserProfile />}
        {activeTab === AppTab.LOGS && <AuditLogs />}
      </main>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
  <button onClick={onClick} className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 ${
    active 
      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
      : 'text-blue-200 hover:text-white hover:bg-white/10'
  }`}>
    <i className={`fas ${icon} ${active ? 'opacity-100' : 'opacity-60'}`}></i>
    <span className="hidden xl:inline">{label}</span>
  </button>
);

export default App;
