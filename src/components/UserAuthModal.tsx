import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import { User } from '../types';

interface UserAuthModalProps {
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ onClose }) => {
  const { staffList, currentUser, login, switchUser } = useApp();
  const [activeTab, setActiveTab] = useState<'switch' | 'login'>('switch');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('Por favor ingrese el nombre de usuario.');
      return;
    }

    const result = login(username, password);
    if (result.success) {
      setSuccessMessage('¡Sesión iniciada con éxito!');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(result.message || 'Error al iniciar sesión.');
    }
  };

  const handleQuickSwitch = (user: User) => {
    switchUser(user.id);
    onClose();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador General', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
      case 'specialist':
        return { label: 'Especialista / Cosmiatra', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
      case 'cashier':
        return { label: 'Caja & Recepción', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
      default:
        return { label: role, color: 'text-zinc-400 bg-zinc-800 border-zinc-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121216] border border-[#d4af37]/30 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#0c0c0e]">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-base font-semibold text-white font-serif-luxury tracking-wide">
              Acceso de Personal & Seguridad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-white p-1 rounded-lg hover:bg-[#1a1a20]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#27272a] bg-[#141418]">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === 'switch'
                ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-[#1a1a20]'
                : 'text-[#71717a] hover:text-[#e4e4e7]'
            }`}
          >
            Cambio Rápido de Usuario
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors ${
              activeTab === 'login'
                ? 'text-[#d4af37] border-b-2 border-[#d4af37] bg-[#1a1a20]'
                : 'text-[#71717a] hover:text-[#e4e4e7]'
            }`}
          >
            Ingreso con Usuario y Clave
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'switch' ? (
            <div>
              <p className="text-xs text-[#a1a1aa] mb-4">
                Selecciona el colaborador para cambiar de sesión y probar las funciones según su perfil (Directora, Especialistas o Caja):
              </p>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {staffList.map((user) => {
                  const badge = getRoleBadge(user.role);
                  const isCurrent = currentUser.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleQuickSwitch(user)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#d4af37]/10 border-[#d4af37]/60 shadow-sm'
                          : 'bg-[#18181d] border-[#27272a] hover:border-[#d4af37]/40 hover:bg-[#1d1d24]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#d4af37]/40 bg-[#27272a] shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-full h-full p-2 text-[#d4af37]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{user.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-[#d4af37] font-medium bg-[#d4af37]/20 px-2 py-0.5 rounded-full">
                                Activo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#a1a1aa]">{user.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-1 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <div className="text-[11px] text-[#a1a1aa] mt-1">
                          Comisión: {user.commissionRate}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
              <p className="text-xs text-[#a1a1aa]">
                Ingresa tus credenciales autorizadas del sistema Jilly Beauty Lab:
              </p>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#18181c] border border-[#27272a] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu clave"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#18181c] border border-[#27272a] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-[#d4af37]/20"
              >
                Ingresar al Sistema
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
