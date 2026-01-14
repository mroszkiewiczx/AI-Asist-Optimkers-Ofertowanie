
import React from 'react';
import { useSalesStore } from '../../store.ts';

const EmailSettings: React.FC = () => {
  const { settings, updateSMTP } = useSalesStore();

  const maskSecret = (secret: string) => {
    if (!secret || secret.length < 4) return "****";
    return `****${secret.slice(-4)}`;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Konfiguracja E-mail (8.2)</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Zarządzaj bramką pocztową SMTP oraz personalizacją stopki HTML.</p>
        </div>
        <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
           <i className="fas fa-save mr-2"></i> Auto-zapis aktywny
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* SMTP Config */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ustawienia Serwera SMTP</h4>
            <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black border border-slate-100">SSOT: EMAIL.SMTP</span>
          </div>

          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Serwer Host</label>
              <input 
                value={settings.smtp.host} 
                onChange={e => updateSMTP({ host: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Port</label>
              <input 
                type="number"
                value={settings.smtp.port} 
                onChange={e => updateSMTP({ port: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Użytkownik</label>
              <input 
                value={settings.smtp.username} 
                onChange={e => updateSMTP({ username: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Hasło (Secret)</label>
              <div className="relative">
                <input 
                  type="password"
                  value={settings.smtp.password_secret} 
                  onChange={e => updateSMTP({ password_secret: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300">
                  {maskSecret(settings.smtp.password_secret)}
                </div>
              </div>
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Szyfrowanie</label>
             <select 
               value={settings.smtp.encryption}
               onChange={e => updateSMTP({ encryption: e.target.value as any })}
               className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none cursor-pointer"
             >
                <option value="SSL_TLS">SSL/TLS</option>
                <option value="STARTTLS">STARTTLS</option>
                <option value="NONE">NONE (Brak)</option>
             </select>
          </div>

          <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs hover:bg-slate-800 transition-all uppercase tracking-[0.2em] shadow-2xl shadow-slate-200">
            <i className="fas fa-paper-plane mr-3 text-blue-400"></i> Wyślij Testowy E-mail
          </button>
        </section>

        {/* Signature Editor */}
        <section className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Podpis HTML (signature_html)</h4>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline leading-none">Użyj szablonu Optimakers</button>
            </div>
            <textarea 
              value={settings.smtp.footerHtml}
              onChange={e => updateSMTP({ footerHtml: e.target.value })}
              className="w-full h-48 bg-slate-50 text-slate-700 font-mono text-[11px] p-8 rounded-[2rem] border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
              placeholder="<p><b>Optimakers</b><br>...</p>"
            />
          </div>
          
          <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 px-6 py-2 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest border-l border-b border-slate-100 rounded-bl-2xl">Preview Sandbox</div>
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-50 pb-4 leading-none">Podgląd renderowania stopki</h5>
            <div 
              className="text-sm text-slate-700 leading-relaxed prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: settings.smtp.footerHtml }} 
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmailSettings;
