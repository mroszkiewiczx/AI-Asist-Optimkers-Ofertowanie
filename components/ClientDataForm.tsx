
import React, { useState } from 'react';
import { useSalesStore } from '../store.ts';
import { generateSalesContent } from '../services/geminiService.ts';
import { AppTab } from '../types.ts';

const ClientDataForm: React.FC = () => {
  const { clientData, setClientData, aiContent, setAiContent, roiResults, roiInputs, config, setActiveTab } = useSalesStore();
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLookupNIP = async () => {
    setIsSearching(true);
    // Simulate API delay for GUS/Rejestr.io
    await new Promise(r => setTimeout(r, 1200));
    
    // Mock successful lookup
    if (clientData.nip.length >= 10) {
      setClientData({
        companyName: "INDUSTRIAL SOLUTIONS SP. Z O.O.",
        address: "ul. Fabryczna 15, 30-123 Kraków",
        industry: "Obróbka metali i CNC"
      });
    }
    setIsSearching(false);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSalesContent(roiResults, roiInputs, config, clientData);
      setAiContent(result);
    } catch (error) {
      alert("Błąd generatora AI. Spróbuj ponownie.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-500">
      
      {/* 4.1: Formularz Danych Klienta */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-6 px-10 flex items-center space-x-4 text-white">
          <i className="fas fa-building text-blue-400"></i>
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">4.1 Dane Kontrahenta (Nagłówek)</h2>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">NIP / KRS / REGON</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={clientData.nip}
                  onChange={e => setClientData({ nip: e.target.value })}
                  placeholder="Podaj NIP do autouzupełniania..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button 
                  onClick={handleLookupNIP}
                  disabled={isSearching}
                  className="px-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-blue-700 transition-all disabled:bg-slate-300"
                >
                  {isSearching ? <i className="fas fa-spinner fa-spin"></i> : "Pobierz"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pełna Nazwa Firmy</label>
              <input 
                type="text" 
                value={clientData.companyName}
                onChange={e => setClientData({ companyName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adres Siedziby</label>
              <input 
                type="text" 
                value={clientData.address}
                onChange={e => setClientData({ address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Osoba Kontaktowa</label>
                <input 
                  type="text" 
                  value={clientData.contactPerson}
                  onChange={e => setClientData({ contactPerson: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stanowisko</label>
                <input 
                  type="text" 
                  value={clientData.position}
                  onChange={e => setClientData({ position: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Klienta</label>
              <input 
                type="email" 
                value={clientData.email}
                onChange={e => setClientData({ email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Branża (AI Classification)</label>
              <input 
                type="text" 
                value={clientData.industry}
                onChange={e => setClientData({ industry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4.2: Generator Treści AI */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-900 py-6 px-10 flex justify-between items-center text-white">
            <div className="flex items-center space-x-4">
               <i className="fas fa-envelope-open-text text-blue-400"></i>
               <h2 className="text-sm font-black uppercase tracking-[0.3em]">Email Ofertowy (AI)</h2>
            </div>
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isGenerating ? "Generowanie..." : "Odnów Treść"}
            </button>
          </div>
          <div className="p-10 flex-1 space-y-6">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Temat Wiadomości</label>
              <input 
                type="text" 
                value={aiContent.emailSubject}
                onChange={e => setAiContent({ emailSubject: e.target.value })}
                placeholder="Kliknij generuj, aby stworzyć treść..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-slate-900 outline-none"
              />
            </div>
            <div className="relative flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Treść Wiadomości (Rich Text Editor)</label>
              <textarea 
                value={aiContent.emailBody}
                onChange={e => setAiContent({ emailBody: e.target.value })}
                placeholder="Tutaj pojawi się spersonalizowany mail do klienta oparty o dane ROI..."
                className="w-full h-[300px] bg-slate-50 border border-slate-200 rounded-2xl px-6 py-6 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all whitespace-pre-wrap"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-900 py-6 px-10 flex items-center space-x-4 text-white">
            <i className="fas fa-sticky-note text-orange-400"></i>
            <h2 className="text-sm font-black uppercase tracking-[0.3em]">Notatka CRM (Internal)</h2>
          </div>
          <div className="p-10 flex-1 flex flex-col">
            <div className="relative flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Podsumowanie Techniczne dla Zespołu</label>
              <textarea 
                value={aiContent.crmNote}
                onChange={e => setAiContent({ crmNote: e.target.value })}
                placeholder="Zwięzłe podsumowanie dla konsultantów wdrożeniowych..."
                className="w-full h-full min-h-[400px] bg-slate-50 border border-slate-200 rounded-2xl px-6 py-6 font-mono text-xs text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
               <div className="flex items-center space-x-3 text-slate-400 mb-2">
                  <i className="fas fa-brain"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Kontekst AI</span>
               </div>
               <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  Generator analizuje: ROI (${(roiResults.totalAnnualImpact/100).toLocaleString()} PLN), 
                  Payback (${roiResults.paybackMonths} m-cy), Wybrane moduły (${Object.values(config.licenseQuantities).filter(v => Number(v) > 0).length}) 
                  oraz Branżę (${clientData.industry}).
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setActiveTab(AppTab.SCOPE)}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Powrót do Zakresu
          </button>
          
          <div className="flex space-x-4">
             {!aiContent.emailBody && (
               <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="px-8 py-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center space-x-2"
               >
                 <i className="fas fa-magic"></i>
                 <span>Generuj treści AI</span>
               </button>
             )}
            <button 
              onClick={() => setActiveTab(AppTab.SYNC)}
              className="px-12 py-5 bg-orange-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 hover:scale-[1.02] transition-all flex items-center space-x-3"
            >
               <span>Strona 5: HubSpot Sync</span>
               <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDataForm;
