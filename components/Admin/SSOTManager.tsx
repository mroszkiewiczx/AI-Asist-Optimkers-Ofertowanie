
import React from 'react';
import { useSalesStore } from '../../store.ts';
import Dictionaries from '../Dictionaries.tsx';

const SSOTManager: React.FC = () => {
  const { dictionaries, settings, updateGlobalParam } = useSalesStore();

  const handleExportSSOT = () => {
    const data = {
      dictionaries,
      settings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Optimakers_SSOT_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">8.5 Baza danych / Konfiguracja (SSOT)</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Zarządzanie cennikami, ID i pakietami w jednym miejscu.</p>
        </div>
        <button 
          onClick={handleExportSSOT}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all"
        >
          Eksportuj SSOT (JSON)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Parametry Globalne</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dni robocze / m-c</label>
              <input 
                type="number" 
                value={dictionaries.globalParams.workdays}
                onChange={e => updateGlobalParam('workdays', Number(e.target.value))}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cena MD Wdrożenia (grosz)</label>
              <input 
                type="number" 
                value={dictionaries.globalParams.impl_day_price}
                onChange={e => updateGlobalParam('impl_day_price', Number(e.target.value))}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-900"
              />
            </div>
          </div>
        </section>

        <section>
          <Dictionaries />
        </section>
      </div>
    </div>
  );
};

export default SSOTManager;
