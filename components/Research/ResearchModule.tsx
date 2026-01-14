
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { GoogleGenAI, Type } from "@google/genai";
import LeadProfileForm from './LeadProfileForm.tsx';
import RejestrIoPanel from './RejestrIoPanel.tsx';

const ResearchModule: React.FC = () => {
  const { research, setResearch, updateProfile, currentUser } = useSalesStore();
  const [activeTab, setActiveTab] = useState<'profil' | 'finanse' | 'ai'>('profil');

  const handleSearch = async () => {
    if (!research.searchQuery) return;
    setResearch({ searchStatus: 'PROCESSING' });
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Jesteś analitykiem biznesowym. Przeprowadź research firmy na podstawie zapytania: "${research.searchQuery}".
      Zwróć dane w formacie JSON (bez Markdown).
      Struktura JSON:
      {
        "nazwa": "Pełna nazwa firmy",
        "nip": "NIP",
        "www": "domena.pl",
        "branza": "Główna branża",
        "opis": "Krótki opis działalności",
        "decydent": "Imię i Nazwisko kluczowej osoby",
        "stanowisko": "Rola decydenta",
        "tech": "Używane technologie (ERP, CRM, Produkcja)"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nazwa: { type: Type.STRING },
              nip: { type: Type.STRING },
              www: { type: Type.STRING },
              branza: { type: Type.STRING },
              opis: { type: Type.STRING },
              decydent: { type: Type.STRING },
              stanowisko: { type: Type.STRING },
              tech: { type: Type.STRING },
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      updateProfile({
        companyName: data.nazwa,
        nip: data.nip,
        domain: data.www,
        industry: data.branza,
        description: data.opis,
        decisionMakerName: data.decydent,
        decisionMakerRole: data.stanowisko,
        techStack: data.tech
      });
      
      // Mock Rejestr.io data after AI search
      setResearch({ 
        searchStatus: 'COMPLETED',
        rejestrData: {
          orgId: '123',
          basic: { name: data.nazwa, krs: '0000123456', nip: data.nip, regon: '123456789', address: 'ul. Fabryczna 1, Warszawa', website: data.www },
          representation: [{ name: data.decydent, role: data.stanowisko }],
          finances: [
            { year: '2023', revenue: 15000000, profit: 1200000 },
            { year: '2022', revenue: 12500000, profit: 800000 },
            { year: '2021', revenue: 10000000, profit: 500000 }
          ],
          condition: { rating: 'DOBRA', reasons: ['Stały wzrost przychodów', 'Dodatni wynik finansowy', 'Brak zaległości'] }
        }
      });

    } catch (err) {
      console.error(err);
      setResearch({ searchStatus: 'ERROR' });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      {/* Search Header */}
      <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <i className="fas fa-search absolute right-[-20px] bottom-[-20px] text-[15rem] opacity-5 -rotate-12"></i>
        <div className="relative z-10 space-y-8">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                 <i className="fas fa-brain text-xl"></i>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight leading-none">Research Intelligence</h2>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mt-1">AI-Powered Sales Discovery</p>
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
             <p className="text-slate-500 max-w-xl mx-auto">Kliknij "Uruchom Research", aby AI dokonało głębokiej analizy strategicznej firmy, jej otoczenia rynkowego i wyzwań produkcyjnych.</p>
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
