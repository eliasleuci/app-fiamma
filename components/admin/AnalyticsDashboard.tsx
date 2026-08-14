"use client";

import React, { useEffect, useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export function AnalyticsDashboard() {
    const {
        analyticsMetrics,
        calculateAnalytics,
        bookings,
        expenses,
        inventoryItems,
        serviceInventoryCosts
    } = useConfig();

    const [timeframe, setTimeframe] = useState<3 | 6 | 12>(6);

    // Recalculate on mount and when data changes
    useEffect(() => {
        calculateAnalytics();
    }, [bookings, expenses, inventoryItems, serviceInventoryCosts]);

    if (!analyticsMetrics) {
        return (
            <Card>
                <div className="text-center py-12">
                    <p className="text-stone-400 font-serif text-lg">Cargando analítica...</p>
                </div>
            </Card>
        );
    }

    const m = analyticsMetrics;

    // This month expenses
    const now = new Date();
    const thisMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalExpenses = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = m.thisMonthIncome - totalExpenses;

    // Bar colors
    const barColors = ['#C5A02E', '#D4B65B', '#A68626', '#B38A58', '#C89B65'];

    return (
        <Card>
            <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800">Panel de Analítica</h2>
                <p className="text-xs text-stone-400 mt-1">Resumen del mes actual</p>
            </div>

            {/* ─── KPI CARDS ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Income */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A02E]/5 rounded-full -translate-y-4 translate-x-4" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Ingresos</p>
                    <p className="text-2xl font-bold text-[#C5A02E] mt-1">${m.thisMonthIncome.toFixed(0)}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className={`text-[10px] font-bold ${m.incomeGrowthPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {m.incomeGrowthPercent >= 0 ? '↑' : '↓'} {Math.abs(m.incomeGrowthPercent).toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-stone-400">vs mes anterior</span>
                    </div>
                </div>

                {/* Average Ticket */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A02E]/5 rounded-full -translate-y-4 translate-x-4" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-stone-800 mt-1">${m.averageTicket.toFixed(0)}</p>
                    <p className="text-[10px] text-stone-400 mt-1">por turno atendido</p>
                </div>

                {/* Occupancy */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A02E]/5 rounded-full -translate-y-4 translate-x-4" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Ocupación</p>
                    <p className="text-2xl font-bold text-stone-800 mt-1">{m.occupancyPercent.toFixed(0)}%</p>
                    <div className="h-1.5 bg-stone-200 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-[#C5A02E] rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(m.occupancyPercent, 100)}%` }}
                        />
                    </div>
                </div>

                {/* New Clients */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#C5A02E]/5 rounded-full -translate-y-4 translate-x-4" />
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Clientes Nuevos</p>
                    <p className="text-2xl font-bold text-stone-800 mt-1">{m.newClientsThisMonth}</p>
                    <p className="text-[10px] text-stone-400 mt-1">este mes</p>
                </div>
            </div>

            {/* ─── CHARTS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Income Trend */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Ingresos (Tendencia)</p>
                        <div className="flex gap-1 bg-stone-200/50 p-1 rounded-lg">
                            {([3, 6, 12] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTimeframe(t)}
                                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                                        timeframe === t
                                            ? 'bg-white text-[#C5A02E] shadow-sm'
                                            : 'text-stone-500 hover:text-stone-700'
                                    }`}
                                >
                                    {t}M
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={m.incomeByMonth.slice(-timeframe)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E8DED5" />
                            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9C8775' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#9C8775' }} />
                            <Tooltip
                                contentStyle={{
                                    background: '#FFFFFF',
                                    border: '1px solid #E8DED5',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                                }}
                                formatter={(value: any) => [`$${Number(value).toFixed(0)}`, 'Ingresos']}
                            />
                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#C5A02E"
                                strokeWidth={3}
                                dot={{ fill: '#C5A02E', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#A68626' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Occupancy by Professional */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter mb-4">Ocupación por Profesional</p>
                    {m.occupancyByProfessional.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={m.occupancyByProfessional} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8DED5" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9C8775' }} />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#9C8775' }} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#FFFFFF',
                                        border: '1px solid #E8DED5',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                                    }}
                                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Ocupación']}
                                />
                                <Bar dataKey="percent" radius={[0, 8, 8, 0]}>
                                    {m.occupancyByProfessional.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[200px] text-stone-400 text-sm">
                            No hay datos de profesionales
                        </div>
                    )}
                </div>
            </div>

            {/* ─── TOP SERVICES & PROFIT ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Services */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter mb-4">Top 5 Servicios</p>
                    {m.topServices.length > 0 ? (
                        <div className="space-y-3">
                            {m.topServices.map((svc, i) => (
                                <div key={svc.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#C5A02E]/10 text-[#C5A02E] text-[10px] font-bold">
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-bold text-stone-700">{svc.name}</p>
                                            <p className="text-[10px] text-stone-400">{svc.count} turno{svc.count > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-[#C5A02E]">${svc.revenue.toFixed(0)}</p>
                                        <p className={`text-[10px] font-bold ${svc.profitMargin >= 70 ? 'text-green-600' : svc.profitMargin >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {svc.profitMargin.toFixed(0)}% margen
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-stone-400 py-8 text-sm">Sin datos este mes</p>
                    )}
                </div>

                {/* Profit Summary */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter mb-4">Resultado del Mes</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                            <span className="text-sm text-stone-600">Ingresos</span>
                            <span className="text-sm font-bold text-green-600">+ ${m.thisMonthIncome.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                            <span className="text-sm text-stone-600">Gastos Registrados</span>
                            <span className="text-sm font-bold text-red-500">- ${totalExpenses.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                            <span className="text-sm text-stone-600">Mes Anterior</span>
                            <span className="text-sm text-stone-400">${m.lastMonthIncome.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            <span className="text-sm font-bold text-stone-800">Resultado Neto</span>
                            <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
