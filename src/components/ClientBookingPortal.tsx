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
  Check
} from 'lucide-react';
import { Service, User as SpecialistUser } from '../types';

export const ClientBookingPortal: React.FC = () => {
  const { 
    services, 
    staffList, 
    addAppointment, 
    appointments, 
    setViewMode 
  } = useApp();

  // Active view: 'book' or 'my_appointments'
  const [activePortalTab, setActivePortalTab] = useState<'book' | 'my_appointments'>('book');

  // Booking Flow Steps (1: Service, 2: Specialist, 3: DateTime, 4: Client Info, 5: Confirmation)
  const [step, setStep] = useState<number>(1);

  // Form selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string>('any');
  
  // Date & Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  // Client Info
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
    serviceName: string;
    specialistName: string;
    date: string;
    time: string;
    price: number;
    clientName: string;
    clientPhone: string;
  } | null>(null);

  // Lookup state for "My Appointments"
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupResults, setLookupResults] = useState<typeof appointments | null>(null);

  const availableTimeSlots = [
    '09:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'
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

    const bookingCode = `JBL-${Math.floor(1000 + Math.random() * 9000)}`;

    addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      specialistId: assignedSpecialist?.id || staffList[0].id,
      specialistName: assignedSpecialist?.name || 'Jilly Directora',
      date: selectedDate,
      time: selectedTime,
      durationMin: selectedService.durationMin,
      status: 'confirmed',
      notes: `Reserva Online Web [Código: ${bookingCode}] - ${notes.trim()}`,
      skinType,
      createdBy: 'Portal Web Clientes'
    });

    setConfirmedBooking({
      code: bookingCode,
      serviceName: selectedService.name,
      specialistName: assignedSpecialist?.name || 'Jilly Directora',
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
    const phoneSpa = '593986704085'; // Official WhatsApp from Instagram: 0986 704 085
    const message = encodeURIComponent(
      `¡Hola Jilly Beauty Lab Center! ✨ Acabo de solicitar mi turno online desde la web:\n\n` +
      `📋 *Código de Reserva:* ${confirmedBooking.code}\n` +
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

  const handleSearchAppointments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;
    const clean = lookupPhone.replace(/\D/g, '');
    const found = appointments.filter(a => a.clientPhone.replace(/\D/g, '').includes(clean));
    setLookupResults(found);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#f4f4f5] flex flex-col selection:bg-[#d4af37]/30 selection:text-[#fde047]">
      {/* Top Client Bar */}
      <div className="bg-[#0f0f13] border-b border-[#27272a] px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#d4af37] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal de Citas Online</span>
            </span>
            <span className="hidden sm:inline text-zinc-500">|</span>
            <span className="hidden sm:inline text-zinc-400">
              Atención personalizada con tecnología avanzada
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/593986704085"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>0986 704 085</span>
            </a>

            <button
              onClick={() => setViewMode('admin')}
              className="px-2.5 py-1 bg-[#1a1a22] hover:bg-[#252530] text-[#d4af37] border border-[#d4af37]/40 rounded-lg font-medium transition-all flex items-center gap-1 text-[11px]"
              title="Volver al panel administrativo interno"
            >
              <Lock className="w-3 h-3" />
              <span>Panel Spa / Personal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Banner matching Instagram post */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#141418] via-[#0d0d10] to-[#070709] border-b border-[#27272a] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Center Logo */}
            <div className="flex justify-center mb-5">
              <Logo size="lg" showSubtitle={false} className="drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/50 text-[#fde047] text-xs font-semibold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Tu belleza, en manos expertas</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-serif-luxury tracking-tight leading-tight px-2">
              Agendá tu Cita en <span className="text-gold-gradient block sm:inline mt-1 sm:mt-0 drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)]">Jilly Beauty Lab</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 mt-4 leading-relaxed max-w-2xl mx-auto">
              Te ofrecemos tratamientos pensados para realzar tu piel, cuidar tu cuerpo y resaltar tu mejor versión con tecnología médica de vanguardia y resultados visibles.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 pt-4 border-t border-[#27272a]/80 text-xs text-zinc-300">
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-[#d4af37]" />
                Tecnología Avanzada
              </span>
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-[#d4af37]" />
                Resultados Visibles
              </span>
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Check className="w-4 h-4 text-[#d4af37]" />
                Atención Personalizada
              </span>
            </div>

            {/* View switcher: Book vs Lookup */}
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => { setActivePortalTab('book'); setStep(1); }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activePortalTab === 'book'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black shadow-lg shadow-[#d4af37]/20 scale-105'
                    : 'bg-[#18181f] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                Reservar Nuevo Turno Online
              </button>

              <button
                onClick={() => setActivePortalTab('my_appointments')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activePortalTab === 'my_appointments'
                    ? 'bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black shadow-lg shadow-[#d4af37]/20 scale-105'
                    : 'bg-[#18181f] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                Consultar Mis Turnos
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Main Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activePortalTab === 'my_appointments' ? (
          /* Client Appointments Lookup View */
          <div className="max-w-xl mx-auto bg-[#121216] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white font-serif-luxury text-center mb-2">
              Consulta el Estado de tu Turno
            </h2>
            <p className="text-xs text-zinc-400 text-center mb-6">
              Ingresa el número de teléfono con el que realizaste la reserva para ver los detalles de tu cita.
            </p>

            <form onSubmit={handleSearchAppointments} className="flex gap-2 mb-6">
              <input
                type="tel"
                placeholder="Ej. 0986704085"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#d4af37] text-black font-semibold text-xs rounded-xl hover:brightness-110"
              >
                Buscar
              </button>
            </form>

            {lookupResults && (
              <div className="space-y-3 pt-4 border-t border-[#27272a]">
                {lookupResults.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">
                    No encontramos turnos registrados con ese número. Puedes solicitar uno nuevo fácilmente.
                  </p>
                ) : (
                  lookupResults.map((apt) => (
                    <div key={apt.id} className="p-4 bg-[#18181d] border border-[#27272a] rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-white text-sm">{apt.serviceName}</span>
                          <p className="text-[11px] text-[#d4af37] mt-0.5">Especialista: {apt.specialistName}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full capitalize">
                          {apt.status === 'confirmed' ? 'Confirmada' : apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-zinc-400 text-[11px] pt-1 border-t border-zinc-800">
                        <span>📅 {apt.date}</span>
                        <span>⏰ {apt.time} ({apt.durationMin} min)</span>
                        <span className="text-white font-mono font-bold">${apt.servicePrice.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
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
                            ★ {(!st.allowedServiceIds || st.allowedServiceIds.includes(selectedService?.id || '') || st.role === 'admin')
                              ? 'Especialista Habilitada para este Tratamiento'
                              : 'Cosmiatra Certificada'}
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

            {/* Step 4: Client Contact Information */}
            {step === 4 && (
              <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide">
                      Paso 4: Ingresa tus Datos de Contacto
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Te enviaremos la confirmación directa por WhatsApp para asegurar tu cita.
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

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Nombre y Apellido *
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
                      placeholder="Ej. Primera vez realizándome láser, o piel sensible a ciertos ácidos..."
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
                    Gracias por confiar en <strong className="text-[#d4af37]">Jilly Beauty Lab Center</strong>. Tu reserva ya se encuentra agendada en nuestro sistema.
                  </p>
                </div>

                {/* Booking Voucher Card */}
                <div className="max-w-md mx-auto bg-[#18181d] border border-[#d4af37]/40 rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#27272a]">
                    <span className="text-zinc-500">Código de Reserva:</span>
                    <span className="font-bold text-[#d4af37] text-sm">{confirmedBooking.code}</span>
                  </div>

                  <div className="space-y-1.5 text-zinc-300">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Cliente:</span>
                      <span className="font-bold text-white">{confirmedBooking.clientName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Tratamiento:</span>
                      <span className="text-amber-200">{confirmedBooking.serviceName}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-sans">Especialista:</span>
                      <span>{confirmedBooking.specialistName}</span>
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
