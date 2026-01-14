
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';

const SystemConfig: React.FC = () => {
  const { settings, updateSystemConfig, updateGlobalParam, dictionaries } = useSalesStore();
  const [activeSubSection, setActiveSubSection] = useState<'srp' | 'hubspot' | 'dictionaries'>('srp');

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Konfiguracja Systemowa</h3>
          <p className="text-slate-500 font-medium mt-1">Globalne parametry silnika wyceny i integracji SSOT.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
           <button 
             onClick={() => setActiveSubSection('srp')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubSection === 'srp' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Cenniki SRP
           </button>
           <button 
             onClick={() => setActiveSubSection('hubspot')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubSection === 'hubspot' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             HubSpot Mapping
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Version Info Side Card */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <i className="fas fa-database absolute right-[-20px] bottom-[-20px] text-8xl opacity-10 -rotate-12"></i>
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6">SSOT Metadata</h4>
              <div className="space-y-5">
                 <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black opacity-50 uppercase">Schema Version</span>
                    <span className="text-sm font-black">{settings.systemConfig.schemaVersion}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-[10px] font-black opacity-50 uppercase">Ostatni Commit</span>
                    <span className="text-xs font-black">{new Date(settings.lastUpdated).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black opacity-50 uppercase">Environment</span>
                    <span className="text-[9px] font-black bg-blue-600 px-2 py-0.5 rounded uppercase">Production</span>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Polityka Systemowa</h4>
              <label className="flex items-center justify-between cursor-pointer group">
                 <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Manualne nadpisania cen</span>
                 <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.systemConfig.allowManualOverrides} 
                      onChange={e => updateSystemConfig({ allowManualOverrides: e.target.checked })} 
                    />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                 </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                 <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Akceptacja managerska</span>
                 <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.systemConfig.requireManagerApproval} 
                      onChange={e => updateSystemConfig({ requireManagerApproval: e.target.checked })} 
                    />
                    <div className="w-10 h-5 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                 </div>
              </label>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
           {activeSubSection === 'srp' && (
             <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                   <h4 className="text-xl font-black text-slate-900">Mnożniki Cennika SRP</h4>
                   <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Importuj CSV</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                   <div className="space-y-4">
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">Globalna korekta wszystkich cen w systemie. Wartość 1.0 oznacza ceny standardowe.</p>
                      <input 
                        type="range" min="0.5" max="2.0" step="0.01" 
                        value={dictionaries.globalParams.srp_multiplier}
                        onChange={e => updateGlobalParam('srp_multiplier', Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Deflacja (0.5x)</span>
                         <span>Standard (1.0x)</span>
                         <span>Inflacja (2.0x)</span>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-8 rounded-[2rem] text-center border-2 border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Aktualny Mnożnik</p>
                      <p className="text-5xl font-black text-blue-600 tracking-tighter">{dictionaries.globalParams.srp_multiplier.toFixed(2)}x</p>
                   </div>
                </div>

                <div className="pt-8 space-y-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Podstawowe Wartości (Draft Mode)</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                         <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Dni robocze</span>
                         <input type="number" value={dictionaries.globalParams.workdays} onChange={e => updateGlobalParam('workdays', Number(e.target.value))} className="w-full font-black text-slate-900 outline-none text-sm" />
                      </div>
                      <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                         <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Cena MD (Grosz)</span>
                         <input type="number" value={dictionaries.globalParams.impl_day_price} onChange={e => updateGlobalParam('impl_day_price', Number(e.target.value))} className="w-full font-black text-slate-900 outline-none text-sm" />
                      </div>
                   </div>
                </div>
             </section>
           )}

           {activeSubSection === 'hubspot' && (
             <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                   <h4 className="text-xl font-black text-slate-900">Mapowanie HubSpot Product ID</h4>
                   <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-200">API Sync Ready</span>
                </div>
                <div className="space-y-6 pt-6">
                   <p className="text-xs font-medium text-slate-500">Zdefiniuj mapowanie produktów w HubSpot dla każdego trybu subskrypcji.</p>
                   <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           <tr>
                              <th className="px-6 py-4">Moduł</th>
                              <th className="px-6 py-4">Miesiąc (ID)</th>
                              <th className="px-6 py-4">Rok (ID)</th>
                              <th className="px-6 py-4">Wieczysta (ID)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {Object.keys(dictionaries.globalParams.basePrices || {}).map(mod => (
                             <tr key={mod} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-xs font-black text-slate-900">{mod.toUpperCase()}</td>
                                <td className="px-6 py-4"><input type="text" placeholder="261..." className="w-full bg-transparent border-none outline-none text-[10px] font-mono" /></td>
                                <td className="px-6 py-4"><input type="text" placeholder="261..." className="w-full bg-transparent border-none outline-none text-[10px] font-mono" /></td>
                                <td className="px-6 py-4"><input type="text" placeholder="261..." className="w-full bg-transparent border-none outline-none text-[10px] font-mono" /></td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                   </div>
                </div>
             </section>
           )}
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
