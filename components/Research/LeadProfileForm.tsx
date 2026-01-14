
import React from 'react';
import { useSalesStore } from '../../store.ts';

const LeadProfileForm: React.FC = () => {
  const { research, updateProfile } = useSalesStore();
  const p = research.profile;

  const handleChange = (field: keyof typeof p, value: string) => {
    updateProfile({ [field]: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
      {/* Basic Info */}
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

      {/* Decision Maker */}
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

      {/* Tech & Description */}
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

export default LeadProfileForm;
