
import React, { useState } from 'react';
import { useSalesStore } from '../store.ts';
import { DictionaryEntry, Dictionaries as DictionariesType } from '../types.ts';
import { HS_PRODUCT_MAP } from '../constants.ts';

const Dictionaries: React.FC = () => {
  const { dictionaries, updateDictionary, updateGlobalParam } = useSalesStore();
  const [activeTab, setActiveTab] = useState<keyof DictionariesType | 'licenseMatrix' | 'globalParams'>('statuses');

  const tabs: { id: any; label: string }[] = [
    { id: 'integrations', label: '7.1 Integracje' },
    { id: 'licenseMatrix', label: '7.2 Cennik Licencji' },
    { id: 'implementationPackages', label: '7.3 Wdrożenie' },
    { id: 'supportPackages', label: '7.3 Opieka SLA' },
    { id: 'globalParams', label: '7.4 Stałe Globalne' },
  ];

  const handleAddEntry = () => {
    if (activeTab === 'globalParams' || activeTab === 'licenseMatrix') return;
    const newEntry: DictionaryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'Nowa pozycja',
      value: '',
      is_active: true,
      sort_order: (dictionaries[activeTab as keyof DictionariesType] as DictionaryEntry[]).length + 1,
    };
    updateDictionary(activeTab as keyof DictionariesType, [...(dictionaries[activeTab as keyof DictionariesType] as DictionaryEntry[]), newEntry]);
  };

  const handleUpdateEntry = (id: string, data: Partial<DictionaryEntry>) => {
    if (activeTab === 'globalParams' || activeTab === 'licenseMatrix') return;
    updateDictionary(activeTab as keyof DictionariesType, (dictionaries[activeTab as keyof DictionariesType] as DictionaryEntry[]).map(e => e.id === id ? { ...e, ...data } : e));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
      <div className="bg-slate-900 p-10 text-white">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-1">Moduł 7: Słowniki (Master Data)</h2>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">System Source of Truth Configuration</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-10 flex-1 bg-white">
        {activeTab === 'licenseMatrix' ? (
          <div className="space-y-6">
             <h3 className="text-xl font-black text-slate-900">7.2 Macierz Licencji i Mapowanie HubSpot</h3>
             <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Moduł</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Cena (M)</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">HS ID (M)</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Cena (R)</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">HS ID (R)</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Cena (W)</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">HS ID (W)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-[10px]">
                    {dictionaries.modules.map(mod => {
                      const hsIds = (HS_PRODUCT_MAP.modules as any)[mod.id] || {};
                      return (
                        <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-sans font-black text-xs text-slate-900">{mod.label}</td>
                          <td className="px-6 py-4 text-center">{(dictionaries.globalParams.basePrices?.[mod.id] || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center text-blue-600 font-bold">{hsIds.monthly || '-'}</td>
                          <td className="px-6 py-4 text-center">{( (dictionaries.globalParams.basePrices?.[mod.id] || 0) * 12).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center text-blue-600 font-bold">{hsIds.yearly || '-'}</td>
                          <td className="px-6 py-4 text-center">{( (dictionaries.globalParams.basePrices?.[mod.id] || 0) * 60).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center text-blue-600 font-bold">{hsIds.perpetual || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        ) : activeTab === 'globalParams' ? (
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-xl font-black text-slate-900">7.4 Stałe Globalne</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(dictionaries.globalParams).filter(([k]) => typeof dictionaries.globalParams[k] === 'number').map(([key, val]) => (
                <div key={key} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{key.replace(/_/g, ' ')}</label>
                  <input
                    type="number" step="0.01"
                    value={val as number}
                    onChange={e => updateGlobalParam(key, Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-black text-slate-900 text-lg shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900">Edycja: {tabs.find(t => t.id === activeTab)?.label}</h3>
              <button onClick={handleAddEntry} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Dodaj wiersz</button>
            </div>
            <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Etykieta</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aktywny</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(dictionaries[activeTab as keyof DictionariesType] as DictionaryEntry[]).map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-10 py-5">
                        <input
                          value={entry.label}
                          onChange={e => handleUpdateEntry(entry.id, { label: e.target.value })}
                          className="w-full bg-transparent font-black text-slate-900 text-sm outline-none"
                        />
                      </td>
                      <td className="px-10 py-5 text-center">
                        <input
                          type="checkbox"
                          checked={entry.is_active}
                          onChange={e => handleUpdateEntry(entry.id, { is_active: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dictionaries;
