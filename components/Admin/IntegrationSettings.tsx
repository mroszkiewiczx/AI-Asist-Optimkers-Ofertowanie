
import React from 'react';
import { useSalesStore } from '../../store.ts';

const IntegrationSettings: React.FC<{ type: 'zapier' | 'hubspot' }> = ({ type }) => {
  const { settings, updateSettings } = useSalesStore();

  const isHubSpot = type === 'hubspot';
  const data = isHubSpot ? settings.hubspot : settings.zapier;

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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Private App Access Token</label>
              <input 
                type="password" 
                value={settings.hubspot.token_secret}
                onChange={e => updateSettings({ hubspot: { ...settings.hubspot, token_secret: e.target.value } })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
                placeholder="pat-na1-..."
              />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Webhook URL / API Endpoint</label>
            <input 
              type="text" 
              value={settings.zapier.webhookUrl}
              onChange={e => updateSettings({ zapier: { ...settings.zapier, webhookUrl: e.target.value } })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900"
            />
          </div>
        )}

        <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">
          Testuj połączenie
        </button>
      </div>
    </div>
  );
};

export default IntegrationSettings;
