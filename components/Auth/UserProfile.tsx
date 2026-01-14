
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { authService } from '../../services/authService.ts';

const UserProfile: React.FC = () => {
  const { currentUser, logout } = useSalesStore();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
          <i className="fas fa-user-cog text-xl"></i>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ustawienia (Admin)</h1>
          <p className="text-slate-500 text-sm">Zarządzaj swoim kontem i uprawnieniami systemowymi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black mx-auto mb-4">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser.firstName} {currentUser.lastName}</h2>
            <p className="text-blue-600 font-bold text-sm">{currentUser.position}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 text-left space-y-4">
              <InfoItem icon="fa-envelope" label="Email" value={currentUser.email} />
              <InfoItem icon="fa-phone" label="Telefon" value={currentUser.phone || 'Brak'} />
              <InfoItem icon="fa-user-tag" label="Login" value={currentUser.login} />
            </div>

            <button 
              onClick={logout}
              className="w-full mt-8 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Wyloguj się</span>
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">8.1 Użytkownicy i uprawnienia (RBAC)</h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.permissions.map(p => (
                <span key={p} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {p.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <i className="fas fa-shield-alt text-blue-600 text-xl"></i>
              <h3 className="text-xl font-bold text-slate-900">Zmień Hasło</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Obecne Hasło</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nowe Hasło</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Potwierdź Nowe Hasło</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {status && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center ${
                  status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                  {status.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 disabled:bg-slate-300"
              >
                {isLoading ? 'Przetwarzanie...' : 'Aktualizuj Hasło'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3">
    <i className={`fas ${icon} text-slate-400 mt-1`}></i>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

export default UserProfile;
