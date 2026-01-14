
import React from 'react';
import { useSalesStore } from '../../store.ts';

const RejestrIoPanel: React.FC = () => {
  const { research } = useSalesStore();
  const data = research.rejestrData;

  if (!data) return (
    <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-200">
       <i className="fas fa-database text-slate-200 text-6xl mb-6"></i>
       <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Brak danych finansowych. Uruchom research, aby pobrać raport KRS.</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in zoom-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Rating Card */}
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
           <i className="fas fa-shield-check absolute right-[-20px] bottom-[-20px] text-8xl opacity-10 -rotate-12"></i>
           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Kondycja Finansowa</p>
           <h4 className="text-4xl font-black tracking-tighter mb-6">{data.condition.rating}</h4>
           <div className="space-y-3">
              {data.condition.reasons.map((r, i) => (
                <div key={i} className="flex items-center space-x-3 text-[10px] font-bold text-white/60">
                   <i className="fas fa-check-circle text-green-400"></i>
                   <span>{r}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Financial Growth Chart (Visual Representation) */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between">
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Trend Przychodów (Ostatnie 3 lata)</h4>
           <div className="flex items-end space-x-8 h-48">
              {data.finances.map((f, i) => {
                const height = (f.revenue / 15000000) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                     <div className="relative w-full">
                        <div 
                          style={{ height: `${height}%` }} 
                          className="w-full bg-blue-600 rounded-t-2xl shadow-lg shadow-blue-200 transition-all group-hover:bg-blue-700"
                        ></div>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-900 whitespace-nowrap">{(f.revenue / 1000000).toFixed(1)}M PLN</div>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 mt-4">{f.year}</p>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* Financial Table */}
      <section className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="bg-slate-50 py-4 px-10 border-b border-slate-200 flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Szczegóły Sprawozdań Finansowych</h4>
            <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">Master Data (KRS)</span>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Rok</th>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Przychody Netto</th>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Zysk / Strata Netto</th>
                  <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Marża Netto</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {data.finances.map((f, i) => (
                 <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5 font-black text-slate-900">{f.year}</td>
                    <td className="px-10 py-5 font-bold text-slate-900">{f.revenue.toLocaleString()} PLN</td>
                    <td className="px-10 py-5 font-bold text-green-600">+{f.profit.toLocaleString()} PLN</td>
                    <td className="px-10 py-5 font-black text-blue-600 text-xs">{((f.profit / f.revenue) * 100).toFixed(1)}%</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </section>
    </div>
  );
};

export default RejestrIoPanel;
