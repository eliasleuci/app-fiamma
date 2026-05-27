"use client";

import React, { useState } from 'react';
import { useConfig, ProductOrder } from '@/context/ConfigContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date-helpers';

export function ProductManager() {
    const {
        productOrders,
        addProductOrder,
        updateProductOrder,
        deleteProductOrder
    } = useConfig();

    const [isAdding, setIsAdding] = useState(false);
    const [editingOrder, setEditingOrder] = useState<ProductOrder | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');

    // Form state
    const [products, setProducts] = useState([{ productName: '', costPrice: '', sellingPrice: '' }]);
    const [clientName, setClientName] = useState('');
    const [status, setStatus] = useState<'pending' | 'delivered' | 'cancelled'>('pending');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

    const resetForm = () => {
        setProducts([{ productName: '', costPrice: '', sellingPrice: '' }]);
        setClientName('');
        setStatus('pending');
        setOrderDate(new Date().toISOString().split('T')[0]);
        setIsAdding(false);
        setEditingOrder(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientName) return;

        if (editingOrder) {
            products.forEach((prod, index) => {
                if (!prod.productName || !prod.sellingPrice) return;
                
                if (index === 0) {
                    // Update the existing order
                    updateProductOrder({
                        ...editingOrder,
                        productName: prod.productName,
                        costPrice: parseFloat(prod.costPrice) || 0,
                        sellingPrice: parseFloat(prod.sellingPrice),
                        clientName,
                        status,
                        date: orderDate
                    });
                } else {
                    // Create new orders for additional products added during edit
                    addProductOrder({
                        id: Date.now().toString() + index,
                        productName: prod.productName,
                        costPrice: parseFloat(prod.costPrice) || 0,
                        sellingPrice: parseFloat(prod.sellingPrice),
                        clientName,
                        status,
                        date: orderDate
                    });
                }
            });
        } else {
            products.forEach((prod, index) => {
                if (!prod.productName || !prod.sellingPrice) return;
                addProductOrder({
                    id: Date.now().toString() + index,
                    productName: prod.productName,
                    costPrice: parseFloat(prod.costPrice) || 0,
                    sellingPrice: parseFloat(prod.sellingPrice),
                    clientName,
                    status,
                    date: orderDate
                });
            });
        }
        resetForm();
    };

    const handleEdit = (order: ProductOrder) => {
        setEditingOrder(order);
        setProducts([{
            productName: order.productName,
            costPrice: order.costPrice.toString(),
            sellingPrice: order.sellingPrice.toString()
        }]);
        setClientName(order.clientName);
        setStatus(order.status);
        setOrderDate(order.date);
        setIsAdding(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar este pedido de producto?')) {
            deleteProductOrder(id);
        }
    };

    const getStatusLabel = (s: string) => {
        const labels = { pending: 'Pendiente', delivered: 'Entregado', cancelled: 'Cancelado' };
        return labels[s as keyof typeof labels] || s;
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-stone-100 text-stone-800 border-stone-200';
        }
    };

    return (
        <Card>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <h2 className="text-2xl font-serif text-[#3E2C23]">Venta de Productos Extras</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2 rounded-xl bg-[#FCFAF8] border border-[#E8DED5] text-[#3E2C23] outline-none focus:border-[#B38A58] text-sm"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="delivered">Entregados</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                    <Button
                        variant="goldOutline"
                        onClick={() => {
                            resetForm();
                            setIsAdding(!isAdding);
                        }}
                    >
                        {isAdding ? 'CERRAR' : '+ NUEVO PEDIDO'}
                    </Button>
                </div>
            </div>

            {isAdding && (
                <form onSubmit={handleSave} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Nombre de la Clienta</label>
                        <input
                            required
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                            className="w-full max-w-md px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            placeholder="Ej: María Rodríguez"
                        />
                    </div>
                    
                    <div className="space-y-3">
                        {products.map((prod, index) => (
                            <div key={index} className="bg-white p-4 rounded-xl border border-stone-100 relative group">
                                {products.length > 1 && (index > 0 || !editingOrder) && (
                                    <button type="button" onClick={() => setProducts(products.filter((_, i) => i !== index))} className="absolute top-2 right-3 p-1 text-stone-300 hover:text-red-500 transition-colors">
                                        ✕
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Nombre del Producto</label>
                                        <input
                                            required
                                            value={prod.productName}
                                            onChange={e => {
                                                const newProds = [...products];
                                                newProds[index].productName = e.target.value;
                                                setProducts(newProds);
                                            }}
                                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                            placeholder="Ej: Crema Facial"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Precio de Costo ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={prod.costPrice}
                                            onChange={e => {
                                                const newProds = [...products];
                                                newProds[index].costPrice = e.target.value;
                                                setProducts(newProds);
                                            }}
                                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Precio de Venta ($)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={prod.sellingPrice}
                                            onChange={e => {
                                                const newProds = [...products];
                                                newProds[index].sellingPrice = e.target.value;
                                                setProducts(newProds);
                                            }}
                                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <Button type="button" variant="goldOutline" onClick={() => setProducts([...products, { productName: '', costPrice: '', sellingPrice: '' }])} className="text-xs px-4 py-2 h-auto min-h-0">
                            + Añadir otro producto
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Estado del Pedido</label>
                            <div className="flex gap-2 flex-wrap">
                                {(['pending', 'delivered', 'cancelled'] as const).map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`flex-1 min-w-[100px] px-3 py-2 text-xs font-bold rounded-lg transition-colors ${status === s
                                            ? 'bg-[#C5A02E] text-white'
                                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                                            }`}
                                    >
                                        {getStatusLabel(s)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Fecha</label>
                            <input
                                required
                                type="date"
                                value={orderDate}
                                onChange={e => setOrderDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                        <button type="button" onClick={resetForm} className="text-xs text-stone-400 hover:text-stone-600">Cancelar</button>
                        <Button type="submit">{editingOrder ? 'Actualizar' : 'Guardar'} Pedido</Button>
                    </div>
                </form>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {(() => {
                    const filteredOrders = (productOrders || []).filter(order => filterStatus === 'all' || order.status === filterStatus);
                    const sortedOrders = [...filteredOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    
                    if (sortedOrders.length === 0) {
                        return <p className="text-center text-stone-400 italic py-10">No hay pedidos de productos para mostrar.</p>;
                    }

                    return sortedOrders.map(order => (
                        <div key={order.id} className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5] hover:border-[#B38A58]/50 hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex-1 w-full md:pr-4">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg text-[#3E2C23]">{order.productName}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#9C8775]">Clienta: <span className="font-medium text-[#3E2C23]">{order.clientName}</span></p>
                                    
                                    <div className="flex gap-4 mt-2 text-xs">
                                        <span className="text-stone-500">Costo: <span className="font-bold text-stone-700">${order.costPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></span>
                                        <span className="text-[#B08A57]">Venta: <span className="font-bold">${order.sellingPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></span>
                                        <span className="text-green-600 font-medium">Ganancia: ${(order.sellingPrice - order.costPrice).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="text-xs text-stone-400 mt-2">
                                        {formatDate(order.date)}
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-3 mt-4 md:mt-0 w-full md:w-auto border-t border-[#E8DED5] pt-4 md:border-0 md:pt-0 justify-end">
                                    <button
                                        onClick={() => handleEdit(order)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 text-right uppercase tracking-wider"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="text-xs font-bold text-red-600 hover:text-red-800 text-right uppercase tracking-wider"
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ));
                })()}
            </div>
        </Card>
    );
}
