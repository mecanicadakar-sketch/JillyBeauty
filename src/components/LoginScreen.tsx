import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, setViewMode } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim()) {
      setErrorMessage('Por favor ingrese su nombre de usuario.');
      return;
    }

    const res = login(username.trim(), password);
    if (res.success) {
      setSuccessMessage('¡Acceso autorizado! Iniciando sesión...');
    } else {
      setErrorMessage(res.message || 'Credenciales incorrectas. Verifique usuario y clave.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.15),rgba(255,255,255,0))] flex flex-col items-center justify-center p-4 sm:p-6 text-white selection:bg-[#d4af37]/30">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" showSubtitle={true} />
          </div>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto">
            Sistema Administrativo, Agenda & Punto de Venta Spa
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111116] border border-[#27272a] shadow-2xl rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold accent light */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-[#222228] mb-5">
            <div>
              <h2 className="text-lg font-bold font-serif-luxury text-white">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-zinc-400">
                Ingrese sus credenciales privadas de acceso
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese su usuario"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#d4af37]/25 flex items-center justify-center gap-2"
            >
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Portal de Turnos Online Public Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setViewMode('client_portal')}
            className="text-xs text-[#d4af37] hover:underline flex items-center justify-center gap-1.5 mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>¿Eres clienta? Ver Portal de Turnos Online</span>
          </button>
        </div>
      </div>
    </div>
  );
};
