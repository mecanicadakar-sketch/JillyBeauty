import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Layers, 
  Sparkles, 
  DollarSign, 
  History, 
  Check, 
  X,
  Edit,
  Trash2,
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { Product, ProductCategory } from '../types';

export interface InventoryViewProps {
  isAdminPanelMode?: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ isAdminPanelMode = false }) => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    adjustProductStock, 
    inventoryMovements,
    currentUser,
    setActiveTab: setGlobalActiveTab
  } = useApp();

  const isAdmin = currentUser.role === 'admin';
  const canModifyStock = isAdminPanelMode || isAdmin;

  const [showRestrictedNotice, setShowRestrictedNotice] = useState(false);

  const [activeTab, setActiveTab] = useState<'all' | 'cabin' | 'retail' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'in' | 'cabin_use' | 'out' | 'adjustment'>('in');
  const [adjustReason, setAdjustReason] = useState('');

  // New product form state
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('retail');
  const [newBrand, setNewBrand] = useState('Jilly Dermacare');
  const [newStock, setNewStock] = useState<number>(10);
  const [newMinStock, setNewMinStock] = useState<number>(5);
  const [newCostPrice, setNewCostPrice] = useState<number>(10);
  const [newSalePrice, setNewSalePrice] = useState<number>(25);
  const [newUnit, setNewUnit] = useState('unidades');
  const [newDescription, setNewDescription] = useState('');

  // Calculate statistics
  const totalItemsCount = products.length;
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalCostValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalRetailPotential = products.filter(p => p.category === 'retail').reduce((acc, p) => acc + (p.stock * p.salePrice), 0);

  // Filter products
  const filteredProducts = products.filter(p => {
    if (activeTab === 'cabin' && p.category !== 'cabin') return false;
    if (activeTab === 'retail' && p.category !== 'retail') return false;
    if (onlyLowStock && p.stock > p.minStock) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSku.trim()) {
      alert('Por favor complete el nombre y código SKU.');
      return;
    }

    addProduct({
      name: newName.trim(),
      sku: newSku.trim().toUpperCase(),
      category: newCategory,
      brand: newBrand.trim(),
      stock: newStock,
      minStock: newMinStock,
      costPrice: newCostPrice,
      salePrice: newCategory === 'retail' ? newSalePrice : newCostPrice,
      unit: newUnit,
      description: newDescription.trim() || undefined,
      active: true
    });

    // Reset form
    setShowAddModal(false);
    setNewName('');
    setNewSku('');
    setNewDescription('');
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;
    if (adjustDelta <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const sign = (adjustType === 'in' || adjustType === 'adjustment') ? 1 : -1;
    adjustProductStock(
      selectedProductForAdjust.id,
      sign * adjustDelta,
      adjustReason.trim() || (adjustType === 'in' ? 'Entrada de lote' : 'Consumo en cabina'),
      adjustType
    );

    setShowAdjustModal(false);
    setSelectedProductForAdjust(null);
    setAdjustDelta(1);
    setAdjustReason('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Mode / Advisory Banner */}
      {isAdminPanelMode ? (
        <div className="bg-gradient-to-r from-[#121216] via-[#1a1a24] to-[#121216] border border-[#d4af37]/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-serif-luxury tracking-wide">
                  Módulo de Modificación y Ajuste de Stock
                </h2>
                <span className="text-[10px] bg-[#d4af37]/20 text-[#fde047] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Panel Administrador
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Control exclusivo de Dirección: Ingreso de lotes, salida para uso en cabina, mermas, conteo físico y registro de insumos.
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-400 bg-[#16161f] border border-[#27272a] px-3.5 py-1.5 rounded-xl self-start sm:self-auto font-mono">
            Directora: <strong className="text-[#d4af37]">@{currentUser.username}</strong>
          </div>
        </div>
      ) : (
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-2">
                <span>Catálogo & Consulta de Insumos</span>
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/30">
                  Ajustes en Panel Admin
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                El ajuste de existencias y altas de insumos se realiza de forma exclusiva desde el <strong>Panel Administrador</strong>.
              </p>
            </div>
          </div>
          {isAdmin ? (
            <button
              onClick={() => setGlobalActiveTab('admin')}
              className="px-3.5 py-1.5 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 border border-[#d4af37]/40 text-[#fde047] text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Abrir Ajuste en Panel Admin</span>
            </button>
          ) : (
            <span className="text-[10px] text-zinc-500 bg-[#18181f] px-2.5 py-1 rounded-lg border border-[#27272a] shrink-0 font-medium">
              Solo lectura para personal
            </span>
          )}
        </div>
      )}

      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">Total de Productos</span>
            <span className="text-xl font-bold text-white font-mono">{totalItemsCount}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">En catálogo</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-[#2d2d38] text-[#d4af37]">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all ${
            onlyLowStock 
              ? 'bg-amber-500/20 border-amber-500/50 shadow-md' 
              : 'bg-[#121216] border-[#27272a] hover:border-amber-500/40'
          }`}
        >
          <div>
            <span className="text-[11px] text-zinc-400 block">Stock Bajo / Por Agotar</span>
            <span className={`text-xl font-bold font-mono ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {lowStockItems.length} alertas
            </span>
            <span className="text-[10px] text-amber-300/80 block mt-0.5">
              {onlyLowStock ? 'Filtrando activos' : 'Clic para filtrar'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">Valorización Insumos</span>
            <span className="text-xl font-bold text-white font-mono">${totalCostValue.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">A costo de compra</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-[#2d2d38] text-blue-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 block">Potencial Reventa</span>
            <span className="text-xl font-bold text-[#d4af37] font-mono">${totalRetailPotential.toFixed(2)}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">Productos de mostrador</span>
          </div>
          <div className="p-3 rounded-xl bg-[#1c1c24] border border-[#2d2d38] text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-[#18181d] p-1 rounded-xl border border-[#27272a] overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'all' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('cabin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'cabin' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Insumos de Cabina ({products.filter(p => p.category === 'cabin').length})
            </button>
            <button
              onClick={() => setActiveTab('retail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeTab === 'retail' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Reventa / Clientes ({products.filter(p => p.category === 'retail').length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
                activeTab === 'history' ? 'bg-[#d4af37] text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Kardex / Movimientos</span>
            </button>
          </div>

          {/* Action: Add new product */}
          {canModifyStock ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Insumo / Producto</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRestrictedNotice(true)}
              className="px-3 py-2 bg-[#17171e] text-zinc-400 border border-[#2a2a34] hover:text-amber-300 hover:border-amber-500/40 font-medium text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5"
              title="Solo el Administrador puede registrar insumos desde el Panel Administrador"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Nuevo Insumo (Panel Admin)</span>
            </button>
          )}
        </div>

        {/* Search & Low Stock Toggle */}
        {activeTab !== 'history' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#27272a]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, código SKU o marca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  onlyLowStock
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-[#18181d] border-[#27272a] text-zinc-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Solo Alertas de Stock Bajo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content: Table of Products or Movement History */}
      {activeTab === 'history' ? (
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white font-serif-luxury tracking-wide mb-3">
            Historial de Movimientos de Inventario (Kardex)
          </h3>
          {inventoryMovements.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Aún no hay movimientos registrados. Se registran automáticamente al realizar ventas o ajustes de stock.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-[#27272a]">
                    <th className="pb-2.5 font-medium">Fecha</th>
                    <th className="pb-2.5 font-medium">Producto</th>
                    <th className="pb-2.5 font-medium">Tipo</th>
                    <th className="pb-2.5 font-medium">Cantidad</th>
                    <th className="pb-2.5 font-medium">Motivo</th>
                    <th className="pb-2.5 font-medium">Responsable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222228]">
                  {inventoryMovements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-[#18181f] transition-colors">
                      <td className="py-2.5 text-zinc-400">
                        {new Date(mov.date).toLocaleDateString()} {new Date(mov.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-medium text-white">
                        {mov.productName}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          mov.type === 'in' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {mov.type === 'in' ? '+ Entrada' : mov.type === 'cabin_use' ? '- Uso Cabina' : '- Salida'}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-bold text-white">
                        {mov.quantity}
                      </td>
                      <td className="py-2.5 text-zinc-300">
                        {mov.reason}
                      </td>
                      <td className="py-2.5 text-zinc-400">
                        {mov.staffName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-3 sm:p-5">
          {/* Mobile Cards for Smartphone Screens */}
          <div className="block sm:hidden space-y-3">
            {filteredProducts.map((prod) => {
              const isLow = prod.stock <= prod.minStock;
              return (
                <div key={prod.id} className="p-3.5 bg-[#17171e] border border-[#252530] rounded-xl space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-xs">{prod.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        SKU: {prod.sku} · {prod.brand}
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${
                      prod.category === 'retail'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    }`}>
                      {prod.category === 'retail' ? 'Reventa' : 'Cabina'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#222228]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400 text-[11px]">Stock:</span>
                      <span className={`font-mono font-bold ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {prod.stock} {prod.unit}
                      </span>
                      {isLow && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded border border-amber-500/40">
                          Bajo
                        </span>
                      )}
                    </div>
                    <div>
                      {prod.category === 'retail' ? (
                        <span className="text-[#d4af37] font-bold font-mono">${prod.salePrice.toFixed(2)}</span>
                      ) : (
                        <span className="text-zinc-500 text-[10px]">Uso Interno</span>
                      )}
                    </div>
                  </div>

                  {canModifyStock ? (
                    <button
                      onClick={() => {
                        setSelectedProductForAdjust(prod);
                        setShowAdjustModal(true);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#20202a] hover:bg-[#282836] border border-[#2d2d3c] text-xs text-[#d4af37] font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Ajustar Stock / Entrada / Salida</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRestrictedNotice(true)}
                      className="w-full py-2 px-3 rounded-lg bg-[#16161c] border border-[#24242e] text-xs text-zinc-500 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Lock className="w-3 h-3 text-zinc-500" />
                      <span>Ajustar Stock (Solo Panel Admin)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-[#27272a]">
                  <th className="pb-3 font-medium">Producto / Insumo</th>
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Marca</th>
                  <th className="pb-3 font-medium">Stock Actual</th>
                  <th className="pb-3 font-medium">Costo</th>
                  <th className="pb-3 font-medium">Precio Venta</th>
                  <th className="pb-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222228]">
                {filteredProducts.map((prod) => {
                  const isLow = prod.stock <= prod.minStock;

                  return (
                    <tr key={prod.id} className="hover:bg-[#18181f] transition-colors group">
                      <td className="py-3.5 pr-3">
                        <div className="font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          SKU: {prod.sku} · {prod.unit}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          prod.category === 'retail'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        }`}>
                          {prod.category === 'retail' ? 'Reventa' : 'Cabina'}
                        </span>
                      </td>

                      <td className="py-3.5 text-zinc-300">
                        {prod.brand}
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {prod.stock}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            (Mín: {prod.minStock})
                          </span>
                          {isLow && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">
                              Bajo
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 font-mono text-zinc-300">
                        ${prod.costPrice.toFixed(2)}
                      </td>

                      <td className="py-3.5 font-mono font-semibold text-white">
                        {prod.category === 'retail' ? (
                          <span className="text-[#d4af37]">${prod.salePrice.toFixed(2)}</span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Uso Interno</span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        {canModifyStock ? (
                          <button
                            onClick={() => {
                              setSelectedProductForAdjust(prod);
                              setShowAdjustModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#1c1c24] hover:bg-[#272732] border border-[#2d2d38] text-xs text-zinc-200 transition-colors inline-flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3 text-[#d4af37]" />
                            <span>Ajustar Stock</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowRestrictedNotice(true)}
                            className="px-2.5 py-1 rounded-lg bg-[#16161c] border border-[#24242e] text-xs text-zinc-500 hover:text-amber-400 hover:border-amber-500/30 transition-colors inline-flex items-center gap-1"
                            title="Modificable solo por Dirección en Panel Administrador"
                          >
                            <Lock className="w-3 h-3 text-zinc-500" />
                            <span>Panel Admin</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New Product */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <h3 className="text-base font-bold text-white font-serif-luxury">
                Registrar Nuevo Producto o Insumo
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Nombre del Producto / Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ampolla Ácido Glicólico 30%"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. CAB-GLIC-01"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Tipo de Uso</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="cabin">Insumo de Cabina (Uso Spa)</option>
                    <option value="retail">Reventa a Clientes (Mostrador)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Marca / Proveedor</label>
                  <input
                    type="text"
                    placeholder="Ej. Jilly Dermacare"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    placeholder="unidades, ml, frascos, cajas"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    min="1"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Precio Venta al Cliente ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    disabled={newCategory === 'cabin'}
                    value={newCategory === 'cabin' ? newCostPrice : newSalePrice}
                    onChange={(e) => setNewSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Descripción / Modo de Uso</label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones o detalles de aplicación..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#18181d] text-zinc-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Stock Adjustment */}
      {showAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-serif-luxury mb-1">
              Ajustar Existencias: {selectedProductForAdjust.name}
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Stock actual: <strong className="text-white font-mono">{selectedProductForAdjust.stock} {selectedProductForAdjust.unit}</strong>
            </p>

            <form onSubmit={handleExecuteAdjust} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Tipo de Movimiento</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="in">+ Entrada de Lote (Compra / Recepción)</option>
                  <option value="cabin_use">- Salida para Uso en Cabina (Tratamiento)</option>
                  <option value="out">- Salida por Merma / Vencimiento</option>
                  <option value="adjustment">Ajuste de Conteo Físico</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Cantidad a Modificar</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Motivo / Observación</label>
                <input
                  type="text"
                  placeholder="Ej. Reposición de lote proveedor #401"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-[#18181d] text-zinc-300 text-xs rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restricted Notice */}
      {showRestrictedNotice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-[#d4af37]/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center relative">
            <button
              onClick={() => setShowRestrictedNotice(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center mx-auto mb-4 text-[#d4af37] shadow-lg shadow-[#d4af37]/20">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-white font-serif-luxury mb-2">
              Ajuste de Stock Restringido
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Por protocolo y control interno de <strong>Jilly Beauty Lab</strong>, el ajuste de existencias, entradas, salidas y modificación de insumos debe ser realizado <strong>únicamente desde el Panel Administrador</strong>.
            </p>

            <div className="p-3.5 bg-[#17171e] border border-[#27272a] rounded-xl text-left text-xs space-y-1 mb-5">
              <div className="text-[11px] text-zinc-400">
                • Usuario habilitado: <strong className="text-zinc-200">@jilly.admin</strong>
              </div>
              <div className="text-[11px] text-zinc-400">
                • Ruta de acceso: <strong className="text-[#d4af37]">Panel Administrador → Ajuste de Stock & Inventario</strong>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowRestrictedNotice(false)}
                className="flex-1 py-2.5 px-3 bg-[#1c1c24] hover:bg-[#252530] text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Entendido / Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRestrictedNotice(false);
                  setGlobalActiveTab('admin');
                }}
                className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-md shadow-[#d4af37]/20 transition-all"
              >
                Ir a Panel Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
