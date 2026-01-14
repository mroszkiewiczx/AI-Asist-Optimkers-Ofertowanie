
import React, { useState, useEffect, useRef } from 'react';
import { useSalesStore } from '../../store.ts';
import { authService } from '../../services/authService.ts';

const LoginScreen: React.FC = () => {
  // NOTE: Domyślne dane dla dewelopera / szybkiego testowania
  const [login, setLogin] = useState('m.roszkiewicz');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loginAction = useSalesStore(state => state.login);
  const autoLoginAttempted = useRef(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(login, password);
      loginAction(response.user, response.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * TODO: SECURITY - Wyłączyć autologowanie przed przejściem na produkcję!
   * Ta funkcja jest aktywna wyłącznie w celach przyspieszenia budowy aplikacji.
   */
  useEffect(() => {
    if (!autoLoginAttempted.current) {
      autoLoginAttempted.current = true;
      handleSubmit();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 text-white mb-6">
            <i className="fas fa-rocket text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kalkulator Inwestycji Optimakers</h1>
          <p className="text-slate-500 font-medium">B2B Sales Tool • Logowanie / Konto</p>
          <div className="mt-2 text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded inline-block uppercase tracking-widest">
            Tryb Deweloperski: Autologowanie aktywne
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Identyfikator</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  placeholder="m.roszkiewicz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Hasło</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center animate-in fade-in slide-in-from-top-2">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <span>Zaloguj się</span>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Wsparcie techniczne</p>
            <p className="text-sm text-slate-600 mt-2">IT Optimakers: +48 12 345 67 89</p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-slate-400 font-medium">
          Wersja produkcyjna v1.0.42 • Optimakers Sp. z o.o.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
