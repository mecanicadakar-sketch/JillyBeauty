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
  Menu
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

  // Calculate low stock products
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

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
                onClick={() => setViewMode('client_portal')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#d4af37]/20 to-[#aa8421]/20 border border-[#d4af37]/50 text-[#fde047] hover:bg-[#d4af37]/30 transition-all shadow-sm"
                title="Abrir portal web para que las clientas soliciten turnos online"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="hidden sm:inline">Portal Clientes</span>
                <span className="sm:hidden">Turnos</span>
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
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[#a1a1aa] hover:text-[#d4af37] border border-transparent hover:border-[#27272a] transition-all"
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
                    <div className="text-xs font-semibold text-[#f4f4f5] leading-tight flex items-center gap-1">
                      {currentUser.name}
                      {currentUser.role === 'admin' && (
                        <ShieldCheck className="w-3 h-3 text-[#d4af37]" />
                      )}
                    </div>
                    <div className="text-[10px] text-[#a1a1aa] leading-tight">
                      {getRoleLabel(currentUser.role)}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121216] border border-[#27272a] shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#27272a]">
                      <p className="text-xs text-[#71717a]">Conectado como:</p>
                      <p className="text-sm font-semibold text-[#d4af37]">{currentUser.name}</p>
                      <p className="text-xs text-[#a1a1aa]">{currentUser.specialty}</p>
                      <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Sesión Verificada
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowAuthModal(true);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-[#e4e4e7] hover:bg-[#1a1a20] flex items-center gap-2 hover:text-[#d4af37] transition-colors"
                      >
                        <UserCircle className="w-4 h-4 text-[#d4af37]" />
                        <span>Cambiar de Usuario</span>
                      </button>

                      {(currentUser.role === 'admin' || currentUser.isAdminEnabled || currentUser.allowedPanels?.includes('admin')) && (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setActiveTab('admin');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-[#d4af37] hover:bg-[#1a1a20] flex items-center gap-2 transition-colors font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                          <span>Panel Administrador</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-[#222228]" />

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

      {/* User Login/Switch Modal */}
      {showAuthModal && (
        <UserAuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};
