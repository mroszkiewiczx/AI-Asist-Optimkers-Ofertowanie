
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { AIPrompt } from '../../types.ts';

const AIEnrichmentEditor: React.FC = () => {
  const { aiPrompts, saveAIPrompt } = useSalesStore();
  const [selectedProvider, setSelectedProvider] = useState<AIPrompt['provider']>('gemini');
  const [isSaving, setIsSaving] = useState(false);

  const currentPrompt = aiPrompts.find(p => p.provider === selectedProvider) || {
    provider: selectedProvider,
    promptText: '',
    version: 1,
    isActive: true,
  } as AIPrompt;

  const providers: { id: AIPrompt['provider']; label: string; icon: string }[] = [
    { id: 'gemini', label: 'Google Gemini', icon: 'fa-google' },
    { id: 'perplexity', label: 'Perplexity AI', icon: 'fa-search' },
    { id: 'openai', label: 'OpenAI (GPT-4)', icon: 'fa-microchip' },
    { id: 'claude', label: 'Claude AI', icon: 'fa-robot' },
    { id: 'grok', label: 'xAI Grok', icon: 'fa-star' },
  ];

  const handleSave = () => {
    setIsSaving(true);
    saveAIPrompt(currentPrompt);
    setTimeout(() => setIsSaving(false), 800);
  };

  const updateText = (text: string) => {
    saveAIPrompt({ ...currentPrompt, promptText: text });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">8.6 Edytor Promptów Wzbogacania (Enrichment)</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Definiuj instrukcje systemowe dla agentów AI wspierających Research.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-5 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100">
            PRZYWRÓĆ WERSJĘ
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center space-x-2"
          >
            {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
            <span>ZAPISZ PROMPTY</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
        {/* Providers Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Wybierz Dostawcę</label>
          {providers.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProvider(p.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedProvider === p.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                 <i className={`fab ${p.icon} w-4`}></i>
                 <span>{p.label}</span>
              </div>
              {aiPrompts.find(pr => pr.provider === p.id) && <i className="fas fa-check-circle text-[10px] opacity-60"></i>}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="flex-1 space-y-6">
           <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col h-full shadow-sm">
              <div className="bg-slate-900 px-8 py-5 flex justify-between items-center text-white">
                 <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Content Editor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedProvider} - SYSTEM PROMPT</span>
                 </div>
                 <div className="text-[10px] font-black opacity-40 uppercase">v{currentPrompt.version} • Ostatnia aktualizacja: {new Date(currentPrompt.lastUpdated || Date.now()).toLocaleDateString()}</div>
              </div>
              
              <div className="flex-1 flex flex-col relative">
                <textarea
                  value={currentPrompt.promptText}
                  onChange={(e) => updateText(e.target.value)}
                  className="w-full h-full p-10 font-mono text-xs text-slate-700 leading-relaxed outline-none bg-slate-50/30 min-h-[500px]"
                  placeholder="Wpisz tutaj treść promptu systemowego..."
                />
                
                <div className="absolute bottom-6 right-6 flex items-center space-x-2">
                   <button className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 shadow-sm transition-all">
                      PODGLĄD ZMIENNYCH
                   </button>
                </div>
              </div>
           </div>

           {/* Variable Documentation */}
           <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                 <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-3">Zmienne Systemowe</p>
                 <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                       <code className="bg-white px-2 py-1 rounded text-[10px] font-black text-blue-600">{"{COMPANY}"}</code>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Nazwa Klienta</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       <code className="bg-white px-2 py-1 rounded text-[10px] font-black text-blue-600">{"{MISSING}"}</code>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Lista brakujących pól</span>
                    </div>
                    <div className="flex items-center space-x-3">
                       <code className="bg-white px-2 py-1 rounded text-[10px] font-black text-blue-600">{"{CONTEXT}"}</code>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Pełny JSON (SOW/ROI)</span>
                    </div>
                 </div>
              </div>
              <div className="md:col-span-2">
                 <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-3">Rekomendowany Format Outputu</p>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">
                    Research wymaga ustrukturyzowanego wyniku JSON. Upewnij się, że Twój prompt wymusza schemat zawierający pola: <b>enriched_fields</b>, <b>conflicts</b>, <b>recommendations</b>.
                 </p>
                 <div className="bg-slate-900 rounded-xl p-4 font-mono text-[9px] text-blue-300">
                    {`{ "enriched_fields": [...], "confidence": 0.8, "source": "..." }`}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIEnrichmentEditor;
