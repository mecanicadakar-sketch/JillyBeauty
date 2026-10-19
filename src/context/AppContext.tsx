import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Service, 
  Product, 
  Appointment, 
  Sale, 
  CashShift, 
  CashMovement,
  Client, 
  ClientTreatmentRecord,
  InventoryMovement, 
  AppointmentStatus 
} from '../types';
import { 
  INITIAL_STAFF, 
  INITIAL_SERVICES, 
  INITIAL_PRODUCTS, 
  INITIAL_CLIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_SALES, 
  INITIAL_CASH_SHIFT 
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  staffList: User[];
  addStaff: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateStaff: (id: string, updates: Partial<User>) => void;
  deleteStaff: (id: string) => void;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  isLoggedOut: boolean;
  setIsLoggedOut: (loggedOut: boolean) => void;

  services: Service[];
  addService: (srv: Omit<Service, 'id'>) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustProductStock: (productId: string, quantityChange: number, reason: string, type: 'in' | 'out' | 'cabin_use' | 'adjustment') => void;
  inventoryMovements: InventoryMovement[];

  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  clients: Client[];
  addOrUpdateClient: (client: Partial<Client> & { name: string; phone: string }) => Client;
  deleteClient: (id: string) => void;
  updateAdminProfile: (updates: Partial<User>) => void;
  addClientTreatmentRecord: (clientId: string, record: Omit<ClientTreatmentRecord, 'id'>) => void;

  cashShift: CashShift;
  openCashShift: (openingAmount: number, notes?: string) => void;
  closeCashShift: (actualCashCounted: number, notes?: string) => void;
  addCashMovement: (type: 'expense' | 'income', amount: number, reason: string) => void;

  sales: Sale[];
  completeSale: (saleData: Omit<Sale, 'id' | 'ticketNumber' | 'date' | 'cashierName'>) => Sale;
  lastCompletedSale: Sale | null;
  setLastCompletedSale: (sale: Sale | null) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  viewMode: 'admin' | 'client_portal';
  setViewMode: (mode: 'admin' | 'client_portal') => void;
  isStandalonePortal: boolean;
  setIsStandalonePortal: (standalone: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  checkoutAppointment: Appointment | null;
  setCheckoutAppointment: (apt: Appointment | null) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  STAFF: 'jbl_staff_v2',
  CURRENT_USER: 'jbl_current_user_v2',
  SERVICES: 'jbl_services_v2',
  PRODUCTS: 'jbl_products_v2',
  INVENTORY_MOVEMENTS: 'jbl_movements_v2',
  APPOINTMENTS: 'jbl_appointments_v2',
  CLIENTS: 'jbl_clients_v2',
  SALES: 'jbl_sales_v2',
  CASH_SHIFT: 'jbl_cash_shift_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Staff & Auth
  const [staffList, setStaffList] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    let list: User[] = saved ? JSON.parse(saved) : INITIAL_STAFF;
    // Always sync the admin credentials for Jilly Directora and populate allowedPanels
    list = list.map(u => {
      const initialMatch = INITIAL_STAFF.find(st => st.id === u.id || st.username === u.username);
      if (u.role === 'admin' || u.username === 'jilly.admin' || u.id === 'u-1') {
        return {
          ...u,
          username: u.username || 'jilly.admin',
          password: u.password || 'Jet120588#',
          avatar: u.avatar || initialMatch?.avatar,
          name: u.name || initialMatch?.name || 'Directora Jilly',
          specialty: u.specialty || initialMatch?.specialty || 'Dirección Médica & Cosmiatría Avanzada',
          phone: u.phone || initialMatch?.phone || '0986702007',
          email: u.email || initialMatch?.email || 'direccion@jillybeautylab.com',
          isAdminEnabled: true,
          allowedPanels: u.allowedPanels?.length ? u.allowedPanels : ['appointments', 'cashier', 'inventory', 'services', 'admin', 'clients'],
          allowedServiceIds: u.allowedServiceIds || initialMatch?.allowedServiceIds || ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 'srv-7', 'srv-8', 'srv-9', 'srv-10']
        };
      }
      return {
        ...u,
        isAdminEnabled: u.isAdminEnabled ?? false,
        allowedPanels: u.allowedPanels?.length ? u.allowedPanels : (initialMatch?.allowedPanels || ['appointments', 'services', 'clients']),
        allowedServiceIds: u.allowedServiceIds || initialMatch?.allowedServiceIds || (u.role === 'specialist' ? ['srv-1', 'srv-2', 'srv-3'] : [])
      };
    });
    return list;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const u: User = JSON.parse(saved);
        if (u.role === 'admin' || u.username === 'jilly.admin' || u.id === 'u-1') {
          return {
            ...u,
            username: u.username || 'jilly.admin',
            password: u.password || 'Jet120588#',
            avatar: u.avatar || INITIAL_STAFF[0].avatar,
            name: u.name || INITIAL_STAFF[0].name,
            specialty: u.specialty || INITIAL_STAFF[0].specialty,
            phone: u.phone || INITIAL_STAFF[0].phone,
            email: u.email || INITIAL_STAFF[0].email,
            isAdminEnabled: true,
            allowedPanels: u.allowedPanels?.length ? u.allowedPanels : ['appointments', 'cashier', 'inventory', 'services', 'admin', 'clients'],
            allowedServiceIds: u.allowedServiceIds || ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 'srv-7', 'srv-8', 'srv-9', 'srv-10']
          };
        }
        return {
          ...u,
          allowedPanels: u.allowedPanels?.length ? u.allowedPanels : ['appointments', 'services', 'clients']
        };
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_STAFF[0]; // Default to Jilly Directora (Admin)
  });

  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(() => {
    return localStorage.getItem('jbl_logged_out') === 'true';
  });

  // Services
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Inventory Movements
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
    return saved ? JSON.parse(saved) : [];
  });

const checkIsClientPortalUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return (
    path === '/clientes' || 
    path === '/clientes.html' ||
    path.startsWith('/clientes/') || 
    path.includes('/clientes') ||
    path === '/portal' || 
    path === '/portal.html' ||
    path.startsWith('/portal/') ||
    path.includes('/portal') ||
    search.includes('portal=clientes') || 
    search.includes('mode=clientes') || 
    search.includes('clientes') ||
    hash.includes('clientes') ||
    hash.includes('portal')
  );
};

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // Clients with clientCode guarantee
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    let list: Client[] = saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    let nextNum = 1001;
    list = list.map((c, idx) => {
      if (!c.clientCode) {
        return {
          ...c,
          clientCode: `JBL-${nextNum + idx}`
        };
      }
      return c;
    });
    return list;
  });

  const generateNextClientCode = (currentList: Client[]): string => {
    let maxNum = 1000;
    currentList.forEach(c => {
      if (c.clientCode && c.clientCode.startsWith('JBL-')) {
        const num = parseInt(c.clientCode.replace('JBL-', ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    return `JBL-${maxNum + 1}`;
  };

  // Sales
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  // Cash shift
  const [cashShift, setCashShift] = useState<CashShift>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASH_SHIFT);
    return saved ? JSON.parse(saved) : INITIAL_CASH_SHIFT;
  });

  // Navigation & checkout state
  const [activeTab, setActiveTab] = useState<string>('appointments');
  const [isStandalonePortal, setIsStandalonePortal] = useState<boolean>(() => {
    return checkIsClientPortalUrl();
  });
  const [viewMode, setViewModeState] = useState<'admin' | 'client_portal'>(() => {
    return checkIsClientPortalUrl() ? 'client_portal' : 'admin';
  });

  const setViewMode = (mode: 'admin' | 'client_portal') => {
    setViewModeState(mode);
    setIsStandalonePortal(mode === 'client_portal');
    if (typeof window !== 'undefined') {
      try {
        if (mode === 'client_portal') {
          window.history.pushState(null, '', '/clientes');
        } else {
          window.history.pushState(null, '', '/');
        }
      } catch (e) {
        // Fallback for sandboxed iframe
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const isPortal = checkIsClientPortalUrl();
      setIsStandalonePortal(isPortal);
      setViewModeState(isPortal ? 'client_portal' : 'admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [checkoutAppointment, setCheckoutAppointment] = useState<Appointment | null>(null);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_MOVEMENTS, JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASH_SHIFT, JSON.stringify(cashShift));
  }, [cashShift]);

  // Auth & Staff Methods
  const login = (username: string, password: string): { success: boolean; message?: string } => {
    // Normalize username: accept with or without leading @
    const cleanUsername = username.toLowerCase().replace(/^@/, '').trim();
    const user = staffList.find(u => u.username.toLowerCase().replace(/^@/, '').trim() === cleanUsername);
    if (!user) {
      return { success: false, message: 'Usuario no encontrado en el sistema. Verifique sus credenciales.' };
    }
    if (!user.active) {
      return { success: false, message: 'Este usuario se encuentra inactivo. Contacte al administrador.' };
    }
    if (user.password && user.password !== password) {
      return { success: false, message: 'Contraseña incorrecta. Verifique su clave.' };
    }
    setCurrentUser(user);
    setIsLoggedOut(false);
    localStorage.removeItem('jbl_logged_out');
    return { success: true };
  };

  const logout = () => {
    setIsLoggedOut(true);
    localStorage.setItem('jbl_logged_out', 'true');
  };

  const switchUser = (userId: string) => {
    const user = staffList.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsLoggedOut(false);
      localStorage.removeItem('jbl_logged_out');
    }
  };

  const addStaff = (data: Omit<User, 'id' | 'createdAt'>) => {
    const newStaff: User = {
      ...data,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStaffList(prev => [...prev, newStaff]);
  };

  const updateStaff = (id: string, updates: Partial<User>) => {
    setStaffList(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteStaff = (id: string) => {
    setStaffList(prev => prev.filter(u => u.id !== id));
  };

  // Services Methods
  const addService = (srv: Omit<Service, 'id'>) => {
    const newSrv: Service = {
      ...srv,
      id: `srv-${Date.now()}`
    };
    setServices(prev => [newSrv, ...prev]);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Products & Stock Methods
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustProductStock = (
    productId: string, 
    quantityChange: number, 
    reason: string, 
    type: 'in' | 'out' | 'cabin_use' | 'adjustment'
  ) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    const newStock = Math.max(0, target.stock + quantityChange);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId,
      productName: target.name,
      type,
      quantity: Math.abs(quantityChange),
      date: new Date().toISOString(),
      reason,
      staffName: currentUser.name
    };
    setInventoryMovements(prev => [movement, ...prev]);
  };

  // Appointments Methods
  const addAppointment = (apt: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    // Also register or update client record automatically and get their clientCode
    const savedClient = addOrUpdateClient({
      clientCode: apt.clientCode,
      name: apt.clientName,
      phone: apt.clientPhone,
      email: apt.clientEmail,
      skinType: (apt.skinType as any) || undefined
    });

    const newApt: Appointment = {
      ...apt,
      clientCode: apt.clientCode || savedClient.clientCode,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [newApt, ...prev]);

    return newApt;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  // Client Methods
  const addOrUpdateClient = (clientData: Partial<Client> & { name: string; phone: string }): Client => {
    const cleanPhone = clientData.phone ? clientData.phone.trim() : '';
    const cleanName = clientData.name ? clientData.name.trim() : '';
    const cleanCode = clientData.clientCode ? clientData.clientCode.trim().toUpperCase() : '';

    const existingIndex = clients.findIndex(c => 
      (cleanCode && c.clientCode && c.clientCode.toUpperCase() === cleanCode) ||
      (clientData.id && c.id === clientData.id) ||
      (cleanPhone && c.phone && c.phone.trim() === cleanPhone) ||
      (!cleanPhone && cleanName && c.name.toLowerCase() === cleanName.toLowerCase())
    );

    if (existingIndex >= 0) {
      const existing = clients[existingIndex];
      const updated: Client = {
        ...existing,
        ...clientData,
        clientCode: existing.clientCode || cleanCode || generateNextClientCode(clients),
        name: cleanName || existing.name,
        phone: cleanPhone || existing.phone,
        email: clientData.email !== undefined ? clientData.email : existing.email,
        dni: clientData.dni !== undefined ? clientData.dni : existing.dni,
        birthdate: clientData.birthdate !== undefined ? clientData.birthdate : existing.birthdate,
        skinType: clientData.skinType || existing.skinType,
        allergies: clientData.allergies !== undefined ? clientData.allergies : existing.allergies,
        notes: clientData.notes !== undefined ? clientData.notes : existing.notes,
        address: clientData.address !== undefined ? clientData.address : existing.address,
        treatmentRecords: clientData.treatmentRecords || existing.treatmentRecords || []
      };
      const updatedList = [...clients];
      updatedList[existingIndex] = updated;
      setClients(updatedList);
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updatedList));
      return updated;
    } else {
      const newClient: Client = {
        id: clientData.id || `cl-${Date.now()}`,
        clientCode: cleanCode || generateNextClientCode(clients),
        name: cleanName,
        phone: cleanPhone,
        email: clientData.email || '',
        dni: clientData.dni || '',
        birthdate: clientData.birthdate || '',
        skinType: clientData.skinType || 'Normal',
        allergies: clientData.allergies || '',
        notes: clientData.notes || '',
        address: clientData.address || '',
        totalVisits: clientData.totalVisits || 1,
        totalSpent: clientData.totalSpent || 0,
        firstVisit: new Date().toISOString().split('T')[0],
        lastVisit: new Date().toISOString().split('T')[0],
        treatmentRecords: clientData.treatmentRecords || []
      };
      setClients(prev => {
        const next = [newClient, ...prev];
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(next));
        return next;
      });
      return newClient;
    }
  };

  const deleteClient = (id: string) => {
    setClients(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(next));
      return next;
    });
  };

  const addClientTreatmentRecord = (clientId: string, record: Omit<ClientTreatmentRecord, 'id'>) => {
    const newRecord: ClientTreatmentRecord = {
      ...record,
      id: `tr-${Date.now()}`
    };
    setClients(prev => {
      const updated = prev.map(c => {
        if (c.id === clientId || (c.clientCode && c.clientCode.toUpperCase() === clientId.toUpperCase()) || c.phone === clientId) {
          const existingRecords = c.treatmentRecords || [];
          return {
            ...c,
            totalVisits: (c.totalVisits || 0) + (record.status === 'completed' ? 1 : 0),
            totalSpent: (c.totalSpent || 0) + (record.price || 0),
            lastVisit: record.date || c.lastVisit,
            treatmentRecords: [newRecord, ...existingRecords]
          };
        }
        return c;
      });
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
      return updated;
    });
  };

  const updateAdminProfile = (updates: Partial<User>) => {
    setStaffList(prev => {
      const updated = prev.map(u => {
        if (u.role === 'admin' || u.username === 'jilly.admin' || u.id === 'u-1' || u.id === currentUser.id) {
          return { ...u, ...updates };
        }
        return u;
      });
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
      return updated;
    });
    setCurrentUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      return updated;
    });
  };

  // Cashier & POS Methods
  const openCashShift = (openingAmount: number, notes?: string) => {
    const newShift: CashShift = {
      id: `shift-${Date.now()}`,
      openedAt: new Date().toISOString(),
      openedBy: currentUser.name,
      openingAmount,
      cashSales: 0,
      cardSales: 0,
      transferSales: 0,
      expenses: 0,
      status: 'open',
      notes,
      movements: []
    };
    setCashShift(newShift);
  };

  const closeCashShift = (actualCashCounted: number, notes?: string) => {
    const expectedCash = cashShift.openingAmount + cashShift.cashSales - cashShift.expenses;
    const difference = actualCashCounted - expectedCash;

    setCashShift(prev => ({
      ...prev,
      closedAt: new Date().toISOString(),
      closedBy: currentUser.name,
      actualCashCounted,
      difference,
      notes: notes || prev.notes,
      status: 'closed'
    }));
  };

  const addCashMovement = (type: 'expense' | 'income', amount: number, reason: string) => {
    const movement: CashMovement = {
      id: `cmov-${Date.now()}`,
      type,
      amount,
      reason,
      date: new Date().toISOString(),
      staffName: currentUser.name
    };

    setCashShift(prev => {
      const newExpenses = type === 'expense' ? prev.expenses + amount : prev.expenses;
      return {
        ...prev,
        expenses: newExpenses,
        movements: [movement, ...prev.movements]
      };
    });
  };

  const completeSale = (saleData: Omit<Sale, 'id' | 'ticketNumber' | 'date' | 'cashierName'>): Sale => {
    const ticketSeq = sales.length + 100;
    const year = new Date().getFullYear();
    const ticketNumber = `TKT-${year}-${String(ticketSeq).padStart(4, '0')}`;
    const date = new Date().toISOString();

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      ticketNumber,
      date,
      cashierName: currentUser.name
    };

    // Update sales list
    setSales(prev => [newSale, ...prev]);

    // Update cash shift totals
    setCashShift(prev => {
      let cashDelta = 0;
      let cardDelta = 0;
      let transferDelta = 0;

      if (newSale.paymentMethod === 'cash') {
        cashDelta = newSale.total;
      } else if (newSale.paymentMethod === 'card') {
        cardDelta = newSale.total;
      } else if (newSale.paymentMethod === 'transfer') {
        transferDelta = newSale.total;
      } else if (newSale.paymentMethod === 'mixed') {
        // allocate proportional or default half cash / half card
        cashDelta = newSale.total * 0.5;
        cardDelta = newSale.total * 0.5;
      }

      return {
        ...prev,
        cashSales: prev.cashSales + cashDelta,
        cardSales: prev.cardSales + cardDelta,
        transferSales: prev.transferSales + transferDelta
      };
    });

    // Deduct stock for products sold
    newSale.items.forEach(item => {
      if (item.type === 'product') {
        adjustProductStock(item.id, -item.quantity, `Venta Ticket #${ticketNumber}`, 'out');
      }
    });

    // If sale was linked to an appointment, mark as paid
    if (newSale.appointmentId) {
      updateAppointment(newSale.appointmentId, {
        status: 'paid',
        paidSaleId: newSale.id
      });
    }

    // Update or register client total spent and visit count so they remain preloaded
    if (newSale.clientName) {
      const cleanPhone = (newSale.clientPhone || '').trim();
      const cleanName = newSale.clientName.trim();
      setClients(prev => {
        const idx = prev.findIndex(c => 
          (cleanPhone && c.phone && c.phone.trim() === cleanPhone) ||
          c.name.toLowerCase() === cleanName.toLowerCase()
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            phone: updated[idx].phone || cleanPhone,
            totalVisits: (updated[idx].totalVisits || 0) + 1,
            totalSpent: (updated[idx].totalSpent || 0) + newSale.total,
            lastVisit: date.split('T')[0]
          };
          localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(updated));
          return updated;
        } else {
          const newCli: Client = {
            id: `cl-${Date.now()}`,
            clientCode: generateNextClientCode(prev),
            name: cleanName,
            phone: cleanPhone || 'Sin teléfono',
            totalVisits: 1,
            totalSpent: newSale.total,
            lastVisit: date.split('T')[0],
            firstVisit: date.split('T')[0],
            skinType: 'Normal',
            allergies: 'Ninguna conocida',
            notes: `Cliente registrado por consumo Ticket #${ticketNumber}`,
            treatmentRecords: []
          };
          const next = [newCli, ...prev];
          localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(next));
          return next;
        }
      });
    }

    setLastCompletedSale(newSale);
    return newSale;
  };

  const resetAllData = () => {
    localStorage.clear();
    setStaffList(INITIAL_STAFF);
    setCurrentUser(INITIAL_STAFF[0]);
    setServices(INITIAL_SERVICES);
    setProducts(INITIAL_PRODUCTS);
    setInventoryMovements([]);
    setAppointments(INITIAL_APPOINTMENTS);
    setClients(INITIAL_CLIENTS);
    setSales(INITIAL_SALES);
    setCashShift(INITIAL_CASH_SHIFT);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        staffList,
        addStaff,
        updateStaff,
        deleteStaff,
        login,
        logout,
        switchUser,
        isLoggedOut,
        setIsLoggedOut,
        updateAdminProfile,

        services,
        addService,
        updateService,
        deleteService,

        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustProductStock,
        inventoryMovements,

        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,

        clients,
        addOrUpdateClient,
        deleteClient,
        addClientTreatmentRecord,

        cashShift,
        openCashShift,
        closeCashShift,
        addCashMovement,

        sales,
        completeSale,
        lastCompletedSale,
        setLastCompletedSale,

        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        isStandalonePortal,
        setIsStandalonePortal,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        checkoutAppointment,
        setCheckoutAppointment,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
