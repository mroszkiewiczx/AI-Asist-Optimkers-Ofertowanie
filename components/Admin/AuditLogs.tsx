
import React, { useEffect } from 'react';
import { useSalesStore } from '../../store.ts';

const AuditLogs: React.FC = () => {
  const { auditLogs, refreshAuditLogs } = useSalesStore();

  useEffect(() => {
    refreshAuditLogs();
    const interval = setInterval(refreshAuditLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">8.6 Logi Systemowe (Audit Log)</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">Śledzenie krytycznych zmian i zdarzeń bezpieczeństwa w systemie.</p>
        </div>
        <button 
          onClick={refreshAuditLogs}
          className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-100 shadow-sm transition-all"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sygnatura Czasowa</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Akcja / Zdarzenie</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Użytkownik</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Szczegóły Techniczne</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6 font-mono text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleString('pl-PL')}
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-tight border ${
                      log.level === 'ERROR' ? 'bg-red-50 text-red-600 border-red-100' : 
                      log.level === 'WARN' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {log.message}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                     <p className="font-black text-slate-900 leading-none">{log.login}</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">IP: {log.ip}</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="font-mono text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg max-w-[300px] truncate group relative">
                        {JSON.stringify(log.meta)}
                        <span className="hidden group-hover:block absolute z-50 bg-slate-900 text-white p-2 rounded top-full left-0 whitespace-pre text-[9px]">
                           {JSON.stringify(log.meta, null, 2)}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center text-slate-400 font-medium italic">
                    Brak zarejestrowanych zdarzeń w bieżącej sesji operacyjnej.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
