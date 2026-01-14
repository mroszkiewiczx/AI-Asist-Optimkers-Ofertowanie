
import React from 'react';
import { useSalesStore } from '../store.ts';

const LineItemsManager: React.FC = () => {
  const { getHubSpotLineItems, clientData } = useSalesStore();
  const items = getHubSpotLineItems();

  const formatPLN = (grosz: number) => (grosz / 100).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">5. Management Konfiguratora (Line_Items)</h2>
          <p className="text-slate-500 font-medium mt-1">SSOT Pozycji Handlowych do eksportu HubSpot / Quote</p>
        </div>
        <div className="px-5 py-2.5 bg-orange-50 text-orange-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-100">
           Baza transakcyjna
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">A: HS Product ID</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">B: Product Name</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">C: Quantity</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">D: Price_Single (Net)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-mono text-[10px] text-slate-400">{item.productId}</td>
                <td className="px-8 py-5">
                   <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">{item.name}</span>
                      {item.source === 'manual' && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded uppercase">Manual</span>}
                   </div>
                   <p className="text-[9px] text-blue-500 font-bold uppercase mt-1 opacity-60">{item.category}</p>
                </td>
                <td className="px-8 py-5 text-center font-black text-slate-900 text-sm">{item.quantity}</td>
                <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">{formatPLN(item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">This Sheet Link (Google Sheets Reference)</label>
           <button onClick={() => clientData?.googleSheetLink && navigator.clipboard.writeText(clientData.googleSheetLink)} className="text-[10px] font-black text-blue-600 hover:underline">Kopiuj Link</button>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 font-mono text-xs text-slate-500 break-all leading-relaxed">
           {clientData?.googleSheetLink || "Brak podpiętego arkusza (ZDeal Link)"}
        </div>
      </div>
    </div>
  );
};

export default LineItemsManager;
