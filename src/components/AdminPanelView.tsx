import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StaffAndUsersView } from './StaffAndUsersView';
import { ReportsView } from './ReportsView';
import { InventoryView } from './InventoryView';
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ShieldAlert,
  UserCheck,
  Package
} from 'lucide-react';

interface AdminPanelViewProps {
  initialSubTab?: 'staff' | 'inventory' | 'reports' | 'credentials';
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ initialSubTab = 'staff' }) => {
  const { currentUser, staffList, updateStaff, login, switchUser } = useApp();
  const [adminTab, setAdminTab] = useState<'staff' | 'inventory' | 'reports' | 'credentials'>(initialSubTab);

  // Security gate for non-admins
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockPass, setShowUnlockPass] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Admin credentials edit state
  const adminUser = staffList.find(s => s.role === 'admin' || s.username === 'jilly.admin') || staffList[0];
  const [editAdminPass, setEditAdminPass] = useState(adminUser?.password || '');
  const [showEditPass, setShowEditPass] = useState(false);
  const [passUpdatedMsg, setPassUpdatedMsg] = useState('');

  const isAdmin = currentUser.role === 'admin' || !!currentUser.isAdminEnabled || currentUser.allowedPanels?.includes('admin');

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    const res = login('jilly.admin', unlockPassword);
    if (res.success) {
      setSecuritySuccess('¡Panel Administrador desbloqueado correctamente!');
    } else {
      setSecurityError('Contraseña incorrecta. Se requiere la clave de @jilly.admin.');
    }
  };

  const handleSaveAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdminPass.trim()) return;
    if (adminUser) {
      updateStaff(adminUser.id, { password: editAdminPass.trim() });
      setPassUpdatedMsg('¡Contraseña de la Directora actualizada exitosamente!');
      setTimeout(() => setPassUpdatedMsg(''), 4000);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-[#121216] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-4 text-[#d4af37] shadow-lg shadow-[#d4af37]/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Área Restringida a Dirección General</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-luxury tracking-wide">
            Panel de Control del Administrador
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            La <strong>Gestión de Personal, Claves del Equipo, Comisiones y Reportes Financieros</strong> solo pueden ser administrados por la Dirección de Jilly Beauty Lab.
          </p>

          <div className="p-3 bg-[#18181f] border border-[#27272a] rounded-xl text-xs text-zinc-300 mb-6 max-w-sm mx-auto">
            <span>Usuario actual: <strong>{currentUser.name}</strong> (@{currentUser.username})</span>
          </div>

          <form onSubmit={handleUnlockAdmin} className="max-w-sm mx-auto space-y-3.5 text-left" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showUnlockPass ? 'text' : 'password'}
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  placeholder="Ingrese contraseña de administrador"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowUnlockPass(!showUnlockPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showUnlockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {securityError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {securityError}
              </div>
            )}

            {securitySuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-md shadow-[#d4af37]/20 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Desbloquear como Administrador</span>
            </button>
          </form>

          {/* Direct Switch helper for convenience */}
          <div className="mt-6 pt-5 border-t border-[#222228]">
            <button
              onClick={() => {
                if (adminUser) switchUser(adminUser.id);
              }}
              className="text-xs text-[#d4af37] hover:underline inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cambiar directamente a perfil @jilly.admin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Panel Header Banner */}
      <div className="bg-gradient-to-r from-[#121216] via-[#1a1a24] to-[#121216] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fde047] text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Oficial de Dirección General</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-serif-luxury tracking-wide">
              Panel Administrador <span className="text-gold-gradient">Jilly Beauty Lab</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
              Centro de control privado: gestión de personal, contraseñas, comisiones de especialistas y reportes financieros.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-[#15151c] border border-[#27272a] rounded-xl text-right">
              <div className="text-[10px] text-zinc-400">Administrador Activo</div>
              <div className="text-xs font-bold text-[#d4af37]">@{currentUser.username}</div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Sesión Autorizada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtabs selector */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#252530] overflow-x-auto">
          <button
            onClick={() => setAdminTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              adminTab === 'staff'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personal, Claves & Servicios</span>
          </button>

          <button
            onClick={() => setAdminTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              adminTab === 'inventory'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Ajuste de Stock & Inventario</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              adminTab === 'inventory' ? 'bg-black/30 text-black' : 'bg-[#d4af37]/20 text-[#fde047]'
            }`}>
              Solo Admin
            </span>
          </button>

          <button
            onClick={() => setAdminTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              adminTab === 'reports'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reportes Financieros</span>
          </button>

          <button
            onClick={() => setAdminTab('credentials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              adminTab === 'credentials'
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Clave Maestra</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Gestionar Personal, Claves y Servicios */}
      {adminTab === 'staff' && (
        <StaffAndUsersView />
      )}

      {/* Tab 2: Ajuste de Stock & Inventario */}
      {adminTab === 'inventory' && (
        <InventoryView isAdminPanelMode={true} />
      )}

      {/* Tab 3: Reportes Financieros */}
      {adminTab === 'reports' && (
        <ReportsView />
      )}

      {/* Tab 4: Clave de Administrador */}
      {adminTab === 'credentials' && (
        <div className="max-w-xl mx-auto bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-[#252530] mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-serif-luxury">
                Credenciales de Acceso Administrador
              </h3>
              <p className="text-xs text-zinc-400">
                Cuenta principal de Dirección General de Jilly Beauty Lab
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAdminPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nombre de Usuario Principal
              </label>
              <input
                type="text"
                disabled
                value="@jilly.admin"
                className="w-full px-3.5 py-2.5 bg-[#17171e] border border-[#27272a] rounded-xl text-sm text-zinc-400 font-mono cursor-not-allowed"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                El usuario administrador está fijado a <strong className="text-zinc-300">@jilly.admin</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type={showEditPass ? 'text' : 'password'}
                  value={editAdminPass}
                  onChange={(e) => setEditAdminPass(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-sm text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPass(!showEditPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {passUpdatedMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{passUpdatedMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-md"
            >
              Guardar Nueva Clave de Administrador
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
