const fs = require('fs');

const file = 'c:/Users/Elias/.gemini/antigravity/scratch/app Fiamma/context/ConfigContext.tsx';
let text = fs.readFileSync(file, 'utf8');

// I will just find the start of useEffect and the end of it (where `loadData(); }` is), and replace the WHOLE THING.

const newUseEffect = `    // Load from Supabase on mount with migration and self-healing logic
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

                    const phoneToUse = (savedPhone || DEFAULT_PHONE).replace(/\\D/g, '');
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
                        if (adminPinVal) setAdminPin(adminPinVal);
                        if (phoneVal) setBusinessPhone(phoneVal.replace(/\\D/g, ''));
                        if (instagramVal) setInstagramLink(instagramVal);
                        if (categoryOrderVal) setCategoryOrder(JSON.parse(categoryOrderVal));
                        if (blockedDatesVal) setBlockedDates(JSON.parse(blockedDatesVal));
                        if (productOrdersVal) setProductOrders(JSON.parse(productOrdersVal));
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
                    if (clientProfilesData) setClientProfiles(clientProfilesData);
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
    }, []);`;

const startStr = "    // Load from Supabase on mount with migration and self-healing logic";
const endStr = "    const updateServices = async (newServices: Service[]) => {";

const startIndex = text.indexOf(startStr);
const endIndex = text.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
    const originalBlock = text.substring(startIndex, endIndex);
    text = text.replace(originalBlock, newUseEffect + "\n\n");
    fs.writeFileSync(file, text, 'utf8');
    console.log("Restored properly!");
} else {
    console.log("Could not find bounds!");
}
