import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Heart, 
  Instagram, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  ArrowRight,
  ExternalLink,
  Lock,
  Star,
  Check,
  Hash,
  Copy,
  FileText,
  AlertCircle,
  Stethoscope,
  CalendarDays,
  ShieldAlert
} from 'lucide-react';
import { Service, User as SpecialistUser, Client } from '../types';

export const ClientBookingPortal: React.FC = () => {
  const { 
    services, 
    staffList, 
    addAppointment, 
    appointments, 
    setViewMode,
    clients,
    addOrUpdateClient,
    isStandalonePortal,
    login
  } = useApp();

  // Active view: 'book' or 'my_history'
  const [activePortalTab, setActivePortalTab] = useState<'book' | 'my_history'>('book');

  // Booking Flow Steps (1: Service, 2: Specialist, 3: DateTime, 4: Client Info, 5: Confirmation)
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('any');
  
  // Date & Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  // Client Info & Preloading with Client Code
  const [inputClientCode, setInputClientCode] = useState('');
  const [clientLookupSuccess, setClientLookupSuccess] = useState('');
  const [clientLookupError, setClientLookupError] = useState('');
  const [matchedClientCode, setMatchedClientCode] = useState('');

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [skinType, setSkinType] = useState('Normal');
  const [notes, setNotes] = useState('');

  // Service filter inside portal
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [serviceSearch, setServiceSearch] = useState('');

  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<{
    code: string;
    clientCode: string;
    serviceName: string;
    specialistName: string;
    date: string;
    time: string;
    price: number;
    clientName: string;
    clientPhone: string;
  } | null>(null);

  // Lookup state for "My Appointments & Treatments"
  const [lookupQuery, setLookupQuery] = useState('');
  const [matchedClientForHistory, setMatchedClientForHistory] = useState<Client | null>(null);
  const [lookupHistorySearched, setLookupHistorySearched] = useState(false);
  const [copiedCodeNotice, setCopiedCodeNotice] = useState(false);

  // Staff unlock modal in standalone mode
  const [showStaffUnlockModal, setShowStaffUnlockModal] = useState(false);
  const [staffUsername, setStaffUsername] = useState('jilly.admin');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffUnlockError, setStaffUnlockError] = useState('');

  const availableTimeSlots = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  const serviceCategories = [
    { id: 'all', label: 'Todos los Tratamientos' },
    { id: 'facial', label: 'Rejuvenecimiento & Faciales' },
    { id: 'peeling', label: 'Despigmentantes & Hollywood Peel' },
    { id: 'laser', label: 'Láser & Eliminación Tatuajes' },
    { id: 'micropigmentation', label: 'Micropigmentación & Labios' },
    { id: 'body', label: 'Masajes Reductores' },
    { id: 'nails', label: 'Manicura & Pedicura' },
  ];

  const filteredServices = services.filter((srv) => {
    if (!srv.active) return false;
    if (serviceCategoryFilter !== 'all' && srv.category !== serviceCategoryFilter) return false;
    if (serviceSearch.trim()) {
      const q = serviceSearch.toLowerCase();
      return srv.name.toLowerCase().includes(q) || srv.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectService = (srv: Service) => {
    setSelectedService(srv);
    setStep(2);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleSelectSpecialist = (specId: string) => {
    setSelectedSpecialistId(specId);
    setStep(3);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleSelectDateTime = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(4);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleLookupClientCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setClientLookupError('');
    setClientLookupSuccess('');

    const query = inputClientCode.trim().toUpperCase();
    if (!query) {
      setClientLookupError('Ingresa tu código de clienta (ej. JBL-1001 ó 1001) o tu número de WhatsApp.');
      return;
    }

    const cleanDigits = query.replace(/\D/g, '');
    const match = clients.find(c => {
      const matchCode = c.clientCode && (
        c.clientCode.toUpperCase() === query ||
        c.clientCode.toUpperCase() === `JBL-${query}` ||
        (cleanDigits.length >= 2 && c.clientCode.includes(cleanDigits))
      );
      const matchPhone = cleanDigits.length >= 7 && c.phone.replace(/\D/g, '').includes(cleanDigits);
      return matchCode || matchPhone;
    });

    if (match) {
      setClientName(match.name);
      setClientPhone(match.phone);
      if (match.email) setClientEmail(match.email);
      if (match.skinType) setSkinType(match.skinType);
      if (match.notes) setNotes(match.notes);
      setMatchedClientCode(match.clientCode);
      setClientLookupSuccess(`¡Hola, ${match.name}! Tus datos fueron precargados con éxito (Código: ${match.clientCode}).`);
    } else {
      setClientLookupError('No encontramos una ficha con ese código o número. Puedes completar tus datos abajo para registrarte y se te asignará un código nuevo.');
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService) {
      alert('Por favor selecciona un tratamiento.');
      setStep(1);
      return;
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor ingresa tu nombre completo y teléfono de contacto.');
      return;
    }

    // Determine assigned specialist
    let assignedSpecialist: SpecialistUser | undefined;
    if (selectedSpecialistId === 'any') {
      assignedSpecialist = staffList.find(s => s.role === 'specialist' && s.active) || staffList[0];
    } else {
      assignedSpecialist = staffList.find(s => s.id === selectedSpecialistId);
    }

    const bookingCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    // Register or retrieve client with unique clientCode
    const savedClient = addOrUpdateClient({
      clientCode: matchedClientCode || undefined,
      name: clientName.trim(),
      phone: clientPhone.trim(),
      email: clientEmail.trim() || undefined,
      skinType: skinType as any,
      notes: notes.trim()
    });

    const finalClientCode = savedClient.clientCode || matchedClientCode || 'JBL-1001';

    addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      specialistId: assignedSpecialist?.id || staffList[0].id,
      specialistName: assignedSpecialist?.name || 'Directora Jilly',
      date: selectedDate,
      time: selectedTime,
      durationMin: selectedService.durationMin,
      status: 'confirmed',
      notes: `Reserva Online Web [Reserva: ${bookingCode} | Código: ${finalClientCode}] - ${notes.trim()}`,
      skinType,
      createdBy: 'Portal Web Clientes'
    });

    setConfirmedBooking({
      code: bookingCode,
      clientCode: finalClientCode,
      serviceName: selectedService.name,
      specialistName: assignedSpecialist?.name || 'Directora Jilly',
      date: selectedDate,
      time: selectedTime,
      price: selectedService.price,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim()
    });

    setStep(5);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleSendWhatsAppConfirmation = () => {
    if (!confirmedBooking) return;
    const phoneSpa = '593986704085'; // Official WhatsApp: 0986 704 085
    const message = encodeURIComponent(
      `¡Hola Jilly Beauty Lab Center! ✨ Acabo de solicitar mi turno online desde la web:\n\n` +
      `📋 *Código de Reserva:* ${confirmedBooking.code}\n` +
      `💳 *Código de Clienta:* ${confirmedBooking.clientCode}\n` +
      `👤 *Cliente:* ${confirmedBooking.clientName}\n` +
      `💅 *Tratamiento:* ${confirmedBooking.serviceName}\n` +
      `📅 *Fecha:* ${confirmedBooking.date}\n` +
      `⏰ *Hora:* ${confirmedBooking.time}\n` +
      `👩‍⚕️ *Especialista:* ${confirmedBooking.specialistName}\n` +
      `💵 *Tarifa:* $${confirmedBooking.price.toFixed(2)}\n\n` +
      `Por favor confírmenme el turno. ¡Muchas gracias!`
    );

    window.open(`https://wa.me/${phoneSpa}?text=${message}`, '_blank');
  };

  // Search client history & treatments
  const handleSearchHistory = (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupQuery.trim().toUpperCase();
    if (!query) return;

    setLookupHistorySearched(true);
    const cleanDigits = query.replace(/\D/g, '');

    const foundClient = clients.find(c => {
      const matchCode = c.clientCode && (
        c.clientCode.toUpperCase() === query ||
        c.clientCode.toUpperCase() === `JBL-${query}` ||
        (cleanDigits.length >= 2 && c.clientCode.includes(cleanDigits))
      );
      const matchPhone = cleanDigits.length >= 7 && c.phone.replace(/\D/g, '').includes(cleanDigits);
      const matchName = c.name.toUpperCase().includes(query);
      return matchCode || matchPhone || matchName;
    });

    setMatchedClientForHistory(foundClient || null);
  };

  const handleStaffUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffUnlockError('');
    const success = login(staffUsername, staffPassword);
    if (success) {
      setShowStaffUnlockModal(false);
      setViewMode('admin');
    } else {
      setStaffUnlockError('Usuario o contraseña de colaboradora incorrecto.');
    }
  };

  // Upcoming / past appointments for matched client
  const clientAppointmentsForHistory = React.useMemo(() => {
    if (!matchedClientForHistory) return [];
    const cleanPhone = matchedClientForHistory.phone.replace(/[^0-9]/g, '');
    const clientCode = matchedClientForHistory.clientCode?.toUpperCase();
    return appointments.filter(a => {
      const matchPhone = cleanPhone && a.clientPhone.replace(/[^0-9]/g, '') === cleanPhone;
      const matchCode = clientCode && a.notes?.toUpperCase().includes(clientCode);
      return matchPhone || matchCode;
    });
  }, [matchedClientForHistory, appointments]);

  return (
    <div className="min-h-screen bg-[#070709] text-[#f4f4f5] flex flex-col selection:bg-[#d4af37]/30 selection:text-[#fde047]">
      {/* Top Client Bar */}
      <div className="bg-[#0f0f13] border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#d4af37] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal de Clientes · Jilly Beauty Lab</span>
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="hidden sm:inline text-zinc-400">
              Turnos Online & Ficha Personal de Tratamientos
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/593986704085"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>0986 704 085</span>
            </a>

            {/* Protected Staff Switcher: asks for credentials so clients can never open admin panel */}
            <button
              onClick={() => setShowStaffUnlockModal(true)}
              className="px-2.5 py-1 bg-[#1a1a22] hover:bg-[#252530] text-zinc-400 hover:text-[#d4af37] border border-[#27272a] rounded-lg font-medium transition-all flex items-center gap-1 text-[11px]"
              title="Acceso restringido para el personal del spa"
            >
              <Lock className="w-3 h-3 text-zinc-500" />
              <span className="hidden sm:inline">Acceso Personal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#141418] via-[#0d0d10] to-[#070709] border-b border-[#27272a] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Center Logo */}
            <div className="flex justify-center mb-4">
              <Logo size="lg" showSubtitle={false} className="drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#fde047] text-xs font-semibold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Tu belleza, en manos expertas</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-serif-luxury tracking-tight leading-tight px-2">
              Portal de Clientes <span className="text-gold-gradient block sm:inline mt-1 sm:mt-0 drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">Jilly Beauty Lab</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed max-w-2xl mx-auto">
              Agenda tu cita online al instante o consulta tu historial de tratamientos realizados y recomendaciones estéticas usando tu <strong>Código de Clienta</strong>.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-5 pt-3 border-t border-[#27272a]/80 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-[#d4af37]" />
                Tecnología Médica Avanzada
              </span>
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-[#d4af37]" />
                Ficha Personalizada con Código
              </span>
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-[#d4af37]" />
                Atención Exclusiva en Cabina
              </span>
            </div>

            {/* View switcher: Book vs My Treatments & Appointments */}
            <div className="flex justify-center gap-2.5 mt-7">
              <button
                onClick={() => { setActivePortalTab('book'); setStep(1); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activePortalTab === 'book'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black shadow-lg shadow-[#d4af37]/25 scale-105'
                    : 'bg-[#18181f] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar Nuevo Turno Online</span>
              </button>

              <button
                onClick={() => setActivePortalTab('my_history')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activePortalTab === 'my_history'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black shadow-lg shadow-[#d4af37]/25 scale-105'
                    : 'bg-[#18181f] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Consultar Mi Ficha & Tratamientos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Main Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activePortalTab === 'my_history' ? (
          /* Client Treatments & Appointments Lookup View */
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white font-serif-luxury text-center mb-2">
                Consulta tu Ficha de Tratamientos & Turnos
              </h2>
              <p className="text-xs text-zinc-400 text-center mb-6 max-w-md mx-auto">
                Ingresa tu <strong>Código de Clienta</strong> (ej. JBL-1001 ó 1001) o tu número de WhatsApp para ver tu historial de sesiones realizadas y próximas citas.
              </p>

              <form onSubmit={handleSearchHistory} className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Hash className="w-4 h-4 text-[#d4af37] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ej. JBL-1001 ó 0986704085"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-xl hover:brightness-110 flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Consultar</span>
                </button>
              </form>
            </div>

            {/* Results Display */}
            {lookupHistorySearched && (
              <div>
                {!matchedClientForHistory ? (
                  <div className="p-6 bg-[#121216] border border-[#27272a] rounded-2xl text-center text-xs text-zinc-400">
                    <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-white mb-1">
                      No encontramos un expediente con ese código o número
                    </p>
                    <p className="text-zinc-500 max-w-md mx-auto mb-4">
                      Verifica que el código coincida con tu voucher (ej. JBL-1001) o puedes reservar tu primer turno para registrarte automáticamente.
                    </p>
                    <button
                      onClick={() => { setActivePortalTab('book'); setStep(1); }}
                      className="px-4 py-2 bg-[#d4af37] text-black font-bold rounded-xl text-xs hover:brightness-110"
                    >
                      Reservar Mi Primer Turno
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Client Profile Header Card */}
                    <div className="bg-[#121216] border border-[#d4af37]/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1f1f28] to-[#2c2c38] border-2 border-[#d4af37] flex items-center justify-center text-base font-bold text-[#e5c158]">
                            {matchedClientForHistory.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-white font-serif-luxury">
                                {matchedClientForHistory.name}
                              </h3>
                              <span className="font-mono font-bold text-xs bg-black/60 px-2.5 py-0.5 rounded border border-[#d4af37]/60 text-[#fde047]">
                                {matchedClientForHistory.clientCode}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              Tipo de Piel: <strong className="text-sky-300">{matchedClientForHistory.skinType || 'Mixta'}</strong> · {matchedClientForHistory.totalVisits || 1} visitas realizadas
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setClientName(matchedClientForHistory.name);
                            setClientPhone(matchedClientForHistory.phone);
                            if (matchedClientForHistory.email) setClientEmail(matchedClientForHistory.email);
                            if (matchedClientForHistory.skinType) setSkinType(matchedClientForHistory.skinType);
                            setMatchedClientCode(matchedClientForHistory.clientCode);
                            setActivePortalTab('book');
                            setStep(1);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Agendar Nueva Cita</span>
                        </button>
                      </div>

                      {matchedClientForHistory.notes && (
                        <div className="mt-4 p-3 bg-[#181820] border border-[#27272a] rounded-xl text-xs text-zinc-300">
                          <strong className="text-[#d4af37]">Diagnóstico & Recomendación de la Directora:</strong>
                          <p className="mt-1 text-zinc-400">{matchedClientForHistory.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Tratamientos Realizados en el Spa */}
                    <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Stethoscope className="w-4 h-4 text-purple-400" />
                          <span>Tratamientos Realizados en Cabina ({matchedClientForHistory.treatmentRecords?.length || 0})</span>
                        </h4>
                      </div>

                      {(!matchedClientForHistory.treatmentRecords || matchedClientForHistory.treatmentRecords.length === 0) ? (
                        <p className="text-xs text-zinc-500 italic py-2">
                          No tienes tratamientos registrados aún en tu ficha clínica.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {matchedClientForHistory.treatmentRecords.map(tr => (
                            <div key={tr.id} className="p-3.5 bg-[#171720] border border-[#27272a] rounded-xl space-y-1.5 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-white text-sm">{tr.serviceName}</span>
                                  <div className="text-[11px] text-zinc-400 mt-0.5">
                                    📅 {tr.date} · Especialista: <span className="text-[#d4af37]">{tr.specialistName}</span>
                                  </div>
                                </div>
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full capitalize">
                                  {tr.status === 'completed' ? 'Completado' : tr.status}
                                </span>
                              </div>

                              {tr.productsUsed && (
                                <div className="text-[11px] text-purple-300 bg-purple-950/20 p-2 rounded-lg border border-purple-500/20">
                                  <strong>Fórmula / Protocolo aplicado:</strong> {tr.productsUsed}
                                </div>
                              )}

                              {tr.notes && (
                                <div className="text-[11px] text-zinc-300 bg-[#121216] p-2 rounded-lg border border-[#252530]">
                                  <strong>Observación de la especialista:</strong> {tr.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Próximas Citas y Turnos */}
                    <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <CalendarDays className="w-4 h-4 text-[#d4af37]" />
                          <span>Tus Citas en Agenda ({clientAppointmentsForHistory.length})</span>
                        </h4>
                      </div>

                      {clientAppointmentsForHistory.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic py-2">
                          No tienes turnos pendientes en la agenda. Puedes agendar uno ahora.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {clientAppointmentsForHistory.map(apt => (
                            <div key={apt.id} className="p-3 bg-[#18181d] border border-[#27272a] rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-white text-sm">{apt.serviceName}</span>
                                <div className="text-[11px] text-zinc-400 mt-0.5">
                                  📅 {apt.date} a las {apt.time} · Especialista: {apt.specialistName}
                                </div>
                              </div>
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full capitalize">
                                {apt.status === 'confirmed' ? 'Confirmada' : apt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Interactive 5-Step Online Booking System */
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step Progress Indicators */}
            {step < 5 && (
              <div className="flex items-center justify-between relative px-2">
                {[
                  { num: 1, label: 'Tratamiento' },
                  { num: 2, label: 'Especialista' },
                  { num: 3, label: 'Fecha y Hora' },
                  { num: 4, label: 'Tus Datos' },
                ].map((s, idx) => {
                  const isDone = step > s.num;
                  const isCurrent = step === s.num;

                  return (
                    <div key={idx} className="flex flex-col items-center z-10">
                      <div
                        onClick={() => { if (step > s.num) setStep(s.num); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-black cursor-pointer'
                            : isCurrent
                            ? 'bg-[#d4af37] text-black ring-4 ring-[#d4af37]/20 scale-110 shadow-lg'
                            : 'bg-[#18181d] text-zinc-500 border border-[#27272a]'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                      </div>
                      <span className={`text-[11px] font-medium mt-1.5 hidden sm:block ${
                        isCurrent ? 'text-[#d4af37]' : isDone ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide">
                    Paso 1: Elige el Tratamiento que Deseas Realizarte
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Selecciona uno de los protocolos de vanguardia de Jilly Beauty Lab Center:
                  </p>
                </div>

                {/* Categories & Search */}
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {serviceCategories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setServiceCategoryFilter(c.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                          serviceCategoryFilter === c.id
                            ? 'bg-[#d4af37] text-black shadow-sm'
                            : 'bg-[#18181d] text-zinc-400 hover:text-white border border-[#27272a]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por tratamiento o palabras clave..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Services Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((srv) => {
                    const isSelected = selectedService?.id === srv.id;

                    return (
                      <div
                        key={srv.id}
                        onClick={() => handleSelectService(srv)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-lg shadow-[#d4af37]/10'
                            : 'bg-[#16161a] border-[#27272a] hover:border-[#d4af37]/60 hover:bg-[#1a1a20]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
                              {srv.categoryLabel}
                            </span>
                            <span className="text-sm font-mono font-bold text-white group-hover:text-[#d4af37]">
                              ${srv.price.toFixed(2)}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white mt-2 group-hover:text-amber-200 transition-colors">
                            {srv.name}
                          </h3>

                          <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-800 text-xs">
                          <span className="text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                            {srv.durationMin} min
                          </span>

                          <span className="text-[#d4af37] font-semibold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            <span>Seleccionar</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Select Specialist */}
            {step === 2 && (
              <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide">
                      Paso 2: Selecciona la Especialista
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Tratamiento seleccionado: <strong className="text-[#d4af37]">{selectedService?.name}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Cambiar tratamiento
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Any Specialist Option */}
                  <div
                    onClick={() => handleSelectSpecialist('any')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedSpecialistId === 'any'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-md'
                        : 'bg-[#16161a] border-[#27272a] hover:border-[#d4af37]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Cualquier Especialista Disponible</h4>
                        <p className="text-xs text-zinc-400">Recomendado para obtener el turno más pronto</p>
                      </div>
                    </div>
                  </div>

                  {/* Individual Staff Members */}
                  {staffList.filter(st => st.active && st.role !== 'cashier').map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleSelectSpecialist(st.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedSpecialistId === st.id
                          ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-md'
                          : 'bg-[#16161a] border-[#27272a] hover:border-[#d4af37]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-[#d4af37]/40 bg-[#27272a] shrink-0">
                          {st.avatar ? (
                            <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-full h-full p-2.5 text-[#d4af37]" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{st.name}</h4>
                          <p className="text-xs text-zinc-400">{st.specialty}</p>
                          <span className="text-[10px] text-[#d4af37] font-medium mt-0.5 flex items-center gap-1">
                            ★ Cosmiatra Certificada
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date and Time */}
            {step === 3 && (
              <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide">
                      Paso 3: Elige la Fecha y Hora Deseada
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Selecciona el día y horario que mejor se adapte a tu agenda:
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Date Input */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
                      Fecha del Turno
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#18181d] border border-[#27272a] rounded-xl text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(todayStr)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border ${
                          selectedDate === todayStr ? 'bg-[#d4af37] text-black font-semibold' : 'bg-[#18181d] text-zinc-300 border-[#27272a]'
                        }`}
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const tom = new Date();
                          tom.setDate(tom.getDate() + 1);
                          setSelectedDate(tom.toISOString().split('T')[0]);
                        }}
                        className="flex-1 py-2 rounded-lg text-xs font-medium bg-[#18181d] text-zinc-300 border border-[#27272a] hover:text-white"
                      >
                        Mañana
                      </button>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
                      Horarios Disponibles
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimeSlots.map((slot) => {
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black shadow-md'
                                : 'bg-[#18181d] text-zinc-300 border border-[#27272a] hover:border-[#d4af37]/40 hover:text-white'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#27272a] flex justify-end">
                  <button
                    onClick={() => handleSelectDateTime(selectedDate, selectedTime)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-md flex items-center gap-1.5"
                  >
                    <span>Continuar con mis Datos</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Client Contact Information with Client Code Preloading */}
            {step === 4 && (
              <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide">
                      Paso 4: Ingresa tus Datos de Contacto
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Si ya eres clienta, pon tu código para precargar tus datos automáticamente:
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Atrás
                  </button>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-[#18181d] border border-[#d4af37]/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#d4af37] font-semibold">{selectedService?.name}</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">
                      📅 {selectedDate} a las {selectedTime} · {selectedService?.durationMin} min
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      ${selectedService?.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quick Lookup with Client Code */}
                <div className="p-4 bg-gradient-to-r from-[#171722] to-[#14141c] border border-[#d4af37]/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#fde047] flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-[#d4af37]" />
                      <span>¿Ya visitaste nuestro Spa? Precarga con tu Código:</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingresa tu Código (ej. JBL-1001 ó 1001) o WhatsApp..."
                      value={inputClientCode}
                      onChange={(e) => setInputClientCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleLookupClientCode();
                        }
                      }}
                      className="flex-1 px-3.5 py-2 bg-[#121216] border border-[#27272a] focus:border-[#d4af37] rounded-lg text-xs text-white placeholder-zinc-500 font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLookupClientCode()}
                      className="px-4 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:brightness-110 flex items-center gap-1 shrink-0"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar</span>
                    </button>
                  </div>

                  {clientLookupSuccess && (
                    <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{clientLookupSuccess}</span>
                    </div>
                  )}

                  {clientLookupError && (
                    <div className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{clientLookupError}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Nombre y Apellido Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Carolina Benítez"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 0986704085"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Correo Electrónico (Opcional)
                      </label>
                      <input
                        type="email"
                        placeholder="tu.correo@ejemplo.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Tipo de Piel aproximado
                      </label>
                      <select
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Grasa">Grasa / Con Brillo</option>
                        <option value="Mixta">Mixta (Zona T grasa)</option>
                        <option value="Seca">Seca / Tirante</option>
                        <option value="Sensible">Sensible / Reactiva</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      ¿Tienes alguna alergia o consulta especial para la especialista?
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Primera vez realizándome peeling, alérgica al látex o aspirina..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar y Solicitar Mi Turno Online</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 5: Booking Successfully Confirmed */}
            {step === 5 && confirmedBooking && (
              <div className="bg-[#121216] border border-emerald-500/40 rounded-2xl p-6 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white font-serif-luxury tracking-wide">
                    ¡Tu Turno Ha Sido Registrado con Éxito!
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    Gracias por confiar en <strong className="text-[#d4af37]">Jilly Beauty Lab Center</strong>. Tu cita ya se encuentra reservada en el sistema.
                  </p>
                </div>

                {/* Golden Client Code Highlight Banner */}
                <div className="max-w-md mx-auto p-4 bg-gradient-to-r from-[#d4af37]/20 via-[#aa8421]/20 to-[#d4af37]/15 border-2 border-[#d4af37] rounded-2xl shadow-xl space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#fde047]">
                    <Hash className="w-4 h-4 text-[#d4af37]" />
                    <span>Tu Código Exclusivo de Clienta es:</span>
                  </div>
                  <div className="text-2xl font-mono font-black text-white tracking-widest">
                    {confirmedBooking.clientCode}
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Guarda este número para agendar tus próximas citas en un clic y consultar tus tratamientos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(confirmedBooking.clientCode);
                        setCopiedCodeNotice(true);
                        setTimeout(() => setCopiedCodeNotice(false), 2000);
                      }
                    }}
                    className="mt-1 px-3 py-1 bg-black/60 hover:bg-black text-[#fde047] border border-[#d4af37]/50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCodeNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodeNotice ? '¡Código Copiado!' : 'Copiar Código de Clienta'}</span>
                  </button>
                </div>

                {/* Booking Voucher Card */}
                <div className="max-w-md mx-auto bg-[#18181d] border border-[#27272a] rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#27272a]">
                    <span className="text-zinc-500 font-sans">Código de Reserva:</span>
                    <span className="font-bold text-[#d4af37] text-sm">{confirmedBooking.code}</span>
                  </div>

                  <div className="space-y-1.5 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Cliente:</span>
                      <span className="font-bold text-white font-sans">{confirmedBooking.clientName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Tratamiento:</span>
                      <span className="text-amber-200 font-sans">{confirmedBooking.serviceName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Especialista:</span>
                      <span className="font-sans">{confirmedBooking.specialistName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Fecha y Hora:</span>
                      <span>{confirmedBooking.date} a las {confirmedBooking.time}</span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-white">
                      <span className="font-sans">Tarifa por sesión:</span>
                      <span className="text-[#d4af37]">${confirmedBooking.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Direct Confirmation Button */}
                <div className="max-w-md mx-auto space-y-3">
                  <button
                    onClick={handleSendWhatsAppConfirmation}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirmar por WhatsApp al 0986 704 085</span>
                  </button>

                  <button
                    onClick={() => {
                      setStep(1);
                      setSelectedService(null);
                      setConfirmedBooking(null);
                    }}
                    className="w-full py-2.5 bg-[#18181d] text-zinc-300 hover:text-white rounded-xl text-xs border border-[#27272a]"
                  >
                    Solicitar Otro Turno
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Staff Password Modal (Protects internal spa app from public clients) */}
      {showStaffUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#252530] mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold text-white font-serif-luxury">
                  Acceso Personal del Spa
                </h3>
              </div>
              <button
                onClick={() => setShowStaffUnlockModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Ingresa tus credenciales de colaboradora para abrir el sistema interno de gestión (Citas, Caja, Stock).
            </p>

            <form onSubmit={handleStaffUnlock} className="space-y-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Usuario</label>
                <input
                  type="text"
                  required
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181820] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="Contraseña..."
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181820] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {staffUnlockError && (
                <div className="p-2 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-lg text-xs">
                  {staffUnlockError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffUnlockModal(false)}
                  className="px-3 py-1.5 bg-[#181820] text-zinc-400 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#d4af37] text-black font-bold rounded-lg text-xs hover:brightness-110"
                >
                  Ingresar al Spa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#0c0c0e] py-8 text-xs text-[#a1a1aa] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-serif-luxury italic text-xl font-bold text-gold-gradient">
                Jilly
              </span>
              <span className="font-brand text-xs font-bold tracking-widest text-[#d4af37] uppercase">
                Beauty Lab Center
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Tu belleza, en manos expertas ♡ · WhatsApp 0986 704 085 · @jillybeautylab
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a
              href="https://www.instagram.com/jillybeautylab"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[#d4af37] transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              <span>@jillybeautylab</span>
            </a>
            <a
              href="https://wa.me/593986704085"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[#d4af37] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>0986 704 085</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
