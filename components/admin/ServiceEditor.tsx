import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Service } from '@/components/booking/ServiceSelection';

interface ServiceEditorProps {
    initialService?: Service | null;
    defaultCategory?: string;
    onSave: (service: Service) => void;
    onCancel: () => void;
    categoriesMap?: Record<string, string>; // Maps category name (ES) to translation (EN)
}

export function ServiceEditor({ initialService, defaultCategory, onSave, onCancel, categoriesMap }: ServiceEditorProps) {
    const [name, setName] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState(defaultCategory || '');
    const [categoryEn, setCategoryEn] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [promoPrice, setPromoPrice] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');

    useEffect(() => {
        if (initialService) {
            setName(initialService.name);
            setNameEn(initialService.name_en || '');
            setPrice(initialService.price.toString());
            setDuration(initialService.duration);
            setCategory(initialService.category || 'Otros');
            setCategoryEn(initialService.category_en || categoriesMap?.[initialService.category || 'Otros'] || '');
            setDescription(initialService.description || '');
            setDescriptionEn(initialService.description_en || '');
            if (initialService.promo_price) {
                setPromoPrice(initialService.promo_price.toString());
                const original = initialService.price;
                const promo = initialService.promo_price;
                const percent = Math.round(((original - promo) / original) * 100);
                setDiscountPercent(percent.toString());
            } else {
                setPromoPrice('');
                setDiscountPercent('');
            }
        } else if (defaultCategory) {
            setCategory(defaultCategory);
            if (categoriesMap?.[defaultCategory]) {
                setCategoryEn(categoriesMap[defaultCategory]);
            }
        }
    }, [initialService, defaultCategory, categoriesMap]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialService?.id || Date.now().toString(),
            name,
            name_en: nameEn,
            price: Number(price),
            duration,
            category: category || 'Otros',
            category_en: categoryEn,
            description,
            description_en: descriptionEn,
            promo_price: promoPrice ? Number(promoPrice) : null,
            sort_order: initialService?.sort_order
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mt-4">
            <h3 className="font-bold text-lg mb-6 text-stone-800">{initialService ? '📝 Editar Servicio' : '✨ Nuevo Servicio'}</h3>

            <div className="space-y-6">
                <div>
                    <label className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">
                        <span>Nombre del Servicio</span>
                    </label>
                    <input
                        required
                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                        placeholder="Ej: Microblading"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Categoría</label>
                    <div className="space-y-4">
                        <input
                            list="categories"
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="Ej: Micropigmentación"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        />
                        <select
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 focus:border-gold-300 outline-none appearance-none cursor-pointer"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">Seleccionar existente...</option>
                            <option value="Micropigmentación">Micropigmentación</option>
                            <option value="Lifting y Cejas">Lifting y Cejas</option>
                            <option value="Tratamiento Facial">Tratamiento Facial</option>
                            <option value="Tratamiento Corporal">Tratamiento Corporal</option>
                            <option value="Otros">Otros</option>
                        </select>
                        <datalist id="categories">
                            <option value="Micropigmentación" />
                            <option value="Lifting y Cejas" />
                            <option value="Tratamiento Facial" />
                            <option value="Tratamiento Corporal" />
                        </datalist>
                    </div>
                </div>

                <div>
                    <label className="flex items-center justify-between text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">
                        <span>Descripción (Opcional)</span>
                    </label>
                    <input
                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                        placeholder="Ej: Incluye perfilado"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Precio ($)</label>
                        <input
                            required
                            type="number"
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            value={price}
                            onChange={e => {
                                setPrice(e.target.value);
                                if (discountPercent && e.target.value) {
                                    const p = Number(e.target.value);
                                    const d = Number(discountPercent);
                                    const discounted = p - (p * (d / 100));
                                    setPromoPrice(Math.round(discounted).toString());
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Duración</label>
                        <input
                            required
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 placeholder:text-stone-300 focus:border-gold-300 outline-none transition-all"
                            placeholder="Ej: 60 min"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 mt-6">
                    <label className="block text-xs font-bold text-orange-400 mb-3 uppercase tracking-tighter flex items-center gap-2">
                        <span>🏷️ Promoción / Descuento (Opcional)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">Descuento %</label>
                            <input
                                type="number"
                                placeholder="Ej: 20"
                                className="w-full px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-600 placeholder:text-orange-200 focus:border-orange-400 outline-none transition-all font-bold"
                                value={discountPercent}
                                onChange={e => {
                                    const val = e.target.value;
                                    setDiscountPercent(val);
                                    if (val && price) {
                                        const p = Number(price);
                                        const d = Number(val);
                                        const discounted = p - (p * (d / 100));
                                        setPromoPrice(Math.round(discounted).toString());
                                    } else if (!val) {
                                        setPromoPrice('');
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-stone-400 mb-1 uppercase">Precio Final ($)</label>
                            <input
                                type="number"
                                placeholder="Precio con descuento"
                                className="w-full px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-600 placeholder:text-orange-200 focus:border-orange-400 outline-none transition-all font-bold"
                                value={promoPrice}
                                onChange={e => {
                                    setPromoPrice(e.target.value);
                                    setDiscountPercent('');
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-stone-100 mt-6">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </div>
        </form>
    );
}
