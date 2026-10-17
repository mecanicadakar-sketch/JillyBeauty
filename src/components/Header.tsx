import React, { useState } from 'react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { 
  UserCircle, 
  Wallet, 
  AlertTriangle, 
  LogOut, 
  RotateCcw, 
  ExternalLink, 
  Phone,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Menu,
  Copy,
  Check,
  Send,
  X,
  ShieldAlert
} from 'lucide-react';
import { UserAuthModal } from './UserAuthModal';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    products, 
    cashShift, 
    setActiveTab, 
    setViewMode,
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    logout 
  } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPortalShareModal, setShowPortalShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Calculate low stock products
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const portalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/clientes` 
    : 'https://jillybeauty.vercel.app/clientes';

  const copyPortalLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(portalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

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

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22 py-2 gap-3 sm:gap-6">
            {/* Brand Logo & Slogan */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <Logo size="md" showSubtitle={true} />
              
              <div className="hidden 2xl:flex flex-col border-l border-[#27272a] pl-5 py-1">
                <span className="text-xs text-[#d4af37] font-semibold tracking-wider whitespace-nowrap">
                  Tu belleza, en manos expertas
                </span>
                <span className="text-[11px] text-[#71717a] whitespace-nowrap">
                  Tecnología · Calidad · Resultados
                </span>
              </div>
            </div>

            {/* Quick Actions & Status Indicators */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Online Booking Portal Button for Clients */}
              <button
                onClick={() => setShowPortalShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#d4af37]/20 to-[#aa8421]/20 border border-[#d4af37]/50 text-[#fde047] hover:bg-[#d4af37]/30 transition-all shadow-sm"
                title="Página exclusiva y aislada para clientes (https://.../clientes)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Portal Clientes</span>
                <span className="sm:hidden">Clientes</span>
              </button>

              {/* Cash Status Pill */}
              <button
                onClick={() => setActiveTab('cashier')}
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  cashShift.status === 'open'
                    ? 'bg-[#18181b] border-emerald-500/40 text-emerald-400 hover:border-emerald-500'
                    : 'bg-[#18181b] border-rose-500/40 text-rose-400 hover:border-rose-500'
                }`}
                title="Estado de la Caja del Día"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>
                  {cashShift.status === 'open' ? 'Caja Abierta' : 'Caja Cerrada'}
                </span>
                {cashShift.status === 'open' && (
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">
                    ${(cashShift.openingAmount + cashShift.cashSales - cashShift.expenses).toFixed(2)}
                  </span>
                )}
              </button>

              {/* Low Stock Alert */}
              {lowStockCount > 0 && (
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
                  title="Insumos o productos con stock bajo"
                >
                  <AlertTriangle className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  <span className="hidden sm:inline">{lowStockCount} Stock Bajo</span>
                  <span className="sm:hidden">{lowStockCount}</span>
                </button>
              )}

              {/* Contact Direct Links */}
              <a
                href="https://wa.me/593986704085"
                target="_blank"
                rel="noreferrer"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#a1a1aa] hover:text-[#d4af37] border border-transparent hover:border-[#27272a] transition-all font-mono"
                title="WhatsApp Oficial: 0986 704 085"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>0986 704 085</span>
              </a>

              {/* Active User Switcher / Profile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-[#141417] border border-[#27272a] hover:border-[#d4af37]/50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4af37]/40 shrink-0 bg-[#27272a]">
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

                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-white tracking-wide truncate max-w-[120px]">
                        {currentUser.name}
                      </span>
                      {currentUser.role === 'admin' && (
                        <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#e5c158] font-medium leading-tight">
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#141418] border border-[#27272a] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-[#27272a]">
                      <div className="font-semibold text-xs text-white">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-[#e5c158]">
                        {currentUser.specialty}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Usuario: {currentUser.username}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowAuthModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-[#1f1f26] flex items-center gap-2 transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-[#d4af37]" />
                        <span>Cambiar de Colaboradora</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveTab('admin');
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-[#1f1f26] flex items-center gap-2 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                        <span>Panel Administrador (Foto & Perfil)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowPortalShareModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-[#1f1f26] flex items-center gap-2 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-[#d4af37]" />
                        <span>Página Aislada de Clientes (/clientes)</span>
                      </button>
                    </div>

                    <div className="border-t border-[#27272a] pt-1 mt-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión / Salir</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Quick Menu Hamburger Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir Menú de Fácil Acceso"
                className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[#141418] border border-[#27272a] hover:border-[#d4af37]/60 text-[#d4af37] active:scale-95 transition-all shadow-sm shrink-0"
                title="Menú de fácil acceso para celulares"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Share / Open Portal Modal */}
      {showPortalShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#252530] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Portal Exclusivo para Clientes
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Página aparte protegida para turnos online y consulta de fichas
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPortalShareModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                  <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seguridad de Datos: Acceso 100% Aislado</span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  Las clientas que abran este enlace <strong>solo pueden ver el formulario de reserva online y consultar sus propios tratamientos mediante su código</strong>. La app completa (caja POS, ingresos, inventario, personal y citas de otros clientes) permanece completamente oculta e inaccesible.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Enlace para compartir con clientas:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={portalUrl}
                    className="flex-1 px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-[#fde047] font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={copyPortalLink}
                    className="px-3.5 py-2 bg-[#d4af37] text-black font-bold rounded-xl text-xs hover:brightness-110 flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`✨ ¡Hola! Ya puedes agendar tu turno online en Jilly Beauty Lab y consultar tus tratamientos aquí:\n${portalUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setShowPortalShareModal(false);
                    setViewMode('client_portal');
                  }}
                  className="py-2.5 px-3 bg-[#1e1e28] hover:bg-[#282836] text-[#fde047] border border-[#d4af37]/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Ver Portal Aislado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Login/Switch Modal */}
      {showAuthModal && (
        <UserAuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};
