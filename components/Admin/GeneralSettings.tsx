
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';

const GeneralSettings: React.FC = () => {
  const { currentUser, updateCurrentUserPreferences } = useSalesStore();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!currentUser) return null;

  const settings = currentUser.settings || {
    employeesDefault: 20,
    hourlyRateDefault: 5000,
    wastedMinutesDefault: 15,
    inventoryOptPercentDefault: 10,
    lostTurnoverPercentDefault: 5,
    dayRateDefault: 249900,
    hourRateDefault: 31238,
    locale: 'PL',
    timezone: 'Europe/Warsaw',
    currency: 'PLN'
  };

  const handleUpdate = (data: any) => {
    updateCurrentUserPreferences(data);
    setSaveMessage("Zapisano preferencje profilu.");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="max-w-5xl space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Mój Profil i Ustawienia</h3>
          <p className="text-slate-500 font-medium mt-1 text-sm">Zarządzaj swoimi danymi i domyślnymi parametrami kalkulatora.</p>
        </div>
        {saveMessage && (
            <div className="bg-green-100 text-green-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest animate-in zoom-in flex items-center">
                <i className="fas fa-check-circle mr-2"></i> {saveMessage}
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Profile Card */}
        <section className="space-y-6">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <i className="fas fa-id-badge text-blue-500"></i>
              <span>DANE UŻYTKOWNIKA</span>
           </h4>
           <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-8 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center space-x-6">
                 <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-blue-200">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                 </div>
                 <div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1">{currentUser.position}</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-4">
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser.email}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rola</span>
                    <span className="text-sm font-bold text-slate-900">{currentUser.role}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    <span className="text-[9px] font-black text-green-600 uppercase px-3 py-1 bg-green-100 rounded-full border border-green-200 shadow-sm">{currentUser.status}</span>
                 </div>
              </div>
           </div>
        </section>

        {/* Preferences - THE SECTION FROM SCREENSHOT */}
        <section className="space-y-6">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
              <i className="fas fa-globe text-blue-500"></i>
              <span>PREFERENCJE APLIKACJI</span>
           </h4>
           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-8 transition-all hover:border-slate-100">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Język Interfejsu</label>
                 <select 
                   value={settings.locale} 
                   onChange={e => handleUpdate({ locale: e.target.value })}
                   className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none cursor-pointer"
                 >
                    <option value="PL">Polski (PL)</option>
                    <option value="EN">English (EN)</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Strefa Czasowa</label>
                 <select 
                   value={settings.timezone}
                   onChange={e => handleUpdate({ timezone: e.target.value })}
                   className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none cursor-pointer"
                 >
                    <option value="Europe/Warsaw">Europe/Warsaw (GMT+1)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Domyślna Waluta</label>
                 <select 
                   value={settings.currency}
                   onChange={e => handleUpdate({ currency: e.target.value })}
                   className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all appearance-none cursor-pointer"
                 >
                    <option value="PLN">PLN - Złoty polski</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dolar amerykański</option>
                 </select>
              </div>
           </div>
        </section>
      </div>

      {/* Calculator Prefill */}
      <section className="space-y-8 pt-8 border-t border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center space-x-2">
           <i className="fas fa-calculator text-blue-500"></i>
           <span>DOMYŚLNE WARTOŚCI KALKULATORA</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Liczba pracowników</label>
              <input 
                type="number" 
                value={settings.employeesDefault} 
                onChange={e => handleUpdate({ employeesDefault: Number(e.target.value) })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
           </div>
           <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Stawka brutto (PLN)</label>
              <input 
                type="number" 
                value={settings.hourlyRateDefault / 100} 
                onChange={e => handleUpdate({ hourlyRateDefault: Number(e.target.value) * 100 })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
           </div>
           <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Minuty straty / prac.</label>
              <input 
                type="number" 
                value={settings.wastedMinutesDefault} 
                onChange={e => handleUpdate({ wastedMinutesDefault: Number(e.target.value) })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
           </div>
           <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dzień roboczy (PLN)</label>
              <input 
                type="number" 
                value={settings.dayRateDefault / 100} 
                onChange={e => handleUpdate({ dayRateDefault: Number(e.target.value) * 100 })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
           </div>
           <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Optymalizacja Magazynu (%)</label>
              <input 
                type="number" 
                value={settings.inventoryOptPercentDefault} 
                onChange={e => handleUpdate({ inventoryOptPercentDefault: Number(e.target.value) })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
           </div>
           <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Utracony Obrót (%)</label>
              <input 
                type="number" 
                value={settings.lostTurnoverPercentDefault} 
                onChange={e => handleUpdate({ lostTurnoverPercentDefault: Number(e.target.value) })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
              />
           </div>
        </div>
      </section>

      <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-6 pb-20">
          <button className="px-10 py-5 bg-white border border-slate-200 text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-slate-50 active:scale-95">
            PRZYWRÓĆ DOMYŚLNE
          </button>
          <button onClick={() => handleUpdate({})} className="px-14 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3">
             <i className="fas fa-save"></i>
             <span>ZAPISZ MOJE USTAWIENIA</span>
          </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
