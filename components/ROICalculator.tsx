
import React from 'react';
import { useSalesStore } from '../store.ts';
import { AppTab } from '../types.ts';

const ROICalculator: React.FC = () => {
  const { 
    roiInputs, setRoiInputs, roiResults, resetROI, setActiveTab, dictionaries,
    addCommitteeMember, updateCommitteeMember, removeCommitteeMember, updateScheduleStep
  } = useSalesStore();

  const formatPLN = (grosz: number) => {
    return (grosz / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
  };

  const getStatusColorClass = (val: string) => {
    const v = val?.toLowerCase() || '';
    if (v === 'green' || v === 'optimakers_spelnia' || v === 'done') return 'bg-green-100 border-green-400';
    if (v === 'orange' || v === 'analiza' || v === 'in_progress') return 'bg-orange-100 border-orange-400';
    if (v === 'red' || v === 'nie_spelnia') return 'bg-red-100 border-red-400';
    return 'bg-slate-50 border-slate-200'; // ahead / gray / default
  };

  return (
    <div className="space-y-12 pb-48 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">1. Kalkulator ROI i Analiza Strat</h2>
          <p className="text-slate-500 font-medium">Zidentyfikuj obszary marnotrawstwa i oszacuj wpływ wdrożenia systemu Optimakers.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={resetROI} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
            Resetuj Dane
          </button>
        </div>
      </div>

      {/* 1.1 MARNOTRAWSTWO CZASU */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
        <SectionHeader icon="fa-clock" title="1.1 Marnotrawstwo Czasu" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <InputField label="Pracownicy produkcji" value={roiInputs.employees} onChange={v => setRoiInputs({ employees: v })} />
          <InputField label="Stawka godz. brutto [PLN]" value={roiInputs.hourlyRate / 100} onChange={v => setRoiInputs({ hourlyRate: Math.round(v * 100) })} />
          <InputField label="Minuty straty / pracownika" value={roiInputs.minutesPerEmployee} onChange={v => setRoiInputs({ minutesPerEmployee: v })} />
          <InputField label="Dni robocze w miesiącu" value={roiInputs.workdaysInMonth} onChange={v => setRoiInputs({ workdaysInMonth: v })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
          <ResultCard label="Marnowane minuty (dziennie)" value={`${roiResults.dailyMinutesTotal} min`} />
          <ResultCard label="Strata Miesięczna" value={formatPLN(roiResults.monthlyWasteCost)} />
          <ResultCard label="Strata Kwartalna" value={formatPLN(roiResults.quarterlyWasteCost)} />
          <ResultCard label="Strata Roczna" value={formatPLN(roiResults.annualWasteCost)} highlight />
        </div>
      </section>

      {/* 1.2 MAGAZYN I OBROTY */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
        <SectionHeader icon="fa-warehouse" title="1.2 Magazyn i Obroty" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <InputField label="Wartość magazynu [PLN]" value={roiInputs.inventoryValue / 100} onChange={v => setRoiInputs({ inventoryValue: Math.round(v * 100) })} />
          <InputField label="Roczne obroty [PLN]" value={roiInputs.annualTurnover / 100} onChange={v => setRoiInputs({ annualTurnover: Math.round(v * 100) })} />
          <InputField label="Optymalizacja magazynu [%]" value={roiInputs.inventoryOptPercent} onChange={v => setRoiInputs({ inventoryOptPercent: v })} suffix="%" />
          <InputField label="Utracony obrót [%]" value={roiInputs.lostTurnoverPercent} onChange={v => setRoiInputs({ lostTurnoverPercent: v })} suffix="%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-50">
          <ResultCard label="Oszczędność Cash-Flow" value={formatPLN(roiResults.inventorySaving)} />
          <ResultCard label="Odzyskany Utracony Obrót" value={formatPLN(roiResults.lostTurnoverValue)} />
        </div>
      </section>

      {/* 1.3 TOTAL IMPACT */}
      <section className="bg-slate-900 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <i className="fas fa-chart-line absolute right-[-20px] bottom-[-20px] text-[15rem] text-white/5 -rotate-12"></i>
        <div className="relative z-10 space-y-10">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-4">1.3 Podsumowanie Strat Rocznych (Cost of Inaction)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <SummaryStat label="Roczna Strata Czasu" value={formatPLN(roiResults.annualWasteCost)} />
            <SummaryStat label="Oszczędność Magazynowa" value={formatPLN(roiResults.inventorySaving)} />
            <SummaryStat label="Utracony Obrót" value={formatPLN(roiResults.lostTurnoverValue)} />
            <div className="bg-blue-600/20 p-8 rounded-3xl border border-blue-500/30">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 leading-none">Łączna korzyść (Grand Total)</p>
              <p className="text-4xl font-black text-white tracking-tighter">{formatPLN(roiResults.totalAnnualImpact)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 1.4 KRYTERIUM WYBORU */}
        <section className={`p-10 rounded-[2.5rem] border-2 shadow-sm space-y-6 transition-all duration-300 ${getStatusColorClass(roiInputs.providerCriteria)}`}>
          <SectionHeader icon="fa-check-circle" title="1.4 Kryterium Wyboru Dostawcy" />
          <div className="space-y-4">
             <label className="text-sm font-black text-slate-900 block mb-2">System spełnia potrzeby użytkowników?</label>
             <StatusSelect 
               value={roiInputs.providerCriteria} 
               onChange={v => setRoiInputs({ providerCriteria: v as any })}
               options={dictionaries.statuses}
             />
          </div>
        </section>

        {/* 1.6 KOMITET ZAKUPOWY */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <SectionHeader icon="fa-users" title="1.6 Komitet Zakupowy" />
            <button onClick={addCommitteeMember} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100">
               Dodaj osobę
            </button>
          </div>
          <div className="space-y-4">
             {roiInputs.buyingCommittee.map(member => (
               <div key={member.id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-5 rounded-2xl border-2 transition-all duration-300 ${getStatusColorClass(member.status === 'green' ? 'optimakers_spelnia' : member.status === 'orange' ? 'analiza' : 'nie_spelnia')}`}>
                 <div className="md:col-span-4">
                    <input placeholder="Imię i Nazwisko" className="w-full bg-transparent border-b border-slate-400 py-1 text-sm font-black text-black outline-none placeholder:text-slate-500" value={member.name} onChange={e => updateCommitteeMember(member.id, { name: e.target.value })} />
                 </div>
                 <div className="md:col-span-4">
                    <input placeholder="Stanowisko" className="w-full bg-transparent border-b border-slate-400 py-1 text-sm font-black text-black outline-none placeholder:text-slate-500" value={member.position} onChange={e => updateCommitteeMember(member.id, { position: e.target.value })} />
                 </div>
                 <div className="md:col-span-3">
                    <StatusSelect 
                      value={member.status === 'green' ? 'optimakers_spelnia' : member.status === 'orange' ? 'analiza' : 'nie_spelnia'}
                      onChange={v => updateCommitteeMember(member.id, { status: v === 'optimakers_spelnia' ? 'green' : v === 'analiza' ? 'orange' : 'red' })}
                      options={dictionaries.statuses}
                      small
                    />
                 </div>
                 <div className="md:col-span-1 text-right">
                    <button onClick={() => removeCommitteeMember(member.id)} className="text-slate-500 hover:text-red-600 transition-colors"><i className="fas fa-trash-alt"></i></button>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* 1.7 HARMONOGRAM WDROŻENIA */}
        <section className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
          <SectionHeader icon="fa-calendar-alt" title="1.7 Harmonogram Wdrożenia" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
             {roiInputs.schedule.map(step => (
               <div key={step.id} className={`flex items-center justify-between p-5 rounded-2xl border-l-4 border-2 transition-all duration-300 ${getStatusColorClass(step.status)}`}>
                 <span className="text-sm font-black text-black leading-tight pr-4">{step.label}</span>
                 <div className="flex items-center space-x-3">
                    <StatusSelect 
                      value={step.status} 
                      onChange={v => updateScheduleStep(step.id, { status: v as any })}
                      options={dictionaries.scheduleStatuses}
                      small
                    />
                    <div className="relative group">
                      <input 
                        type="date" 
                        title="Kliknij ikonę kalendarza po prawej, aby otworzyć wybór daty"
                        className="text-[10px] font-black text-black bg-white/80 border border-slate-300 rounded-lg pl-3 pr-10 py-2 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm min-w-[140px]" 
                        value={step.date}
                        onChange={e => updateScheduleStep(step.id, { date: e.target.value })}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 text-xs pointer-events-none group-hover:scale-125 transition-transform duration-200">
                        <i className="fas fa-calendar-day"></i>
                      </div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* 1.8 NOTATKI */}
        <section className="lg:col-span-2 space-y-4">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 block">Dodatkowe Ustalenia i Akcje</label>
           <textarea 
             className="w-full h-40 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-inner text-black font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
             value={roiInputs.additionalNotes}
             onChange={e => setRoiInputs({ additionalNotes: e.target.value })}
             placeholder="Wprowadź dodatkowe notatki z analizy..."
           />
        </section>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline space-x-3">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roczna Korzyść:</span>
             <span className="text-2xl font-black text-blue-600 tracking-tighter">{formatPLN(roiResults.totalAnnualImpact)}</span>
          </div>
          <div className="flex space-x-4">
             <button onClick={resetROI} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200">Wyczyść</button>
             <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Zapisz Roboczą</button>
             <button 
                onClick={() => setActiveTab(AppTab.CONFIG)}
                className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-3"
             >
                <span>Konfiguracja Licencji</span>
                <i className="fas fa-arrow-right"></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <div className="flex items-center space-x-4 mb-2">
    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm"><i className={`fas ${icon} text-lg`}></i></div>
    <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
  </div>
);

const InputField: React.FC<{ label: string; value: number; onChange: (v: number) => void; suffix?: string }> = ({ label, value, onChange, suffix }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-tight">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 font-black text-black focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
        value={value || ''} 
        onChange={e => onChange(Number(e.target.value))} 
      />
      {suffix && <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400 text-sm">{suffix}</span>}
    </div>
  </div>
);

const ResultCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-6 rounded-[2rem] border-2 transition-all ${highlight ? 'bg-blue-50 border-blue-100 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100'}`}>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">{label}</p>
    <p className={`text-xl font-black ${highlight ? 'text-blue-600' : 'text-black'}`}>{value}</p>
  </div>
);

const SummaryStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] text-blue-400/60 font-black uppercase tracking-widest mb-1 leading-none">{label}</p>
    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
  </div>
);

const StatusSelect: React.FC<{ value: string; onChange: (v: string) => void; options: any[]; small?: boolean }> = ({ value, onChange, options, small }) => {
  const current = options.find(o => o.id === value) || options[0];
  
  const getColorClass = (val: string) => {
    const v = val?.toLowerCase() || '';
    if (v === 'green' || v === 'optimakers_spelnia' || v === 'done') return 'bg-green-100 text-black border-green-400';
    if (v === 'orange' || v === 'analiza' || v === 'in_progress') return 'bg-orange-100 text-black border-orange-400';
    if (v === 'red' || v === 'nie_spelnia') return 'bg-red-100 text-black border-red-400';
    return 'bg-slate-50 text-black border-slate-300'; // ahead / gray / default
  };

  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={`appearance-none font-black rounded-xl border-2 transition-all cursor-pointer outline-none shadow-sm ${getColorClass(current.id)} ${small ? 'px-3 py-1.5 text-[10px] min-w-[120px]' : 'px-5 py-3 w-full text-sm'}`}
      >
        {options.map(o => (
          <option key={o.id} value={o.id} className="bg-white text-black font-bold">{o.label}</option>
        ))}
      </select>
      <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-black/40 text-[10px]`}></i>
    </div>
  );
};

export default ROICalculator;
