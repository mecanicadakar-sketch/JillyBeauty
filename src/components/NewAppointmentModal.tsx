import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Clock, User, Sparkles, Phone, Mail, FileText, Check } from 'lucide-react';
import { Appointment } from '../types';

interface NewAppointmentModalProps {
  onClose: () => void;
  initialDate?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ onClose, initialDate }) => {
  const { services, staffList, clients, addAppointment, currentUser } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate || today);
  const [time, setTime] = useState('10:00');
  
  // Client selection or new client
  const [clientSearch, setClientSearch] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [skinType, setSkinType] = useState('Normal');

  // Service & specialist
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [specialistId, setSpecialistId] = useState(
    currentUser.role === 'specialist' ? currentUser.id : (staffList.find(s => s.role === 'specialist')?.id || staffList[0]?.id)
  );
  const [notes, setNotes] = useState('');

  const selectedService = services.find(s => s.id === serviceId) || services[0];
  const selectedSpecialist = staffList.find(s => s.id === specialistId) || staffList[0];

  // Auto-fill when selecting an existing client
  const handleSelectClient = (client: typeof clients[0]) => {
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientEmail(client.email || '');
    if (client.skinType) setSkinType(client.skinType);
    setClientSearch('');
  };

  const filteredClients = clientSearch.trim()
    ? clients.filter(c => 
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
        c.phone.includes(clientSearch)
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor ingrese el nombre y teléfono del cliente.');
      return;
    }

    if (!selectedService || !selectedSpecialist) {
      alert('Por favor seleccione un servicio y una especialista.');
      return;
    }

    addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      specialistId: selectedSpecialist.id,
      specialistName: selectedSpecialist.name,
      date,
      time,
      durationMin: selectedService.durationMin,
      status: 'scheduled',
      notes: notes.trim() || undefined,
      skinType,
      createdBy: currentUser.name
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#0c0c0e]">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-base font-semibold text-white font-serif-luxury tracking-wide">
              Agendar Nueva Cita en Jilly Beauty Lab
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#a1a1aa] hover:text-white p-1 rounded-lg hover:bg-[#1a1a20]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Client Search / Existing clients */}
          <div className="bg-[#18181d] border border-[#27272a] rounded-xl p-4">
            <label className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              1. Datos del Cliente
            </label>

            {/* Quick autocomplete */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Buscar cliente habitual por nombre o teléfono..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />

              {filteredClients.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-[#1c1c22] border border-[#d4af37]/40 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                  {filteredClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectClient(c)}
                      className="px-3.5 py-2 text-xs hover:bg-[#27272a] cursor-pointer flex items-center justify-between border-b border-[#27272a] last:border-0"
                    >
                      <div>
                        <span className="font-medium text-white">{c.name}</span>
                        <span className="text-zinc-400 text-[11px] ml-2">({c.phone})</span>
                      </div>
                      <span className="text-[10px] text-[#d4af37]">Visitas: {c.totalVisits}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Gabriela Torres"
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Teléfono / WhatsApp *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ej. 0986702007"
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Correo Electrónico (Opcional)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Tipo de Piel</label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="Normal">Normal</option>
                  <option value="Grasa">Grasa / Seborreica</option>
                  <option value="Mixta">Mixta</option>
                  <option value="Seca">Seca / Deshidratada</option>
                  <option value="Sensible">Sensible / Reactiva</option>
                </select>
              </div>
            </div>
          </div>

          {/* Service & Specialist */}
          <div className="bg-[#18181d] border border-[#27272a] rounded-xl p-4">
            <label className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              2. Servicio y Especialista
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Servicio Solicitado</label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {services.filter(s => s.active).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.price.toFixed(2)} - {s.durationMin} min)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Especialista Asignada</label>
                <select
                  value={specialistId}
                  onChange={(e) => setSpecialistId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  {staffList.filter(st => st.active && st.role !== 'cashier').map(st => {
                    const isEnabledForService = !st.allowedServiceIds || st.allowedServiceIds.includes(serviceId) || st.role === 'admin';
                    return (
                      <option key={st.id} value={st.id}>
                        {st.name} {isEnabledForService ? '✓ (Habilitada)' : '⚠️ (Sin asignar a este servicio)'}
                      </option>
                    );
                  })}
                </select>

                {selectedSpecialist && (
                  <div className="mt-2 p-2 rounded-lg bg-[#121216] border border-[#27272a] flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full overflow-hidden border border-[#d4af37]/60 shrink-0 bg-[#22222a]">
                        {selectedSpecialist.avatar ? (
                          <img src={selectedSpecialist.avatar} alt={selectedSpecialist.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-full h-full p-1.5 text-[#d4af37]" />
                        )}
                      </div>
                      <div className="min-w-0 text-xs">
                        <div className="text-white font-medium truncate">{selectedSpecialist.name}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{selectedSpecialist.specialty}</div>
                      </div>
                    </div>

                    {(!selectedSpecialist.allowedServiceIds || selectedSpecialist.allowedServiceIds.includes(serviceId) || selectedSpecialist.role === 'admin') ? (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                        ✓ Habilitada
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
                        ⚠️ Sin asignar
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedService && (
              <div className="mt-3 p-3 rounded-lg bg-[#121216] border border-[#27272a] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#d4af37] font-semibold">{selectedService.name}</span>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{selectedService.description}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-sm font-bold text-white">${selectedService.price.toFixed(2)}</div>
                  <div className="text-[10px] text-zinc-400">{selectedService.durationMin} minutos</div>
                </div>
              </div>
            )}
          </div>

          {/* Date, Time & Notes */}
          <div className="bg-[#18181d] border border-[#27272a] rounded-xl p-4">
            <label className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              3. Fecha, Horario & Observaciones
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Fecha</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Hora de Inicio</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">Notas o indicaciones especiales</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sensibilidad al dolor, zona prioritaria de depilación, o retoque anterior..."
                rows={2}
                className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-[#1a1a20] border border-[#27272a] text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-semibold text-xs hover:brightness-110 shadow-lg shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Agendar Cita en Agenda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
