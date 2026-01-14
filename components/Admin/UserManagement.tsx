
import React, { useState } from 'react';
import { useSalesStore } from '../../store.ts';
import { User, PermissionCode, AppTab } from '../../types.ts';

const UserManagement: React.FC = () => {
  const { users, currentUser, updateUser, addUser, removeUser } = useSalesStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const availablePermissions: PermissionCode[] = [
    'ROI_ACCESS', 'CONFIG_ACCESS', 'SYNC_ACCESS', 
    'SYSTEM_LOGS_VIEW', 'USER_MANAGEMENT', 
    'DICTIONARY_MANAGEMENT', 'ADMIN_SETTINGS', 'PROMPT_EDITOR', 'EXPORT_DATA'
  ];

  const handleEditClick = (user: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingUser({ ...user });
    setActiveKebabId(null);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUser(editingUser.id, editingUser);
      setEditingUser(null);
    }
  };

  const togglePermission = (perm: PermissionCode) => {
    if (!editingUser) return;
    const next = editingUser.permissions.includes(perm)
      ? editingUser.permissions.filter(p => p !== perm)
      : [...editingUser.permissions, perm];
    setEditingUser({ ...editingUser, permissions: next });
  };

  const handleResetPassword = (user: User) => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setTempPassword(code);
    setActiveKebabId(null);
    // In real app, check SMTP and send email
  };

  const getStatusBadge = (status: User['status']) => {
    switch(status) {
        case 'active': return 'bg-green-100 text-green-600 border-green-200';
        case 'blocked': return 'bg-red-100 text-red-600 border-red-200';
        case 'invited': return 'bg-blue-100 text-blue-600 border-blue-200';
        default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Użytkownicy i Uprawnienia (8.1)</h3>
          <p className="text-slate-500 font-medium mt-1">Zarządzaj dostępem zespołu sprzedaży i matrycą uprawnień RBAC.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-100 hover:scale-[1.02] transition-all flex items-center space-x-3"
        >
          <i className="fas fa-user-plus"></i> 
          <span>Dodaj użytkownika</span>
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Name & Email</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Last Login</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr 
                  key={user.id} 
                  onClick={() => handleEditClick(user)}
                  className="hover:bg-blue-50/30 cursor-pointer transition-all group relative"
                >
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-white text-slate-400 rounded-2xl flex items-center justify-center font-black text-sm border-2 border-slate-100 group-hover:border-blue-200 transition-colors uppercase shadow-sm">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm leading-tight mb-1">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold lowercase tracking-normal">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{user.role}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase mt-1">{user.position}</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <p className="text-[10px] font-black text-slate-900">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}</p>
                    <p className="text-[9px] text-slate-400 font-medium uppercase">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-10 py-6 text-right relative" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end items-center space-x-3">
                      <button 
                        onClick={(e) => handleEditClick(user, e)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center shadow-sm"
                        aria-label="Edit User"
                      >
                        <i className="fas fa-edit text-xs"></i>
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveKebabId(activeKebabId === user.id ? null : user.id)}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm"
                        >
                          <i className="fas fa-ellipsis-v text-xs"></i>
                        </button>
                        
                        {activeKebabId === user.id && (
                          <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-3 animate-in slide-in-from-top-2 duration-200 ring-4 ring-black/5">
                            <button onClick={(e) => handleEditClick(user, e)} className="w-full text-left px-5 py-3 text-[10px] font-black text-slate-700 uppercase hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-3">
                              <i className="fas fa-user-edit w-4"></i>
                              <span>Edytuj Profil</span>
                            </button>
                            <button onClick={() => handleResetPassword(user)} className="w-full text-left px-5 py-3 text-[10px] font-black text-slate-700 uppercase hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-3">
                              <i className="fas fa-key w-4"></i>
                              <span>Resetuj Hasło</span>
                            </button>
                            <div className="border-t border-slate-50 my-2"></div>
                            <button 
                              onClick={() => { updateUser(user.id, { status: user.status === 'blocked' ? 'active' : 'blocked' }); setActiveKebabId(null); }}
                              className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase transition-colors flex items-center space-x-3 ${user.status === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                            >
                              <i className={`fas ${user.status === 'blocked' ? 'fa-unlock' : 'fa-ban'} w-4`}></i>
                              <span>{user.status === 'blocked' ? 'Odblokuj' : 'Zablokuj'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Drawer / Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="bg-slate-900 p-12 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center space-x-8">
                    <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-blue-900/50 uppercase">
                        {editingUser.firstName[0]}{editingUser.lastName[0]}
                    </div>
                    <div>
                        <h3 className="text-4xl font-black tracking-tight leading-none mb-2">Edycja: {editingUser.firstName}</h3>
                        <div className="flex items-center space-x-3">
                           <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">Personal & Permissions Matrix</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                           <span className="text-[10px] font-bold opacity-50 uppercase">ID: {editingUser.id}</span>
                        </div>
                    </div>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="w-14 h-14 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-white/50 hover:text-white border border-white/5">
                    <i className="fas fa-times text-2xl"></i>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-16">
                 {/* Section 1: Basic Profile */}
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Imię</label>
                       <input 
                         type="text" 
                         value={editingUser.firstName} 
                         onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                         className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nazwisko</label>
                       <input 
                         type="text" 
                         value={editingUser.lastName} 
                         onChange={e => setEditingUser({...editingUser, lastName: e.target.value})}
                         className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">E-mail (Read-Only)</label>
                       <input 
                         type="email" 
                         readOnly 
                         value={editingUser.email} 
                         className="w-full p-6 bg-slate-100 border border-slate-200 rounded-3xl font-bold text-slate-500 outline-none cursor-not-allowed"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rola Systemowa</label>
                       <select 
                         value={editingUser.role} 
                         onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                         className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl font-black text-slate-900 outline-none"
                       >
                          <option value="ADMIN">ADMINISTRATOR</option>
                          <option value="SALES_MANAGER">SALES MANAGER</option>
                          <option value="SALES_REP">SALES REPRESENTATIVE</option>
                       </select>
                    </div>
                 </div>

                 {/* Section 2: RBAC Matrix */}
                 <div className="space-y-8 pt-10 border-t border-slate-100">
                    <div className="flex items-center space-x-3">
                       <i className="fas fa-shield-halved text-blue-600 text-xl"></i>
                       <h4 className="text-xl font-black text-slate-900">Module Access Control (RBAC Matrix)</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {availablePermissions.map(perm => (
                         <button 
                           key={perm}
                           onClick={() => togglePermission(perm)}
                           className={`p-6 rounded-[2rem] border-2 text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group ${
                             editingUser.permissions.includes(perm) 
                               ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
                               : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                           }`}
                         >
                            <span className="flex-1 pr-4">{perm.replace('_', ' ')}</span>
                            <i className={`fas ${editingUser.permissions.includes(perm) ? 'fa-check-circle text-white' : 'fa-circle-notch opacity-20 group-hover:opacity-100'}`}></i>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Section 3: User Status */}
                 <div className="pt-10 border-t border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Ustawienia Konta i Bezpieczeństwo</h4>
                    <div className="grid grid-cols-3 gap-6">
                        <button onClick={() => handleResetPassword(editingUser)} className="flex-1 p-6 bg-slate-100 rounded-[2rem] font-black text-[10px] uppercase text-slate-700 hover:bg-slate-200 transition-all flex items-center justify-center space-x-3">
                           <i className="fas fa-key"></i>
                           <span>Resetuj Hasło</span>
                        </button>
                        {editingUser.id !== currentUser?.id && (
                          <button 
                            onClick={() => { setEditingUser({...editingUser, status: editingUser.status === 'blocked' ? 'active' : 'blocked'}); }}
                            className={`flex-1 p-6 rounded-[2rem] font-black text-[10px] uppercase transition-all flex items-center justify-center space-x-3 border-2 ${
                              editingUser.status === 'blocked' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                             <i className={`fas ${editingUser.status === 'blocked' ? 'fa-unlock' : 'fa-ban'}`}></i>
                             <span>{editingUser.status === 'blocked' ? 'Odblokuj konto' : 'Zablokuj konto'}</span>
                          </button>
                        )}
                        <button 
                          onClick={() => { if(confirm("Czy na pewno usunąć użytkownika?")) { removeUser(editingUser.id); setEditingUser(null); } }}
                          className="flex-1 p-6 bg-white border-2 border-red-100 rounded-[2rem] font-black text-[10px] uppercase text-red-400 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center space-x-3"
                        >
                           <i className="fas fa-trash-alt"></i>
                           <span>Usuń całkowicie</span>
                        </button>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-12 flex justify-between gap-6 shrink-0 border-t border-slate-100">
                 <button onClick={() => setEditingUser(null)} className="px-10 py-5 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">ANULUJ</button>
                 <button onClick={handleSaveUser} className="px-16 py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                    Zapisz zmiany profilu
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Password Reset Modal Overlay */}
      {tempPassword && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in zoom-in duration-300 p-6">
           <div className="bg-white rounded-[3rem] p-16 max-w-md w-full text-center space-y-10 shadow-3xl">
              <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
                 <i className="fas fa-lock"></i>
              </div>
              <div className="space-y-4">
                 <h4 className="text-2xl font-black text-slate-900">Wygenerowano Kod Resetu</h4>
                 <p className="text-sm text-slate-500 font-medium">Brak skonfigurowanego serwera SMTP. Przekaż poniższy kod użytkownikowi:</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2rem] border-4 border-amber-400/20">
                 <p className="text-5xl font-mono font-black text-white tracking-[0.2em]">{tempPassword}</p>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(tempPassword); setTempPassword(null); }}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-xl"
              >
                 <i className="fas fa-copy"></i>
                 <span>Skopiuj i zamknij</span>
              </button>
           </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/70 backdrop-blur-lg animate-in fade-in duration-300 p-6">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-3xl animate-in zoom-in duration-300">
              <div className="bg-blue-600 p-10 text-white flex justify-between items-center">
                 <h3 className="text-3xl font-black tracking-tight">Nowy Użytkownik</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white transition-all"><i className="fas fa-times text-xl"></i></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Imię</label>
                       <input id="new_fname" type="text" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nazwisko</label>
                       <input id="new_lname" type="text" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail (SSO ID)</label>
                    <input id="new_email" type="email" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rola Początkowa</label>
                    <select id="new_role" className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none">
                       <option value="SALES_REP">Sales Representative</option>
                       <option value="SALES_MANAGER">Sales Manager</option>
                       <option value="ADMIN">Administrator</option>
                    </select>
                 </div>
                 <label className="flex items-center space-x-4 cursor-pointer p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <input type="checkbox" id="new_reset" className="w-5 h-5 rounded border-blue-300 text-blue-600" defaultChecked />
                    <span className="text-xs font-bold text-blue-900">Wymuś zmianę hasła przy pierwszym logowaniu</span>
                 </label>
              </div>
              <div className="bg-slate-50 p-10 flex justify-end gap-4">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase text-slate-400">Anuluj</button>
                 <button 
                   onClick={() => {
                     const fname = (document.getElementById('new_fname') as HTMLInputElement).value;
                     const lname = (document.getElementById('new_lname') as HTMLInputElement).value;
                     const email = (document.getElementById('new_email') as HTMLInputElement).value;
                     const role = (document.getElementById('new_role') as HTMLSelectElement).value;
                     if(fname && lname && email) {
                        addUser({
                           id: '', firstName: fname, lastName: lname, email, login: email.split('@')[0], 
                           role: role as any, position: 'New User', status: 'invited', permissions: ['ROI_ACCESS'],
                           createdAt: '', settings: { ...DEFAULT_USER_SETTINGS }
                        } as any);
                        setShowAddModal(false);
                     }
                   }}
                   className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200"
                 >
                    Utwórz i Zaproś
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const DEFAULT_USER_SETTINGS = {
  employeesDefault: 20,
  hourlyRateDefault: 5000,
  wastedMinutesDefault: 15,
  inventoryOptPercentDefault: 10,
  lostTurnoverPercentDefault: 5,
  dayRateDefault: 249900,
  hourRateDefault: 31238,
  locale: 'PL',
  timezone: 'Europe/Warsaw',
  currency: 'PLN'
};

export default UserManagement;
