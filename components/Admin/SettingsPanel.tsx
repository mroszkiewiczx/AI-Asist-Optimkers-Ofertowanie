
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import UserManagement from './UserManagement.tsx';
import EmailSettings from './EmailSettings.tsx';
import IntegrationSettings from './IntegrationSettings.tsx';
import SSOTManager from './SSOTManager.tsx';
import AIEnrichmentEditor from './AIEnrichmentEditor.tsx';
import GeneralSettings from './GeneralSettings.tsx';
import SystemConfig from './SystemConfig.tsx';
import AIIntegrationsPanel from './AIIntegrationsPanel.tsx'; // Nowy komponent

const SettingsPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'system' | 'users' | 'email' | 'zapier' | 'hubspot' | 'ssot' | 'enrichment' | 'ai_modules'>('general');
  const { settings, currentUser } = useSalesStore();

  const isAdmin = currentUser?.permissions.includes('ADMIN_SETTINGS');

  const tabs = [
    { id: 'general', label: 'Ustawienia Główne', icon: 'fa-user-circle' },
    { id: 'system', label: 'Konfiguracja Systemowa', icon: 'fa-sliders', adminOnly: true },
    { id: 'ai_modules', label: 'Moduły AI & Integracje', icon: 'fa-brain', adminOnly: true }, // Nowa pozycja
    { id: 'users', label: '8.1 Użytkownicy i uprawnienia', icon: 'fa-users' },
    { id: 'email', label: '8.2 Konfiguracja e-mail', icon: 'fa-envelope' },
    { id: 'zapier', label: '8.3 Konfiguracja Zapier', icon: 'fa-bolt' },
    { id: 'hubspot', label: '8.4 Konfiguracja HubSpot API', icon: 'fa-plug' },
    { id: 'ssot', label: '8.5 Baza danych / SSOT', icon: 'fa-database' },
    { id: 'enrichment', label: '8.6 Edytor Promptów AI', icon: 'fa-robot' },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[850px]">
      <aside className="w-full lg:w-80 bg-slate-50 border-r border-slate-100 p-10 flex flex-col">
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Panel Sterowania</h2>
          <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">Sales Suite Configuration</p>
        </div>

        <nav className="flex-1 space-y-2">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] text-xs font-black transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                  : 'text-slate-500 hover:bg-white hover:shadow-sm'
              }`}
            >
              <i className={`fas ${tab.icon} w-6 text-center text-sm ${activeSubTab === tab.id ? 'opacity-100' : 'opacity-40'}`}></i>
              <span className="text-left">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Wersja Systemu</span>
            <span className="text-slate-900">v{settings.version || '1.0.0'}</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 p-10 lg:p-16 overflow-y-auto bg-white">
        {activeSubTab === 'general' && <GeneralSettings />}
        {activeSubTab === 'system' && <SystemConfig />}
        {activeSubTab === 'ai_modules' && <AIIntegrationsPanel />}
        {activeSubTab === 'users' && <UserManagement />}
        {activeSubTab === 'email' && <EmailSettings />}
        {activeSubTab === 'zapier' && <IntegrationSettings type="zapier" />}
        {activeSubTab === 'hubspot' && <IntegrationSettings type="hubspot" />}
        {activeSubTab === 'ssot' && <SSOTManager />}
        {activeSubTab === 'enrichment' && <AIEnrichmentEditor />}
      </div>
    </div>
  );
};

export default SettingsPanel;
