"use client";

import React, { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ServiceEditor } from '@/components/admin/ServiceEditor';
import { Service } from '@/components/booking/ServiceSelection';
import { DateBlocker } from '@/components/admin/DateBlocker';
import { FAQManager } from '@/components/admin/FAQManager';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { TeamManager } from '@/components/admin/TeamManager';
import { BookingList } from '@/components/admin/BookingList';
import { ReviewManager } from '@/components/admin/ReviewManager';
import { ExpenseManager } from '@/components/admin/ExpenseManager';
import { ProductManager } from '@/components/admin/ProductManager';
import { ClientSearch } from '@/components/admin/ClientSearch';

export default function AdminPage() {
    const { services, businessPhone, instagramLink, categoryOrder, adminPin, updateServices, updatePhone, updateInstagramLink, updateCategoryOrder } = useConfig();

    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');

    React.useEffect(() => {
        if (sessionStorage.getItem('admin_authenticated') === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showServices, setShowServices] = useState(false);
    const [phoneInput, setPhoneInput] = useState(businessPhone);
    const [instagramInput, setInstagramInput] = useState(instagramLink);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [creatingInCategory, setCreatingInCategory] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<{ es: string, en: string, original: string } | null>(null);

    // Synchronize local input with context value when it loads
    React.useEffect(() => {
        setPhoneInput(businessPhone);
        setInstagramInput(instagramLink);
    }, [businessPhone, instagramLink]);

    // Auto-show services if editing or creating
    React.useEffect(() => {
        if (editingService || isCreating) {
            setShowServices(true);
        }
    }, [editingService, isCreating]);

    // Initialize categoryOrder if empty
    React.useEffect(() => {
        if (categoryOrder.length === 0 && services.length > 0) {
            const cats = Array.from(new Set(services.map(s => s.category || 'Otros')));
            // Try to maintain a decent default order
            const defaultOrder = [
                'Micropigmentación',
                'Lifting y Cejas',
                'Tratamiento Facial',
                'Tratamiento Corporal',
                ...cats.filter(c => !['Micropigmentación', 'Lifting y Cejas', 'Tratamiento Facial', 'Tratamiento Corporal', 'Otros'].includes(c)),
                'Otros'
            ].filter(c => cats.includes(c));

            if (defaultOrder.length > 0) {
                updateCategoryOrder(defaultOrder);
            }
        }
    }, [services, categoryOrder, updateCategoryOrder]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === adminPin) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_authenticated', 'true');
        } else {
            alert('PIN Incorrecto');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_authenticated');
    };

    const handleSaveService = (service: Service) => {
        if (editingService) {
            updateServices(services.map(s => s.id === service.id ? service : s));
        } else {
            updateServices([...services, service]);
        }
        setEditingService(null);
        setIsCreating(false);
        setCreatingInCategory(null);
    };

    const handleDeleteService = (id: string) => {
        if (confirm('¿Seguro que quieres eliminar este servicio?')) {
            updateServices(services.filter(s => s.id !== id));
            setShowServices(true);
        }
    };
    const handleRenameCategory = () => {
        if (!editingCategory) return;
        const { es, en, original } = editingCategory;

        if (!es.trim()) {
            alert('El nombre en castellano es obligatorio');
            return;
        }

        const updatedServices = services.map(s => {
            if (s.category === original) {
                return { ...s, category: es, category_en: en };
            }
            return s;
        });

        updateServices(updatedServices);
        setEditingCategory(null);
        alert('Categoría actualizada correctamente para todos los servicios');
    };

    const handleMoveService = (serviceId: string, direction: 'up' | 'down') => {
        const serviceIndex = services.findIndex(s => s.id === serviceId);
        if (serviceIndex === -1) return;

        const currentService = services[serviceIndex];
        const categoryServices = services.filter(s => s.category === currentService.category);
        const indexInCategory = categoryServices.findIndex(s => s.id === serviceId);

        if (direction === 'up' && indexInCategory > 0) {
            const prevService = categoryServices[indexInCategory - 1];
            swapSortOrder(currentService, prevService);
        } else if (direction === 'down' && indexInCategory < categoryServices.length - 1) {
            const nextService = categoryServices[indexInCategory + 1];
            swapSortOrder(currentService, nextService);
        }
    };

    const swapSortOrder = (s1: Service, s2: Service) => {
        // Enforce sequential sort orders for the entire category to avoid gaps or duplicates
        const updatedServices = services.map(s => {
            if (s.id === s1.id) return { ...s, sort_order: s2.sort_order ?? services.indexOf(s2) };
            if (s.id === s2.id) return { ...s, sort_order: s1.sort_order ?? services.indexOf(s1) };
            return s;
        });

        // Normalize all sort orders to ensure they are sequential and consistent
        const fullyOrderedServices = [...updatedServices].sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category);
            return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        }).map((s, idx) => ({
            ...s,
            sort_order: idx
        }));

        updateServices(fullyOrderedServices);
    };

    const handleMoveCategory = (category: string, direction: 'up' | 'down') => {
        const currentCats = [...categoryOrder];
        const index = currentCats.indexOf(category);
        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            const temp = currentCats[index];
            currentCats[index] = currentCats[index - 1];
            currentCats[index - 1] = temp;
        } else if (direction === 'down' && index < currentCats.length - 1) {
            const temp = currentCats[index];
            currentCats[index] = currentCats[index + 1];
            currentCats[index + 1] = temp;
        }

        updateCategoryOrder(currentCats);
    };

    // Group services by category
    const servicesByCategory = services.reduce((acc, s) => {
        if (s.promo_price) {
            const promoKey = 'VIRTUAL_PROMO';
            if (!acc[promoKey]) acc[promoKey] = [];
            acc[promoKey].push(s);
        }
        const cat = s.category || 'Otros';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s);
        return acc;
    }, {} as Record<string, Service[]>);

    // Map of ES Category -> EN Category for pre-filling
    const categoriesMap = Object.entries(servicesByCategory).reduce((acc, [cat, items]) => {
        const firstWithEn = items.find(s => s.category_en);
        if (firstWithEn?.category_en) acc[cat] = firstWithEn.category_en;
        return acc;
    }, {} as Record<string, string>);

    const toggleCategory = (cat: string) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F8F5F2] to-[#F2EBE5]" />
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F5F2] to-[#F2EBE5] p-4">
                <Card className="max-w-sm w-full">
                    <h1 className="text-2xl font-serif text-center mb-6 text-[#3E2C23]">Acceso Admin</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Ingrese PIN"
                            className="w-full px-4 py-3 rounded-xl bg-[#FCFAF8] border border-[#E8DED5] text-center text-2xl tracking-widest text-[#3E2C23] focus:border-[#B38A58] focus:ring-4 focus:ring-[#B38A58]/10 outline-none transition-all"
                            value={pinInput}
                            onChange={e => setPinInput(e.target.value)}
                            autoFocus
                        />
                        <Button fullWidth type="submit">Ingresar</Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8F5F2] to-[#F2EBE5] p-4 md:p-12 pb-32">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-16">
                    <h1 className="text-4xl font-serif text-[#3E2C23]">Panel de Control</h1>
                    <Button variant="goldOutline" onClick={handleLogout} className="px-10 !rounded-none py-2 text-[12px]">SALIR</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Agenda - Full Width Top Row */}
                    <div className="md:col-span-12 animate-in fade-in duration-700">
                        <BookingList />
                    </div>

                    {/* Client Search - Full Width Second Row */}
                    <div className="md:col-span-12 animate-in fade-in duration-700">
                        <ClientSearch />
                    </div>

                    {/* Left Column */}
                    <div className="md:col-span-7 space-y-12">
                        {/* Servicios */}
                        <Card>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-serif text-[#3E2C23]">Servicios</h2>
                                    <button
                                        onClick={() => setShowServices(!showServices)}
                                        className="text-[#3b82f6] hover:underline text-[10px] font-bold uppercase flex items-center gap-1 mt-2"
                                    >
                                        <span>{showServices ? '▼' : '▶'}</span> VER TODOS
                                    </button>
                                </div>
                                <Button variant="gold" onClick={() => { setEditingService(null); setIsCreating(true); }}>
                                    + NUEVO
                                </Button>
                            </div>

                            {(isCreating || editingService) && (
                                <div className="mb-8 border-b border-stone-100 pb-8 animate-in slide-in-from-top-4">
                                    <ServiceEditor
                                        initialService={editingService}
                                        defaultCategory={creatingInCategory || undefined}
                                        onSave={handleSaveService}
                                        onCancel={() => { setIsCreating(false); setEditingService(null); setCreatingInCategory(null); }}
                                        categoriesMap={categoriesMap}
                                    />
                                </div>
                            )}

                            {showServices && (
                                <div className="grid grid-cols-1 gap-8">
                                    {(() => {
                                        const allAvailableCats = Object.keys(servicesByCategory).filter(c => c !== 'VIRTUAL_PROMO');
                                        const orderedCats = categoryOrder.length > 0
                                            ? [
                                                ...categoryOrder.filter(c => allAvailableCats.includes(c)),
                                                ...allAvailableCats.filter(c => !categoryOrder.includes(c))
                                            ]
                                            : allAvailableCats;

                                        return [
                                            ...(servicesByCategory['VIRTUAL_PROMO'] ? ['VIRTUAL_PROMO'] : []),
                                            ...orderedCats
                                        ];
                                    })().map((category, catIndex, currentList) => {
                                        const items = servicesByCategory[category] || [];
                                        const isOpen = openCategories[category] ?? false;
                                        const isVirtual = category === 'VIRTUAL_PROMO';
                                        return (
                                            <div key={category} className="space-y-4">
                                                <div
                                                    className="flex items-center justify-between cursor-pointer group/cat"
                                                    onClick={() => toggleCategory(category)}
                                                >
                                                    <h3 className={`text-xs font-bold ${isVirtual ? 'text-amber-500' : 'text-stone-400'} uppercase tracking-tighter flex items-center gap-2`}>
                                                        <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                                                        {isVirtual ? 'PROMOCIONES (VISTA RÁPIDA)' : category}
                                                    </h3>
                                                    {!isVirtual && (
                                                        <div className="flex gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMoveCategory(category, 'up'); }}
                                                                disabled={catIndex === 0}
                                                                className="p-1 hover:text-gold-500 disabled:opacity-30"
                                                                title="Mover Categoría Arriba"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleMoveCategory(category, 'down'); }}
                                                                disabled={catIndex === currentList.length - 1}
                                                                className="p-1 hover:text-gold-500 disabled:opacity-30"
                                                                title="Mover Categoría Abajo"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                    {!isVirtual && (
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const firstService = items.find(s => s.category_en);
                                                                    setEditingCategory({
                                                                        es: category,
                                                                        en: firstService?.category_en || '',
                                                                        original: category
                                                                    });
                                                                }}
                                                                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase"
                                                            >
                                                                Traducir Categoría
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingService(null);
                                                                    setIsCreating(true);
                                                                    setCreatingInCategory(category);
                                                                }}
                                                                className="text-[10px] font-bold text-[#8B7023] hover:text-[#C5A02E] transition-colors uppercase"
                                                            >
                                                                + NUEVO EN {category}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {editingCategory?.original === category && (
                                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3 animate-in slide-in-from-top-2">
                                                        <p className="text-[10px] font-bold text-blue-400 uppercase">Renombrar / Traducir Categoría</p>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 outline-none"
                                                                placeholder="Nombre ES"
                                                                value={editingCategory.es}
                                                                onChange={e => setEditingCategory({ ...editingCategory, es: e.target.value })}
                                                            />
                                                            <input
                                                                className="px-3 py-1.5 text-sm rounded-lg border border-blue-200 outline-none"
                                                                placeholder="Nombre EN"
                                                                value={editingCategory.en}
                                                                onChange={e => setEditingCategory({ ...editingCategory, en: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingCategory(null)} className="text-[10px] font-bold text-stone-400 uppercase">Cancelar</button>
                                                            <button onClick={handleRenameCategory} className="text-[10px] font-bold text-blue-600 uppercase">Guardar en todos</button>
                                                        </div>
                                                    </div>
                                                )}

                                                {isOpen && (
                                                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {items.map(service => (
                                                            <div key={service.id} className="bg-[#FCFAF8] p-5 rounded-2xl border border-[#E8DED5] hover:bg-white hover:border-[#B38A58]/50 hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all group">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <h4 className="font-serif text-lg text-[#3E2C23] tracking-tight">{service.name}</h4>
                                                                        <p className="text-[#B08A57] font-medium text-sm mt-0.5">${service.price.toLocaleString()}</p>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex flex-col gap-1 mr-2 border-r border-stone-200 pr-4">
                                                                            <button
                                                                                onClick={() => handleMoveService(service.id, 'up')}
                                                                                className="text-stone-300 hover:text-gold-500 transition-colors"
                                                                                title="Subir"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleMoveService(service.id, 'down')}
                                                                                className="text-stone-300 hover:text-gold-500 transition-colors"
                                                                                title="Bajar"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                                </svg>
                                                                            </button>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => { setEditingService(service); setIsCreating(false); }}
                                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                                                                        >
                                                                            Editar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteService(service.id)}
                                                                            className="text-xs font-bold text-red-600 hover:text-red-800 uppercase tracking-widest"
                                                                        >
                                                                            Borrar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* Gastos */}
                        <ExpenseManager />

                        {/* Productos */}
                        <ProductManager />

                        {/* Equipo */}
                        <TeamManager />

                        {/* Bloquear Fechas */}
                        <DateBlocker />

                        {/* Contacto */}
                        <Card>
                            <h2 className="text-2xl font-serif mb-8 text-[#3E2C23]">Contacto</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase tracking-tighter">WhatsApp del Negocio</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={phoneInput}
                                            onChange={e => setPhoneInput(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-xl bg-[#FCFAF8] border border-[#E8DED5] text-[#3E2C23] outline-none focus:border-[#B38A58] focus:ring-4 focus:ring-[#B38A58]/10 transition-all"
                                            placeholder="549351..."
                                        />
                                        <Button variant="gold" onClick={() => { updatePhone(phoneInput); alert('¡Número Guardado!'); }}>
                                            GUARDAR
                                        </Button>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-[#E8DED5]/50">
                                        <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase tracking-tighter">Instagram del Negocio</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={instagramInput}
                                                onChange={e => setInstagramInput(e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-xl bg-[#FCFAF8] border border-[#E8DED5] text-[#3E2C23] outline-none focus:border-[#B38A58] focus:ring-4 focus:ring-[#B38A58]/10 transition-all"
                                                placeholder="https://instagram.com/..."
                                            />
                                            <Button variant="gold" onClick={() => { updateInstagramLink(instagramInput); alert('¡Link de Instagram Guardado!'); }}>
                                                GUARDAR
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-[#E8DED5]/50 space-y-2">
                                        <p className="text-xs text-[#9C8775] font-medium italic">Herramientas para el equipo:</p>
                                        <a
                                            href="/staff"
                                            className="text-sm text-[#B08A57] font-medium hover:underline"
                                        >
                                            Ir al Portal de Profesionales →
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-5 space-y-12">
                        <ReviewManager />
                        <GalleryManager />
                        <FAQManager />
                    </div>
                </div>
            </div>
        </div>
    );
}
