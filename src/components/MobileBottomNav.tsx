import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  Receipt, 
  Plus, 
  Sparkles, 
  Menu,
  AlertTriangle
} from 'lucide-react';

interface MobileBottomNavProps {
  onNewAppointmentClick: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onNewAppointmentClick }) => {
  const { 
    activeTab, 
    setActiveTab, 
    appointments, 
    products,
    isMobileMenuOpen, 
    setIsMobileMenuOpen 
  } = useApp();

  // Count today's pending/scheduled appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(
    a => a.date === todayStr && a.status !== 'cancelled' && a.status !== 'paid'
  ).length;

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const tabs = [
    {
      id: 'appointments',
      label: 'Citas',
      icon: CalendarDays,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined,
    },
    {
      id: 'cashier',
      label: 'Caja',
      icon: Receipt,
    },
    {
      id: 'services',
      label: 'Servicios',
      icon: Sparkles,
    },
  ];

  return (
    <aside 
      aria-label="Navegación móvil"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0b0b0e]/95 backdrop-blur-xl border-t border-[#27272a]/90 sm:hidden pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-around px-2 pt-1.5 h-16 max-w-md mx-auto">
        {/* Tab 1: Citas */}
        <button
          onClick={() => {
            setActiveTab('appointments');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
            activeTab === 'appointments' && !isMobileMenuOpen
              ? 'text-[#e5c158]'
              : 'text-[#8e8e99] hover:text-white'
          }`}
        >
          <div className="relative">
            <CalendarDays className={`w-5 h-5 ${activeTab === 'appointments' && !isMobileMenuOpen ? 'text-[#d4af37]' : ''}`} />
            {todayAppointmentsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#d4af37] text-black font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                {todayAppointmentsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Citas</span>
          {activeTab === 'appointments' && !isMobileMenuOpen && (
            <div className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Caja */}
        <button
          onClick={() => {
            setActiveTab('cashier');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'cashier' && !isMobileMenuOpen
              ? 'text-[#e5c158]'
              : 'text-[#8e8e99] hover:text-white'
          }`}
        >
          <Receipt className={`w-5 h-5 ${activeTab === 'cashier' && !isMobileMenuOpen ? 'text-[#d4af37]' : ''}`} />
          <span className="text-[10px] font-medium mt-1">Caja</span>
          {activeTab === 'cashier' && !isMobileMenuOpen && (
            <div className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />
          )}
        </button>

        {/* Center Action: + Nueva Cita */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onNewAppointmentClick}
            aria-label="Nueva Cita"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#aa8421] via-[#d4af37] to-[#fde047] text-black flex items-center justify-center shadow-lg shadow-[#d4af37]/35 border-2 border-[#121216] active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        {/* Tab 4: Servicios */}
        <button
          onClick={() => {
            setActiveTab('services');
            setIsMobileMenuOpen(false);
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'services' && !isMobileMenuOpen
              ? 'text-[#e5c158]'
              : 'text-[#8e8e99] hover:text-white'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'services' && !isMobileMenuOpen ? 'text-[#d4af37]' : ''}`} />
          <span className="text-[10px] font-medium mt-1">Servicios</span>
          {activeTab === 'services' && !isMobileMenuOpen && (
            <div className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />
          )}
        </button>

        {/* Tab 5: Menú / Más */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
            isMobileMenuOpen
              ? 'text-[#e5c158]'
              : 'text-[#8e8e99] hover:text-white'
          }`}
        >
          <div className="relative">
            <Menu className={`w-5 h-5 ${isMobileMenuOpen ? 'text-[#d4af37]' : ''}`} />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full border border-black animate-pulse" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Menú</span>
          {isMobileMenuOpen && (
            <div className="w-1 h-1 rounded-full bg-[#d4af37] mt-0.5" />
          )}
        </button>
      </div>
    </aside>
  );
};
