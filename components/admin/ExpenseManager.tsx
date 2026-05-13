"use client";

import React, { useState } from 'react';
import { useConfig, ExpenseCategory, Expense } from '@/context/ConfigContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date-helpers';

export function ExpenseManager() {
    const {
        expenseCategories,
        expenses,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        addExpense,
        updateExpense,
        deleteExpense
    } = useConfig();

    const [activeTab, setActiveTab] = useState<'categories' | 'expenses'>('categories');

    // Category form state
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryColor, setCategoryColor] = useState('#C5A02E');

    // Expense form state
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [expenseCategoryId, setExpenseCategoryId] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [expensePaymentMethod, setExpensePaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');

    const resetCategoryForm = () => {
        setCategoryName('');
        setCategoryColor('#C5A02E');
        setIsAddingCategory(false);
        setEditingCategory(null);
    };

    const resetExpenseForm = () => {
        setExpenseCategoryId('');
        setExpenseAmount('');
        setExpenseDescription('');
        setExpenseDate(new Date().toISOString().split('T')[0]);
        setExpensePaymentMethod('cash');
        setIsAddingExpense(false);
        setEditingExpense(null);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        if (editingCategory) {
            updateExpenseCategory({
                ...editingCategory,
                name: categoryName,
                color: categoryColor
            });
        } else {
            addExpenseCategory({
                id: Date.now().toString(),
                name: categoryName,
                color: categoryColor
            });
        }
        resetCategoryForm();
    };

    const handleEditCategory = (category: ExpenseCategory) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setCategoryColor(category.color);
        setIsAddingCategory(true);
    };

    const handleDeleteCategory = (id: string) => {
        const expenseCount = expenses.filter(e => e.categoryId === id).length;
        const message = expenseCount > 0
            ? `¿Eliminar esta categoría? Se borrarán también ${expenseCount} gasto(s) asociado(s).`
            : '¿Eliminar esta categoría?';

        if (confirm(message)) {
            deleteExpenseCategory(id);
        }
    };

    const handleSaveExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseCategoryId || !expenseAmount) return;

        const category = expenseCategories.find(c => c.id === expenseCategoryId);
        if (!category) return;

        if (editingExpense) {
            updateExpense({
                ...editingExpense,
                categoryId: expenseCategoryId,
                categoryName: category.name,
                amount: parseFloat(expenseAmount),
                description: expenseDescription,
                date: expenseDate,
                paymentMethod: expensePaymentMethod
            });
        } else {
            addExpense({
                id: Date.now().toString(),
                categoryId: expenseCategoryId,
                categoryName: category.name,
                amount: parseFloat(expenseAmount),
                description: expenseDescription,
                date: expenseDate,
                paymentMethod: expensePaymentMethod,
                createdAt: new Date().toISOString()
            });
        }
        resetExpenseForm();
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setExpenseCategoryId(expense.categoryId);
        setExpenseAmount(expense.amount.toString());
        setExpenseDescription(expense.description);
        setExpenseDate(expense.date);
        setExpensePaymentMethod(expense.paymentMethod);
        setIsAddingExpense(true);
    };

    const handleDeleteExpense = (id: string) => {
        if (confirm('¿Eliminar este gasto?')) {
            deleteExpense(id);
        }
    };

    const getCategoryExpenseCount = (categoryId: string) => {
        return expenses.filter(e => e.categoryId === categoryId).length;
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
        return labels[method as keyof typeof labels] || method;
    };

    return (
        <Card>
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-4">
                <h2 className="text-2xl font-serif text-[#3E2C23]">Gastos</h2>
                <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide w-full xl:w-auto gap-2 pb-2 xl:pb-0">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${activeTab === 'categories'
                            ? 'bg-[#3F3129] text-[#F8F5F2]'
                            : 'bg-[#FCFAF8] text-[#9C8775] hover:bg-white hover:text-[#3E2C23]'
                            }`}
                    >
                        Categorías
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${activeTab === 'expenses'
                            ? 'bg-[#3F3129] text-[#F8F5F2]'
                            : 'bg-[#FCFAF8] text-[#9C8775] hover:bg-white hover:text-[#3E2C23]'
                            }`}
                    >
                        Registrar Gasto
                    </button>
                </div>
            </div>

            {activeTab === 'categories' ? (
                <div>
                    <div className="flex justify-end mb-6">
                        <Button
                            variant="goldOutline"
                            onClick={() => {
                                resetCategoryForm();
                                setIsAddingCategory(!isAddingCategory);
                            }}
                        >
                            {isAddingCategory ? 'CERRAR' : '+ NUEVA CATEGORÍA'}
                        </Button>
                    </div>

                    {isAddingCategory && (
                        <form onSubmit={handleSaveCategory} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Nombre de Categoría</label>
                                    <input
                                        required
                                        value={categoryName}
                                        onChange={e => setCategoryName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                        placeholder="Ej: Productos, Servicios, Alquiler..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={categoryColor}
                                            onChange={e => setCategoryColor(e.target.value)}
                                            className="w-16 h-10 rounded-lg border border-stone-200 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={categoryColor}
                                            onChange={e => setCategoryColor(e.target.value)}
                                            className="flex-1 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={resetCategoryForm} className="text-xs text-stone-400 hover:text-stone-600">Cancelar</button>
                                <Button type="submit">{editingCategory ? 'Actualizar' : 'Crear'} Categoría</Button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-3">
                        {expenseCategories.map(category => (
                            <div key={category.id} className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5] flex items-center justify-between hover:border-[#B38A58]/50 hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full border border-stone-200"
                                        style={{ backgroundColor: category.color }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-[#3E2C23]">{category.name}</h3>
                                        <p className="text-xs text-[#9C8775]">{getCategoryExpenseCount(category.id)} gasto(s)</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleEditCategory(category)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(category.id)}
                                        className="text-xs font-bold text-red-600 hover:text-red-800"
                                    >
                                        Borrar
                                    </button>
                                </div>
                            </div>
                        ))}
                        {expenseCategories.length === 0 && (
                            <p className="text-center text-stone-400 italic py-10">No hay categorías registradas.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {expenseCategories.length === 0 ? (
                        <div className="text-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-100">
                            <p className="text-stone-400 italic mb-4">Primero debes crear al menos una categoría.</p>
                            <Button variant="gold" onClick={() => setActiveTab('categories')}>Ir a Categorías</Button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end mb-6">
                                <Button
                                    variant="goldOutline"
                                    onClick={() => {
                                        resetExpenseForm();
                                        setIsAddingExpense(!isAddingExpense);
                                    }}
                                >
                                    {isAddingExpense ? 'CERRAR' : '+ NUEVO GASTO'}
                                </Button>
                            </div>

                            {isAddingExpense && (
                                <form onSubmit={handleSaveExpense} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Categoría</label>
                                            <select
                                                required
                                                value={expenseCategoryId}
                                                onChange={e => setExpenseCategoryId(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {expenseCategories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Monto ($)</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={expenseAmount}
                                                onChange={e => setExpenseAmount(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Descripción (Opcional)</label>
                                        <textarea
                                            value={expenseDescription}
                                            onChange={e => setExpenseDescription(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                            placeholder="Detalles del gasto..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Fecha</label>
                                            <input
                                                required
                                                type="date"
                                                value={expenseDate}
                                                onChange={e => setExpenseDate(e.target.value)}
                                                className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Método de Pago</label>
                                            <div className="flex gap-2">
                                                {(['cash', 'card', 'transfer'] as const).map(method => (
                                                    <button
                                                        key={method}
                                                        type="button"
                                                        onClick={() => setExpensePaymentMethod(method)}
                                                        className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${expensePaymentMethod === method
                                                            ? 'bg-[#C5A02E] text-white'
                                                            : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                                                            }`}
                                                    >
                                                        {getPaymentMethodLabel(method)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                                        <button type="button" onClick={resetExpenseForm} className="text-xs text-stone-400 hover:text-stone-600">Cancelar</button>
                                        <Button type="submit">{editingExpense ? 'Actualizar' : 'Guardar'} Gasto</Button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {expenses.slice(0, 15).map(expense => {
                                    const category = expenseCategories.find(c => c.id === expense.categoryId);
                                    return (
                                        <div key={expense.id} className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5] hover:border-[#B38A58]/50 hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all">
                                            <div className="flex flex-col md:flex-row justify-between items-start">
                                                <div className="flex-1 w-full">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {category && (
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                        )}
                                                        <span className="text-xs font-bold text-[#9C8775] uppercase">{expense.categoryName}</span>
                                                    </div>
                                                    <h4 className="font-bold text-lg text-[#B08A57]">${expense.amount.toFixed(2)}</h4>
                                                    {expense.description && (
                                                        <p className="text-sm text-[#3E2C23] mt-1">{expense.description}</p>
                                                    )}
                                                    <div className="flex gap-3 mt-2 text-xs text-[#9C8775]">
                                                        <span>{formatDate(expense.date)}</span>
                                                        <span>•</span>
                                                        <span>{getPaymentMethodLabel(expense.paymentMethod)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-3 mt-4 w-full md:w-auto md:ml-4 border-t border-[#E8DED5] pt-4 md:border-0 md:pt-0 justify-end">
                                                    <button
                                                        onClick={() => handleEditExpense(expense)}
                                                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        className="text-xs font-bold text-red-600 hover:text-red-800"
                                                    >
                                                        Borrar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {expenses.length === 0 && (
                                    <p className="text-center text-stone-400 italic py-10">No hay gastos registrados.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
