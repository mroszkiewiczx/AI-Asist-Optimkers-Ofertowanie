
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { AIPrompt } from '../../types.ts';
import { GoogleGenAI } from "@google/genai";

const AIEnrichmentEditor: React.FC = () => {
  const { aiPrompts, saveAIPrompt } = useSalesStore();
  const [selectedProvider, setSelectedProvider] = useState<AIPrompt['provider']>('gemini');
  const [isSaving, setIsSaving] = useState(false);
  
  // Playground State
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleTestRun = async () => {
    if (!testInput) return;
    setIsGenerating(true);
    setTestOutput('');

    try {
        // Use Gemini for simulation regardless of selected provider to save tokens/complexity in this demo
        // In real app, switch based on selectedProvider
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = currentPrompt.promptText;
        const fullPrompt = `${systemInstruction}\n\nUSER INPUT FOR TESTING: ${testInput}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: fullPrompt
        });
        
        setTestOutput(response.text || 'Brak odpowiedzi.');
    } catch (e: any) {
        setTestOutput(`Error: ${e.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
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

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Providers Sidebar */}
        <div className="w-full lg:w-64 space-y-2 shrink-0">
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

        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-6 h-full">
           
           {/* TOP: Prompt Editor (Smaller) */}
           <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm h-[400px]">
              <div className="bg-slate-900 px-8 py-4 flex justify-between items-center text-white shrink-0">
                 <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">System Prompt</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedProvider}</span>
                 </div>
                 <div className="text-[10px] font-black opacity-40 uppercase">v{currentPrompt.version}</div>
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  value={currentPrompt.promptText}
                  onChange={(e) => updateText(e.target.value)}
                  className="w-full h-full p-8 font-mono text-xs text-slate-700 leading-relaxed outline-none bg-slate-50/30 resize-none"
                  placeholder="Wpisz tutaj treść promptu systemowego..."
                />
              </div>
           </div>

           {/* BOTTOM: Test Playground */}
           <div className="flex-1 bg-slate-50 rounded-[2.5rem] border border-slate-200 p-8 flex flex-col gap-6 relative">
              <div className="absolute top-0 right-0 bg-white border-l border-b border-slate-200 px-6 py-2 rounded-bl-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Symulator / Playground
              </div>

              <div className="flex gap-4 items-start">
                 <div className="flex-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Input Testowy (np. nazwa firmy)</label>
                    <input 
                      value={testInput}
                      onChange={e => setTestInput(e.target.value)}
                      placeholder="Wpisz testowe dane wejściowe..."
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                 </div>
                 <button 
                   onClick={handleTestRun}
                   disabled={isGenerating || !testInput}
                   className="mt-6 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                 >
                    {isGenerating ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-play"></i>}
                    <span>Generuj Odpowiedź</span>
                 </button>
              </div>

              <div className="flex-1 bg-slate-900 rounded-2xl p-6 overflow-auto border border-slate-800 shadow-inner relative group">
                 {testOutput ? (
                    <pre className="font-mono text-xs text-green-400 whitespace-pre-wrap">{testOutput}</pre>
                 ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-black uppercase text-[10px] tracking-widest">
                       Oczekiwanie na wynik...
                    </div>
                 )}
                 {testOutput && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(testOutput)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                       <i className="fas fa-copy"></i>
                    </button>
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default AIEnrichmentEditor;
