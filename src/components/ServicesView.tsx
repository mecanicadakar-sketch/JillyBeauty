import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Plus, 
  Calendar, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X,
  Layers,
  Heart,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Service, ServiceCategory } from '../types';
import { FormattedNumberInput } from './FormattedNumberInput';

interface ServicesViewProps {
  onScheduleService: (service: Service) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onScheduleService }) => {
  const { services, addService, updateService, deleteService, currentUser } = useApp();

  const isAdmin = currentUser.role === 'admin';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('facial');
  const [categoryLabel, setCategoryLabel] = useState('Tratamiento Facial');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(35);
  const [durationMin, setDurationMin] = useState<number>(60);
  const [recommendedSessions, setRecommendedSessions] = useState<number>(4);

  const categories = [
    { id: 'all', label: 'Todos los Servicios' },
    { id: 'laser', label: 'Depilación Láser' },
    { id: 'facial', label: 'Faciales & Dermaplaning' },
    { id: 'peeling', label: 'Hollywood Peel & Químicos' },
    { id: 'nails', label: 'Uñas, Manicura & Pedicura' },
    { id: 'micropigmentation', label: 'Micropigmentación' },
    { id: 'body', label: 'Masajes Reductores' },
  ];

  const filteredServices = services.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    if (!isAdmin) {
      alert('Solo la Administradora (@jilly.admin) tiene permisos para agregar nuevos servicios al catálogo.');
      return;
    }
    setEditingService(null);
    setName('');
    setCategory('facial');
    setCategoryLabel('Tratamiento Facial');
    setDescription('');
    setPrice(35);
    setDurationMin(60);
    setRecommendedSessions(3);
    setShowModal(true);
  };

  const handleOpenEdit = (srv: Service) => {
    if (!isAdmin) {
      alert('Solo la Administradora (@jilly.admin) tiene permisos para editar servicios y tarifas.');
      return;
    }
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setCategoryLabel(srv.categoryLabel);
    setDescription(srv.description);
    setPrice(srv.price);
    setDurationMin(srv.durationMin);
    setRecommendedSessions(srv.recommendedSessions || 1);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingrese el nombre del servicio.');
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        category,
        categoryLabel,
        description: description.trim(),
        price,
        durationMin,
        recommendedSessions
      });
    } else {
      addService({
        name: name.trim(),
        category,
        categoryLabel,
        description: description.trim(),
        price,
        durationMin,
        recommendedSessions,
        active: true
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Services Flyer Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#121216] via-[#1a1a22] to-[#121216] border border-[#d4af37]/40 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          {isAdmin ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#fde047] text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Modo Administrador · Edición de Servicios y Precios Habilitada (@jilly.admin)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181820] border border-[#27272a] text-zinc-300 text-xs font-semibold tracking-wider mb-3">
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Catálogo Oficial (Precios fijados por Dirección @jilly.admin)</span>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury tracking-wide">
            Catálogo Exclusivo de <span className="text-gold-gradient">Jilly Beauty Lab</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
            Protocolos de vanguardia en estética facial, corporal, láser diodo, aparatología reductiva, micropigmentación y spa de uñas.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-[#2d2d38] text-xs text-zinc-400">
            <span>✨ Profesionales Certificadas</span>
            <span>✨ Productos Médicos Premium</span>
            <span>✨ Atención 100% Personalizada</span>
          </div>
        </div>

        {/* Ambient gold glow decoration */}
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#d4af37]/10 to-transparent pointer-events-none" />
      </div>

      {/* Category Pills & Action */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#d4af37] text-black shadow-sm'
                    : 'bg-[#18181d] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Add service button: Only editable by administrator */}
          {isAdmin ? (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Agregar Servicio</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-[#181820] border border-[#27272a] text-[11px] text-zinc-400 flex items-center gap-1.5 shrink-0">
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Precios protegidos (Edición exclusiva @jilly.admin)</span>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md pt-2 border-t border-[#27272a]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción de servicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-[#131317] border border-[#27272a] hover:border-[#d4af37]/60 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                  {srv.categoryLabel}
                </span>

                <div className="flex items-center gap-1">
                  {isAdmin ? (
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="px-2 py-1 rounded-lg bg-[#1a1a22] hover:bg-[#d4af37] text-zinc-400 hover:text-black text-[11px] font-medium border border-[#27272a] hover:border-transparent transition-all flex items-center gap-1 shadow-sm"
                      title="Editar servicio y precio (Exclusivo Administrador)"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 bg-[#18181f] px-2 py-0.5 rounded-full border border-[#27272a]">
                      <Lock className="w-2.5 h-2.5 text-zinc-600" />
                      Tarifa Oficial
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors leading-snug">
                {srv.name}
              </h3>

              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {srv.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#222228] grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{srv.durationMin} minutos</span>
                </div>
                {srv.recommendedSessions && (
                  <div className="text-zinc-400 text-right">
                    <span>Recomendado: {srv.recommendedSessions} ses.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#222228] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 block">Tarifa por sesión</span>
                <span className="text-xl font-bold font-mono text-white group-hover:text-[#d4af37] transition-colors">
                  Gs. {srv.price.toLocaleString('es-PY')}
                </span>
              </div>

              <button
                onClick={() => onScheduleService(srv)}
                className="px-3.5 py-2 bg-[#1c1c24] hover:bg-[#d4af37] text-zinc-200 hover:text-black font-semibold rounded-xl text-xs border border-[#2d2d38] hover:border-transparent transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar Cita</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <h3 className="text-base font-bold text-white font-serif-luxury">
                {editingService ? 'Editar Servicio' : 'Agregar Nuevo Servicio al Spa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Peeling Enzimático Iluminador"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value as ServiceCategory;
                      setCategory(val);
                      const map: Record<ServiceCategory, string> = {
                        laser: 'Depilación Láser',
                        facial: 'Tratamiento Facial',
                        peeling: 'Peeling & Dermapen',
                        nails: 'Uñas & Manicura',
                        body: 'Masajes Reductores',
                        micropigmentation: 'Micropigmentación'
                      };
                      setCategoryLabel(map[val]);
                    }}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="laser">Depilación Láser</option>
                    <option value="facial">Tratamiento Facial</option>
                    <option value="peeling">Peeling & Dermapen</option>
                    <option value="nails">Uñas & Manicura / Pedicura</option>
                    <option value="body">Masajes Reductores / Aparatología</option>
                    <option value="micropigmentation">Micropigmentación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Etiqueta Visual</label>
                  <input
                    type="text"
                    value={categoryLabel}
                    onChange={(e) => setCategoryLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1">Descripción del Protocolo</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle beneficios, aparatología utilizada y sensaciones..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Precio (Gs.) *</label>
                  <FormattedNumberInput
                    prefix={<span className="text-[#d4af37] font-bold text-xs">Gs.</span>}
                    min={0}
                    required
                    value={price}
                    onChange={(val) => setPrice(val)}
                    className="w-full pl-9 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Duración (min) *</label>
                  <FormattedNumberInput
                    min={5}
                    required
                    value={durationMin}
                    onChange={(val) => setDurationMin(val)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Sesiones Sugeridas</label>
                  <FormattedNumberInput
                    min={1}
                    value={recommendedSessions}
                    onChange={(val) => setRecommendedSessions(val)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#252530]">
                {editingService ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar permanentemente "${editingService.name}" del catálogo?`)) {
                        deleteService(editingService.id);
                        setShowModal(false);
                      }
                    }}
                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-[#18181d] text-zinc-300 text-xs rounded-xl hover:bg-[#252530]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md"
                  >
                    {editingService ? 'Guardar Cambios' : 'Guardar en Catálogo'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
