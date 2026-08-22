"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service } from '@/components/booking/ServiceSelection';
import { supabase } from '@/lib/supabase';
import { Toast } from '@/components/ui/Toast';

export interface FAQ {
    id: string;
    question: string; // ES
    answer: string;   // ES
    question_en?: string;
    answer_en?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    image: string; // Base64
    pin?: string; // New: individual pin
    showOnHome?: boolean; // New: toggle visibility on home page
}

export interface Booking {
    id: string;
    clientName: string;
    clientPhone: string;
    serviceId: string;
    serviceName: string;
    price: number;
    paymentMethod: 'cash' | 'card' | 'mixed';
    cashAmount?: number;
    cardAmount?: number;
    date: string; // ISO
    time: string;
    createdAt: string;
    status: 'pending' | 'confirmed' | 'attended' | 'absent';
    professionalId?: string;
}

export interface ClinicalRecord {
    id: string;
    clientName: string;
    clientPhone: string;
    professionalId: string | null;
    professionalName: string;
    date: string;
    treatment: string;
    notes: string;
}

export interface Review {
    id: string;
    clientName: string;
    rating: number; // 1-5
    comment: string;
    date: string;
    approved: boolean; // For moderation
}

export interface ProfessionalBlock {
    id: string;
    date: string; // YYYY-MM-DD
    professionalId: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    color: string;
}

export interface Expense {
    id: string;
    categoryId: string;
    categoryName: string;
    amount: number;
    description: string;
    date: string; // YYYY-MM-DD
    paymentMethod: 'cash' | 'card' | 'transfer';
    createdAt: string;
}

export interface OrderItem {
    productName: string;
    costPrice: number;
    sellingPrice: number;
}

export interface ProductOrder {
    id: string;
    products?: OrderItem[]; // New array of products
    productName?: string; // Legacy
    costPrice?: number; // Legacy
    sellingPrice?: number; // Legacy
    clientName: string;
    status: 'pending' | 'delivered' | 'cancelled';
    date: string; // YYYY-MM-DD
}

export interface TimeBlock {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
}


// ─── PREMIUM MODULE INTERFACES ───────────────────────────

export interface ClientProfile {
    id: string;
    phone: string;
    name: string;
    email?: string;
    birthdate?: string; // YYYY-MM-DD
    allergies?: string;
    preferences?: string;
    privateNotes?: string;
    tags: string[];
    totalSpent: number;
    visitCount: number;
    lastVisit?: string;
    lastServiceName?: string;
    createdAt: string;
}

export interface InventoryCategory {
    id: string;
    name: string;
    description?: string;
}

export interface InventoryItem {
    id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    unit: 'ml' | 'L' | 'g' | 'kg' | 'units';
    currentQuantity: number;
    costPerUnit: number;
    alertThreshold: number;
    lastRestockDate?: string;
    supplier?: string;
    createdAt: string;
}

export interface ServiceInventoryCost {
    id: string;
    serviceId: string;
    inventoryItemId: string;
    inventoryItemName: string;
    quantityUsed: number;
    costPerUnit: number;
}

export interface AnalyticsMetrics {
    thisMonthIncome: number;
    lastMonthIncome: number;
    incomeGrowthPercent: number;
    averageTicket: number;
    occupancyPercent: number;
    newClientsThisMonth: number;
    topServices: Array<{ name: string; revenue: number; count: number; profitMargin: number }>;
    incomeByMonth: Array<{ month: string; income: number }>;
    occupancyByProfessional: Array<{ name: string; percent: number }>;
}

interface ConfigContextType {
    services: Service[];
    businessPhone: string;
    instagramLink: string;
    categoryOrder: string[];
    adminPin: string;
    blockedDates: string[];
    professionalBlocks: ProfessionalBlock[];
    timeBlocks: TimeBlock[];
    faqs: FAQ[];
    galleryImages: string[];
    team: TeamMember[];
    bookings: Booking[];
    reviews: Review[];
    clinicalRecords: ClinicalRecord[];
    expenseCategories: ExpenseCategory[];
    expenses: Expense[];

    productOrders: ProductOrder[];
    // Premium modules
    clientProfiles: ClientProfile[];
    inventoryCategories: InventoryCategory[];
    inventoryItems: InventoryItem[];
    serviceInventoryCosts: ServiceInventoryCost[];
    analyticsMetrics: AnalyticsMetrics | null;
    updateServices: (services: Service[]) => void;
    updatePhone: (phone: string) => void;
    updateInstagramLink: (link: string) => void;
    updateCategoryOrder: (order: string[]) => void;
    updatePin: (pin: string) => void;
    toggleBlockedDate: (date: string) => void;
    updateBlockedDates: (dates: string[]) => void;
    addProfessionalBlock: (block: ProfessionalBlock) => void;
    removeProfessionalBlock: (id: string) => void;
    addTimeBlock: (block: TimeBlock) => void;
    removeTimeBlock: (id: string) => void;
    updateFaqs: (faqs: FAQ[]) => void;
    updateGallery: (images: string[]) => void;
    updateTeam: (team: TeamMember[]) => void;
    addBooking: (booking: Booking) => Promise<boolean>;
    updateBooking: (booking: Booking) => Promise<boolean>;
    updateBookingStatus: (id: string, status: Booking['status']) => void;
    deleteBooking: (id: string) => void;
    addReview: (review: Review) => void;
    deleteReview: (id: string) => void;
    addClinicalRecord: (record: ClinicalRecord) => void;
    updateClinicalRecord: (record: ClinicalRecord) => void;
    deleteClinicalRecord: (id: string) => void;
    addExpenseCategory: (category: ExpenseCategory) => void;
    updateExpenseCategory: (category: ExpenseCategory) => void;
    deleteExpenseCategory: (id: string) => void;
    addExpense: (expense: Expense) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    addProductOrder: (order: ProductOrder) => void;
    updateProductOrder: (order: ProductOrder) => void;
    deleteProductOrder: (id: string) => void;

    handleProductOrdersBatch: (newOrders: ProductOrder[], updatedOrder?: ProductOrder) => void;
    // CRM
    addClientProfile: (client: ClientProfile) => void;
    updateClientProfile: (client: ClientProfile) => void;
    deleteClientProfile: (id: string) => void;
    // Inventory
    addInventoryCategory: (cat: InventoryCategory) => void;
    updateInventoryCategory: (cat: InventoryCategory) => void;
    deleteInventoryCategory: (id: string) => void;
    addInventoryItem: (item: InventoryItem) => void;
    updateInventoryItem: (item: InventoryItem) => void;
    deleteInventoryItem: (id: string) => void;
    addServiceInventoryCost: (link: ServiceInventoryCost) => void;
    updateServiceInventoryCost: (link: ServiceInventoryCost) => void;
    deleteServiceInventoryCost: (id: string) => void;
    // Analytics
    calculateAnalytics: () => void;
    importHolidays: () => void;
    resetToDefaults: () => void;
    notification: { message: string, type: 'success' | 'error' } | null;
    showNotification: (message: string, type: 'success' | 'error') => void;
    clearNotification: () => void;
    isLoaded: boolean;
    importedClients: string[];
    importClient: (clientKey: string) => Promise<void>;
}

const DEFAULT_SERVICES: Service[] = [];

const DEFAULT_PHONE = '5493516095373';
const DEFAULT_INSTAGRAM = 'https://www.instagram.com/fiamma_estetica/';
const DEFAULT_PIN = '1234';
const DEFAULT_BLOCKED_DATES: string[] = [];
const DEFAULT_PROFESSIONAL_BLOCKS: ProfessionalBlock[] = [];
const DEFAULT_FAQS: FAQ[] = [
    {
        id: '1',
        question: '¿Con cuánto tiempo debo cancelar?',
        answer: 'Requerimos al menos 24hs de aviso para cancelaciones sin cargo.',
        question_en: 'How far in advance should I cancel?',
        answer_en: 'We require at least 24 hours notice for cancellations free of charge.'
    },
    {
        id: '2',
        question: '¿Qué medios de pago aceptan?',
        answer: 'Efectivo y Tarjeta.',
        question_en: 'What payment methods do you accept?',
        answer_en: 'Cash and Card.'
    },
];
const DEFAULT_GALLERY: string[] = [];
const DEFAULT_TEAM: TeamMember[] = [];
const DEFAULT_BOOKINGS: Booking[] = [];
const DEFAULT_REVIEWS: Review[] = [];

const ARGENTINA_HOLIDAYS_2026 = [
    '2026-01-01', // Año Nuevo
    '2026-02-16', // Carnaval
    '2026-02-17', // Carnaval
    '2026-03-24', // Día de la Memoria
    '2026-04-02', // Malvinas
    '2026-04-03', // Viernes Santo
    '2026-05-01', // Día del Trabajador
    '2026-05-25', // Revolución de Mayo
    '2026-06-20', // Día de la Bandera
    '2026-07-09', // Día de la Independencia
    '2026-08-17', // San Martín
    '2026-10-12', // Diversidad Cultural
    '2026-11-23', // Soberanía Nacional
    '2026-12-08', // Inmaculada Concepción
    '2026-12-25', // Navidad
];

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [services, setServices] = useState<Service[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('estetica_services');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) { return []; }
        }
        return [];
    });
    const [businessPhone, setBusinessPhone] = useState(() => {
        if (typeof window === 'undefined') return DEFAULT_PHONE;
        const saved = localStorage.getItem('estetica_phone');
        return saved ? saved.replace(/\D/g, '') : DEFAULT_PHONE;
    });
    const [instagramLink, setInstagramLink] = useState(DEFAULT_INSTAGRAM);
    const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
    const [adminPin, setAdminPin] = useState(DEFAULT_PIN);
    const [blockedDates, setBlockedDates] = useState<string[]>(DEFAULT_BLOCKED_DATES);
    const [professionalBlocks, setProfessionalBlocks] = useState<ProfessionalBlock[]>(DEFAULT_PROFESSIONAL_BLOCKS);
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_FAQS;
        const saved = localStorage.getItem('estetica_faqs');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : DEFAULT_FAQS;
            } catch (e) { return DEFAULT_FAQS; }
        }
        return DEFAULT_FAQS;
    });
    const [galleryImages, setGalleryImages] = useState<string[]>(DEFAULT_GALLERY);
    const [team, setTeam] = useState<TeamMember[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_TEAM;
        const saved = localStorage.getItem('estetica_team');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : DEFAULT_TEAM;
            } catch (e) { return DEFAULT_TEAM; }
        }
        return DEFAULT_TEAM;
    });
    const [bookings, setBookings] = useState<Booking[]>(DEFAULT_BOOKINGS);
    const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
    const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [productOrders, setProductOrders] = useState<ProductOrder[]>([]);
    // Premium module state
    const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>([]);
    const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [serviceInventoryCosts, setServiceInventoryCosts] = useState<ServiceInventoryCost[]>([]);
    const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [importedClients, setImportedClients] = useState<string[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('estetica_imported_clients');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) { return []; }
        }
        return [];
    });

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
    };

    const clearNotification = () => setNotification(null);

    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Supabase on mount with migration and self-healing logic
    useEffect(() => {
        async function loadData() {
            try {
                console.log('Iniciando sincronización con la nube...');

                // TIER 1: Critical for initial UI display and booking basic functionality
                const [
                    { data: servicesData },
                    { data: configData },
                    { data: proBlockedData },
                    { data: timeBlockedData },
                ] = await Promise.all([
                    supabase.from('services').select('*').order('sort_order', { ascending: true }),
                    supabase.from('app_config').select('*'),
                    supabase.from('professional_blocks').select('*'),
                    supabase.from('time_blocks').select('*'),
                ]);

                // Improved Cloud-Ready check:
                const cloudIsInitialized = (configData && configData.length > 0);
                const cloudIsEmpty = (servicesData && servicesData.length === 0) && !cloudIsInitialized;

                if (cloudIsEmpty) {
                    console.log('Cloud detectado como nuevo. Buscando datos locales para migrar...');

                    const savedServices = localStorage.getItem('estetica_services');
                    const savedFaqs = localStorage.getItem('estetica_faqs');
                    const savedPhone = localStorage.getItem('estetica_phone');

                    let servicesToUse = savedServices ? JSON.parse(savedServices) : DEFAULT_SERVICES;
                    const hasValidCategories = servicesToUse.every((s: Service) => s.category && s.category !== 'Otros');
                    if (!hasValidCategories) {
                        console.log('Datos locales antiguos detectados. Usando nuevos defaults...');
                        servicesToUse = DEFAULT_SERVICES;
                    }

                    const phoneToUse = (savedPhone || DEFAULT_PHONE).replace(/\D/g, '');
                    setServices(servicesToUse);
                    setBusinessPhone(phoneToUse);

                    // Upload to Cloud
                    await supabase.from('services').upsert(servicesToUse);
                    await supabase.from('app_config').upsert({ key: 'business_phone', value: phoneToUse });

                    const savedTeam = localStorage.getItem('estetica_team');
                    if (savedTeam) {
                        const teamToUse = JSON.parse(savedTeam);
                        await supabase.from('team').insert(teamToUse);
                    }
                } else {
                    // Cloud has data
                    setServices(servicesData || []);
                    if (proBlockedData) setProfessionalBlocks(proBlockedData);
                    if (timeBlockedData) setTimeBlocks(timeBlockedData);

                    if (configData) {
                        const adminPinVal = configData.find((c: any) => c.key === 'admin_pin')?.value;
                        const phoneVal = configData.find((c: any) => c.key === 'business_phone')?.value;
                        const instagramVal = configData.find((c: any) => c.key === 'instagram_link')?.value;
                        const categoryOrderVal = configData.find((c: any) => c.key === 'category_order')?.value;
                        const blockedDatesVal = configData.find((c: any) => c.key === 'blocked_dates')?.value;
                        const productOrdersVal = configData.find((c: any) => c.key === 'product_orders')?.value;
                        const importedClientsVal = configData.find((c: any) => c.key === 'imported_clients')?.value;
                        
                        if (adminPinVal) setAdminPin(adminPinVal);
                        if (phoneVal) setBusinessPhone(phoneVal.replace(/\D/g, ''));
                        if (instagramVal) setInstagramLink(instagramVal);
                        if (categoryOrderVal) setCategoryOrder(JSON.parse(categoryOrderVal));
                        if (blockedDatesVal) setBlockedDates(JSON.parse(blockedDatesVal));
                        if (productOrdersVal) setProductOrders(JSON.parse(productOrdersVal));
                        if (importedClientsVal) {
                            try {
                                const parsed = JSON.parse(importedClientsVal);
                                if (Array.isArray(parsed)) setImportedClients(parsed);
                            } catch (e) {}
                        }
                    }
                }

                // Show UI as soon as tier 1 is ready
                setIsLoaded(true);

                // TIER 2: Background data (non-blocking for initial booking view)
                Promise.all([
                    supabase.from('faqs').select('*'),
                    supabase.from('team').select('*'),
                    supabase.from('bookings').select('*').order('created_at', { ascending: false }),
                    supabase.from('reviews').select('*').order('date', { ascending: false }),
                    supabase.from('clinical_records').select('*').order('date', { ascending: false }),
                    supabase.from('gallery').select('*'),
                    supabase.from('expense_categories').select('*'),
                    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
                    supabase.from('client_profiles').select('*').order('created_at', { ascending: false }),
                    supabase.from('inventory_categories').select('*'),
                    supabase.from('inventory_items').select('*').order('created_at', { ascending: false }),
                    supabase.from('service_inventory_costs').select('*')
                ]).then(([
                    { data: faqsData },
                    { data: teamData },
                    { data: bookingsData },
                    { data: reviewsData },
                    { data: clinicalData },
                    { data: galleryData },
                    { data: expenseCategoriesData },
                    { data: expensesData },
                    { data: clientProfilesData },
                    { data: invCategoriesData },
                    { data: invItemsData },
                    { data: svcInvCostsData }
                ]) => {
                    if (faqsData) setFaqs(faqsData);
                    if (teamData) setTeam(teamData);

                    if (bookingsData) {
                        const mappedBookings = bookingsData.map((b: any) => ({
                            ...b,
                            clientName: b.client_name,
                            clientPhone: b.client_phone,
                            serviceId: b.service_id,
                            serviceName: b.service_name,
                            paymentMethod: b.payment_method,
                            cashAmount: b.cash_amount, // New mapped field
                            cardAmount: b.card_amount, // New mapped field
                            professionalId: b.professional_id,
                            createdAt: b.created_at
                        }));
                        setBookings(mappedBookings);
                    }
                    if (reviewsData) setReviews(reviewsData.map((r: any) => ({ ...r, clientName: r.client_name })));
                    if (clinicalData) {
                        setClinicalRecords(clinicalData.map((c: any) => ({
                            ...c,
                            clientName: c.client_name,
                            clientPhone: c.client_phone,
                            professionalId: c.professional_id,
                            professionalName: c.professional_name
                        })));
                    }
                    if (galleryData) setGalleryImages(galleryData.map((g: any) => g.image_url));
                    if (expenseCategoriesData) setExpenseCategories(expenseCategoriesData);
                    if (expensesData) {
                        setExpenses(expensesData.map((e: any) => ({
                            ...e,
                            categoryId: e.category_id,
                            categoryName: e.category_name,
                            paymentMethod: e.payment_method,
                            createdAt: e.created_at
                        })));
                    }
                    if (clientProfilesData) {
                        setClientProfiles(clientProfilesData.map((c: any) => ({
                            ...c,
                            privateNotes: c.private_notes,
                            totalSpent: c.total_spent,
                            visitCount: c.visit_count,
                            lastVisit: c.last_visit,
                            lastServiceName: c.last_service_name,
                            createdAt: c.created_at
                        })));
                    }
                    if (invCategoriesData) setInventoryCategories(invCategoriesData);
                    if (invItemsData) {
                        setInventoryItems(invItemsData.map((i: any) => ({
                            ...i,
                            categoryId: i.category_id,
                            categoryName: i.category_name,
                            currentQuantity: i.current_quantity,
                            costPerUnit: i.cost_per_unit,
                            alertThreshold: i.alert_threshold,
                            lastRestockDate: i.last_restock_date,
                            supplier: i.supplier,
                            createdAt: i.created_at
                        })));
                    }
                    if (svcInvCostsData) {
                        setServiceInventoryCosts(svcInvCostsData.map((s: any) => ({
                            ...s,
                            serviceId: s.service_id,
                            inventoryItemId: s.inventory_item_id,
                            inventoryItemName: s.inventory_item_name,
                            quantityUsed: s.quantity_used,
                            costPerUnit: s.cost_per_unit
                        })));
                    }
                });

            } catch (error) {
                console.error('Error crítico en sincronización:', error);
                const saved = localStorage.getItem('estetica_services');
                if (saved) setServices(JSON.parse(saved));
                setIsLoaded(true); // Still show something if local exists
            }
        }
        loadData();
    }, []);

    const updateServices = async (newServices: Service[]) => {
        setServices(newServices);
        // Keep localStorage as a rescue fallback, but cloud is primary
        localStorage.setItem('estetica_services', JSON.stringify(newServices));

        console.log('🔄 Sincronizando servicios con una estrategia diferencial...');

        try {
            // 1. Obtener IDs actuales en la BD para saber cuáles borrar
            const { data: currentDbServices, error: fetchError } = await supabase.from('services').select('id');

            if (fetchError) {
                console.error('❌ Error al obtener servicios actuales:', fetchError);
                return;
            }

            const currentIds = currentDbServices?.map((s: { id: string }) => s.id) || [];
            const newIds = newServices.map(s => s.id);

            // 2. Identificar IDs que ya no existen (para borrar)
            const idsToDelete = currentIds.filter((id: string) => !newIds.includes(id));

            console.log('📊 DIAGNÓSTICO DE SINCRONIZACIÓN:');
            console.log('   - IDs en Base de Datos:', currentIds);
            console.log('   - IDs en Nuevo Estado:', newIds);
            console.log('   - IDs Detectados para Borrar:', idsToDelete);

            // 3. Borrar solo los servicios removidos
            if (idsToDelete.length > 0) {
                console.log('🗑️ Intentando eliminar servicios:', idsToDelete);
                const { error: deleteError, count } = await supabase
                    .from('services')
                    .delete({ count: 'exact' }) // Request count of deleted rows
                    .in('id', idsToDelete);

                if (deleteError) {
                    console.error('❌ Error al eliminar servicios:', deleteError);
                    alert('⚠️ No se pudieron eliminar algunos servicios. Error: ' + deleteError.message);
                } else {
                    console.log(`✅ Servicios eliminados correctamente. Registros afectados: ${count}`);
                }
            }

            // 4. Actualizar o Insertar los servicios actuales (Upsert)
            if (newServices.length > 0) {
                console.log('💾 Intentando guardar en Supabase:', newServices);
                const { error: upsertError, data: upsertData } = await supabase
                    .from('services')
                    .upsert(newServices, { onConflict: 'id' })
                    .select(); // Request back the data to verify what was saved

                if (upsertError) {
                    console.error('❌ Error al guardar servicios:', upsertError);
                    alert('Error al guardar cambios: ' + upsertError.message);
                } else {
                    console.log('✅ Servicios actualizados correctamente en DB:', upsertData);
                }
            }

            // 5. RE-FETCH FINAL (Para asegurar que lo que ve el usuario es lo real)
            const { data: finalData } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
            if (finalData) {
                console.log('🔄 Sincronización final: actualizando estado local desde DB');
                setServices(finalData);
            }

        } catch (err) {
            console.error('❌ Error inesperado en updateServices:', err);
            alert('Ocurrió un error inesperado al guardar los servicios.');
        }
    };

    const updatePhone = async (phone: string) => {
        const cleanPhone = phone.replace(/\D/g, '');
        setBusinessPhone(cleanPhone);
        localStorage.setItem('estetica_phone', cleanPhone);

        const { error } = await supabase
            .from('app_config')
            .upsert({ key: 'business_phone', value: cleanPhone }, { onConflict: 'key' });

        if (error) {
            console.error('❌ Error al actualizar teléfono:', error);
            showNotification('Error al guardar teléfono: ' + error.message, 'error');
        } else {
            console.log('✅ Teléfono actualizado exitosamente:', cleanPhone);
        }
    };

    const updateInstagramLink = async (link: string) => {
        setInstagramLink(link);
        const { error } = await supabase
            .from('app_config')
            .upsert({ key: 'instagram_link', value: link }, { onConflict: 'key' });
        if (error) {
            console.error('❌ Error al actualizar Instagram:', error);
            showNotification('Error al guardar Instagram: ' + error.message, 'error');
        }
    };

    const updateCategoryOrder = async (order: string[]) => {
        setCategoryOrder(order);
        const { error } = await supabase
            .from('app_config')
            .upsert({ key: 'category_order', value: JSON.stringify(order) }, { onConflict: 'key' });
        if (error) console.error('❌ Error al actualizar orden:', error);
    };

    const updatePin = async (pin: string) => {
        setAdminPin(pin);
        const { error } = await supabase.from('app_config').upsert({ key: 'admin_pin', value: pin }, { onConflict: 'key' });
        if (error) console.error('❌ Error al actualizar PIN:', error);
    };

    const toggleBlockedDate = async (date: string) => {
        const newBlocked = blockedDates.includes(date)
            ? blockedDates.filter(d => d !== date)
            : [...blockedDates, date];
        setBlockedDates(newBlocked);
        await supabase.from('app_config').upsert({ key: 'blocked_dates', value: JSON.stringify(newBlocked) }, { onConflict: 'key' });
    };

    const updateBlockedDates = async (newBlocked: string[]) => {
        setBlockedDates(newBlocked);
        await supabase.from('app_config').upsert({ key: 'blocked_dates', value: JSON.stringify(newBlocked) }, { onConflict: 'key' });
    };

    const addProfessionalBlock = async (block: ProfessionalBlock) => {
        setProfessionalBlocks(prev => [...prev, block]);
        await supabase.from('professional_blocks').insert(block);
    };

    const removeProfessionalBlock = async (id: string) => {
        setProfessionalBlocks(prev => prev.filter(b => b.id !== id));
        await supabase.from('professional_blocks').delete().eq('id', id);
    };

    const addTimeBlock = async (block: TimeBlock) => {
        setTimeBlocks(prev => [...prev, block]);
        await supabase.from('time_blocks').insert(block);
    };

    const removeTimeBlock = async (id: string) => {
        setTimeBlocks(prev => prev.filter(b => b.id !== id));
        await supabase.from('time_blocks').delete().eq('id', id);
    };

    const updateFaqs = async (newFaqs: FAQ[]) => {
        setFaqs(newFaqs);
        const { error: delError } = await supabase.from('faqs').delete().not('id', 'is', null);
        if (delError) {
            console.error('❌ Error al limpiar FAQs:', delError);
            showNotification('Error al sincronizar FAQs: ' + delError.message, 'error');
            return;
        }

        const { error: insError } = await supabase.from('faqs').insert(newFaqs);
        if (insError) {
            console.error('❌ Error al guardar FAQs:', insError);
            showNotification('Error al guardar FAQs: ' + insError.message, 'error');
        } else {
            console.log('✅ FAQs sincronizadas correctamente');
        }
    };

    const updateGallery = async (images: string[]) => {
        setGalleryImages(images);
        const { error: delError } = await supabase.from('gallery').delete().not('id', 'is', null);
        if (delError) {
            console.error('❌ Error al limpiar galería:', delError);
            showNotification('Error al sincronizar galería: ' + delError.message, 'error');
            return;
        }

        const { error: insError } = await supabase.from('gallery').insert(images.map(url => ({ image_url: url })));
        if (insError) {
            console.error('❌ Error al guardar galería:', insError);
            showNotification('Error al guardar galería: ' + insError.message, 'error');
        } else {
            console.log('✅ Galería sincronizada exitosamente');
            showNotification('Galería guardada con éxito', 'success');
        }
    };

    const updateTeam = async (newTeam: TeamMember[]) => {
        setTeam(newTeam);
        localStorage.setItem('estetica_team', JSON.stringify(newTeam));

        const { error: delError } = await supabase.from('team').delete().not('id', 'is', null);
        if (delError) {
            console.error('❌ Error al limpiar equipo:', delError);
            showNotification('Error al sincronizar equipo: ' + delError.message, 'error');
            return;
        }

        const { error: insError } = await supabase.from('team').insert(newTeam);
        if (insError) {
            console.error('❌ Error al guardar equipo:', insError);
            showNotification('Error al guardar equipo: ' + insError.message, 'error');
        } else {
            console.log('✅ Equipo sincronizado correctamente');
            showNotification('Equipo guardado con éxito', 'success');
        }
    };

    const addBooking = async (booking: Booking): Promise<boolean> => {
        try {
            let serviceId = booking.serviceId;
            if (!serviceId) {
                const matched = services.find(s => s.name.toLowerCase() === booking.serviceName.toLowerCase());
                if (matched) {
                    serviceId = matched.id;
                } else {
                    showNotification('Error: No se encontró el servicio seleccionado', 'error');
                    return false;
                }
            }

            const { error } = await supabase.from('bookings').insert({
                id: booking.id,
                client_name: booking.clientName,
                client_phone: booking.clientPhone,
                service_id: serviceId,
                service_name: booking.serviceName,
                price: booking.price,
                payment_method: booking.paymentMethod,
                cash_amount: booking.cashAmount || (booking.paymentMethod === 'cash' ? booking.price : 0),
                card_amount: booking.cardAmount || (booking.paymentMethod === 'card' ? booking.price : 0),
                date: booking.date,
                time: booking.time,
                status: booking.status,
                professional_id: booking.professionalId || null
            });

            if (error) {
                console.error('❌ Error al guardar reserva en Supabase:', error);
                showNotification('Error al conectar con la base de datos: ' + error.message, 'error');
                return false;
            } else {
                setBookings(prev => [booking, ...prev]);
                
                // Removed Auto-sync CRM to allow manual import from Clientes Detectados
                
                showNotification('¡Turno guardado con éxito!', 'success');
                return true;
            }
        } catch (err) {
            console.error('❌ Error fatal al guardar:', err);
            showNotification('Error inesperado al guardar el turno.', 'error');
            return false;
        }
    };

    const importClient = async (clientKey: string) => {
        setImportedClients(prev => {
            if (prev.includes(clientKey)) return prev;
            const next = [...prev, clientKey];
            localStorage.setItem('estetica_imported_clients', JSON.stringify(next));
            supabase.from('app_config').upsert({ key: 'imported_clients', value: JSON.stringify(next) }, { onConflict: 'key' }).then();
            return next;
        });
    };

    const updateBooking = async (booking: Booking): Promise<boolean> => {
        try {
            let serviceId = booking.serviceId;
            if (!serviceId) {
                const matched = services.find(s => s.name.toLowerCase() === booking.serviceName.toLowerCase());
                if (matched) serviceId = matched.id;
            }

            const { error } = await supabase.from('bookings').update({
                client_name: booking.clientName,
                client_phone: booking.clientPhone,
                service_id: serviceId,
                service_name: booking.serviceName,
                price: booking.price,
                payment_method: booking.paymentMethod,
                cash_amount: booking.cashAmount || (booking.paymentMethod === 'cash' ? booking.price : 0),
                card_amount: booking.cardAmount || (booking.paymentMethod === 'card' ? booking.price : 0),
                date: booking.date,
                time: booking.time,
                status: booking.status,
                professional_id: booking.professionalId || null
            }).eq('id', booking.id);

            if (error) {
                console.error('❌ Error al actualizar reserva:', error);
                showNotification('Error al actualizar el turno: ' + error.message, 'error');
                return false;
            } else {
                setBookings(prev => prev.map(b => b.id === booking.id ? booking : b));
                showNotification('¡Turno actualizado correctamente!', 'success');
                return true;
            }
        } catch (err) {
            console.error('❌ Error fatal al actualizar:', err);
            showNotification('Error inesperado al actualizar.', 'error');
            return false;
        }
    };

    const updateBookingStatus = async (id: string, status: Booking['status']) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        await supabase.from('bookings').update({ status }).eq('id', id);
    };

    const deleteBooking = async (id: string) => {
        setBookings(prev => prev.filter(b => b.id !== id));
        await supabase.from('bookings').delete().eq('id', id);
    };

    const addReview = async (review: Review) => {
        setReviews(prev => [review, ...prev]);
        await supabase.from('reviews').insert({
            id: review.id,
            client_name: review.clientName,
            rating: review.rating,
            comment: review.comment,
            date: review.date,
            approved: review.approved
        });
    };

    const deleteReview = async (id: string) => {
        setReviews(prev => prev.filter(r => r.id !== id));
        await supabase.from('reviews').delete().eq('id', id);
    };

    const addClinicalRecord = async (record: ClinicalRecord) => {
        setClinicalRecords(prev => [record, ...prev]);
        const { error } = await supabase.from('clinical_records').insert({
            id: record.id,
            client_name: record.clientName,
            client_phone: record.clientPhone,
            professional_id: record.professionalId,
            professional_name: record.professionalName,
            date: record.date,
            treatment: record.treatment,
            notes: record.notes
        });

        if (error) {
            console.error('❌ Error saving clinical record to Supabase:', error);
            alert('Error al guardar el registro: ' + error.message);
        } else {
            console.log('✅ Registro clínico guardado en Supabase');
        }
    };

    const updateClinicalRecord = async (record: ClinicalRecord) => {
        setClinicalRecords(prev => prev.map(r => r.id === record.id ? record : r));
        await supabase.from('clinical_records').update({
            notes: record.notes,
            treatment: record.treatment,
            date: record.date
        }).eq('id', record.id);
    };

    const deleteClinicalRecord = async (id: string) => {
        setClinicalRecords(prev => prev.filter(r => r.id !== id));
        await supabase.from('clinical_records').delete().eq('id', id);
    };

    // Expense Category CRUD
    const addExpenseCategory = async (category: ExpenseCategory) => {
        setExpenseCategories(prev => [...prev, category]);
        await supabase.from('expense_categories').insert(category);
    };

    const updateExpenseCategory = async (category: ExpenseCategory) => {
        setExpenseCategories(prev => prev.map(c => c.id === category.id ? category : c));
        await supabase.from('expense_categories').update({
            name: category.name,
            color: category.color
        }).eq('id', category.id);
    };

    const deleteExpenseCategory = async (id: string) => {
        setExpenseCategories(prev => prev.filter(c => c.id !== id));
        await supabase.from('expense_categories').delete().eq('id', id);
        // Also delete all expenses in this category
        setExpenses(prev => prev.filter(e => e.categoryId !== id));
        await supabase.from('expenses').delete().eq('category_id', id);
    };

    // Expense CRUD
    const addExpense = async (expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
        await supabase.from('expenses').insert({
            id: expense.id,
            category_id: expense.categoryId,
            category_name: expense.categoryName,
            amount: expense.amount,
            description: expense.description,
            date: expense.date,
            payment_method: expense.paymentMethod,
            created_at: expense.createdAt
        });
    };

    const updateExpense = async (expense: Expense) => {
        setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
        await supabase.from('expenses').update({
            category_id: expense.categoryId,
            category_name: expense.categoryName,
            amount: expense.amount,
            description: expense.description,
            date: expense.date,
            payment_method: expense.paymentMethod
        }).eq('id', expense.id);
    };

    const deleteExpense = async (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        await supabase.from('expenses').delete().eq('id', id);
    };

    // Product Orders CRUD
    const addProductOrder = async (order: ProductOrder) => {
        const newOrders = [order, ...productOrders];
        setProductOrders(newOrders);
        await supabase.from('app_config').upsert({ key: 'product_orders', value: JSON.stringify(newOrders) }, { onConflict: 'key' });
    };

    const updateProductOrder = async (order: ProductOrder) => {
        const newOrders = productOrders.map(o => o.id === order.id ? order : o);
        setProductOrders(newOrders);
        await supabase.from('app_config').upsert({ key: 'product_orders', value: JSON.stringify(newOrders) }, { onConflict: 'key' });
    };

    const deleteProductOrder = async (id: string) => {
        const newOrders = productOrders.filter(o => o.id !== id);
        setProductOrders(newOrders);
        await supabase.from('app_config').upsert({ key: 'product_orders', value: JSON.stringify(newOrders) }, { onConflict: 'key' });
    };

    const handleProductOrdersBatch = async (newOrders: ProductOrder[], updatedOrder?: ProductOrder) => {
        setProductOrders(prev => {
            let currentOrders = [...prev];
            if (updatedOrder) {
                currentOrders = currentOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            }
            if (newOrders.length > 0) {
                currentOrders = [...newOrders, ...currentOrders];
            }
            // Update Supabase in the background
            supabase.from('app_config')
                .upsert({ key: 'product_orders', value: JSON.stringify(currentOrders) }, { onConflict: 'key' })
                .then((res: any) => {
                    if (res.error) console.error('Error saving product orders batch:', res.error);
                });
            return currentOrders;
        });
    };


    // CRM Methods
    const addClientProfile = async (client: ClientProfile) => {
        setClientProfiles(prev => [client, ...prev]);
        await supabase.from('client_profiles').insert({
            id: client.id,
            phone: client.phone,
            name: client.name,
            email: client.email,
            birthdate: client.birthdate,
            allergies: client.allergies,
            preferences: client.preferences,
            private_notes: client.privateNotes,
            tags: client.tags,
            total_spent: client.totalSpent,
            visit_count: client.visitCount,
            last_visit: client.lastVisit,
            last_service_name: client.lastServiceName,
            created_at: client.createdAt
        });
    };

    const updateClientProfile = async (client: ClientProfile) => {
        setClientProfiles(prev => prev.map(c => c.id === client.id ? client : c));
        await supabase.from('client_profiles').update({
            phone: client.phone,
            name: client.name,
            email: client.email,
            birthdate: client.birthdate,
            allergies: client.allergies,
            preferences: client.preferences,
            private_notes: client.privateNotes,
            tags: client.tags,
            total_spent: client.totalSpent,
            visit_count: client.visitCount,
            last_visit: client.lastVisit,
            last_service_name: client.lastServiceName
        }).eq('id', client.id);
    };

    const deleteClientProfile = async (id: string) => {
        setClientProfiles(prev => prev.filter(c => c.id !== id));
        await supabase.from('client_profiles').delete().eq('id', id);
    };

    // Inventory Methods
    const addInventoryCategory = async (cat: InventoryCategory) => {
        setInventoryCategories(prev => [...prev, cat]);
        await supabase.from('inventory_categories').insert(cat);
    };

    const updateInventoryCategory = async (cat: InventoryCategory) => {
        setInventoryCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
        await supabase.from('inventory_categories').update(cat).eq('id', cat.id);
    };

    const deleteInventoryCategory = async (id: string) => {
        setInventoryCategories(prev => prev.filter(c => c.id !== id));
        await supabase.from('inventory_categories').delete().eq('id', id);
    };

    const addInventoryItem = async (item: InventoryItem) => {
        setInventoryItems(prev => [item, ...prev]);
        await supabase.from('inventory_items').insert({
            id: item.id,
            category_id: item.categoryId,
            category_name: item.categoryName,
            name: item.name,
            unit: item.unit,
            current_quantity: item.currentQuantity,
            cost_per_unit: item.costPerUnit,
            alert_threshold: item.alertThreshold,
            last_restock_date: item.lastRestockDate,
            supplier: item.supplier,
            created_at: item.createdAt
        });
    };

    const updateInventoryItem = async (item: InventoryItem) => {
        setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
        await supabase.from('inventory_items').update({
            category_id: item.categoryId,
            category_name: item.categoryName,
            name: item.name,
            unit: item.unit,
            current_quantity: item.currentQuantity,
            cost_per_unit: item.costPerUnit,
            alert_threshold: item.alertThreshold,
            last_restock_date: item.lastRestockDate,
            supplier: item.supplier
        }).eq('id', item.id);
    };

    const deleteInventoryItem = async (id: string) => {
        setInventoryItems(prev => prev.filter(i => i.id !== id));
        await supabase.from('inventory_items').delete().eq('id', id);
    };

    const addServiceInventoryCost = async (link: ServiceInventoryCost) => {
        setServiceInventoryCosts(prev => [...prev, link]);
        await supabase.from('service_inventory_costs').insert({
            id: link.id,
            service_id: link.serviceId,
            inventory_item_id: link.inventoryItemId,
            inventory_item_name: link.inventoryItemName,
            quantity_used: link.quantityUsed,
            cost_per_unit: link.costPerUnit
        });
    };

    const updateServiceInventoryCost = async (link: ServiceInventoryCost) => {
        setServiceInventoryCosts(prev => prev.map(l => l.id === link.id ? link : l));
        await supabase.from('service_inventory_costs').update({
            quantity_used: link.quantityUsed,
            cost_per_unit: link.costPerUnit
        }).eq('id', link.id);
    };

    const deleteServiceInventoryCost = async (id: string) => {
        setServiceInventoryCosts(prev => prev.filter(l => l.id !== id));
        await supabase.from('service_inventory_costs').delete().eq('id', id);
    };

    const calculateAnalytics = () => {
        if (!bookings.length) return;

        const thisYear = new Date().getFullYear();
        const thisMonth = new Date().getMonth();

        const attendedBookings = bookings.filter(b => b.status === 'attended' || b.status === 'confirmed');

        // This month income
        const thisMonthBookings = attendedBookings.filter(b => {
            const d = new Date(b.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        const thisMonthIncome = thisMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);

        // Last month income
        const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
        const lastMonthBookings = attendedBookings.filter(b => {
            const d = new Date(b.date);
            return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        });
        const lastMonthIncome = lastMonthBookings.reduce((sum, b) => sum + (b.price || 0), 0);

        // Growth percent
        const incomeGrowthPercent = lastMonthIncome > 0
            ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
            : thisMonthIncome > 0 ? 100 : 0;

        // Average ticket
        const averageTicket = thisMonthBookings.length > 0
            ? thisMonthIncome / thisMonthBookings.length
            : 0;

        // New clients this month (first booking ever in this month)
        const allClientPhones = new Set(attendedBookings.filter(b => {
            const d = new Date(b.date);
            return d < new Date(thisYear, thisMonth, 1);
        }).map(b => b.clientPhone));
        const newClientsThisMonth = thisMonthBookings.filter(b => !allClientPhones.has(b.clientPhone)).length;

        // Top services
        const serviceMap = new Map<string, { revenue: number; count: number }>();
        thisMonthBookings.forEach(b => {
            const existing = serviceMap.get(b.serviceName) || { revenue: 0, count: 0 };
            serviceMap.set(b.serviceName, {
                revenue: existing.revenue + (b.price || 0),
                count: existing.count + 1
            });
        });
        const topServices = Array.from(serviceMap.entries())
            .map(([name, data]) => {
                const service = services.find(s => s.name === name);
                const costs = service ? serviceInventoryCosts.filter(c => c.serviceId === service.id) : [];
                const totalCost = costs.reduce((sum, c) => sum + (c.quantityUsed * c.costPerUnit), 0);
                const avgPrice = data.revenue / data.count;
                const profitMargin = avgPrice > 0 ? ((avgPrice - totalCost) / avgPrice) * 100 : 100;
                return { name, revenue: data.revenue, count: data.count, profitMargin };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Income by month (last 12 months)
        const incomeByMonth: Array<{ month: string; income: number }> = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(thisYear, thisMonth - i, 1);
            const monthBookings = attendedBookings.filter(b => {
                const bd = new Date(b.date);
                return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
            });
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            incomeByMonth.push({
                month: monthNames[d.getMonth()],
                income: monthBookings.reduce((sum, b) => sum + (b.price || 0), 0)
            });
        }

        // Occupancy by professional (this month)
        const occupancyByProfessional: Array<{ name: string; percent: number }> = [];
        const teamMembers = team.filter(t => t.showOnHome !== false);
        teamMembers.forEach(member => {
            const memberBookings = thisMonthBookings.filter(b => b.professionalId === member.id);
            const maxSlots = 22 * 8;
            const percent = maxSlots > 0 ? (memberBookings.length / maxSlots) * 100 : 0;
            occupancyByProfessional.push({ name: member.name, percent: Math.min(percent, 100) });
        });

        // Occupancy overall
        const totalSlots = teamMembers.length > 0 ? teamMembers.length * 22 * 8 : 22 * 8;
        const occupancyPercent = totalSlots > 0 ? (thisMonthBookings.length / totalSlots) * 100 : 0;

        setAnalyticsMetrics({
            thisMonthIncome,
            lastMonthIncome,
            incomeGrowthPercent,
            averageTicket,
            occupancyPercent: Math.min(occupancyPercent, 100),
            newClientsThisMonth,
            topServices,
            incomeByMonth,
            occupancyByProfessional
        });
    };

    const importHolidays = async () => {
        const newDates = Array.from(new Set([...blockedDates, ...ARGENTINA_HOLIDAYS_2026]));
        setBlockedDates(newDates);
        await supabase.from('app_config').upsert({ key: 'blocked_dates', value: JSON.stringify(newDates) }, { onConflict: 'key' });
        alert(`Se han importado ${ARGENTINA_HOLIDAYS_2026.length} feriados de Argentina 2026.`);
    };

    const resetToDefaults = () => {
        setServices(DEFAULT_SERVICES);
        setBusinessPhone(DEFAULT_PHONE);
        setAdminPin(DEFAULT_PIN);
        setBlockedDates(DEFAULT_BLOCKED_DATES);
        setFaqs(DEFAULT_FAQS);
        setGalleryImages(DEFAULT_GALLERY);
        setTeam(DEFAULT_TEAM);
        setBookings(DEFAULT_BOOKINGS);
        setReviews(DEFAULT_REVIEWS);
    };

    return (
        <ConfigContext.Provider value={{
            services,
            businessPhone,
            instagramLink,
            categoryOrder,
            adminPin,
            blockedDates,
            professionalBlocks,
            timeBlocks,
            faqs,
            galleryImages,
            team,
            bookings,
            reviews,
            clinicalRecords,
            expenseCategories,
            expenses,
            productOrders,
            clientProfiles,
            inventoryCategories,
            inventoryItems,
            serviceInventoryCosts,
            analyticsMetrics,
            importedClients,
            importClient,
            updateServices,
            updatePhone,
            updateInstagramLink,
            updateCategoryOrder,
            updatePin,
            toggleBlockedDate,
            updateBlockedDates,
            addProfessionalBlock,
            removeProfessionalBlock,
            addTimeBlock,
            removeTimeBlock,
            updateFaqs,
            updateGallery,
            updateTeam,
            addBooking,
            updateBooking,
            updateBookingStatus,
            deleteBooking,
            addReview,
            deleteReview,
            addClinicalRecord,
            updateClinicalRecord,
            deleteClinicalRecord,
            addExpenseCategory,
            updateExpenseCategory,
            deleteExpenseCategory,
            addExpense,
            updateExpense,
            deleteExpense,
            addProductOrder,
            updateProductOrder,
            deleteProductOrder,
            handleProductOrdersBatch,
            addClientProfile,
            updateClientProfile,
            deleteClientProfile,
            addInventoryCategory,
            updateInventoryCategory,
            deleteInventoryCategory,
            addInventoryItem,
            updateInventoryItem,
            deleteInventoryItem,
            addServiceInventoryCost,
            updateServiceInventoryCost,
            deleteServiceInventoryCost,
            calculateAnalytics,
            importHolidays,
            resetToDefaults,
            notification,
            showNotification,
            clearNotification,
            isLoaded
        }}>
            {children}
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={clearNotification}
                />
            )}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
}
