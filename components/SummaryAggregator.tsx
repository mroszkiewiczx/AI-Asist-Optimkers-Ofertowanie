
import React, { useState } from 'react';
import { useSalesStore } from '../store.ts';
import ROICalculator from './ROICalculator.tsx';
import LicenseConfigurator from './LicenseConfigurator.tsx';
import ScopeOfWork from './ScopeOfWork.tsx';
import { AppTab } from '../types.ts';

const SummaryAggregator: React.FC = () => {
  const { getValidationStatus, clientData, setActiveTab } = useSalesStore();
  const [editMode, setEditMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['roi', 'config', 'scope']);
  const validation = getValidationStatus();

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-12 pb-48 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Moduł 6: Podsumowanie kalkulacji</h2>
          <div className="flex items-center space-x-4 mt-2">
             <span className="text-slate-500 font-medium text-sm">Klient: <span className="text-slate-900 font-black">{clientData.companyName || 'Brak danych'}</span></span>
             <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
             <span className="text-slate-500 font-medium text-sm">Data: <span className="text-slate-900 font-black">{new Date().toLocaleDateString('pl-PL')}</span></span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
              editMode ? 'bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-200' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <i className={`fas ${editMode ? 'fa-lock-open' : 'fa-lock'} mr-2`}></i>
            Tryb {editMode ? 'Edycji' : 'Podglądu'}
          </button>
        </div>
      </header>

      {/* Quality Gate / Walidacja kompletności */}
      <section className={`p-8 rounded-[2.5rem] border-2 flex items-start space-x-6 transition-all ${validation.isReady ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${validation.isReady ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            <i className={`fas ${validation.isReady ? 'fa-check-double text-xl' : 'fa-exclamation-triangle text-xl'}`}></i>
         </div>
         <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-black ${validation.isReady ? 'text-green-900' : 'text-red-900'}`}>
                 Status Kompletności: {validation.isReady ? 'GOTOWE DO EKSPORTU' : 'NIEKOMPLETNE'}
              </h3>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${validation.isReady ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                Quality Gate
              </span>
            </div>
            {validation.errors.length > 0 ? (
              <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                 {validation.errors.map((err, i) => (
                   <li key={i} className="text-xs font-bold text-red-600 flex items-center group">
                      <i className="fas fa-arrow-right mr-3 opacity-30 group-hover:opacity-100 transition-opacity"></i> 
                      {err}
                   </li>
                 ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-green-700 font-medium">Wszystkie wymagane pola zostały wypełnione poprawnie. Kalkulacja może zostać zsynchronizowana z HubSpot.</p>
            )}
         </div>
      </section>

      {/* Accordion List - Klon 1:1 Stron 1-3 */}
      <div className="space-y-8">
        {/* Sekcja ROI */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleSection('roi')}
            className="w-full px-10 py-6 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
             <div className="flex items-center space-x-4">
                <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">1</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Strona 1 – ROI / Straty / Ustalenia</h3>
             </div>
             <i className={`fas fa-chevron-${expandedSections.includes('roi') ? 'up' : 'down'} text-slate-300`}></i>
          </button>
          {expandedSections.includes('roi') && (
            <div className={`p-10 ${!editMode ? 'pointer-events-none opacity-80 select-none grayscale-[0.2]' : ''}`}>
               <ROICalculator />
            </div>
          )}
        </div>

        {/* Sekcja Konfiguracja */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleSection('config')}
            className="w-full px-10 py-6 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
             <div className="flex items-center space-x-4">
                <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">2</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Strona 2 – Integracje / Licencje / Wdrożenie</h3>
             </div>
             <i className={`fas fa-chevron-${expandedSections.includes('config') ? 'up' : 'down'} text-slate-300`}></i>
          </button>
          {expandedSections.includes('config') && (
            <div className={`p-10 ${!editMode ? 'pointer-events-none opacity-80 select-none grayscale-[0.2]' : ''}`}>
               <LicenseConfigurator />
            </div>
          )}
        </div>

        {/* Sekcja SOW (Strona 3) */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <button 
            onClick={() => toggleSection('scope')}
            className="w-full px-10 py-6 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
          >
             <div className="flex items-center space-x-4">
                <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">3</span>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Strona 3 – Bezpieczne Uruchomienie z Gwarancją</h3>
             </div>
             <i className={`fas fa-chevron-${expandedSections.includes('scope') ? 'up' : 'down'} text-slate-300`}></i>
          </button>
          {expandedSections.includes('scope') && (
            <div className={`p-10 ${!editMode ? 'pointer-events-none opacity-80 select-none grayscale-[0.2]' : ''}`}>
               <ScopeOfWork />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-40 shadow-2xl">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
               <button 
                 onClick={() => window.print()}
                 className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all flex items-center"
               >
                  <i className="fas fa-file-pdf mr-3"></i> Eksport PDF
               </button>
               <button className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all flex items-center">
                  <i className="fas fa-file-word mr-3"></i> Eksport DOCX
               </button>
            </div>
            
            <button 
              onClick={() => setActiveTab(AppTab.SYNC)}
              disabled={!validation.isReady}
              className={`px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center space-x-4 ${
                validation.isReady ? 'bg-orange-600 text-white shadow-orange-200 hover:scale-[1.02]' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
               <span>WYŚLIJ DO HUBSPOT</span>
               <i className="fab fa-hubspot text-lg"></i>
            </button>
         </div>
      </div>
    </div>
  );
};

export default SummaryAggregator;
