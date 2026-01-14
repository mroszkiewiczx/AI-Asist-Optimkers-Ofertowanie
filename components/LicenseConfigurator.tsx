
import React, { useState } from 'react';
import { useSalesStore } from '../store.ts';
import { LICENSE_BASE_SRP } from '../constants.ts';
import { SubscriptionType, AppTab, HostingModel } from '../types.ts';
import { auditService } from '../services/auditService.ts';

const LicenseConfigurator: React.FC = () => {
  const { 
    config, setConfig, resetConfig, getLicenseTotals, 
    getImplementationTotal, getSupportPrice, getProjectCostTotal, 
    roiResults, setActiveTab, dictionaries, clientData, getHubSpotLineItems, currentUser
  } = useSalesStore();
  
  const [integrationsOpen, setIntegrationsOpen] = useState(false);
  const [showMultiplierModal, setShowMultiplierModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const formatPLN = (grosz: number) => (grosz / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

  const licTotals = getLicenseTotals();
  const implTotal = getImplementationTotal();
  const supportPrice = getSupportPrice();
  const grandTotal = getProjectCostTotal();

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

  const matrixKey = config.subscriptionType === 'PERPETUAL' ? 'PERPETUAL' : (config.subscriptionType === 'ANNUAL' ? 'CLOUD_ANNUAL' : 'CLOUD_MONTHLY');
  const matrix = LICENSE_BASE_SRP[matrixKey];

  const getSelectedIntegrationsNames = () => {
    return dictionaries.integrations
      .filter(i => config.selectedIntegrations.includes(i.id))
      .map(i => i.label)
      .join(", ");
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
          <button onClick={() => setShowMultiplierModal(true)} className="absolute top-6 right-10 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all border border-white/5"><i className="fas fa-cog text-xs"></i></button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Utrzymania</label>
            <select value={config.hostingModel} onChange={e => setConfig({ hostingModel: e.target.value as HostingModel })} className="w-full p-4 rounded-2xl border-2 font-black text-sm bg-slate-50 border-slate-200 text-slate-900 outline-none">
              <option value="CLOUD">Chmura</option>
              <option value="OWN_SERVER">Serwer własny</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rodzaj subskrypcji</label>
            <select value={config.subscriptionType} onChange={e => setConfig({ subscriptionType: e.target.value as SubscriptionType })} className="w-full p-4 rounded-2xl border-2 font-black text-sm bg-slate-50 border-slate-200 text-slate-900 outline-none">
              <option value="MONTHLY">Miesięczną</option>
              <option value="ANNUAL">Roczną (2 miesiące w gratisie)</option>
              <option value="PERPETUAL" disabled={config.hostingModel === 'CLOUD'}>Licencja wieczysta</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 py-3 px-10 text-[10px] font-black text-slate-500 uppercase tracking-widest border-y border-slate-200">
              <tr>
                <th className="px-10 py-3 w-1/2">Licencja</th>
                <th className="px-10 py-3 text-center w-20">Ilość</th>
                <th className="px-10 py-3 text-right w-32">Cena jedn.</th>
                <th className="px-10 py-3 text-right w-32">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dictionaries.modules.filter(m => m.id !== 'integrator').map(module => (
                <tr key={module.id} className="hover:bg-slate-50/50">
                  <td className="px-10 py-6 w-1/2">
                    <p className="text-[13px] font-black text-slate-900 leading-tight">{module.label}</p>
                  </td>
                  <td className="px-10 py-6 text-center w-20">
                    <input type="number" min="0" value={config.licenseQuantities[module.id] || 0} onChange={e => updateLicQty(module.id, Number(e.target.value))} className="w-20 px-3 py-2 text-center font-black bg-white border border-slate-200 rounded-xl text-slate-900 shadow-sm" />
                  </td>
                  <td className="px-10 py-6 text-right w-32 font-mono text-xs text-slate-400">{formatPLN(Math.round((matrix[module.id] || 0) * config.licenseMultiplier))}</td>
                  <td className="px-10 py-6 text-right w-32 font-black text-slate-900">{formatPLN(Math.round((matrix[module.id] || 0) * config.licenseMultiplier) * (config.licenseQuantities[module.id] || 0))}</td>
                </tr>
              ))}
              
              {/* Licencja Integrator - Specjalna obsługa listy integracji */}
              <tr className="hover:bg-slate-50/50">
                <td className="px-10 py-6 w-1/2">
                  <p className="text-[13px] font-black text-slate-900 leading-tight">Licencja Integrator</p>
                  {config.selectedIntegrations.length > 0 && (
                    <p className="text-[10px] text-slate-400 font-medium mt-2 leading-relaxed italic">
                      Wybór: {getSelectedIntegrationsNames()}
                    </p>
                  )}
                </td>
                <td className="px-10 py-6 text-center w-20 font-black text-slate-900">
                  {config.selectedIntegrations.length}
                </td>
                <td className="px-10 py-6 text-right w-32 font-mono text-xs text-slate-400">
                  {formatPLN(Math.round((matrix.integrator || 0) * config.licenseMultiplier))}
                </td>
                <td className="px-10 py-6 text-right w-32 font-black text-slate-900">
                  {formatPLN(Math.round((matrix.integrator || 0) * config.licenseMultiplier) * config.selectedIntegrations.length)}
                </td>
              </tr>

              <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">
                <td className="px-10 py-5">Suma Licencji (Miesiąc)</td>
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

      {/* 2.3: Podsumowanie i Rabat - NAPRAWIONE WIZUALNIE */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-6 px-10 text-white flex justify-between items-center">
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">2.3 Podsumowanie i Rabat</h2>
        </div>
        
        <div className="p-10 flex flex-col lg:flex-row gap-12 items-start">
          <div className="lg:w-[60%] space-y-6">
            {/* RED WASTE CARD - ROI */}
            <div className="p-8 bg-red-50 rounded-[2.5rem] border-2 border-red-200 shadow-lg shadow-red-100/50 flex items-center space-x-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i className="fas fa-fire-alt text-8xl text-red-600"></i>
              </div>
              <div className="flex flex-col items-center space-y-2 relative z-10">
                <div className="flex space-x-1">
                  <i className="fas fa-fire-alt text-red-600 text-sm animate-pulse"></i>
                  <i className="fas fa-clock text-red-600 text-sm"></i>
                </div>
                <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-red-200">
                  <i className="fas fa-money-bill-wave"></i>
                </div>
              </div>
              <div className="flex-1 flex flex-row items-center justify-between relative z-10">
                <div className="max-w-[200px]">
                  <p className="text-[11px] font-black text-red-900 uppercase tracking-widest leading-tight">Miesięczna strata czasu pracowników:</p>
                  <p className="text-[9px] text-red-500 font-bold uppercase mt-1 leading-none italic">Cost of Inaction</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-red-600 tracking-tighter leading-none">{formatPLN(roiResults.monthlyWasteCost)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Suma oszczędnośći dzięki obniżeniu wartości magaznu i pozytywnemu Cash-Flow:</p>
              <p className="text-xl font-black text-slate-900">{formatPLN(roiResults.inventorySaving)}</p>
            </div>

            {/* WYRÓWNANE POLA DODATKOWYCH USTALEŃ */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
               <div className="grid grid-cols-[1fr_200px] gap-8 items-start">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Dodatkowe ustalenia (tekst)</label>
                    <textarea 
                      rows={4}
                      value={config.implementationNotes}
                      onChange={e => setConfig({ implementationNotes: e.target.value })}
                      className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-medium outline-none text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all h-[116px]"
                      placeholder="- Ustalenia dodatkowe z klientem..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none block">Kwota dodatkowa (PLN)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        value={config.implementationExtrasAmount / 100}
                        onChange={e => setConfig({ implementationExtrasAmount: Number(e.target.value) * 100 })}
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-right text-xl text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all h-[116px]"
                      />
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[9px] uppercase pointer-events-none">NETTO</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 w-full lg:w-auto">
             <div className={`bg-white border-2 border-slate-200 rounded-[2.5rem] overflow-hidden ${config.subscriptionType !== 'ANNUAL' ? 'opacity-30' : ''}`}>
                <div className="bg-slate-900 py-4 px-8 text-center text-white">
                   <h3 className="text-xs font-black uppercase tracking-widest">Rabat i Podsumowanie Lat</h3>
                </div>
                <div className="p-8 space-y-4 text-slate-900">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-black">Okres (lat):</span>
                      <input type="number" min="1" value={config.subscriptionYears} onChange={e => setConfig({ subscriptionYears: Math.max(1, Number(e.target.value)) })} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-right font-black text-slate-900" />
                   </div>
                   <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400">Suma przed rabatem:</span>
                      <span className="text-slate-900 font-black">{formatPLN(licTotals.beforeDiscount)}</span>
                   </div>
                   {config.subscriptionType === 'ANNUAL' && (
                     <>
                        <div className="flex justify-between items-center text-xs font-bold">
                           <span className="text-slate-400">Rabat (2 m-ce gratis/rok):</span>
                           <span className="text-blue-600 font-black">{formatPLN(licTotals.discountValue)}</span>
                        </div>
                     </>
                   )}
                   {licTotals.maintenance > 0 && (
                     <div className="flex justify-between items-start text-xs font-bold">
                        <span className="text-slate-400 pr-4">Maintenace (od 2. roku opcjonalnie):</span>
                        <span className="text-slate-900 font-black text-right">{formatPLN(licTotals.maintenance)}</span>
                     </div>
                   )}
                   <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 uppercase">Do Zapłaty:</span>
                      <span className="text-xl font-black text-blue-600 tracking-tighter">{formatPLN(licTotals.afterDiscount)}</span>
                   </div>
                   {config.subscriptionType === 'PERPETUAL' && config.subscriptionYears === 1 && (
                     <p className="text-[9px] text-green-600 font-black uppercase text-center mt-2 leading-tight">
                        Maintenace: 1. rok w cenie licencji
                     </p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2.4: Pakiety Wdrożeniowe - NAPRAWIONE WIZUALNIE */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 py-4 px-10 border-b border-slate-200">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">2.4 Pakiety Wdrożeniowe (Uruchomienie)</h2>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
           <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wybierz Pakiet</label>
              <select value={config.implementationPackage} onChange={e => setConfig({ implementationPackage: e.target.value })} className="w-full p-4 rounded-2xl border-2 font-black text-sm bg-slate-50 border-slate-200 text-slate-900 outline-none shadow-sm">
                 {dictionaries.implementationPackages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
           </div>
           <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 text-center shadow-inner">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Inwestycja w Uruchomienie</p>
              <p className="text-4xl font-black text-slate-900">{formatPLN(implTotal)}</p>
           </div>
        </div>
      </section>

      {/* 2.5: Pakiety Opieki - NAPRAWIONE WIZUALNIE */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 py-4 px-10 border-b border-slate-800">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">2.5 Pakiet opieki po uruchomieniu</h2>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pakiet Wsparcia</label>
              <select value={config.supportPackage} onChange={e => setConfig({ supportPackage: e.target.value })} className="w-full p-4 rounded-2xl border-2 font-black text-sm bg-slate-50 border-slate-200 text-slate-900 outline-none shadow-sm">
                 {dictionaries.supportPackages.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Okres</label>
              <select value={config.supportPeriod} onChange={e => setConfig({ supportPeriod: e.target.value as any })} className="w-full p-4 rounded-2xl border-2 font-black text-sm bg-slate-50 border-slate-200 text-slate-900 outline-none shadow-sm">
                 <option value="MONTHLY">Miesięczny</option>
                 <option value="ANNUAL">Roczny</option>
              </select>
           </div>
           <div className="bg-slate-900 p-8 rounded-[2rem] text-center shadow-xl">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-2">Inwestycja (Support)</p>
              <p className="text-3xl font-black text-white">{formatPLN(supportPrice)}</p>
           </div>
        </div>
      </section>

      {/* 2.6: PODSUMOWANIE CAŁOŚCI */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl space-y-10">
        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-blue-400 border-b border-blue-900/50 pb-6">2.6 Podsumowanie całości projektu</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-4">
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50">Inwestycja w licencje (po rabacie)</span><span className="font-bold">{formatPLN(licTotals.afterDiscount)}</span></div>
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50">Inwestycja we wdrożenie</span><span className="font-bold">{formatPLN(implTotal)}</span></div>
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50">Ustalenia dodatkowe</span><span className="font-bold">{formatPLN(config.implementationExtrasAmount)}</span></div>
             <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-xs font-black uppercase text-blue-400">Suma projektu</span>
                <span className="text-3xl font-black">{formatPLN(licTotals.afterDiscount + implTotal)}</span>
             </div>
          </div>
          <div className="space-y-4 border-l border-white/5 pl-16">
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50">Miesięczna strata czasu (ROI)</span><span className="font-bold">{formatPLN(roiResults.monthlyWasteCost)}</span></div>
             <div className="flex justify-between text-xs font-medium"><span className="text-white/50">Oszczędność Cash-Flow</span><span className="font-bold">{formatPLN(roiResults.inventorySaving)}</span></div>
             <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-black uppercase text-green-400">Szacowany zwrot (Payback)</span>
                <span className="text-3xl font-black text-green-400">{roiResults.paybackMonths} mies.</span>
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
            {config.subscriptionType === 'ANNUAL' && <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase">2 MIESIĄCE GRATIS</div>}
          </div>
          <div className="flex gap-3">
             <button onClick={resetConfig} className="px-6 py-4 border border-slate-200 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Wyczyść</button>
             <button onClick={handleSave} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase min-w-[100px]">Zapisz</button>
             <button onClick={() => setActiveTab(AppTab.SCOPE)} className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center space-x-4">
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
