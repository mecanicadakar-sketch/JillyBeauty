import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { UserAuthModal } from './UserAuthModal';
import { 
  X, 
  CalendarDays, 
  Receipt, 
  Package, 
  Sparkles, 
  Users, 
  BarChart3, 
  UserCircle, 
  Wallet, 
  AlertTriangle, 
  Phone, 
  Instagram, 
  LogOut, 
  Plus, 
  ChevronRight, 
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock,
  Heart,
  Lock
} from 'lucide-react';
import { canAccessPanel, AppPanel } from '../types';

interface MobileDrawerMenuProps {
  onNewAppointmentClick: () => void;
}

export const MobileDrawerMenu: React.FC<MobileDrawerMenuProps> = ({ onNewAppointmentClick }) => {
  const { 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    activeTab, 
    setActiveTab, 
    currentUser, 
    products, 
    cashShift, 
    appointments, 
    clients,
    setViewMode, 
    logout 
  } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);

  if (!isMobileMenuOpen) return null;

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(
    a => a.date === todayStr && a.status !== 'cancelled' && a.status !== 'paid'
  ).length;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Directora / Admin';
      case 'specialist':
        return 'Especialista';
      case 'cashier':
        return 'Recepción / Caja';
      default:
        return role;
    }
  };

  const navMenuItems = [
    {
      id: 'appointments',
      title: 'Citas & Agenda',
      subtitle: 'Turnos del spa, recordatorios por WhatsApp y estados',
      icon: CalendarDays,
      badge: todayAppointmentsCount > 0 ? `${todayAppointmentsCount} hoy` : undefined,
    },
    {
      id: 'cashier',
      title: 'Caja & Cobros',
      subtitle: 'Punto de venta, cobro de citas, gastos y arqueo',
      icon: Receipt,
      badge: cashShift.status === 'open' ? 'Abierta' : 'Cerrada',
      badgeColor: cashShift.status === 'open' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300',
    },
    {
      id: 'clients',
      title: 'Fichas de Clientes',
      subtitle: 'Historial de visitas, diagnósticos de piel y precarga',
      icon: Users,
      badge: `${clients.length} fichas`,
      badgeColor: 'bg-pink-500/20 text-pink-300',
    },
    {
      id: 'inventory',
      title: 'Stock & Insumos',
      subtitle: 'Control de productos de reventa e insumos de cabina',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alertas` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'services',
      title: 'Catálogo de Servicios',
      subtitle: 'Faciales, peeling, micropigmentación, láser y corporales',
      icon: Sparkles,
    },
    {
      id: 'admin',
      title: 'Panel Administrador',
      subtitle: 'Foto y Datos, Personal, Claves y Reportes Financieros',
      icon: ShieldCheck,
      adminOnly: true,
      badge: 'Admin',
      badgeColor: 'bg-[#d4af37]/20 text-[#fde047]',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm sm:hidden transition-opacity"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0c0c10] border-l border-[#27272a] shadow-2xl flex flex-col sm:hidden overflow-hidden transform transition-transform duration-300 ease-out"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222228] bg-[#101015]">
          <Logo 
            size="sm" 
            showSubtitle={true} 
            onClick={() => {
              setActiveTab('appointments');
              setViewMode('admin');
              setIsMobileMenuOpen(false);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} 
          />
          
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Cerrar menú"
            className="w-9 h-9 rounded-xl bg-[#1c1c24] border border-[#2d2d38] flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#d4af37]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Active User Card with Avatar */}
          <div className="bg-gradient-to-br from-[#16161c] to-[#121216] border border-[#27272a] rounded-2xl p-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4af37]/70 shrink-0 bg-[#22222a] shadow-md">
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <UserCircle className="w-full h-full text-[#d4af37]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate font-serif-luxury tracking-wide">
                    {currentUser.name}
                  </span>
                  {currentUser.role === 'admin' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  )}
                </div>
                <div className="text-[11px] text-[#e5c158] font-medium truncate">
                  {getRoleLabel(currentUser.role)} · {currentUser.specialty}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Conectado</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#222228] grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setShowAuthModal(true);
                }}
                className="py-1.5 px-2.5 bg-[#1e1e26] hover:bg-[#282834] text-xs font-semibold text-[#d4af37] rounded-xl border border-[#d4af37]/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span>Cambiar</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="py-1.5 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 rounded-xl border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar / Salir</span>
              </button>
            </div>
          </div>

          {/* Golden Highlight: Portal de Clientes Online */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37]/15 via-[#aa8421]/15 to-[#d4af37]/10 border border-[#d4af37]/40 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#fde047]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Portal Web para Clientes</h4>
                  <p className="text-[10px] text-zinc-300 mt-0.5">
                    Página para que las clientas soliciten turnos online
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setViewMode('client_portal');
                setIsMobileMenuOpen(false);
              }}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs shadow-md hover:brightness-110 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              <span>Abrir Portal de Turnos Online</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Primary Action: + Nueva Cita */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNewAppointmentClick();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#181820] hover:bg-[#22222c] border border-[#d4af37]/50 text-white font-semibold text-xs flex items-center justify-between transition-colors shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[#fde047]">Agendar Nueva Cita</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Quick Status Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Cash Status */}
            <button
              onClick={() => handleSelectTab('cashier')}
              className={`p-2.5 rounded-xl border text-left transition-colors ${
                cashShift.status === 'open'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:border-emerald-500'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300 hover:border-rose-500'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                <Wallet className="w-3 h-3" />
                <span>{cashShift.status === 'open' ? 'Caja Abierta' : 'Caja Cerrada'}</span>
              </div>
              <div className="text-sm font-mono font-bold mt-1 text-white">
                ${(cashShift.openingAmount + cashShift.cashSales - cashShift.expenses).toFixed(2)}
              </div>
            </button>

            {/* Low stock status */}
            <button
              onClick={() => handleSelectTab('inventory')}
              className={`p-2.5 rounded-xl border text-left transition-colors ${
                lowStockCount > 0
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-300 hover:border-amber-500'
                  : 'bg-[#14141a] border-[#27272a] text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                <AlertTriangle className={`w-3 h-3 ${lowStockCount > 0 ? 'text-amber-400' : ''}`} />
                <span>Stock de Insumos</span>
              </div>
              <div className="text-sm font-bold mt-1 text-white">
                {lowStockCount > 0 ? `${lowStockCount} por reponer` : 'Stock al día'}
              </div>
            </button>
          </div>

          {/* All Main Views List */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
              Secciones del Sistema
            </div>

            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const hasAccess = canAccessPanel(currentUser, item.id as AppPanel);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#fde047]'
                      : 'bg-[#121217] hover:bg-[#1a1a22] border border-[#222228] text-zinc-300 hover:text-white'
                  } ${!hasAccess ? 'opacity-65' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive 
                        ? 'bg-[#d4af37] text-black font-bold' 
                        : (!hasAccess ? 'bg-[#18181f] text-zinc-600' : 'bg-[#1c1c24] text-[#d4af37]')
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {!hasAccess && (
                          <span className="text-[9px] text-zinc-500 font-mono uppercase bg-zinc-800/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5 text-zinc-500" />
                            <span>Bloqueado</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && hasAccess && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-[#d4af37] text-black'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Contact & Social Links */}
          <div className="pt-3 border-t border-[#222228] space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2">
              Atención y Redes Oficiales
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://wa.me/593986704085"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121217] border border-[#222228] hover:border-emerald-500/40 text-xs text-zinc-300 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-zinc-400">WhatsApp Spa</div>
                  <div className="text-xs font-medium truncate">0986 704 085</div>
                </div>
              </a>

              <a
                href="https://www.instagram.com/jillybeautylab"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#121217] border border-[#222228] hover:border-pink-500/40 text-xs text-zinc-300 hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-zinc-400">Instagram</div>
                  <div className="text-xs font-medium truncate">@jillybeautylab</div>
                </div>
              </a>
            </div>
          </div>

          {/* Cerrar Sesión / Salir Button */}
          <div className="pt-2 pb-6">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#16161c] hover:bg-rose-950/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Cerrar Sesión / Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Login/Switch Modal */}
      {showAuthModal && (
        <UserAuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};
