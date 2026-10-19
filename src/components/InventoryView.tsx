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
  Edit3,
  Trash2,
  ArrowRightLeft,
  ShieldCheck,
  Lock,
  ShieldAlert,
  CheckCircle2,
  Save,
  Tag
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { FormattedNumberInput } from './FormattedNumberInput';

export interface InventoryViewProps {
  isAdminPanelMode?: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ isAdminPanelMode = false }) => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    adjustProductStock, 
    inventoryMovements,
    currentUser,
    setActiveTab: setGlobalActiveTab
  } = useApp();

  const isAdmin = currentUser.role === 'admin' || !!currentUser.isAdminEnabled;
  const canModifyStock = isAdminPanelMode || isAdmin;

  const [showRestrictedNotice, setShowRestrictedNotice] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  const [activeTab, setActiveTab] = useState<'all' | 'cabin' | 'retail' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Adjust stock state
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'in' | 'cabin_use' | 'out' | 'adjustment' | 'set_exact'>('in');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustProductName, setAdjustProductName] = useState('');
  const [adjustSalePrice, setAdjustSalePrice] = useState<number>(0);
  const [adjustCostPrice, setAdjustCostPrice] = useState<number>(0);
  const [adjustExactStock, setAdjustExactStock] = useState<number>(0);

  const handleOpenAdjustStock = (prod: Product) => {
    setSelectedProductForAdjust(prod);
    setAdjustProductName(prod.name);
    setAdjustSalePrice(prod.salePrice);
    setAdjustCostPrice(prod.costPrice);
    setAdjustExactStock(prod.stock);
    setAdjustDelta(1);
    setAdjustType('in');
    setAdjustReason('');
    setShowAdjustModal(true);
  };

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

  // Edit product form state (Edit Name, Price, Cost, Stock, etc.)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState<ProductCategory>('retail');
  const [editBrand, setEditBrand] = useState('');
  const [editStock, setEditStock] = useState<number>(0);
  const [editMinStock, setEditMinStock] = useState<number>(5);
  const [editCostPrice, setEditCostPrice] = useState<number>(0);
  const [editSalePrice, setEditSalePrice] = useState<number>(0);
  const [editUnit, setEditUnit] = useState('unidades');
  const [editDescription, setEditDescription] = useState('');

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

    setShowAddModal(false);
    setSaveToast(`✓ Insumo / Producto "${newName.trim()}" registrado en el inventario.`);
    setTimeout(() => setSaveToast(''), 4500);

    // Reset form
    setNewName('');
    setNewSku('');
    setNewDescription('');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditSku(prod.sku);
    setEditCategory(prod.category);
    setEditBrand(prod.brand);
    setEditStock(prod.stock);
    setEditMinStock(prod.minStock);
    setEditCostPrice(prod.costPrice);
    setEditSalePrice(prod.salePrice);
    setEditUnit(prod.unit);
    setEditDescription(prod.description || '');
    setShowEditModal(true);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim()) {
      alert('Por favor ingrese el nombre del producto.');
      return;
    }

    const finalSalePrice = editCategory === 'retail' ? (Number(editSalePrice) || 0) : (Number(editCostPrice) || 0);

    updateProduct(editingProduct.id, {
      name: editName.trim(),
      sku: editSku.trim().toUpperCase(),
      category: editCategory,
      brand: editBrand.trim(),
      stock: Number(editStock) || 0,
      minStock: Number(editMinStock) || 1,
      costPrice: Number(editCostPrice) || 0,
      salePrice: finalSalePrice,
      unit: editUnit.trim() || 'unidades',
      description: editDescription.trim() || undefined
    });

    setShowEditModal(false);
    setSaveToast(`✓ Cambios guardados para "${editName.trim()}". Precio de venta: Gs. ${finalSalePrice.toLocaleString('es-PY')}.`);
    setTimeout(() => setSaveToast(''), 4500);
  };

  const handleDeleteProduct = (prod: Product) => {
    if (confirm(`¿Confirma eliminar definitivamente "${prod.name}" del inventario? Esta acción no se puede deshacer.`)) {
      deleteProduct(prod.id);
      setShowEditModal(false);
      setSaveToast(`Producto "${prod.name}" eliminado del inventario.`);
      setTimeout(() => setSaveToast(''), 3500);
    }
  };

  const handleExecuteAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    const trimmedName = adjustProductName.trim() || selectedProductForAdjust.name;
    const finalSale = selectedProductForAdjust.category === 'retail' 
      ? (Number(adjustSalePrice) >= 0 ? Number(adjustSalePrice) : selectedProductForAdjust.salePrice)
      : (Number(adjustCostPrice) >= 0 ? Number(adjustCostPrice) : selectedProductForAdjust.costPrice);
    const finalCost = Number(adjustCostPrice) >= 0 ? Number(adjustCostPrice) : selectedProductForAdjust.costPrice;

    // 1. Guardar cambios de Nombre, Precio de Venta y Costo
    updateProduct(selectedProductForAdjust.id, {
      name: trimmedName,
      salePrice: finalSale,
      costPrice: finalCost
    });

    // 2. Aplicar ajuste de stock según el modo seleccionado
    if (adjustType === 'set_exact') {
      const diff = adjustExactStock - selectedProductForAdjust.stock;
      if (diff !== 0) {
        adjustProductStock(
          selectedProductForAdjust.id,
          diff,
          adjustReason.trim() || `Conteo físico fijado a ${adjustExactStock} ${selectedProductForAdjust.unit}`,
          'adjustment'
        );
      }
    } else if (adjustDelta > 0) {
      const sign = (adjustType === 'in' || adjustType === 'adjustment') ? 1 : -1;
      adjustProductStock(
        selectedProductForAdjust.id,
        sign * adjustDelta,
        adjustReason.trim() || (adjustType === 'in' ? 'Entrada de lote' : adjustType === 'cabin_use' ? 'Uso en cabina' : 'Merma / Salida'),
        adjustType
      );
    }

    setShowAdjustModal(false);
    setSelectedProductForAdjust(null);
    setAdjustDelta(1);
    setAdjustReason('');

    setSaveToast(`✓ Guardado con éxito: "${trimmedName}" · Precio: Gs. ${finalSale.toLocaleString('es-PY')} · Stock actualizado.`);
    setTimeout(() => setSaveToast(''), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/70 to-emerald-900/40 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{saveToast}</span>
          </div>
          <button 
            onClick={() => setSaveToast('')} 
            className="text-emerald-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
                  Gestión de Stock, Precios & Catálogo de Insumos
                </h2>
                <span className="text-[10px] bg-[#d4af37]/20 text-[#fde047] border border-[#d4af37]/50 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Panel Administrador
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Control exclusivo de Dirección: <strong>Edición de nombres y precios de venta (Gs.)</strong>, costo, ajustes de stock físico, entradas de lotes y mermas.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Edición directa de Nombre y Precio en cada producto o con el botón "Editar Precio & Nombre"</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nuevo Producto / Insumo</span>
          </button>
        </div>
      ) : (
        /* Regular Inventory View Banner */
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-lg">
          <div>
            <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide flex items-center gap-2">
              <span>Inventario, Stock & Insumos</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#e5c158] font-sans font-medium">
                {totalItemsCount} referencias
              </span>
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Control de productos de reventa y cosmecéuticos de cabina para tratamientos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canModifyStock ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-bold text-xs rounded-xl hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Nuevo Producto</span>
              </button>
            ) : (
              <button
                onClick={() => setShowRestrictedNotice(true)}
                className="px-3 py-1.5 bg-[#17171e] text-zinc-400 border border-[#2a2a34] hover:text-amber-300 hover:border-amber-500/40 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Modificar Insumos (Panel Admin)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Total Referencias</span>
            <Package className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-serif-luxury text-white">
            {totalItemsCount}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Cabina + Reventa
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Alertas Stock Bajo</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-serif-luxury ${lowStockItems.length > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Por debajo del mínimo
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Valor Costo en Almacén</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            Gs. {totalCostValue.toLocaleString('es-PY')}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Inversión en existencias
          </div>
        </div>

        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
            <span>Potencial Reventa</span>
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#fde047]">
            Gs. {totalRetailPotential.toLocaleString('es-PY')}
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Mostrador al público
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'bg-[#18181d] text-zinc-400 hover:text-white border border-[#27272a]'
              }`}
            >
              Todos ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('retail')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'retail'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'bg-[#18181d] text-zinc-400 hover:text-white border border-[#27272a]'
              }`}
            >
              Reventa / Mostrador ({products.filter(p => p.category === 'retail').length})
            </button>

            <button
              onClick={() => setActiveTab('cabin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'cabin'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'bg-[#18181d] text-zinc-400 hover:text-white border border-[#27272a]'
              }`}
            >
              Uso en Cabina ({products.filter(p => p.category === 'cabin').length})
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#d4af37] text-black shadow-sm'
                  : 'bg-[#18181d] text-zinc-400 hover:text-white border border-[#27272a]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Kardex / Movimientos ({inventoryMovements.length})</span>
            </button>
          </div>
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
                <span>Solo Alertas de Stock Bajo ({lowStockItems.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content: Table of Products or Movement History */}
      {activeTab === 'history' ? (
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-lg">
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
                      <td className="py-2.5 text-zinc-400 font-mono text-[11px]">
                        {new Date(mov.date).toLocaleDateString()} {new Date(mov.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 font-semibold text-white">
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
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-3 sm:p-5 shadow-lg">
          {/* Mobile Cards for Smartphone Screens */}
          <div className="block sm:hidden space-y-3">
            {filteredProducts.map((prod) => {
              const isLow = prod.stock <= prod.minStock;
              return (
                <div key={prod.id} className="p-3.5 bg-[#17171e] border border-[#252530] rounded-xl space-y-2.5 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => canModifyStock && handleOpenEditProduct(prod)}
                      className="text-left group/mname flex-1"
                      title={canModifyStock ? "Click para editar nombre y precio" : undefined}
                    >
                      <div className="font-bold text-white text-xs group-hover/mname:text-[#d4af37] transition-colors flex items-center gap-1.5">
                        <span>{prod.name}</span>
                        {canModifyStock && <Edit3 className="w-3 h-3 text-[#d4af37] opacity-80" />}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        SKU: {prod.sku} · {prod.brand}
                      </div>
                    </button>
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
                        <button
                          type="button"
                          onClick={() => canModifyStock && handleOpenEditProduct(prod)}
                          className="text-right group/mprice"
                          title={canModifyStock ? "Click para editar precio" : undefined}
                        >
                          <span className="text-[#fde047] font-bold font-mono text-sm group-hover/mprice:underline flex items-center justify-end gap-1">
                            Gs. {prod.salePrice.toLocaleString('es-PY')}
                            {canModifyStock && <Edit3 className="w-3 h-3 text-[#d4af37]" />}
                          </span>
                          <span className="text-[9.5px] text-zinc-500 block">Costo: Gs. {prod.costPrice.toLocaleString('es-PY')}</span>
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="text-zinc-400 text-[11px] font-mono">Costo: Gs. {prod.costPrice.toLocaleString('es-PY')}</span>
                          <span className="text-zinc-500 text-[9.5px] block">Uso Interno</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {canModifyStock ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="py-2 px-2.5 rounded-lg bg-[#222230] hover:bg-[#2c2c40] border border-[#d4af37]/60 text-xs text-[#fde047] font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-sm"
                        title="Editar nombre y precio de venta"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Editar Precio / Nombre</span>
                      </button>

                      <button
                        onClick={() => handleOpenAdjustStock(prod)}
                        className="py-2 px-2.5 rounded-lg bg-[#1a1a24] hover:bg-[#242432] border border-[#2d2d3c] text-xs text-zinc-200 font-medium flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                        title="Ajustar existencias, precio y nombre"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-[#d4af37]" />
                        <span>Ajustar Stock</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRestrictedNotice(true)}
                      className="w-full py-2 px-3 rounded-lg bg-[#16161c] border border-[#24242e] text-xs text-zinc-500 hover:text-amber-400 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Lock className="w-3 h-3 text-zinc-500" />
                      <span>Modificar (Solo Panel Admin)</span>
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
                  <th className="pb-3 font-medium">Costo (Gs.)</th>
                  <th className="pb-3 font-medium">Precio Venta (Gs.)</th>
                  <th className="pb-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222228]">
                {filteredProducts.map((prod) => {
                  const isLow = prod.stock <= prod.minStock;

                  return (
                    <tr key={prod.id} className="hover:bg-[#18181f] transition-colors group">
                      <td className="py-3.5 pr-3">
                        {canModifyStock ? (
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="font-semibold text-white hover:text-[#d4af37] transition-colors flex items-center gap-1.5 text-left group/tname"
                            title="Click para editar nombre y precio del producto"
                          >
                            <span>{prod.name}</span>
                            <Edit3 className="w-3 h-3 text-[#d4af37] opacity-60 group-hover/tname:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <div className="font-semibold text-white">
                            {prod.name}
                          </div>
                        )}
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
                          <span className="text-[10px] text-zinc-500 font-mono">
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
                        Gs. {prod.costPrice.toLocaleString('es-PY')}
                      </td>

                      <td className="py-3.5 font-mono">
                        {prod.category === 'retail' ? (
                          canModifyStock ? (
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2 py-1 rounded-lg bg-[#181822] hover:bg-[#20202e] border border-[#d4af37]/40 hover:border-[#d4af37] flex items-center gap-1.5 transition-all group/price"
                              title="Click para editar precio de venta"
                            >
                              <span className="text-[#fde047] font-bold text-xs">Gs. {prod.salePrice.toLocaleString('es-PY')}</span>
                              <Edit3 className="w-3 h-3 text-[#d4af37] opacity-60 group-hover/price:opacity-100 transition-opacity" />
                            </button>
                          ) : (
                            <span className="text-[#fde047] font-bold">Gs. {prod.salePrice.toLocaleString('es-PY')}</span>
                          )
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Uso Interno</span>
                        )}
                      </td>

                      <td className="py-3.5 text-right">
                        {canModifyStock ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Name & Price Button */}
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#222230] hover:bg-[#2c2c40] border border-[#d4af37]/60 text-xs text-[#fde047] font-semibold transition-all inline-flex items-center gap-1.5 hover:brightness-110 shadow-sm"
                              title="Editar nombre, precio de venta, costo y datos del producto"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span>Editar Precio & Nombre</span>
                            </button>

                            {/* Adjust stock button */}
                            <button
                              onClick={() => handleOpenAdjustStock(prod)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1c1c24] hover:bg-[#272732] border border-[#2d2d38] text-xs text-zinc-200 hover:text-white transition-colors inline-flex items-center gap-1.5"
                              title="Ajustar existencias físicas, precio y nombre"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5 text-[#d4af37]" />
                              <span>Ajustar Stock</span>
                            </button>
                          </div>
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

      {/* MODAL 1: Edit Product (Name, Sale Price, Cost, Category, Sku, Stock) */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Editar Datos y Precio del Producto
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    SKU: <span className="font-mono text-zinc-300">{editingProduct.sku}</span> · Modificación en tiempo real
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowEditModal(false)} 
                className="w-8 h-8 rounded-lg bg-[#181820] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1">
                  Nombre del Producto / Insumo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ampolla Ácido Glicólico 30%"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#17171e] border border-[#27272a] focus:border-[#d4af37] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none font-medium"
                />
              </div>

              {/* Prices Section (Highlighted for easy editing) */}
              <div className="p-3.5 bg-gradient-to-r from-[#171722] to-[#13131a] border border-[#d4af37]/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#fde047] flex items-center gap-1.5 uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-[#d4af37]" />
                    <span>Precios & Tarifa Comercial</span>
                  </span>
                  {editCategory === 'retail' && editSalePrice > editCostPrice && (
                    <span className="text-[10.5px] text-emerald-400 font-mono font-semibold">
                      Margen: +Gs. {(editSalePrice - editCostPrice).toLocaleString('es-PY')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Precio de Venta al Cliente (Gs.) *
                    </label>
                    <FormattedNumberInput
                      prefix={<span className="text-[#d4af37] font-bold text-xs">Gs.</span>}
                      required={editCategory === 'retail'}
                      disabled={editCategory === 'cabin'}
                      value={editCategory === 'cabin' ? editCostPrice : editSalePrice}
                      onChange={(val) => setEditSalePrice(val)}
                      className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#d4af37]/50 rounded-lg text-sm text-[#fde047] font-mono font-bold focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      {editCategory === 'retail' ? 'Precio facturado en caja mostrador' : 'Para insumos de cabina no aplica venta'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Costo Unitario de Compra (Gs.)
                    </label>
                    <FormattedNumberInput
                      prefix={<span className="text-zinc-400 font-bold text-xs">Gs.</span>}
                      value={editCostPrice}
                      onChange={(val) => setEditCostPrice(val)}
                      className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-sm text-zinc-200 font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Costo de reposición por unidad
                    </span>
                  </div>
                </div>
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Código SKU / Referencia *</label>
                  <input
                    type="text"
                    required
                    value={editSku}
                    onChange={(e) => setEditSku(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Tipo de Uso</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="retail">Reventa a Clientes (Mostrador)</option>
                    <option value="cabin">Insumo de Cabina (Uso Spa)</option>
                  </select>
                </div>
              </div>

              {/* Brand & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Marca / Laboratorio</label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    placeholder="unidades, ml, frascos, cajas"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Stock Base & MinStock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Existencia / Stock Actual</label>
                  <FormattedNumberInput
                    value={editStock}
                    min={0}
                    onChange={(val) => setEditStock(val)}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Stock Mínimo (Alerta de Reposición)</label>
                  <FormattedNumberInput
                    value={editMinStock}
                    min={1}
                    onChange={(val) => setEditMinStock(val)}
                    className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] text-zinc-300 mb-1">Descripción / Modo de Uso</label>
                <textarea
                  rows={2}
                  placeholder="Detalles del producto o especificaciones de cabina..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#17171e] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#252530] flex flex-col-reverse sm:flex-row justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct)}
                  className="px-3 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Producto</span>
                </button>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-[#181820] text-zinc-400 hover:text-white rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-lg shadow-[#d4af37]/25 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Cambios del Producto</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Product */}
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
                    <option value="retail">Reventa a Clientes (Mostrador)</option>
                    <option value="cabin">Insumo de Cabina (Uso Spa)</option>
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
                  <FormattedNumberInput
                    value={newStock}
                    min={0}
                    onChange={(val) => setNewStock(val)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Stock Mínimo (Alerta)</label>
                  <FormattedNumberInput
                    value={newMinStock}
                    min={1}
                    onChange={(val) => setNewMinStock(val)}
                    className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Costo Unitario (Gs.)</label>
                  <FormattedNumberInput
                    prefix={<span className="text-zinc-400 font-bold text-xs">Gs.</span>}
                    value={newCostPrice}
                    onChange={(val) => setNewCostPrice(val)}
                    className="w-full pl-9 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1">Precio Venta al Cliente (Gs.)</label>
                  <FormattedNumberInput
                    prefix={<span className="text-[#d4af37] font-bold text-xs">Gs.</span>}
                    disabled={newCategory === 'cabin'}
                    value={newCategory === 'cabin' ? newCostPrice : newSalePrice}
                    onChange={(val) => setNewSalePrice(val)}
                    className="w-full pl-9 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#d4af37] disabled:opacity-50"
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

      {/* MODAL 3: Stock, Price & Name Adjustment */}
      {showAdjustModal && selectedProductForAdjust && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-[#121216] border border-[#d4af37]/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272a] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37]">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-serif-luxury">
                    Ajuste de Stock, Precio & Nombre
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    SKU: {selectedProductForAdjust.sku} · {selectedProductForAdjust.brand}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-lg bg-[#181820] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAdjust} className="space-y-4 text-xs">
              {/* Product Name (Direct Edit) */}
              <div className="p-3 bg-[#171720] border border-[#2c2c3a] rounded-xl space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-200">
                  Nombre del Producto / Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={adjustProductName}
                  onChange={(e) => setAdjustProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#d4af37]/50 focus:border-[#d4af37] rounded-xl text-sm text-white font-semibold focus:outline-none"
                  placeholder="Nombre comercial del producto"
                />
              </div>

              {/* Price & Cost Box (Highlighted in Gold) */}
              <div className="p-3.5 bg-gradient-to-r from-[#1c1c28] to-[#14141e] border border-[#d4af37]/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#fde047] flex items-center gap-1.5 uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 text-[#d4af37]" />
                    <span>Modificar Precios de Venta y Costo</span>
                  </span>
                  {selectedProductForAdjust.category === 'retail' && adjustSalePrice > adjustCostPrice && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Margen: +Gs. {(adjustSalePrice - adjustCostPrice).toLocaleString('es-PY')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Precio de Venta (Gs.) *
                    </label>
                    <FormattedNumberInput
                      prefix={<span className="text-[#d4af37] font-bold text-xs">Gs.</span>}
                      required={selectedProductForAdjust.category === 'retail'}
                      disabled={selectedProductForAdjust.category === 'cabin'}
                      value={selectedProductForAdjust.category === 'cabin' ? adjustCostPrice : adjustSalePrice}
                      onChange={(val) => setAdjustSalePrice(val)}
                      className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#d4af37]/60 focus:border-[#d4af37] rounded-lg text-sm text-[#fde047] font-mono font-bold focus:outline-none disabled:opacity-50"
                    />
                    <span className="text-[10px] text-zinc-400 mt-0.5 block">
                      {selectedProductForAdjust.category === 'retail' ? 'Precio al público en caja' : 'Insumo de cabina (sin precio público)'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Costo Unitario (Gs.)
                    </label>
                    <FormattedNumberInput
                      prefix={<span className="text-zinc-400 font-bold text-xs">Gs.</span>}
                      value={adjustCostPrice}
                      onChange={(val) => setAdjustCostPrice(val)}
                      className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-[#27272a] focus:border-[#d4af37] rounded-lg text-sm text-zinc-200 font-mono focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-500 mt-0.5 block">
                      Costo de compra o reposición
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock Movement Box */}
              <div className="p-3.5 bg-[#171720] border border-[#272732] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
                    <span>Ajuste de Existencias Físicas</span>
                  </span>
                  <span className="text-[11px] text-zinc-300 font-mono">
                    Stock actual: <strong className="text-emerald-400 font-bold">{selectedProductForAdjust.stock} {selectedProductForAdjust.unit}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Operación de Inventario
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="set_exact">= Fijar Conteo Físico Total Exacto (Sobreescribir stock)</option>
                    <option value="in">+ Entrada de Lote (Compra / Recepción)</option>
                    <option value="cabin_use">- Salida para Uso en Cabina (Tratamiento)</option>
                    <option value="out">- Salida por Merma / Vencimiento</option>
                    <option value="adjustment">Ajuste de Conteo Físico (+/-)</option>
                  </select>
                </div>

                {adjustType === 'set_exact' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                      Nuevo Stock Total Exacto ({selectedProductForAdjust.unit})
                    </label>
                    <FormattedNumberInput
                      value={adjustExactStock}
                      min={0}
                      required
                      onChange={(val) => setAdjustExactStock(val)}
                      className="w-full px-3 py-2 bg-[#121216] border border-amber-500/60 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[10.5px] text-zinc-400 mt-1 block">
                      Diferencia resultante: {adjustExactStock - selectedProductForAdjust.stock >= 0 ? `+${adjustExactStock - selectedProductForAdjust.stock}` : adjustExactStock - selectedProductForAdjust.stock} {selectedProductForAdjust.unit}
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Cantidad a Modificar ({selectedProductForAdjust.unit})
                    </label>
                    <FormattedNumberInput
                      value={adjustDelta}
                      min={0}
                      required
                      onChange={(val) => setAdjustDelta(val)}
                      className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Motivo / Observación del Movimiento</label>
                  <input
                    type="text"
                    placeholder="Ej. Actualización de precio y conteo físico"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#121216] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#252530] gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedProductForAdjust;
                    setShowAdjustModal(false);
                    handleOpenEditProduct(target);
                  }}
                  className="px-3 py-2 bg-[#1c1c26] hover:bg-[#252534] border border-[#2e2e3c] text-zinc-300 hover:text-white text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Ficha Completa</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 bg-[#181820] text-zinc-400 hover:text-white rounded-xl text-xs"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 active:scale-98 transition-all shadow-md shadow-[#d4af37]/20 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar Nombre, Precio & Stock</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Restricted Notice */}
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
              Modificación de Stock Restringida
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Por protocolo y control interno de <strong>Jilly Beauty Lab</strong>, el ajuste de existencias, precios y modificación de insumos debe ser realizado <strong>únicamente desde el Panel Administrador</strong>.
            </p>

            <div className="p-3.5 bg-[#17171e] border border-[#27272a] rounded-xl text-left text-xs space-y-1 mb-5">
              <div className="text-[11px] text-zinc-400">
                • Usuario habilitado: <strong className="text-zinc-200">@jilly.admin</strong>
              </div>
              <div className="text-[11px] text-zinc-400">
                • Ruta de acceso: <strong className="text-[#d4af37]">Panel Administrador → Ajuste de Stock & Insumos</strong>
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
