"use client";

import React, { useState, useMemo } from 'react';
import { useConfig, InventoryCategory, InventoryItem, ServiceInventoryCost } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const UNIT_OPTIONS: Array<{ value: InventoryItem['unit']; label: string }> = [
    { value: 'ml', label: 'ml' },
    { value: 'L', label: 'Litros' },
    { value: 'g', label: 'Gramos' },
    { value: 'kg', label: 'Kilos' },
    { value: 'units', label: 'Unidades' },
];

export function InventoryManager() {
    const {
        inventoryCategories,
        inventoryItems,
        serviceInventoryCosts,
        services,
        addInventoryCategory,
        updateInventoryCategory,
        deleteInventoryCategory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addServiceInventoryCost,
        updateServiceInventoryCost,
        deleteServiceInventoryCost
    } = useConfig();

    const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'reports'>('categories');

    // Category form state
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
    const [catName, setCatName] = useState('');
    const [catDescription, setCatDescription] = useState('');

    // Product form state
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [itemName, setItemName] = useState('');
    const [itemCategoryId, setItemCategoryId] = useState('');
    const [itemUnit, setItemUnit] = useState<InventoryItem['unit']>('units');
    const [itemQuantity, setItemQuantity] = useState('');
    const [itemCostPerUnit, setItemCostPerUnit] = useState('');
    const [itemAlertThreshold, setItemAlertThreshold] = useState('');
    const [itemSupplier, setItemSupplier] = useState('');

    // Service cost assignment
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignServiceId, setAssignServiceId] = useState('');
    const [assignItemId, setAssignItemId] = useState('');
    const [assignQuantity, setAssignQuantity] = useState('');

    const resetCategoryForm = () => {
        setCatName('');
        setCatDescription('');
        setIsAddingCategory(false);
        setEditingCategory(null);
    };

    const resetItemForm = () => {
        setItemName('');
        setItemCategoryId('');
        setItemUnit('units');
        setItemQuantity('');
        setItemCostPerUnit('');
        setItemAlertThreshold('');
        setItemSupplier('');
        setIsAddingItem(false);
        setEditingItem(null);
    };

    const resetAssignForm = () => {
        setAssignServiceId('');
        setAssignItemId('');
        setAssignQuantity('');
        setIsAssigning(false);
    };

    // Low stock items
    const lowStockItems = useMemo(() => {
        return inventoryItems.filter(i => i.currentQuantity <= i.alertThreshold);
    }, [inventoryItems]);

    // Total inventory value
    const totalInventoryValue = useMemo(() => {
        return inventoryItems.reduce((sum, i) => sum + (i.currentQuantity * i.costPerUnit), 0);
    }, [inventoryItems]);

    // Service margins
    const serviceMargins = useMemo(() => {
        return services.map(service => {
            const costs = serviceInventoryCosts.filter(c => c.serviceId === service.id);
            const totalCost = costs.reduce((sum, c) => sum + (c.quantityUsed * c.costPerUnit), 0);
            const margin = service.price > 0 ? ((service.price - totalCost) / service.price) * 100 : 100;
            return {
                serviceId: service.id,
                serviceName: service.name,
                servicePrice: service.price,
                totalCost,
                margin,
                costs
            };
        }).filter(s => s.costs.length > 0).sort((a, b) => a.margin - b.margin);
    }, [services, serviceInventoryCosts]);

    // ─── HANDLERS ────────────────────────────────────────────

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!catName.trim()) return;

        if (editingCategory) {
            updateInventoryCategory({ ...editingCategory, name: catName, description: catDescription || undefined });
        } else {
            addInventoryCategory({
                id: Date.now().toString(),
                name: catName,
                description: catDescription || undefined
            });
        }
        resetCategoryForm();
    };

    const handleEditCategory = (cat: InventoryCategory) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setCatDescription(cat.description || '');
        setIsAddingCategory(true);
    };

    const handleDeleteCategory = (id: string) => {
        const itemCount = inventoryItems.filter(i => i.categoryId === id).length;
        const msg = itemCount > 0
            ? `¿Eliminar categoría? Se borrarán ${itemCount} producto(s) asociado(s).`
            : '¿Eliminar categoría?';
        if (confirm(msg)) deleteInventoryCategory(id);
    };

    const handleSaveItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName.trim() || !itemCategoryId || !itemQuantity || !itemCostPerUnit) return;

        const category = inventoryCategories.find(c => c.id === itemCategoryId);
        if (!category) return;

        if (editingItem) {
            updateInventoryItem({
                ...editingItem,
                name: itemName,
                categoryId: itemCategoryId,
                categoryName: category.name,
                unit: itemUnit,
                currentQuantity: parseFloat(itemQuantity),
                costPerUnit: parseFloat(itemCostPerUnit),
                alertThreshold: parseFloat(itemAlertThreshold) || 0,
                supplier: itemSupplier || undefined
            });
        } else {
            addInventoryItem({
                id: Date.now().toString(),
                name: itemName,
                categoryId: itemCategoryId,
                categoryName: category.name,
                unit: itemUnit,
                currentQuantity: parseFloat(itemQuantity),
                costPerUnit: parseFloat(itemCostPerUnit),
                alertThreshold: parseFloat(itemAlertThreshold) || 0,
                supplier: itemSupplier || undefined,
                createdAt: new Date().toISOString()
            });
        }
        resetItemForm();
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setItemName(item.name);
        setItemCategoryId(item.categoryId);
        setItemUnit(item.unit);
        setItemQuantity(item.currentQuantity.toString());
        setItemCostPerUnit(item.costPerUnit.toString());
        setItemAlertThreshold(item.alertThreshold.toString());
        setItemSupplier(item.supplier || '');
        setIsAddingItem(true);
    };

    const handleDeleteItem = (id: string) => {
        if (confirm('¿Eliminar este producto?')) deleteInventoryItem(id);
    };

    const handleAssign = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignServiceId || !assignItemId || !assignQuantity) return;

        const item = inventoryItems.find(i => i.id === assignItemId);
        if (!item) return;

        // Check if already assigned
        const existing = serviceInventoryCosts.find(
            s => s.serviceId === assignServiceId && s.inventoryItemId === assignItemId
        );

        if (existing) {
            updateServiceInventoryCost({
                ...existing,
                quantityUsed: parseFloat(assignQuantity),
                costPerUnit: item.costPerUnit
            });
        } else {
            addServiceInventoryCost({
                id: Date.now().toString(),
                serviceId: assignServiceId,
                inventoryItemId: assignItemId,
                inventoryItemName: item.name,
                quantityUsed: parseFloat(assignQuantity),
                costPerUnit: item.costPerUnit
            });
        }
        resetAssignForm();
    };

    return (
        <Card>
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800 shrink-0">Inventario y Costos</h2>
                <div className="flex gap-2">
                    {(['categories', 'products', 'reports'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${activeTab === tab
                                ? 'bg-[#C5A02E] text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {tab === 'categories' ? 'Categorías' : tab === 'products' ? 'Productos' : 'Reportes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50/80 border border-red-200/50 animate-in fade-in">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-tighter mb-2">⚠️ Stock Bajo</p>
                    <div className="space-y-1">
                        {lowStockItems.map(item => (
                            <p key={item.id} className="text-sm text-stone-700">
                                <strong>{item.name}</strong> — {item.currentQuantity} {item.unit} (mín: {item.alertThreshold})
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── CATEGORIES TAB ─── */}
            {activeTab === 'categories' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <Button variant="goldOutline" onClick={() => {
                            resetCategoryForm();
                            setIsAddingCategory(!isAddingCategory);
                        }}>
                            {isAddingCategory ? 'CERRAR' : '+ NUEVA CATEGORÍA'}
                        </Button>
                    </div>

                    {isAddingCategory && (
                        <form onSubmit={handleSaveCategory} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter">
                                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                            </p>
                            <input
                                required
                                value={catName}
                                onChange={e => setCatName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                placeholder="Ej: Coloración, Cuidado Capilar..."
                            />
                            <input
                                value={catDescription}
                                onChange={e => setCatDescription(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                placeholder="Descripción (opcional)"
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="goldOutline" type="button" onClick={resetCategoryForm}>CANCELAR</Button>
                                <Button variant="gold" type="submit">GUARDAR</Button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-3">
                        {inventoryCategories.map(cat => {
                            const count = inventoryItems.filter(i => i.categoryId === cat.id).length;
                            return (
                                <div key={cat.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-100 group hover:bg-white hover:border-gold-200 transition-all">
                                    <div>
                                        <p className="font-bold text-stone-700">{cat.name}</p>
                                        <p className="text-[10px] text-stone-400">{count} producto{count !== 1 ? 's' : ''} {cat.description && `· ${cat.description}`}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEditCategory(cat)}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id)}
                                            className="text-xs font-bold text-red-600 hover:text-red-800 uppercase"
                                        >
                                            Borrar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {inventoryCategories.length === 0 && (
                            <p className="text-center text-stone-400 py-8 text-sm">No hay categorías. Crea una para empezar.</p>
                        )}
                    </div>
                </div>
            )}

            {/* ─── PRODUCTS TAB ─── */}
            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-end mb-6">
                        <Button variant="goldOutline" onClick={() => {
                            resetItemForm();
                            setIsAddingItem(!isAddingItem);
                        }}>
                            {isAddingItem ? 'CERRAR' : '+ NUEVO PRODUCTO'}
                        </Button>
                    </div>

                    {isAddingItem && (
                        <form onSubmit={handleSaveItem} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter">
                                {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    required
                                    value={itemName}
                                    onChange={e => setItemName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                    placeholder="Nombre del producto *"
                                />
                                <select
                                    required
                                    value={itemCategoryId}
                                    onChange={e => setItemCategoryId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                >
                                    <option value="">Categoría *</option>
                                    {inventoryCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={itemUnit}
                                    onChange={e => setItemUnit(e.target.value as InventoryItem['unit'])}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                >
                                    {UNIT_OPTIONS.map(u => (
                                        <option key={u.value} value={u.value}>{u.label}</option>
                                    ))}
                                </select>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={itemQuantity}
                                    onChange={e => setItemQuantity(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                    placeholder="Cantidad actual *"
                                />
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={itemCostPerUnit}
                                    onChange={e => setItemCostPerUnit(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                    placeholder="Costo por unidad ($) *"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={itemAlertThreshold}
                                    onChange={e => setItemAlertThreshold(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                    placeholder="Alerta stock mínimo"
                                />
                                <input
                                    value={itemSupplier}
                                    onChange={e => setItemSupplier(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300 md:col-span-2"
                                    placeholder="Proveedor (opcional)"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="goldOutline" type="button" onClick={resetItemForm}>CANCELAR</Button>
                                <Button variant="gold" type="submit">GUARDAR</Button>
                            </div>
                        </form>
                    )}

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-200">
                                    <th className="text-left py-3 text-[10px] font-bold text-stone-400 uppercase">Producto</th>
                                    <th className="text-left py-3 text-[10px] font-bold text-stone-400 uppercase">Cat.</th>
                                    <th className="text-right py-3 text-[10px] font-bold text-stone-400 uppercase">Stock</th>
                                    <th className="text-right py-3 text-[10px] font-bold text-stone-400 uppercase">$/Unid.</th>
                                    <th className="text-right py-3 text-[10px] font-bold text-stone-400 uppercase">Valor</th>
                                    <th className="text-right py-3 text-[10px] font-bold text-stone-400 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryItems.map(item => {
                                    const isLow = item.currentQuantity <= item.alertThreshold;
                                    return (
                                        <tr key={item.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                                            <td className="py-3">
                                                <span className="font-bold text-stone-700">{item.name}</span>
                                                {isLow && <span className="ml-2 text-[9px] font-bold text-red-500 uppercase bg-red-50 px-1.5 py-0.5 rounded-full">LOW</span>}
                                            </td>
                                            <td className="py-3 text-stone-400">{item.categoryName}</td>
                                            <td className={`py-3 text-right font-bold ${isLow ? 'text-red-500' : 'text-stone-700'}`}>
                                                {item.currentQuantity} {item.unit}
                                            </td>
                                            <td className="py-3 text-right text-stone-500">${item.costPerUnit.toFixed(2)}</td>
                                            <td className="py-3 text-right font-bold text-[#C5A02E]">${(item.currentQuantity * item.costPerUnit).toFixed(2)}</td>
                                            <td className="py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="text-[10px] font-bold text-red-600 hover:text-red-800 uppercase"
                                                    >
                                                        Borrar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {inventoryItems.length === 0 && (
                            <p className="text-center text-stone-400 py-8 text-sm">No hay productos. Crea categorías primero.</p>
                        )}
                    </div>

                    {/* Total Inventory Value */}
                    {inventoryItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-stone-400 uppercase">Valor Total Inventario</span>
                            <span className="text-lg font-bold text-[#C5A02E]">${totalInventoryValue.toFixed(2)}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ─── REPORTS TAB ─── */}
            {activeTab === 'reports' && (
                <div className="space-y-8">
                    {/* Assign Service Cost */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Vincular Insumo → Servicio</p>
                            <Button variant="goldOutline" onClick={() => {
                                resetAssignForm();
                                setIsAssigning(!isAssigning);
                            }}>
                                {isAssigning ? 'CERRAR' : '+ VINCULAR'}
                            </Button>
                        </div>

                        {isAssigning && (
                            <form onSubmit={handleAssign} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select
                                        required
                                        value={assignServiceId}
                                        onChange={e => setAssignServiceId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                    >
                                        <option value="">Servicio *</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        required
                                        value={assignItemId}
                                        onChange={e => setAssignItemId(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                    >
                                        <option value="">Insumo *</option>
                                        {inventoryItems.map(i => (
                                            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                                        ))}
                                    </select>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={assignQuantity}
                                        onChange={e => setAssignQuantity(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                        placeholder="Cantidad usada *"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="goldOutline" type="button" onClick={resetAssignForm}>CANCELAR</Button>
                                    <Button variant="gold" type="submit">VINCULAR</Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Service Margins Table */}
                    <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter mb-4">Margen por Servicio</p>

                        {serviceMargins.length > 0 ? (
                            <div className="space-y-3">
                                {serviceMargins.map(svc => (
                                    <div key={svc.serviceId} className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-stone-700">{svc.serviceName}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-stone-400">Precio: ${svc.servicePrice}</span>
                                                <span className="text-sm text-red-500">Costo: ${svc.totalCost.toFixed(2)}</span>
                                                <span className={`text-sm font-bold ${svc.margin >= 70 ? 'text-green-600' : svc.margin >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    Margen: {svc.margin.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${svc.margin >= 70 ? 'bg-green-500' : svc.margin >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.max(svc.margin, 0)}%` }}
                                            />
                                        </div>
                                        {/* Cost breakdown */}
                                        <div className="mt-2 flex gap-2 flex-wrap">
                                            {svc.costs.map(cost => (
                                                <span key={cost.id} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                                                    {cost.inventoryItemName}: {cost.quantityUsed} × ${cost.costPerUnit.toFixed(2)}
                                                    <button
                                                        onClick={() => deleteServiceInventoryCost(cost.id)}
                                                        className="ml-1 text-red-400 hover:text-red-600"
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-stone-400 py-8 text-sm">
                                Vincula insumos a servicios para ver márgenes.
                            </p>
                        )}
                    </div>

                    {/* Summary */}
                    {inventoryItems.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-2xl font-bold text-[#C5A02E]">${totalInventoryValue.toFixed(0)}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Valor Inventario</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-2xl font-bold text-stone-800">{inventoryItems.length}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Productos</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
