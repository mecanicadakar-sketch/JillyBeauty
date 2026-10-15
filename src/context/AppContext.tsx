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
  adjustProductStock: (productId: string, quantityChange: number, reason: string, type: 'in' | 'out' | 'cabin_use' | 'adjustment') => void;
  inventoryMovements: InventoryMovement[];

  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;

  clients: Client[];
  addOrUpdateClient: (client: Partial<Client> & { name: string; phone: string }) => Client;

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
          username: 'jilly.admin',
          password: 'Jet120588#',
          isAdminEnabled: true,
          allowedPanels: u.allowedPanels || ['appointments', 'cashier', 'inventory', 'services', 'admin'],
          allowedServiceIds: u.allowedServiceIds || initialMatch?.allowedServiceIds || ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 'srv-7', 'srv-8', 'srv-9', 'srv-10']
        };
      }
      return {
        ...u,
        isAdminEnabled: u.isAdminEnabled ?? false,
        allowedPanels: u.allowedPanels || initialMatch?.allowedPanels || ['appointments', 'services'],
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
            username: 'jilly.admin',
            password: 'Jet120588#',
            isAdminEnabled: true,
            allowedPanels: u.allowedPanels || ['appointments', 'cashier', 'inventory', 'services', 'admin'],
            allowedServiceIds: u.allowedServiceIds || ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 'srv-7', 'srv-8', 'srv-9', 'srv-10']
          };
        }
        return {
          ...u,
          allowedPanels: u.allowedPanels || ['appointments', 'services']
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

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // Clients
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

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
  const [viewMode, setViewMode] = useState<'admin' | 'client_portal'>('admin');
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
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [newApt, ...prev]);

    // Also register or update client record automatically
    addOrUpdateClient({
      name: apt.clientName,
      phone: apt.clientPhone,
      email: apt.clientEmail,
      skinType: (apt.skinType as any) || undefined
    });

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
    const existingIndex = clients.findIndex(c => c.phone.trim() === clientData.phone.trim());
    if (existingIndex >= 0) {
      const existing = clients[existingIndex];
      const updated: Client = {
        ...existing,
        ...clientData,
        name: clientData.name || existing.name,
        notes: clientData.notes !== undefined ? clientData.notes : existing.notes,
        skinType: clientData.skinType || existing.skinType,
      };
      const updatedList = [...clients];
      updatedList[existingIndex] = updated;
      setClients(updatedList);
      return updated;
    } else {
      const newClient: Client = {
        id: `cl-${Date.now()}`,
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email || '',
        birthdate: clientData.birthdate || '',
        skinType: clientData.skinType || 'Normal',
        allergies: clientData.allergies || 'Ninguna conocida',
        notes: clientData.notes || '',
        totalVisits: 1,
        totalSpent: 0,
        lastVisit: new Date().toISOString().split('T')[0]
      };
      setClients(prev => [newClient, ...prev]);
      return newClient;
    }
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

    // Update client total spent and visit count
    if (newSale.clientPhone) {
      setClients(prev => prev.map(c => {
        if (c.phone === newSale.clientPhone) {
          return {
            ...c,
            totalVisits: c.totalVisits + 1,
            totalSpent: c.totalSpent + newSale.total,
            lastVisit: date.split('T')[0]
          };
        }
        return c;
      }));
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

        services,
        addService,
        updateService,
        deleteService,

        products,
        addProduct,
        updateProduct,
        adjustProductStock,
        inventoryMovements,

        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,

        clients,
        addOrUpdateClient,

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
