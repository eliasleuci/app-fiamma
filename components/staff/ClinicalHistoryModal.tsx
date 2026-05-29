"use client";

import { useState } from 'react';
import { useConfig, ClinicalRecord, Booking } from '@/context/ConfigContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatDate } from '@/utils/date-helpers';

interface ClinicalHistoryModalProps {
    booking: Booking;
    onClose: () => void;
    professionalName: string;
}

export function ClinicalHistoryModal({ booking, onClose, professionalName }: ClinicalHistoryModalProps) {
    const { clinicalRecords, addClinicalRecord, deleteClinicalRecord, updateClinicalRecord } = useConfig();
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [editNote, setEditNote] = useState('');

    // Filter records for this specific client
    const patientHistory = clinicalRecords.filter(r => {
        if (booking.clientPhone && r.clientPhone && booking.clientPhone.trim() !== '' && r.clientPhone.trim() !== '') {
            return r.clientPhone === booking.clientPhone;
        }
        return r.clientName.toLowerCase().trim() === booking.clientName.toLowerCase().trim();
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);

        const record: ClinicalRecord = {
            id: crypto.randomUUID(),
            clientName: booking.clientName,
            clientPhone: booking.clientPhone,
            professionalId: booking.professionalId || null,
            professionalName: professionalName,
            date: new Date().toISOString(),
            treatment: booking.serviceName,
            notes: newNote
        };

        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        addClinicalRecord(record);
        setNewNote('');
        setIsSubmitting(false);
    };

    const handleUpdate = async (e: React.FormEvent, record: ClinicalRecord) => {
        e.preventDefault();
        if (!editNote.trim()) return;

        updateClinicalRecord({ ...record, notes: editNote });
        setEditingRecordId(null);
        setEditNote('');
    };

    return (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-stone-800">📋 Ficha Clínica</h2>
                        <p className="text-xs text-stone-400 font-medium mt-1">Paciente: <span className="font-bold text-stone-600">{booking.clientName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-stone-300 hover:text-stone-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Add New Note Form */}
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-tighter mb-4">✍️ Nuevo Registro</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Detalles del tratamiento, evolución..."
                                className="w-full h-32 p-4 bg-white border border-stone-200 rounded-xl outline-none focus:border-gold-300 transition-all text-stone-700 placeholder:text-stone-300 text-sm"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !newNote.trim()}
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Past Records List */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-tighter">📅 Historial</h3>
                        {patientHistory.length === 0 ? (
                            <div className="text-center py-12 text-stone-300 italic text-sm">
                                No hay registros previos.
                            </div>
                        ) : (
                            patientHistory.map((record) => (
                                <div key={record.id} className="bg-white p-5 rounded-xl border border-stone-100 group relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-gold-600 uppercase bg-gold-50 px-2 py-0.5 rounded">
                                                    {record.treatment}
                                                </span>
                                                <span className="text-[10px] text-stone-400 font-bold">
                                                    {formatDate(new Date(record.date))}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-stone-400">Atendido por: {record.professionalName}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingRecordId(record.id);
                                                    setEditNote(record.notes);
                                                }}
                                                className="p-1 text-stone-400 hover:text-blue-500 transition-colors"
                                                title="Editar"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                onClick={() => { if (confirm('¿Eliminar registro?')) deleteClinicalRecord(record.id); }}
                                                className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                                                title="Eliminar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                    {editingRecordId === record.id ? (
                                        <form onSubmit={(e) => handleUpdate(e, record)} className="mt-3 space-y-3">
                                            <textarea
                                                value={editNote}
                                                onChange={(e) => setEditNote(e.target.value)}
                                                className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-gold-300 transition-all text-stone-700 text-sm"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setEditingRecordId(null)}
                                                    className="px-3 py-1.5 text-xs"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    disabled={!editNote.trim()}
                                                    className="px-3 py-1.5 text-xs"
                                                >
                                                    Guardar
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                                            {record.notes}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 text-center">
                    <p className="text-[10px] text-stone-300 uppercase tracking-widest font-bold">Fiamma Maniscalco</p>
                </div>
            </Card>
        </div>
    );
}
