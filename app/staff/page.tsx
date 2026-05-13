"use client";

import React, { useState } from 'react';
import { useConfig, TeamMember, Booking } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date-helpers';
import { ClinicalHistoryModal } from '@/components/staff/ClinicalHistoryModal';

export default function StaffPage() {
    const { team, bookings, clinicalRecords } = useConfig();

    // Auth State
    const [selectedProId, setSelectedProId] = useState<string>('');
    const [pinInput, setPinInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
    const [viewingHistory, setViewingHistory] = useState<Booking | null>(null);

    // Persist Session
    React.useEffect(() => {
        const savedUser = sessionStorage.getItem('staff_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = team.find(m => m.id === selectedProId);

        if (user && pinInput === (user.pin || '0000')) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            sessionStorage.setItem('staff_user', JSON.stringify(user));
        } else {
            alert('PIN Incorrecto');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setPinInput('');
        setSelectedProId('');
        sessionStorage.removeItem('staff_user');
    };

    const [activeTab, setActiveTab] = useState<'agenda' | 'patients'>('agenda');
    const [searchTerm, setSearchTerm] = useState('');

    // Dashboard Data
    const myBookings = bookings.filter(b => b.professionalId === currentUser?.id);

    // Sort by date/time
    const sortedBookings = [...myBookings].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });

    // Unique Patients List (from bookings and clinical records)
    const allPatients = Array.from(new Set([
        ...bookings.map(b => JSON.stringify({ name: b.clientName, phone: b.clientPhone })),
        ...clinicalRecords.map(r => JSON.stringify({ name: r.clientName, phone: r.clientPhone }))
    ])).map(s => JSON.parse(s))
        .filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm)
        );

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-green-100 text-green-700',
        attended: 'bg-blue-100 text-blue-700',
        absent: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
        pending: 'Pendiente',
        confirmed: 'Confirmado',
        attended: 'Atendido',
        absent: 'Ausente',
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-50 p-4">
                <Card className="max-w-sm w-full shadow-xl border-gold-200">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold font-serif text-stone-800">Acceso Profesionales</h1>
                        <p className="text-stone-500 text-sm mt-2">Selecciona tu perfil e ingresa el PIN</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Profesional</label>
                            <select
                                required
                                value={selectedProId}
                                onChange={e => setSelectedProId(e.target.value)}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-gold-400"
                            >
                                <option value="" disabled>Seleccionar...</option>
                                {team.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">PIN de Acceso</label>
                            <input
                                required
                                type="password"
                                value={pinInput}
                                onChange={e => setPinInput(e.target.value)}
                                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-gold-400 text-center tracking-widest text-lg"
                                placeholder="****"
                            />
                        </div>

                        <Button type="submit" fullWidth disabled={!selectedProId || !pinInput}>
                            Ingresar
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-soft-xl border border-stone-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center text-xl border border-gold-200">
                            {currentUser?.image ? (
                                <img src={currentUser.image} className="w-full h-full object-cover rounded-full" />
                            ) : '👤'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-stone-800 font-serif">Hola, {currentUser?.name}</h2>
                            <p className="text-stone-500 text-sm">Panel de Gestión de Profesionales</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        Salir
                    </Button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('agenda')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'agenda' ? 'bg-stone-800 text-white shadow-lg' : 'bg-white text-stone-400 hover:text-stone-600'}`}
                    >
                        📅 Mi Agenda
                    </button>
                    <button
                        onClick={() => setActiveTab('patients')}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'patients' ? 'bg-stone-800 text-white shadow-lg' : 'bg-white text-stone-400 hover:text-stone-600'}`}
                    >
                        🔍 Buscar Paciente
                    </button>
                </div>

                {/* Tab Content: Agenda */}
                {activeTab === 'agenda' && (
                    <div className="space-y-4">
                        {sortedBookings.length === 0 ? (
                            <div className="text-center py-12 text-stone-500 italic bg-white rounded-xl border border-dashed border-stone-200">
                                No tienes turnos asignados por el momento.
                            </div>
                        ) : (
                            sortedBookings.map(booking => (
                                <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border border-stone-100 hover:border-gold-300 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${statusColors[booking.status || 'confirmed']}`}>
                                                {statusLabels[booking.status || 'confirmed']}
                                            </span>
                                            <h3 className="font-bold text-stone-800 text-lg">{booking.clientName}</h3>
                                        </div>
                                        <p className="text-stone-600 mb-1 font-medium">{booking.serviceName}</p>
                                        <div className="text-stone-400 text-xs flex gap-2">
                                            <span>📅 {formatDate(new Date(booking.date))}</span>
                                            <span>⏰ {booking.time} Hs</span>
                                        </div>
                                    </div>

                                    {/* Clinical History access from agenda */}
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:block w-px h-12 bg-stone-100"></div>
                                        <button
                                            onClick={() => setViewingHistory(booking)}
                                            className="text-xs font-bold text-gold-600 hover:text-gold-700 bg-gold-50 hover:bg-gold-100 px-4 py-2 rounded-xl transition-all border border-gold-200/50 flex items-center gap-2"
                                        >
                                            📋 Historial Clínico
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Tab Content: Patients Search */}
                {activeTab === 'patients' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o celular..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-4 bg-stone-50 border border-stone-100 rounded-xl outline-none focus:border-gold-300 transition-all text-stone-700"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {allPatients.length === 0 ? (
                                <div className="md:col-span-2 text-center py-12 text-stone-400 italic">
                                    No se encontraron pacientes.
                                </div>
                            ) : (
                                allPatients.map((patient, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <h3 className="font-bold text-stone-800">{patient.name}</h3>
                                            <p className="text-xs text-stone-400">{patient.phone}</p>
                                        </div>
                                        <button
                                            onClick={() => setViewingHistory({ clientName: patient.name, clientPhone: patient.phone, professionalId: currentUser?.id } as any)}
                                            className="text-xs font-bold text-gold-600 hover:text-gold-700 p-2"
                                        >
                                            Ver Historial →
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Clinical History Modal */}
            {viewingHistory && (
                <ClinicalHistoryModal
                    booking={viewingHistory}
                    onClose={() => setViewingHistory(null)}
                    professionalName={currentUser?.name || ''}
                />
            )}
        </div>
    );
}
