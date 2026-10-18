import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Download, 
  Printer, 
  ShieldAlert, 
  Sparkles, 
  UserCheck, 
  CreditCard, 
  ArrowUpRight, 
  Percent, 
  PieChart, 
  Layers, 
  Award, 
  CheckCircle2 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, cashShift, staffList, services, products, currentUser, switchUser } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<'current_month' | 'last_month' | 'all'>('current_month');

  // Admin access verification
  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl">
        <ShieldAlert className="w-16 h-16 text-[#d4af37] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white font-serif-luxury tracking-wide">
          Acceso Restringido al Panel de Administrador
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 mb-6 max-w-md mx-auto">
          Los reportes financieros detallados de ingresos mensuales y balances de caja son exclusivos para la Dirección General de Jilly Beauty Lab.
        </p>

        <div className="p-4 bg-[#18181d] border border-[#27272a] rounded-xl text-xs text-zinc-300 mb-6">
          <span>Estás conectado como: <strong>{currentUser.name}</strong> ({currentUser.specialty})</span>
        </div>

        <button
          onClick={() => {
            const admin = staffList.find(s => s.role === 'admin') || staffList[0];
            switchUser(admin.id);
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] via-[#e5c158] to-[#aa8421] text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-[#d4af37]/20 transition-all inline-flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Acceder con Perfil de Directora (Admin)</span>
        </button>
      </div>
    );
  }

  // Calculate sales in scope
  const filteredSales = sales; // In demo, all sales reflect current season

  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.total, 0);
  const totalDiscounts = filteredSales.reduce((acc, s) => acc + s.discount, 0);
  const totalSalesCount = filteredSales.length;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const totalExpenses = cashShift.expenses;
  const netProfit = totalRevenue - totalExpenses;

  // Breakdown by payment method
  const cashTotal = filteredSales.filter(s => s.paymentMethod === 'cash').reduce((a, b) => a + b.total, 0);
  const cardTotal = filteredSales.filter(s => s.paymentMethod === 'card').reduce((a, b) => a + b.total, 0);
  const transferTotal = filteredSales.filter(s => s.paymentMethod === 'transfer').reduce((a, b) => a + b.total, 0);
  const mixedTotal = filteredSales.filter(s => s.paymentMethod === 'mixed').reduce((a, b) => a + b.total, 0);

  // Breakdown by category (Facial, Laser, Uñas, Peeling, Micropigmentación, Reventa)
  const categoryRevenue: Record<string, number> = {
    'Depilación Láser': 0,
    'Tratamientos Faciales': 0,
    'Hollywood & Peeling': 0,
    'Uñas & Manicura': 0,
    'Micropigmentación': 0,
    'Masajes Reductores': 0,
    'Reventa Productos': 0
  };

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (item.type === 'product') {
        categoryRevenue['Reventa Productos'] += item.total;
      } else {
        const srv = services.find(s => s.id === item.id || s.name === item.name);
        if (srv) {
          if (srv.category === 'laser') categoryRevenue['Depilación Láser'] += item.total;
          else if (srv.category === 'facial') categoryRevenue['Tratamientos Faciales'] += item.total;
          else if (srv.category === 'peeling') categoryRevenue['Hollywood & Peeling'] += item.total;
          else if (srv.category === 'nails') categoryRevenue['Uñas & Manicura'] += item.total;
          else if (srv.category === 'micropigmentation') categoryRevenue['Micropigmentación'] += item.total;
          else if (srv.category === 'body') categoryRevenue['Masajes Reductores'] += item.total;
          else categoryRevenue['Tratamientos Faciales'] += item.total;
        } else {
          categoryRevenue['Tratamientos Faciales'] += item.total;
        }
      }
    });
  });

  // Performance and commission calculation by specialist
  const specialistPerformance = staffList.map(st => {
    let billed = 0;
    let servicesCount = 0;

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (item.specialistId === st.id || item.specialistName === st.name) {
          billed += item.total;
          servicesCount += item.quantity;
        }
      });
    });

    const commissionEarned = billed * (st.commissionRate / 100);
    const spaNet = billed - commissionEarned;

    return {
      staff: st,
      billed,
      servicesCount,
      commissionEarned,
      spaNet
    };
  }).filter(sp => sp.billed > 0 || sp.staff.role === 'specialist');

  // Export to CSV functionality
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Ticket,Fecha,Cliente,Telefono,Metodo_Pago,Subtotal,Descuento,Total,Atendido_Por\n';

    filteredSales.forEach(s => {
      const row = [
        s.ticketNumber,
        s.date,
        `"${s.clientName}"`,
        `"${s.clientPhone || ''}"`,
        s.paymentMethod,
        s.subtotal.toFixed(2),
        s.discount.toFixed(2),
        s.total.toFixed(2),
        `"${s.cashierName}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Ingresos_JillyBeautyLab_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock monthly trajectory for chart
  const monthsData = [
    { month: 'Junio', revenue: 2150, profit: 1720 },
    { month: 'Julio', revenue: 2840, profit: 2270 },
    { month: 'Agosto', revenue: 3290, profit: 2630 },
    { month: 'Septiembre', revenue: 3950, profit: 3160 },
    { month: 'Octubre (Actual)', revenue: totalRevenue + 1800, profit: netProfit + 1440, current: true },
  ];

  const maxMonthRev = Math.max(...monthsData.map(m => m.revenue));

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#121216] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-[#d4af37] tracking-widest uppercase bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/30">
              Panel Administrativo Financiero
            </span>
            <span className="text-xs text-zinc-400">· Jilly Beauty Lab Center</span>
          </div>

          <h2 className="text-2xl font-bold text-white font-serif-luxury tracking-wide">
            Reporte Ejecutivo de Ingresos Mensuales
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Métricas de facturación, comisiones de personal, balance de caja y rentabilidad neta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[#18181d] hover:bg-[#24242c] text-zinc-200 text-xs font-semibold rounded-xl border border-[#27272a] hover:border-[#d4af37]/40 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Exportar CSV (Excel)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-gradient-to-r from-[#d4af37] to-[#aa8421] text-black text-xs font-bold rounded-xl hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Informe</span>
          </button>
        </div>
      </div>

      {/* Main KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Ingresos Totales (Mes)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
              +18.4%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#d4af37] font-mono tracking-tight">
            Gs. {totalRevenue.toLocaleString('es-PY')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            {totalSalesCount} transacciones procesadas
          </p>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
            <DollarSign className="w-24 h-24 text-[#d4af37]" />
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Ganancia Neta (Caja)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-mono">
              Margen 94%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            Gs. {netProfit.toLocaleString('es-PY')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Descontando gastos operativos (Gs. {totalExpenses.toLocaleString('es-PY')})
          </p>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
            <TrendingUp className="w-24 h-24 text-white" />
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Ticket Promedio</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
              Por Cliente
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            Gs. {averageTicket.toLocaleString('es-PY')}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Descuentos otorgados: Gs. {totalDiscounts.toLocaleString('es-PY')}
          </p>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none">
            <CreditCard className="w-24 h-24 text-white" />
          </div>
        </div>

        {/* Cash vs Electronic Share */}
        <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Canales de Cobro</span>
            <span className="text-xs text-zinc-500 font-mono">
              POS Spa
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono pt-1">
            <div className="flex justify-between text-zinc-300">
              <span>Efectivo:</span>
              <strong className="text-emerald-400">Gs. {cashTotal.toLocaleString('es-PY')}</strong>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Transferencias:</span>
              <strong className="text-blue-400">Gs. {transferTotal.toLocaleString('es-PY')}</strong>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Tarjetas:</span>
              <strong className="text-purple-400">Gs. {cardTotal.toLocaleString('es-PY')}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Evolution Chart (Interactive SVG Bar Chart) */}
      <div className="bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#27272a]">
          <div>
            <h3 className="text-base font-bold text-white font-serif-luxury tracking-wide">
              Evolución Comparativa Mensual de Ingresos
            </h3>
            <p className="text-xs text-zinc-400">
              Crecimiento progresivo de facturación y margen neto de Jilly Beauty Lab en los últimos meses.
            </p>
          </div>
          <span className="text-xs text-[#d4af37] font-semibold bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30">
            Tendencia en Alza (+24%)
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6">
          <div className="grid grid-cols-5 gap-3 sm:gap-6 items-end h-64 border-b border-[#27272a] pb-4">
            {monthsData.map((m, idx) => {
              const heightPercent = Math.max(15, Math.round((m.revenue / maxMonthRev) * 100));

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="font-mono text-[11px] font-bold text-white mb-2 opacity-90 group-hover:text-[#d4af37] transition-colors">
                    Gs. {m.revenue.toLocaleString('es-PY')}
                  </div>

                  <div className="w-full max-w-[54px] rounded-t-xl overflow-hidden bg-[#1f1f26] relative transition-all group-hover:scale-105" style={{ height: `${heightPercent}%` }}>
                    <div 
                      className={`w-full h-full ${
                        m.current 
                          ? 'bg-gradient-to-t from-[#aa8421] via-[#d4af37] to-[#fef08a] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                          : 'bg-gradient-to-t from-[#27272a] to-[#71717a]'
                      }`}
                    />
                  </div>

                  <div className="text-[11px] font-medium text-zinc-400 mt-2 text-center truncate max-w-full">
                    {m.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Section: Category Distribution & Specialist Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue by Service Category (5 cols) */}
        <div className="lg:col-span-5 bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#27272a]">
            <h3 className="text-base font-bold text-white font-serif-luxury tracking-wide">
              Ingresos por Categoría de Servicio
            </h3>
            <p className="text-xs text-zinc-400">
              Distribución de ingresos generados en cabina y ventas retail.
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(categoryRevenue).map(([catName, amount], idx) => {
              const pct = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-300">{catName}</span>
                    <span className="font-mono font-bold text-white">
                      Gs. {amount.toLocaleString('es-PY')} <span className="text-zinc-500 font-normal">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#1c1c22] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#aa8421] to-[#d4af37] rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Specialist Performance & Commission Liquidations (7 cols) */}
        <div className="lg:col-span-7 bg-[#121216] border border-[#27272a] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-[#27272a] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-serif-luxury tracking-wide">
                Liquidación de Comisiones a Especialistas
              </h3>
              <p className="text-xs text-zinc-400">
                Cálculo de porcentaje correspondiente por servicios atendidos en el mes.
              </p>
            </div>
            <Award className="w-5 h-5 text-[#d4af37]" />
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 border-b border-[#27272a]">
                  <th className="pb-3 font-medium">Especialista</th>
                  <th className="pb-3 font-medium">Servicios</th>
                  <th className="pb-3 font-medium">Facturado</th>
                  <th className="pb-3 font-medium">% Com.</th>
                  <th className="pb-3 font-medium">A Pagar</th>
                  <th className="pb-3 font-medium text-right">Margen Spa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222228]">
                {specialistPerformance.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#18181f] transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4af37]/60 shrink-0 bg-[#22222a]">
                          {item.staff.avatar ? (
                            <img src={item.staff.avatar} alt={item.staff.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCheck className="w-full h-full p-1.5 text-[#d4af37]" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{item.staff.name}</div>
                          <div className="text-[10px] text-zinc-400">{item.staff.specialty}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 font-mono text-zinc-300">
                      {item.servicesCount} ses.
                    </td>

                    <td className="py-3 font-mono font-semibold text-white">
                      Gs. {item.billed.toLocaleString('es-PY')}
                    </td>

                    <td className="py-3 font-mono text-[#d4af37]">
                      {item.staff.commissionRate}%
                    </td>

                    <td className="py-3 font-mono font-bold text-emerald-400">
                      Gs. {item.commissionEarned.toLocaleString('es-PY')}
                    </td>

                    <td className="py-3 font-mono font-bold text-white text-right">
                      Gs. {item.spaNet.toLocaleString('es-PY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
