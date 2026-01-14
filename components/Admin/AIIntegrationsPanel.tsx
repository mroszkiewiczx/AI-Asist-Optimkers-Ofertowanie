
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { GoogleGenAI } from "@google/genai";
// Fix: Added missing AIProviderConfig import
import { AIProviderId, AIProviderConfig } from '../../types.ts';

const AIIntegrationsPanel: React.FC = () => {
  const { aiProviders, updateAiProvider, chatSession, setChatSession } = useSalesStore();
  const [viewMode, setViewMode] = useState<'config' | 'chat'>('config');
  const [chatLayout, setChatLayout] = useState<'wall' | 'grid'>('grid');

  const testConnection = async (id: AIProviderId) => {
    updateAiProvider(id, { status: 'TESTING' });
    
    // Gemini logic (standard)
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

    // Mock for other providers (since we need their SDKs/Proxy)
    setTimeout(() => {
        const provider = aiProviders.find(p => p.id === id);
        if (provider?.apiKey && provider.apiKey.length > 5) {
            updateAiProvider(id, { status: 'CONNECTED' });
        } else {
            updateAiProvider(id, { status: 'ERROR' });
        }
    }, 1500);
  };

  const handleMultiChat = async () => {
    if (!chatSession.query) return;
    setChatSession({ isStreaming: true, responses: {} });

    const activeProviders = aiProviders.filter(p => p.enabled && p.status === 'CONNECTED');
    
    const promises = activeProviders.map(async (provider) => {
      const startTime = Date.now();
      try {
        let text = "";
        if (provider.id === 'google') {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const res = await ai.models.generateContent({ model: provider.model, contents: chatSession.query });
            text = res.text || "No response content.";
        } else {
            // Mock other providers responses
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
            text = `[MOCK RESPONSE FROM ${provider.name}]\nOtrzymałem zapytanie: "${chatSession.query}". Jako model ${provider.model}, sugeruję skupienie się na optymalizacji procesów produkcyjnych i wdrożeniu modułu APS w celu redukcji marnotrawstwa czasu o ok. 15-20%.`;
        }
        
        const latency = Date.now() - startTime;
        setChatSession({ 
            responses: { 
                ...useSalesStore.getState().chatSession.responses, 
                [provider.id]: { text, latency, status: 'success' } 
            } 
        });
      } catch (e) {
        setChatSession({ 
            responses: { 
                ...useSalesStore.getState().chatSession.responses, 
                [provider.id]: { text: 'Connection failed or API Error', latency: 0, status: 'error' } 
            } 
        });
      }
    });

    await Promise.all(promises);
    setChatSession({ isStreaming: false });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Orchestration Engine</h3>
          <p className="text-slate-500 font-medium mt-1">Zarządzaj modelami językowymi i testuj orkiestrację Multi-AI.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
           <button 
             onClick={() => setViewMode('config')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'config' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Konfiguracja Modułów
           </button>
           <button 
             onClick={() => setViewMode('chat')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Multi-AI Playground
           </button>
        </div>
      </div>

      {viewMode === 'config' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {aiProviders.map(provider => (
             <div key={provider.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 group hover:border-blue-200 transition-all">
                <div className="flex justify-between items-start">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${provider.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <i className={`fab ${getProviderIcon(provider.id)} text-xl`}></i>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={provider.enabled} 
                        onChange={e => updateAiProvider(provider.id, { enabled: e.target.checked })} 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                   </label>
                </div>
                
                <div>
                   <h4 className="text-xl font-black text-slate-900 leading-none">{provider.name}</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{provider.model}</p>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">API KEY</label>
                      <input 
                        type="password" 
                        value={provider.id === 'google' ? '• System Managed •' : provider.apiKey}
                        disabled={provider.id === 'google'}
                        onChange={e => updateAiProvider(provider.id, { apiKey: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[10px] outline-none"
                        placeholder="sk-..."
                      />
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                         <div className={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`}></div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{provider.status}</span>
                      </div>
                      <button 
                        onClick={() => testConnection(provider.id)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                      >
                         Test Connection
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
           {/* Chat UI */}
           <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl space-y-10 relative overflow-hidden min-h-[600px] flex flex-col">
              <i className="fas fa-microchip absolute right-[-20px] top-[-20px] text-[15rem] opacity-5 -rotate-12"></i>
              
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-terminal"></i></div>
                    <h4 className="text-xl font-black uppercase tracking-widest">AI Lab Sessions</h4>
                 </div>
                 <div className="flex bg-white/10 p-1 rounded-xl">
                    <button onClick={() => setChatLayout('wall')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${chatLayout === 'wall' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40'}`}>Wall of Text</button>
                    <button onClick={() => setChatLayout('grid')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${chatLayout === 'grid' ? 'bg-white text-slate-900 shadow-lg' : 'text-white/40'}`}>Comparison Grid</button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-4 relative z-10">
                 {chatLayout === 'wall' ? (
                   <div className="p-8 bg-black/40 rounded-[2rem] border border-white/5 space-y-8 font-mono text-sm leading-relaxed">
                      {/* Fix: Added [string, any] type annotation to solve unknown property errors */}
                      {Object.entries(chatSession.responses).map(([pId, res]: [string, any]) => (
                        <div key={pId} className="space-y-4">
                           <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
                              <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase">{pId} OUTPUT</span>
                              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Latency: {res.latency}ms</span>
                           </div>
                           <p className="text-white/80 whitespace-pre-wrap">{res.text}</p>
                        </div>
                      ))}
                      {Object.keys(chatSession.responses).length === 0 && (
                        <p className="text-white/20 text-center py-20 italic">Czekam na zapytanie... System wyśle prompt do wszystkich aktywnych i przetestowanych modułów.</p>
                      )}
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Fix: Added [string, any] type annotation to solve unknown property errors */}
                      {Object.entries(chatSession.responses).map(([pId, res]: [string, any]) => (
                        <div key={pId} className={`p-8 rounded-[2rem] border transition-all h-fit ${res.status === 'error' ? 'bg-red-900/20 border-red-500/30' : 'bg-black/40 border-white/5'}`}>
                           <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center space-x-3">
                                 <i className={`fab ${getProviderIcon(pId as AIProviderId)} text-blue-400`}></i>
                                 <span className="text-[10px] font-black uppercase tracking-widest">{pId}</span>
                              </div>
                              <span className="text-[8px] font-bold text-white/30">{res.latency}ms</span>
                           </div>
                           <p className="text-xs text-white/70 leading-relaxed font-sans whitespace-pre-wrap">{res.text}</p>
                        </div>
                      ))}
                      {chatSession.isStreaming && (
                        <div className="p-12 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center animate-pulse">
                           <i className="fas fa-circle-notch fa-spin text-blue-500 text-3xl mb-4"></i>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40">AI Generowanie...</p>
                        </div>
                      )}
                   </div>
                 )}
              </div>

              <div className="pt-8 border-t border-white/10 relative z-10 flex gap-4">
                 <input 
                   value={chatSession.query}
                   onChange={e => setChatSession({ query: e.target.value })}
                   onKeyPress={e => e.key === 'Enter' && handleMultiChat()}
                   placeholder="Zadaj pytanie wszystkim aktywnym modelom AI naraz..."
                   className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-8 py-5 font-bold text-white outline-none focus:ring-4 focus:ring-blue-500/30 transition-all placeholder:text-white/20"
                 />
                 <button 
                   onClick={handleMultiChat}
                   disabled={chatSession.isStreaming || !chatSession.query}
                   className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all flex items-center space-x-3 disabled:opacity-30"
                 >
                    {chatSession.isStreaming ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                    <span>Wyślij Multi-Prompt</span>
                 </button>
              </div>
           </div>

           <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex items-start space-x-6">
              <i className="fas fa-info-circle text-blue-600 text-2xl mt-1"></i>
              <div className="space-y-2">
                 <h5 className="text-sm font-black text-blue-900 uppercase tracking-widest leading-none">Status Orkiestracji</h5>
                 <p className="text-xs text-blue-700 leading-relaxed">
                   Obecnie podłączonych modułów: <b>{aiProviders.filter(p => p.enabled).length}</b>. 
                   Aktywnych (Connected): <b>{aiProviders.filter(p => p.enabled && p.status === 'CONNECTED').length}</b>. 
                   Multi-AI Playground umożliwia porównywanie jakości odpowiedzi w czasie rzeczywistym przed wdrożeniem ich do modułu Research.
                 </p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const getProviderIcon = (id: AIProviderId) => {
    switch(id) {
        case 'google': return 'fa-google';
        case 'openai': return 'fa-microchip';
        case 'perplexity': return 'fa-search';
        case 'anthropic': return 'fa-robot';
        case 'grok': return 'fa-star';
        default: return 'fa-brain';
    }
};

const getStatusColor = (status: AIProviderConfig['status']) => {
    switch(status) {
        case 'CONNECTED': return 'bg-green-500 shadow-green-500/50 shadow-lg';
        case 'ERROR': return 'bg-red-500';
        case 'TESTING': return 'bg-amber-500 animate-pulse';
        default: return 'bg-slate-300';
    }
};

export default AIIntegrationsPanel;
