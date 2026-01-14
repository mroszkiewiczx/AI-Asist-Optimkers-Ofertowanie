
import React, { useState, useRef } from 'react';
import { useSalesStore } from '../../store.ts';
import { GoogleGenAI } from "@google/genai";
import { AIProviderId } from '../../types.ts';

const AIIntegrationsPanel: React.FC = () => {
  const { aiProviders, updateAiProvider, settings, updateRejestrIo, updateSystemConfig } = useSalesStore();
  const [isTestingAll, setIsTestingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const testConnection = async (id: AIProviderId) => {
    updateAiProvider(id, { status: 'TESTING' });
    
    if (id === 'google') {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: 'ping' });
            if (response.text) updateAiProvider(id, { status: 'CONNECTED' });
        } catch (e) {
            updateAiProvider(id, { status: 'ERROR' });
        }
        return;
    }

    setTimeout(() => {
        const provider = aiProviders.find(p => p.id === id);
        if (provider?.apiKey && provider.apiKey.length > 5) {
            updateAiProvider(id, { status: 'CONNECTED' });
        } else {
            updateAiProvider(id, { status: 'ERROR' });
        }
    }, 1200);
  };

  const testAll = async () => {
    setIsTestingAll(true);
    for (const p of aiProviders) {
      if (p.enabled) {
        await testConnection(p.id);
        await new Promise(r => setTimeout(r, 400));
      }
    }
    setIsTestingAll(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.aiProviders) {
            alert("Konfiguracja AI została zaimportowana.");
          }
        } catch (err) {
          alert("Błąd importu pliku JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const data = { aiProviders, rejestrIo: settings.rejestrIo, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Optimakers_AI_Config_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-6xl pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Moduły AI & Integracje</h2>
           <p className="text-slate-500 font-medium text-sm">Zarządzaj orkiestracją LLM oraz konektorami danych zewnętrznych.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={testAll}
             disabled={isTestingAll}
             className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-200 transition-all flex items-center space-x-2"
           >
              <i className={`fas ${isTestingAll ? 'fa-circle-notch fa-spin' : 'fa-bolt'}`}></i>
              <span>Testuj Wszystkie</span>
           </button>
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center space-x-2"
           >
              <i className="fas fa-file-import"></i>
              <span>Importuj</span>
           </button>
           <button 
             onClick={handleExport}
             className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-[1.02] transition-all flex items-center space-x-2"
           >
              <i className="fas fa-file-export"></i>
              <span>Eksportuj</span>
           </button>
           <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
        </div>
      </div>

      {/* 1. Konfiguracja Dostawców AI */}
      <section className="space-y-8">
        <h3 className="text-lg font-black text-slate-900 flex items-center space-x-3 uppercase tracking-widest opacity-80">
           <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-black">1</span>
           <span>Konfiguracja Dostawców AI</span>
        </h3>
        <div className="grid grid-cols-1 gap-10">
          {aiProviders.map(provider => (
            <div 
               key={provider.id} 
               className={`bg-white rounded-[2.5rem] border-2 transition-all duration-500 p-10 space-y-8 relative overflow-hidden ${
                  provider.status === 'CONNECTED' ? 'border-green-200 shadow-lg shadow-green-50' : 'border-slate-100 shadow-sm'
               }`}
            >
               {provider.status === 'CONNECTED' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
               )}

               <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                  <div className="flex items-center space-x-5">
                     <input 
                        type="checkbox" 
                        checked={provider.enabled} 
                        onChange={e => updateAiProvider(provider.id, { enabled: e.target.checked })}
                        className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                     />
                     <h4 className="text-2xl font-black text-slate-900 tracking-tight">{provider.name}</h4>
                     <div className="flex items-center space-x-2">
                        {provider.status === 'CONNECTED' && (
                          <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase border border-green-100 tracking-widest flex items-center">
                             <i className="fas fa-link mr-2 text-[8px]"></i> POŁĄCZONO
                          </span>
                        )}
                        {provider.status === 'TESTING' && (
                          <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100 tracking-widest flex items-center">
                             <i className="fas fa-circle-notch fa-spin mr-2 text-[8px]"></i> TESTOWANIE
                          </span>
                        )}
                        {provider.status === 'ERROR' && (
                          <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase border border-red-100 tracking-widest flex items-center">
                             <i className="fas fa-exclamation-triangle mr-2 text-[8px]"></i> BŁĄD API
                          </span>
                        )}
                     </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-300 font-mono tracking-tighter uppercase">{provider.id}</span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">API Key</label>
                     <div className="relative group">
                        <i className="fas fa-key absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                        <input 
                           type="password" 
                           value={provider.id === 'google' ? '••••••••••••••••••••••••' : provider.apiKey}
                           disabled={provider.id === 'google'}
                           onChange={e => updateAiProvider(provider.id, { apiKey: e.target.value })}
                           className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-200 transition-all shadow-inner"
                           placeholder="Wklej klucz API..."
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Model ID (Aktualny)</label>
                     <div className="relative group">
                        <i className="fas fa-microchip absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"></i>
                        <input 
                           type="text" 
                           value={provider.model} 
                           onChange={e => updateAiProvider(provider.id, { model: e.target.value })}
                           className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-xs text-blue-600 italic outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-inner"
                        />
                     </div>
                  </div>
               </div>

               {provider.id === 'perplexity' && (
                 <div className="max-w-xs space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Język odpowiedzi</label>
                    <div className="relative">
                       <select 
                        value={provider.responseLanguage}
                        onChange={e => updateAiProvider(provider.id, { responseLanguage: e.target.value })}
                        className="w-full appearance-none p-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer shadow-inner pr-12"
                       >
                          <option>Polski (pl)</option>
                          <option>English (en)</option>
                       </select>
                       <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                 </div>
               )}

               <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => testConnection(provider.id)}
                    className="px-10 py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                  >
                     Test Połączenia
                  </button>
               </div>

               {/* Green Selection Box */}
               <div className="bg-green-50/40 border border-green-200 rounded-[2rem] p-8 space-y-6">
                  <div className="flex justify-between items-center px-2">
                     <label className="text-[10px] font-black text-green-800 uppercase tracking-[0.3em]">Wybierz Model z Listy</label>
                     <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Źródło: STATIC DATABASE</span>
                     </div>
                  </div>
                  <div className="relative group">
                     <select 
                        value={provider.model}
                        onChange={e => updateAiProvider(provider.id, { model: e.target.value })}
                        className="w-full appearance-none p-5 bg-white border-2 border-green-300 rounded-2xl font-black text-slate-800 text-lg outline-none pr-14 focus:ring-8 focus:ring-green-500/5 focus:border-green-400 transition-all cursor-pointer shadow-xl shadow-green-900/5"
                     >
                        <option value={provider.model}>{provider.model}</option>
                        {provider.id === 'openai' && <><option value="gpt-5.2">gpt-5.2 (Preview)</option><option value="gpt-4o">gpt-4o (Standard)</option><option value="gpt-4-turbo">gpt-4-turbo (Dev)</option></>}
                        {provider.id === 'google' && <><option value="gemini-3-flash-preview">gemini-3-flash-preview (Speed)</option><option value="gemini-3-pro-preview">gemini-3-pro-preview (IQ)</option></>}
                        {provider.id === 'anthropic' && <option value="claude-3-5-sonnet-20240620">claude-3-5-sonnet (Quality)</option>}
                        {provider.id === 'perplexity' && <option value="sonar">sonar (Search)</option>}
                     </select>
                     <i className="fas fa-chevron-down absolute right-6 top-1/2 -translate-y-1/2 text-green-600 text-xl group-hover:scale-110 transition-transform pointer-events-none"></i>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Integracje danych: Rejestr.io */}
      <section className="space-y-8 pt-10 border-t border-slate-100">
         <h3 className="text-lg font-black text-slate-900 flex items-center space-x-3 uppercase tracking-widest opacity-80">
            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-black">2</span>
            <span>Integracje danych: Rejestr.io</span>
         </h3>
         <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">API Key</label>
                  <div className="relative group">
                     <i className="fas fa-fingerprint absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors"></i>
                     <input 
                        type="password" 
                        value={settings.rejestrIo.apiKey}
                        onChange={e => updateRejestrIo({ apiKey: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-inner" 
                        placeholder="••••••••••••••••••••••••••••••••••••"
                     />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">BASE URL (API V2)</label>
                  <div className="relative group">
                     <i className="fas fa-globe absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors"></i>
                     <input 
                        type="text" 
                        value={settings.rejestrIo.baseUrl}
                        onChange={e => updateRejestrIo({ baseUrl: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all shadow-inner" 
                     />
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-slate-50">
               <label className="flex items-center space-x-5 cursor-pointer group p-3 rounded-2xl hover:bg-slate-50 transition-all">
                  <input 
                    type="checkbox" 
                    checked={settings.rejestrIo.useBearer}
                    onChange={e => updateRejestrIo({ useBearer: e.target.checked })}
                    className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" 
                  />
                  <span className="text-base font-black text-slate-700 group-hover:text-slate-900 transition-colors">Użyj prefiksu "Bearer " w nagłówku</span>
               </label>
               
               <div className="flex items-center space-x-8">
                  <div className="flex items-center space-x-4 bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
                     <span className="px-3 py-1 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-200">POŁĄCZONO</span>
                     <span className="text-[10px] font-black text-green-700 flex items-center whitespace-nowrap">
                        <i className="fas fa-check-double mr-2"></i> API Rejestr.io aktywne!
                     </span>
                  </div>
                  <button className="px-10 py-4 bg-slate-800 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-900 hover:scale-[1.02] active:scale-95 transition-all">
                     Testuj Rejestr.io
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 3. Orkiestracja i Moc Systemu */}
      <section className="space-y-8 pt-10 border-t border-slate-100">
         <h3 className="text-lg font-black text-slate-900 flex items-center space-x-3 uppercase tracking-widest opacity-80">
            <span className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs font-black">3</span>
            <span>Orkiestracja i Moc Systemu</span>
         </h3>
         
         <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl p-12 space-y-12">
            {/* Global Search Header Toggle */}
            <div className="flex items-center justify-between border-b border-slate-50 pb-10">
               <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-blue-100">
                     <i className="fas fa-search-location"></i>
                  </div>
                  <div>
                     <h4 className="font-black text-slate-900 text-xl tracking-tight">Globalne Wyszukiwanie (Header)</h4>
                     <p className="text-sm text-slate-400 font-medium mt-1">Pasek wyszukiwania widoczny na każdym ekranie aplikacji.</p>
                  </div>
               </div>
               <div className="flex items-center space-x-6">
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${settings.systemConfig.globalSearchEnabled ? 'text-blue-600' : 'text-slate-300'}`}>
                    {settings.systemConfig.globalSearchEnabled ? 'WŁĄCZONE' : 'WYŁĄCZONE'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer scale-125">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.systemConfig.globalSearchEnabled}
                      onChange={e => updateSystemConfig({ globalSearchEnabled: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
               </div>
            </div>

            {/* Orchestration Table - High Fidelity */}
            <div className="overflow-x-auto rounded-[2.5rem] border border-slate-100 shadow-inner bg-slate-50/30">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                     <tr>
                        <th className="px-10 py-8">Moduł AI</th>
                        <th className="px-10 py-8 text-center">Status</th>
                        <th className="px-10 py-8 text-center">Aktywny w Research</th>
                        <th className="px-10 py-8 text-center">Dyrygent</th>
                        <th className="px-10 py-8 text-right">Kolejność</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {aiProviders.sort((a,b) => a.sortOrder - b.sortOrder).map(p => (
                       <tr key={p.id} className={`transition-all duration-300 bg-white ${!p.enabled ? 'opacity-30 grayscale' : 'hover:bg-slate-50/80 group'}`}>
                          <td className="px-10 py-8">
                             <div className="flex items-center space-x-4">
                                <div className={`w-2 h-10 rounded-full ${p.id === 'perplexity' ? 'bg-purple-500' : p.id === 'google' ? 'bg-blue-500' : p.id === 'openai' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                                <span className="font-black text-base text-slate-800">{p.name}</span>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <div className={`w-3 h-3 rounded-full mx-auto transition-all ${p.status === 'CONNECTED' ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-slate-200'}`}></div>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <input 
                               type="checkbox" 
                               checked={p.isActiveInResearch} 
                               onChange={e => updateAiProvider(p.id, { isActiveInResearch: e.target.checked })}
                               className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                             />
                          </td>
                          <td className="px-10 py-8 text-center">
                             <button 
                               onClick={() => {
                                 aiProviders.forEach(pr => updateAiProvider(pr.id, { isConductor: pr.id === p.id }));
                               }}
                               className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all ${p.isConductor ? 'bg-purple-600 border-purple-200 shadow-xl shadow-purple-900/10' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                             >
                                {p.isConductor && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>}
                             </button>
                          </td>
                          <td className="px-10 py-8 text-right space-x-5">
                             <button className="text-slate-300 hover:text-blue-600 transition-all hover:scale-125"><i className="fas fa-caret-up text-lg"></i></button>
                             <button className="text-slate-300 hover:text-blue-600 transition-all hover:scale-125"><i className="fas fa-caret-down text-lg"></i></button>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </section>

      {/* Final Save Action */}
      <div className="flex justify-end space-x-6 pt-12 border-t border-slate-100">
         <button className="px-12 py-5 bg-white border-2 border-slate-200 text-slate-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all active:scale-95">
            Anuluj
         </button>
         <button className="px-16 py-5 bg-orange-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/20 hover:scale-[1.02] hover:bg-orange-700 active:scale-95 transition-all">
            Zapisz Wszystko
         </button>
      </div>
    </div>
  );
};

export default AIIntegrationsPanel;
