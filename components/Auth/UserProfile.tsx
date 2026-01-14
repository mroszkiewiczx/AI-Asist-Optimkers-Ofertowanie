
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { authService } from '../../services/authService.ts';

const UserProfile: React.FC = () => {
  const { currentUser, logout, updateCurrentUserPreferences } = useSalesStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  // Initialize SMTP from user object or empty default
  const smtp = currentUser.smtpConfig || {
    host: '', port: 587, username: '', password_secret: '', encryption: 'STARTTLS', footerHtml: ''
  };

  const updateSmtp = (data: Partial<typeof smtp>) => {
    updateCurrentUserPreferences({ smtpConfig: { ...smtp, ...data } });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', msg: 'Hasła nie są identyczne' });
      return;
    }
    if (newPassword.length < 12) {
      setStatus({ type: 'error', msg: 'Hasło musi mieć min. 12 znaków' });
      return;
    }

    setIsLoading(true);
    try {
      await authService.changePassword(currentUser.id, oldPassword, newPassword);
      setStatus({ type: 'success', msg: 'Hasło zostało zmienione' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatus({ type: 'error', msg: 'Błąd podczas zmiany hasła' });
    } finally {
      setIsLoading(false);
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret || secret.length < 4) return "****";
    return `****${secret.slice(-4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
          {currentUser.avatar ? (
             <img src={currentUser.avatar} className="w-full h-full object-cover rounded-3xl" />
          ) : (
             <i className="fas fa-user-cog text-2xl"></i>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Twoje Konto</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Zarządzaj bezpieczeństwem, danymi i osobistą konfiguracją poczty.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Basic Info & Security */}
        <div className="lg:col-span-1 space-y-8">
          {/* Info Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-900">{currentUser.firstName} {currentUser.lastName}</h2>
            <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">{currentUser.position}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-left space-y-4">
              <InfoItem icon="fa-envelope" label="Email" value={currentUser.email} />
              <InfoItem icon="fa-phone" label="Telefon" value={currentUser.phone || 'Brak'} />
              <InfoItem icon="fa-shield-alt" label="Uprawnienia" value={`${currentUser.permissions.length} modułów`} />
            </div>

            <button 
              onClick={logout}
              className="w-full mt-8 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Wyloguj się</span>
            </button>
          </div>

          {/* Security Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Zmiana Hasła</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <input
                    type="password"
                    placeholder="Obecne hasło"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Nowe hasło (min 12 znaków)"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Potwierdź nowe hasło"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              {status && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center ${
                  status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg disabled:bg-slate-300"
              >
                {isLoading ? 'Przetwarzanie...' : 'Zmień Hasło'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Personal Email Configuration (Module 8.2 Logic) */}
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Konfiguracja Poczty Email</h3>
                    <p className="text-xs text-slate-500 font-bold mt-1">Skonfiguruj własny serwer SMTP, aby wysyłać oferty ze swojego adresu.</p>
                 </div>
                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-mail-bulk"></i></div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Host SMTP</label>
                       <input 
                         value={smtp.host} 
                         onChange={e => updateSmtp({ host: e.target.value })}
                         placeholder="smtp.office365.com"
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-200 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Port</label>
                       <input 
                         type="number"
                         value={smtp.port} 
                         onChange={e => updateSmtp({ port: Number(e.target.value) })}
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-200 transition-all"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login / Email</label>
                       <input 
                         value={smtp.username} 
                         onChange={e => updateSmtp({ username: e.target.value })}
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-200 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasło Aplikacji</label>
                       <input 
                         type="password"
                         value={smtp.password_secret} 
                         onChange={e => updateSmtp({ password_secret: e.target.value })}
                         placeholder={maskSecret(smtp.password_secret)}
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:bg-white focus:border-blue-200 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Szyfrowanie</label>
                    <select 
                      value={smtp.encryption}
                      onChange={e => updateSmtp({ encryption: e.target.value as any })}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 text-sm outline-none"
                    >
                       <option value="STARTTLS">STARTTLS (Zalecane)</option>
                       <option value="SSL_TLS">SSL/TLS</option>
                       <option value="NONE">Brak</option>
                    </select>
                 </div>

                 <div className="pt-6 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Twój Podpis HTML (Stopka)</label>
                    <textarea 
                      value={smtp.footerHtml}
                      onChange={e => updateSmtp({ footerHtml: e.target.value })}
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-slate-600 outline-none focus:bg-white focus:border-blue-200 transition-all resize-none"
                      placeholder="<p>Pozdrawiam, Imię Nazwisko</p>"
                    />
                    <div className="mt-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">PODGLĄD STOPKI</p>
                       <div className="text-sm text-slate-800" dangerouslySetInnerHTML={{ __html: smtp.footerHtml || '<span class="text-slate-300 italic">Brak stopki</span>' }} />
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2">
                       <i className="fas fa-save"></i>
                       <span>Zapisz Konfigurację</span>
                    </button>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 mt-0.5">
       <i className={`fas ${icon} text-xs`}></i>
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 leading-tight">{value}</p>
    </div>
  </div>
);

export default UserProfile;
