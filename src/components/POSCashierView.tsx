import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Receipt, 
  Wallet, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft, 
  Check, 
  AlertCircle, 
  DollarSign, 
  Sparkles, 
  Package, 
  User, 
  Phone, 
  FileText,
  Clock,
  Printer,
  XCircle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { SaleItem, PaymentMethod, Service, Product } from '../types';
import { ReceiptModal } from './ReceiptModal';
import { FormattedNumberInput } from './FormattedNumberInput';

export const POSCashierView: React.FC = () => {
  const { 
    services, 
    products, 
    staffList, 
    currentUser, 
    cashShift, 
    openCashShift, 
    closeCashShift, 
    addCashMovement, 
    completeSale, 
    sales, 
    checkoutAppointment, 
    setCheckoutAppointment,
    lastCompletedSale,
    setLastCompletedSale,
    clients
  } = useApp();

  // Active ticket / cart state
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Catalog item filter
  const [itemTab, setItemTab] = useState<'services' | 'products'>('services');
  const [searchItem, setSearchItem] = useState('');
  // Mobile screen tab switcher (Catalog vs Ticket)
  const [mobilePosTab, setMobilePosTab] = useState<'catalog' | 'ticket'>('catalog');

  // Modals for cash drawer
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [openingAmountInput, setOpeningAmountInput] = useState('100.00');
  const [countedCashInput, setCountedCashInput] = useState('');
  const [expenseAmountInput, setExpenseAmountInput] = useState('');
  const [expenseReasonInput, setExpenseReasonInput] = useState('');

  // Auto load checkout appointment if passed from agenda
  useEffect(() => {
    if (checkoutAppointment) {
      setClientName(checkoutAppointment.clientName);
      setClientPhone(checkoutAppointment.clientPhone);
      setCartItems([
        {
          id: checkoutAppointment.serviceId,
          type: 'service',
          name: checkoutAppointment.serviceName,
          quantity: 1,
          unitPrice: checkoutAppointment.servicePrice,
          total: checkoutAppointment.servicePrice,
          specialistId: checkoutAppointment.specialistId,
          specialistName: checkoutAppointment.specialistName
        }
      ]);
      setMobilePosTab('ticket');
    }
  }, [checkoutAppointment]);

  // Cart calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const finalDiscount = Math.min(discount, subtotal);
  const total = Math.max(0, subtotal - finalDiscount);

  const numCashReceived = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, numCashReceived - total);

  // Add item to cart
  const handleAddService = (srv: Service) => {
    const defaultSpecialist = staffList.find(s => s.role === 'specialist') || staffList[0];
    
    setCartItems(prev => {
      const existing = prev.find(i => i.id === srv.id && i.type === 'service');
      if (existing) {
        return prev.map(i => i.id === srv.id && i.type === 'service' 
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } 
          : i
        );
      }
      return [
        ...prev,
        {
          id: srv.id,
          type: 'service',
          name: srv.name,
          quantity: 1,
          unitPrice: srv.price,
          total: srv.price,
          specialistId: defaultSpecialist?.id,
          specialistName: defaultSpecialist?.name
        }
      ];
    });
  };

  const handleAddProduct = (prod: Product) => {
    if (prod.stock <= 0) {
      alert(`El producto "${prod.name}" no tiene existencias disponibles en inventario.`);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.id === prod.id && i.type === 'product');
      if (existing) {
        if (existing.quantity >= prod.stock) {
          alert(`No hay más stock disponible de ${prod.name} (Máx: ${prod.stock})`);
          return prev;
        }
        return prev.map(i => i.id === prod.id && i.type === 'product'
          ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
          : i
        );
      }
      return [
        ...prev,
        {
          id: prod.id,
          type: 'product',
          name: prod.name,
          quantity: 1,
          unitPrice: prod.salePrice,
          total: prod.salePrice
        }
      ];
    });
  };

  const updateItemQty = (index: number, delta: number) => {
    setCartItems(prev => {
      const updated = [...prev];
      const item = updated[index];
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }

      // Check stock limit if product
      if (item.type === 'product') {
        const prod = products.find(p => p.id === item.id);
        if (prod && newQty > prod.stock) {
          alert(`Stock insuficiente de ${item.name}`);
          return prev;
        }
      }

      updated[index] = {
        ...item,
        quantity: newQty,
        total: newQty * item.unitPrice
      };
      return updated;
    });
  };

  const updateItemSpecialist = (index: number, specialistId: string) => {
    const spec = staffList.find(s => s.id === specialistId);
    if (!spec) return;
    setCartItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        specialistId: spec.id,
        specialistName: spec.name
      };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCartItems([]);
    setClientName('');
    setClientPhone('');
    setDiscount(0);
    setCashReceived('');
    setPaymentReference('');
    setNotes('');
    setCheckoutAppointment(null);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Agregue al menos un servicio o producto al ticket de cobro.');
      return;
    }

    if (!clientName.trim()) {
      alert('Por favor ingrese el nombre del cliente.');
      return;
    }

    if (cashShift.status === 'closed') {
      alert('La caja del día está cerrada. Debe abrir la caja antes de registrar cobros.');
      setShowOpenModal(true);
      return;
    }

    completeSale({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      items: cartItems,
      subtotal,
      discount: finalDiscount,
      tax: 0,
      total,
      paymentMethod,
      paymentReference: paymentReference.trim() || undefined,
      appointmentId: checkoutAppointment?.id,
      notes: notes.trim() || undefined
    });

    clearCart();
  };

  // Expected in drawer
  const expectedCashInDrawer = cashShift.openingAmount + cashShift.cashSales - cashShift.expenses;

  return (
    <div className="space-y-6">
      {/* Cash Drawer Status Bar */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${
            cashShift.status === 'open' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <Wallet className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-serif-luxury tracking-wide">
                Caja Registradora del Día
              </h3>
              <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                cashShift.status === 'open'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {cashShift.status === 'open' ? 'Caja Abierta' : 'Caja Cerrada'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Responsable actual: <strong className="text-zinc-200">{currentUser.name}</strong> · Base inicial: Gs. {cashShift.openingAmount.toLocaleString('es-PY')}
            </p>
          </div>
        </div>

        {/* Cash Drawer Metrics & Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="px-3 py-2 rounded-xl bg-[#18181d] border border-[#27272a] text-xs">
            <span className="text-zinc-400 block text-[10px]">Efectivo en Gaveta</span>
            <span className="font-bold text-[#d4af37] text-sm font-mono">
              Gs. {expectedCashInDrawer.toLocaleString('es-PY')}
            </span>
          </div>

          <div className="px-3 py-2 rounded-xl bg-[#18181d] border border-[#27272a] text-xs">
            <span className="text-zinc-400 block text-[10px]">Tarjetas / Transferencias</span>
            <span className="font-bold text-blue-400 text-sm font-mono">
              Gs. {(cashShift.cardSales + cashShift.transferSales).toLocaleString('es-PY')}
            </span>
          </div>

          {cashShift.status === 'open' ? (
            <div className="col-span-2 sm:col-auto flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex-1 sm:flex-none px-3 py-2 bg-[#1c1c24] hover:bg-[#252530] text-zinc-200 text-xs font-medium rounded-xl border border-[#2d2d38] transition-colors text-center"
              >
                + Gasto de Caja
              </button>

              <button
                onClick={() => setShowCloseModal(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition-colors text-center"
              >
                Cerrar Caja (Arqueo)
              </button>
            </div>
          ) : (
            <div className="col-span-2 sm:col-auto w-full sm:w-auto">
              <button
                onClick={() => setShowOpenModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold text-xs rounded-xl hover:brightness-110 shadow-md transition-all text-center"
              >
                Apertura de Caja
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Screen Segmented Selector for POS */}
      <div className="flex lg:hidden items-center bg-[#141418] border border-[#27272a] p-1 rounded-xl mb-3">
        <button
          onClick={() => setMobilePosTab('catalog')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobilePosTab === 'catalog'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1. Catálogo</span>
        </button>
        <button
          onClick={() => setMobilePosTab('ticket')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all relative ${
            mobilePosTab === 'ticket'
              ? 'bg-[#d4af37] text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>2. Ticket ({cartItems.length})</span>
          {cartItems.length > 0 && (
            <span className="text-[10px] font-bold bg-black text-[#d4af37] px-1.5 py-0.2 rounded-full">
              Gs. {total.toLocaleString('es-PY')}
            </span>
          )}
        </button>
      </div>

      {/* Main POS Interface: Catalog (Left) + Ticket (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Services & Retail Products Selector (7 cols) */}
        <div className={`lg:col-span-7 space-y-4 ${mobilePosTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-4 sm:p-5">
            {/* Catalog Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
              <div className="flex items-center gap-1.5 bg-[#18181d] p-1 rounded-xl border border-[#27272a]">
                <button
                  onClick={() => setItemTab('services')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    itemTab === 'services'
                      ? 'bg-[#d4af37] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Servicios del Spa</span>
                </button>
                <button
                  onClick={() => setItemTab('products')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    itemTab === 'products'
                      ? 'bg-[#d4af37] text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Productos Reventa</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Buscar servicio o producto..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="px-3.5 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Catalog Grid */}
            <div className="pt-4 max-h-[520px] overflow-y-auto pr-1">
              {itemTab === 'services' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services
                    .filter(s => s.active && (
                      searchItem === '' || 
                      s.name.toLowerCase().includes(searchItem.toLowerCase()) ||
                      s.categoryLabel.toLowerCase().includes(searchItem.toLowerCase())
                    ))
                    .map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => handleAddService(srv)}
                        className="bg-[#18181d] border border-[#27272a] hover:border-[#d4af37]/60 hover:bg-[#1f1f26] rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] text-[#d4af37] font-semibold uppercase tracking-wider">
                              {srv.categoryLabel}
                            </span>
                            <span className="text-xs font-mono font-bold text-white group-hover:text-[#d4af37]">
                              Gs. {srv.price.toLocaleString('es-PY')}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-white mt-1 group-hover:text-amber-200 line-clamp-1">
                            {srv.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                            {srv.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800 text-[10px] text-zinc-400">
                          <span>{srv.durationMin} min</span>
                          <span className="text-[#d4af37] font-medium group-hover:underline">
                            + Agregar al Ticket
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {products
                    .filter(p => p.category === 'retail' && p.active && (
                      searchItem === '' || 
                      p.name.toLowerCase().includes(searchItem.toLowerCase()) ||
                      p.brand.toLowerCase().includes(searchItem.toLowerCase())
                    ))
                    .map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => handleAddProduct(prod)}
                        className={`bg-[#18181d] border rounded-xl p-3 transition-all flex flex-col justify-between ${
                          prod.stock <= 0
                            ? 'opacity-50 border-zinc-800 cursor-not-allowed'
                            : 'border-[#27272a] hover:border-[#d4af37]/60 hover:bg-[#1f1f26] cursor-pointer group'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] text-zinc-400 font-mono">
                              SKU: {prod.sku}
                            </span>
                            <span className="text-xs font-mono font-bold text-white group-hover:text-[#d4af37]">
                              Gs. {prod.salePrice.toLocaleString('es-PY')}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-white mt-1 group-hover:text-amber-200 line-clamp-1">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {prod.brand}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800 text-[10px]">
                          <span className={prod.stock <= prod.minStock ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                            Stock: {prod.stock} {prod.unit}
                          </span>
                          <span className="text-[#d4af37] font-medium group-hover:underline">
                            + Agregar
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile floating button to view ticket when cart is not empty */}
          {cartItems.length > 0 && mobilePosTab === 'catalog' && (
            <div className="lg:hidden sticky bottom-20 z-20 pt-2 pb-1">
              <button
                onClick={() => setMobilePosTab('ticket')}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#d4af37] via-[#dfba48] to-[#aa820a] text-black font-bold rounded-xl shadow-2xl flex items-center justify-between border border-[#fef08a]/60 active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black/20 text-black flex items-center justify-center text-xs font-black">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                  <span className="text-sm font-semibold">Ver Ticket de Cobro</span>
                </div>
                <span className="font-mono text-sm tracking-tight">Gs. {total.toLocaleString('es-PY')} &rarr;</span>
              </button>
            </div>
          )}

          {/* Quick Notice */}
          {checkoutAppointment && (
            <div className="p-3 bg-[#d4af37]/10 border border-[#d4af37]/40 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#d4af37]" />
                <span>
                  Cobrando cita agendada de <strong>{checkoutAppointment.clientName}</strong> ({checkoutAppointment.serviceName})
                </span>
              </div>
              <button
                onClick={() => setCheckoutAppointment(null)}
                className="text-[11px] text-zinc-400 hover:text-white underline"
              >
                Desvincular
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Ticket & Point of Sale (5 cols) */}
        <div className={`lg:col-span-5 space-y-4 ${mobilePosTab === 'ticket' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#121216] border border-[#d4af37]/30 rounded-2xl p-4 sm:p-5 shadow-xl relative">
            {/* Mobile Back Button */}
            <div className="lg:hidden pb-3 mb-2 border-b border-[#222228] flex items-center justify-between">
              <button
                onClick={() => setMobilePosTab('catalog')}
                className="text-xs text-[#d4af37] hover:text-[#fde047] flex items-center gap-1.5 font-semibold transition-colors"
              >
                <span>&larr; Volver al Catálogo</span>
              </button>
              <span className="text-[11px] text-zinc-400">Paso 2 de 2</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold text-white font-serif-luxury tracking-wide">
                  Ticket de Cobro
                </h3>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Vaciar Carrito
                </button>
              )}
            </div>

            {/* Client input with preloaded autocomplete */}
            <div className="py-3 border-b border-[#27272a] space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] text-zinc-400">Nombre Cliente *</label>
                    {clientName && (
                      <button 
                        type="button" 
                        onClick={() => { setClientName(''); setClientPhone(''); }}
                        className="text-[9px] text-zinc-500 hover:text-rose-400"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carolina Benítez"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />

                  {/* Autocomplete suggestions dropdown when typing */}
                  {clientName.trim().length >= 2 && !clients.some(c => c.name.toLowerCase() === clientName.toLowerCase().trim() || c.clientCode?.toLowerCase() === clientName.toLowerCase().trim()) && (
                    (() => {
                      const q = clientName.toLowerCase().trim();
                      const matches = clients.filter(c => 
                        (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
                        c.name.toLowerCase().includes(q) ||
                        (c.phone && c.phone.includes(q))
                      ).slice(0, 5);

                      if (matches.length === 0) return null;

                      return (
                        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#16161f] border border-[#d4af37]/40 rounded-xl shadow-2xl p-1 max-h-48 overflow-y-auto divide-y divide-[#27272a]">
                          <div className="text-[9px] text-[#fde047] px-2 py-0.5 font-bold uppercase tracking-wider">
                            Clientes Precargados por Código / Nombre:
                          </div>
                          {matches.map(cli => (
                            <button
                              key={cli.id}
                              type="button"
                              onClick={() => {
                                setClientName(cli.name);
                                setClientPhone(cli.phone);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-[#20202c] rounded-lg text-xs flex items-center justify-between text-zinc-200 transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-[#fde047] font-bold text-[10px] bg-[#d4af37]/20 border border-[#d4af37]/40 px-1 py-0.2 rounded shrink-0">
                                  {cli.clientCode || 'JBL-1000'}
                                </span>
                                <span className="font-semibold text-white truncate">{cli.name}</span>
                                <span className="text-[10px] text-zinc-400 font-mono shrink-0">({cli.phone})</span>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#fde047] font-semibold shrink-0 ml-1">
                                {cli.totalVisits || 1} vis.
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    })()
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0986702007"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>
              </div>

              {/* Matched client info badge */}
              {(() => {
                const qName = clientName.toLowerCase().trim();
                const matchedClient = clients.find(c => 
                  (c.clientCode && c.clientCode.toLowerCase() === qName) ||
                  c.name.toLowerCase() === qName ||
                  (clientPhone && c.phone && c.phone.trim() === clientPhone.trim())
                );
                if (!matchedClient) return null;
                return (
                  <div className="p-2 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 text-[10px] text-[#fde047] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded border border-[#d4af37]/40 text-white">
                        {matchedClient.clientCode}
                      </span>
                      <span className="font-semibold">
                        ✓ Cliente precargado: {matchedClient.name} ({matchedClient.totalVisits || 1} visitas)
                      </span>
                    </div>
                    {matchedClient.skinType && (
                      <span className="text-zinc-300">Piel: {matchedClient.skinType}</span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Cart Items list */}
            <div className="py-3 min-h-[160px] max-h-[260px] overflow-y-auto space-y-2.5 pr-1 border-b border-[#27272a]">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#d4af37]" />
                  El ticket está vacío.<br />Seleccione servicios o productos de la lista.
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-[#18181d] border border-[#27272a] rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-white leading-tight">
                        {item.name}
                      </span>
                      <span className="font-mono font-bold text-white shrink-0">
                        Gs. {item.total.toLocaleString('es-PY')}
                      </span>
                    </div>

                    {/* Specialist assign for services with avatar */}
                    {item.type === 'service' && (() => {
                      const itemSpecialist = staffList.find(s => s.id === item.specialistId);
                      return (
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <span>Especialista:</span>
                          <div className="flex items-center gap-1.5 bg-[#121216] border border-[#27272a] rounded px-2 py-0.5">
                            {itemSpecialist?.avatar && (
                              <img
                                src={itemSpecialist.avatar}
                                alt={itemSpecialist.name}
                                className="w-4 h-4 rounded-full object-cover border border-[#d4af37]/60 shrink-0"
                              />
                            )}
                            <select
                              value={item.specialistId || ''}
                              onChange={(e) => updateItemSpecialist(idx, e.target.value)}
                              className="bg-transparent text-[10px] text-amber-200 focus:outline-none cursor-pointer"
                            >
                              {staffList.filter(s => s.active).map(s => (
                                <option key={s.id} value={s.id} className="bg-[#18181d] text-white">
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateItemQty(idx, -1)}
                          className="w-5 h-5 rounded bg-[#27272a] hover:bg-zinc-700 text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-mono text-zinc-200">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQty(idx, 1)}
                          className="w-5 h-5 rounded bg-[#27272a] hover:bg-zinc-700 text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Quitar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Totals */}
            <div className="py-3 space-y-1.5 text-xs border-b border-[#27272a]">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-200">Gs. {subtotal.toLocaleString('es-PY')}</span>
              </div>

              <div className="flex items-center justify-between text-zinc-400">
                <span>Descuento (Gs.):</span>
                <div className="w-28">
                  <FormattedNumberInput
                    value={discount}
                    placeholder="0"
                    onChange={(val) => setDiscount(val)}
                    className="w-full px-2 py-0.5 bg-[#18181d] border border-[#27272a] rounded text-right font-mono text-xs text-emerald-400 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-[#27272a]">
                <span>TOTAL A COBRAR:</span>
                <span className="text-[#d4af37] font-mono">Gs. {total.toLocaleString('es-PY')}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="py-3 space-y-2.5">
              <label className="block text-[11px] font-semibold text-zinc-300">
                Método de Pago
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'cash', label: 'Efectivo', icon: Banknote },
                  { id: 'card', label: 'Tarjeta', icon: CreditCard },
                  { id: 'transfer', label: 'Transf.', icon: ArrowRightLeft },
                  { id: 'mixed', label: 'Mixto', icon: Layers },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#fde047]'
                          : 'bg-[#18181d] border-[#27272a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cash Calculator */}
              {paymentMethod === 'cash' && (
                <div className="p-2.5 bg-[#18181d] border border-[#27272a] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Efectivo recibido:</span>
                    <div className="w-36">
                      <FormattedNumberInput
                        prefix={<span className="text-zinc-500 text-xs font-bold">Gs.</span>}
                        placeholder={total.toLocaleString('es-PY')}
                        value={cashReceived}
                        onChange={(val) => setCashReceived(val > 0 ? String(val) : '')}
                        className="w-full pl-8 pr-2 py-1 bg-[#121216] border border-[#27272a] rounded text-right font-mono text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                  {numCashReceived > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                      <span className="text-zinc-400">Cambio / Vuelto:</span>
                      <span className={`font-mono font-bold ${changeDue >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Gs. {changeDue.toLocaleString('es-PY')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Transfer/Card Reference */}
              {(paymentMethod === 'transfer' || paymentMethod === 'card') && (
                <div>
                  <input
                    type="text"
                    placeholder="N° de Comprobante / Lote / Banco..."
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              )}
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#d4af37]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Cobrar Gs. {total.toLocaleString('es-PY')} y Generar Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Mobile Cart Pill */}
      {mobilePosTab === 'catalog' && cartItems.length > 0 && (
        <div className="fixed bottom-20 inset-x-4 z-30 lg:hidden">
          <button
            onClick={() => setMobilePosTab('ticket')}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#aa8421] via-[#d4af37] to-[#fde047] text-black font-bold text-xs shadow-2xl shadow-black/80 flex items-center justify-between active:scale-98 transition-all border border-[#fde047]/60"
          >
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span>{cartItems.length} {cartItems.length === 1 ? 'ítem' : 'ítems'} en ticket</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-sm">
              <span>Gs. {total.toLocaleString('es-PY')}</span>
              <span className="font-sans text-xs underline font-bold ml-1">Ver y Cobrar &rarr;</span>
            </div>
          </button>
        </div>
      )}

      {/* Recent Sales History */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#27272a]">
          <div>
            <h3 className="text-sm font-bold text-white font-serif-luxury tracking-wide">
              Últimas Ventas y Cobros Registrados
            </h3>
            <p className="text-xs text-zinc-400">
              Historial de tickets emitidos en la jornada con detalle de especialista y medio de pago.
            </p>
          </div>
          <span className="text-xs text-[#d4af37] font-semibold">
            {sales.length} ventas registradas
          </span>
        </div>

        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-500 border-b border-[#27272a]">
                <th className="pb-2.5 font-medium">Ticket #</th>
                <th className="pb-2.5 font-medium">Fecha y Hora</th>
                <th className="pb-2.5 font-medium">Cliente</th>
                <th className="pb-2.5 font-medium">Detalle</th>
                <th className="pb-2.5 font-medium">Método</th>
                <th className="pb-2.5 font-medium">Total</th>
                <th className="pb-2.5 font-medium text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222228]">
              {sales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-[#18181f] transition-colors">
                  <td className="py-3 font-mono font-semibold text-[#d4af37]">
                    {sale.ticketNumber}
                  </td>
                  <td className="py-3 text-zinc-400">
                    {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-medium text-white">
                    {sale.clientName}
                  </td>
                  <td className="py-3 text-zinc-300 max-w-xs truncate">
                    {sale.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3">
                    <span className="capitalize text-[11px] text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-white">
                    Gs. {sale.total.toLocaleString('es-PY')}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setLastCompletedSale(sale)}
                      className="px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-xs text-zinc-200 transition-colors inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3 text-[#d4af37]" />
                      <span>Reimprimir</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash Register Modals */}
      {/* 1. Modal Apertura */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-serif-luxury mb-2">
              Apertura de Caja del Día
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Ingrese el monto base o fondo de cambio en efectivo con el que inicia la jornada.
            </p>
            <div className="mb-4">
              <label className="block text-xs text-zinc-300 mb-1">Monto Inicial en Efectivo (Gs.)</label>
              <FormattedNumberInput
                prefix={<span className="text-[#d4af37] font-bold text-xs">Gs.</span>}
                value={openingAmountInput}
                onChange={(val) => setOpeningAmountInput(String(val))}
                className="w-full pl-9 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowOpenModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-[#1a1a20] rounded-xl text-xs text-zinc-300 text-center"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  openCashShift(parseFloat(openingAmountInput) || 0);
                  setShowOpenModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black font-semibold rounded-xl text-xs text-center"
              >
                Abrir Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Gasto de Caja */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-[#27272a] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-serif-luxury mb-2">
              Registrar Gasto o Salida de Efectivo
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Registre retiros menores de efectivo de la gaveta (compras urgentes, insumos, etc.).
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Monto (Gs.)</label>
                <FormattedNumberInput
                  prefix={<span className="text-zinc-400 font-bold text-xs">Gs.</span>}
                  placeholder="0"
                  value={expenseAmountInput}
                  onChange={(val) => setExpenseAmountInput(String(val))}
                  className="w-full pl-9 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Motivo / Justificación</label>
                <input
                  type="text"
                  placeholder="Ej. Compra toallas desechables para cabina..."
                  value={expenseReasonInput}
                  onChange={(e) => setExpenseReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-[#1a1a20] rounded-xl text-xs text-zinc-300 text-center"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const amt = parseFloat(expenseAmountInput) || 0;
                  if (amt > 0 && expenseReasonInput.trim()) {
                    addCashMovement('expense', amt, expenseReasonInput.trim());
                    setShowExpenseModal(false);
                    setExpenseAmountInput('');
                    setExpenseReasonInput('');
                  } else {
                    alert('Complete monto y justificación.');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2 bg-rose-500/80 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs text-center"
              >
                Registrar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Cierre / Arqueo */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white font-serif-luxury mb-2">
              Arqueo y Cierre de Caja del Día
            </h3>
            <div className="p-3 bg-[#18181d] rounded-xl space-y-1.5 text-xs text-zinc-300 mb-4 border border-[#27272a]">
              <div className="flex justify-between">
                <span>Base inicial:</span>
                <span className="font-mono">Gs. {cashShift.openingAmount.toLocaleString('es-PY')}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Ventas en Efectivo:</span>
                <span className="font-mono">+Gs. {cashShift.cashSales.toLocaleString('es-PY')}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Gastos registrados:</span>
                <span className="font-mono">-Gs. {cashShift.expenses.toLocaleString('es-PY')}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-zinc-800">
                <span>Efectivo Teórico Esperado:</span>
                <span className="font-mono text-[#d4af37]">Gs. {expectedCashInDrawer.toLocaleString('es-PY')}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-zinc-300 mb-1">Efectivo Físico Contado en Gaveta (Gs.)</label>
              <FormattedNumberInput
                prefix={<span className="text-[#d4af37] font-bold text-xs">Gs.</span>}
                placeholder={expectedCashInDrawer.toLocaleString('es-PY')}
                value={countedCashInput}
                onChange={(val) => setCountedCashInput(String(val))}
                className="w-full pl-9 pr-3 py-2 bg-[#18181d] border border-[#27272a] rounded-lg text-sm font-mono text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowCloseModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-[#1a1a20] rounded-xl text-xs text-zinc-300 text-center"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  const counted = parseFloat(countedCashInput) || expectedCashInDrawer;
                  closeCashShift(counted);
                  setShowCloseModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs text-center"
              >
                Confirmar y Cerrar Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {lastCompletedSale && (
        <ReceiptModal
          sale={lastCompletedSale}
          onClose={() => setLastCompletedSale(null)}
        />
      )}
    </div>
  );
};
