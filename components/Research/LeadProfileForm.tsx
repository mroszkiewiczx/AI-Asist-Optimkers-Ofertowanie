
import React, { useState, useMemo } from 'react';
import { useSalesStore } from '../../store.ts';
import { PersonEntry, ConnectionNode } from '../../types.ts';

const LeadProfileForm: React.FC = () => {
  const { research, updateProfile } = useSalesStore();
  const p = research.profile;
  
  // State for interactive features
  const [selectedPerson, setSelectedPerson] = useState<PersonEntry | null>(
    (p.management && p.management.length > 0) ? p.management[0] : null
  );

  const handleChange = (field: keyof typeof p, value: string) => {
    updateProfile({ [field]: value });
  };

  const updatePerson = (type: 'management' | 'otherEmployees', index: number, field: keyof PersonEntry, value: string) => {
     const list = [...(p[type] || [])];
     if(list[index]) {
        list[index] = { ...list[index], [field]: value };
        updateProfile({ [type]: list });
     }
  };

  const handlePersonSelect = (person: PersonEntry) => {
    setSelectedPerson(person);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* 1. Basic Info */}
      <section className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center space-x-3">
           <i className="fas fa-id-card text-blue-600"></i>
           <span>Identyfikacja Firmy</span>
        </h4>
        <div className="space-y-6">
           <div className="grid grid-cols-1 gap-6">
              <InputField label="Pełna Nazwa" value={p.companyName} onChange={v => handleChange('companyName', v)} />
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="NIP" value={p.nip} onChange={v => handleChange('nip', v)} />
                 <InputField label="KRS" value={p.krs} onChange={v => handleChange('krs', v)} />
              </div>
              <InputField label="Adres Siedziby" value={p.address} onChange={v => handleChange('address', v)} />
              <InputField label="Branża" value={p.industry} onChange={v => handleChange('industry', v)} />
           </div>
        </div>
      </section>

      {/* 2. Decision Maker */}
      <section className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center space-x-3">
           <i className="fas fa-user-tie text-blue-600"></i>
           <span>Kluczowa Osoba (Decydent)</span>
        </h4>
        <div className="space-y-6">
           <InputField label="Imię i Nazwisko" value={p.decisionMakerName} onChange={v => handleChange('decisionMakerName', v)} />
           <InputField label="Stanowisko" value={p.decisionMakerRole} onChange={v => handleChange('decisionMakerRole', v)} />
           <InputField label="LinkedIn URL" value={p.decisionMakerLinkedin} onChange={v => handleChange('decisionMakerLinkedin', v)} />
           <div className="grid grid-cols-2 gap-6">
              <InputField label="E-mail" value={p.email} onChange={v => handleChange('email', v)} />
              <InputField label="Telefon" value={p.phone} onChange={v => handleChange('phone', v)} />
           </div>
        </div>
      </section>

      {/* 3. Tech & Description */}
      <section className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center space-x-3">
            <i className="fas fa-layer-group text-blue-600"></i>
            <span>Stos Technologiczny i Charakterystyka</span>
         </h4>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Stos Technologiczny (ERP / MES / CRM)</label>
               <textarea 
                 value={p.techStack} 
                 onChange={e => handleChange('techStack', e.target.value)}
                 className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                 placeholder="Wpisz technologie wykryte w firmie..."
               />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Krótki Opis Działalności</label>
               <textarea 
                 value={p.description} 
                 onChange={e => handleChange('description', e.target.value)}
                 className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                 placeholder="Wpisz charakterystykę biznesową..."
               />
            </div>
         </div>
      </section>

      {/* 4. OSINT MANAGEMENT & TEAM LISTS (Now Only Lists) */}
      <section className="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
         {/* Background icon */}
         <i className="fas fa-users absolute right-[-20px] top-[-20px] text-[15rem] text-white/5 -rotate-12 pointer-events-none"></i>
         
         <div className="relative z-10">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center space-x-3 mb-8">
               <i className="fas fa-list text-xl"></i>
               <span>4. Zarząd i Struktura (Listy Osobowe)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               
               {/* Management Column */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><i className="fas fa-chess-king text-xs"></i></span>
                        <h5 className="text-white font-black uppercase tracking-widest text-xs">Zarząd i Reprezentacja</h5>
                     </div>
                     <span className="text-[9px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded">{p.management?.length || 0}</span>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                     {p.management && p.management.length > 0 ? p.management.map((person, idx) => (
                        <div key={`m-${idx}`} onClick={() => handlePersonSelect(person)}>
                           <PersonCard 
                              person={person} 
                              onChange={(f, v) => updatePerson('management', idx, f, v)}
                              isActive={selectedPerson?.name === person.name}
                              type="manager"
                           />
                        </div>
                     )) : (
                        <p className="text-white/30 text-xs italic p-4 border border-dashed border-white/10 rounded-xl">Brak danych zarządu. Uruchom Research AI.</p>
                     )}
                  </div>
               </div>

               {/* Employees Column */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                     <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white"><i className="fas fa-users text-xs"></i></span>
                        <h5 className="text-white font-black uppercase tracking-widest text-xs">Kluczowi Pracownicy</h5>
                     </div>
                     <span className="text-[9px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded">{p.otherEmployees?.length || 0}</span>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                     {p.otherEmployees && p.otherEmployees.length > 0 ? p.otherEmployees.map((person, idx) => (
                        <div key={`e-${idx}`} onClick={() => handlePersonSelect(person)}>
                           <PersonCard 
                              person={person} 
                              onChange={(f, v) => updatePerson('otherEmployees', idx, f, v)}
                              isActive={selectedPerson?.name === person.name}
                              type="employee"
                           />
                        </div>
                     )) : (
                        <p className="text-white/30 text-xs italic p-4 border border-dashed border-white/10 rounded-xl">Brak danych pracowników. Uruchom Research AI.</p>
                     )}
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* 5. OSINT GRAPH (Dedicated, Big Section) */}
      <section className="lg:col-span-2 bg-black rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col min-h-[900px]">
          <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
             <div>
                <h5 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <i className="fas fa-project-diagram text-blue-500"></i>
                    <span>Pajęczyna Powiązań (OSINT Network)</span>
                </h5>
                <p className="text-[10px] text-white/40 mt-1 pl-8">Interaktywna wizualizacja powiązań kapitałowych i osobowych</p>
             </div>
             <div className="flex space-x-2 pointer-events-auto">
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   <span className="text-[9px] font-bold text-white/60 uppercase">Aktywne</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
                   <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                   <span className="text-[9px] font-bold text-white/60 uppercase">Historyczne</span>
                </div>
             </div>
          </div>

          {/* Graph Canvas */}
          <div className="flex-1 relative">
             {selectedPerson ? (
                <NetworkGraphVisualizer person={selectedPerson} />
             ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                   <i className="fas fa-mouse-pointer text-6xl mb-6 animate-bounce opacity-50"></i>
                   <p className="text-sm font-black uppercase tracking-widest">Wybierz osobę z listy powyżej, aby wygenerować graf</p>
                </div>
             )}
          </div>
      </section>

    </div>
  );
};

const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all"
    />
  </div>
);

const PersonCard: React.FC<{ person: PersonEntry; onChange: (field: keyof PersonEntry, val: string) => void; isActive?: boolean; type: 'manager' | 'employee' }> = ({ person, onChange, isActive, type }) => (
   <div className={`border rounded-2xl p-4 transition-all group cursor-pointer relative overflow-hidden ${isActive ? 'bg-white/10 border-blue-500 shadow-lg shadow-blue-900/50' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
      
      <div className="flex justify-between items-start mb-2 pl-2">
         <div className="flex-1 min-w-0">
            <input 
               className="bg-transparent text-white font-black text-sm outline-none w-full placeholder:text-white/20 cursor-pointer truncate"
               value={person.name}
               onChange={e => onChange('name', e.target.value)}
               placeholder="Imię Nazwisko"
            />
            <input 
               className={`bg-transparent font-bold text-[9px] uppercase outline-none w-full mt-0.5 placeholder:text-white/20 cursor-pointer truncate ${type === 'manager' ? 'text-blue-400' : 'text-emerald-400'}`}
               value={person.role}
               onChange={e => onChange('role', e.target.value)}
               placeholder="STANOWISKO"
            />
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 pl-2">
         <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <i className="fas fa-envelope text-[9px] text-white"></i>
            <span className="text-[9px] text-white font-mono truncate">{person.email || '-'}</span>
         </div>
         <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity justify-end">
            <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">{person.connections?.length || 0} powiązań</span>
         </div>
      </div>
   </div>
);

const NetworkGraphVisualizer: React.FC<{ person: PersonEntry }> = ({ person }) => {
   const connections = person.connections || [];
   const maxConnections = 12; // Limit for visual clarity, rest can be "+X more"
   const displayConnections = connections.slice(0, maxConnections);
   const hasMore = connections.length > maxConnections;

   return (
      <div className="w-full h-full flex items-center justify-center relative p-10 animate-in zoom-in duration-500">
         
         {/* Background Grid */}
         <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
         }}></div>

         {/* Center Node (Person) */}
         <div className="relative z-20 flex flex-col items-center group">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] border-4 border-slate-900 transition-transform duration-300 group-hover:scale-110">
               <span className="text-3xl font-black text-white">{person.name.charAt(0)}</span>
            </div>
            <div className="mt-4 bg-slate-900/90 backdrop-blur border border-white/20 px-4 py-2 rounded-xl text-center shadow-xl">
               <p className="text-sm font-black text-white whitespace-nowrap">{person.name}</p>
               <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{person.role}</p>
            </div>
         </div>

         {/* Satellite Nodes (Companies) */}
         {displayConnections.map((conn, i) => {
            const total = displayConnections.length;
            const angle = (i / total) * 2 * Math.PI - (Math.PI / 2); // Start from top
            const radius = 220; // Distance from center
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            // Randomize slight offset for organic look
            const delay = i * 100;

            return (
               <React.Fragment key={i}>
                  {/* Connection Line */}
                  <div 
                     className={`absolute h-px origin-left z-0 transition-all duration-1000 ease-out ${conn.active ? 'bg-gradient-to-r from-blue-500/50 to-emerald-500/50' : 'bg-gradient-to-r from-slate-500/30 to-slate-600/30 dashed'}`}
                     style={{
                        width: `${radius - 40}px`, // Stop before hitting the node
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${angle * (180/Math.PI)}deg)`,
                        animation: `growLine 0.5s ease-out ${delay}ms backwards`
                     }}
                  ></div>

                  {/* Company Node */}
                  <div 
                     className="absolute z-10 group"
                     style={{
                        transform: `translate(${x}px, ${y}px)`,
                        animation: `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms backwards`
                     }}
                  >
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-2xl transition-all duration-300 hover:scale-125 cursor-pointer relative ${
                        conn.active 
                           ? 'bg-slate-800 border-emerald-500 shadow-emerald-900/20' 
                           : 'bg-slate-800 border-slate-600 opacity-60 hover:opacity-100'
                     }`}>
                        <i className={`fas ${conn.active ? 'fa-building' : 'fa-landmark'} text-lg ${conn.active ? 'text-emerald-400' : 'text-slate-400'}`}></i>
                        
                        {/* Status Dot */}
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${conn.active ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                     </div>

                     {/* Detail Card (Tooltip) */}
                     <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 scale-90 group-hover:scale-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{conn.role}</p>
                        <p className="text-xs font-bold text-white leading-tight mb-2">{conn.company}</p>
                        
                        <div className="space-y-1 border-t border-white/10 pt-2">
                           <div className="flex justify-between text-[9px]">
                              <span className="text-white/40">KRS:</span>
                              <span className="font-mono text-white/80">0000{Math.floor(Math.random()*900000)+100000}</span>
                           </div>
                           <div className="flex justify-between text-[9px]">
                              <span className="text-white/40">Status:</span>
                              <span className={conn.active ? "text-emerald-400 font-bold" : "text-slate-400"}>{conn.active ? "AKTYWNA" : "WYKREŚLONA"}</span>
                           </div>
                           {conn.year && (
                              <div className="flex justify-between text-[9px]">
                                 <span className="text-white/40">Od roku:</span>
                                 <span className="text-white">{conn.year}</span>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </React.Fragment>
            );
         })}

         {/* More Nodes Indicator */}
         {hasMore && (
            <div className="absolute bottom-8 right-8 bg-slate-800 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-white shadow-xl animate-bounce">
               + {connections.length - maxConnections} innych powiązań
            </div>
         )}
         
         <style>{`
            @keyframes growLine { from { width: 0; } to { width: ${220 - 40}px; } }
            @keyframes popIn { from { transform: translate(0,0) scale(0); } }
         `}</style>
      </div>
   );
};

export default LeadProfileForm;
