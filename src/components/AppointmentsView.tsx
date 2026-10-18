import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Receipt, 
  Trash2, 
  Filter, 
  Search, 
  Check, 
  AlertCircle,
  Plus,
  Hash
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentsViewProps {
  onNewAppointmentClick: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ onNewAppointmentClick }) => {
  const { 
    appointments, 
    clients,
    updateAppointmentStatus, 
    deleteAppointment, 
    staffList, 
    setActiveTab, 
    setCheckoutAppointment,
    currentUser 
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to resolve client code for an appointment
  const getAppointmentClientCode = (apt: Appointment): string => {
    if (apt.clientCode) return apt.clientCode;

    // Check if code was written into appointment notes
    if (apt.notes) {
      const match = apt.notes.match(/JBL-\d+/i);
      if (match) return match[0].toUpperCase();
    }

    // Match with clients database by phone or name
    const cleanAptPhone = apt.clientPhone.replace(/\D/g, '');
    const clientMatch = clients.find(c => {
      const cleanCliPhone = c.phone.replace(/\D/g, '');
      const phoneMatch = cleanAptPhone.length >= 7 && cleanCliPhone.length >= 7 && (cleanCliPhone.includes(cleanAptPhone) || cleanAptPhone.includes(cleanCliPhone));
      const nameMatch = c.name.trim().toLowerCase() === apt.clientName.trim().toLowerCase();
      return phoneMatch || nameMatch;
    });

    if (clientMatch?.clientCode) {
      return clientMatch.clientCode;
    }

    return 'JBL-1001';
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    // If date is set and not 'all'
    if (selectedDate !== 'all' && apt.date !== selectedDate) {
      return false;
    }
    // Specialist filter
    if (selectedSpecialist !== 'all' && apt.specialistId !== selectedSpecialist) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'all' && apt.status !== selectedStatus) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = getAppointmentClientCode(apt).toLowerCase();
      const matchCode = code.includes(q) || (apt.notes && apt.notes.toLowerCase().includes(q));
      const matchClient = apt.clientName.toLowerCase().includes(q);
      const matchPhone = apt.clientPhone.includes(q);
      const matchService = apt.serviceName.toLowerCase().includes(q);
      if (!matchClient && !matchPhone && !matchService && !matchCode) return false;
    }
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Quick WhatsApp message generator
  const handleSendWhatsApp = (apt: Appointment) => {
    const cleanPhone = apt.clientPhone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') 
      ? `593${cleanPhone.substring(1)}` 
      : cleanPhone;

    const message = encodeURIComponent(
      `¡Hola ${apt.clientName}! ✨ Te saludamos de *Jilly Beauty Lab Center*.\n\n` +
      `Te recordamos tu cita de *${apt.serviceName}* agendada para el día *${apt.date}* a las *${apt.time}* con la especialista *${apt.specialistName}*.\n\n` +
      `📍 Dirección & Atención personalizada.\n` +
      `Por favor confírmanos tu asistencia. ¡Te esperamos para resaltar tu belleza!`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleChargeInCashier = (apt: Appointment) => {
    setCheckoutAppointment(apt);
    setActiveTab('cashier');
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Agendada', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'confirmed':
        return { label: 'Confirmada', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'in_progress':
        return { label: 'En Cabina', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse' };
      case 'completed':
        return { label: 'Completada', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'paid':
        return { label: 'Cobrada / Pagada', color: 'bg-zinc-800 text-[#d4af37] border-[#d4af37]/40' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: status, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  // Summary counts for selected day
  const dayAppointments = appointments.filter(a => a.date === selectedDate);
  const dayExpectedRevenue = dayAppointments
    .filter(a => a.status !== 'cancelled')
    .reduce((acc, a) => acc + a.servicePrice, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121216] border border-[#27272a] rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide flex items-center gap-2">
            <span>Agenda & Citas del Spa</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#e5c158] font-sans font-medium">
              {filteredAppointments.length} citas
            </span>
          </h2>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Gestión en tiempo real de cabinas, recordatorios automáticos por WhatsApp y cobro directo en caja.
          </p>
        </div>

        {/* Date Selector Segment */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDate === todayStr
                ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                : 'bg-[#18181d] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            Hoy ({todayStr})
          </button>

          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow.toISOString().split('T')[0]);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18181d] text-zinc-300 hover:text-white border border-[#27272a] transition-all"
          >
            Mañana
          </button>

          <button
            onClick={() => setSelectedDate('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedDate === 'all'
                ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                : 'bg-[#18181d] text-zinc-300 hover:text-white border border-[#27272a]'
            }`}
          >
            Ver Todas
          </button>

          {/* Custom Date Input */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate === 'all' ? '' : selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || 'all')}
              className="px-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#101014] border border-[#27272a] rounded-xl p-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, tel o servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        {/* Specialist filter */}
        <div>
          <select
            value={selectedSpecialist}
            onChange={(e) => setSelectedSpecialist(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">Todas las Especialistas</option>
            {staffList.filter(s => s.active).map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.specialty})
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">Todos los Estados</option>
            <option value="scheduled">Agendadas</option>
            <option value="confirmed">Confirmadas</option>
            <option value="in_progress">En Cabina</option>
            <option value="completed">Completadas</option>
            <option value="paid">Cobradas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>

        {/* Quick Day Revenue Estimate */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#16161c] border border-[#27272a] rounded-lg text-xs">
          <span className="text-zinc-400">Total Proyectado:</span>
          <span className="font-bold text-[#d4af37]">${dayExpectedRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No hay citas para los filtros seleccionados</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-5">
            Puedes agendar una nueva cita o cambiar la fecha seleccionada para ver otros horarios.
          </p>
          <button
            onClick={onNewAppointmentClick}
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold rounded-xl text-xs hover:brightness-110 shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Agendar Nueva Cita
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAppointments.map((apt) => {
            const badge = getStatusBadge(apt.status);
            const specialistUser = staffList.find(
              s => s.id === apt.specialistId || s.name.toLowerCase() === apt.specialistName.toLowerCase()
            );

            return (
              <div
                key={apt.id}
                className="bg-[#131317] border border-[#27272a] hover:border-[#d4af37]/40 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top line: Time & Status Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#222228]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1c1c24] border border-[#2d2d38] text-white font-mono text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>{apt.time}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        ({apt.durationMin} min) · {apt.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Main Content: Client & Service */}
                  <div className="py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Client Code Badge right beside client name */}
                          <span 
                            className="font-mono text-[#fde047] font-bold text-[11px] bg-[#d4af37]/20 border border-[#d4af37]/50 px-2 py-0.5 rounded-md shrink-0 shadow-sm flex items-center gap-1"
                            title={`Código de Clienta: ${getAppointmentClientCode(apt)}`}
                          >
                            <Hash className="w-3 h-3 text-[#d4af37]" />
                            <span>{getAppointmentClientCode(apt)}</span>
                          </span>

                          <h4 className="text-sm font-bold text-white group-hover:text-[#d4af37] transition-colors">
                            {apt.clientName}
                          </h4>

                          {apt.skinType && (
                            <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                              Piel {apt.skinType}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="font-mono">{apt.clientPhone}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-white font-mono">
                          Gs. {apt.servicePrice.toLocaleString('es-PY')}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          Tarifa Base
                        </div>
                      </div>
                    </div>

                    {/* Service info banner with specialist avatar */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#191920] border border-[#272732] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0" />
                        <span className="text-zinc-200 font-medium text-xs">{apt.serviceName}</span>
                      </div>

                      <div className="flex items-center gap-2 bg-[#121216] border border-[#282834] px-2.5 py-1 rounded-full shrink-0">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-[#d4af37]/60 shrink-0 bg-[#22222a]">
                          {specialistUser?.avatar ? (
                            <img src={specialistUser.avatar} alt={apt.specialistName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-1 text-[#d4af37]" />
                          )}
                        </div>
                        <div className="text-[11px]">
                          <span className="text-zinc-400">Especialista: </span>
                          <span className="text-zinc-200 font-medium">{apt.specialistName}</span>
                        </div>
                      </div>
                    </div>

                    {apt.notes && (
                      <p className="mt-2 text-[11px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 italic">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-3 border-t border-[#222228] flex flex-wrap items-center justify-between gap-2">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">Estado:</span>
                    <select
                      value={apt.status}
                      onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                      className="px-2 py-1 bg-[#1a1a22] border border-[#2d2d38] rounded-md text-[11px] text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="scheduled">Agendada</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="in_progress">En Cabina</option>
                      <option value="completed">Completada</option>
                      <option value="paid">Cobrada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp Reminder Button */}
                    <button
                      onClick={() => handleSendWhatsApp(apt)}
                      title="Enviar recordatorio automático por WhatsApp al cliente"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    {/* Charge in Cashier POS button */}
                    {apt.status !== 'paid' && apt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleChargeInCashier(apt)}
                        title="Enviar directamente a la caja para cobrar"
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black hover:brightness-110 shadow-sm transition-all"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Cobrar</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la cita de ${apt.clientName}?`)) {
                          deleteAppointment(apt.id);
                        }
                      }}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar cita"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
