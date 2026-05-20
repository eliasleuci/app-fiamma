"use client";

import React, { useState } from 'react';
import { useConfig, Booking } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, getSlotsForDate, checkAvailability, parseDuration } from '@/utils/date-helpers';
import { ClinicalHistoryModal } from '../staff/ClinicalHistoryModal';
import { EditBookingModal } from './EditBookingModal';

export function BookingList() {
    const { bookings, deleteBooking, updateBookingStatus, team, services, addBooking, updateBooking, professionalBlocks, expenses } = useConfig();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const [selectedSummaryDate, setSelectedSummaryDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewingHistory, setViewingHistory] = useState<Booking | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [showHistorical, setShowHistorical] = useState(false);

    // Manual Booking State
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newBooking, setNewBooking] = useState({
        clientName: '',
        countryCode: '+54',
        clientPhone: '',
        serviceId: '', // Added serviceId for better linking
        serviceName: '',
        price: '' as any,
        professionalId: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        paymentMethod: 'cash' as 'cash' | 'card'
    });

    // Overbooking Logic
    const [isOverbooking, setIsOverbooking] = useState(false);
    const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);

    // Check availability and autocomplete client data
    React.useEffect(() => {
        if (isCreating && newBooking.time) {
            const dateObj = new Date(newBooking.date + 'T12:00:00');
            
            // Try to find duration
            const selectedService = services.find(s => s.id === (newBooking as any).serviceId) || 
                                   services.find(s => s.name.toLowerCase() === newBooking.serviceName.toLowerCase());
            const duration = selectedService ? parseDuration(selectedService.duration) : 30;

            const isAvailable = checkAvailability(
                dateObj,
                newBooking.time,
                duration,
                bookings,
                services,
                team,
                professionalBlocks
            );

            if (!isAvailable) {
                setAvailabilityWarning('Este horario ya está ocupado. ¿Agendar como sobreturno?');
                setIsOverbooking(true);
            } else {
                setAvailabilityWarning(null);
                setIsOverbooking(false);
            }
        } else {
            setAvailabilityWarning(null);
            setIsOverbooking(false);
        }

        // Client Autocomplete Logic
        if (newBooking.clientPhone.length >= 8) {
            const normalizedNewPhone = newBooking.clientPhone.replace(/[\s\-\+]/g, '');
            // Find the most recent booking with this phone number
            const existingBooking = [...bookings]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .find(b => b.clientPhone && b.clientPhone.replace(/[\s\-\+]/g, '').includes(normalizedNewPhone));

            if (existingBooking && !newBooking.clientName) {
                setNewBooking(prev => ({
                    ...prev,
                    clientName: existingBooking.clientName
                }));
            }
        }
    }, [newBooking.date, newBooking.time, newBooking.professionalId, newBooking.clientPhone, isCreating, bookings]);

    const getProfessionalName = (id?: string) => {
        if (!id) return 'Sin Asignar';
        const member = team.find(m => m.id === id);
        return member ? member.name : 'Desconocido';
    };

    const statusColors = {
        pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        attended: 'bg-blue-50 text-blue-600 border-blue-100',
        absent: 'bg-red-50 text-red-600 border-red-100',
    };

    const statusLabels = {
        pending: 'PENDIENTE',
        confirmed: 'CONFIRMADO',
        attended: 'ATENDIDO',
        absent: 'AUSENTE',
    };

    const filteredBookings = bookings.filter(b => {
        // Filter by date (ensure we compare YYYY-MM-DD parts)
        const bookingDate = b.date.split('T')[0];
        const isSelectedDate = bookingDate === selectedDate;

        // If showHistorical is ON and a specific status is filtered (not 'all'), we show cross-dates
        // BUT if it's 'all', we ALWAYS stick to selected date to avoid chaos
        if (!showHistorical || filterStatus === 'all') {
            if (!isSelectedDate) return false;
        }

        // Filter by status
        if (filterStatus === 'all') return true;
        return b.status === filterStatus;
    }).sort((a, b) => {
        const timeA = a.time.padStart(5, '0');
        const timeB = b.time.padStart(5, '0');
        return timeA.localeCompare(timeB);
    });

    const getWhatsAppLink = (booking: Booking) => {
        if (!booking.clientPhone) return '';

        let phone = booking.clientPhone.replace(/\D/g, '');
        // Si el formato original NO tenía un '+', asumimos que es un número local de Argentina
        // y le agregamos el 54 al principio.
        if (!booking.clientPhone.includes('+')) {
            phone = '54' + phone;
        }

        // Usar formato simple DD/MM
        const dateParts = booking.date.split('T')[0].split('-');
        const date = `${dateParts[2]}/${dateParts[1]}`;
        const time = booking.time;

        const message = `Hola ${booking.clientName}! Te recordamos tu turno para *${booking.serviceName}* el día *${date}* a las *${time} hs*.

En cuanto al pago, por favor ten en cuenta:
Puedes pagar en efectivo o por transferencia bancaria (te daré el CBU el día de la cita).

Te esperamos en Fiamma Maniscalco - Córdoba, Argentina`;

        return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    };

    const handlePrint = () => {
        const printContent = document.getElementById('daily-summary-content');
        if (!printContent) return;

        const originalContent = document.body.innerHTML;
        const summaryHtml = printContent.innerHTML;

        document.body.innerHTML = `
            <div style="padding: 40px; font-family: sans-serif; color: #1c1917;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-family: serif; margin: 0;">Arqueo de Caja - ${formatDate(new Date(selectedSummaryDate + 'T12:00:00'))}</h1>
                    <p style="color: #78716c; margin: 5px 0;">Resumen detallado de ingresos</p>
                </div>
                <hr style="border: none; border-top: 1px solid #e7e5e4; margin-bottom: 30px;">
                ${summaryHtml}
                <div style="margin-top: 50px; border-top: 1px solid #e7e5e4; padding-top: 20px; font-size: 11px; color: #a8a29e; text-align: center; letter-spacing: 1px; text-transform: uppercase;">
                    Fiamma Maniscalco - Sistema de Gestión
                </div>
            </div>
            <style>
                .print-section { margin-bottom: 25px; border: 1px solid #e7e5e4; padding: 20px; border-radius: 12px; }
                .print-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #78716c; margin-bottom: 15px; border-bottom: 1px solid #f5f5f4; padding-bottom: 8px; }
                .print-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #f5f5f4; font-size: 13px; }
                .print-total { font-size: 20px; font-weight: bold; margin-top: 10px; text-align: right; }
            </style>
        `;

        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload();
    };

    const targetDateBookings = bookings.filter(b => b.date.startsWith(selectedSummaryDate) && (b.status === 'confirmed' || b.status === 'attended'));

    // Debug logging with table for better visibility
    console.log('📊 ===== ARQUEO DE CAJA DEBUG =====');
    console.log('Fecha seleccionada:', selectedSummaryDate);
    console.log('Total de reservas en sistema:', bookings.length);

    if (bookings.length > 0) {
        console.table(bookings.map(b => ({
            Cliente: b.clientName,
            Fecha: b.date,
            'Fecha (primeros 10)': b.date.substring(0, 10),
            Estado: b.status,
            Precio: b.price,
            Pago: b.paymentMethod
        })));
    }

    console.log('Reservas filtradas (confirmed/attended del día):', targetDateBookings.length);
    if (targetDateBookings.length > 0) {
        console.table(targetDateBookings.map(b => ({
            Cliente: b.clientName,
            Precio: b.price,
            Pago: b.paymentMethod
        })));
    }

    const cashTotal = targetDateBookings
        .reduce((sum, b) => {
            if (b.paymentMethod === 'cash') return sum + (b.price || 0);
            if (b.paymentMethod === 'mixed' && b.cashAmount) return sum + b.cashAmount;
            return sum;
        }, 0);

    const cardTotal = targetDateBookings
        .reduce((sum, b) => {
            if (b.paymentMethod === 'card') return sum + (b.price || 0);
            if (b.paymentMethod === 'mixed' && b.cardAmount) return sum + b.cardAmount;
            return sum;
        }, 0);

    const cashBookings = targetDateBookings.filter(b => b.paymentMethod === 'cash' || (b.paymentMethod === 'mixed' && (b.cashAmount || 0) > 0));
    const cardBookings = targetDateBookings.filter(b => b.paymentMethod === 'card' || (b.paymentMethod === 'mixed' && (b.cardAmount || 0) > 0));

    // Expenses Calculation for Net Balance
    const targetDateExpenses = expenses.filter(e => e.date === selectedSummaryDate);

    const cashExpenses = targetDateExpenses.filter(e => e.paymentMethod === 'cash');
    const cashExpensesTotal = cashExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const cardExpenses = targetDateExpenses.filter(e => e.paymentMethod === 'card' || e.paymentMethod === 'transfer');
    const cardExpensesTotal = cardExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <div className="space-y-6 relative">
            <div className="absolute -top-10 right-0">
                <button
                    onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                    className="text-[#3b82f6] hover:underline text-[10px] font-bold uppercase flex items-center gap-1"
                >
                    <span className="text-[8px]">{isSummaryOpen ? '▼' : '▶'}</span> Realizar Arqueo de Caja
                </button>
            </div>

            <Card>
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
                    <h2 className="text-2xl font-serif text-[#3E2C23]">
                        Agenda de Turnos
                    </h2>

                    <div className="flex flex-row overflow-x-auto whitespace-nowrap scrollbar-hide w-full xl:w-auto gap-2 items-center pb-2 xl:pb-0">
                        <label className="text-xs font-bold text-[#9C8775] uppercase hidden md:inline mr-2">Filtrar por:</label>
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'pending', label: 'Pendientes' },
                            { id: 'confirmed', label: 'Confirmados' },
                            { id: 'attended', label: 'Atendidos' },
                            { id: 'absent', label: 'Ausentes' }
                        ].map(status => (
                            <button
                                key={status.id}
                                onClick={() => {
                                    setFilterStatus(status.id);
                                    if (status.id === 'all') setShowHistorical(false);
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${filterStatus === status.id
                                    ? 'bg-[#3F3129] text-[#F8F5F2] border-[#3F3129] shadow-md'
                                    : 'bg-[#FCFAF8] text-[#9C8775] border-[#E8DED5] hover:border-[#B38A58]'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}

                        {filterStatus !== 'all' && (
                            <button
                                onClick={() => setShowHistorical(!showHistorical)}
                                className={`ml-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${showHistorical
                                    ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm'
                                    : 'bg-stone-50 text-stone-400 border-stone-100 hover:bg-stone-100 font-normal'
                                    }`}
                            >
                                {showHistorical ? '📅 MOSTRANDO HISTÓRICO' : '🔍 VER HISTÓRICO'}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between w-full xl:w-auto gap-2 border-t border-[#E8DED5] pt-4 xl:border-t-0 xl:pt-0">
                        <label className="text-xs font-bold text-[#9C8775] uppercase hidden md:inline">Fecha:</label>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    const date = new Date(selectedDate);
                                    date.setDate(date.getDate() - 1);
                                    setSelectedDate(date.toISOString().split('T')[0]);
                                }}
                                className="p-2 text-[#9C8775] hover:text-[#3E2C23] hover:bg-white rounded-lg transition-colors"
                            >
                                ◀
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-[#FCFAF8] border border-[#E8DED5] text-[#3E2C23] text-sm rounded-xl px-4 py-2 outline-none focus:border-[#B38A58]"
                            />
                            <button
                                onClick={() => {
                                    const date = new Date(selectedDate);
                                    date.setDate(date.getDate() + 1);
                                    setSelectedDate(date.toISOString().split('T')[0]);
                                }}
                                className="p-2 text-[#9C8775] hover:text-[#3E2C23] hover:bg-white rounded-lg transition-colors"
                            >
                                ▶
                            </button>
                        </div>
                    </div>
                </div>

                {/* Manual Booking Form */}
                <div className="mb-8">
                    <Button
                        variant="gold"
                        fullWidth
                        onClick={() => setIsCreating(!isCreating)}
                        className="mb-4"
                    >
                        {isCreating ? 'CANCELAR' : '+ NUEVA RESERVA MANUAL'}
                    </Button>

                    {isCreating && (
                        <div className="bg-stone-50 p-6 rounded-2xl border border-gold-100 animate-in slide-in-from-top-4">
                            <h3 className="font-serif font-bold text-stone-800 mb-6 text-xl">Nueva Reserva</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Nombre del Cliente</label>
                                        <input
                                            type="text"
                                            value={newBooking.clientName}
                                            onChange={e => setNewBooking({ ...newBooking, clientName: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200"
                                            placeholder="Ej: Maria Garcia"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">WhatsApp/Teléfono</label>
                                        <input
                                            type="text"
                                            value={newBooking.clientPhone}
                                            onChange={e => setNewBooking({ ...newBooking, clientPhone: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200"
                                            placeholder="Número"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Servicio</label>
                                        <select
                                            value={(newBooking as any).serviceId || 'custom'}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (val === 'custom') {
                                                    setNewBooking({ ...newBooking, serviceId: '', serviceName: '', price: '' });
                                                } else {
                                                    const s = services.find(serv => serv.id === val);
                                                    if (s) {
                                                        setNewBooking({ 
                                                            ...newBooking, 
                                                            serviceId: s.id, 
                                                            serviceName: s.name, 
                                                            price: s.promo_price || s.price 
                                                        });
                                                    }
                                                }
                                            }}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white mb-2"
                                        >
                                            <option value="custom">-- Servicio Personalizado / Otro --</option>
                                            {services.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} (${s.promo_price || s.price})</option>
                                            ))}
                                        </select>
                                        
                                        {(!(newBooking as any).serviceId || (newBooking as any).serviceId === '') && (
                                            <input
                                                type="text"
                                                value={newBooking.serviceName}
                                                onChange={e => setNewBooking({ ...newBooking, serviceName: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-stone-200 animate-in fade-in slide-in-from-top-1"
                                                placeholder="Nombre del servicio personalizado"
                                            />
                                        )}
                                        <p className="text-xs text-stone-400 mt-1">Selecciona un servicio o escribe uno personalizado</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Precio ($)</label>
                                        <input
                                            type="number"
                                            value={newBooking.price}
                                            onChange={e => setNewBooking({ ...newBooking, price: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200"
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Profesional</label>
                                        <select
                                            value={newBooking.professionalId}
                                            onChange={e => setNewBooking({ ...newBooking, professionalId: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200"
                                        >
                                            <option value="">Cualquiera</option>
                                            {team.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Fecha</label>
                                        <input
                                            type="date"
                                            value={newBooking.date}
                                            onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Hora</label>
                                        <select
                                            value={newBooking.time}
                                            onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-stone-200"
                                        >
                                            {getSlotsForDate(new Date(newBooking.date + 'T12:00:00'), 15).map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-400 mb-2 uppercase">Método de Pago</label>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setNewBooking({ ...newBooking, paymentMethod: 'cash' })}
                                                className={`flex-1 py-3 rounded-xl border transition-all font-bold text-xs ${newBooking.paymentMethod === 'cash' ? 'bg-[#C5A02E] text-white border-[#C5A02E]' : 'bg-white text-stone-400 border-stone-200'}`}
                                            >
                                                EFECTIVO
                                            </button>
                                            <button
                                                onClick={() => setNewBooking({ ...newBooking, paymentMethod: 'card' })}
                                                className={`flex-1 py-3 rounded-xl border transition-all font-bold text-xs ${newBooking.paymentMethod === 'card' ? 'bg-[#C5A02E] text-white border-[#C5A02E]' : 'bg-white text-stone-400 border-stone-200'}`}
                                            >
                                                TARJETA
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex flex-col gap-2">
                                        {availabilityWarning && (
                                            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-2 animate-in pulse duration-500">
                                                <p className="text-amber-700 text-xs font-bold flex items-center gap-2">
                                                    <span className="text-lg">⚠️</span> {availabilityWarning}
                                                </p>
                                            </div>
                                        )}
                                        <Button
                                            disabled={isSaving}
                                            variant={isOverbooking ? 'outline' : 'gold'}
                                            className={isOverbooking ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : ''}
                                            onClick={async () => {
                                                if (!newBooking.clientName || !newBooking.serviceName) {
                                                    alert('Por favor complete Nombre y Servicio');
                                                    return;
                                                }

                                                setIsSaving(true);
                                                const paddedTime = newBooking.time.padStart(5, '0');
                                                const bookingToAdd: any = {
                                                    id: crypto.randomUUID(),
                                                    clientName: newBooking.clientName,
                                                    clientPhone: newBooking.clientPhone ? `+54 ${newBooking.clientPhone}`.trim() : '',
                                                    serviceId: (newBooking as any).serviceId || services.find(s => s.name.toLowerCase() === newBooking.serviceName.toLowerCase())?.id || '',
                                                    serviceName: newBooking.serviceName,
                                                    price: newBooking.price,
                                                    paymentMethod: newBooking.paymentMethod,
                                                    date: `${newBooking.date}T${paddedTime}:00+01:00`,
                                                    time: paddedTime,
                                                    createdAt: new Date().toISOString(),
                                                    status: 'confirmed',
                                                    professionalId: newBooking.professionalId || undefined
                                                };

                                                const success = await addBooking(bookingToAdd);

                                                if (success) {
                                                    setIsCreating(false);
                                                    setNewBooking({
                                                        clientName: '',
        countryCode: '+54',
                                                        clientPhone: '',
                                                        serviceId: '',
                                                        serviceName: '',
                                                        price: '' as any,
                                                        professionalId: '',
                                                        date: new Date().toISOString().split('T')[0],
                                                        time: '10:00',
                                                        paymentMethod: 'cash'
                                                    });
                                                }
                                                setIsSaving(false);
                                            }}
                                        >
                                            {isSaving ? 'GUARDANDO...' : 'GUARDAR TURNO'}
                                        </Button>

                                        <Button
                                            disabled={isSaving}
                                            onClick={async () => {
                                                if (!newBooking.clientName || !newBooking.serviceName) {
                                                    alert('Por favor complete Nombre y Servicio');
                                                    return;
                                                }

                                                setIsSaving(true);
                                                const paddedTime = newBooking.time.padStart(5, '0');
                                                const bookingToAdd: any = {
                                                    id: crypto.randomUUID(),
                                                    clientName: newBooking.clientName,
                                                    clientPhone: newBooking.clientPhone ? `+54 ${newBooking.clientPhone}`.trim() : '',
                                                    serviceId: (newBooking as any).serviceId || services.find(s => s.name.toLowerCase() === newBooking.serviceName.toLowerCase())?.id || '',
                                                    serviceName: newBooking.serviceName,
                                                    price: newBooking.price,
                                                    paymentMethod: newBooking.paymentMethod,
                                                    date: `${newBooking.date}T${paddedTime}:00+01:00`,
                                                    time: paddedTime,
                                                    createdAt: new Date().toISOString(),
                                                    status: 'confirmed',
                                                    professionalId: newBooking.professionalId || undefined
                                                };

                                                const success = await addBooking(bookingToAdd);

                                                if (success) {
                                                    // For "Add Another", we keep the form open and the data
                                                    alert('Turno guardado correctamente. Puedes editar los datos para el siguiente turno.');
                                                }
                                                setIsSaving(false);
                                            }}
                                        >
                                            {isSaving ? 'GUARDANDO...' : 'GUARDAR Y AGENDAR OTRO'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isSummaryOpen && (
                    <div className="mb-8 p-6 bg-stone-50 rounded-2xl border border-stone-100 animate-in slide-in-from-top-2">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
                            <h3 className="font-bold text-stone-800">Cierre de Caja Diario</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const date = new Date(selectedSummaryDate);
                                        date.setDate(date.getDate() - 1);
                                        const newDateStr = date.toISOString().split('T')[0];
                                        setSelectedSummaryDate(newDateStr);
                                    }}
                                    className="p-1 px-3 rounded-md bg-white border border-stone-200 hover:bg-stone-50 text-stone-500 font-bold"
                                >
                                    ◀
                                </button>
                                <label htmlFor="summaryDate" className="text-xs text-stone-500 font-bold uppercase hidden">FECHA:</label>
                                <input
                                    type="date"
                                    id="summaryDate"
                                    value={selectedSummaryDate}
                                    onChange={(e) => setSelectedSummaryDate(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm outline-none focus:border-gold-300"
                                />
                                <button
                                    onClick={() => {
                                        const date = new Date(selectedSummaryDate);
                                        date.setDate(date.getDate() + 1);
                                        const newDateStr = date.toISOString().split('T')[0];
                                        setSelectedSummaryDate(newDateStr);
                                    }}
                                    className="p-1 px-3 rounded-md bg-white border border-stone-200 hover:bg-stone-50 text-stone-500 font-bold"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>

                        <div id="daily-summary-content">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="print-section">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 print-title">Efectivo</h4>
                                    <div className="space-y-2 mb-4">
                                        {cashBookings.map(b => (
                                            <div key={b.id} className="flex justify-between text-sm py-1 border-b border-stone-100 print-item">
                                                <span className="text-stone-600">{b.clientName} {b.paymentMethod === 'mixed' && '(Mix)'}</span>
                                                <span className="font-bold">${(b.paymentMethod === 'mixed' ? b.cashAmount : b.price)?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right print-total">
                                        <p className="text-xs text-stone-400 font-bold">TOTAL EFECTIVO</p>
                                        <p className="text-2xl font-bold text-emerald-600">${cashTotal.toLocaleString()}</p>
                                    </div>

                                    {/* Gastos en Efectivo */}
                                    <div className="mt-8 pt-4 border-t border-dashed border-stone-200">
                                        <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 print-title">Gastos (Efectivo)</h4>
                                        <div className="space-y-2 mb-4">
                                            {cashExpenses.length === 0 ? (
                                                <p className="text-xs text-stone-300 italic">No hay gastos.</p>
                                            ) : (
                                                cashExpenses.map(e => (
                                                    <div key={e.id} className="flex justify-between text-sm py-1 border-b border-stone-100 print-item">
                                                        <span className="text-stone-600 text-xs">{e.categoryName} - {e.description || 'Sin descripción'}</span>
                                                        <span className="font-bold text-red-400">-${e.amount.toLocaleString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-stone-400 font-bold">TOTAL GASTOS</p>
                                            <p className="text-xl font-bold text-red-500">-${cashExpensesTotal.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Neto Efectivo */}
                                    <div className="mt-6 pt-4 border-t-2 border-stone-200">
                                        <div className="text-right print-total">
                                            <p className="text-xs text-stone-800 font-bold uppercase tracking-widest">NETO EN CAJA</p>
                                            <p className="text-3xl font-bold text-stone-800">${(cashTotal - cashExpensesTotal).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="print-section">
                                    <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 print-title">Tarjeta / Banco</h4>
                                    <div className="space-y-2 mb-4">
                                        {cardBookings.map(b => (
                                            <div key={b.id} className="flex justify-between text-sm py-1 border-b border-stone-100 print-item">
                                                <span className="text-stone-600">{b.clientName} {b.paymentMethod === 'mixed' && '(Mix)'}</span>
                                                <span className="font-bold">${(b.paymentMethod === 'mixed' ? b.cardAmount : b.price)?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-right print-total">
                                        <p className="text-xs text-stone-400 font-bold">TOTAL TARJETA</p>
                                        <p className="text-2xl font-bold text-blue-600">${cardTotal.toLocaleString()}</p>
                                    </div>

                                    {/* Gastos en Tarjeta */}
                                    <div className="mt-8 pt-4 border-t border-dashed border-stone-200">
                                        <h4 className="text-xs font-bold text-stone-400 uppercase mb-4 print-title">Gastos (Tarjeta/Transf)</h4>
                                        <div className="space-y-2 mb-4">
                                            {cardExpenses.length === 0 ? (
                                                <p className="text-xs text-stone-300 italic">No hay gastos.</p>
                                            ) : (
                                                cardExpenses.map(e => (
                                                    <div key={e.id} className="flex justify-between text-sm py-1 border-b border-stone-100 print-item">
                                                        <span className="text-stone-600 text-xs">{e.categoryName} - {e.description || 'Sin descripción'}</span>
                                                        <span className="font-bold text-red-400">-${e.amount.toLocaleString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-stone-400 font-bold">TOTAL GASTOS</p>
                                            <p className="text-xl font-bold text-red-500">-${cardExpensesTotal.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Neto Tarjeta */}
                                    <div className="mt-6 pt-4 border-t-2 border-stone-200">
                                        <div className="text-right print-total">
                                            <p className="text-xs text-stone-800 font-bold uppercase tracking-widest">NETO BANCO</p>
                                            <p className="text-3xl font-bold text-stone-800">${(cardTotal - cardExpensesTotal).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen Global */}
                                <div className="md:col-span-2 mt-8 pt-6 border-t-4 border-stone-100 print-section">
                                    <div className="flex justify-between items-center bg-stone-50 p-6 rounded-2xl">
                                        <div>
                                            <p className="text-xs font-bold text-stone-400 uppercase mb-1">BALANCE FINAL DEL DÍA</p>
                                            <h3 className="text-4xl font-serif font-bold text-stone-800">
                                                ${((cashTotal + cardTotal) - (cashExpensesTotal + cardExpensesTotal)).toLocaleString()}
                                            </h3>
                                        </div>
                                        <div className="text-right text-xs space-y-1 text-stone-400">
                                            <p>Ingresos Totales: <span className="text-emerald-600 font-bold">+${(cashTotal + cardTotal).toLocaleString()}</span></p>
                                            <p>Gastos Totales: <span className="text-red-500 font-bold">-${(cashExpensesTotal + cardExpensesTotal).toLocaleString()}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center border-t border-stone-100 pt-6 print:hidden">
                            <Button variant="outline" onClick={handlePrint}>
                                🖨️ Descargar Reporte PDF
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16 text-stone-400 italic bg-white rounded-xl border-2 border-dashed border-stone-100">
                            No hay turnos con este filtro.
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-[#FCFAF8] border border-[#E8DED5] hover:border-[#B38A58]/50 p-5 rounded-[20px] hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all group active:scale-[0.98]"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-[#3E2C23] text-lg">{booking.clientName}</h3>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[booking.status as keyof typeof statusColors || 'pending']}`}>
                                                {statusLabels[booking.status as keyof typeof statusLabels || 'pending']}
                                            </span>
                                        </div>
                                        {booking.clientPhone && (
                                            <p className="text-stone-500 text-xs font-mono mb-1">📞 {booking.clientPhone}</p>
                                        )}
                                        <p className="text-stone-400 text-sm font-medium mb-3">{booking.serviceName} • {getProfessionalName(booking.professionalId)}</p>

                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-stone-400 font-bold">
                                                💵 ${booking.price?.toLocaleString()} •
                                                {booking.paymentMethod === 'cash' ? ' Efectivo' :
                                                    booking.paymentMethod === 'card' ? ' Tarjeta' :
                                                        ` Mixto ($${booking.cashAmount || 0} / $${booking.cardAmount || 0})`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2 w-full md:w-auto border-t border-[#E8DED5] pt-4 md:border-0 md:pt-0">
                                        <div className="text-right hidden md:block mr-4">
                                            <p className="text-xs text-[#9C8775] font-bold uppercase">{formatDate(booking.date)}</p>
                                            <p className="text-2xl font-serif text-[#3E2C23]">{booking.time}</p>
                                        </div>

                                        <select
                                            value={booking.status || 'pending'}
                                            onChange={(e) => updateBookingStatus(booking.id, e.target.value as any)}
                                            className="text-xs font-bold border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-gold-300 cursor-pointer"
                                        >
                                            <option value="pending">PENDIENTE</option>
                                            <option value="confirmed">CONFIRMADO</option>
                                            <option value="attended">ATENDIDO</option>
                                            <option value="absent">AUSENTE</option>
                                        </select>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    // Normalize legacy data: if phone doesn't start with +, prepend +54
                                                    // This ensures the modal parsing logic works correctly (it expects "+Code Number")
                                                    let phone = booking.clientPhone || '';
                                                    if (phone && !phone.includes('+')) {
                                                        phone = `+54 ${phone}`;
                                                    }

                                                    setEditingBooking({
                                                        ...booking,
                                                        clientPhone: phone
                                                    });
                                                }}
                                                className="p-2 text-stone-300 hover:text-blue-500 transition-colors"
                                                title="Editar Reserva"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => setViewingHistory(booking)}
                                                className="p-2 text-stone-300 hover:text-gold-600 transition-colors"
                                                title="Ver Ficha Clínica"
                                            >
                                                📋
                                            </button>

                                            {booking.clientPhone && (
                                                <a
                                                    href={getWhatsAppLink(booking)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-[#25D366] hover:text-[#1da851] transition-colors"
                                                    title="Enviar Recordatorio por WhatsApp"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                                    </svg>
                                                </a>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Eliminar este turno?')) deleteBooking(booking.id);
                                                }}
                                                className="p-2 text-stone-200 hover:text-red-500 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:hidden mt-4 pt-4 border-t border-stone-50 flex justify-between items-center bg-stone-50 rounded-lg px-4 py-2">
                                    <span className="text-xs text-stone-400 font-bold">{formatDate(booking.date)}</span>
                                    <span className="text-lg font-serif font-bold text-stone-800">{booking.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSaveAndAddAnother={(savedBooking) => {
                        setEditingBooking(null);
                        setIsCreating(true);

                        // Parse phone number to separate country code and number
                        let phone = savedBooking.clientPhone || '';

                        if (phone.includes('+')) {
                            const parts = phone.split(' ');
                            phone = parts.slice(1).join(' ');
                        }

                        setNewBooking({
                            clientName: savedBooking.clientName,
                            countryCode: '+54',
                            clientPhone: phone,
                            serviceId: '',
                            serviceName: '', // Keep empty for the new booking
                            price: '' as any,
                            professionalId: savedBooking.professionalId || '',
                            date: savedBooking.date.split('T')[0], // Keep the same date as the edited booking
                            time: '10:00',
                            paymentMethod: 'cash'
                        });

                        // Scroll to top to see the form
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
            )}

            {viewingHistory && (
                <ClinicalHistoryModal
                    booking={viewingHistory}
                    onClose={() => setViewingHistory(null)}
                    professionalName={getProfessionalName(viewingHistory.professionalId)}
                />
            )}
        </div>
    );
}
