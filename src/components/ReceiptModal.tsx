import React from 'react';
import { Sale } from '../types';
import { X, Printer, CheckCircle2, Phone, Instagram, MapPin } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta de Débito / Crédito';
      case 'transfer':
        return 'Transferencia Bancaria';
      case 'mixed':
        return 'Pago Mixto';
      default:
        return method;
    }
  };

  const formattedDate = new Date(sale.date).toLocaleString('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121216] border border-[#d4af37]/40 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top actions bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#27272a] bg-[#0c0c0e]">
          <span className="text-xs text-[#d4af37] font-semibold tracking-wider uppercase">
            Comprobante de Cobro
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] hover:brightness-110 text-black font-semibold rounded-lg text-xs transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Ticket</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#a1a1aa] hover:text-white p-1 rounded-lg hover:bg-[#1a1a20]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable thermal receipt view */}
        <div className="p-6 bg-[#0a0a0c]">
          <div 
            id="printable-ticket" 
            className="bg-white text-black p-6 rounded-xl font-mono text-xs shadow-inner border border-zinc-200"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-dashed border-zinc-300">
              <div className="flex justify-center mb-2">
                <img
                  src="/assets/aistudio/logojillybeautty_712619f5.png"
                  alt="Jilly Beauty Lab"
                  className="w-16 h-16 object-contain rounded-full shadow-sm"
                />
              </div>
              <h2 className="font-serif font-black text-lg tracking-wider uppercase text-zinc-900">
                JILLY BEAUTY LAB
              </h2>
              <p className="text-[10px] tracking-widest uppercase font-semibold text-zinc-600">
                Center & Spa
              </p>
              <p className="text-[9px] text-zinc-500 mt-1">
                Tu belleza, en manos expertas
              </p>
              <p className="text-[9px] text-zinc-600 mt-0.5">
                WhatsApp: 0986 704 085 · @jillybeautylab
              </p>
            </div>

            {/* Ticket Info */}
            <div className="py-3 border-b border-dashed border-zinc-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Ticket:</span>
                <span className="font-bold text-zinc-900">{sale.ticketNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Atendido por:</span>
                <span>{sale.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Cliente:</span>
                <span className="font-semibold text-zinc-900">{sale.clientName}</span>
              </div>
              {sale.clientPhone && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Teléfono:</span>
                  <span>{sale.clientPhone}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-zinc-300">
              <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase mb-2">
                <span>Descripción</span>
                <span>Total</span>
              </div>
              <div className="space-y-2">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="flex justify-between font-medium">
                      <span className="pr-2">{item.name}</span>
                      <span className="font-bold">Gs. {item.total.toLocaleString('es-PY')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>{item.quantity} x Gs. {item.unitPrice.toLocaleString('es-PY')} {item.specialistName ? `(${item.specialistName})` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-zinc-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>Gs. {sale.subtotal.toLocaleString('es-PY')}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descuento aplicado:</span>
                  <span>-Gs. {sale.discount.toLocaleString('es-PY')}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>IVA:</span>
                  <span>Gs. {sale.tax.toLocaleString('es-PY')}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-zinc-900 pt-1 border-t border-zinc-200">
                <span>TOTAL A PAGAR:</span>
                <span>Gs. {sale.total.toLocaleString('es-PY')}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="py-2.5 border-b border-dashed border-zinc-300 text-[10px] text-zinc-700 space-y-0.5">
              <div className="flex justify-between">
                <span>Método de Pago:</span>
                <span className="font-bold">{getPaymentMethodLabel(sale.paymentMethod)}</span>
              </div>
              {sale.paymentReference && (
                <div className="flex justify-between">
                  <span>Comprobante / Ref:</span>
                  <span>{sale.paymentReference}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-4 text-[10px] text-zinc-500 space-y-1">
              <p className="font-bold text-zinc-800">¡GRACIAS POR SU PREFERENCIA!</p>
              <p>Esperamos verte pronto para tu próxima sesión.</p>
              <p className="text-[9px]">Síguenos en Instagram @jillybeautylabcenter</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#18181d] hover:bg-[#27272a] text-zinc-300 font-medium rounded-xl text-xs border border-[#27272a]"
            >
              Cerrar Comprobante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
