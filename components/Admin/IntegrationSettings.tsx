
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';

const IntegrationSettings: React.FC<{ type: 'zapier' | 'hubspot' }> = ({ type }) => {
  const { settings, updateSettings, currentUser } = useSalesStore();
  const [zapierAuthStatus, setZapierAuthStatus] = useState<'IDLE' | 'AUTH' | 'SUCCESS'>('IDLE');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);

  const isHubSpot = type === 'hubspot';
  const data = isHubSpot ? settings.hubspot : settings.zapier;

  // OAuth Flow
  const handleZapierLogin = () => {
    setZapierAuthStatus('AUTH');
    setTimeout(() => {
        setZapierAuthStatus('SUCCESS');
        updateSettings({ 
            zapier: { 
                ...settings.zapier, 
                isConnected: true,
                zapierToken: `oauth-mock-token-${Math.random().toString(36).substr(2)}`
            } 
        });
    }, 2000);
  };

  // API Key Flow
  const handleZapierApiKeyConnect = () => {
    if (!settings.zapier.token_secret || settings.zapier.token_secret.length < 5) {
        alert("Wprowadź prawidłowy klucz API.");
        return;
    }
    setApiKeyLoading(true);
    // Simulate API validation
    setTimeout(() => {
        setApiKeyLoading(false);
        updateSettings({ 
            zapier: { 
                ...settings.zapier, 
                isConnected: true 
            } 
        });
        alert("Połączono pomyślnie używając klucza API.");
    }, 1000);
  };

  const handleZapierLogout = () => {
    if (confirm("Czy na pewno chcesz rozłączyć integrację z Zapier?")) {
        updateSettings({ 
            zapier: { 
                ...settings.zapier, 
                isConnected: false, 
                zapierToken: undefined,
                token_secret: '' // Clear API key on logout as well
            } 
        });
        setZapierAuthStatus('IDLE');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            {isHubSpot ? '8.4 Konfiguracja HubSpot API' : '8.3 Konfiguracja Zapier'}
          </h3>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Zarządzaj autoryzacją i połączeniem z systemem zewnętrznym.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
          data.isConnected ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          {data.isConnected ? 'POŁĄCZONO' : 'BRAK POŁĄCZENIA'}
        </div>
      </div>

      <div className="space-y-8 max-w-2xl">
        {isHubSpot ? (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal ID (Hub ID)</label>
              <input 
                type="text" 
                value={settings.hubspot.portalId}
                onChange={e => updateSettings({ hubspot: { ...settings.hubspot, portalId: e.target.value } })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Private App Access Token</label>
              <input 
                type="password" 
                value={settings.hubspot.token_secret}
                onChange={e => updateSettings({ hubspot: { ...settings.hubspot, token_secret: e.target.value } })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="pat-na1-..."
              />
            </div>
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">
              Testuj połączenie
            </button>
          </>
        ) : (
          <div className="space-y-8">
            {/* Metoda 1: OAuth */}
            <div className="p-8 bg-orange-50 border border-orange-100 rounded-[2.5rem] text-center space-y-6">
                <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                    <span className="font-black text-orange-500 text-2xl">*</span>
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900">Autoryzacja OAuth 2.0</h4>
                    <p className="text-xs text-slate-500 font-medium mt-2 max-w-xs mx-auto">
                        Standardowa metoda logowania przez konto Zapier.
                    </p>
                </div>
                
                {zapierAuthStatus === 'AUTH' ? (
                    <div className="py-4 flex flex-col items-center">
                        <i className="fas fa-circle-notch fa-spin text-2xl text-orange-500 mb-2"></i>
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Autoryzacja w toku...</span>
                    </div>
                ) : settings.zapier.isConnected && !settings.zapier.token_secret ? ( // Show logged in if connected via OAuth (no manual secret)
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-green-100 text-green-700 px-6 py-3 rounded-xl inline-flex items-center font-bold text-sm">
                            <i className="fas fa-check-circle mr-2"></i>
                            Zalogowano OAuth: {currentUser?.email}
                        </div>
                        <button 
                            onClick={handleZapierLogout}
                            className="text-red-500 text-xs font-black uppercase tracking-widest hover:text-red-700 transition-colors flex items-center space-x-2"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Wyloguj / Rozłącz</span>
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleZapierLogin}
                        // Disable OAuth button if manually connected
                        disabled={settings.zapier.isConnected && !!settings.zapier.token_secret}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center space-x-3 ${
                            settings.zapier.isConnected ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#FF4F00] hover:bg-[#E04600] text-white shadow-orange-200'
                        }`}
                    >
                        <span>Zaloguj przez Zapier</span>
                        <i className="fas fa-external-link-alt"></i>
                    </button>
                )}
            </div>

            {/* Separator */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">LUB PODA KLUCZ RĘCZNIE</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Metoda 2: API Key */}
            <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                    <i className="fas fa-key text-slate-400"></i>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zapier Secret API Key</label>
                </div>
                <div className="flex space-x-3">
                    <input 
                        type="password" 
                        value={settings.zapier.token_secret || ''}
                        onChange={e => updateSettings({ zapier: { ...settings.zapier, token_secret: e.target.value } })}
                        className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:font-normal"
                        placeholder="np. zap_v1_SecretKey..."
                        disabled={settings.zapier.isConnected && !settings.zapier.token_secret} // Disable if connected via OAuth
                    />
                    {settings.zapier.isConnected && settings.zapier.token_secret ? (
                        <button 
                            onClick={handleZapierLogout}
                            className="px-6 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black text-xs uppercase hover:bg-red-100 transition-all"
                        >
                            Rozłącz
                        </button>
                    ) : (
                        <button 
                            onClick={handleZapierApiKeyConnect}
                            disabled={apiKeyLoading || (settings.zapier.isConnected && !settings.zapier.token_secret)}
                            className="px-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase hover:bg-slate-800 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg"
                        >
                            {apiKeyLoading ? <i className="fas fa-circle-notch fa-spin"></i> : "Połącz"}
                        </button>
                    )}
                </div>
                <p className="text-[10px] text-slate-400 px-2 leading-relaxed">
                    Użyj tej metody dla integracji server-side bez przekierowań OAuth. Klucz wygenerujesz w ustawieniach deweloperskich Zapier (Platform UI).
                </p>
            </div>

            <div className="space-y-2 opacity-50 pointer-events-none pt-4 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Webhook URL (Auto-Generated)</label>
                <input 
                type="text" 
                value={settings.zapier.webhookUrl}
                readOnly
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-xs font-mono"
                />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationSettings;
