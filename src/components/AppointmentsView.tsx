import React, { useState, useMemo } from 'react';
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
  Hash,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Layers,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Appointment, AppointmentStatus, User as StaffUser } from '../types';
import { formatCurrency } from '../utils/currency';
import { 
  STANDARD_HOURLY_SLOTS, 
  timeToMinutes, 
  minutesToTime, 
  checkScheduleConflict,
  getSlotsAvailability 
} from '../utils/schedule';
import { NewAppointmentModal } from './NewAppointmentModal';

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
  
  // Navigation & view states
  const [activeViewMode, setActiveViewMode] = useState<'agenda' | 'list' | 'month'>('agenda');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Internal modal for booking directly from specific slot
  const [showInternalBookingModal, setShowInternalBookingModal] = useState(false);
  const [slotPrefill, setSlotPrefill] = useState<{
    date: string;
    time: string;
    specialistId?: string;
  }>({
    date: todayStr,
    time: '10:00'
  });

  // Month navigation for monthly view
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Active specialists (filter active)
  const activeSpecialists = useMemo(() => {
    return staffList.filter(s => s.active);
  }, [staffList]);

  // Helper to resolve client code for an appointment
  const getAppointmentClientCode = (apt: Appointment): string => {
    if (apt.clientCode) return apt.clientCode;

    if (apt.notes) {
      const match = apt.notes.match(/JBL-\d+/i);
      if (match) return match[0].toUpperCase();
    }

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

  // Filtered appointments for list view
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (selectedDate !== 'all' && apt.date !== selectedDate) {
        return false;
      }
      if (selectedSpecialist !== 'all' && apt.specialistId !== selectedSpecialist) {
        return false;
      }
      if (selectedStatus !== 'all' && apt.status !== selectedStatus) {
        return false;
      }
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
  }, [appointments, selectedDate, selectedSpecialist, selectedStatus, searchQuery, clients]);

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
        return { label: 'Agendada', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'confirmed':
        return { label: 'Confirmada', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'in_progress':
        return { label: 'En Cabina', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' };
      case 'completed':
        return { label: 'Completada', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'paid':
        return { label: 'Cobrada / Pagada', color: 'bg-zinc-800 text-[#d4af37] border-[#d4af37]/40' };
      case 'cancelled':
        return { label: 'Cancelada', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      default:
        return { label: status, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  // Day metrics for current selectedDate
  const effectiveDate = selectedDate === 'all' ? todayStr : selectedDate;
  const dayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === effectiveDate && a.status !== 'cancelled');
  }, [appointments, effectiveDate]);

  const dayExpectedRevenue = useMemo(() => {
    return dayAppointments.reduce((acc, a) => acc + a.servicePrice, 0);
  }, [dayAppointments]);

  // Check how many slots are occupied for effectiveDate
  const allDaySlots = useMemo(() => {
    return getSlotsAvailability(appointments, effectiveDate, selectedSpecialist);
  }, [appointments, effectiveDate, selectedSpecialist]);

  const dayOccupiedCount = dayAppointments.length;
  const dayFreeSlotsCount = Math.max(0, STANDARD_HOURLY_SLOTS.length - dayAppointments.length);

  // Quick Date Navigator
  const shiftDate = (days: number) => {
    const base = new Date(effectiveDate + 'T12:00:00');
    base.setDate(base.getDate() + days);
    const newStr = base.toISOString().split('T')[0];
    setSelectedDate(newStr);
  };

  // Format date readable in Spanish
  const formatReadableDate = (dateStr: string): string => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Open internal booking modal prefilling slot
  const handleOpenSlotBooking = (slotTime: string, specialistId?: string) => {
    setSlotPrefill({
      date: effectiveDate,
      time: slotTime,
      specialistId: specialistId || (selectedSpecialist !== 'all' ? selectedSpecialist : undefined)
    });
    setShowInternalBookingModal(true);
  };

  // Monthly calendar calculations
  const monthData = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0
    const totalDays = lastDay.getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: prevDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const curDate = new Date(year, month, d);
      days.push({
        dateStr: curDate.toISOString().split('T')[0],
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Next month padding to reach multiple of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateStr: nextDate.toISOString().split('T')[0],
        dayNum: i,
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentMonthDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & View Switcher */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide flex items-center gap-2.5">
                  <span>Panel de Agenda & Turnos</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#fde047] font-sans font-semibold border border-[#d4af37]/30">
                    Control Anti-Solapamientos
                  </span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualización de horarios libres y ocupados en tiempo real. Protección automática para que ningún turno se sobreponga.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons & View Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#181820] p-1 rounded-xl border border-[#272732] flex items-center gap-1">
              <button
                onClick={() => setActiveViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeViewMode === 'agenda'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Panel Agenda Horaria</span>
              </button>

              <button
                onClick={() => setActiveViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeViewMode === 'list'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista de Citas ({appointments.length})</span>
              </button>

              <button
                onClick={() => setActiveViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeViewMode === 'month'
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Mes</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSlotPrefill({
                  date: effectiveDate,
                  time: '10:00',
                  specialistId: selectedSpecialist !== 'all' ? selectedSpecialist : undefined
                });
                setShowInternalBookingModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] hover:brightness-110 text-black font-bold text-xs rounded-xl shadow-lg shadow-[#d4af37]/20 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Agendar Nuevo Turno</span>
            </button>
          </div>
        </div>

        {/* Date Navigation & Summary Strip */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-[#252530]">
          {/* Day Stepper */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => shiftDate(-1)}
              title="Día Anterior"
              className="p-1.5 rounded-lg bg-[#181820] text-zinc-300 hover:text-white hover:bg-[#20202c] border border-[#2a2a38] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDate === todayStr
                  ? 'bg-[#d4af37]/20 border border-[#d4af37] text-[#fde047] font-bold'
                  : 'bg-[#181820] text-zinc-400 hover:text-white border border-[#2a2a38]'
              }`}
            >
              Hoy
            </button>

            <button
              onClick={() => {
                const tom = new Date();
                tom.setDate(tom.getDate() + 1);
                setSelectedDate(tom.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-[#181820] text-zinc-400 hover:text-white border border-[#2a2a38] transition-all"
            >
              Mañana
            </button>

            <button
              onClick={() => shiftDate(1)}
              title="Día Siguiente"
              className="p-1.5 rounded-lg bg-[#181820] text-zinc-300 hover:text-white hover:bg-[#20202c] border border-[#2a2a38] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Direct date picker */}
            <div className="relative ml-1">
              <input
                type="date"
                value={selectedDate === 'all' ? '' : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value || todayStr)}
                className="px-2.5 py-1 bg-[#181820] border border-[#2a2a38] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37] font-mono"
              />
            </div>

            <span className="text-xs font-medium text-zinc-300 capitalize ml-1 hidden sm:inline-block">
              {formatReadableDate(effectiveDate)}
            </span>
          </div>

          {/* Metrics summary */}
          <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{dayFreeSlotsCount} Horarios Libres</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/25 rounded-lg text-rose-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>{dayOccupiedCount} Turnos Ocupados</span>
            </div>

            <div className="px-3 py-1 bg-[#181820] border border-[#2a2a38] rounded-lg text-[#d4af37] font-mono font-bold hidden lg:block">
              Proyectado: {formatCurrency(dayExpectedRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE AGENDA GRID (Horarios & Especialistas) */}
      {activeViewMode === 'agenda' && (
        <div className="space-y-4">
          {/* Filter Bar for Specialists */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111115] border border-[#252530] rounded-xl p-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-300 font-medium">Filtrar Especialista:</span>
              <select
                value={selectedSpecialist}
                onChange={(e) => setSelectedSpecialist(e.target.value)}
                className="px-3 py-1 bg-[#181822] border border-[#2a2a38] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="all">Ver Todas las Especialistas en Columnas</option>
                {activeSpecialists.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500"></span>
                <span>Libre (Clic para dar turno)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500"></span>
                <span>Turno Ocupado</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500/30 border border-purple-500"></span>
                <span>En Cabina / Atendiendo</span>
              </span>
            </div>
          </div>

          {/* Agenda Grid Table */}
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#0c0c0e] border-b border-[#252530] text-xs font-semibold text-zinc-300">
                    <th className="py-3 px-4 w-28 text-center text-[#d4af37] font-mono">
                      Horario
                    </th>
                    {(selectedSpecialist === 'all' ? activeSpecialists : activeSpecialists.filter(s => s.id === selectedSpecialist)).map(spec => (
                      <th key={spec.id} className="py-3 px-4 border-l border-[#202028]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#d4af37] to-[#80641b] text-black font-bold flex items-center justify-center text-xs">
                            {spec.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{spec.name}</div>
                            <div className="text-[10px] text-zinc-400 font-normal">{spec.specialty}</div>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e26] text-xs">
                  {STANDARD_HOURLY_SLOTS.map((slotTime) => {
                    const slotMin = timeToMinutes(slotTime);
                    const specsToRender = selectedSpecialist === 'all' 
                      ? activeSpecialists 
                      : activeSpecialists.filter(s => s.id === selectedSpecialist);

                    return (
                      <tr key={slotTime} className="hover:bg-[#16161c]/50 transition-colors">
                        {/* Time Column */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-zinc-300 bg-[#101014]/80 border-r border-[#22222c]">
                          <div className="flex items-center justify-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span>{slotTime}</span>
                          </div>
                        </td>

                        {/* Specialist Columns */}
                        {specsToRender.map(spec => {
                          // Check if specialist has an appointment covering this slot
                          const occupyingApt = appointments.find(a => {
                            if (a.date !== effectiveDate || a.status === 'cancelled') return false;
                            if (a.specialistId !== spec.id && a.specialistName.toLowerCase() !== spec.name.toLowerCase()) return false;
                            const start = timeToMinutes(a.time);
                            const end = start + (a.durationMin || 30);
                            return slotMin >= start && slotMin < end;
                          });

                          if (occupyingApt) {
                            const badge = getStatusBadge(occupyingApt.status);
                            const isStartingSlot = occupyingApt.time === slotTime;
                            const aptStart = timeToMinutes(occupyingApt.time);
                            const aptEnd = minutesToTime(aptStart + (occupyingApt.durationMin || 30));
                            const clientCode = getAppointmentClientCode(occupyingApt);

                            return (
                              <td 
                                key={spec.id} 
                                className="p-2 border-l border-[#202028] bg-[#1a1720]/40 align-top"
                              >
                                <div className="p-2.5 rounded-xl bg-[#1b1924] border border-[#382f48] shadow-md hover:border-[#d4af37]/60 transition-all space-y-2">
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-white text-xs hover:text-[#d4af37] transition-colors">
                                          {occupyingApt.clientName}
                                        </span>
                                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#d4af37]/15 text-[#fde047] font-mono font-bold">
                                          {clientCode}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-zinc-300 font-medium mt-0.5">
                                        {occupyingApt.serviceName}
                                      </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${badge.color}`}>
                                      {badge.label}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[10.5px] text-zinc-400 pt-1 border-t border-[#2d273a]">
                                    <span className="font-mono text-zinc-300">
                                      {occupyingApt.time} - {aptEnd} ({occupyingApt.durationMin}m)
                                    </span>
                                    <span className="font-mono font-bold text-emerald-400">
                                      {formatCurrency(occupyingApt.servicePrice)}
                                    </span>
                                  </div>

                                  {/* Quick Actions on the Occupied Slot */}
                                  <div className="flex items-center justify-between gap-1 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSendWhatsApp(occupyingApt)}
                                      title="Enviar recordatorio por WhatsApp"
                                      className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>WhatsApp</span>
                                    </button>

                                    {occupyingApt.status !== 'paid' && (
                                      <button
                                        type="button"
                                        onClick={() => handleChargeInCashier(occupyingApt)}
                                        title="Cobrar en Caja Mostrador"
                                        className="px-2 py-1 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#fde047] text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                      >
                                        <Receipt className="w-3 h-3" />
                                        <span>Cobrar</span>
                                      </button>
                                    )}

                                    {/* Status changer dropdown */}
                                    <select
                                      value={occupyingApt.status}
                                      onChange={(e) => updateAppointmentStatus(occupyingApt.id, e.target.value as AppointmentStatus)}
                                      className="text-[9.5px] bg-[#121216] border border-[#2f2b38] rounded-md px-1 py-0.5 text-zinc-300 focus:outline-none focus:border-[#d4af37]"
                                    >
                                      <option value="scheduled">Agendada</option>
                                      <option value="confirmed">Confirmada</option>
                                      <option value="in_progress">En Cabina</option>
                                      <option value="completed">Completada</option>
                                      <option value="cancelled">Cancelar</option>
                                    </select>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          // Slot is FREE
                          return (
                            <td 
                              key={spec.id} 
                              className="p-2 border-l border-[#202028] align-middle"
                            >
                              <div className="group h-full min-h-[58px] p-2 rounded-xl border border-dashed border-[#272733] hover:border-emerald-500/60 hover:bg-emerald-950/15 transition-all flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-emerald-400 transition-colors">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400"></span>
                                  <span className="text-[11px] font-medium">Disponible</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleOpenSlotBooking(slotTime, spec.id)}
                                  className="opacity-80 group-hover:opacity-100 px-2.5 py-1 bg-[#1c1c24] group-hover:bg-gradient-to-r group-hover:from-[#d4af37] group-hover:to-[#aa8421] text-zinc-300 group-hover:text-black border border-[#2d2d3a] group-hover:border-[#d4af37] rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition-all shadow-sm"
                                >
                                  <Plus className="w-3 h-3 stroke-[2.5]" />
                                  <span>+ Dar Turno</span>
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: MONTHLY CALENDAR VIEW */}
      {activeViewMode === 'month' && (
        <div className="space-y-4">
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const prev = new Date(currentMonthDate);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentMonthDate(prev);
                  }}
                  className="p-2 rounded-xl bg-[#181820] text-zinc-300 hover:text-white border border-[#272732]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h3 className="text-base font-bold text-white capitalize font-serif-luxury tracking-wide">
                  {currentMonthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => {
                    const next = new Date(currentMonthDate);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentMonthDate(next);
                  }}
                  className="p-2 rounded-xl bg-[#181820] text-zinc-300 hover:text-white border border-[#272732]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setCurrentMonthDate(new Date());
                  setSelectedDate(todayStr);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181820] border border-[#272732] text-zinc-300 hover:text-white"
              >
                Mes Actual
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-zinc-400 pb-2 border-b border-[#252530]">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                <div key={d} className="py-1 uppercase tracking-wider text-[11px] text-[#d4af37]">
                  {d}
                </div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthData.map((mDay, idx) => {
                const dayApts = appointments.filter(a => a.date === mDay.dateStr && a.status !== 'cancelled');
                const isToday = mDay.dateStr === todayStr;
                const isSelected = mDay.dateStr === effectiveDate;
                const count = dayApts.length;

                return (
                  <div
                    key={`${mDay.dateStr}-${idx}`}
                    onClick={() => {
                      setSelectedDate(mDay.dateStr);
                      setActiveViewMode('agenda');
                    }}
                    className={`min-h-[90px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      !mDay.isCurrentMonth
                        ? 'opacity-30 bg-[#0f0f13] border-transparent'
                        : isSelected
                          ? 'bg-[#d4af37]/15 border-[#d4af37] ring-1 ring-[#d4af37]/60'
                          : isToday
                            ? 'bg-[#181824] border-amber-500/40 hover:border-[#d4af37]'
                            : 'bg-[#14141a] border-[#22222a] hover:border-[#383844]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold ${
                        isToday ? 'w-6 h-6 rounded-full bg-[#d4af37] text-black flex items-center justify-center' : 'text-zinc-200'
                      }`}>
                        {mDay.dayNum}
                      </span>
                      {count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          {count}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 my-1">
                      {count > 0 ? (
                        <div className="text-[10.5px]">
                          <span className="text-zinc-300 font-semibold block truncate">
                            {count} turno{count > 1 ? 's' : ''} ocupado{count > 1 ? 's' : ''}
                          </span>
                          <span className="text-[9.5px] text-emerald-400 font-mono">
                            {STANDARD_HOURLY_SLOTS.length - count} libres
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                          <span>Todo Libre</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1 text-[9px] text-[#d4af37] font-semibold text-right">
                      Ver Agenda &gt;
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: CLASSIC APPOINTMENTS LIST */}
      {activeViewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#101014] border border-[#27272a] rounded-xl p-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, tel, código o servicio..."
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
                {activeSpecialists.map(s => (
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
              <span className="font-bold text-[#d4af37] font-mono">{formatCurrency(dayExpectedRevenue)}</span>
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
                onClick={() => {
                  setSlotPrefill({ date: effectiveDate, time: '10:00' });
                  setShowInternalBookingModal(true);
                }}
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
                const clientCode = getAppointmentClientCode(apt);

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

                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Client & Service Info */}
                      <div className="py-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-base group-hover:text-[#d4af37] transition-colors">
                                {apt.clientName}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/15 text-[#fde047] font-mono font-bold">
                                {clientCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-zinc-500" />
                                {apt.clientPhone}
                              </span>
                              {apt.skinType && (
                                <span className="text-zinc-500">
                                  Piel: <strong className="text-zinc-300">{apt.skinType}</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-emerald-400 font-mono text-sm block">
                              {formatCurrency(apt.servicePrice)}
                            </span>
                            <span className="text-[10px] text-zinc-500">Tarifa del servicio</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#17171e] border border-[#23232c] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Servicio</span>
                            <span className="text-white font-semibold">{apt.serviceName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Especialista</span>
                            <span className="text-[#d4af37] font-semibold">{apt.specialistName}</span>
                          </div>
                        </div>

                        {apt.notes && (
                          <p className="text-[11px] text-zinc-400 italic bg-[#101014] p-2 rounded-lg border border-[#1f1f26]">
                            &ldquo;{apt.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#222228] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSendWhatsApp(apt)}
                          className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        {apt.status !== 'paid' && (
                          <button
                            onClick={() => handleChargeInCashier(apt)}
                            className="px-2.5 py-1.5 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#fde047] border border-[#d4af37]/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Cobrar en Caja</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                            className="px-2.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 rounded-xl text-xs font-medium"
                          >
                            Confirmar
                          </button>
                        )}

                        {apt.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                            className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-xl text-xs font-medium"
                          >
                            Pasar a Cabina
                          </button>
                        )}

                        {apt.status === 'in_progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="px-2.5 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 rounded-xl text-xs font-medium"
                          >
                            Finalizar
                          </button>
                        )}

                        {apt.status !== 'cancelled' && apt.status !== 'paid' && (
                          <button
                            onClick={() => {
                              if (confirm('¿Desea cancelar este turno?')) {
                                updateAppointmentStatus(apt.id, 'cancelled');
                              }
                            }}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Cancelar cita"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Internal New Appointment Modal prefilled directly from slot or date */}
      {showInternalBookingModal && (
        <NewAppointmentModal
          initialDate={slotPrefill.date}
          initialTime={slotPrefill.time}
          initialSpecialistId={slotPrefill.specialistId}
          onClose={() => setShowInternalBookingModal(false)}
        />
      )}
    </div>
  );
};
