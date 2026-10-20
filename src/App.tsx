import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AppointmentsView } from './components/AppointmentsView';
import { POSCashierView } from './components/POSCashierView';
import { InventoryView } from './components/InventoryView';
import { ServicesView } from './components/ServicesView';
import { AdminPanelView } from './components/AdminPanelView';
import { ClientsView } from './components/ClientsView';
import { LoginScreen } from './components/LoginScreen';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { ClientBookingPortal } from './components/ClientBookingPortal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawerMenu } from './components/MobileDrawerMenu';
import { Logo } from './components/Logo';
import { Service, Client, canAccessPanel, AppPanel } from './types';
import { Phone, Instagram, MapPin, Sparkles, Heart, Lock, ShieldAlert } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, viewMode, setViewMode, isLoggedOut, currentUser } = useApp();
  const [showNewAptModal, setShowNewAptModal] = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedClient, setPreselectedClient] = useState<Client | null>(null);

  const handleScheduleService = (srv: Service) => {
    setPreselectedService(srv);
    setPreselectedClient(null);
    setShowNewAptModal(true);
  };

  const handleScheduleClient = (client: Client) => {
    setPreselectedClient(client);
    setPreselectedService(null);
    setShowNewAptModal(true);
  };

  const handleCheckoutClient = (client: Client) => {
    setActiveTab('cashier');
  };

  const getPanelName = (tab: string) => {
    switch (tab) {
      case 'appointments': return 'Agenda & Citas';
      case 'cashier': return 'Caja & Cobros';
      case 'clients': return 'Fichas de Clientes';
      case 'inventory': return 'Stock & Insumos';
      case 'services': return 'Servicios del Spa';
      case 'admin':
      case 'staff':
      case 'reports': return 'Panel Administrador';
      default: return tab;
    }
  };

  // If in client online booking portal mode
  if (viewMode === 'client_portal') {
    return <ClientBookingPortal />;
  }

  // If user clicked Cerrar / Salir (logged out session lock)
  if (isLoggedOut) {
    return <LoginScreen />;
  }

  const currentPanelId = (activeTab === 'staff' || activeTab === 'reports') ? 'admin' : activeTab;
  const isPanelAuthorized = canAccessPanel(currentUser, currentPanelId as AppPanel);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col selection:bg-[#d4af37]/30 selection:text-[#fde047]">
      {/* Sticky Header */}
      <Header />

      {/* Navigation Tabs */}
      <Navigation onNewAppointmentClick={() => setShowNewAptModal(true)} />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 sm:pb-8">
        {!isPanelAuthorized ? (
          <div className="max-w-md mx-auto my-12 bg-[#121216] border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold font-serif-luxury text-white">
              Panel No Habilitado
            </h3>

            <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
              El colaborador <strong className="text-white">{currentUser.name}</strong> no cuenta con autorización para ingresar al panel de <strong className="text-[#d4af37]">{getPanelName(activeTab)}</strong>.
            </p>

            <p className="text-[11px] text-zinc-400 mt-2">
              Un Administrador puede habilitarle el acceso a este módulo desde <strong>Panel Administrador &gt; Personal & Accesos</strong>.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('appointments')}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md transition-all"
              >
                Ir a Agenda & Citas
              </button>

              {(currentUser.role === 'admin' || currentUser.isAdminEnabled) && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#181820] text-zinc-300 hover:text-white border border-[#27272a] text-xs rounded-xl"
                >
                  Abrir Panel Administrador
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'appointments' && (
              <AppointmentsView onNewAppointmentClick={() => setShowNewAptModal(true)} />
            )}

            {activeTab === 'cashier' && (
              <POSCashierView />
            )}

            {activeTab === 'clients' && (
              <ClientsView 
                onScheduleClient={handleScheduleClient} 
                onCheckoutClient={handleCheckoutClient} 
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView />
            )}

            {activeTab === 'services' && (
              <ServicesView onScheduleService={handleScheduleService} />
            )}

            {activeTab === 'admin' && (
              <AdminPanelView />
            )}

            {/* Fallback routing for direct links to staff and reports */}
            {activeTab === 'staff' && (
              <AdminPanelView initialSubTab="staff" />
            )}

            {activeTab === 'reports' && (
              <AdminPanelView initialSubTab="reports" />
            )}
          </>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="mt-auto border-t border-[#27272a] bg-[#0c0c0e] py-8 pb-24 sm:pb-8 text-xs text-[#a1a1aa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start">
              <Logo 
                size="sm" 
                showSubtitle={true} 
                onClick={() => {
                  setActiveTab('appointments');
                  setViewMode('admin');
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />
              <p className="text-[11px] text-zinc-500 mt-2">
                Tu belleza, en manos expertas ♡ · Tecnología · Calidad · Resultados
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
              <button
                onClick={() => setViewMode('client_portal')}
                className="text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Página de Clientes (Turnos Online)</span>
              </button>

              <a
                href="https://wa.me/593986704085"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp: 0986 704 085</span>
              </a>

              <a
                href="https://www.instagram.com/jillybeautylab"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-500" />
                <span>@jillybeautylab</span>
              </a>

              <div className="flex items-center gap-1 text-zinc-500">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Tu mejor versión comienza aquí</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Global New Appointment Modal */}
      {showNewAptModal && (
        <NewAppointmentModal
          initialService={preselectedService}
          initialClient={preselectedClient}
          onClose={() => {
            setShowNewAptModal(false);
            setPreselectedService(null);
            setPreselectedClient(null);
          }}
        />
      )}

      {/* Mobile Bottom Dock Bar */}
      <MobileBottomNav onNewAppointmentClick={() => setShowNewAptModal(true)} />

      {/* Mobile Drawer Menu */}
      <MobileDrawerMenu onNewAppointmentClick={() => setShowNewAptModal(true)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
