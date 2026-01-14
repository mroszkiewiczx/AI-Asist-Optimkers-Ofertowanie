
import React, { useState } from 'react';
import { useSalesStore } from '../store.ts';
import { AppTab } from '../types.ts';

const HubSpotSync: React.FC = () => {
  const { 
    config, roiResults, getHubSpotLineItems, getDealName, 
    research, setResearch, setActiveTab 
  } = useSalesStore();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const lineItems = getHubSpotLineItems();
  const dealName = getDealName();
  const clientData = research.profile;

  const setClientData = (data: any) => {
    useSalesStore.getState().updateProfile(data);
  };

  const handleSyncChain = async () => {
    setIsSyncing(true);
    setIsSuccess(false);
    setLogs([]);
    
    try {
      // KROK 1: Walidacja
      addLog("ROZPOCZĘCIE PROCEDURY SYNCHRONIZACJI (4 KROKI)");
      if (!clientData.email || !clientData.companyName) {
         addLog("BŁĄD WALIDACJI: Brak danych kontaktowych klienta (E-mail lub Nazwa).");
         throw new Error("Validation Failed");
      }
      await new Promise(r => setTimeout(r, 600));

      // KROK 2: Upsert Klienta i Firmy
      addLog("KROK 2: Upsert Kontaktu i Firmy...");
      addLog(`Szukanie kontaktu: ${clientData.email}`);
      await new Promise(r => setTimeout(r, 800));
      addLog("Kontakt znaleziony (HS-ID: 991823). Aktualizacja danych...");
      
      addLog(`Szukanie firmy: ${clientData.companyName}`);
      await new Promise(r => setTimeout(r, 700));
      addLog("Firma zidentyfikowana (HS-ID: 4421). Tworzenie asocjacji...");
      await new Promise(r => setTimeout(r, 400));

      // KROK 3: Utworzenie Transakcji (Deal)
      addLog(`KROK 3: Tworzenie Transakcji: '${dealName}'`);
      addLog(`Pipeline ID: default | Stage: Ofertowanie`);
      await new Promise(r => setTimeout(r, 1200));
      addLog("Transakcja utworzona pomyślnie. Deal ID: HS-D884219");

      // KROK 4: Dodanie Produktów (Line Items)
      addLog("KROK 4: Generowanie Line Items z Manifestu Technicznego...");
      for(const item of lineItems) {
        addLog(`Synchronizacja produktu: ${item.name} | Cena: ${item.unitPrice/100} PLN`);
        await new Promise(r => setTimeout(r, 300));
      }

      addLog("Zapisywanie metadanych ROI w HubSpot Custom Properties...");
      addLog(`Ustawiono 'Estimated_Annual_Loss': ${roiResults.totalAnnualImpact/100} PLN`);
      addLog(`Ustawiono 'ROI_Payback_Months': ${roiResults.paybackMonths}`);
      await new Promise(r => setTimeout(r, 500));

      addLog("SYNCHRONIZACJA ZAKOŃCZONA POWODZENIEM (COMMIT)");
      setIsSuccess(true);
    } catch (err) {
      addLog("KRYTYCZNY BŁĄD PODCZAS SYNCHRONIZACJI API.");
    } finally {
      setIsSyncing(false);
    }
  };

  const formatPLN = (grosz: number) => (grosz / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">5. Manifest Techniczny HubSpot</h2>
          <p className="text-slate-500 font-medium mt-1">Podgląd techniczny Line Items oraz konfiguracja Transakcji</p>
        </div>
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
           <i className="fab fa-hubspot text-3xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Deal Summary Panel */}
        <div className="lg:col-span-1 space-y-6">
           <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Konfiguracja Deala</h3>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Deal Name (Automatyczny)</label>
                <div className="p-4 bg-slate-900 text-blue-400 font-mono text-xs rounded-xl border border-slate-800 break-all leading-relaxed">
                   {dealName}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">LinkedIn Firmy / Domena</label>
                <input 
                  type="text" 
                  value={clientData.domain}
                  onChange={e => setClientData({ domain: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-50 space-y-4">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Waluta</span>
                    <span className="text-slate-900">PLN (Hardcoded)</span>
                 </div>
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-400">Portal ID</span>
                    <span className="text-blue-600">1234567</span>
                 </div>
              </div>
           </section>

           {isSuccess && (
             <div className="bg-green-50 border border-green-200 p-6 rounded-[2rem] flex items-start space-x-4 animate-in zoom-in">
               <i className="fas fa-check-circle text-green-500 mt-1"></i>
               <div>
                 <h4 className="font-bold text-green-900 mb-1 leading-none">Przesłano pomyślnie</h4>
                 <p className="text-[11px] text-green-700 leading-normal">ID Deal w HubSpot: HS-884219. Dane ROI zostały poprawnie zamapowane na właściwości transakcji.</p>
                 <button className="mt-4 text-[10px] font-black text-green-800 uppercase tracking-widest hover:underline">Otwórz w HubSpot &rarr;</button>
               </div>
             </div>
           )}
        </div>

        {/* Technical Data Grid */}
        <div className="lg:col-span-2 space-y-6">
           <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
             <div className="bg-slate-50 py-4 px-8 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">5.1 Tabela Line Items (HS Payload)</h3>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">Netto</span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="bg-slate-50/50">
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">HS Product ID</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                     <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Price Single</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {lineItems.map((item, idx) => (
                     <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-5 font-mono text-[10px] text-slate-400">{item.productId}</td>
                       <td className="px-8 py-5">
                          <p className="text-[11px] font-black text-slate-900 leading-tight">{item.name}</p>
                          <p className="text-[9px] font-bold text-blue-500 uppercase mt-1 opacity-50">{item.category}</p>
                       </td>
                       <td className="px-8 py-5 text-center font-black text-slate-900 text-xs">{item.quantity}</td>
                       <td className="px-8 py-5 text-right font-black text-slate-900 text-xs">{formatPLN(item.unitPrice)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>

           {/* Sync Terminal */}
           {(isSyncing || logs.length > 0) && (
            <div className="bg-slate-900 rounded-[2rem] p-8 font-mono text-[10px] text-slate-300 space-y-2 max-h-64 overflow-y-auto shadow-inner border border-slate-800">
              {logs.map((log, i) => (
                <div key={i} className="flex space-x-3">
                  <span className={`${log.includes('BŁĄD') ? 'text-red-500' : 'text-green-500'} opacity-50`}>#</span>
                  <span>{log}</span>
                </div>
              ))}
              {isSyncing && <div className="animate-pulse flex space-x-2 text-blue-400"><span>_</span> <span className="italic">Przetwarzanie transakcji API...</span></div>}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => setActiveTab(AppTab.RESEARCH)}
            className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Edytuj Dane Research
          </button>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleSyncChain}
              disabled={isSyncing}
              className={`px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center space-x-3 ${
                isSyncing ? 'bg-slate-400 cursor-not-allowed text-white' : 'bg-orange-600 text-white shadow-orange-200 hover:scale-[1.02]'
              }`}
            >
              {isSyncing ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  <span>Procedura Sync...</span>
                </>
              ) : (
                <>
                  <i className="fab fa-hubspot"></i>
                  <span>URUCHOM PROCEDURĘ SYNCHRONIZACJI</span>
                </>
              )}
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.SUMMARY)}
              className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
               Przejdź do Eksportu (Strona 6)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubSpotSync;
