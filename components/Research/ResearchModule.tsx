
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { aiService } from '../../services/aiService.ts';
import { AIProviderId, ResearchProviderResult } from '../../types.ts';
import LeadProfileForm from './LeadProfileForm.tsx';
import RejestrIoPanel from './RejestrIoPanel.tsx';

const ResearchModule: React.FC = () => {
  const { research, setResearch, updateProfile, aiProviders } = useSalesStore();
  const [activeTab, setActiveTab] = useState<'profil' | 'finanse' | 'ai'>('profil');

  // 2. LOGIKA PRZYCISKU "SZUKAJ" (Orkiestracja vs Manual)
  const handleSearch = async () => {
    if (!research.searchQuery) return;
    
    // 1. Wybór Providera (Orkiestracja vs Manual)
    let providerToUse: AIProviderId;
    const conductor = aiProviders.find(p => p.isConductor);
    
    if (research.isOrchestrationEnabled && conductor) {
      providerToUse = conductor.id; // np. 'perplexity' (najlepszy do researchu)
    } else {
      providerToUse = research.selectedManualProvider || 'google';
    }

    const providerName = aiProviders.find(p => p.id === providerToUse)?.name || providerToUse;

    // 2. Ustawienie statusu UI na PROCESSING
    setResearch({ 
        searchStatus: 'PROCESSING', 
        agentStatus: `${providerName}: Skanowanie rejestrów i strony www (Mode: Deep JSON)...` 
    });
    
    try {
      // 3. Pobranie konfiguracji modelu
      const provConfig = aiProviders.find(p => p.id === providerToUse);
      
      // 4. Uruchomienie funkcji z serwisu (runWebResearch)
      // Wymuszamy tryb 'fast' dla demo, ale w realu można by dać 'deep'
      const { raw, json, friendly, sources } = await aiService.runWebResearch(
          research.searchQuery, 
          providerToUse, 
          'fast', 
          provConfig?.model
      );
      
      // 5. Zapisanie wyników i scalenie danych z formularzem (profile)
      const newResult: ResearchProviderResult = {
        providerId: providerToUse,
        timestamp: Date.now(),
        raw,
        json,
        friendly,
        sources
      };

      const updatedResults = { ...research.providerResults, [providerToUse]: newResult };
      
      // Merge profile data
      updateProfile(json);
      
      setResearch({
          searchStatus: 'COMPLETED',
          agentStatus: undefined,
          providerResults: updatedResults,
          // Symulacja danych KRS jeśli znaleziono NIP
          rejestrData: json.nip ? {
            orgId: '123',
            basic: { 
                name: json.companyName || '', 
                krs: json.krs || '', 
                nip: json.nip || '', 
                regon: json.regon || '', 
                address: json.address || '', 
                website: json.domain || '' 
            },
            representation: (json.management || []).map((z: any) => ({ name: z.name, role: z.role })),
            finances: [
                { year: '2023', revenue: 15000000, profit: 1200000 },
                { year: '2022', revenue: 12500000, profit: 800000 },
                { year: '2021', revenue: 10000000, profit: 500000 }
            ],
            condition: { rating: 'DOBRA', reasons: ['Stały wzrost przychodów', 'Dodatni wynik finansowy'] }
          } : null
      });

      // 6. Automatyczne Wzbogacanie (Enrichment) jeśli brakuje kluczowych danych
      if (!json.nip || !json.decisionMakerName) {
         handleSpecificEnrichment('google'); // Fallback do Gemini na enrichment
      }

    } catch (e: any) {
      console.error(e);
      setResearch({ searchStatus: 'ERROR', agentStatus: 'Wystąpił błąd analizy AI.' });
    }
  };

  // 3. KONFIGURACJA WZBOGACANIA DANYCH
  const handleSpecificEnrichment = async (providerId: AIProviderId) => {
      setResearch({ searchStatus: 'PROCESSING', agentStatus: `Enrichment (${providerId}): Uzupełnianie brakujących danych...` });
      
      try {
          const updates = await aiService.runEnrichment(research.profile, providerId);
          
          if (Object.keys(updates).length > 0) {
              updateProfile(updates);
              setResearch({ searchStatus: 'COMPLETED', agentStatus: undefined });
          } else {
              setResearch({ searchStatus: 'COMPLETED', agentStatus: 'Nie znaleziono dodatkowych danych.' });
          }
      } catch (e) {
          setResearch({ searchStatus: 'ERROR', agentStatus: 'Błąd Enrichment' });
      }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      {/* Search Header */}
      <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden transition-all">
        <i className="fas fa-search absolute right-[-20px] bottom-[-20px] text-[15rem] opacity-5 -rotate-12"></i>
        
        <div className="relative z-10 space-y-8">
           <div className="flex justify-between items-start">
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                     <i className="fas fa-brain text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight leading-none">Research Intelligence</h2>
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Multi-Agent System: Perplexity & Gemini</p>
                  </div>
               </div>
               
               {/* Provider Selector */}
               <div className="flex items-center space-x-4 bg-white/10 p-2 rounded-xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest pl-3">Provider:</span>
                  <select 
                    value={research.isOrchestrationEnabled ? 'AUTO' : research.selectedManualProvider}
                    onChange={(e) => {
                        const val = e.target.value;
                        if(val === 'AUTO') {
                            setResearch({ isOrchestrationEnabled: true });
                        } else {
                            setResearch({ isOrchestrationEnabled: false, selectedManualProvider: val as any });
                        }
                    }}
                    className="bg-slate-800 text-white text-xs font-black uppercase rounded-lg px-3 py-2 outline-none border border-white/20 cursor-pointer"
                  >
                     <option value="AUTO">Auto (Orkiestracja)</option>
                     {aiProviders.filter(p => p.enabled).map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                  </select>
               </div>
           </div>

           <div className="flex gap-4 max-w-4xl">
              <input 
                value={research.searchQuery}
                onChange={e => setResearch({ searchQuery: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                placeholder="Wpisz nazwę firmy, domenę lub NIP..."
                className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-8 py-5 font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/30 transition-all placeholder:text-white/30"
              />
              <button 
                onClick={handleSearch}
                disabled={research.searchStatus === 'PROCESSING'}
                className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all flex items-center space-x-3 disabled:opacity-50"
              >
                {research.searchStatus === 'PROCESSING' ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-bolt"></i>}
                <span>Uruchom Research</span>
              </button>
           </div>

           {/* Live Agent Status */}
           {research.searchStatus === 'PROCESSING' && (
             <div className="flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex space-x-1">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-200"></span>
                </div>
                <span className="text-xs font-mono text-green-400 uppercase tracking-widest">
                   {research.agentStatus || "Inicjowanie agentów..."}
                </span>
             </div>
           )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl w-fit mx-auto lg:mx-0">
         <TabButton active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} label="Profil Firmy" icon="fa-address-card" />
         <TabButton active={activeTab === 'finanse'} onClick={() => setActiveTab('finanse')} label="Dane Finansowe" icon="fa-chart-pie" />
         <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Deep Insight" icon="fa-microchip" />
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-10">
        {activeTab === 'profil' && <LeadProfileForm />}
        {activeTab === 'finanse' && <RejestrIoPanel />}
        {activeTab === 'ai' && (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm text-center space-y-6">
             <i className="fas fa-magic text-5xl text-blue-500 opacity-20"></i>
             <h3 className="text-xl font-black text-slate-900">AI Deep Insight Analysis</h3>
             <p className="text-slate-500 max-w-xl mx-auto">
                {research.profile.enrichment?.gemini || research.profile.enrichment?.perplexity ? 
                 "Analiza została wykonana. Sprawdź sekcję profilu pod kątem wzbogaconych danych." :
                 "Kliknij 'Uruchom Research', aby AI dokonało głębokiej analizy strategicznej firmy, jej otoczenia rynkowego i wyzwań produkcyjnych."
                }
             </p>
             <button onClick={() => handleSpecificEnrichment('google')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-200">
                Wymuś Deep Enrichment (Gemini)
             </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Eksportuj Profil (PDF)</button>
          <button 
            onClick={() => useSalesStore.getState().setActiveTab('SYNC' as any)}
            className="px-12 py-5 bg-orange-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 hover:scale-[1.02] transition-all flex items-center space-x-3"
          >
             <span>Strona 5: HubSpot Sync</span>
             <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
  >
    <i className={`fas ${icon} ${active ? 'opacity-100' : 'opacity-40'}`}></i>
    <span>{label}</span>
  </button>
);

export default ResearchModule;
