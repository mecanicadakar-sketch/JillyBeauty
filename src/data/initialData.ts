import { User, Service, Product, Appointment, Sale, CashShift, Client } from '../types';

export const INITIAL_STAFF: User[] = [
  {
    id: 'u-1',
    name: 'Jilly Directora',
    username: 'jilly.admin',
    password: 'Jet120588#',
    role: 'admin',
    specialty: 'Master Cosmiatra & Directora',
    phone: '0986 704 085',
    email: 'contacto@jillybeautylab.com',
    commissionRate: 30,
    active: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01',
    isAdminEnabled: true,
    allowedPanels: ['appointments', 'cashier', 'inventory', 'services', 'admin'],
    allowedServiceIds: ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6', 'srv-7', 'srv-8', 'srv-9', 'srv-10'],
    permissions: {
      isAdminAccess: true,
      canManageInventory: true,
      canManageCashier: true,
      canManageServices: true,
      canViewReports: true
    }
  },
  {
    id: 'u-2',
    name: 'Dra. Valentina Paz',
    username: 'valentina.facial',
    password: 'valen123',
    role: 'specialist',
    specialty: 'Cosmiatra Especialista Facial & Rejuvenecimiento',
    phone: '0981234567',
    email: 'valentina@jillybeautylab.com',
    commissionRate: 25,
    active: true,
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-15',
    isAdminEnabled: false,
    allowedPanels: ['appointments', 'services'],
    allowedServiceIds: ['srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-10'],
    permissions: {
      isAdminAccess: false,
      canManageCashier: true,
      canManageInventory: false,
      canManageServices: false,
      canViewReports: false
    }
  },
  {
    id: 'u-3',
    name: 'Camila Morales',
    username: 'camila.laser',
    password: 'cami123',
    role: 'specialist',
    specialty: 'Técnica en Láser Avanzado & Eliminación de Tatuajes',
    phone: '0987654321',
    email: 'camila@jillybeautylab.com',
    commissionRate: 25,
    active: true,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-01',
    isAdminEnabled: false,
    allowedPanels: ['appointments', 'services'],
    allowedServiceIds: ['srv-3', 'srv-5', 'srv-6'],
    permissions: {
      isAdminAccess: false,
      canManageCashier: false,
      canManageInventory: false,
      canManageServices: false,
      canViewReports: false
    }
  },
  {
    id: 'u-4',
    name: 'Sofía Herrera',
    username: 'sofia.nails',
    password: 'sofi123',
    role: 'specialist',
    specialty: 'Micropigmentación Labial & Nail Artist',
    phone: '0995554433',
    email: 'sofia@jillybeautylab.com',
    commissionRate: 20,
    active: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-02-15',
    isAdminEnabled: false,
    allowedPanels: ['appointments', 'services'],
    allowedServiceIds: ['srv-7', 'srv-8', 'srv-9'],
    permissions: {
      isAdminAccess: false,
      canManageCashier: false,
      canManageInventory: false,
      canManageServices: false,
      canViewReports: false
    }
  },
  {
    id: 'u-5',
    name: 'Andrea Ortiz',
    username: 'andrea.caja',
    password: 'caja123',
    role: 'cashier',
    specialty: 'Recepción & Atención al Cliente',
    phone: '0986 704 085',
    email: 'recepcion@jillybeautylab.com',
    commissionRate: 5,
    active: true,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-03-01',
    isAdminEnabled: false,
    allowedPanels: ['appointments', 'cashier', 'services'],
    allowedServiceIds: [],
    permissions: {
      isAdminAccess: false,
      canManageCashier: true,
      canManageInventory: false,
      canManageServices: false,
      canViewReports: false
    }
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Rejuvenecimiento Facial y Corporal con Tecnología Avanzada',
    category: 'facial',
    categoryLabel: 'Rejuvenecimiento Avanzado',
    description: 'Protocolo antiedad de vanguardia que estimula la producción de colágeno y elastina. Reduce flacidez, líneas de expresión y redensifica la dermis.',
    price: 60.0,
    durationMin: 75,
    recommendedSessions: 4,
    active: true
  },
  {
    id: 'srv-2',
    name: 'Tratamientos Despigmentantes y Renovadores (Acné, Manchas, Líneas Finas)',
    category: 'peeling',
    categoryLabel: 'Despigmentantes & Renovadores',
    description: 'Terapia dermatocosmética intensiva para unificar el tono de la piel, atenuar manchas solares, melasma, secuelas de acné y regenerar capas epidérmicas.',
    price: 45.0,
    durationMin: 60,
    recommendedSessions: 4,
    active: true
  },
  {
    id: 'srv-3',
    name: 'Hollywood Peel – Glow Facial',
    category: 'peeling',
    categoryLabel: 'Hollywood Peel',
    description: 'Tratamiento estrella de alfombra roja con carbón activado y láser Q-Switched. Cierra poros dilatados, elimina células muertas y genera un brillo radiante al instante.',
    price: 50.0,
    durationMin: 60,
    recommendedSessions: 3,
    active: true
  },
  {
    id: 'srv-4',
    name: 'Eliminación de Acrocordones, Verrugas y Lunares',
    category: 'facial',
    categoryLabel: 'Electrocauterización Estética',
    description: 'Procedimiento seguro y rápido con tecnología de plasma/electrocoagulación para retirar lesiones benignas de la piel sin cicatrices evidentes.',
    price: 35.0,
    durationMin: 40,
    recommendedSessions: 1,
    active: true
  },
  {
    id: 'srv-5',
    name: 'Depilación Láser Avanzada (Zonas a Elección)',
    category: 'laser',
    categoryLabel: 'Depilación Láser Avanzada',
    description: 'Sistema láser indoloro de alta potencia para eliminación permanente del vello corporal y facial en todo tipo de piel, desde la primera sesión.',
    price: 35.0,
    durationMin: 45,
    recommendedSessions: 6,
    active: true
  },
  {
    id: 'srv-6',
    name: 'Eliminación de Micropigmentación y Tatuajes',
    category: 'laser',
    categoryLabel: 'Láser Eliminación Pigmento',
    description: 'Láser específico que fragmenta las partículas de pigmento en cejas, labios o tatuajes corporales para su eliminación gradual sin quemaduras.',
    price: 55.0,
    durationMin: 50,
    recommendedSessions: 3,
    active: true
  },
  {
    id: 'srv-7',
    name: 'Micropigmentación y Reconstrucción de Labios (Aquarelle Lips)',
    category: 'micropigmentation',
    categoryLabel: 'Micropigmentación Labial',
    description: 'Técnica delicada de micropigmentación para definir el arco de cupido, corregir asimetrías y aportar un color juvenil y sensual semipermanente.',
    price: 90.0,
    durationMin: 120,
    recommendedSessions: 2,
    active: true
  },
  {
    id: 'srv-8',
    name: 'Masajes Estéticos con Aparatología (Reductores y Reafirmantes)',
    category: 'body',
    categoryLabel: 'Aparatología Reductora & Firmeza',
    description: 'Combinación potente de cavitación, radiofrecuencia tripolar y vacumterapia para moldear la silueta, drenar toxinas y combatir celulitis y flacidez.',
    price: 45.0,
    durationMin: 60,
    recommendedSessions: 8,
    active: true
  },
  {
    id: 'srv-9',
    name: 'Manicura y Pedicura Profesional (Spa & Rusa)',
    category: 'nails',
    categoryLabel: 'Manicura & Pedicura Profesional',
    description: 'Tratamiento completo de manos y pies con limpieza de cutícula con torno, exfoliación, hidratación profunda y esmaltado semipermanente de alta fijación.',
    price: 28.0,
    durationMin: 70,
    recommendedSessions: 1,
    active: true
  },
  {
    id: 'srv-10',
    name: 'Dermaplaning + Hidronutrición Seda',
    category: 'facial',
    categoryLabel: 'Dermaplaning',
    description: 'Exfoliación física médica con bisturí estéril que remueve células muertas y vello facial fino, permitiendo una absorción profunda de activos.',
    price: 35.0,
    durationMin: 50,
    recommendedSessions: 1,
    active: true
  },
  {
    id: 'srv-11',
    name: 'Micropigmentación de Cejas (Microblading Hiperrealista)',
    category: 'micropigmentation',
    categoryLabel: 'Micropigmentación Cejas',
    description: 'Diseño pelo a pelo personalizado para realzar tu mirada y enmarcar tu rostro con pigmentos hipoalergénicos certificados.',
    price: 90.0,
    durationMin: 120,
    recommendedSessions: 2,
    active: true
  },
  {
    id: 'srv-12',
    name: 'Uñas Esculpidas en Acrílico / Polygel',
    category: 'nails',
    categoryLabel: 'Uñas Esculpidas',
    description: 'Extensión y estructura de uñas con materiales de máxima calidad, diseño a mano alzada y acabado brillante de larga duración.',
    price: 35.0,
    durationMin: 90,
    recommendedSessions: 1,
    active: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Reventa / Retail
  {
    id: 'prod-1',
    name: 'Serum Ácido Hialurónico Puro 2% (30ml)',
    sku: 'RET-HA-01',
    category: 'retail',
    brand: 'Jilly Dermacare',
    stock: 14,
    minStock: 5,
    costPrice: 12.0,
    salePrice: 28.0,
    unit: 'unidades',
    description: 'Hidratación multicapa profunda con alta penetración dérmica.',
    active: true
  },
  {
    id: 'prod-2',
    name: 'Protector Solar Toque Seco FPS 50+ Invisible',
    sku: 'RET-FPS-02',
    category: 'retail',
    brand: 'Jilly Dermacare',
    stock: 18,
    minStock: 6,
    costPrice: 14.5,
    salePrice: 32.0,
    unit: 'unidades',
    description: 'Alta protección UVA/UVB, sin residuo blanco, ideal post peeling o láser.',
    active: true
  },
  {
    id: 'prod-3',
    name: 'Crema Despigmentante Noche con Ácido Kójico',
    sku: 'RET-DESP-03',
    category: 'retail',
    brand: 'Jilly Dermacare',
    stock: 8,
    minStock: 4,
    costPrice: 15.0,
    salePrice: 35.0,
    unit: 'unidades',
    description: 'Tratamiento nocturno para manchas, melasma y tono desigual.',
    active: true
  },
  {
    id: 'prod-4',
    name: 'Aceite Reparador de Cutículas con Vitamina E',
    sku: 'RET-OIL-04',
    category: 'retail',
    brand: 'Nail Spa Luxe',
    stock: 3,
    minStock: 5, // Low stock trigger
    costPrice: 3.5,
    salePrice: 9.0,
    unit: 'unidades',
    description: 'Nutrición intensa para uñas y cutículas resecas.',
    active: true
  },

  // Cabina / Insumos Profesionales
  {
    id: 'prod-5',
    name: 'Gel Conductor Hipoalergénico para Láser y RF (5 Litros)',
    sku: 'CAB-GEL-01',
    category: 'cabin',
    brand: 'BioMedical Pro',
    stock: 6,
    minStock: 2,
    costPrice: 18.0,
    salePrice: 18.0,
    unit: 'galones',
    description: 'Gel neutro de alta conductividad para depilación y cavitación.',
    active: true
  },
  {
    id: 'prod-6',
    name: 'Carbón Activado Líquido para Hollywood Peel (150ml)',
    sku: 'CAB-CARB-02',
    category: 'cabin',
    brand: 'LaserTech Pro',
    stock: 2,
    minStock: 3, // Low stock trigger
    costPrice: 28.0,
    salePrice: 28.0,
    unit: 'frascos',
    description: 'Pasta de carbón de grado nanométrico para láser Nd:YAG.',
    active: true
  },
  {
    id: 'prod-7',
    name: 'Cartuchos Microagujas Dermapen 36 Pines (Caja 20u)',
    sku: 'CAB-DERM-03',
    category: 'cabin',
    brand: 'DermaPen Med',
    stock: 24,
    minStock: 10,
    costPrice: 22.0,
    salePrice: 22.0,
    unit: 'cajas',
    description: 'Agujas estériles desechables de titanio para bioestimulación facial.',
    active: true
  },
  {
    id: 'prod-8',
    name: 'Solución Peeling Ácido Salicílico 20% (60ml)',
    sku: 'CAB-PEEL-04',
    category: 'cabin',
    brand: 'DermRejuvenate',
    stock: 4,
    minStock: 2,
    costPrice: 25.0,
    salePrice: 25.0,
    unit: 'frascos',
    description: 'Uso exclusivo profesional en cabina para control seborreico y acné.',
    active: true
  },
  {
    id: 'prod-9',
    name: 'Bisturís Quirúrgicos Nº 10 para Dermaplaning (Caja 50u)',
    sku: 'CAB-BIST-05',
    category: 'cabin',
    brand: 'SurgiCare',
    stock: 1,
    minStock: 2, // Low stock trigger
    costPrice: 16.0,
    salePrice: 16.0,
    unit: 'cajas',
    description: 'Hojas de acero inoxidable ultra afiladas estériles para dermaplaning.',
    active: true
  },
  {
    id: 'prod-10',
    name: 'Pigmento Micropigmentación Cejas Dark Brown (15ml)',
    sku: 'CAB-PIGM-06',
    category: 'cabin',
    brand: 'BioTouch Luxe',
    stock: 5,
    minStock: 2,
    costPrice: 32.0,
    salePrice: 32.0,
    unit: 'frascos',
    description: 'Pigmento microbiano certificado estable sin viraje de color.',
    active: true
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl-1',
    clientCode: 'JBL-1001',
    name: 'Carolina Benítez',
    phone: '0991234888',
    email: 'carolina.b@gmail.com',
    birthdate: '1992-05-14',
    skinType: 'Mixta',
    allergies: 'Sensibilidad al ácido retinoico',
    notes: 'Cliente frecuente de Hollywood Peel y Dermaplaning. Excelente tolerancia.',
    totalVisits: 6,
    totalSpent: 260.0,
    lastVisit: '2026-10-10',
    firstVisit: '2026-04-12',
    treatmentRecords: [
      {
        id: 'tr-1',
        serviceId: 'srv-2',
        serviceName: 'Hollywood Peel y Peeling Despigmentante',
        date: '2026-10-10',
        time: '10:00',
        specialistName: 'Directora Jilly',
        price: 55.0,
        status: 'completed',
        notes: 'Sesión 3: carbón activo con láser Nd:YAG. Buena respuesta cutánea, poros minimizados.'
      },
      {
        id: 'tr-2',
        serviceId: 'srv-1',
        serviceName: 'Rejuvenecimiento Facial y Corporal con Tecnología Avanzada',
        date: '2026-09-18',
        time: '11:30',
        specialistName: 'Directora Jilly',
        price: 60.0,
        status: 'completed',
        notes: 'Protocolo antiedad de colágeno. Dermis redensificada.'
      }
    ]
  },
  {
    id: 'cl-2',
    clientCode: 'JBL-1002',
    name: 'Gabriela Mendoza',
    phone: '0984433221',
    email: 'gaby.mendoza@hotmail.com',
    birthdate: '1988-11-20',
    skinType: 'Seca',
    allergies: 'Ninguna conocida',
    notes: 'Tratamiento de hidratación profunda y uñas esculpidas cada 21 días.',
    totalVisits: 9,
    totalSpent: 395.0,
    lastVisit: '2026-10-11',
    firstVisit: '2026-02-10',
    treatmentRecords: [
      {
        id: 'tr-3',
        serviceId: 'srv-8',
        serviceName: 'Uñas Esculpidas en Gel & Acrílico con Diseños Exclusivos',
        date: '2026-10-11',
        time: '15:00',
        specialistName: 'Sofía Vargas',
        price: 35.0,
        status: 'completed',
        notes: 'Mantenimiento de gel con punta francesa dorada.'
      }
    ]
  },
  {
    id: 'cl-3',
    clientCode: 'JBL-1003',
    name: 'Lorena Zambrano',
    phone: '0997788990',
    email: 'lore.zambrano@gmail.com',
    birthdate: '1995-02-08',
    skinType: 'Sensible',
    allergies: 'Alergia al látex (usar guantes de nitrilo)',
    notes: 'Depilación láser en axilas y piernas (sesión 4 de 6).',
    totalVisits: 4,
    totalSpent: 175.0,
    lastVisit: '2026-10-08',
    firstVisit: '2026-06-01',
    treatmentRecords: [
      {
        id: 'tr-4',
        serviceId: 'srv-4',
        serviceName: 'Depilación Láser Diodo / Definitiva (Zonas a Elección)',
        date: '2026-10-08',
        time: '14:00',
        specialistName: 'Valeria Montero',
        price: 45.0,
        status: 'completed',
        notes: 'Sesión 4: Parámetros 18J/cm2. Sin irritación, tolerancia óptima.'
      }
    ]
  },
  {
    id: 'cl-4',
    clientCode: 'JBL-1004',
    name: 'María Fernanda Vega',
    phone: '0985544332',
    email: 'mafe.vega@yahoo.com',
    birthdate: '1990-07-30',
    skinType: 'Grasa',
    allergies: 'Ninguna',
    notes: 'Tratamiento de acné y peeling salicílico.',
    totalVisits: 3,
    totalSpent: 125.0,
    lastVisit: '2026-10-05',
    firstVisit: '2026-07-15'
  },
  {
    id: 'cl-5',
    clientCode: 'JBL-1005',
    name: 'Daniela Salazar',
    phone: '0993322110',
    email: 'daniela.salazar@gmail.com',
    birthdate: '1994-09-18',
    skinType: 'Normal',
    allergies: 'Ninguna',
    notes: 'Micropigmentación de cejas realizada con retoque completado.',
    totalVisits: 5,
    totalSpent: 240.0,
    lastVisit: '2026-10-09',
    firstVisit: '2026-05-20'
  }
];

// Helper to get formatted dates for current month (Oct 2026)
const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientCode: 'JBL-1001',
    clientName: 'Carolina Benítez',
    clientPhone: '0991234888',
    clientEmail: 'carolina.b@gmail.com',
    serviceId: 'srv-3',
    serviceName: 'Hollywood Laser Peel (Carbón Activado)',
    servicePrice: 50.0,
    specialistId: 'u-1',
    specialistName: 'Jilly Directora',
    date: getTodayDate(),
    time: '10:00',
    durationMin: 60,
    status: 'in_progress',
    notes: 'Piel limpia previa, aplicar tónico calmante post láser.',
    skinType: 'Mixta',
    createdBy: 'Andrea Ortiz',
    createdAt: '2026-10-10'
  },
  {
    id: 'apt-2',
    clientCode: 'JBL-1002',
    clientName: 'Gabriela Mendoza',
    clientPhone: '0984433221',
    clientEmail: 'gaby.mendoza@hotmail.com',
    serviceId: 'srv-9',
    serviceName: 'Manicura Rusa + Esmaltado Semipermanente',
    servicePrice: 22.0,
    specialistId: 'u-4',
    specialistName: 'Sofía Herrera',
    date: getTodayDate(),
    time: '11:30',
    durationMin: 60,
    status: 'confirmed',
    notes: 'Retiro de esmalte anterior + diseño french dorado.',
    createdBy: 'Andrea Ortiz',
    createdAt: '2026-10-11'
  },
  {
    id: 'apt-3',
    clientCode: 'JBL-1003',
    clientName: 'Lorena Zambrano',
    clientPhone: '0997788990',
    serviceId: 'srv-1',
    serviceName: 'Depilación Láser Diodo (Zonas a Elección)',
    servicePrice: 35.0,
    specialistId: 'u-3',
    specialistName: 'Camila Morales',
    date: getTodayDate(),
    time: '14:00',
    durationMin: 45,
    status: 'scheduled',
    notes: 'Sesión 4 piernas completas + axilas. Revisar vello fino.',
    createdBy: 'Andrea Ortiz',
    createdAt: '2026-10-11'
  },
  {
    id: 'apt-4',
    clientCode: 'JBL-1004',
    clientName: 'Daniela Salazar',
    clientPhone: '0993322110',
    serviceId: 'srv-2',
    serviceName: 'Dermapen Bioestimulación Celular',
    servicePrice: 45.0,
    specialistId: 'u-2',
    specialistName: 'Dra. Valentina Paz',
    date: getTodayDate(),
    time: '16:00',
    durationMin: 60,
    status: 'scheduled',
    notes: 'Aplicar anestesia tópica 20 min antes.',
    createdBy: 'Andrea Ortiz',
    createdAt: '2026-10-12'
  },
  {
    id: 'apt-5',
    clientCode: 'JBL-1005',
    clientName: 'María Fernanda Vega',
    clientPhone: '0985544332',
    serviceId: 'srv-12',
    serviceName: 'Masaje Reductor con Aparatología (Cavitación + RF)',
    servicePrice: 45.0,
    specialistId: 'u-3',
    specialistName: 'Camila Morales',
    date: getTodayDate(),
    time: '17:30',
    durationMin: 60,
    status: 'scheduled',
    notes: 'Zona abdomen y flancos.',
    createdBy: 'Andrea Ortiz',
    createdAt: '2026-10-12'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    ticketNumber: 'TKT-2026-0041',
    date: '2026-10-11T16:45:00',
    clientName: 'Carolina Benítez',
    clientPhone: '0991234888',
    items: [
      {
        id: 'srv-4',
        type: 'service',
        name: 'Dermaplaning + Mascarilla Hidronutritiva',
        quantity: 1,
        unitPrice: 30.0,
        total: 30.0,
        specialistId: 'u-1',
        specialistName: 'Jilly Directora'
      },
      {
        id: 'prod-1',
        type: 'product',
        name: 'Serum Ácido Hialurónico Puro 2% (30ml)',
        quantity: 1,
        unitPrice: 28.0,
        total: 28.0
      }
    ],
    subtotal: 58.0,
    discount: 3.0,
    tax: 0,
    total: 55.0,
    paymentMethod: 'card',
    paymentReference: 'VOUCHER-9921',
    cashierName: 'Andrea Ortiz'
  },
  {
    id: 'sale-102',
    ticketNumber: 'TKT-2026-0042',
    date: '2026-10-11T18:10:00',
    clientName: 'Gabriela Mendoza',
    clientPhone: '0984433221',
    items: [
      {
        id: 'srv-11',
        type: 'service',
        name: 'Uñas Esculpidas en Acrílico / Gel',
        quantity: 1,
        unitPrice: 35.0,
        total: 35.0,
        specialistId: 'u-4',
        specialistName: 'Sofía Herrera'
      },
      {
        id: 'prod-4',
        type: 'product',
        name: 'Aceite Reparador de Cutículas con Vitamina E',
        quantity: 1,
        unitPrice: 9.0,
        total: 9.0
      }
    ],
    subtotal: 44.0,
    discount: 0,
    tax: 0,
    total: 44.0,
    paymentMethod: 'cash',
    cashierName: 'Andrea Ortiz'
  },
  {
    id: 'sale-103',
    ticketNumber: 'TKT-2026-0043',
    date: '2026-10-10T11:20:00',
    clientName: 'Lorena Zambrano',
    clientPhone: '0997788990',
    items: [
      {
        id: 'srv-1',
        type: 'service',
        name: 'Depilación Láser Diodo (Zonas a Elección)',
        quantity: 1,
        unitPrice: 35.0,
        total: 35.0,
        specialistId: 'u-3',
        specialistName: 'Camila Morales'
      },
      {
        id: 'prod-2',
        type: 'product',
        name: 'Protector Solar Toque Seco FPS 50+ Invisible',
        quantity: 1,
        unitPrice: 32.0,
        total: 32.0
      }
    ],
    subtotal: 67.0,
    discount: 5.0,
    tax: 0,
    total: 62.0,
    paymentMethod: 'transfer',
    paymentReference: 'TRANSF-PICHINCHA-4491',
    cashierName: 'Andrea Ortiz'
  },
  {
    id: 'sale-104',
    ticketNumber: 'TKT-2026-0044',
    date: '2026-10-09T15:30:00',
    clientName: 'Daniela Salazar',
    clientPhone: '0993322110',
    items: [
      {
        id: 'srv-7',
        type: 'service',
        name: 'Micropigmentación de Cejas (Microblading)',
        quantity: 1,
        unitPrice: 90.0,
        total: 90.0,
        specialistId: 'u-4',
        specialistName: 'Sofía Herrera'
      }
    ],
    subtotal: 90.0,
    discount: 0,
    tax: 0,
    total: 90.0,
    paymentMethod: 'transfer',
    paymentReference: 'TRANSF-GUAYAQUIL-8812',
    cashierName: 'Andrea Ortiz'
  },
  {
    id: 'sale-105',
    ticketNumber: 'TKT-2026-0045',
    date: '2026-10-08T17:00:00',
    clientName: 'María Fernanda Vega',
    clientPhone: '0985544332',
    items: [
      {
        id: 'srv-6',
        type: 'service',
        name: 'Peeling Químico Despigmentante / Anti-Acné',
        quantity: 1,
        unitPrice: 40.0,
        total: 40.0,
        specialistId: 'u-2',
        specialistName: 'Dra. Valentina Paz'
      },
      {
        id: 'prod-3',
        type: 'product',
        name: 'Crema Despigmentante Noche con Ácido Kójico',
        quantity: 1,
        unitPrice: 35.0,
        total: 35.0
      }
    ],
    subtotal: 75.0,
    discount: 5.0,
    tax: 0,
    total: 70.0,
    paymentMethod: 'card',
    paymentReference: 'VOUCHER-3382',
    cashierName: 'Andrea Ortiz'
  },
  {
    id: 'sale-106',
    ticketNumber: 'TKT-2026-0046',
    date: '2026-10-07T12:00:00',
    clientName: 'Valeria Cárdenas',
    clientPhone: '0996655443',
    items: [
      {
        id: 'srv-12',
        type: 'service',
        name: 'Masaje Reductor con Aparatología (Cavitación + RF)',
        quantity: 2,
        unitPrice: 45.0,
        total: 90.0,
        specialistId: 'u-3',
        specialistName: 'Camila Morales'
      }
    ],
    subtotal: 90.0,
    discount: 10.0,
    tax: 0,
    total: 80.0,
    paymentMethod: 'cash',
    cashierName: 'Andrea Ortiz'
  },
  {
    id: 'sale-107',
    ticketNumber: 'TKT-2026-0047',
    date: '2026-10-05T14:15:00',
    clientName: 'Romina Alvear',
    clientPhone: '0981122334',
    items: [
      {
        id: 'srv-3',
        type: 'service',
        name: 'Hollywood Laser Peel (Carbón Activado)',
        quantity: 1,
        unitPrice: 50.0,
        total: 50.0,
        specialistId: 'u-1',
        specialistName: 'Jilly Directora'
      },
      {
        id: 'srv-10',
        type: 'service',
        name: 'Pedicura Spa Hidratante Profunda',
        quantity: 1,
        unitPrice: 26.0,
        total: 26.0,
        specialistId: 'u-4',
        specialistName: 'Sofía Herrera'
      }
    ],
    subtotal: 76.0,
    discount: 6.0,
    tax: 0,
    total: 70.0,
    paymentMethod: 'transfer',
    paymentReference: 'TRANSF-7761',
    cashierName: 'Andrea Ortiz'
  }
];

export const INITIAL_CASH_SHIFT: CashShift = {
  id: 'shift-10',
  openedAt: `${getTodayDate()}T08:30:00`,
  openedBy: 'Andrea Ortiz',
  openingAmount: 100.0,
  cashSales: 44.0,
  cardSales: 55.0,
  transferSales: 62.0,
  expenses: 15.0,
  status: 'open',
  movements: [
    {
      id: 'mov-1',
      type: 'expense',
      amount: 15.0,
      reason: 'Compra de agua mineral y toallas desechables para sala de espera',
      date: `${getTodayDate()}T11:00:00`,
      staffName: 'Andrea Ortiz'
    }
  ]
};
