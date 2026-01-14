
import React, { useMemo } from 'react';
import { useSalesStore } from '../store.ts';
import { AppTab } from '../types.ts';
import { SLA_DEFINITIONS } from '../constants.ts';

// Mapowanie nazw pakietów dla UI zgodnie ze specyfikacją
const PKG_LABELS: Record<string, string> = {
  BASIC: "Szybki Plus",
  PRO: "Pro",
  PRO_MAX: "Pro Max"
};

// Pełna macierz danych SSOT dla modułu 3.1 i 3.2 na podstawie dostarczonej treści
const SOW_DATA = {
  packages: [
    { id: 'BASIC', label: 'Szybki Plus' },
    { id: 'PRO', label: 'Pro' },
    { id: 'PRO_MAX', label: 'Pro Max' }
  ],
  categories: [
    {
      id: "gwarancja",
      name: "Gwarancja",
      intro: "W ramach zakupionego Pakietu uruchomienia Optimakers gwarantujemy realizację jasno zdefiniowanego zakresu funkcjonalnego i biznesowego, zgodnie z poniższą specyfikacją.",
      items: [
        { 
          id: "g_u", label: "✅ Gwarancja uruchomienia.", type: "boolean", 
          values: { BASIC: true, PRO: true, PRO_MAX: true }, 
          details: "System działa na produkcji w uzgodnionym zakresie albo pracujemy dalej na własny koszt." 
        },
        { 
          id: "g_z", label: "✅ Gwarancja zakresu.", type: "boolean", 
          values: { BASIC: true, PRO: true, PRO_MAX: true }, 
          details: "Klient otrzymuje wszyskiego funkcjonalności systemy opisane w dokumentacji oraz nowości z każdym wydaniem nowej wersji." 
        },
        { 
          id: "g_zes", label: "✅ Gwarancja zespołu.", type: "boolean", 
          values: { BASIC: true, PRO: true, PRO_MAX: true }, 
          details: "Dedykowany i certyfikowany konsultant prowadzący. <br>Zarezerwowani konsultanci wspierający i programista.", 
          notes: { PRO_MAX: "Dedykowany kierownik projektu" } 
        }
      ]
    },
    {
      id: "systemy_wymiany",
      name: "System dostępne do wymiany danych",
      items: [
        { 
          id: "d_p", label: "Przeniesienie danych (Excel/Stary system)", type: "text", 
          values: { 
            BASIC: "Import z Excel lub Arkuszy Google. <br>Klient porządkuje i przygotowuje dane.", 
            PRO: "Import Excel lub Arkusze Google. <br>Import ze starego systemu. <br>Konsultant przygotowuje i porządkuje dane razem z klientem.", 
            PRO_MAX: "Pełna migracja danych. <br>Import Excel lub Arkusze Google. <br>Import ze starego systemu. <br>Konsultant przygotowuje i porządkuje dane razem z klientem." 
          } 
        },
        { 
          id: "i_k", label: "Programy księgowe", type: "list", 
          values: { 
            BASIC: "Dostęp REST API<br>Asseco Wapro<br>Comarch ERP Optima<br>Comarch ERP XL<br>Enova<br>Business Central", 
            PRO: "wszystko po lewej, plus:<br>Fakturownia<br>RAKS<br>Subiekt GT<br>Subiekt Nexo<br>Dedykowany system", 
            PRO_MAX: "wszystko po lewej, plus:<br>Navision / Dynamics<br>Navireo<br>SAP BO<br>Rewizor<br>Symfonia<br>wFirma" 
          } 
        },
        { 
          id: "i_e", label: "E-commerce i CRM", type: "list", 
          values: { 
            BASIC: "Allegro<br>Apilo<br>Shopify", 
            PRO: "wszystko po lewej, plus:<br>Baselinker<br>Dedykowany sklep<br>HubSpot<br>LiveSpace<br>Magento<br>PrestaShop<br>Salesforce", 
            PRO_MAX: "wszystko po lewej, plus:<br>IAI IdoSell<br>Shoper<br>WooCommerce<br>Zapier" 
          } 
        },
        { 
          id: "i_m", label: "Integracje Maszyn", type: "text", 
          values: { BASIC: "1 maszyna", PRO: "wszystkie z zakładki Integracje (3 w pakiecie)", PRO_MAX: "Nielimitowane (5 w pakiecie)" } 
        }
      ]
    },
    {
      id: "zakres_pakietu",
      name: "Parametry pakietu",
      items: [
        { id: "z_c", label: "Certyfikowanie użytkowników", type: "boolean", values: { BASIC: true, PRO: true, PRO_MAX: true } },
        { id: "z_road", label: "Dostęp do Klubu Roadmap", type: "boolean", values: { BASIC: true, PRO: true, PRO_MAX: true } },
        { id: "z_t", label: "Czas realizacji (tygodnie robocze)", type: "number", values: { BASIC: 2, PRO: 4, PRO_MAX: 8 } },
        { id: "z_cus", label: "Customizacje (do 5h każda)", type: "number", values: { BASIC: 1, PRO: 5, PRO_MAX: 13 } },
        { id: "z_dni", label: "Dniówki (na miejscu)", type: "text", values: { BASIC: "10 (4)", PRO: "25 (10)", PRO_MAX: "50 (20)" } },
        { id: "z_piz", label: "Pizze dla zespołu", type: "number", values: { BASIC: 4, PRO: 10, PRO_MAX: 20 } },
        { id: "z_inv", label: "Inwestycja w pakiet", type: "text", values: { BASIC: "24 990,00 zł", PRO: "62 475,00 zł", PRO_MAX: "124 950,00 zł" } }
      ]
    }
  ],
  common: [
    { 
      title: "Jak się przygotować do uruchomienia?", 
      content: "Naszym wspólnym celem jest jak najlepsze wykorzystanie czasu pracy konsultanta. Zakres możliwych do wykonania działań w ustalonym okresie zależy przede wszystkim od przygotowania, zaangażowania i gotowości Państwa zespołu do współpracy. Państwa dobre przygotowanie jest kluczowe do osiągnięcia najlepszych efektów.<br><br><b>Kluczowe kroki:</b> Wyznacz zespół i kierownika projektu, zarezerwuj ludziom czas, przejdź e-learning." 
    },
    { 
      title: "Jak przebiegnie uruchomienie?", 
      content: "Najlepiej sprawdza się model pracy naprzemiennej: jeden tydzień skupienia na systemie, kolejny na bieżącej pracy. Czas realizacji podany w tygodniach roboczych (np. 4 tyg.) przekłada się realnie na ok. 7-8 tygodni kalendarzowych.<br><br>Pracujemy metodyką <b>Scrum (daily, weekly)</b>. Dzięki temu masz pełną kontrolę nad projektem — regularnie widzisz postępy i wpływasz na priorytety." 
    },
    { 
      title: "Dostępne warsztaty i szkolenia", 
      content: "- <b>OptiKurs</b> (obowiązkowy, certyfikowany)<br>- CRM. Sprzedaż i Kalkulacje<br>- APS. Planowanie produkcji<br>- MES. Przygotowanie i Realizacja<br>- WMS. Magazyn i Zakupy<br>- CMMS. Utrzymanie ruchu<br>- Super Użytkownik i Dział Księgowy" 
    },
    { 
      title: "Co jeszcze należy wiedzieć?", 
      content: "Doliczamy zwrot kosztów noclegu i dojazdu między siedzibami. Podane cyfry (np. 5 customizacji) to górny limit parametrów. Pizze są dostępne w dniach wizyt konsultanta na miejscu. Usługi dotyczą wyłącznie oprogramowania Optimakers." 
    },
    { 
      title: "Czym jest \"customizacja\"?", 
      content: "Dostosowanie etykiet, wydruków, raportów, pulpitów managerskich czy importerów danych. Customizacja to usługa do <b>5 godzin pracy</b> programisty lub konsultanta. Powyżej tego limitu prace traktowane są jako dedykowane zlecenia programistyczne (wymagana osobna akceptacja)." 
    },
    { 
      title: "Przedmiotem uruchomienia jest", 
      content_by_pkg: {
        BASIC: "<b>Kick-off:</b> Zakres odpowiedzialności, Harmonogram, RASCI.<br><b>Przygotowanie:</b> Szkolenie zdalne z podstaw systemu.<br><b>Tydzień 1:</b> Analiza, Konfiguracja integracji, Importy Excel, Szkolenia.<br><b>Tydzień 2:</b> Warsztaty, Uruchomienie, Start produkcyjny (asysta).",
        PRO: "<b>Kick-off:</b> Zakres odpowiedzialności, Harmonogram i kamienie milowe, RASCI.<br><b>Przygotowanie:</b> Szkolenia kluczowych użytkowników.<br><b>Tydzień 1-2:</b> Analiza konfiguracyjna, Doradztwo sprzętowe, Importy, Customizacje raportów.<br><b>Tydzień 3-4:</b> Zaawansowane warsztaty, Uruchomienie obszarów, Stabilizacja.",
        PRO_MAX: "<b>Kompleksowe Wdrożenie:</b> Wszyscy kluczowi pracownicy przechodzą certyfikowany proces OptiKurs.<br><b>Analiza:</b> Pełna dokumentacja SOW i matryca procesów.<br><b>Realizacja:</b> Harmonogram obejmujący 8 tygodni roboczych intensywnych warsztatów, dedykowaną opiekę kierownika projektu i wsparcie programistyczne 'on-demand'."
      }
    }
  ]
};

const ScopeOfWork: React.FC = () => {
  const { config, setActiveTab } = useSalesStore();

  const formatText = (text: string | null) => {
    if (!text) return '—';
    return text.split('<br>').map((line, i) => (
      <React.Fragment key={i}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {i !== text.split('<br>').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const sla = SLA_DEFINITIONS[config.supportPackage] || SLA_DEFINITIONS.ELASTYCZNY;
  const currentPkgLabel = PKG_LABELS[config.implementationPackage] || "Pro";

  // Podsumowanie punktowe dla kafelka konfiguracji
  const pkgSummary = useMemo(() => {
    const pkgId = config.implementationPackage || 'PRO';
    const weeks = SOW_DATA.categories.find(c => c.id === 'zakres_pakietu')?.items.find(i => i.id === 'z_t')?.values[pkgId];
    const customs = SOW_DATA.categories.find(c => c.id === 'zakres_pakietu')?.items.find(i => i.id === 'z_cus')?.values[pkgId];
    const days = SOW_DATA.categories.find(c => c.id === 'zakres_pakietu')?.items.find(i => i.id === 'z_dni')?.values[pkgId];
    
    return [
      `Gwarancja uruchomienia i zakresu`,
      `Czas realizacji: ${weeks} tyg. roboczych`,
      `Customizacje: do ${customs} elementów`,
      `Dniówki wdrożeniowe: ${days}`,
      `Dedykowany konsultant prowadzący`
    ];
  }, [config.implementationPackage]);

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">3. Bezpieczne Uruchomienie z Gwarancją</h2>
          <p className="text-slate-500 font-medium">Zakres prac wdrożeniowych (SOW) oraz parametry opieki serwisowej (SLA)</p>
        </div>
        <div className="flex items-center space-x-4 bg-blue-50 px-6 py-4 rounded-[2rem] border border-blue-100 shadow-sm">
           <i className="fas fa-shield-halved text-blue-600"></i>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Wybrany Pakiet</p>
              <h3 className="text-lg font-black text-blue-600 leading-none">Optimakers {currentPkgLabel}</h3>
           </div>
        </div>
      </div>

      {/* 3.1 MACIERZ PORÓWNAWCZA */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="bg-slate-50 py-4 px-10 border-b border-slate-200">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">3.1 Porównanie zakresu pakietów</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-10 w-[30%] sticky left-0 bg-slate-900 z-10 border-r border-white/5">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-2">Funkcjonalność / Parametr</p>
                </th>
                {SOW_DATA.packages.map(pkg => (
                  <th key={pkg.id} className="px-8 py-10 text-center border-r border-white/5">
                     <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">
                        {pkg.id === 'BASIC' ? 'Szybki Start' : pkg.id === 'PRO' ? 'Złoty Standard' : 'Pełna Skala'}
                     </p>
                     <h4 className={`text-xl font-black ${config.implementationPackage === pkg.id ? 'text-blue-400' : 'text-white'}`}>{pkg.label}</h4>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {SOW_DATA.categories.map(cat => (
                <React.Fragment key={cat.id}>
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-10 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10">
                      {cat.name}
                    </td>
                  </tr>
                  {cat.items.map(feat => (
                    <tr key={feat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6 text-xs font-black text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100">
                        {feat.label}
                      </td>
                      {SOW_DATA.packages.map(pkg => (
                        <td key={pkg.id} className="px-8 py-6 text-center">
                           {feat.type === 'boolean' ? (
                             (feat.values as any)[pkg.id] ? <i className="fas fa-check-circle text-green-500 text-lg"></i> : <i className="fas fa-minus text-slate-200"></i>
                           ) : (
                             <span className="text-xs font-black text-slate-900">
                               {formatText(((feat.values as any)[pkg.id] || '—').toString().split('<br>')[0])}
                             </span>
                           )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3.2 TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        
        {/* Lewa kolumna: Konfiguracja i SLA */}
        <div className="space-y-10">
          
          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center space-x-2">
               <i className="fas fa-box-open text-blue-500"></i>
               <span>Wybrana Konfiguracja Uruchomienia</span>
            </h3>
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 shadow-sm transition-all group">
               <div className="flex justify-between items-start mb-6">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Aktywny pakiet</span>
               </div>
               <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Optimakers {currentPkgLabel}</h4>
               <ul className="space-y-3">
                  {pkgSummary.map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-xs font-medium text-slate-600">
                       <i className="fas fa-check text-green-500"></i>
                       <span>{item}</span>
                    </li>
                  ))}
               </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center space-x-2">
               <i className="fas fa-user-headset text-blue-500"></i>
               <span>3.2 Parametry opieki serwisowej (SLA)</span>
            </h3>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
               <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Poziom opieki</p>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Pakiet {sla.label}</h4>
                  </div>
                  <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    Gwarantowane SLA
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center space-x-4">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-clock"></i></div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Godziny w cenie</p>
                        <p className="text-sm font-black text-slate-900">{sla.hours}</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center space-x-4">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-bolt"></i></div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Czas reakcji</p>
                        <p className="text-sm font-black text-slate-900">{sla.reactionTime}</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center space-x-4">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-user-tie"></i></div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase">Opiekun dedykowany</p>
                        <p className="text-sm font-black text-slate-900">{sla.manager ? "TAK" : "NIE"}</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center space-x-4">
                     <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-comments"></i></div>
                     <div className="flex flex-col">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Kanały kontaktu</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                           {sla.channels.map(c => <span key={c} className="text-[8px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-black uppercase">{c}</span>)}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* Prawa kolumna: Okno SOW (Statement of Work) */}
        <section className="flex flex-col space-y-6">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none flex items-center space-x-2">
               <i className="fas fa-star text-amber-400"></i>
               <span>Gwarancja Satysfakcji i Przedmiot Prac</span>
           </h3>
           
           <div className="flex-1 bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[750px]">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <i className="fas fa-award text-[12rem]"></i>
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                 <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-900/40">
                    <i className="fas fa-medal text-xl"></i>
                 </div>
                 
                 <h4 className="text-3xl font-black tracking-tight leading-tight mb-8">
                    Bezpieczne Uruchomienie to nasza obietnica sukcesu.
                 </h4>

                 <div className="space-y-8 flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-medium leading-relaxed">
                       <p className="text-sm font-black text-blue-400 uppercase tracking-widest mb-6">Manifest Wdrożeniowy (SOW):</p>
                       <div className="space-y-10">
                          
                          {/* 1. Gwarancja Wyniku */}
                          <div>
                             <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">1. Gwarancja wyniku i zakresu:</p>
                             <p className="text-xs leading-relaxed text-slate-400">{SOW_DATA.categories.find(c => c.id === 'gwarancja')?.intro}</p>
                          </div>
                          
                          {/* 2. Przedmiot wdrożenia per pakiet */}
                          <div>
                             <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-2">2. Co realizujemy w pakiecie {currentPkgLabel}:</p>
                             <div className="text-xs leading-relaxed space-y-3">
                                {formatText(SOW_DATA.common.find(c => c.title === "Przedmiotem uruchomienia jest")?.content_by_pkg?.[config.implementationPackage || 'PRO'] || "")}
                             </div>
                          </div>

                          {/* 3. Sekcje Wspólne (Accordions-like) */}
                          <div className="pt-8 border-t border-white/5 space-y-8">
                             <p className="font-bold text-white uppercase text-[10px] tracking-widest mb-6">3. Standardy wspólne dla wdrożenia:</p>
                             <div className="space-y-8">
                                {SOW_DATA.common.filter(c => c.title !== "Przedmiotem uruchomienia jest").map((c, i) => (
                                   <div key={i} className="group border-l border-white/10 pl-6 hover:border-blue-500 transition-colors">
                                      <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-2 group-hover:text-white transition-colors">{c.title}</p>
                                      <div className="text-xs leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: c.content }} />
                                   </div>
                                ))}
                             </div>
                          </div>

                       </div>
                    </div>
                 </div>

                 <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-6">
                    <button className="flex items-center space-x-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
                       <i className="fas fa-file-contract"></i>
                       <span>Certyfikat ISO 9001/27001</span>
                    </button>
                    <button className="flex items-center space-x-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
                       <i className="fas fa-lock"></i>
                       <span>Prywatna Chmura Optimakers</span>
                    </button>
                 </div>
              </div>
           </div>
        </section>
      </div>

      {/* 3.3 SUMMARY OF POSITIONS */}
      <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-dashed border-slate-200">
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-slate-900 leading-none">3.3 Podsumowanie Pozycji Projektowych</h3>
            <i className="fab fa-hubspot text-orange-400 text-2xl"></i>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Licencje i subskrypcja</p>
               <p className="text-xs font-black text-slate-900">Model {config.hostingModel}</p>
               <p className="text-[10px] font-bold text-blue-500 uppercase">{config.subscriptionType}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Pakiet wdrożenia</p>
               <p className="text-xs font-black text-slate-900">Optimakers {currentPkgLabel}</p>
               <p className="text-[10px] font-bold text-blue-500 uppercase">Uruchomienie</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Opieka i serwis</p>
               <p className="text-xs font-black text-slate-900">Pakiet {sla.label}</p>
               <p className="text-[10px] font-bold text-blue-500 uppercase">{config.supportPeriod}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center space-x-3">
               <i className="fas fa-check-circle text-green-500"></i>
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Status Synchronizacji</p>
                  <p className="text-xs font-black text-green-600 uppercase">Prawidłowy</p>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-8 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => setActiveTab(AppTab.CONFIG)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-200 transition-all">Konfiguracja Licencji</button>
          <button 
             /* Fixed AppTab.CLIENT_DATA reference to AppTab.RESEARCH */
             onClick={() => setActiveTab(AppTab.RESEARCH)} 
             className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-all flex items-center space-x-3"
          >
             <span>Strona 4: Dane i AI</span>
             <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScopeOfWork;
