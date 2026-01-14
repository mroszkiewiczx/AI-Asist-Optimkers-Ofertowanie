
import React, { useState, useRef } from 'react';
import { useSalesStore } from '../../store.ts';
import { User, PermissionCode } from '../../types.ts';

const UserManagement: React.FC = () => {
  const { users, currentUser, updateUser, addUser, removeUser } = useSalesStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeKebabId, setActiveKebabId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [passwordChange, setPasswordChange] = useState<{value: string, forced: boolean}>({ value: '', forced: true });
  
  // State for new user creation to ensure inputs are editable and controlled
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'SALES_REP' as User['role'],
    password: '',
    mustChangePassword: true,
    avatar: '',
    permissions: ['ROI_ACCESS'] as PermissionCode[]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const availablePermissions: PermissionCode[] = [
    'ROI_ACCESS', 'CONFIG_ACCESS', 'SYNC_ACCESS', 
    'SYSTEM_LOGS_VIEW', 'USER_MANAGEMENT', 
    'DICTIONARY_MANAGEMENT', 'ADMIN_SETTINGS', 'PROMPT_EDITOR', 'EXPORT_DATA', 'RESEARCH_ACCESS'
  ];

  // Superadmin check: Mateusz Roszkiewicz is Owner/Superadmin (ID u1 or login m.roszkiewicz)
  const isSuperAdmin = (u: User) => u.login === 'm.roszkiewicz' || u.id === 'u1';

  const handleEditClick = (user: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingUser({ ...user });
    setActiveKebabId(null);
    setPasswordChange({ value: '', forced: user.mustChangePassword || false });
  };

  const handleSaveUser = () => {
    if (editingUser) {
      const updates: Partial<User> = { ...editingUser };
      if (passwordChange.value) {
         // In a real app: await authService.adminChangePassword(editingUser.id, passwordChange.value)
         alert(`Hasło dla użytkownika ${editingUser.login} zostało zmienione.`);
      }
      updates.mustChangePassword = passwordChange.forced;
      
      updateUser(editingUser.id, updates);
      setEditingUser(null);
    }
  };

  const handleCreateUser = () => {
    if(newUser.firstName && newUser.lastName && newUser.email) {
      addUser({
          id: '', 
          firstName: newUser.firstName, 
          lastName: newUser.lastName, 
          email: newUser.email, 
          login: newUser.email.split('@')[0], 
          role: newUser.role, 
          position: 'New User', 
          status: 'active', 
          permissions: newUser.permissions,
          mustChangePassword: newUser.mustChangePassword,
          avatar: newUser.avatar,
          createdAt: new Date().toISOString(), 
          settings: { employeesDefault: 20, hourlyRateDefault: 5000, wastedMinutesDefault: 15, inventoryOptPercentDefault: 10, lostTurnoverPercentDefault: 5, dayRateDefault: 249900, hourRateDefault: 31238, locale: 'PL', timezone: 'Europe/Warsaw', currency: 'PLN' }
      } as any);
      
      // Reset and close
      setNewUser({
        firstName: '', lastName: '', email: '', role: 'SALES_REP', password: '', 
        mustChangePassword: true, avatar: '', permissions: ['ROI_ACCESS']
      });
      setShowAddModal(false);
    } else {
      alert("Wypełnij wymagane pola (Imię, Nazwisko, E-mail)");
    }
  };

  const togglePermission = (perm: PermissionCode) => {
    if (!editingUser) return;
    if (isSuperAdmin(editingUser)) return; // Cannot change permissions of Superadmin

    const next = editingUser.permissions.includes(perm)
      ? editingUser.permissions.filter(p => p !== perm)
      : [...editingUser.permissions, perm];
    setEditingUser({ ...editingUser, permissions: next });
  };

  const toggleNewUserPermission = (perm: PermissionCode) => {
    const next = newUser.permissions.includes(perm)
      ? newUser.permissions.filter(p => p !== perm)
      : [...newUser.permissions, perm];
    setNewUser({ ...newUser, permissions: next });
  };

  const handleResetPassword = (user: User) => {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    setTempPassword(code);
    setActiveKebabId(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, isNewUserMode: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (isNewUserMode) {
           setNewUser({ ...newUser, avatar: base64 });
        } else if (editingUser) {
           setEditingUser({ ...editingUser, avatar: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
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

      {/* User Table - Optimized Layout (No horizontal scroll) */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] w-[35%]">Name & Email</th>
              <th className="px-2 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] w-[20%]">Role</th>
              <th className="px-2 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] text-center w-[15%]">Status</th>
              <th className="px-2 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] text-right w-[15%] hidden md:table-cell">Last Login</th>
              <th className="px-6 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] text-right w-[15%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr 
                key={user.id} 
                onClick={() => handleEditClick(user)}
                className="hover:bg-blue-50/30 cursor-pointer transition-all group relative"
              >
                <td className="px-6 py-5 overflow-hidden">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 shrink-0 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-black text-xs border border-slate-200 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{user.firstName[0]}{user.lastName[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                         <p className="font-black text-slate-900 text-sm leading-tight truncate">{user.firstName} {user.lastName}</p>
                         {isSuperAdmin(user) && <i className="fas fa-crown text-amber-400 text-xs" title="Super Admin"></i>}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold lowercase truncate">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-5">
                  <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest truncate">{user.role}</p>
                  <p className="text-[8px] text-slate-400 font-medium uppercase mt-0.5 truncate">{user.position}</p>
                </td>
                <td className="px-2 py-5 text-center">
                  <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${getStatusBadge(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-2 py-5 text-right hidden md:table-cell">
                  <p className="text-[10px] font-black text-slate-900">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '—'}</p>
                </td>
                <td className="px-6 py-5 text-right relative" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-end items-center space-x-2">
                    <button 
                      onClick={(e) => handleEditClick(user, e)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm"
                    >
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setActiveKebabId(activeKebabId === user.id ? null : user.id)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm"
                      >
                        <i className="fas fa-ellipsis-v text-xs"></i>
                      </button>
                      
                      {activeKebabId === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in slide-in-from-top-2 duration-200 ring-4 ring-black/5">
                          <button onClick={(e) => handleEditClick(user, e)} className="w-full text-left px-4 py-2.5 text-[9px] font-black text-slate-700 uppercase hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-3">
                            <i className="fas fa-user-edit w-3"></i>
                            <span>Edytuj Profil</span>
                          </button>
                          {isSuperAdmin(currentUser!) && (
                            <button onClick={() => handleResetPassword(user)} className="w-full text-left px-4 py-2.5 text-[9px] font-black text-slate-700 uppercase hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center space-x-3">
                              <i className="fas fa-key w-3"></i>
                              <span>Resetuj Hasło (Auto)</span>
                            </button>
                          )}
                          {!isSuperAdmin(user) && (
                            <>
                              <div className="border-t border-slate-50 my-1"></div>
                              <button 
                                onClick={() => { updateUser(user.id, { status: user.status === 'blocked' ? 'active' : 'blocked' }); setActiveKebabId(null); }}
                                className={`w-full text-left px-4 py-2.5 text-[9px] font-black uppercase transition-colors flex items-center space-x-3 ${user.status === 'blocked' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                              >
                                <i className={`fas ${user.status === 'blocked' ? 'fa-unlock' : 'fa-ban'} w-3`}></i>
                                <span>{user.status === 'blocked' ? 'Odblokuj' : 'Zablokuj'}</span>
                              </button>
                            </>
                          )}
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

      {/* Edit User Drawer */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="bg-slate-900 p-10 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center space-x-6">
                    <div className="relative group cursor-pointer">
                        <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-black shadow-2xl overflow-hidden border-2 border-white/10">
                            {editingUser.avatar ? <img src={editingUser.avatar} className="w-full h-full object-cover" /> : <span>{editingUser.firstName[0]}{editingUser.lastName[0]}</span>}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.5rem]" onClick={() => fileInputRef.current?.click()}>
                           <i className="fas fa-camera text-white"></i>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e)} />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black tracking-tight leading-none mb-1">Edycja: {editingUser.firstName}</h3>
                        <div className="flex items-center space-x-3">
                           {isSuperAdmin(editingUser) ? (
                             <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-amber-500/30">Super Admin</span>
                           ) : (
                             <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Użytkownik</span>
                           )}
                           <span className="text-[10px] font-bold opacity-50 uppercase">ID: {editingUser.id}</span>
                        </div>
                    </div>
                 </div>
                 <button onClick={() => setEditingUser(null)} className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center transition-all text-white/50 hover:text-white border border-white/5">
                    <i className="fas fa-times text-xl"></i>
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 {/* Section 1: Basic Profile */}
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Imię</label>
                       <input 
                         type="text" 
                         value={editingUser.firstName} 
                         onChange={e => setEditingUser({...editingUser, firstName: e.target.value})}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nazwisko</label>
                       <input 
                         type="text" 
                         value={editingUser.lastName} 
                         onChange={e => setEditingUser({...editingUser, lastName: e.target.value})}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">E-mail</label>
                       <input 
                         type="email" 
                         value={editingUser.email} 
                         onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rola Systemowa</label>
                       <select 
                         value={editingUser.role} 
                         disabled={isSuperAdmin(editingUser)}
                         onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                         className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 outline-none disabled:opacity-50"
                       >
                          <option value="ADMIN">ADMINISTRATOR</option>
                          <option value="SALES_MANAGER">SALES MANAGER</option>
                          <option value="SALES_REP">SALES REPRESENTATIVE</option>
                       </select>
                    </div>
                 </div>

                 {/* Section 1.5: Password Change */}
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Zmiana Hasła (Manualna)</h4>
                    <div className="flex gap-4 items-end">
                       <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nowe Hasło</label>
                          <input 
                            type="password"
                            placeholder="Wpisz aby zmienić..."
                            value={passwordChange.value}
                            onChange={e => setPasswordChange({ ...passwordChange, value: e.target.value })}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                       </div>
                       <label className="flex items-center space-x-3 p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer h-[58px]">
                          <input 
                            type="checkbox" 
                            checked={passwordChange.forced}
                            onChange={e => setPasswordChange({ ...passwordChange, forced: e.target.checked })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
                          />
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Wymuś zmianę</span>
                       </label>
                    </div>
                 </div>

                 {/* Section 2: RBAC Matrix */}
                 <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                          <i className="fas fa-shield-halved text-blue-600 text-lg"></i>
                          <h4 className="text-lg font-black text-slate-900">Uprawnienia (Permissions)</h4>
                       </div>
                       {isSuperAdmin(editingUser) && <span className="text-xs text-amber-500 font-bold"><i className="fas fa-lock mr-1"></i> Zablokowane dla Właściciela</span>}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                       {availablePermissions.map(perm => (
                         <button 
                           key={perm}
                           onClick={() => togglePermission(perm)}
                           disabled={isSuperAdmin(editingUser)}
                           className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group ${
                             editingUser.permissions.includes(perm) 
                               ? 'bg-blue-50 border-blue-200 text-blue-700' 
                               : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                           } ${isSuperAdmin(editingUser) ? 'opacity-80 cursor-not-allowed' : ''}`}
                         >
                            <span className="flex-1 pr-4">{perm.replace(/_/g, ' ')}</span>
                            {editingUser.permissions.includes(perm) && <i className="fas fa-check-circle text-blue-600"></i>}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Section 3: User Status */}
                 {!isSuperAdmin(editingUser) && (
                   <div className="pt-6 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-6">
                          <button 
                            onClick={() => { setEditingUser({...editingUser, status: editingUser.status === 'blocked' ? 'active' : 'blocked'}); }}
                            className={`p-5 rounded-[1.5rem] font-black text-[10px] uppercase transition-all flex items-center justify-center space-x-3 border-2 ${
                              editingUser.status === 'blocked' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                            }`}
                          >
                             <i className={`fas ${editingUser.status === 'blocked' ? 'fa-unlock' : 'fa-ban'} w-3`}></i>
                             <span>{editingUser.status === 'blocked' ? 'Odblokuj konto' : 'Zablokuj konto'}</span>
                          </button>
                          
                          <button 
                            onClick={() => { if(confirm("Czy na pewno usunąć użytkownika?")) { removeUser(editingUser.id); setEditingUser(null); } }}
                            className="p-5 bg-white border-2 border-slate-200 rounded-[1.5rem] font-black text-[10px] uppercase text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center space-x-3"
                          >
                             <i className="fas fa-trash-alt"></i>
                             <span>Usuń użytkownika</span>
                          </button>
                      </div>
                   </div>
                 )}
              </div>

              <div className="bg-slate-50 p-8 flex justify-between gap-6 shrink-0 border-t border-slate-100">
                 <button onClick={() => setEditingUser(null)} className="px-8 py-4 bg-white border-2 border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">ANULUJ</button>
                 <button onClick={handleSaveUser} className="px-12 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                    Zapisz zmiany
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Password Reset Modal (Generated) */}
      {tempPassword && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl animate-in zoom-in duration-300 p-6">
           <div className="bg-white rounded-[3rem] p-16 max-w-md w-full text-center space-y-10 shadow-3xl">
              <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
                 <i className="fas fa-lock"></i>
              </div>
              <div className="space-y-4">
                 <h4 className="text-2xl font-black text-slate-900">Nowe Hasło (Auto)</h4>
                 <p className="text-sm text-slate-500 font-medium">Przekaż poniższy kod użytkownikowi (funkcja Super Admin):</p>
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
           <div className="bg-white rounded-[3rem] w-full max-w-3xl overflow-hidden shadow-3xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
              <div className="bg-blue-600 p-8 text-white flex justify-between items-center shrink-0">
                 <h3 className="text-2xl font-black tracking-tight">Kreator Użytkownika</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-white/50 hover:text-white transition-all"><i className="fas fa-times text-xl"></i></button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto">
                 <div className="flex gap-8">
                    {/* Avatar Upload */}
                    <div className="w-24 shrink-0">
                       <div className="w-24 h-24 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 overflow-hidden relative group" onClick={() => document.getElementById('new_avatar_input')?.click()}>
                          {newUser.avatar ? (
                             <img src={newUser.avatar} className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
                          ) : (
                             <i className="fas fa-camera text-slate-300 text-2xl group-hover:text-blue-500 transition-colors"></i>
                          )}
                       </div>
                       <input type="file" id="new_avatar_input" className="hidden" accept="image/*" onChange={(e) => handleAvatarChange(e, true)} />
                       <p className="text-[9px] font-bold text-center text-slate-400 mt-2 uppercase">Avatar</p>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Imię</label>
                          <input 
                            type="text" 
                            value={newUser.firstName}
                            onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nazwisko</label>
                          <input 
                            type="text" 
                            value={newUser.lastName}
                            onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                       </div>
                       <div className="space-y-1 col-span-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-mail (Login)</label>
                          <input 
                            type="email" 
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rola</label>
                        <select 
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                           <option value="SALES_REP">Sales Representative</option>
                           <option value="SALES_MANAGER">Sales Manager</option>
                           <option value="ADMIN">Administrator</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hasło Startowe</label>
                        <input 
                          type="text" 
                          placeholder="Np. Start123!" 
                          value={newUser.password}
                          onChange={e => setNewUser({...newUser, password: e.target.value})}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </div>
                 </div>

                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Nadaj Uprawnienia (Permissions)</label>
                    <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2">
                       {availablePermissions.map(perm => (
                          <label key={perm} className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                             newUser.permissions.includes(perm) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 hover:bg-slate-50'
                          }`}>
                             <input 
                               type="checkbox" 
                               checked={newUser.permissions.includes(perm)}
                               onChange={() => toggleNewUserPermission(perm)}
                               className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                             />
                             <span className="text-[10px] font-bold uppercase">{perm.replace(/_/g, ' ')}</span>
                          </label>
                       ))}
                    </div>
                 </div>

                 <label className="flex items-center space-x-4 cursor-pointer p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <input 
                      type="checkbox" 
                      checked={newUser.mustChangePassword}
                      onChange={e => setNewUser({...newUser, mustChangePassword: e.target.checked})}
                      className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-xs font-bold text-blue-900">Wymuś zmianę hasła przy pierwszym logowaniu</span>
                 </label>
              </div>

              <div className="bg-slate-50 p-8 flex justify-end gap-4 shrink-0">
                 <button onClick={() => setShowAddModal(false)} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase text-slate-400 hover:bg-slate-50 transition-all">Anuluj</button>
                 <button 
                   onClick={handleCreateUser}
                   className="px-12 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all"
                 >
                    Utwórz Konto
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
