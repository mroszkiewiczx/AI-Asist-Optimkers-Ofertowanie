
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
    if (v === 'green' || v === 'optimakers_spelnia' || v === 'done') return 'bg-green-500/20 border-green-500/50 text-green-100';
    if (v === 'orange' || v === 'analiza' || v === 'in_progress') return 'bg-orange-500/20 border-orange-500/50 text-orange-100';
    if (v === 'red' || v === 'nie_spelnia') return 'bg-red-500/20 border-red-500/50 text-red-100';
    return 'bg-white/5 border-white/10 text-slate-300';
  };

  return (
    <div className="space-y-12 pb-48 animate-in fade-in duration-700">
      {/* HEADER CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2 drop-shadow-md">
            ROI CALCULATOR
          </h2>
          <p className="text-blue-200 font-medium tracking-wide uppercase text-[10px]">Analyze waste & Estimate Impact</p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={resetROI} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 backdrop-blur-sm">
            Reset Data
          </button>
        </div>
      </div>

      {/* 1.1 MARNOTRAWSTWO CZASU */}
      <section className="bg-white/5 backdrop-blur-lg p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-500/30 rounded-full blur-[80px]"></div>
        
        <SectionHeader icon="fa-clock" title="1.1 Time Waste Analysis" color="text-cyan-400" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          <InputField label="Production Employees" value={roiInputs.employees} onChange={v => setRoiInputs({ employees: v })} />
          <InputField label="Hourly Rate (Gross PLN)" value={roiInputs.hourlyRate / 100} onChange={v => setRoiInputs({ hourlyRate: Math.round(v * 100) })} />
          <InputField label="Wasted Minutes / Person" value={roiInputs.minutesPerEmployee} onChange={v => setRoiInputs({ minutesPerEmployee: v })} />
          <InputField label="Workdays / Month" value={roiInputs.workdaysInMonth} onChange={v => setRoiInputs({ workdaysInMonth: v })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-10 border-t border-white/10 relative z-10">
          <ResultCard label="Daily Wasted Minutes" value={`${roiResults.dailyMinutesTotal} min`} />
          <ResultCard label="Monthly Loss" value={formatPLN(roiResults.monthlyWasteCost)} />
          <ResultCard label="Quarterly Loss" value={formatPLN(roiResults.quarterlyWasteCost)} />
          <ResultCard label="Annual Loss" value={formatPLN(roiResults.annualWasteCost)} highlight />
        </div>
      </section>

      {/* 1.2 MAGAZYN I OBROTY */}
      <section className="bg-white/5 backdrop-blur-lg p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-purple-500/30 rounded-full blur-[80px]"></div>

        <SectionHeader icon="fa-warehouse" title="1.2 Inventory & Turnover" color="text-purple-400" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          <InputField label="Inventory Value [PLN]" value={roiInputs.inventoryValue / 100} onChange={v => setRoiInputs({ inventoryValue: Math.round(v * 100) })} />
          <InputField label="Annual Turnover [PLN]" value={roiInputs.annualTurnover / 100} onChange={v => setRoiInputs({ annualTurnover: Math.round(v * 100) })} />
          <InputField label="Inventory Optimization [%]" value={roiInputs.inventoryOptPercent} onChange={v => setRoiInputs({ inventoryOptPercent: v })} suffix="%" />
          <InputField label="Lost Turnover [%]" value={roiInputs.lostTurnoverPercent} onChange={v => setRoiInputs({ lostTurnoverPercent: v })} suffix="%" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/10 relative z-10">
          <ResultCard label="Cash-Flow Savings" value={formatPLN(roiResults.inventorySaving)} />
          <ResultCard label="Recovered Turnover" value={formatPLN(roiResults.lostTurnoverValue)} />
        </div>
      </section>

      {/* 1.3 TOTAL IMPACT */}
      <section className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-12 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/10">
        {/* Abstract shapes overlay */}
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-t from-orange-600 to-pink-600 rounded-full blur-[100px] opacity-40"></div>

        <div className="relative z-10 space-y-10">
          <h3 className="text-xs font-black text-cyan-400 uppercase tracking-[0.4em] mb-4">1.3 Cost of Inaction (Annual)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <SummaryStat label="Time Waste Cost" value={formatPLN(roiResults.annualWasteCost)} />
            <SummaryStat label="Inventory Savings" value={formatPLN(roiResults.inventorySaving)} />
            <SummaryStat label="Lost Turnover" value={formatPLN(roiResults.lostTurnoverValue)} />
            <div className="bg-white/10 p-8 rounded-3xl border border-white/20 backdrop-blur-md shadow-lg">
              <p className="text-[10px] font-black text-cyan-300 uppercase tracking-widest mb-2 leading-none">Grand Total Benefit</p>
              <p className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">{formatPLN(roiResults.totalAnnualImpact)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 1.4 KRYTERIUM WYBORU */}
        <section className={`p-10 rounded-[2.5rem] border backdrop-blur-md transition-all duration-300 ${getStatusColorClass(roiInputs.providerCriteria)}`}>
          <SectionHeader icon="fa-check-circle" title="1.4 Provider Criteria" color="text-white" />
          <div className="space-y-4 mt-6">
             <label className="text-sm font-bold text-white block mb-2">Does the system meet user needs?</label>
             <StatusSelect 
               value={roiInputs.providerCriteria} 
               onChange={v => setRoiInputs({ providerCriteria: v as any })}
               options={dictionaries.statuses}
             />
          </div>
        </section>

        {/* 1.6 KOMITET ZAKUPOWY */}
        <section className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-lg space-y-8">
          <div className="flex justify-between items-center">
            <SectionHeader icon="fa-users" title="1.6 Buying Committee" color="text-white" />
            <button onClick={addCommitteeMember} className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
               Add Member
            </button>
          </div>
          <div className="space-y-3">
             {roiInputs.buyingCommittee.map(member => (
               <div key={member.id} className={`grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-4 rounded-xl border transition-all ${getStatusColorClass(member.status === 'green' ? 'optimakers_spelnia' : member.status === 'orange' ? 'analiza' : 'nie_spelnia')}`}>
                 <div className="md:col-span-4">
                    <input placeholder="Name & Surname" className="w-full bg-transparent border-b border-white/20 py-1 text-xs font-bold text-white outline-none placeholder:text-white/30" value={member.name} onChange={e => updateCommitteeMember(member.id, { name: e.target.value })} />
                 </div>
                 <div className="md:col-span-4">
                    <input placeholder="Position" className="w-full bg-transparent border-b border-white/20 py-1 text-xs font-bold text-white outline-none placeholder:text-white/30" value={member.position} onChange={e => updateCommitteeMember(member.id, { position: e.target.value })} />
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
                    <button onClick={() => removeCommitteeMember(member.id)} className="text-white/40 hover:text-red-400 transition-colors"><i className="fas fa-trash-alt"></i></button>
                 </div>
               </div>
             ))}
             {roiInputs.buyingCommittee.length === 0 && (
               <p className="text-xs text-white/30 italic text-center py-4 border border-dashed border-white/10 rounded-xl">No members added.</p>
             )}
          </div>
        </section>

        {/* 1.7 HARMONOGRAM WDROŻENIA */}
        <section className="lg:col-span-2 bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-lg space-y-8">
          <SectionHeader icon="fa-calendar-alt" title="1.7 Implementation Schedule" color="text-white" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
             {roiInputs.schedule.map(step => (
               <div key={step.id} className={`flex flex-col p-5 rounded-xl border-l-4 transition-all bg-white/5 ${
                 step.status === 'done' ? 'border-l-green-500' : 
                 step.status === 'in_progress' ? 'border-l-orange-500' : 
                 'border-l-slate-600'
               }`}>
                 <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-4">
                       <span className="text-sm font-bold text-white leading-tight block mb-1">{step.label}</span>
                       <p className="text-[10px] text-blue-200 font-medium leading-relaxed">{step.description}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                       <StatusSelect 
                         value={step.status} 
                         onChange={v => updateScheduleStep(step.id, { status: v as any })}
                         options={dictionaries.scheduleStatuses}
                         small
                       />
                       <input 
                         type="date" 
                         className="text-[10px] font-bold text-white bg-black/20 border border-white/10 rounded-md pl-2 pr-1 py-1 outline-none focus:border-blue-500 cursor-pointer shadow-sm w-[110px]" 
                         value={step.date}
                         onChange={e => updateScheduleStep(step.id, { date: e.target.value })}
                       />
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* 1.8 NOTATKI */}
        <section className="lg:col-span-2 space-y-4">
           <label className="text-[10px] font-black text-blue-200 uppercase tracking-widest leading-none mb-2 block">Additional Notes & Actions</label>
           <textarea 
             className="w-full h-32 p-6 bg-black/20 border border-white/10 rounded-[2rem] shadow-inner text-white text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-white/20"
             value={roiInputs.additionalNotes}
             onChange={e => setRoiInputs({ additionalNotes: e.target.value })}
             placeholder="Enter notes here..."
           />
        </section>
      </div>

      {/* STICKY BOTTOM ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#000428]/90 backdrop-blur-xl border-t border-white/10 p-6 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline space-x-3">
             <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Total Benefit:</span>
             <span className="text-2xl font-black text-cyan-400 tracking-tighter drop-shadow-md">{formatPLN(roiResults.totalAnnualImpact)}</span>
          </div>
          <div className="flex space-x-4">
             <button onClick={resetROI} className="px-6 py-3 bg-white/5 text-white/60 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">Clear</button>
             <button className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg border border-white/5">Save Draft</button>
             <button 
                onClick={() => setActiveTab(AppTab.CONFIG)}
                className="px-10 py-4 bg-gradient-to-r from-[#FF512F] to-[#DD2476] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center space-x-3"
             >
                <span>Configure License</span>
                <i className="fas fa-arrow-right"></i>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: string; title: string; color?: string }> = ({ icon, title, color = 'text-white' }) => (
  <div className="flex items-center space-x-4 mb-2">
    <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${color} border border-white/10 shadow-sm backdrop-blur-sm`}><i className={`fas ${icon} text-lg`}></i></div>
    <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
  </div>
);

const InputField: React.FC<{ label: string; value: number; onChange: (v: number) => void; suffix?: string }> = ({ label, value, onChange, suffix }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2 leading-tight">{label}</label>
    <div className="relative">
      <input 
        type="number" 
        className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 px-6 font-bold text-white focus:ring-2 focus:ring-cyan-500 focus:bg-black/40 transition-all outline-none"
        value={value || ''} 
        onChange={e => onChange(Number(e.target.value))} 
      />
      {suffix && <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-white/40 text-sm">{suffix}</span>}
    </div>
  </div>
);

const ResultCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${
    highlight 
      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
      : 'bg-white/5 border-white/10'
  }`}>
    <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.2em] mb-2 leading-none">{label}</p>
    <p className={`text-xl font-black ${highlight ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
  </div>
);

const SummaryStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1 leading-none">{label}</p>
    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
  </div>
);

const StatusSelect: React.FC<{ value: string; onChange: (v: string) => void; options: any[]; small?: boolean }> = ({ value, onChange, options, small }) => {
  const current = options.find(o => o.id === value) || options[0];
  
  const getColorClass = (val: string) => {
    const v = val?.toLowerCase() || '';
    if (v === 'green' || v === 'optimakers_spelnia' || v === 'done') return 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/20';
    if (v === 'orange' || v === 'analiza' || v === 'in_progress') return 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20';
    if (v === 'red' || v === 'nie_spelnia') return 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20';
    return 'bg-white/10 text-white border-white/20 hover:bg-white/20'; 
  };

  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className={`appearance-none font-bold rounded-xl border transition-all cursor-pointer outline-none ${getColorClass(current.id)} ${small ? 'px-3 py-1.5 text-[10px] min-w-[120px]' : 'px-5 py-3 w-full text-sm'}`}
      >
        {options.map(o => (
          <option key={o.id} value={o.id} className="bg-slate-900 text-white">{o.label}</option>
        ))}
      </select>
      <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${small ? 'text-[8px]' : 'text-xs'} text-white/70`}></i>
    </div>
  );
};

export default ROICalculator;
