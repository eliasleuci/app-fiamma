import React, { useState, useEffect } from 'react';
import { useConfig, Booking } from '@/context/ConfigContext';
import { Button } from '@/components/ui/Button';
import { getSlotsForDate } from '@/utils/date-helpers';

interface EditBookingModalProps {
    booking: Booking;
    onClose: () => void;
    onSaveAndAddAnother?: (booking: Booking) => void;
}

export function EditBookingModal({ booking: initialBooking, onClose, onSaveAndAddAnother }: EditBookingModalProps) {
    const { team, updateBooking, services } = useConfig();
    const [editingBooking, setEditingBooking] = useState<Booking>(initialBooking);
    const [isSaving, setIsSaving] = useState(false);

    // Update local state if prop changes (though usually this component is mounted conditionally)
    useEffect(() => {
        setEditingBooking(initialBooking);
    }, [initialBooking]);

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateBooking(editingBooking);
        if (success) {
            onClose();
        }
        setIsSaving(false);
    };

    const handleSaveAndAddAnother = async () => {
        setIsSaving(true);
        const success = await updateBooking(editingBooking);
        if (success && onSaveAndAddAnother) {
            onSaveAndAddAnother(editingBooking);
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#FCFAF8] rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-[0_8px_30px_rgba(120,90,60,0.08)] border border-[#E8DED5]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-2xl text-[#3E2C23]">Editar Reserva</h3>
                    <button onClick={onClose} className="text-[#9C8775] hover:text-[#3E2C23]">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Nombre del Cliente</label>
                            <input
                                type="text"
                                value={editingBooking.clientName}
                                onChange={e => setEditingBooking({ ...editingBooking, clientName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">WhatsApp/Teléfono</label>
                            <input
                                type="text"
                                value={editingBooking.clientPhone ? editingBooking.clientPhone.replace(/^\+54\s*/, '') : ''}
                                onChange={e => {
                                    setEditingBooking({
                                        ...editingBooking,
                                        clientPhone: `+54 ${e.target.value}`
                                    });
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Servicio</label>
                            <select
                                value={editingBooking.serviceId || 'custom'}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val === 'custom') {
                                        setEditingBooking({ ...editingBooking, serviceId: '', serviceName: '' });
                                    } else {
                                        const s = services.find(serv => serv.id === val);
                                        if (s) {
                                            setEditingBooking({ 
                                                ...editingBooking, 
                                                serviceId: s.id, 
                                                serviceName: s.name, 
                                                price: editingBooking.price || s.promo_price || s.price 
                                            });
                                        }
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none mb-2"
                            >
                                <option value="custom">-- Servicio Personalizado / Otro --</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} (${s.promo_price || s.price})</option>
                                ))}
                            </select>

                            {(!editingBooking.serviceId || editingBooking.serviceId === '') && (
                                <input
                                    type="text"
                                    value={editingBooking.serviceName}
                                    onChange={e => setEditingBooking({ ...editingBooking, serviceName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none animate-in fade-in slide-in-from-top-1"
                                    placeholder="Nombre del servicio personalizado"
                                />
                            )}
                            <p className="text-xs text-[#9C8775] mt-1">Selecciona un servicio para vincular duración y precio oficial</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Precio ($)</label>
                            <input
                                type="number"
                                value={editingBooking.price}
                                onChange={e => setEditingBooking({ ...editingBooking, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                                placeholder="0"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Profesional</label>
                            <select
                                value={editingBooking.professionalId || ''}
                                onChange={e => setEditingBooking({ ...editingBooking, professionalId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                            >
                                <option value="">Sin Asignar</option>
                                {team.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Fecha</label>
                            <div className="flex items-center justify-between w-full border-t border-[#E8DED5] pt-4 xl:border-t-0 xl:pt-0 gap-2">
                                <button
                                    onClick={() => {
                                        const date = new Date(editingBooking.date);
                                        date.setDate(date.getDate() - 1);
                                        const newDateStr = date.toISOString().split('T')[0];
                                        setEditingBooking({ ...editingBooking, date: newDateStr + 'T' + editingBooking.time + ':00+01:00' });
                                    }}
                                    className="px-3 py-3 rounded-xl border border-[#E8DED5] hover:border-[#B38A58] text-[#9C8775]"
                                >
                                    ◀
                                </button>
                                <input
                                    type="date"
                                    value={editingBooking.date.split('T')[0]}
                                    onChange={e => setEditingBooking({ ...editingBooking, date: e.target.value + 'T' + editingBooking.time + ':00+01:00' })}
                                    className="flex-1 px-4 py-3 w-full rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                                />
                                <button
                                    onClick={() => {
                                        const date = new Date(editingBooking.date);
                                        date.setDate(date.getDate() + 1);
                                        const newDateStr = date.toISOString().split('T')[0];
                                        setEditingBooking({ ...editingBooking, date: newDateStr + 'T' + editingBooking.time + ':00+01:00' });
                                    }}
                                    className="px-3 py-3 rounded-xl border border-[#E8DED5] hover:border-[#B38A58] text-[#9C8775]"
                                >
                                    ▶
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Hora</label>
                            <select
                                value={editingBooking.time}
                                onChange={e => {
                                    const paddedTime = e.target.value.padStart(5, '0');
                                    setEditingBooking({
                                        ...editingBooking,
                                        time: paddedTime,
                                        date: editingBooking.date.split('T')[0] + 'T' + paddedTime + ':00+01:00'
                                    });
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                            >
                                {getSlotsForDate(new Date(editingBooking.date), 15).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Método de Pago</label>
                            <div className="flex flex-wrap gap-4 w-full border-t border-[#E8DED5] pt-4 xl:border-t-0 xl:pt-0">
                                <button
                                    onClick={() => setEditingBooking({ ...editingBooking, paymentMethod: 'cash' })}
                                    className={`flex-1 py-3 rounded-xl border transition-all font-bold text-xs ${editingBooking.paymentMethod === 'cash' ? 'bg-[#C5A02E] text-white border-[#C5A02E]' : 'bg-white text-stone-400 border-stone-200'}`}
                                >
                                    EFECTIVO
                                </button>
                                <button
                                    onClick={() => setEditingBooking({ ...editingBooking, paymentMethod: 'card' })}
                                    className={`flex-1 py-3 rounded-xl border transition-all font-bold text-xs ${editingBooking.paymentMethod === 'card' ? 'bg-[#3F3129] text-[#F8F5F2] border-[#3F3129]' : 'bg-white text-[#9C8775] border-[#E8DED5]'}`}
                                >
                                    TARJETA
                                </button>
                                <button
                                    onClick={() => setEditingBooking({ ...editingBooking, paymentMethod: 'mixed', cashAmount: editingBooking.price / 2, cardAmount: editingBooking.price / 2 })}
                                    className={`flex-1 py-3 rounded-xl border transition-all font-bold text-xs ${editingBooking.paymentMethod === 'mixed' ? 'bg-[#3F3129] text-[#F8F5F2] border-[#3F3129]' : 'bg-white text-[#9C8775] border-[#E8DED5]'}`}
                                >
                                    MIXTO
                                </button>
                            </div>

                            {/* Split Payment Inputs */}
                            {editingBooking.paymentMethod === 'mixed' && (
                                <div className="mt-4 p-4 bg-white rounded-xl border border-[#E8DED5] animate-in slide-in-from-top-2">
                                    <p className="text-xs font-bold text-[#9C8775] uppercase mb-3 text-center">Desglose de Pago</p>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[#9C8775] mb-1 uppercase">Efectivo ($)</label>
                                            <input
                                                type="number"
                                                value={editingBooking.cashAmount || ''}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    const cash = val === '' ? 0 : parseFloat(val);
                                                    const card = Math.max(0, editingBooking.price - cash);
                                                    setEditingBooking({
                                                        ...editingBooking,
                                                        cashAmount: cash,
                                                        cardAmount: card
                                                    });
                                                }}
                                                placeholder="0"
                                                className="w-full px-3 py-2 rounded-lg bg-[#FCFAF8] border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-[#9C8775] mb-1 uppercase">Tarjeta ($)</label>
                                            <input
                                                type="number"
                                                value={editingBooking.cardAmount || 0}
                                                disabled
                                                className="w-full px-3 py-2 rounded-lg bg-[#F8F5F2] border border-[#E8DED5] text-[#9C8775] cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-[#9C8775] mt-2 text-center italic">
                                        El monto en tarjeta se calcula automáticamente.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase">Estado</label>
                            <select
                                value={editingBooking.status}
                                onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value as any })}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] focus:border-[#B38A58] outline-none"
                            >
                                <option value="pending">PENDIENTE</option>
                                <option value="confirmed">CONFIRMADO</option>
                                <option value="attended">ATENDIDO</option>
                                <option value="absent">AUSENTE</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <Button
                            variant="outline"
                            fullWidth
                            onClick={onClose}
                        >
                            CANCELAR
                        </Button>
                        <Button
                            variant="gold"
                            fullWidth
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </Button>
                    </div>
                    {onSaveAndAddAnother && (
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleSaveAndAddAnother}
                            disabled={isSaving}
                            className="bg-black text-white hover:bg-stone-800"
                        >
                            {isSaving ? 'GUARDANDO...' : 'GUARDAR Y AGENDAR OTRO'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
