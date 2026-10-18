import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  Hash, 
  Search, 
  AlertCircle, 
  ShieldAlert,
  History,
  CheckCircle2
} from 'lucide-react';
import { Appointment, Client, Service } from '../types';

interface NewAppointmentModalProps {
  onClose: () => void;
  initialDate?: string;
  initialService?: Service | null;
  initialClient?: Client | null;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ 
  onClose, 
  initialDate,
  initialService,
  initialClient 
}) => {
  const { services, staffList, clients, addAppointment, currentUser } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate || today);
  const [time, setTime] = useState('10:00');
  
  // Client Code input & quick lookup
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLookupStatus, setCodeLookupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Client selection or preloaded client
  const [selectedClient, setSelectedClient] = useState<Client | null>(initialClient || null);
  const [selectedClientCode, setSelectedClientCode] = useState(initialClient?.clientCode || '');
  const [clientSearch, setClientSearch] = useState('');
  const [clientName, setClientName] = useState(initialClient?.name || '');
  const [clientPhone, setClientPhone] = useState(initialClient?.phone || '');
  const [clientEmail, setClientEmail] = useState(initialClient?.email || '');
  const [skinType, setSkinType] = useState(initialClient?.skinType || 'Normal');
  const [allergies, setAllergies] = useState(initialClient?.allergies || '');

  // Service & specialist
  const [serviceId, setServiceId] = useState(initialService?.id || services[0]?.id || '');
  const [specialistId, setSpecialistId] = useState(
    currentUser.role === 'specialist' ? currentUser.id : (staffList.find(s => s.role === 'specialist')?.id || staffList[0]?.id)
  );
  const [notes, setNotes] = useState(initialClient?.notes ? `[Ficha previa: ${initialClient.notes}] ` : '');

  const selectedService = services.find(s => s.id === serviceId) || services[0];
  const selectedSpecialist = staffList.find(s => s.id === specialistId) || staffList[0];

  // Auto-fill when selecting an existing client
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSelectedClientCode(client.clientCode || '');
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientEmail(client.email || '');
    if (client.skinType) setSkinType(client.skinType);
    if (client.allergies) setAllergies(client.allergies);
    if (client.notes) {
      setNotes(prev => prev.includes(client.notes || '') ? prev : (prev ? `${prev} [Ficha previa: ${client.notes}]` : `[Ficha previa: ${client.notes}] `));
    }
    setClientSearch('');
    setCodeLookupStatus({
      type: 'success',
      message: `✓ Datos de ${client.name} precargados (Código: ${client.clientCode || 'Asignado'})`
    });
  };

  // Instant lookup by Client Code
  const handleLookupByCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCodeLookupStatus(null);
    const q = codeQuery.trim().toUpperCase();
    if (!q) {
      setCodeLookupStatus({
        type: 'error',
        message: 'Por favor ingrese el número o código de cliente (ej. JBL-1001 ó 1001).'
      });
      return;
    }

    const cleanNum = q.replace(/\D/g, '');
    const found = clients.find(c => {
      const codeMatch = c.clientCode && (
        c.clientCode.toUpperCase() === q ||
        c.clientCode.toUpperCase() === `JBL-${q}` ||
        (cleanNum.length >= 2 && c.clientCode.includes(cleanNum))
      );
      return codeMatch;
    });

    if (found) {
      handleSelectClient(found);
      setCodeQuery('');
    } else {
      setCodeLookupStatus({
        type: 'error',
        message: `No se encontró ningún cliente con el código "${codeQuery}". Puedes buscarlo por nombre abajo o registrar sus datos.`
      });
    }
  };

  const filteredClients = clientSearch.trim()
    ? clients.filter(c => 
        (c.clientCode && c.clientCode.toLowerCase().includes(clientSearch.toLowerCase())) ||
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

    const clientCodeNote = selectedClientCode ? `[Código: ${selectedClientCode}] ` : '';

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
      notes: `${clientCodeNote}${notes.trim()}`.trim() || undefined,
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
          {/* Section 1: Client Data with Code Lookup & Preloading */}
          <div className="bg-[#18181d] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#d4af37] uppercase tracking-wider">
                1. Datos del Cliente & Precarga Automática
              </label>
              <span className="text-[10px] text-zinc-400">
                Identificación por Código único
              </span>
            </div>

            {/* Quick Lookup by Client Code */}
            <div className="mb-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="w-4 h-4 text-[#d4af37] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ingresa Número / Código de Cliente (ej. JBL-1001 ó 1001)..."
                    value={codeQuery}
                    onChange={(e) => setCodeQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookupByCode();
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] focus:border-[#d4af37] rounded-lg text-xs text-white placeholder-zinc-500 font-mono focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleLookupByCode()}
                  className="px-3.5 py-2 bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fde047] hover:bg-[#d4af37]/30 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Precargar</span>
                </button>
              </div>

              {codeLookupStatus && (
                <div className={`mt-2 p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                  codeLookupStatus.type === 'success' 
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}>
                  {codeLookupStatus.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  )}
                  <span>{codeLookupStatus.message}</span>
                </div>
              )}
            </div>

            {/* Client Search Dropdown (Differentiates same-name clients with Code & Phone) */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="O busca por Nombre, Apellido o Teléfono (ej. María González)..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#121216] border border-[#27272a] focus:border-[#d4af37] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none"
              />

              {filteredClients.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-[#1c1c22] border border-[#d4af37]/40 rounded-lg shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-[#27272a]">
                  {filteredClients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectClient(c)}
                      className="px-3.5 py-2.5 text-xs hover:bg-[#27272a] cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {/* Unique Client Code Badge */}
                        <span className="font-mono text-[#fde047] font-bold text-[11px] bg-[#d4af37]/20 border border-[#d4af37]/50 px-2 py-0.5 rounded shrink-0">
                          {c.clientCode || 'JBL-1000'}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-white">{c.name}</span>
                          <span className="text-zinc-400 text-[11px] font-mono ml-2">({c.phone})</span>
                          {c.skinType && (
                            <span className="text-zinc-500 text-[10px] ml-1.5 font-normal">
                              · Piel {c.skinType}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10.5px] text-[#d4af37] font-semibold shrink-0 ml-2">
                        {c.totalVisits || 1} {c.totalVisits === 1 ? 'visita' : 'visitas'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Client Code Banner */}
            {selectedClientCode && (
              <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-[#d4af37]/20 to-[#aa8421]/15 border border-[#d4af37]/50 text-xs text-[#fde047] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-300 font-medium">Cliente precargado:</span>
                  <span className="font-mono font-bold bg-black/60 px-2.5 py-0.5 rounded-md border border-[#d4af37]/60 text-white">
                    {selectedClientCode}
                  </span>
                  <span className="text-white font-semibold">{clientName}</span>
                  {selectedClient?.totalVisits !== undefined && (
                    <span className="text-[11px] text-zinc-300 bg-[#121216] px-2 py-0.5 rounded border border-[#27272a]">
                      {selectedClient.totalVisits} visitas previas
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClient(null);
                    setSelectedClientCode('');
                    setClientName('');
                    setClientPhone('');
                    setClientEmail('');
                    setAllergies('');
                    setCodeLookupStatus(null);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-white underline self-end sm:self-auto"
                >
                  Cambiar / Limpiar
                </button>
              </div>
            )}

            {/* Medical Warning if Client has allergies */}
            {allergies && allergies.toLowerCase() !== 'ninguna' && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-rose-200">Alerta médica / Alergias registradas:</strong> {allergies}
                </div>
              </div>
            )}

            {/* Client Recent Treatments Summary */}
            {selectedClient?.treatmentRecords && selectedClient.treatmentRecords.length > 0 && (
              <div className="mb-3 p-2.5 rounded-lg bg-[#14141a] border border-[#27272a] text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
                  <History className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Últimos Tratamientos en el Spa:</span>
                </div>
                <div className="space-y-1">
                  {selectedClient.treatmentRecords.slice(0, 2).map((tr) => (
                    <div key={tr.id} className="text-[11px] text-zinc-400 flex items-center justify-between">
                      <span className="text-zinc-200">{tr.serviceName}</span>
                      <span className="font-mono text-zinc-400">{tr.date} · {tr.specialistName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  onChange={(e) => setSkinType(e.target.value as any)}
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

          {/* Section 2: Service & Specialist */}
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
                      {s.name} (Gs. {s.price.toLocaleString('es-PY')} - {s.durationMin} min)
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
                  {staffList.filter(s => s.active).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Date, Time & Notes */}
          <div className="bg-[#18181d] border border-[#27272a] rounded-xl p-4">
            <label className="block text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
              3. Fecha, Horario y Observaciones
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Fecha de la Cita</label>
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
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    {[
                      '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
                      '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
                    ].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Notas Clínicas / Ficha / Solicitud Especial
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Paciente con peeling previo, solicita limpieza de puntos negros..."
                className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
            <div className="text-xs text-zinc-400">
              Valor estimado: <span className="font-bold text-emerald-400 font-mono">Gs. {selectedService ? selectedService.price.toLocaleString('es-PY') : '0'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1a1a20] text-zinc-300 hover:text-white rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/25 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Agendar Cita</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
