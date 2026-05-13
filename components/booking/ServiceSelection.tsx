import React, { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface Service {
    id: string;
    name: string; // ES
    price: number;
    duration: string;
    category: string;
    category_en?: string;
    description?: string; // ES
    name_en?: string;
    description_en?: string;
    promo_price?: number | null;
    sort_order?: number;
}

export function ServiceSelection({ onSelect }: { onSelect: (service: Service) => void }) {
    const { services, categoryOrder, updateCategoryOrder } = useConfig();
    const { t, language } = useLanguage();
    const [openCategory, setOpenCategory] = useState<string | null>(null);

    // Group services by category
    const groupedServices = services.reduce((acc, service) => {
        // Handle Promotions category automatically (Virtual category)
        if (service.promo_price) {
            const promoKey = 'VIRTUAL_PROMO';
            if (!acc[promoKey]) acc[promoKey] = [];
            acc[promoKey].push(service);
        }

        const category = service.category || 'Otros';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    // Category display order: Use dynamic order if available, else fall back to alphabetic of what's available
    const promoKey = 'VIRTUAL_PROMO';
    const allCategories = Object.keys(groupedServices).filter(c => c !== promoKey);

    const displayOrder = [
        ...(groupedServices[promoKey] ? [promoKey] : []),
        ...(categoryOrder.length > 0
            ? [
                ...categoryOrder,
                ...allCategories.filter(c => !categoryOrder.includes(c))
            ]
            : [
                'Micropigmentación',
                'Lifting y Cejas',
                'Tratamiento Facial',
                'Tratamiento Corporal',
                ...allCategories.filter(c => !['Micropigmentación', 'Lifting y Cejas', 'Tratamiento Facial', 'Tratamiento Corporal', 'Otros'].includes(c)),
                'Otros'
            ])
    ];

    const getTranslatedCategory = (cat: string, items: Service[]) => {
        if (cat === 'VIRTUAL_PROMO') return t('common.categories.promotions') || (language === 'en' ? 'Promotions' : 'Promociones');

        // First check if any service in this category has a category_en set
        if (language === 'en') {
            const firstWithEn = items.find(s => s.category_en);
            if (firstWithEn?.category_en) return firstWithEn.category_en;
        }

        if (cat === 'Micropigmentación') return t('common.categories.micropig');
        if (cat === 'Lifting y Cejas') return t('common.categories.lifting');
        if (cat === 'Tratamiento Facial') return t('common.categories.facial');
        if (cat === 'Tratamiento Corporal') return t('common.categories.corporal');
        if (cat === 'Otros') return t('common.categories.others');
        return cat;
    };

    const sortedCategories = displayOrder.filter(cat => groupedServices[cat]);

    const toggleCategory = (category: string) => {
        setOpenCategory(openCategory === category ? null : category);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold text-stone-800 tracking-tight mb-2">{t('common.choose_treatment')}</h2>
                <p className="text-stone-400 text-sm font-light leading-relaxed">{t('common.select_category')}</p>
            </div>

            <div className="space-y-4">
                {sortedCategories.map((category) => (
                    <div key={category} className={`${category === 'VIRTUAL_PROMO' ? 'shadow-md border-0' : 'border border-stone-200'} rounded-xl overflow-hidden bg-white`}>
                        <button
                            onClick={() => toggleCategory(category)}
                            className={`w-full flex items-center justify-between p-5 text-left transition-colors ${openCategory === category ? 'bg-stone-50 text-stone-900' : 'bg-white text-stone-700 hover:bg-stone-50'
                                }`}
                        >
                            <span className="font-serif text-xl font-medium flex items-center gap-3">
                                {getTranslatedCategory(category, groupedServices[category])}
                            </span>
                            {openCategory === category ? (
                                <ChevronUp className="w-5 h-5 text-stone-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-stone-400" />
                            )}
                        </button>

                        {openCategory === category && (
                            <div className="p-4 pt-0 border-t border-stone-100 bg-stone-50/50">
                                <div className="grid gap-3 pt-4">
                                    {groupedServices[category].map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => onSelect(service)}
                                            className={`group relative flex items-center justify-between p-4 rounded-lg transition-all text-left ${service.promo_price
                                                ? 'bg-amber-50/50 shadow-sm hover:shadow-md hover:bg-amber-50 border-amber-100/50 border'
                                                : 'border border-stone-200 bg-white hover:border-[#C5A02E]/30 hover:shadow-md'
                                                } hover:-translate-y-0.5`}
                                        >
                                            {service.promo_price && (
                                                <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
                                                    PROMO
                                                </div>
                                            )}
                                            <div className="flex-1 pr-4">
                                                <h4 className="font-medium text-stone-800 group-hover:text-stone-900 transition-colors">
                                                    {language === 'en' && service.name_en ? service.name_en : service.name}
                                                </h4>
                                                {(service.description || service.description_en) && (
                                                    <p className="text-sm text-stone-500 mt-1 font-light leading-snug">
                                                        {language === 'en' && service.description_en ? service.description_en : service.description}
                                                    </p>
                                                )}

                                            </div>
                                            <div className="text-right">
                                                {service.promo_price ? (
                                                    <>
                                                        <span className="block text-xs text-stone-400 line-through decoration-red-400 decoration-2">${service.price}</span>
                                                        <span className="block text-[#C5A02E] font-bold text-lg">${service.promo_price}</span>
                                                    </>
                                                ) : (
                                                    <div className="text-[#C5A02E] font-semibold whitespace-nowrap text-lg">
                                                        ${service.price.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
