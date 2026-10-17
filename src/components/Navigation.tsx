import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  Receipt, 
  Package, 
  Sparkles, 
  Users, 
  BarChart3,
  ShieldCheck,
  Plus,
  Lock
} from 'lucide-react';
import { canAccessPanel, AppPanel } from '../types';

interface NavigationProps {
  onNewAppointmentClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onNewAppointmentClick }) => {
  const { activeTab, setActiveTab, currentUser, appointments, clients } = useApp();

  // Count today's pending/scheduled appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(
    a => a.date === todayStr && a.status !== 'cancelled' && a.status !== 'paid'
  ).length;

  const navItems = [
    {
      id: 'appointments',
      label: 'Citas & Agenda',
      icon: CalendarDays,
      badge: todayAppointmentsCount > 0 ? `${todayAppointmentsCount} hoy` : undefined,
    },
    {
      id: 'cashier',
      label: 'Caja & Cobros',
      icon: Receipt,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      badge: clients.length > 0 ? `${clients.length}` : undefined,
    },
    {
      id: 'inventory',
      label: 'Stock & Insumos',
      icon: Package,
    },
    {
      id: 'services',
      label: 'Servicios',
      icon: Sparkles,
    },
    {
      id: 'admin',
      label: 'Panel Administrador',
      icon: ShieldCheck,
      adminOnly: true,
      badge: 'Admin',
    },
  ];

  return (
    <div className="hidden sm:block bg-[#0e0e12] border-b border-[#27272a] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 py-2.5 overflow-x-auto">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 shrink-0" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasAccess = canAccessPanel(currentUser, item.id as AppPanel);

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#d4af37]/15 text-[#e5c158] border border-[#d4af37]/40 shadow-sm'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181e] border border-transparent'
                } ${!hasAccess ? 'opacity-65 hover:opacity-90' : ''}`}
                title={!hasAccess ? 'Módulo restringido para este perfil' : item.label}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : (!hasAccess ? 'text-zinc-600' : 'text-[#71717a]')}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-[#d4af37] text-black px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
                {!hasAccess && (
                  <span className="flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-zinc-500 font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5 text-zinc-500" />
                    <span>Bloqueado</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Action: Quick Appointment */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={onNewAppointmentClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs hover:brightness-110 shadow-md shadow-[#d4af37]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nueva Cita</span>
            <span className="sm:hidden">+ Cita</span>
          </button>
        </div>
      </div>
    </div>
  );
};
