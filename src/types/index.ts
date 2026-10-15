export type UserRole = 'admin' | 'specialist' | 'cashier';

export type AppPanel = 'appointments' | 'cashier' | 'inventory' | 'services' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  specialty: string;
  phone: string;
  email: string;
  commissionRate: number; // e.g. 25 = 25%
  active: boolean;
  avatar?: string;
  createdAt: string;
  allowedPanels?: AppPanel[]; // Paneles/módulos a los que puede ingresar: 'appointments' | 'cashier' | 'inventory' | 'services' | 'admin'
  allowedServiceIds?: string[];
  isAdminEnabled?: boolean; // Habilitado con privilegios de administrador
  permissions?: {
    canManageInventory?: boolean;
    canManageCashier?: boolean;
    canManageServices?: boolean;
    canViewReports?: boolean;
    isAdminAccess?: boolean;
  };
}

export const canAccessPanel = (user?: User | null, panel?: AppPanel | string): boolean => {
  if (!user || !panel) return false;
  if (user.role === 'admin' || user.isAdminEnabled) return true;
  if (!user.allowedPanels || user.allowedPanels.length === 0) {
    if (user.role === 'cashier') return panel === 'appointments' || panel === 'cashier' || panel === 'services';
    return panel === 'appointments' || panel === 'services';
  }
  return user.allowedPanels.includes(panel as AppPanel);
};

export type ServiceCategory = 
  | 'laser' 
  | 'facial' 
  | 'peeling' 
  | 'nails' 
  | 'body' 
  | 'micropigmentation';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  description: string;
  price: number;
  durationMin: number;
  recommendedSessions?: number;
  active: boolean;
}

export type ProductCategory = 'cabin' | 'retail';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory; // cabin: insumos de cabina, retail: reventa a clientes
  brand: string;
  stock: number;
  minStock: number;
  costPrice: number;
  salePrice: number; // for retail, or internal value
  unit: string; // 'unidades', 'ml', 'ampollas', 'frascos', 'cajas'
  description?: string;
  active: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'cabin_use' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
  staffName: string;
}

export type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'paid';

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  specialistId: string;
  specialistName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMin: number;
  status: AppointmentStatus;
  notes?: string;
  skinType?: string;
  createdBy: string;
  createdAt: string;
  paidSaleId?: string;
}

export interface SaleItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  specialistId?: string;
  specialistName?: string;
}

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'mixed';

export interface Sale {
  id: string;
  ticketNumber: string;
  date: string; // ISO
  clientName: string;
  clientPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number; // IVA if applicable
  total: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string; // Voucher / Transfer #
  cashierName: string;
  appointmentId?: string;
  notes?: string;
}

export interface CashMovement {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  reason: string;
  date: string;
  staffName: string;
}

export interface CashShift {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  openingAmount: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  expenses: number;
  actualCashCounted?: number;
  difference?: number;
  notes?: string;
  status: 'open' | 'closed';
  movements: CashMovement[];
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthdate?: string;
  skinType?: 'Normal' | 'Grasa' | 'Mixta' | 'Seca' | 'Sensible';
  allergies?: string;
  notes?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit?: string;
}
