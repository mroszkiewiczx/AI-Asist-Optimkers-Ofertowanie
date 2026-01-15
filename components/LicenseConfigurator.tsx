
import React, { useState } from 'react';
import { useSalesStore } from '../store.ts';
import { LICENSE_BASE_SRP, HS_PRODUCT_MAP, SUPPORT_PRICES } from '../constants.ts';
import { SubscriptionType, AppTab, HostingModel } from '../types.ts';
import { auditService } from '../services/auditService.ts';

const LicenseConfigurator: React.FC = () => {
  const { 
    config, setConfig, resetConfig, getLicenseTotals, 
    getImplementationTotal, getSupportPrice, getProjectCostTotal, 
    roiResults, setActiveTab, dictionaries, clientData, currentUser,
    addExtraArrangement, updateExtraArrangement, removeExtraArrangement
  } = useSalesStore();
  
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [extrasSaved, setExtrasSaved] = useState(false);
  
  // Hidden Settings State
  const [showLicMultiplier, setShowLicMultiplier] = useState(false);
  const [showImplMultiplier, setShowImplMultiplier] = useState(false);

  const formatPLN = (grosz: number) => (grosz / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

  const licTotals = getLicenseTotals();
  const implTotal = getImplementationTotal();
  const supportPrice = getSupportPrice();
  const grandTotal = getProjectCostTotal();
  
  const extrasTotal = config.extraArrangements.reduce((sum, item) => sum + (Number(item.amountGrosz) || 0), 0);
  const subtotalWithExtras = licTotals.afterDiscount + extrasTotal;

  // Payback Calculation: Suma projektu / Miesięczna strata
  const paybackValue = roiResults.monthlyWasteCost > 0 
    ? (grandTotal / roiResults.monthlyWasteCost).toFixed(1)
    : "—";

  const toggleIntegration = (id: string) => {
    const next = config.selectedIntegrations.includes(id)
      ? config.selectedIntegrations.filter(x => x !== id)
      : [...config.selectedIntegrations, id];
    setConfig({ selectedIntegrations: next });
  };

  const updateLicQty = (id: string, qty: number) => {
    setConfig({ licenseQuantities: { ...config.licenseQuantities, [id]: Math.max(0, qty) } });
  };

  const handleSave = async () => {
    setSaveStatus("Trwa zapisywanie...");
    await auditService.logEvent({
      level: 'INFO', channel: 'CONFIG', login: currentUser?.login || 'system',
      message: 'CONFIG_SAVE_DRAFT', meta: { total_value: grandTotal }
    });
    setTimeout(() => {
      setSaveStatus("Zapisano pomyślnie!");
      setTimeout(() => setSaveStatus(null), 3000);
    }, 600);
  };

  const handleSaveExtras = () => {
    setExtrasSaved(true);
    setTimeout(() => setExtrasSaved(false), 2000);
  };

  const matrixKey = config.subscriptionType === 'PERPETUAL' ? 'PERPETUAL' : (config.subscriptionType === 'ANNUAL' ? 'CLOUD_ANNUAL' : 'CLOUD_MONTHLY');
  const matrix = LICENSE_BASE_SRP[matrixKey];

  const getSelectedIntegrationsNames = () => {
    return dictionaries.integrations
      .filter(i => config.selectedIntegrations.includes(i.id))
      .map(i => i.label)
      .join(", ");
  };

  const getHostingColor = (val: HostingModel) => {
    if (val === 'CLOUD') return 'bg-cyan-400 text-white border-cyan-500 shadow-cyan-100';
    return 'bg-purple-600 text-white border-purple-700 shadow-purple-100';
  };

  const getSubColor = (val: SubscriptionType) => {
    if (val === 'MONTHLY') return 'bg-yellow-400 text-slate-900 border-yellow-500 shadow-yellow-100';
    if (val === 'ANNUAL') return 'bg-green-500 text-white border-green-600 shadow-green-100';
    return 'bg-blue-600 text-white border-blue-700 shadow-blue-100';
  };

  const getPkgColor = (pkg: string) => {
    if (pkg === 'BASIC') return 'bg-yellow-400 border-yellow-500 text-slate-900';
    if (pkg === 'PRO') return 'bg-green-500 border-green-600 text-white';
    if (pkg === 'PRO_MAX') return 'bg-purple-600 border-purple-700 text-white';
    return 'bg-slate-50 border-slate-200';
  };

  const getSupportPkgColor = (pkg: string) => {
    if (pkg === 'ELASTYCZNY') return 'bg-yellow-400 text-slate-900';
    if (pkg === 'START_PLUS') return 'bg-red-500 text-white';
    if (pkg === 'ROZSZERZONY') return 'bg-green-500 text-white';
    if (pkg === 'PREMIUM') return 'bg-blue-600 text-white';
    return 'bg-slate-50';
  };

  return (
    <div className="space-y-12 pb-64 animate-in fade-in duration-500 print:p-0">
      
      {/* 2.1: Integracje (katalog) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <button 
          onClick={() => setIntegrationsOpen(!integrationsOpen)}
          className="w-full bg-slate-50 py-6 px-10 flex justify-between items-center hover:bg-slate-100 transition-colors print:bg-white"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${integrationsOpen ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}`}>
              <i className="fas fa-plug text-sm"></i>
            </div>
            <div className="text-left">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1">2.1 Integracje (katalog)</h2>
              <p className="text-xs font-black text-slate-900 leading-none">Wybierz systemy zewnętrzne do połączenia</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 print:hidden">
            {config.selectedIntegrations.length > 0 && (
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">
                WYBRANO: {config.selectedIntegrations.length}
              </span>
            )}
            <i className={`fas fa-chevron-${integrationsOpen ? 'up' : 'down'} opacity-30`}></i>
          </div>
        </button>
        {integrationsOpen && (
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-300 print:p-4">
            {Array.from(new Set(dictionaries?.integrations?.map(i => i.meta?.category) || [])).map(cat => (
              <div key={cat} className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{cat}</h3>
                {dictionaries?.integrations?.filter(i => i.meta?.category === cat).map(item => (
                  <label key={item.id} className="flex items-center space-x-3 cursor-pointer group p-1">
                    <input type="checkbox" checked={config.selectedIntegrations.includes(item.id)} onChange={() => toggleIntegration(item.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                    <span className={`text-[11px] font-black ${config.selectedIntegrations.includes(item.id) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2.2: Subskrypcja licencje */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-6 px-10 flex flex-col lg:flex-row justify-between items-center text-white relative">
          <div className="flex items-center space-x-4">
            <i className="fas fa-id-badge text-blue-400"></i>
            <h2 className="text-sm font-black uppercase tracking-[0.3em]">2.2 Subskrypcja licencje i opieka</h2>
          </div>
          
          {/* Hidden Multiplier Gear */}
          <div className="relative group">
             <button onClick={() => setShowLicMultiplier(!showLicMultiplier)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/50 hover:text-white">
                <i className="fas fa-cog"></i>
             </button>
             {showLicMultiplier && (
                <div className="absolute right-0 top-full mt-2 bg-white p-4 rounded-xl shadow-xl z-50 w-64 border border-slate-200 animate-in fade-in slide-in-from-top-2">
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Mnożnik Cen (0.8 - 2.5)</p>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" min="0.8" max="2.5" step="0.05"
                        value={config.licenseMultiplier}
                        onChange={e => setConfig({ licenseMultiplier: Number(e.target.value) })}
                        className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-black text-blue-600 w-10 text-right">{Number(config.licenseMultiplier).toFixed(2)}x</span>
                   </div>
                </div>
             )}
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Utrzymania</label>
            <select 
              value={config.hostingModel} 
              onChange={e => setConfig({ hostingModel: e.target.value as HostingModel })} 
              className={`w-full p-4 rounded-2xl border-2 font-black text-sm outline-none transition-all shadow-xl ${getHostingColor(config.hostingModel)}`}
            >
              <option value="CLOUD" className="bg-white text-slate-900">Chmura (Cloud)</option>
              <option value="OWN_SERVER" className="bg-white text-slate-900">Serwer własny</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rodzaj subskrypcji</label>
            <select 
              value={config.subscriptionType} 
              onChange={e => setConfig({ subscriptionType: e.target.value as SubscriptionType })} 
              className={`w-full p-4 rounded-2xl border-2 font-black text-sm outline-none transition-all shadow-xl ${getSubColor(config.subscriptionType)}`}
            >
              <option value="MONTHLY" className="bg-white text-slate-900">Miesięczna</option>
              <option value="ANNUAL" className="bg-white text-slate-900">Roczna (2 miesiące w gratisie)</option>
              <option value="PERPETUAL" disabled={config.hostingModel === 'CLOUD'} className="bg-white text-slate-900">Licencja wieczysta</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 py-3 px-10 text-[10px] font-black text-slate-500 uppercase tracking-widest border-y border-slate-200">
              <tr>
                <th className="px-10 py-3 w-32">ID Product HS</th>
                <th className="px-10 py-3">Nazwa Licencji</th>
                <th className="px-10 py-3 text-center w-24">Ilość</th>
                <th className="px-10 py-3 text-right w-40">Cena jedn.</th>
                <th className="px-10 py-3 text-right w-40">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dictionaries.modules.filter(m => m.id !== 'integrator').map(module => {
                const subKey = config.subscriptionType.toLowerCase() as any;
                const hsId = (HS_PRODUCT_MAP.modules as any)[module.id]?.[subKey] || (HS_PRODUCT_MAP.modules as any)[module.id]?.monthly;
                const unitPrice = Math.round((matrix[module.id] || 0) * config.licenseMultiplier);
                const qty = config.licenseQuantities[module.id] || 0;
                return (
                  <tr key={module.id} className="hover:bg-slate-50/50">
                    <td className="px-10 py-6 font-mono text-[10px] text-slate-400">{hsId}</td>
                    <td className="px-10 py-6">
                      <p className="text-[13px] font-black text-slate-900 leading-tight">{module.label}</p>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <input type="number" min="0" value={qty} onChange={e => updateLicQty(module.id, Number(e.target.value))} className="w-20 px-3 py-2 text-center font-black bg-white border border-slate-200 rounded-xl text-slate-900 shadow-sm" />
                    </td>
                    <td className="px-10 py-6 text-right font-mono text-xs text-slate-400">{formatPLN(unitPrice)}</td>
                    <td className="px-10 py-6 text-right font-black text-slate-900">{formatPLN(unitPrice * qty)}</td>
                  </tr>
                );
              })}
              
              <tr className="hover:bg-slate-50/50">
                <td className="px-10 py-6 font-mono text-[10px] text-slate-400">
                   {(HS_PRODUCT_MAP.modules as any).integrator?.[config.subscriptionType.toLowerCase()] || (HS_PRODUCT_MAP.modules as any).integrator?.monthly}
                </td>
                <td className="px-10 py-6">
                  <p className="text-[13px] font-black text-slate-900 leading-tight">Licencja Integrator</p>
                  {config.selectedIntegrations.length > 0 && (
                    <p className="text-[14px] text-blue-900 font-black mt-2 leading-relaxed italic">
                      Wybór: {getSelectedIntegrationsNames()}
                    </p>
                  )}
                </td>
                <td className="px-10 py-6 text-center font-black text-slate-900">
                  {config.selectedIntegrations.length}
                </td>
                <td className="px-10 py-6 text-right font-mono text-xs text-slate-400">
                  {formatPLN(Math.round((matrix.integrator || 0) * config.licenseMultiplier))}
                </td>
                <td className="px-10 py-6 text-right font-black text-slate-900">
                  {formatPLN(Math.round((matrix.integrator || 0) * config.licenseMultiplier) * config.selectedIntegrations.length)}
                </td>
              </tr>

              <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                <td className="px-10 py-5" colSpan={2}>Suma Licencji (Miesiąc / Licencja)</td>
                <td className="px-10 py-5 text-center font-black">
                  {Object.values(config.licenseQuantities).reduce((a: number, b: number) => a + (Number(b) || 0), 0) + config.selectedIntegrations.length}
                </td>
                <td className="px-10 py-5"></td>
                <td className="px-10 py-5 text-right text-sm">{formatPLN(licTotals.subtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2.3: Podsumowanie i Rabat */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-6 px-10 text-white flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">2.3 Podsumowanie i Rabat</h2>
        </div>
        
        <div className="p-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="p-8 bg-red-50 rounded-[2.5rem] border-2 border-red-200 shadow-lg shadow-red-100/50 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
              <i className="fas fa-fire-alt absolute right-[-10px] top-[-10px] text-7xl text-red-600/10 -rotate-12"></i>
              <div className="relative z-10 flex items-center space-x-4 mb-4">
                 <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-clock"></i></div>
                 <p className="text-[11px] font-black text-red-900 uppercase tracking-widest leading-tight">Miesięczna strata czasu pracowników:</p>
              </div>
              <p className="text-3xl font-black text-red-600 tracking-tighter text-right relative z-10">{formatPLN(roiResults.monthlyWasteCost)}</p>
            </div>

            <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-blue-200 shadow-lg shadow-blue-100/50 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
              <i className="fas fa-warehouse absolute right-[-10px] top-[-10px] text-7xl text-blue-600/10 -rotate-12"></i>
              <div className="relative z-10 flex items-center space-x-4 mb-4">
                 <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-money-bill-wave"></i></div>
                 <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-tight">Oszczędność Cash-Flow (Magazyn):</p>
              </div>
              <p className="text-3xl font-black text-blue-600 tracking-tighter text-right relative z-10">{formatPLN(roiResults.inventorySaving)}</p>
            </div>

            <div className="p-8 bg-green-50 rounded-[2.5rem] border-2 border-green-200 shadow-lg shadow-green-100/50 flex flex-col justify-between relative overflow-hidden group min-h-[160px] ring-4 ring-green-50/50">
              <i className="fas fa-calculator absolute right-[-10px] top-[-10px] text-7xl text-green-600/10 -rotate-12"></i>
              <div className="relative z-10 flex items-center space-x-4 mb-4">
                 <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-coins"></i></div>
                 <p className="text-[11px] font-black text-green-900 uppercase tracking-widest leading-tight">Odzyskany Utracony Obrót:</p>
              </div>
              <p className="text-3xl font-black text-green-600 tracking-tighter text-right relative z-10">{formatPLN(roiResults.lostTurnoverValue)}</p>
            </div>
          </div>

          {/* DYNAMIC ADDITIONAL ARRANGEMENTS */}
          <div className="pt-10 border-t border-slate-100 space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ustalenia dodatkowe (Dynamiczne)</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={handleSaveExtras}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center space-x-2 ${
                      extrasSaved ? 'bg-green-600 text-white shadow-green-200' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {extrasSaved ? <i className="fas fa-check"></i> : <i className="fas fa-save"></i>}
                    <span>ZAPISZ</span>
                  </button>
                  <button 
                    onClick={addExtraArrangement} 
                    disabled={config.extraArrangements.length >= 8}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-slate-300 flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i> 
                    <span>DODAJ USTALENIE</span>
                  </button>
                </div>
             </div>
             
             <div className="space-y-4">
                {config.extraArrangements.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_200px_50px] gap-4 items-start animate-in slide-in-from-left-2">
                     <textarea 
                        value={item.text}
                        onChange={e => updateExtraArrangement(item.id, { text: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium outline-none text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all h-[58px] resize-none"
                        placeholder="Opisz dodatkowe ustalenie..."
                     />
                     <div className="relative h-[58px]">
                        <input 
                          type="number"
                          value={item.amountGrosz / 100}
                          onChange={e => updateExtraArrangement(item.id, { amountGrosz: Number(e.target.value) * 100 })}
                          className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-right text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[8px] uppercase pointer-events-none">NETTO PLN</span>
                     </div>
                     <button 
                       onClick={() => removeExtraArrangement(item.id)}
                       className="h-[58px] w-[50px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-red-100"
                     >
                       <i className="fas fa-trash-alt"></i>
                     </button>
                  </div>
                ))}
                {config.extraArrangements.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">Brak dodatkowych ustaleń. Kliknij "DODAJ USTALENIE" aby dodać pozycję.</p>
                )}
             </div>
          </div>

          {/* FINAL SUMMARY CALCULATOR */}
          <div className="pt-10 border-t border-slate-100 flex justify-end">
             <div className="w-full max-w-md bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <i className="fas fa-calculator absolute right-[-20px] bottom-[-20px] text-8xl opacity-5"></i>
                <div className="relative z-10 space-y-4">
                   <div className="flex justify-between items-center text-xs font-medium">
                      <span className="opacity-50">Suma licencji (przed rabatem):</span>
                      <span className="font-bold">{formatPLN(licTotals.beforeDiscount)}</span>
                   </div>
                   {config.subscriptionType === 'ANNUAL' && (
                      <div className="flex justify-between items-center text-xs font-bold text-green-400">
                         <span className="opacity-70">Rabat (16,66% / 2 m-ce gratis):</span>
                         <span>-{formatPLN(licTotals.discountValue)}</span>
                      </div>
                   )}
                   {extrasTotal > 0 && (
                      <div className="flex justify-between items-center text-xs font-bold text-blue-400">
                         <span className="opacity-70">Ustalenia dodatkowe:</span>
                         <span>{formatPLN(extrasTotal)}</span>
                      </div>
                   )}
                   <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-400">Do Zapłaty (Łącznie):</span>
                      <span className="text-2xl font-black">{formatPLN(subtotalWithExtras)}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2.4: Pakiety Wdrożeniowe (Uruchomienie) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-6 px-10 text-white flex justify-between items-center relative">
          <div className="flex items-center space-x-4">
            <i className="fas fa-rocket text-blue-400"></i>
            <h2 className="text-sm font-black uppercase tracking-[0.3em]">2.4 Pakiety Wdrożeniowe (Uruchomienie)</h2>
          </div>

          {/* Hidden Implementation Multiplier Gear */}
          <div className="relative group">
             <button onClick={() => setShowImplMultiplier(!showImplMultiplier)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/50 hover:text-white">
                <i className="fas fa-cog"></i>
             </button>
             {showImplMultiplier && (
                <div className="absolute right-0 top-full mt-2 bg-white p-4 rounded-xl shadow-xl z-50 w-64 border border-slate-200 animate-in fade-in slide-in-from-top-2 text-slate-900">
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Mnożnik Wdrożenia (0.8 - 2.5)</p>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" min="0.8" max="2.5" step="0.05"
                        value={config.implementationMultiplier || 1.0}
                        onChange={e => setConfig({ implementationMultiplier: Number(e.target.value) })}
                        className="flex-1 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-black text-blue-600 w-10 text-right">{Number(config.implementationMultiplier || 1.0).toFixed(2)}x</span>
                   </div>
                </div>
             )}
          </div>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
           <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wybierz Pakiet Wdrożeniowy</label>
              <select 
                value={config.implementationPackage} 
                onChange={e => setConfig({ implementationPackage: e.target.value })} 
                className={`w-full p-5 rounded-2xl border-2 font-black text-sm outline-none shadow-xl transition-all ${getPkgColor(config.implementationPackage)}`}
              >
                 {dictionaries.implementationPackages.map(p => <option key={p.id} value={p.id} className="bg-white text-slate-900">{p.label}</option>)}
              </select>
           </div>
           <div className={`p-10 rounded-[2rem] border-2 text-center shadow-xl transition-all ${getPkgColor(config.implementationPackage)}`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Inwestycja w Uruchomienie</p>
              <p className="text-4xl font-black">{formatPLN(implTotal)}</p>
           </div>
        </div>
      </section>

      {/* 2.5: Pakiet opieki po uruchomieniu */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-6 px-10 text-white flex items-center space-x-4">
          <i className="fas fa-user-headset text-blue-400"></i>
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">2.5 Pakiet opieki po uruchomieniu</h2>
        </div>
        
        <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
           <div className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100">Pakiet wsparcia</div>
           <div className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 text-center">Okres</div>
           <div className="py-4 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Inwestycja</div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
           <div className="space-y-4">
              <select 
                value={config.supportPackage} 
                onChange={e => setConfig({ supportPackage: e.target.value })} 
                className={`w-full p-5 rounded-2xl border-2 font-black text-sm outline-none shadow-xl transition-all ${getSupportPkgColor(config.supportPackage)}`}
              >
                 {dictionaries.supportPackages.map(p => (
                   <option key={p.id} value={p.id} className="bg-white text-slate-900">{p.label}</option>
                 ))}
              </select>
           </div>

           <div className="space-y-4">
              <select 
                value={config.supportPeriod} 
                onChange={e => setConfig({ supportPeriod: e.target.value as any })} 
                className={`w-full p-5 rounded-2xl border-2 font-black text-sm outline-none shadow-xl transition-all ${config.supportPeriod === 'ANNUAL' ? 'bg-green-500 text-white border-green-600' : 'bg-slate-400 text-white border-slate-500'}`}
              >
                 <option value="MONTHLY" className="bg-white text-slate-900">Miesięczny</option>
                 <option value="ANNUAL" className="bg-white text-slate-900">Roczny</option>
              </select>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2rem] text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 relative z-10">Inwestycja (Support)</p>
              <p className="text-3xl font-black text-white relative z-10">{formatPLN(supportPrice)}</p>
           </div>
        </div>
      </section>

      {/* FINAL PROJECT SUMMARY */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl space-y-10 border-4 border-blue-900/30">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-blue-900/50"><i className="fas fa-check-double"></i></div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-[0.4em] text-blue-400">2.6 Podsumowanie całości projektu</h3>
              <p className="text-xs text-white/40 font-medium uppercase mt-1 tracking-widest">Master Manifest v2.1</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
             <div className="flex justify-between text-xs font-medium">
               <span className="text-white/50 uppercase tracking-widest">Suma licencji (przed rabatem)</span>
               <span className="font-bold">{formatPLN(licTotals.beforeDiscount)}</span>
             </div>
             {licTotals.discountValue > 0 && (
               <div className="flex justify-between text-xs font-medium text-green-400">
                 <span className="uppercase tracking-widest">Rabat (2 m-ce gratis/rok)</span>
                 <span className="font-bold">-{formatPLN(licTotals.discountValue)}</span>
               </div>
             )}
             <div className="flex justify-between text-xs font-medium text-blue-300">
               <span className="uppercase tracking-widest">Kwota licencji po rabacie</span>
               <span className="font-bold">{formatPLN(licTotals.afterDiscount)}</span>
             </div>
             <div className="flex justify-between text-xs font-medium">
               <span className="text-white/50 uppercase tracking-widest">Inwestycja we wdrożenie</span>
               <span className="font-bold">{formatPLN(implTotal)}</span>
             </div>
             <div className="flex justify-between text-xs font-medium">
               <span className="text-white/50 uppercase tracking-widest">Ustalenia dodatkowe</span>
               <span className="font-bold">{formatPLN(extrasTotal)}</span>
             </div>
             <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs font-black uppercase text-blue-400 tracking-[0.3em]">Suma projektu (Netto)</span>
                <span className="text-4xl font-black tracking-tighter">{formatPLN(grandTotal)}</span>
             </div>
          </div>
          <div className="space-y-6 border-l border-white/5 pl-16">
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50 uppercase tracking-widest">Miesięczna strata czasu (ROI)</span><span className="font-bold">{formatPLN(roiResults.monthlyWasteCost)}</span></div>
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50 uppercase tracking-widest">Oszczędność Cash-Flow</span><span className="font-bold">{formatPLN(roiResults.inventorySaving)}</span></div>
             <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-green-400 tracking-[0.3em]">Szacowany zwrot (Payback)</span>
                <span className="text-4xl font-black text-green-400 tracking-tighter">{paybackValue} mies.</span>
             </div>
          </div>
        </div>
      </section>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Łączna Inwestycja</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{formatPLN(grandTotal)}</p>
              {saveStatus && <div className="absolute -top-12 bg-green-600 text-white text-[10px] font-black px-4 py-2 rounded-xl">{saveStatus}</div>}
            </div>
            {config.subscriptionType === 'ANNUAL' && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">2 MIESIĄCE GRATIS</div>}
          </div>
          <div className="flex gap-3">
             <button onClick={resetConfig} className="px-6 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all">Wyczyść</button>
             <button onClick={handleSave} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase min-w-[100px] hover:bg-slate-200 transition-all">Zapisz</button>
             <button 
                onClick={() => setActiveTab(AppTab.SCOPE)} 
                className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-4"
             >
                <span>Bezpieczne Uruchomienie</span>
                <i className="fas fa-arrow-right"></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseConfigurator;
