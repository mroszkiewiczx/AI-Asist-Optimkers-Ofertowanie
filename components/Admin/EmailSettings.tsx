
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { SMTPConfig } from '../../types.ts';

const EmailSettings: React.FC = () => {
  const { settings, addSmtpIdentity, updateSmtpIdentity, removeSmtpIdentity, setSmtpDefault } = useSalesStore();
  const [activeIdentityId, setActiveIdentityId] = useState<string | null>(null);

  // If no identities, ensure one default exists (handled in store init, but safety check here)
  const identities = settings.smtpIdentities || [];
  
  // Select first identity on load if none selected
  React.useEffect(() => {
    if (!activeIdentityId && identities.length > 0) {
      setActiveIdentityId(identities[0].id || null);
    }
  }, [identities]);

  const activeIdentity = identities.find(i => i.id === activeIdentityId) || identities[0];

  const maskSecret = (secret: string) => {
    if (!secret || secret.length < 4) return "****";
    return `****${secret.slice(-4)}`;
  };

  const handleUpdate = (data: Partial<SMTPConfig>) => {
    if (activeIdentity) {
      updateSmtpIdentity(activeIdentity.id!, data);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Konfiguracja E-mail (8.2)</h3>
          <p className="text-slate-500 text-sm font-medium mt-1">Zarządzaj wieloma profilami wysyłkowymi SMTP (Tożsamości).</p>
        </div>
        <button 
          onClick={addSmtpIdentity}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 transition-all flex items-center space-x-2"
        >
           <i className="fas fa-plus"></i>
           <span>Dodaj Skrzynkę</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 flex-1 min-h-[500px]">
        
        {/* Sidebar: List of Identities */}
        <div className="lg:w-80 flex flex-col gap-4 overflow-y-auto">
           {identities.map(identity => (
             <div 
               key={identity.id}
               onClick={() => setActiveIdentityId(identity.id!)}
               className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative group ${
                 activeIdentityId === identity.id 
                   ? 'bg-blue-50 border-blue-500 shadow-md' 
                   : 'bg-white border-slate-100 hover:border-slate-300'
               }`}
             >
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${activeIdentityId === identity.id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                         <i className="fas fa-envelope"></i>
                      </div>
                      <span className="font-black text-xs uppercase tracking-wider text-slate-800">{identity.label || 'Bez nazwy'}</span>
                   </div>
                   {identity.isDefault && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-green-200">Domyślna</span>
                   )}
                </div>
                <p className="text-[10px] text-slate-500 font-mono truncate pl-10">{identity.username}</p>
                
                {activeIdentityId === identity.id && !identity.isDefault && (
                   <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); if(confirm('Usunąć?')) removeSmtpIdentity(identity.id!); }} className="w-6 h-6 bg-red-100 text-red-600 rounded flex items-center justify-center hover:bg-red-200">
                         <i className="fas fa-trash text-[10px]"></i>
                      </button>
                   </div>
                )}
             </div>
           ))}
        </div>

        {/* Main Config Area */}
        <div className="flex-1 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-y-auto">
           {activeIdentity ? (
             <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                   <div className="flex items-center space-x-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nazwa Profilu (Etykieta)</label>
                         <input 
                           value={activeIdentity.label}
                           onChange={e => handleUpdate({ label: e.target.value })}
                           className="text-xl font-black text-slate-900 bg-transparent outline-none border-b border-transparent hover:border-slate-200 focus:border-blue-500 transition-all placeholder:text-slate-300"
                           placeholder="Np. Biuro Zarządu"
                         />
                      </div>
                   </div>
                   {!activeIdentity.isDefault && (
                      <button 
                        onClick={() => setSmtpDefault(activeIdentity.id!)}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-600 transition-colors flex items-center space-x-2"
                      >
                         <i className="far fa-check-circle"></i>
                         <span>Ustaw jako Domyślną</span>
                      </button>
                   )}
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="col-span-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Serwer Host</label>
                    <input 
                      value={activeIdentity.host} 
                      onChange={e => handleUpdate({ host: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Port</label>
                    <input 
                      type="number"
                      value={activeIdentity.port} 
                      onChange={e => handleUpdate({ port: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Użytkownik / Email</label>
                    <input 
                      value={activeIdentity.username} 
                      onChange={e => handleUpdate({ username: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Hasło (Secret)</label>
                    <div className="relative">
                      <input 
                        type="password"
                        value={activeIdentity.password_secret} 
                        onChange={e => handleUpdate({ password_secret: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300 pointer-events-none">
                        {maskSecret(activeIdentity.password_secret)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Szyfrowanie</label>
                   <select 
                     value={activeIdentity.encryption}
                     onChange={e => handleUpdate({ encryption: e.target.value as any })}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 text-sm outline-none cursor-pointer"
                   >
                      <option value="SSL_TLS">SSL/TLS</option>
                      <option value="STARTTLS">STARTTLS</option>
                      <option value="NONE">NONE (Brak)</option>
                   </select>
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 leading-none">Stopka HTML</label>
                   <div className="grid grid-cols-2 gap-6">
                      <textarea 
                        value={activeIdentity.footerHtml}
                        onChange={e => handleUpdate({ footerHtml: e.target.value })}
                        className="w-full h-40 bg-slate-900 text-blue-300 font-mono text-[10px] p-6 rounded-2xl border border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        placeholder="<p><b>Optimakers</b><br>...</p>"
                      />
                      <div className="bg-white border border-slate-100 rounded-2xl p-6 overflow-hidden relative group">
                         <div className="absolute top-0 right-0 bg-slate-100 text-slate-400 text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-widest">Preview</div>
                         <div 
                           className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
                           dangerouslySetInnerHTML={{ __html: activeIdentity.footerHtml }} 
                         />
                      </div>
                   </div>
                </div>

                <div className="flex justify-end pt-4">
                   <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all uppercase tracking-[0.2em] shadow-lg">
                      <i className="fas fa-paper-plane mr-3 text-blue-400"></i> Wyślij Test
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <i className="fas fa-inbox text-6xl mb-4 opacity-20"></i>
                <p className="font-black text-xs uppercase tracking-widest">Wybierz skrzynkę z listy</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
