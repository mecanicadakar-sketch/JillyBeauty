import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Heart, 
  Sparkles, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt, 
  Plus, 
  X, 
  Filter, 
  Share2, 
  Download, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  CalendarDays,
  CreditCard,
  Cake,
  Hash,
  Copy,
  Printer,
  History,
  Check,
  Stethoscope,
  Send,
  Lock
} from 'lucide-react';
import { Client, ClientTreatmentRecord, Service } from '../types';

interface ClientsViewProps {
  onScheduleClient?: (client: Client) => void;
  onCheckoutClient?: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ 
  onScheduleClient,
  onCheckoutClient 
}) => {
  const { 
    clients, 
    addOrUpdateClient, 
    deleteClient, 
    addClientTreatmentRecord,
    appointments, 
    sales,
    services,
    staffList,
    setActiveTab,
    setViewMode,
    setCheckoutAppointment 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkinFilter, setSelectedSkinFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'lastVisit' | 'visits' | 'spent' | 'name' | 'code'>('lastVisit');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewHistoryClient, setViewHistoryClient] = useState<Client | null>(null);
  const [treatmentModalClient, setTreatmentModalClient] = useState<Client | null>(null);
  const [showSharePortalModal, setShowSharePortalModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form fields for Add / Edit Client
  const [formData, setFormData] = useState<{
    id?: string;
    clientCode?: string;
    name: string;
    phone: string;
    email: string;
    dni: string;
    birthdate: string;
    skinType: 'Normal' | 'Grasa' | 'Mixta' | 'Seca' | 'Sensible';
    allergies: string;
    notes: string;
    address: string;
  }>({
    name: '',
    phone: '',
    email: '',
    dni: '',
    birthdate: '',
    skinType: 'Mixta',
    allergies: '',
    notes: '',
    address: ''
  });

  // Form fields for "Cargar Tratamiento Realizado"
  const todayStr = new Date().toISOString().split('T')[0];
  const [treatmentForm, setTreatmentForm] = useState<{
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    specialistName: string;
    productsUsed: string;
    notes: string;
    price: number;
    status: 'completed' | 'in_progress' | 'scheduled';
  }>({
    serviceId: services[0]?.id || '',
    serviceName: services[0]?.name || 'Hollywood Peel',
    date: todayStr,
    time: '11:00',
    specialistName: staffList[0]?.name || 'Directora Jilly',
    productsUsed: '',
    notes: '',
    price: services[0]?.price || 50,
    status: 'completed'
  });

  const portalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/clientes` 
    : 'https://jillybeauty.vercel.app/clientes';

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const openNewClientModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      dni: '',
      birthdate: '',
      skinType: 'Mixta',
      allergies: '',
      notes: '',
      address: ''
    });
    setEditingClient(null);
    setShowAddModal(true);
  };

  const openEditClientModal = (client: Client) => {
    setFormData({
      id: client.id,
      clientCode: client.clientCode,
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      dni: client.dni || '',
      birthdate: client.birthdate || '',
      skinType: client.skinType || 'Mixta',
      allergies: client.allergies || '',
      notes: client.notes || '',
      address: client.address || ''
    });
    setEditingClient(client);
    setShowAddModal(true);
  };

  const openTreatmentLogger = (client: Client) => {
    setTreatmentModalClient(client);
    const defService = services[0];
    setTreatmentForm({
      serviceId: defService?.id || '',
      serviceName: defService?.name || 'Tratamiento Facial Personalizado',
      date: todayStr,
      time: '11:00',
      specialistName: staffList.find(s => s.role === 'specialist')?.name || staffList[0]?.name || 'Directora Jilly',
      productsUsed: '',
      notes: '',
      price: defService?.price || 50,
      status: 'completed'
    });
  };

  const handleSaveTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentModalClient) return;

    if (!treatmentForm.serviceName.trim()) {
      alert('Por favor especifique el nombre del tratamiento realizado.');
      return;
    }

    addClientTreatmentRecord(treatmentModalClient.id, {
      serviceId: treatmentForm.serviceId,
      serviceName: treatmentForm.serviceName,
      date: treatmentForm.date,
      time: treatmentForm.time,
      specialistName: treatmentForm.specialistName,
      productsUsed: treatmentForm.productsUsed.trim() || undefined,
      notes: treatmentForm.notes.trim() || undefined,
      price: Number(treatmentForm.price) || 0,
      status: treatmentForm.status
    });

    const clientName = treatmentModalClient.name;
    setTreatmentModalClient(null);

    // Refresh viewHistoryClient if currently open
    if (viewHistoryClient && viewHistoryClient.id === treatmentModalClient.id) {
      const refreshed = clients.find(c => c.id === treatmentModalClient.id);
      if (refreshed) setViewHistoryClient(refreshed);
    }

    setSaveSuccessMsg(`✓ Tratamiento "${treatmentForm.serviceName}" registrado en la ficha de ${clientName}.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Por favor complete el nombre y teléfono de la clienta.');
      return;
    }

    const saved = addOrUpdateClient({
      id: formData.id,
      clientCode: formData.clientCode,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      dni: formData.dni.trim(),
      birthdate: formData.birthdate,
      skinType: formData.skinType,
      allergies: formData.allergies.trim(),
      notes: formData.notes.trim(),
      address: formData.address.trim(),
    });

    setShowAddModal(false);
    setSaveSuccessMsg(
      editingClient 
        ? `✓ Ficha de ${formData.name} actualizada correctamente (Código: ${saved.clientCode}).` 
        : `✓ Ficha creada con Código ${saved.clientCode} para ${formData.name}. Precargada para citas y caja.`
    );
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`¿Confirma eliminar el expediente de ${client.name} (Código: ${client.clientCode})? Esta acción no se puede deshacer.`)) {
      deleteClient(client.id);
      setSaveSuccessMsg(`Ficha de ${client.name} eliminada.`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  const handleStartAppointment = (client: Client) => {
    if (onScheduleClient) {
      onScheduleClient(client);
    } else {
      setActiveTab('appointments');
    }
  };

  const handleStartCheckout = (client: Client) => {
    if (onCheckoutClient) {
      onCheckoutClient(client);
    } else {
      setActiveTab('cashier');
    }
  };

  // Group clients by lowercase name to identify duplicates
  const nameOccurrences = useMemo(() => {
    const counts: Record<string, number> = {};
    clients.forEach(c => {
      const clean = c.name.trim().toLowerCase();
      counts[clean] = (counts[clean] || 0) + 1;
    });
    return counts;
  }, [clients]);

  // Filter & Sort clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Filter by skin type
    if (selectedSkinFilter !== 'all') {
      result = result.filter(c => c.skinType === selectedSkinFilter);
    }

    // Filter by text search (code, name, phone, dni, allergy, notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const qDigits = q.replace(/\D/g, '');
      result = result.filter(c => {
        const matchCode = c.clientCode && c.clientCode.toLowerCase().includes(q);
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q) || (qDigits.length >= 3 && c.phone.replace(/\D/g, '').includes(qDigits));
        const matchDni = c.dni && c.dni.toLowerCase().includes(q);
        const matchAllergy = c.allergies && c.allergies.toLowerCase().includes(q);
        const matchNotes = c.notes && c.notes.toLowerCase().includes(q);
        return matchCode || matchName || matchPhone || matchDni || matchAllergy || matchNotes;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'code') {
        return (a.clientCode || '').localeCompare(b.clientCode || '');
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'visits') {
        return (b.totalVisits || 0) - (a.totalVisits || 0);
      }
      if (sortBy === 'spent') {
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      }
      // lastVisit default
      const dateA = a.lastVisit || '1970-01-01';
      const dateB = b.lastVisit || '1970-01-01';
      return dateB.localeCompare(dateA);
    });

    return result;
  }, [clients, selectedSkinFilter, searchQuery, sortBy]);

  // Quick stats
  const totalClients = clients.length;
  const frequentClients = clients.filter(c => (c.totalVisits || 0) >= 3).length;
  const totalVisitsCount = clients.reduce((acc, c) => acc + (c.totalVisits || 0), 0);
  const totalRevenueFromClients = clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0);

  const skinTypeColors: Record<string, string> = {
    'Normal': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    'Grasa': 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    'Mixta': 'bg-sky-500/15 text-sky-300 border-sky-500/40',
    'Seca': 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40',
    'Sensible': 'bg-pink-500/15 text-pink-300 border-pink-500/40'
  };

  // Find history data for the currently inspected client
  const clientAppointments = useMemo(() => {
    if (!viewHistoryClient) return [];
    const cleanPhone = viewHistoryClient.phone.replace(/[^0-9]/g, '');
    const clientCode = viewHistoryClient.clientCode?.toUpperCase();
    return appointments.filter(a => {
      const matchPhone = cleanPhone && a.clientPhone.replace(/[^0-9]/g, '') === cleanPhone;
      const matchName = a.clientName.trim().toLowerCase() === viewHistoryClient.name.trim().toLowerCase();
      const matchCode = clientCode && a.notes?.toUpperCase().includes(clientCode);
      return matchPhone || matchName || matchCode;
    });
  }, [viewHistoryClient, appointments]);

  const clientSales = useMemo(() => {
    if (!viewHistoryClient) return [];
    const cleanPhone = viewHistoryClient.phone.replace(/[^0-9]/g, '');
    return sales.filter(s => {
      const matchPhone = cleanPhone && (s.clientPhone || '').replace(/[^0-9]/g, '') === cleanPhone;
      const matchName = s.clientName && s.clientName.trim().toLowerCase() === viewHistoryClient.name.trim().toLowerCase();
      return matchPhone || matchName;
    });
  }, [viewHistoryClient, sales]);

  return (
    <div className="space-y-6">
      {/* Success Notification Toast */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/70 to-emerald-900/40 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setSaveSuccessMsg('')} 
            className="text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Luxury Header Banner */}
      <div className="bg-gradient-to-r from-[#14141a] via-[#101015] to-[#171720] border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#fde047] text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Base de Datos de Clientes & Fichas Clínicas</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif-luxury text-white tracking-tight">
              Expedientes & Tratamientos de Clientes
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Cada cliente cuenta con un <strong>Código de Cliente único</strong> (ej. JBL-1001) para agendar citas sin volver a pedir sus datos, evitar confusiones entre clientas con el mismo nombre y llevar su ficha de tratamientos realizados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Share Portal Button */}
            <button
              onClick={() => setShowSharePortalModal(true)}
              className="px-4 py-2.5 bg-[#1a1a24] hover:bg-[#252532] text-[#fde047] border border-[#d4af37]/50 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
              title="Compartir enlace para que los clientes soliciten turnos o consulten su ficha"
            >
              <ExternalLink className="w-4 h-4 text-[#d4af37]" />
              <span>Portal Clientes (URL)</span>
            </button>

            {/* New Client Button */}
            <button
              onClick={openNewClientModal}
              className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#d4af37]/25 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nueva Ficha Técnica</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Fichas Registradas</span>
            <Users className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">
            {totalClients}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Con código de cliente asignado
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Clientas Frecuentes</span>
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-luxury text-pink-400">
            {frequentClients}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            3 o más visitas al spa
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Visitas Atendidas</span>
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-luxury text-[#e5c158]">
            {totalVisitsCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Citas y sesiones realizadas
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Consumo Acumulado</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            ${totalRevenueFromClients.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Facturado a clientas registradas
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Código (ej. JBL-1001 ó 1001), Nombre, Teléfono, Cédula o Alergia..."
              className="w-full pl-10 pr-4 py-2 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-[#d4af37]"
            >
              <option value="lastVisit">Ordenar: Última Visita</option>
              <option value="code">Ordenar: Código de Cliente</option>
              <option value="visits">Ordenar: Más Visitas</option>
              <option value="spent">Ordenar: Mayor Consumo</option>
              <option value="name">Ordenar: Nombre (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Skin Type Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-zinc-400 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#d4af37]" />
            <span>Tipo de Piel:</span>
          </span>

          <button
            onClick={() => setSelectedSkinFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
              selectedSkinFilter === 'all'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'bg-[#181820] text-zinc-400 hover:text-white border border-[#27272a]'
            }`}
          >
            Todas ({clients.length})
          </button>

          {['Normal', 'Grasa', 'Mixta', 'Seca', 'Sensible'].map(type => {
            const count = clients.filter(c => c.skinType === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedSkinFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                  selectedSkinFilter === type
                    ? 'bg-[#d4af37] text-black font-semibold'
                    : 'bg-[#181820] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Clients Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-10 text-center text-zinc-400">
          <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No se encontraron clientes</h3>
          <p className="text-xs text-zinc-500 mb-4">
            {searchQuery ? 'Prueba con otro código, nombre o teléfono.' : 'Aún no hay clientes registrados.'}
          </p>
          <button
            onClick={openNewClientModal}
            className="px-4 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-xl hover:brightness-110"
          >
            + Crear Ficha Técnica
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const cleanPhone = client.phone.replace(/[^0-9]/g, '');
            const waNumber = cleanPhone.startsWith('0') ? `593${cleanPhone.slice(1)}` : cleanPhone;
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola ${client.name}! ✨ Te saludamos de Jilly Beauty Lab Center. Tu código de clienta es: ${client.clientCode}`)}`;

            const skinBadge = client.skinType 
              ? skinTypeColors[client.skinType] || 'bg-zinc-800 text-zinc-300 border-zinc-700'
              : 'bg-zinc-800 text-zinc-300 border-zinc-700';

            const isDuplicateName = (nameOccurrences[client.name.trim().toLowerCase()] || 0) > 1;

            return (
              <div
                key={client.id}
                className="bg-[#121216] border border-[#27272a] hover:border-[#d4af37]/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl relative group"
              >
                <div>
                  {/* Card Header: Initials Avatar + Name + Client Code Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1f1f28] to-[#2c2c38] border-2 border-[#d4af37]/60 flex items-center justify-center text-sm font-bold text-[#e5c158] shrink-0 shadow-md">
                        {client.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate font-serif-luxury group-hover:text-[#e5c158] transition-colors">
                            {client.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <Phone className="w-3 h-3 text-[#d4af37] shrink-0" />
                          <span className="font-mono">{client.phone}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold whitespace-nowrap ${skinBadge}`}>
                      {client.skinType || 'Sin diagnóstico'}
                    </span>
                  </div>

                  {/* Client Code Pill with Quick Copy Button */}
                  <div className="flex items-center justify-between gap-2 mb-3 bg-[#181822] border border-[#27272a] rounded-xl px-2.5 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span className="text-[10.5px] text-zinc-400">Código de Cliente:</span>
                      <span className="font-mono font-bold text-xs text-[#fde047] bg-black/50 px-2 py-0.5 rounded border border-[#d4af37]/40">
                        {client.clientCode || 'JBL-1000'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(client.clientCode || '', client.clientCode || '')}
                      className="text-[10.5px] text-zinc-400 hover:text-white flex items-center gap-1 p-1 rounded hover:bg-[#252532] transition-colors"
                      title="Copiar código de cliente"
                    >
                      {copiedCode === client.clientCode ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copiado
                        </span>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Disambiguation Alert for clients with same name */}
                  {isDuplicateName && (
                    <div className="mb-2.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10.5px] text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Nota: Hay otra clienta con el mismo nombre. Usa el código <strong>{client.clientCode}</strong> para diferenciarla.</span>
                    </div>
                  )}

                  {/* Medical / Aesthetic Allergies Alert */}
                  {client.allergies && client.allergies.toLowerCase() !== 'ninguna' && client.allergies.toLowerCase() !== 'ninguna conocida' && (
                    <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Alerta médica / Alergia:</strong> {client.allergies}
                      </div>
                    </div>
                  )}

                  {/* Client Info Grid */}
                  <div className="p-3 bg-[#17171e] border border-[#27272a] rounded-xl space-y-1.5 text-[11px] text-zinc-300 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Total Visitas:</span>
                      <span className="font-bold text-[#d4af37] flex items-center gap-1 font-mono">
                        <Sparkles className="w-3 h-3 text-[#d4af37]" />
                        {client.totalVisits || 1} {client.totalVisits === 1 ? 'visita' : 'visitas'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Consumo Acumulado:</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        ${(client.totalSpent || 0).toFixed(2)}
                      </span>
                    </div>

                    {client.lastVisit && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Última Visita:</span>
                        <span className="text-zinc-300 font-mono">{client.lastVisit}</span>
                      </div>
                    )}

                    {client.treatmentRecords && client.treatmentRecords.length > 0 && (
                      <div className="flex items-center justify-between pt-1 border-t border-[#222228]">
                        <span className="text-zinc-400">Último Tratamiento:</span>
                        <span className="text-[#e5c158] font-medium truncate max-w-[140px] text-right">
                          {client.treatmentRecords[0].serviceName}
                        </span>
                      </div>
                    )}

                    {client.dni && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Cédula / DNI:</span>
                        <span className="text-zinc-300 font-mono">{client.dni}</span>
                      </div>
                    )}

                    {client.birthdate && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Cake className="w-3 h-3 text-pink-400" />
                          <span>Cumpleaños:</span>
                        </span>
                        <span className="text-zinc-300 font-mono">{client.birthdate}</span>
                      </div>
                    )}
                  </div>

                  {/* Aesthetic Notes */}
                  {client.notes && (
                    <div className="mb-3 text-[11px] text-zinc-400 bg-[#141418] p-2.5 rounded-xl border border-[#222228] line-clamp-2">
                      <span className="text-zinc-500 font-semibold">Notas:</span> {client.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-[#222228] space-y-2">
                  {/* Primary Row: Agendar Cita + Cargar Tratamiento Realizado */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleStartAppointment(client)}
                      className="py-1.5 px-2 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#fde047] border border-[#d4af37]/40 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                      title="Agendar turno en Agenda con datos precargados"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Agendar Cita</span>
                    </button>

                    <button
                      onClick={() => openTreatmentLogger(client)}
                      className="py-1.5 px-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-300 border border-purple-500/40 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                      title="Registrar o cargar tratamiento realizado en la ficha clínica"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                      <span>+ Cargar Tratamiento</span>
                    </button>
                  </div>

                  {/* Secondary Row: Cobrar en Caja + Ficha Completa + Acciones */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <button
                      onClick={() => setViewHistoryClient(client)}
                      className="text-[11px] text-[#e5c158] hover:text-white flex items-center gap-1 py-1 px-2 rounded-lg bg-[#181820] hover:bg-[#242430] border border-[#27272a] transition-colors"
                      title="Ver ficha técnica completa y todos los tratamientos realizados"
                    >
                      <FileText className="w-3 h-3 text-[#d4af37]" />
                      <span>Ver Ficha ({client.treatmentRecords?.length || 0})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                        title="Enviar mensaje por WhatsApp con su código"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => openEditClientModal(client)}
                        className="p-1.5 text-zinc-400 hover:text-[#d4af37] rounded-lg hover:bg-[#1a1a24] transition-colors"
                        title="Editar datos de la clienta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClient(client)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Eliminar ficha de clienta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Cargar / Registrar Tratamiento Realizado */}
      {treatmentModalClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#252530] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Cargar Tratamiento Realizado
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Clienta: <strong className="text-white">{treatmentModalClient.name}</strong> · Código: <strong className="text-[#fde047] font-mono">{treatmentModalClient.clientCode}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTreatmentModalClient(null)}
                className="w-8 h-8 rounded-lg bg-[#181820] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTreatment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tratamiento / Servicio Realizado *
                </label>
                <select
                  value={treatmentForm.serviceId}
                  onChange={(e) => {
                    const sel = services.find(s => s.id === e.target.value);
                    setTreatmentForm({
                      ...treatmentForm,
                      serviceId: e.target.value,
                      serviceName: sel?.name || treatmentForm.serviceName,
                      price: sel?.price || treatmentForm.price
                    });
                  }}
                  className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white focus:outline-none mb-1.5"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (${s.price.toFixed(2)})
                    </option>
                  ))}
                  <option value="custom">+ Otro Tratamiento / Protocolo Personalizado</option>
                </select>

                {treatmentForm.serviceId === 'custom' && (
                  <input
                    type="text"
                    required
                    value={treatmentForm.serviceName}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, serviceName: e.target.value })}
                    placeholder="Escribir nombre del tratamiento..."
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Fecha de Realización
                  </label>
                  <input
                    type="date"
                    required
                    value={treatmentForm.date}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Especialista
                  </label>
                  <select
                    value={treatmentForm.specialistName}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, specialistName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none"
                  >
                    {staffList.filter(s => s.active).map(st => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Precio Cobrado ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={treatmentForm.price}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Estado del Tratamiento
                  </label>
                  <select
                    value={treatmentForm.status}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="completed">Completado / Realizado</option>
                    <option value="in_progress">En Curso (Sesión parcial)</option>
                    <option value="scheduled">Programado en Ficha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Productos / Fórmulas e Insumos Aplicados
                </label>
                <input
                  type="text"
                  value={treatmentForm.productsUsed}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, productsUsed: e.target.value })}
                  placeholder="Ej. Ácido mandélico 30%, carbón activo Nd:YAG, suero de colágeno, aguja nano 36..."
                  className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Observaciones Clínicas / Reacción de la Piel
                </label>
                <textarea
                  rows={2}
                  value={treatmentForm.notes}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
                  placeholder="Ej. Buena tolerancia, eritema leve transitorio, se indica protector solar cada 3 horas..."
                  className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#252530] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTreatmentModalClient(null)}
                  className="px-4 py-2 bg-[#181820] text-zinc-400 hover:text-white rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/25 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar en Ficha Clínica</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Compartir Enlace del Portal Clientes */}
      {showSharePortalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#252530] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Portal Exclusivo para Clientes
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Página aislada para turnos online y consulta de tratamientos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSharePortalModal(false)}
                className="w-8 h-8 rounded-lg bg-[#181820] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-200">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>Seguridad & Privacidad Garantizada</span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  Las clientas que abran este enlace <strong>NO tienen acceso a la app interna del spa</strong>: no pueden ver la caja, otros clientes, personal ni inventario. Solo pueden reservar su turno e ingresar su código de cliente para consultar sus propios tratamientos.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Enlace directo para clientes:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={portalUrl}
                    className="flex-1 px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-xl text-xs text-[#fde047] font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(portalUrl, 'portalUrl')}
                    className="px-3.5 py-2 bg-[#d4af37] text-black font-bold rounded-xl text-xs hover:brightness-110 flex items-center gap-1 shrink-0"
                  >
                    {copiedCode === 'portalUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === 'portalUrl' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`✨ ¡Hola! Ya puedes agendar tu turno online y consultar tus tratamientos en Jilly Beauty Lab ingresando aquí:\n${portalUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setShowSharePortalModal(false);
                    setViewMode('client_portal');
                  }}
                  className="py-2.5 px-3 bg-[#1e1e28] hover:bg-[#282836] text-[#fde047] border border-[#d4af37]/40 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Ver Vista Previa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Agregar / Editar Ficha de Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/50 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#252530] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    {editingClient ? 'Editar Ficha Técnica de Cliente' : 'Nueva Ficha Técnica de Cliente'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Se genera automáticamente su Código de Cliente para futuras citas y búsquedas
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg bg-[#181820] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5">
              {editingClient && editingClient.clientCode && (
                <div className="p-2.5 rounded-xl bg-[#181822] border border-[#d4af37]/40 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Código de Cliente Asignado:</span>
                    <span className="font-mono font-bold text-[#fde047]">{editingClient.clientCode}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Único e irrepetible</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Nombre Completo de la Clienta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Carolina Benítez"
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0991234888"
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Cédula / Identificación (DNI)
                  </label>
                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    placeholder="1728394857"
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="clienta@correo.com"
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Fecha de Nacimiento / Cumpleaños
                  </label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Diagnóstico de Tipo de Piel
                  </label>
                  <select
                    value={formData.skinType}
                    onChange={(e) => setFormData({ ...formData, skinType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Normal">Normal (Equilibrada)</option>
                    <option value="Grasa">Grasa / Seborreica</option>
                    <option value="Mixta">Mixta (Zona T)</option>
                    <option value="Seca">Seca / Alípica</option>
                    <option value="Sensible">Sensible / Reactiva</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Dirección / Sector
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej. Cumbayá, Quito"
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Alergias o Contraindicaciones Médicas</span>
                  </label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Ej. Alérgica al látex, aspirina, ácido retinoico, implantes metálicos..."
                    className="w-full px-3 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-rose-400 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Observaciones Estéticas / Tratamientos Previos
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Objetivo: reducir manchas por sol, prefiere protocolos suaves, sesiones de peeling realizadas..."
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#252530] flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-[#181820] text-zinc-400 hover:text-white rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#d4af37]/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingClient ? 'Guardar Cambios de la Clienta' : 'Guardar Ficha de Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Ficha Técnica & Historial Clínico Completo */}
      {viewHistoryClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252530] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1f1f28] to-[#2c2c38] border-2 border-[#d4af37] flex items-center justify-center text-sm font-bold text-[#e5c158]">
                  {viewHistoryClient.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-serif-luxury">
                      {viewHistoryClient.name}
                    </h3>
                    <span className="font-mono font-bold text-xs bg-black/60 px-2 py-0.5 rounded border border-[#d4af37]/50 text-[#fde047]">
                      {viewHistoryClient.clientCode || 'JBL-1000'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Teléfono: <span className="text-zinc-200 font-mono">{viewHistoryClient.phone}</span>
                    {viewHistoryClient.dni && <span> · DNI: <span className="text-zinc-200 font-mono">{viewHistoryClient.dni}</span></span>}
                    <span> · {viewHistoryClient.totalVisits || 1} visitas registradas</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewHistoryClient(null)}
                className="w-8 h-8 rounded-lg bg-[#181820] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 bg-[#17171e] border border-[#27272a] rounded-xl text-center">
                <div className="text-[10px] text-zinc-400">Total Visitas</div>
                <div className="text-base font-bold text-[#d4af37]">{viewHistoryClient.totalVisits || 1}</div>
              </div>
              <div className="p-3 bg-[#17171e] border border-[#27272a] rounded-xl text-center">
                <div className="text-[10px] text-zinc-400">Total Consumido</div>
                <div className="text-base font-bold text-emerald-400 font-mono">${(viewHistoryClient.totalSpent || 0).toFixed(2)}</div>
              </div>
              <div className="p-3 bg-[#17171e] border border-[#27272a] rounded-xl text-center">
                <div className="text-[10px] text-zinc-400">Tipo de Piel</div>
                <div className="text-xs font-bold text-sky-300 mt-0.5">{viewHistoryClient.skinType || 'Mixta'}</div>
              </div>
            </div>

            {/* Quick Actions Bar inside Modal */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 bg-[#171720] border border-[#27272a] rounded-xl">
              <button
                onClick={() => {
                  const target = viewHistoryClient;
                  setViewHistoryClient(null);
                  handleStartAppointment(target);
                }}
                className="px-3 py-1.5 bg-[#d4af37] text-black font-semibold text-xs rounded-lg hover:brightness-110 flex items-center gap-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>📅 Agendar Nueva Cita</span>
              </button>

              <button
                onClick={() => {
                  const target = viewHistoryClient;
                  openTreatmentLogger(target);
                }}
                className="px-3 py-1.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold text-xs rounded-lg hover:bg-purple-500/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Cargar Tratamiento</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-[#1f1f28] text-zinc-300 hover:text-white border border-[#27272a] text-xs rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ficha</span>
              </button>
            </div>

            {/* Allergies Highlight */}
            {viewHistoryClient.allergies && viewHistoryClient.allergies.toLowerCase() !== 'ninguna' && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Alergias o Contraindicaciones Registradas:</strong> {viewHistoryClient.allergies}
                </div>
              </div>
            )}

            {/* Treatments Section */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-purple-400" />
                    <span>Ficha de Tratamientos Realizados ({viewHistoryClient.treatmentRecords?.length || 0})</span>
                  </h4>
                  <button
                    onClick={() => openTreatmentLogger(viewHistoryClient)}
                    className="text-[11px] text-[#fde047] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Cargar Tratamiento</span>
                  </button>
                </div>

                {(!viewHistoryClient.treatmentRecords || viewHistoryClient.treatmentRecords.length === 0) ? (
                  <p className="text-xs text-zinc-500 italic p-3 bg-[#16161c] rounded-xl border border-[#222228]">
                    Aún no hay tratamientos cargados directamente en la ficha técnica de esta clienta. Puedes hacer clic en "+ Cargar Tratamiento" para registrar uno.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {viewHistoryClient.treatmentRecords.map(tr => (
                      <div key={tr.id} className="p-3 bg-[#171720] border border-[#27272a] rounded-xl space-y-1 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-white text-sm">{tr.serviceName}</span>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              📅 Fecha: <span className="text-zinc-200">{tr.date}</span> · Especialista: <span className="text-[#d4af37]">{tr.specialistName}</span>
                            </div>
                          </div>
                          {tr.price !== undefined && (
                            <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                              ${tr.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {tr.productsUsed && (
                          <div className="text-[11px] text-purple-300 bg-purple-950/20 p-2 rounded-lg border border-purple-500/20">
                            <strong>Fórmulas / Insumos:</strong> {tr.productsUsed}
                          </div>
                        )}

                        {tr.notes && (
                          <div className="text-[11px] text-zinc-300 bg-[#121216] p-2 rounded-lg border border-[#252530]">
                            <strong>Observaciones:</strong> {tr.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scheduled Appointments from Calendar */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Historial en Agenda de Citas ({clientAppointments.length})</span>
                </h4>

                {clientAppointments.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 bg-[#16161c] rounded-xl border border-[#222228]">
                    No hay citas anteriores registradas en el calendario para esta clienta.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {clientAppointments.map(apt => (
                      <div key={apt.id} className="p-3 bg-[#17171e] border border-[#27272a] rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white">{apt.serviceName}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            Fecha: <span className="text-zinc-200">{apt.date}</span> · {apt.time} · Especialista: {apt.specialistName}
                          </div>
                          {apt.notes && (
                            <div className="text-[10px] text-zinc-500 mt-0.5">{apt.notes}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400">${apt.servicePrice.toFixed(2)}</span>
                          <div className="text-[10px] uppercase text-zinc-400">{apt.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tickets de Caja */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tickets y Pagos en Caja POS ({clientSales.length})</span>
                </h4>

                {clientSales.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 bg-[#16161c] rounded-xl border border-[#222228]">
                    No hay compras en caja registradas con el número de esta clienta.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {clientSales.map(sale => (
                      <div key={sale.id} className="p-3 bg-[#17171e] border border-[#27272a] rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-white font-mono">{sale.ticketNumber}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {sale.date.split('T')[0]} · Pago: {sale.paymentMethod}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-400">${sale.total.toFixed(2)}</span>
                          <div className="text-[10px] text-zinc-400">{sale.items.length} items</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#252530] mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewHistoryClient(null)}
                className="px-5 py-2 bg-[#181820] text-zinc-300 text-xs rounded-xl hover:text-white"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
