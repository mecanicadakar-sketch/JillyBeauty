import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays,
  Receipt,
  Users, 
  UserPlus, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  Phone, 
  Mail, 
  FileText, 
  Edit, 
  Trash2, 
  Check, 
  X,
  UserCheck,
  UserX,
  CreditCard,
  Upload,
  Camera,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Shield,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Award,
  Tag
} from 'lucide-react';
import { User, UserRole, Client, AppPanel } from '../types';
import { StaffPhotoUploader } from './StaffPhotoUploader';
import { compressAndResizeImage } from '../utils/image';

export const ALL_APP_PANELS: {
  id: AppPanel;
  label: string;
  shortLabel: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
}[] = [
  {
    id: 'appointments',
    label: 'Agenda & Citas',
    shortLabel: 'Agenda',
    desc: 'Calendario de turnos, agendamiento de citas y recordatorios',
    icon: CalendarDays,
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30'
  },
  {
    id: 'cashier',
    label: 'Caja & Cobros',
    shortLabel: 'Caja',
    desc: 'Punto de venta POS, cobro de citas, tickets y arqueo',
    icon: Receipt,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  },
  {
    id: 'services',
    label: 'Servicios',
    shortLabel: 'Servicios',
    desc: 'Catálogo de servicios, tratamientos y lista de tarifas',
    icon: Sparkles,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
  },
  {
    id: 'inventory',
    label: 'Stock & Insumos',
    shortLabel: 'Stock',
    desc: 'Consulta de existencias e insumos de cabina y reventa',
    icon: Package,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
  },
  {
    id: 'admin',
    label: 'Panel Administrador',
    shortLabel: 'Admin',
    desc: 'Gestión de personal, contraseñas, comisiones y reportes',
    icon: ShieldCheck,
    color: 'text-[#d4af37] bg-[#d4af37]/15 border-[#d4af37]/50',
    badgeBg: 'bg-[#d4af37]/15 text-[#fde047] border-[#d4af37]/50'
  }
];

export const StaffAndUsersView: React.FC = () => {
  const { 
    staffList, 
    addStaff, 
    updateStaff, 
    deleteStaff, 
    switchUser, 
    currentUser,
    clients,
    addOrUpdateClient,
    services
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'clients'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // New Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<User | null>(null);

  const [staffName, setStaffName] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('specialist');
  const [staffSpecialty, setStaffSpecialty] = useState('Cosmiatra & Terapeuta Facial');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffCommission, setStaffCommission] = useState<number>(25);
  const [staffAvatar, setStaffAvatar] = useState<string>('');
  const [editStaffAvatar, setEditStaffAvatar] = useState<string>('');

  // Sample quick aesthetic profile avatars
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'
  ];

  const handleQuickCardAvatarUpload = async (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await compressAndResizeImage(file, 300, 0.85);
      updateStaff(userId, { avatar: optimized });
    } catch (err: any) {
      alert(err.message || 'Error al actualizar la foto');
    }
  };

  // New Client Modal State
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientSkinType, setClientSkinType] = useState<'Normal' | 'Grasa' | 'Mixta' | 'Seca' | 'Sensible'>('Mixta');
  const [clientAllergies, setClientAllergies] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Admin & Panels permissions state
  const [staffIsAdmin, setStaffIsAdmin] = useState(false);
  const [staffAllowedPanels, setStaffAllowedPanels] = useState<AppPanel[]>(['appointments', 'services']);
  const [staffPermissions, setStaffPermissions] = useState({
    canManageInventory: false,
    canManageCashier: false,
    canManageServices: false,
    canViewReports: false,
    isAdminAccess: false
  });

  const handleToggleAdminRole = (makeAdmin: boolean) => {
    setStaffIsAdmin(makeAdmin);
    if (makeAdmin) {
      setStaffRole('admin');
      setStaffAllowedPanels(['appointments', 'cashier', 'inventory', 'services', 'admin']);
      setStaffPermissions({
        canManageInventory: true,
        canManageCashier: true,
        canManageServices: true,
        canViewReports: true,
        isAdminAccess: true
      });
    } else {
      setStaffRole('specialist');
      setStaffAllowedPanels(['appointments', 'services']);
      setStaffPermissions({
        canManageInventory: false,
        canManageCashier: false,
        canManageServices: false,
        canViewReports: false,
        isAdminAccess: false
      });
    }
  };

  const handleTogglePanel = (panelId: AppPanel) => {
    setStaffAllowedPanels(prev => 
      prev.includes(panelId) ? prev.filter(p => p !== panelId) : [...prev, panelId]
    );
  };

  const handleSelectAllPanels = () => {
    setStaffAllowedPanels(['appointments', 'cashier', 'inventory', 'services', 'admin']);
  };

  const handleSelectSpecialistPanels = () => {
    setStaffAllowedPanels(['appointments', 'services']);
  };

  const handleSelectCashierPanels = () => {
    setStaffAllowedPanels(['appointments', 'cashier', 'services']);
  };

  const handleDeselectAllPanels = () => {
    setStaffAllowedPanels([]);
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenAddStaff = () => {
    setStaffName('');
    setStaffUsername('');
    setStaffPassword('');
    setStaffRole('specialist');
    setStaffIsAdmin(false);
    setStaffSpecialty('Cosmiatra Facial & Láser');
    setStaffPhone('');
    setStaffEmail('');
    setStaffCommission(25);
    setStaffAvatar('');
    setStaffAllowedPanels(['appointments', 'services']);
    setStaffPermissions({
      canManageInventory: false,
      canManageCashier: false,
      canManageServices: false,
      canViewReports: false,
      isAdminAccess: false
    });
    setShowAddStaffModal(true);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffUsername.trim() || !staffPassword.trim()) {
      alert('Por favor complete el nombre, usuario y contraseña.');
      return;
    }

    // Check unique username
    const exists = staffList.some(s => s.username.toLowerCase() === staffUsername.toLowerCase().trim());
    if (exists) {
      alert('Ese nombre de usuario ya está registrado en el sistema. Elija otro.');
      return;
    }

    const finalAvatar = staffAvatar.trim() || (
      (staffRole === 'admin' || staffIsAdmin)
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    );

    const finalPanels: AppPanel[] = (staffIsAdmin || staffRole === 'admin')
      ? ['appointments', 'cashier', 'inventory', 'services', 'admin']
      : (staffAllowedPanels.length > 0 ? staffAllowedPanels : ['appointments', 'services']);

    addStaff({
      name: staffName.trim(),
      username: staffUsername.trim().toLowerCase(),
      password: staffPassword.trim(),
      role: staffIsAdmin ? 'admin' : staffRole,
      isAdminEnabled: staffIsAdmin,
      allowedPanels: finalPanels,
      permissions: {
        canManageInventory: staffIsAdmin || finalPanels.includes('inventory'),
        canManageCashier: staffIsAdmin || finalPanels.includes('cashier'),
        canManageServices: staffIsAdmin || finalPanels.includes('services'),
        canViewReports: staffIsAdmin || finalPanels.includes('admin'),
        isAdminAccess: staffIsAdmin
      },
      specialty: staffSpecialty.trim(),
      phone: staffPhone.trim() || '0986 704 085',
      email: staffEmail.trim() || `${staffUsername.trim()}@jillybeautylab.com`,
      commissionRate: staffCommission,
      active: true,
      avatar: finalAvatar
    });

    setShowAddStaffModal(false);
  };

  const handleOpenEditStaff = (user: User) => {
    setSelectedStaffForEdit(user);
    setStaffName(user.name);
    setStaffUsername(user.username);
    setStaffPassword(user.password || '');
    setStaffRole(user.role);
    const isAdmin = user.role === 'admin' || !!user.isAdminEnabled;
    setStaffIsAdmin(isAdmin);
    setStaffSpecialty(user.specialty);
    setStaffPhone(user.phone);
    setStaffEmail(user.email);
    setStaffCommission(user.commissionRate);
    setEditStaffAvatar(user.avatar || '');
    setStaffAllowedPanels(
      user.allowedPanels && user.allowedPanels.length > 0
        ? user.allowedPanels
        : (isAdmin 
            ? ['appointments', 'cashier', 'inventory', 'services', 'admin']
            : (user.role === 'cashier' 
                ? ['appointments', 'cashier', 'services']
                : ['appointments', 'services']))
    );
    setStaffPermissions({
      canManageInventory: !!user.permissions?.canManageInventory || isAdmin,
      canManageCashier: !!user.permissions?.canManageCashier || user.role === 'cashier' || isAdmin,
      canManageServices: !!user.permissions?.canManageServices || isAdmin,
      canViewReports: !!user.permissions?.canViewReports || isAdmin,
      isAdminAccess: !!user.permissions?.isAdminAccess || isAdmin
    });
    setShowEditStaffModal(true);
  };

  const handleUpdateStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForEdit) return;

    const finalPanels: AppPanel[] = (staffIsAdmin || staffRole === 'admin')
      ? ['appointments', 'cashier', 'inventory', 'services', 'admin']
      : (staffAllowedPanels.length > 0 ? staffAllowedPanels : ['appointments', 'services']);

    updateStaff(selectedStaffForEdit.id, {
      name: staffName.trim(),
      password: staffPassword.trim(),
      role: staffIsAdmin ? 'admin' : staffRole,
      isAdminEnabled: staffIsAdmin,
      allowedPanels: finalPanels,
      permissions: {
        canManageInventory: staffIsAdmin || finalPanels.includes('inventory'),
        canManageCashier: staffIsAdmin || finalPanels.includes('cashier'),
        canManageServices: staffIsAdmin || finalPanels.includes('services'),
        canViewReports: staffIsAdmin || finalPanels.includes('admin'),
        isAdminAccess: staffIsAdmin
      },
      specialty: staffSpecialty.trim(),
      phone: staffPhone.trim(),
      email: staffEmail.trim(),
      commissionRate: staffCommission,
      avatar: editStaffAvatar
    });

    setShowEditStaffModal(false);
    setSelectedStaffForEdit(null);
  };

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor complete el nombre y teléfono del cliente.');
      return;
    }

    addOrUpdateClient({
      name: clientName.trim(),
      phone: clientPhone.trim(),
      email: clientEmail.trim(),
      skinType: clientSkinType,
      allergies: clientAllergies.trim() || 'Ninguna conocida',
      notes: clientNotes.trim()
    });

    setShowAddClientModal(false);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientNotes('');
  };

  const getRoleLabel = (role: string) => {
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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121216] border border-[#27272a] rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide flex items-center gap-2">
            <span>Gestión de Personal & Fichas de Clientes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Carga de colaboradores con usuario y contraseña, asignación de comisiones y expedientes estéticos.
          </p>
        </div>

        {/* Subtabs */}
        <div className="flex items-center gap-1.5 bg-[#18181d] p-1 rounded-xl border border-[#27272a]">
          <button
            onClick={() => setActiveSubTab('staff')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'staff'
                ? 'bg-[#d4af37] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personal & Accesos ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('clients')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'clients'
                ? 'bg-[#d4af37] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fichas de Clientes ({clients.length})</span>
          </button>
        </div>
      </div>

      {/* Staff View */}
      {activeSubTab === 'staff' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-zinc-400">
              Colaboradores con credenciales de acceso al software de Jilly Beauty Lab:
            </span>

            <button
              onClick={handleOpenAddStaff}
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Habilitar Nuevo Colaborador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((user) => {
              const badge = getRoleLabel(user.role);
              const isCurrent = currentUser.id === user.id;
              const isPasswordVisible = visiblePasswords[user.id];

              return (
                <div
                  key={user.id}
                  className={`bg-[#131317] border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-[#d4af37]/70 bg-gradient-to-b from-[#18181e] to-[#121216]'
                      : 'border-[#27272a] hover:border-[#d4af37]/40'
                  }`}
                >
                  <div>
                    {/* Header: Avatar, Name & Role */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#222228]">
                      <div className="flex items-center gap-3">
                        <div className="relative group w-14 h-14 rounded-full overflow-hidden border-2 border-[#d4af37]/60 bg-[#27272a] shrink-0 shadow-md">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-full h-full p-2.5 text-[#d4af37]" />
                          )}
                          <label
                            className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[8px] font-semibold"
                            title="Cambiar foto de este colaborador"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#d4af37] mb-0.5" />
                            <span>Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleQuickCardAvatarUpload(user.id, e)}
                            />
                          </label>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {user.name}
                            {user.role === 'admin' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                            )}
                          </h4>
                          <p className="text-xs text-zinc-400 mt-0.5">{user.specialty}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Credentials & Access Info */}
                    <div className="py-3 space-y-2 text-xs">
                      <div className="p-2.5 bg-[#18181d] border border-[#27272a] rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Usuario de inicio:</span>
                          <span className="font-mono text-zinc-200 font-semibold">@{user.username}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-500">Contraseña:</span>
                          <div className="flex items-center gap-1.5 font-mono text-zinc-200">
                            <span>{isPasswordVisible ? (user.password || '******') : '••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="text-zinc-500 hover:text-zinc-300"
                            >
                              {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span>Comisión por servicios:</span>
                        <span className="font-bold text-[#d4af37]">{user.commissionRate}%</span>
                      </div>

                      <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                        <span>Teléfono:</span>
                        <span className="text-zinc-300">{user.phone}</span>
                      </div>

                      {/* Administrator privileges badge */}
                      {(user.role === 'admin' || user.isAdminEnabled) && (
                        <div className="p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-between text-xs text-[#fde047]">
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span>Habilitado como Administrador</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">Control Total</span>
                        </div>
                      )}

                      {/* Allowed Panels Badges */}
                      <div className="p-2.5 bg-[#17171e] border border-[#27272a] rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-zinc-400 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#d4af37]" />
                            <span>Paneles Habilitados:</span>
                          </span>
                          <span className="font-bold text-[#d4af37] font-mono text-[10px]">
                            {user.role === 'admin' || user.isAdminEnabled
                              ? '5 de 5 (Acceso Total)'
                              : `${(user.allowedPanels || ['appointments', 'services']).length} de 5`}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {user.role === 'admin' || user.isAdminEnabled ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fde047] font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
                              <span>Todos los Paneles (Administrador)</span>
                            </span>
                          ) : (
                            ALL_APP_PANELS.map(panel => {
                              const isAllowed = (user.allowedPanels || ['appointments', 'services']).includes(panel.id);
                              if (!isAllowed) return null;
                              const Icon = panel.icon;
                              return (
                                <span
                                  key={panel.id}
                                  className={`text-[9.5px] px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${panel.badgeBg}`}
                                  title={panel.label}
                                >
                                  <Icon className="w-2.5 h-2.5" />
                                  <span>{panel.shortLabel}</span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#222228] flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditStaff(user)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1c1c24] hover:bg-[#252530] text-[11px] text-zinc-200 border border-[#2d2d38] flex items-center gap-1 transition-colors"
                      title="Editar rol, contraseña y paneles habilitados"
                    >
                      <Edit className="w-3 h-3 text-[#d4af37]" />
                      <span>Editar Rol & Paneles</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {isCurrent ? (
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/30">
                          Sesión Actual
                        </span>
                      ) : (
                        <button
                          onClick={() => switchUser(user.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/30 text-[11px] text-[#e5c158] font-medium border border-[#d4af37]/40 transition-colors"
                        >
                          Usar Perfil
                        </button>
                      )}

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar colaborador ${user.name}?`)) {
                              deleteStaff(user.id);
                            }
                          }}
                          className="p-1.5 text-zinc-500 hover:text-rose-400"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Clients / Fichas Estéticas View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Expediente y ficha técnica de clientes atendidos en Jilly Beauty Lab:
            </span>

            <button
              onClick={() => setShowAddClientModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Nueva Ficha de Cliente</span>
            </button>
          </div>

          <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-[#27272a]">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Contacto</th>
                  <th className="pb-3 font-medium">Tipo de Piel</th>
                  <th className="pb-3 font-medium">Alergias / Contraindicaciones</th>
                  <th className="pb-3 font-medium">Observaciones Técnicas</th>
                  <th className="pb-3 font-medium">Total Visitas</th>
                  <th className="pb-3 font-medium text-right">Inversión Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222228]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-[#18181f] transition-colors">
                    <td className="py-3.5 font-bold text-white">
                      {c.name}
                    </td>
                    <td className="py-3.5 text-zinc-300">
                      <div>{c.phone}</div>
                      {c.email && <div className="text-[10px] text-zinc-500">{c.email}</div>}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] bg-zinc-800 text-amber-200 px-2 py-0.5 rounded border border-zinc-700">
                        {c.skinType || 'Normal'}
                      </span>
                    </td>
                    <td className="py-3.5 text-rose-300/90 text-[11px] max-w-xs">
                      {c.allergies || 'Ninguna conocida'}
                    </td>
                    <td className="py-3.5 text-zinc-400 text-[11px] max-w-xs truncate">
                      {c.notes || 'Sin notas'}
                    </td>
                    <td className="py-3.5 font-mono text-zinc-300">
                      {c.totalVisits} visitas
                    </td>
                    <td className="py-3.5 font-mono font-bold text-[#d4af37] text-right">
                      ${c.totalSpent.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Staff */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif-luxury">
                  Habilitar Nuevo Colaborador
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Asigne credenciales, rol, privilegios de administrador y servicios habilitados
                </p>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              {/* Photo / Avatar Upload Section with Live Preview */}
              <StaffPhotoUploader
                currentAvatar={staffAvatar}
                onAvatarChange={setStaffAvatar}
                staffName={staffName}
                staffRoleLabel={getRoleLabel(staffRole).label}
                staffSpecialty={staffSpecialty}
                mode="add"
              />

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gabriela Sánchez"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Rol Principal en el Spa *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setStaffRole(newRole);
                      if (newRole === 'admin') {
                        handleToggleAdminRole(true);
                      } else {
                        setStaffIsAdmin(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="specialist">Especialista / Cosmiatra (Cabina)</option>
                    <option value="admin">Administrador General (Dirección)</option>
                    <option value="cashier">Caja / Recepcionista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Especialidad / Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej. Cosmiatra Facial & Láser"
                    value={staffSpecialty}
                    onChange={(e) => setStaffSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Paneles y Módulos Habilitados para este Colaborador */}
              <div className="p-4 bg-[#15151c] border border-[#27272a] rounded-2xl space-y-3.5">
                {/* Habilitar como Administrador Switch */}
                <div className={`p-3 rounded-xl border transition-all ${
                  staffIsAdmin || staffRole === 'admin'
                    ? 'bg-[#d4af37]/15 border-[#d4af37]/60 shadow-sm'
                    : 'bg-[#181820] border-[#27272a]'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={staffIsAdmin || staffRole === 'admin'}
                      onChange={(e) => handleToggleAdminRole(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-zinc-600 text-[#d4af37] focus:ring-[#d4af37] bg-zinc-800 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#fde047]">
                        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                        <span>Habilitar a Administrador (Acceso Total & Dirección)</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                        Concede acceso a todos los paneles del spa: <strong>Agenda, Caja, Servicios, Inventario y Panel Administrador</strong>, además de autorizar ajustes oficiales de stock.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Subheader & Quick buttons for panels */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#22222a]">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#d4af37]" />
                      <span>Paneles donde podrá ingresar ({staffIsAdmin ? 5 : staffAllowedPanels.length} de 5 habilitados)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Selecciona a qué secciones del sistema tendrá acceso este colaborador:
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-200 border border-[#2d2d3a] transition-colors"
                    >
                      Habilitar Todos
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectSpecialistPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-300 hover:text-white border border-[#2d2d3a] transition-colors"
                      title="Agenda y Servicios"
                    >
                      Agenda & Servicios
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectCashierPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-300 hover:text-white border border-[#2d2d3a] transition-colors"
                      title="Caja, Agenda y Servicios"
                    >
                      Caja & Agenda
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-400 hover:text-zinc-200 border border-[#2d2d3a] transition-colors"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                {/* Grid of the 5 panels with checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_APP_PANELS.map(panel => {
                    const isChecked = staffIsAdmin || staffAllowedPanels.includes(panel.id);
                    const Icon = panel.icon;
                    return (
                      <div
                        key={panel.id}
                        onClick={() => {
                          if (staffIsAdmin) return;
                          handleTogglePanel(panel.id);
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-[#1b1b24] border-[#d4af37]/60 shadow-sm'
                            : 'bg-[#141418] border-[#222228] opacity-70 hover:opacity-100 hover:border-zinc-700'
                        } ${staffIsAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={staffIsAdmin}
                          onChange={() => {}}
                          className="w-4 h-4 mt-0.5 rounded border-zinc-600 text-[#d4af37] focus:ring-[#d4af37] bg-zinc-800 shrink-0 pointer-events-none"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-zinc-300'}`}>
                              {panel.label}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 mt-1 leading-snug">
                            {panel.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-[#18181d] border border-[#27272a] rounded-xl space-y-3">
                <span className="text-[11px] font-semibold text-[#d4af37] block">
                  Credenciales de Acceso al Sistema
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Nombre de Usuario *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ingrese usuario"
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-1">Contraseña de Acceso *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ingrese clave"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="0986702007"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Comisión por Servicios (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffCommission}
                    onChange={(e) => setStaffCommission(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-[#18181d] text-zinc-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110"
                >
                  Registrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff */}
      {showEditStaffModal && selectedStaffForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif-luxury">
                  Editar Colaborador: {selectedStaffForEdit.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Actualice rol, privilegios de administrador, contraseña y servicios habilitados
                </p>
              </div>
              <button onClick={() => setShowEditStaffModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} className="space-y-4">
              {/* Photo / Avatar Upload Section */}
              <StaffPhotoUploader
                currentAvatar={editStaffAvatar}
                onAvatarChange={setEditStaffAvatar}
                staffName={staffName}
                staffRoleLabel={getRoleLabel(staffRole).label}
                staffSpecialty={staffSpecialty}
                mode="edit"
              />

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Rol en el Spa *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setStaffRole(newRole);
                      if (newRole === 'admin') {
                        handleToggleAdminRole(true);
                      } else {
                        setStaffIsAdmin(false);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="specialist">Especialista / Cosmiatra (Cabina)</option>
                    <option value="admin">Administrador General (Dirección)</option>
                    <option value="cashier">Caja / Recepcionista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Especialidad / Cargo</label>
                  <input
                    type="text"
                    value={staffSpecialty}
                    onChange={(e) => setStaffSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Paneles y Módulos Habilitados para este Colaborador */}
              <div className="p-4 bg-[#15151c] border border-[#27272a] rounded-2xl space-y-3.5">
                {/* Habilitar como Administrador Switch */}
                <div className={`p-3 rounded-xl border transition-all ${
                  staffIsAdmin || staffRole === 'admin'
                    ? 'bg-[#d4af37]/15 border-[#d4af37]/60 shadow-sm'
                    : 'bg-[#181820] border-[#27272a]'
                }`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={staffIsAdmin || staffRole === 'admin'}
                      onChange={(e) => handleToggleAdminRole(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-zinc-600 text-[#d4af37] focus:ring-[#d4af37] bg-zinc-800 shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#fde047]">
                        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                        <span>Habilitar a Administrador (Acceso Total & Dirección)</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                        Concede acceso a todos los paneles del spa: <strong>Agenda, Caja, Servicios, Inventario y Panel Administrador</strong>, además de autorizar ajustes oficiales de stock.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Subheader & Quick buttons for panels */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#22222a]">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#d4af37]" />
                      <span>Paneles donde podrá ingresar ({staffIsAdmin ? 5 : staffAllowedPanels.length} de 5 habilitados)</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Selecciona a qué secciones del sistema tendrá acceso este colaborador:
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSelectAllPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-200 border border-[#2d2d3a] transition-colors"
                    >
                      Habilitar Todos
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectSpecialistPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-300 hover:text-white border border-[#2d2d3a] transition-colors"
                      title="Agenda y Servicios"
                    >
                      Agenda & Servicios
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectCashierPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-300 hover:text-white border border-[#2d2d3a] transition-colors"
                      title="Caja, Agenda y Servicios"
                    >
                      Caja & Agenda
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAllPanels}
                      className="px-2.5 py-1 rounded-lg bg-[#22222c] hover:bg-[#2c2c38] text-[10.5px] text-zinc-400 hover:text-zinc-200 border border-[#2d2d3a] transition-colors"
                    >
                      Desmarcar
                    </button>
                  </div>
                </div>

                {/* Grid of the 5 panels with checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_APP_PANELS.map(panel => {
                    const isChecked = staffIsAdmin || staffAllowedPanels.includes(panel.id);
                    const Icon = panel.icon;
                    return (
                      <div
                        key={panel.id}
                        onClick={() => {
                          if (staffIsAdmin) return;
                          handleTogglePanel(panel.id);
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'bg-[#1b1b24] border-[#d4af37]/60 shadow-sm'
                            : 'bg-[#141418] border-[#222228] opacity-70 hover:opacity-100 hover:border-zinc-700'
                        } ${staffIsAdmin ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={staffIsAdmin}
                          onChange={() => {}}
                          className="w-4 h-4 mt-0.5 rounded border-zinc-600 text-[#d4af37] focus:ring-[#d4af37] bg-zinc-800 shrink-0 pointer-events-none"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-zinc-300'}`}>
                              {panel.label}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-zinc-400 mt-1 leading-snug">
                            {panel.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Contraseña de Acceso *</label>
                <input
                  type="text"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Ingrese nueva contraseña"
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Comisión (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={staffCommission}
                    onChange={(e) => setStaffCommission(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditStaffModal(false)}
                  className="px-4 py-2 bg-[#18181d] text-zinc-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Client */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-serif-luxury mb-3">
              Crear Ficha Técnica de Cliente
            </h3>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Patricia Mora"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0986702007"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Tipo de Piel</label>
                  <select
                    value={clientSkinType}
                    onChange={(e) => setClientSkinType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Grasa">Grasa / Seborreica</option>
                    <option value="Mixta">Mixta</option>
                    <option value="Seca">Seca / Deshidratada</option>
                    <option value="Sensible">Sensible / Reactiva</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Alergias o Contraindicaciones</label>
                <input
                  type="text"
                  placeholder="Ej. Alergia a mariscos (colágeno), látex, aspirina..."
                  value={clientAllergies}
                  onChange={(e) => setClientAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Observaciones / Tratamientos Previos</label>
                <textarea
                  rows={2}
                  placeholder="Historial de peelings, marcas, lunares, objetivos de belleza..."
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 bg-[#18181d] text-zinc-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
