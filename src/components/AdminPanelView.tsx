import React, { useState, useEffect } from 'react';
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
  Package,
  Camera,
  Upload,
  UserCircle,
  Save,
  Phone,
  Mail,
  Award,
  Sparkle,
  Image as ImageIcon
} from 'lucide-react';
import { compressAndResizeImage } from '../utils/image';

interface AdminPanelViewProps {
  initialSubTab?: 'profile' | 'staff' | 'inventory' | 'reports' | 'credentials';
}

const PRESET_ADMIN_AVATARS = [
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80'
];

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({ initialSubTab = 'profile' }) => {
  const { currentUser, staffList, updateAdminProfile, login, switchUser } = useApp();
  const [adminTab, setAdminTab] = useState<'profile' | 'staff' | 'inventory' | 'reports' | 'credentials'>(initialSubTab);

  // Security gate for non-admins
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockPass, setShowUnlockPass] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // Target Admin User
  const adminUser = staffList.find(s => s.role === 'admin' || s.username === 'jilly.admin') || currentUser;

  // Profile Form State
  const [adminName, setAdminName] = useState(adminUser?.name || 'Directora Jilly');
  const [adminSpecialty, setAdminSpecialty] = useState(adminUser?.specialty || 'Dirección Médica & Cosmiatría Avanzada');
  const [adminPhone, setAdminPhone] = useState(adminUser?.phone || '0986702007');
  const [adminEmail, setAdminEmail] = useState(adminUser?.email || 'direccion@jillybeautylab.com');
  const [adminAvatar, setAdminAvatar] = useState(adminUser?.avatar || '');
  const [adminPassword, setAdminPassword] = useState(adminUser?.password || 'Jet120588#');
  const [showProfilePass, setShowProfilePass] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Synchronize if adminUser changes in context
  useEffect(() => {
    if (adminUser) {
      setAdminName(adminUser.name || 'Directora Jilly');
      setAdminSpecialty(adminUser.specialty || 'Dirección Médica & Cosmiatría Avanzada');
      setAdminPhone(adminUser.phone || '0986702007');
      setAdminEmail(adminUser.email || 'direccion@jillybeautylab.com');
      setAdminAvatar(adminUser.avatar || '');
      setAdminPassword(adminUser.password || 'Jet120588#');
    }
  }, [adminUser]);

  const isAdmin = currentUser.role === 'admin' || !!currentUser.isAdminEnabled || currentUser.allowedPanels?.includes('admin');

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    const res = login(adminUser?.username || 'jilly.admin', unlockPassword);
    if (res.success) {
      setSecuritySuccess('¡Panel Administrador desbloqueado correctamente!');
    } else {
      setSecurityError('Contraseña incorrecta. Verifique la contraseña de administrador.');
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const optimized = await compressAndResizeImage(file, 400, 0.88);
      setAdminAvatar(optimized);
      setProfileSuccessMsg('Foto cargada en vista previa. Haga clic en "Guardar Foto y Datos del Administrador" para confirmar.');
    } catch (err: any) {
      alert(err.message || 'Error al procesar la imagen seleccionada.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveAdminProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim()) {
      alert('Por favor ingrese el nombre del administrador.');
      return;
    }

    updateAdminProfile({
      name: adminName.trim(),
      specialty: adminSpecialty.trim(),
      phone: adminPhone.trim(),
      email: adminEmail.trim(),
      avatar: adminAvatar,
      password: adminPassword.trim()
    });

    setProfileSuccessMsg('¡Datos y Foto del Administrador guardados exitosamente! Los cambios permanecerán intactos aunque cierres sesión.');
    setTimeout(() => {
      setProfileSuccessMsg('');
    }, 5000);
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
            La <strong>Gestión de Personal, Datos del Administrador, Accesos del Equipo y Reportes Financieros</strong> solo pueden ser administrados por la Dirección de Jilly Beauty Lab.
          </p>

          <div className="p-3 bg-[#18181f] border border-[#27272a] rounded-xl text-xs text-zinc-300 mb-6 max-w-sm mx-auto">
            <span>Usuario actual: <strong>{currentUser.name}</strong></span>
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
      <div className="bg-gradient-to-r from-[#121216] via-[#1a1a24] to-[#121216] border border-[#d4af37]/40 rounded-2xl p-4 sm:p-7 shadow-xl relative overflow-hidden">
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
              Centro de control privado: perfil del administrador, gestión de personal, contraseñas, comisiones y reportes financieros.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-[#15151c] border border-[#27272a] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d4af37] shrink-0 bg-[#22222a]">
                {adminAvatar ? (
                  <img src={adminAvatar} alt={adminName} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-full h-full text-[#d4af37]" />
                )}
              </div>
              <div className="text-left">
                <div className="text-[10px] text-zinc-400">Directora Activa</div>
                <div className="text-xs font-bold text-[#d4af37] truncate max-w-[130px]">{adminName}</div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Sesión Guardada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtabs selector */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#252530] overflow-x-auto pb-2">
          <button
            onClick={() => setAdminTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              adminTab === 'profile'
                ? 'bg-[#d4af37] text-black shadow-md font-bold'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Foto & Datos del Administrador</span>
          </button>

          <button
            onClick={() => setAdminTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              adminTab === 'staff'
                ? 'bg-[#d4af37] text-black shadow-md font-bold'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personal & Accesos</span>
          </button>

          <button
            onClick={() => setAdminTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              adminTab === 'inventory'
                ? 'bg-[#d4af37] text-black shadow-md font-bold'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Ajuste de Stock & Insumos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              adminTab === 'inventory' ? 'bg-black/30 text-black' : 'bg-[#d4af37]/20 text-[#fde047]'
            }`}>
              Solo Admin
            </span>
          </button>

          <button
            onClick={() => setAdminTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              adminTab === 'reports'
                ? 'bg-[#d4af37] text-black shadow-md font-bold'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Reportes Financieros</span>
          </button>

          <button
            onClick={() => setAdminTab('credentials')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
              adminTab === 'credentials'
                ? 'bg-[#d4af37] text-black shadow-md font-bold'
                : 'bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Clave Maestra</span>
          </button>
        </div>
      </div>

      {/* Tab 0: Perfil & Foto del Administrador (User Request 4) */}
      {adminTab === 'profile' && (
        <div className="max-w-2xl mx-auto bg-[#121216] border border-[#d4af37]/40 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#252530]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-serif-luxury">
                  Foto & Datos de la Dirección
                </h3>
                <p className="text-xs text-zinc-400">
                  Modifica tu imagen, nombre y datos. Los cambios se guardan permanentemente en el sistema.
                </p>
              </div>
            </div>

            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fde047] font-bold uppercase tracking-wider">
              Guardado Permanente
            </span>
          </div>

          {profileSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-medium leading-relaxed">{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveAdminProfile} className="space-y-6" autoComplete="off">
            {/* Foto / Avatar Upload Section */}
            <div className="bg-[#17171f] border border-[#27272a] rounded-2xl p-4 sm:p-5">
              <label className="block text-xs font-bold text-white mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#d4af37]" />
                <span>Foto de Perfil del Administrador</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#d4af37] shadow-xl bg-[#22222a] flex items-center justify-center">
                    {adminAvatar ? (
                      <img 
                        src={adminAvatar} 
                        alt={adminName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <UserCircle className="w-20 h-20 text-[#d4af37]" />
                    )}
                  </div>
                  <label 
                    htmlFor="admin-photo-input"
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-opacity backdrop-blur-xs"
                  >
                    <Camera className="w-5 h-5 text-[#fde047] mb-1" />
                    <span>Cambiar Foto</span>
                  </label>
                </div>

                {/* Upload & Select Options */}
                <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                  <div>
                    <label
                      htmlFor="admin-photo-input"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#e5c158] text-black font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingPhoto ? 'Procesando imagen...' : 'Subir Foto desde tu Celular / PC'}</span>
                    </label>
                    <input
                      id="admin-photo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1.5">
                      Admite JPG, PNG, WebP. La foto se optimiza y comprime automáticamente.
                    </p>
                  </div>

                  {/* Preset Avatars for Instant Selection */}
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-semibold mb-1.5">
                      O selecciona un avatar predeterminado de alta estética:
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      {PRESET_ADMIN_AVATARS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAdminAvatar(presetUrl)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                            adminAvatar === presetUrl 
                              ? 'border-[#fde047] scale-110 shadow-md shadow-[#d4af37]/40 ring-2 ring-[#d4af37]/30' 
                              : 'border-zinc-700 hover:border-zinc-400 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={presetUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nombre Completo de la Directora / Administradora *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ej. Directora Jilly"
                  className="w-full px-3.5 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Cargo / Especialidad Principal
                </label>
                <input
                  type="text"
                  value={adminSpecialty}
                  onChange={(e) => setAdminSpecialty(e.target.value)}
                  placeholder="Ej. Dirección Médica & Cosmiatría Avanzada"
                  className="w-full px-3.5 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Teléfono / WhatsApp de Contacto
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="0986702007"
                  className="w-full px-3.5 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Correo Electrónico Oficial
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="direccion@jillybeautylab.com"
                  className="w-full px-3.5 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contraseña de Administrador
                </label>
                <div className="relative">
                  <input
                    type={showProfilePass ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Contraseña de acceso"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePass(!showProfilePass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showProfilePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Esta contraseña se mantendrá guardada para tus próximos inicios de sesión.
                </span>
              </div>
            </div>

            {/* PROMINENT SAVE BUTTON (User explicitly requested "veo botón guardar") */}
            <div className="pt-4 border-t border-[#252530] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 text-center sm:text-left">
                <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>Al guardar, tus cambios y tu foto se conservan aunque cierres sesión.</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-xl shadow-[#d4af37]/30 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar Foto y Datos del Administrador</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 1: Gestionar Personal, Claves y Paneles */}
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

      {/* Tab 4: Clave Maestra */}
      {adminTab === 'credentials' && (
        <div className="max-w-xl mx-auto bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-[#252530]">
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

          <form onSubmit={handleSaveAdminProfile} className="space-y-4">
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
                  type={showProfilePass ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-sm text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowProfilePass(!showProfilePass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showProfilePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Nueva Clave de Administrador</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
