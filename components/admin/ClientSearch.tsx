"use client";

import React, { useState, useMemo } from 'react';
import { useConfig, Booking } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date-helpers';
import { EditBookingModal } from './EditBookingModal';
import { ClinicalHistoryModal } from '../staff/ClinicalHistoryModal';

interface ClientData {
    id: string;
    name: string;
    phone: string;
    totalVisits: number;
    totalSpent: number;
    lastVisit: string | null;
    lastService: string | null;
    pastBookings: Booking[];
    futureBookings: Booking[];
}

export function ClientSearch() {
    const { bookings, team, importedClients, importClient } = useConfig();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [viewingHistory, setViewingHistory] = useState<Booking | null>(null);

    // Helper to open edit modal with phone normalization
    const handleEditClick = (booking: Booking) => {
        let phone = booking.clientPhone || '';
        if (phone && !phone.includes('+')) {
            phone = `+54 ${phone}`;
        }
        setEditingBooking({ ...booking, clientPhone: phone });
    };

    // Normalize phone for comparison (remove spaces, dashes, and country code prefix)
    const normalizePhone = (phone: string): string => {
        return phone.replace(/[\s\-\+]/g, '').toLowerCase();
    };

    // Search clients based on query
    const searchResults = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const normalizedQuery = normalizePhone(searchQuery);

        // Group bookings by client (phone + name combination)
        const clientMap = new Map<string, ClientData>();

        bookings.forEach(booking => {
            const phoneStr = booking.clientPhone || '';
            const clientKey = `${phoneStr.trim()}_${booking.clientName.trim().toLowerCase()}`;
            const normalizedPhone = normalizePhone(phoneStr);

            // Check if booking matches search query
            const matchesName = booking.clientName.toLowerCase().includes(query);
            const matchesPhone = normalizedQuery ? normalizedPhone.includes(normalizedQuery) : false;

            if (!query || matchesName || matchesPhone) {
                if (!clientMap.has(clientKey)) {
                    clientMap.set(clientKey, {
                        id: clientKey,
                        name: booking.clientName,
                        phone: booking.clientPhone,
                        totalVisits: 0,
                        totalSpent: 0,
                        lastVisit: null,
                        lastService: null,
                        pastBookings: [],
                        futureBookings: []
                    });
                }

                const client = clientMap.get(clientKey)!;
                const bookingDate = new Date(booking.date);
                const now = new Date();

                const isPast = bookingDate < now;
                const isAbsent = booking.status === 'absent';
                const isAttended = booking.status === 'attended';

                // Categorize booking
                // Past bookings, Attended, or Absent go to pastBookings
                if (isAttended || isAbsent || isPast) {
                    client.pastBookings.push(booking);
                    
                    if (isAttended) {
                        client.totalVisits++;
                        client.totalSpent += booking.price || 0;

                        // Update last visit info
                        if (!client.lastVisit || new Date(booking.date) > new Date(client.lastVisit)) {
                            client.lastVisit = booking.date;
                            client.lastService = booking.serviceName;
                        }
                    }
                } else {
                    // Only future pending/confirmed go to futureBookings
                    client.futureBookings.push(booking);
                }
            }
        });

        // Sort bookings by date
        clientMap.forEach(client => {
            client.pastBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            client.futureBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        });

        const all = Array.from(clientMap.values());
        
        // Divide into detected and imported
        const detected = all.filter(c => !(importedClients || []).includes(c.id));
        const imported = all.filter(c => (importedClients || []).includes(c.id));

        const sortClients = (clients: ClientData[]) => clients.sort((a, b) => {
            if (a.lastVisit && b.lastVisit) {
                return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
            }
            if (a.lastVisit) return -1;
            if (b.lastVisit) return 1;
            if (a.futureBookings.length > 0 && b.futureBookings.length === 0) return -1;
            if (b.futureBookings.length > 0 && a.futureBookings.length === 0) return 1;
            return b.totalVisits - a.totalVisits;
        });

        return {
            detectedClients: sortClients(detected),
            crmClients: sortClients(imported)
        };
    }, [searchQuery, bookings, importedClients]);

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

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-2xl font-serif text-[#3E2C23] mb-4">
                    Buscar Cliente
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedClient(null);
                        }}
                        placeholder="Buscar por nombre o teléfono..."
                        className="w-full px-4 py-3 pl-12 rounded-xl bg-[#FCFAF8] border border-[#E8DED5] outline-none focus:border-[#B38A58] focus:ring-4 focus:ring-[#B38A58]/10 text-[#3E2C23] transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9C8775] text-xl">
                        🔍
                    </span>
                </div>
                <p className="text-xs text-[#9C8775] mt-2">
                    Escribe el nombre o número de teléfono del cliente para ver su historial
                </p>
            </div>

            {/* Detected Clients Module (Only show when not searching) */}
            {!searchQuery.trim() && !selectedClient && searchResults.detectedClients.length > 0 && (
                <div className="mb-10 bg-[#F8F5F2] rounded-2xl border border-[#E8DED5] overflow-hidden">
                    <div className="p-6 border-b border-[#E8DED5]">
                        <h3 className="text-xl font-bold text-[#3E2C23]">Clientes Detectados</h3>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[#9C8775] mt-1">
                            HAY {searchResults.detectedClients.length} CLIENTES EN EL HISTORIAL DE TURNOS QUE NO ESTÁN EN EL CRM
                        </p>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {searchResults.detectedClients.map((client, idx) => (
                            <div key={client.id} className="flex items-center justify-between p-4 border-b border-[#E8DED5] last:border-0 hover:bg-[#FCFAF8] transition-colors">
                                <div>
                                    <h4 className="font-bold text-[#3E2C23]">{client.name}</h4>
                                    <p className="text-xs text-[#9C8775]">
                                        {client.phone && `${client.phone} • `}{client.totalVisits} visitas
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        importClient(client.id);
                                    }}
                                    className="text-[11px] font-bold text-[#B08A57] hover:text-[#8E6D43] transition-colors tracking-widest px-4 py-2"
                                >
                                    IMPORTAR
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Results / CRM Clients */}
            {searchResults.crmClients.length > 0 && !selectedClient && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-[#9C8775] uppercase mb-3">
                        {searchQuery.trim() ? `Resultados (${searchResults.crmClients.length})` : `CRM - Clientes (${searchResults.crmClients.length})`}
                    </h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {searchResults.crmClients.map((client, idx) => (
                            <button
                                key={client.id}
                                onClick={() => setSelectedClient(client)}
                                className="w-full text-left p-4 bg-[#FCFAF8] border border-[#E8DED5] rounded-xl hover:border-[#B38A58]/50 hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-[#3E2C23]">{client.name}</h4>
                                        <p className="text-sm text-[#9C8775] font-mono">{client.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[#9C8775]">Visitas</p>
                                        <p className="text-lg font-bold text-[#3E2C23]">{client.totalVisits}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {searchQuery.trim() && searchResults.crmClients.length === 0 && searchResults.detectedClients.length === 0 && (
                <div className="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-100">
                    <p className="text-stone-400 italic">No se encontraron clientes con ese nombre o teléfono</p>
                </div>
            )}

            {/* Client Details */}
            {selectedClient && (
                <div className="animate-in slide-in-from-top-4">
                    <button
                        onClick={() => setSelectedClient(null)}
                        className="text-sm text-[#9C8775] hover:text-[#3E2C23] mb-4 flex items-center gap-1 transition-colors"
                    >
                        ← Volver a resultados
                    </button>

                    {/* Client Header */}
                    <div className="bg-gradient-to-br from-[#F8F5F2] to-[#F2EBE5] p-6 rounded-[20px] border border-[#E8DED5] mb-6 shadow-sm">
                        <h3 className="text-2xl font-serif text-[#3E2C23] mb-2">
                            {selectedClient.name}
                        </h3>
                        <p className="text-[#9C8775] font-mono mb-4">📞 {selectedClient.phone}</p>

                        {/* Statistics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5]">
                                <p className="text-xs text-[#9C8775] uppercase font-bold mb-1">Total Visitas</p>
                                <p className="text-2xl font-bold text-[#3E2C23]">{selectedClient.totalVisits}</p>
                            </div>
                            <div className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5]">
                                <p className="text-xs text-[#9C8775] uppercase font-bold mb-1">Gasto Total</p>
                                <p className="text-2xl font-bold text-[#B08A57]">${selectedClient.totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5]">
                                <p className="text-xs text-[#9C8775] uppercase font-bold mb-1">Última Visita</p>
                                <p className="text-sm font-bold text-[#3E2C23]">
                                    {selectedClient.lastVisit ? formatDate(selectedClient.lastVisit) : 'N/A'}
                                </p>
                            </div>
                            <div className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5]">
                                <p className="text-xs text-[#9C8775] uppercase font-bold mb-1">Último Servicio</p>
                                <p className="text-xs font-bold text-[#3E2C23] line-clamp-2">
                                    {selectedClient.lastService || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Future Bookings */}
                    {selectedClient.futureBookings.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-[#9C8775] uppercase mb-3 flex items-center gap-2">
                                📅 Turnos Futuros ({selectedClient.futureBookings.length})
                            </h4>
                            <div className="space-y-3">
                                {selectedClient.futureBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="bg-white border border-[#E8DED5] p-4 rounded-xl shadow-[0_4px_20px_rgba(120,90,60,0.03)] hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h5 className="font-bold text-[#3E2C23]">{booking.serviceName}</h5>
                                                <p className="text-sm text-[#9C8775]">{getProfessionalName(booking.professionalId)}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[booking.status as keyof typeof statusColors]}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between items-center gap-4 mt-2 border-t border-[#E8DED5] pt-3 text-xs text-[#9C8775] w-full">
                                            <span>📅 {formatDate(booking.date)} • {booking.time}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">${booking.price?.toLocaleString()}</span>
                                                <button
                                                    onClick={() => setViewingHistory(booking)}
                                                    className="p-1 hover:text-gold-600 text-stone-300 transition-colors"
                                                    title="Ver Ficha Clínica"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(booking)}
                                                    className="p-1 hover:text-gold-500 text-stone-300 transition-colors"
                                                    title="Editar Reserva"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Past Bookings */}
                    {selectedClient.pastBookings.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-[#9C8775] uppercase mb-3 flex items-center gap-2">
                                📋 Historial de Turnos ({selectedClient.pastBookings.length})
                            </h4>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedClient.pastBookings.map(booking => (
                                    <div
                                        key={booking.id}
                                        className="bg-[#FCFAF8] border border-[#E8DED5] p-4 rounded-xl"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h5 className="font-bold text-[#3E2C23]">{booking.serviceName}</h5>
                                                <p className="text-sm text-[#9C8775]">{getProfessionalName(booking.professionalId)}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${statusColors[booking.status as keyof typeof statusColors] || statusColors.attended}`}>
                                                {(booking.status || 'attended').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap justify-between items-center gap-4 mt-2 border-t border-[#E8DED5] pt-3 text-xs text-[#9C8775] w-full">
                                            <span>📅 {formatDate(booking.date)} • {booking.time}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">${booking.price?.toLocaleString()}</span>
                                                <button
                                                    onClick={() => setViewingHistory(booking)}
                                                    className="p-1 hover:text-gold-600 text-stone-300 transition-colors"
                                                    title="Ver Ficha Clínica"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(booking)}
                                                    className="p-1 hover:text-gold-500 text-stone-300 transition-colors"
                                                    title="Editar Reserva"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No History */}
                    {selectedClient.pastBookings.length === 0 && selectedClient.futureBookings.length === 0 && (
                        <div className="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-100">
                            <p className="text-stone-400 italic">Este cliente no tiene turnos registrados</p>
                        </div>
                    )}
                </div>
            )}

            {editingBooking && (
                <EditBookingModal
                    booking={editingBooking}
                    onClose={() => setEditingBooking(null)}
                />
            )}

            {viewingHistory && (
                <ClinicalHistoryModal
                    booking={viewingHistory}
                    onClose={() => setViewingHistory(null)}
                    professionalName={getProfessionalName(viewingHistory.professionalId)}
                />
            )}
        </Card>
    );
}
