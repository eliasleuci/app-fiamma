"use client";

import React, { useState, useMemo } from 'react';
import { useConfig, ClientProfile, Booking } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/date-helpers';

const AVAILABLE_TAGS = ['VIP', 'Nuevo', 'Referido', 'Frecuente', 'Inactivo'];

export function ClientProfileManager() {
    const {
        clientProfiles,
        bookings,
        team,
        addClientProfile,
        updateClientProfile,
        deleteClientProfile
    } = useConfig();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState<string | null>(null);
    const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
    const [isAddingClient, setIsAddingClient] = useState(false);

    // New client form state
    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formBirthdate, setFormBirthdate] = useState('');

    const resetForm = () => {
        setFormName('');
        setFormPhone('');
        setFormEmail('');
        setFormBirthdate('');
        setIsAddingClient(false);
    };

    // Enrich client profiles with booking data
    const enrichedClients = useMemo(() => {
        return clientProfiles.map(client => {
            const clientBookings = bookings.filter(
                b => b.clientPhone === client.phone || b.clientName === client.name
            );
            const attended = clientBookings.filter(b => b.status === 'attended' || b.status === 'confirmed');
            const totalSpent = attended.reduce((sum, b) => sum + (b.price || 0), 0);
            const visitCount = attended.length;
            const sortedAttended = [...attended].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const lastVisit = sortedAttended[0]?.date || client.lastVisit;
            const lastServiceName = sortedAttended[0]?.serviceName || client.lastServiceName;

            return { ...client, totalSpent, visitCount, lastVisit, lastServiceName };
        });
    }, [clientProfiles, bookings]);

    // Auto-detect clients from bookings that are not in CRM
    const unregisteredClients = useMemo(() => {
        const registeredKeys = new Set(clientProfiles.map(c => `${c.phone}_${(c.name || '').trim().toLowerCase()}`));
        const clientMap = new Map<string, { name: string; phone: string; visits: number; spent: number; lastDate: string }>();

        bookings.filter(b => b.status === 'attended' || b.status === 'confirmed').forEach(b => {
            const key = `${b.clientPhone}_${(b.clientName || '').trim().toLowerCase()}`;
            if (registeredKeys.has(key)) return;
            if (!clientMap.has(key)) {
                clientMap.set(key, { name: b.clientName, phone: b.clientPhone, visits: 0, spent: 0, lastDate: b.date });
            }
            const entry = clientMap.get(key)!;
            entry.visits++;
            entry.spent += b.price || 0;
            if (new Date(b.date) > new Date(entry.lastDate)) {
                entry.lastDate = b.date;
                entry.name = b.clientName;
            }
        });

        let results = Array.from(clientMap.values()).sort((a, b) => b.visits - a.visits);

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.phone.includes(query)
            );
        }

        return results;
    }, [clientProfiles, bookings, searchQuery]);

    // Birthday alerts
    const upcomingBirthdays = useMemo(() => {
        const now = new Date();
        const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return enrichedClients.filter(c => {
            if (!c.birthdate) return false;
            const bday = new Date(c.birthdate);
            const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
            return thisYearBday >= now && thisYearBday <= in7Days;
        }).map(c => {
            const bday = new Date(c.birthdate!);
            const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
            const daysUntil = Math.ceil((thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return { ...c, daysUntil };
        }).sort((a, b) => a.daysUntil - b.daysUntil);
    }, [enrichedClients]);

    // Filter clients
    const filteredClients = useMemo(() => {
        let results = enrichedClients;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.phone.includes(query) ||
                (c.email && c.email.toLowerCase().includes(query))
            );
        }

        if (filterTag) {
            results = results.filter(c => c.tags.includes(filterTag));
        }

        return results.sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0));
    }, [enrichedClients, searchQuery, filterTag]);

    const handleAddClient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formName.trim() || !formPhone.trim()) return;

        addClientProfile({
            id: Date.now().toString(),
            name: formName,
            phone: formPhone,
            email: formEmail || undefined,
            birthdate: formBirthdate || undefined,
            tags: ['Nuevo'],
            totalSpent: 0,
            visitCount: 0,
            createdAt: new Date().toISOString()
        });
        resetForm();
    };

    const handleImportClient = (client: { name: string; phone: string; visits: number; spent: number; lastDate: string }) => {
        addClientProfile({
            id: Date.now().toString(),
            name: client.name,
            phone: client.phone,
            tags: client.visits >= 5 ? ['Frecuente'] : ['Nuevo'],
            totalSpent: client.spent,
            visitCount: client.visits,
            lastVisit: client.lastDate,
            createdAt: new Date().toISOString()
        });
    };

    // Get client bookings for history
    const getClientBookings = (client: ClientProfile): Booking[] => {
        return bookings
            .filter(b => b.clientPhone === client.phone || b.clientName === client.name)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    // Calculate client analytics
    const getClientAnalytics = (client: ClientProfile) => {
        const clientBookings = getClientBookings(client);
        const attended = clientBookings.filter(b => b.status === 'attended' || b.status === 'confirmed');
        const absent = clientBookings.filter(b => b.status === 'absent');

        const totalSpent = attended.reduce((sum, b) => sum + (b.price || 0), 0);
        const avgSpent = attended.length > 0 ? totalSpent / attended.length : 0;

        // Frequency (average days between visits)
        let avgFrequency = 0;
        if (attended.length > 1) {
            const dates = attended.map(b => new Date(b.date).getTime()).sort();
            const diffs = [];
            for (let i = 1; i < dates.length; i++) {
                diffs.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
            }
            avgFrequency = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
        }

        // Favorite service
        const serviceCount = new Map<string, number>();
        attended.forEach(b => {
            serviceCount.set(b.serviceName, (serviceCount.get(b.serviceName) || 0) + 1);
        });
        const favoriteService = Array.from(serviceCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

        const noShowRate = clientBookings.length > 0
            ? (absent.length / clientBookings.length) * 100
            : 0;

        return { totalSpent, avgSpent, avgFrequency, favoriteService, noShowRate, totalVisits: attended.length };
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-stone-800">CRM - Clientes</h2>
                    <p className="text-xs text-stone-400 mt-1">{enrichedClients.length} clientes registrados</p>
                </div>
                <Button variant="gold" onClick={() => setIsAddingClient(!isAddingClient)}>
                    {isAddingClient ? 'CERRAR' : '+ NUEVO CLIENTE'}
                </Button>
            </div>

            {/* Birthday Alerts */}
            {upcomingBirthdays.length > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 animate-in fade-in">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-tighter mb-3">🎂 Cumpleaños Próximos</p>
                    <div className="space-y-2">
                        {upcomingBirthdays.map(c => (
                            <div key={c.id} className="flex items-center justify-between">
                                <span className="text-sm text-stone-700">
                                    <strong>{c.name}</strong>
                                    {c.daysUntil === 0 ? ' — ¡Hoy cumple! 🎉' : ` — en ${c.daysUntil} día${c.daysUntil > 1 ? 's' : ''}`}
                                </span>
                                <button
                                    onClick={() => setSelectedClient(c)}
                                    className="text-[10px] font-bold text-amber-600 uppercase hover:text-amber-800 transition-colors"
                                >
                                    Ver Perfil
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Client Form */}
            {isAddingClient && (
                <form onSubmit={handleAddClient} className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-6 space-y-4 animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Nuevo Cliente</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            required
                            value={formName}
                            onChange={e => setFormName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            placeholder="Nombre completo *"
                        />
                        <input
                            required
                            value={formPhone}
                            onChange={e => setFormPhone(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            placeholder="Teléfono *"
                        />
                        <input
                            value={formEmail}
                            onChange={e => setFormEmail(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            placeholder="Email (opcional)"
                            type="email"
                        />
                        <input
                            value={formBirthdate}
                            onChange={e => setFormBirthdate(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none focus:border-gold-300"
                            type="date"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="goldOutline" type="button" onClick={resetForm}>CANCELAR</Button>
                        <Button variant="gold" type="submit">GUARDAR</Button>
                    </div>
                </form>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50"
                    placeholder="Buscar por nombre, teléfono o email..."
                />
                <div className="flex gap-1 flex-wrap">
                    <button
                        onClick={() => setFilterTag(null)}
                        className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${!filterTag
                            ? 'bg-[#C5A02E] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                    >
                        Todos
                    </button>
                    {AVAILABLE_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${filterTag === tag
                                ? 'bg-[#C5A02E] text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Unregistered Clients Alert */}
            {unregisteredClients.length > 0 && !filterTag && (
                <div className="mb-6 rounded-2xl bg-gradient-to-r from-stone-50 to-white border border-stone-200 overflow-hidden shadow-sm">
                    <div className="bg-stone-100/50 px-5 py-4 border-b border-stone-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-stone-800">
                                {searchQuery.trim() ? 'Resultados no importados' : 'Clientes Detectados'}
                            </p>
                            {!searchQuery.trim() && (
                                <p className="text-[10px] font-medium text-stone-500 uppercase tracking-tighter mt-0.5">
                                    Hay {unregisteredClients.length} cliente{unregisteredClients.length > 1 ? 's' : ''} en el historial de turnos que no están en el CRM
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="p-2">
                        <div className="max-h-56 overflow-y-auto pr-2 space-y-1" style={{ scrollbarWidth: 'thin' }}>
                            {unregisteredClients.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-stone-50 transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-stone-800 group-hover:text-[#C5A02E] transition-colors">
                                            {c.name || 'Sin Nombre'}
                                        </span>
                                        <span className="text-[10px] text-stone-400 font-medium">
                                            {c.phone} • {c.visits} visita{c.visits > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleImportClient(c)}
                                        className="px-4 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider hover:bg-[#C5A02E] hover:text-white transition-all"
                                    >
                                        Importar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {filteredClients.map(client => (
                    <div
                        key={client.id}
                        className="bg-stone-50 p-5 rounded-2xl border border-stone-100 hover:bg-white hover:border-gold-200 hover:shadow-sm transition-all cursor-pointer group"
                        onClick={() => setSelectedClient(client)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h4 className="font-serif font-bold text-lg text-stone-800 tracking-tight">{client.name}</h4>
                                <p className="text-xs text-stone-400 mt-0.5">{client.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#C5A02E] font-bold text-sm">${(client.totalSpent || 0).toFixed(0)}</p>
                                <p className="text-[10px] text-stone-400">{client.visitCount || 0} visitas</p>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-1 flex-wrap mb-2">
                            {client.tags.map(tag => (
                                <span
                                    key={tag}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${tag === 'VIP' ? 'bg-amber-100 text-amber-700'
                                        : tag === 'Nuevo' ? 'bg-green-100 text-green-700'
                                            : tag === 'Frecuente' ? 'bg-blue-100 text-blue-700'
                                                : tag === 'Inactivo' ? 'bg-red-100 text-red-700'
                                                    : 'bg-stone-100 text-stone-500'
                                        }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {client.lastVisit && (
                            <p className="text-[10px] text-stone-400">
                                Última visita: {formatDate(client.lastVisit)} — {client.lastServiceName || ''}
                            </p>
                        )}
                    </div>
                ))}

                {filteredClients.length === 0 && (
                    <div className="col-span-full text-center py-12 text-stone-400">
                        <p className="text-lg font-serif">Sin resultados</p>
                        <p className="text-xs mt-1">No se encontraron clientes con esos criterios</p>
                    </div>
                )}
            </div>

            {/* Client Detail Modal */}
            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    bookings={getClientBookings(selectedClient)}
                    analytics={getClientAnalytics(selectedClient)}
                    team={team}
                    onClose={() => setSelectedClient(null)}
                    onUpdate={updateClientProfile}
                    onDelete={deleteClientProfile}
                />
            )}
        </Card>
    );
}

// ─── CLIENT DETAIL MODAL ────────────────────────────────────────

interface ClientDetailModalProps {
    client: ClientProfile;
    bookings: Booking[];
    analytics: {
        totalSpent: number;
        avgSpent: number;
        avgFrequency: number;
        favoriteService: string;
        noShowRate: number;
        totalVisits: number;
    };
    team: Array<{ id: string; name: string }>;
    onClose: () => void;
    onUpdate: (client: ClientProfile) => void;
    onDelete: (id: string) => void;
}

function ClientDetailModal({ client, bookings, analytics, team, onClose, onUpdate, onDelete }: ClientDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'analytics'>('info');

    // Editable fields
    const [email, setEmail] = useState(client.email || '');
    const [birthdate, setBirthdate] = useState(client.birthdate || '');
    const [allergies, setAllergies] = useState(client.allergies || '');
    const [preferences, setPreferences] = useState(client.preferences || '');
    const [privateNotes, setPrivateNotes] = useState(client.privateNotes || '');
    const [tags, setTags] = useState<string[]>(client.tags || []);

    const handleSave = () => {
        onUpdate({
            ...client,
            email: email || undefined,
            birthdate: birthdate || undefined,
            allergies: allergies || undefined,
            preferences: preferences || undefined,
            privateNotes: privateNotes || undefined,
            tags
        });
        onClose();
    };

    const handleDelete = () => {
        if (confirm(`¿Eliminar ficha de ${client.name}? Esto no borra sus turnos.`)) {
            onDelete(client.id);
            onClose();
        }
    };

    const toggleTag = (tag: string) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };

    const getProfessionalName = (id?: string) => {
        if (!id) return '-';
        return team.find(t => t.id === id)?.name || '-';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            confirmed: 'Confirmado',
            attended: 'Atendido',
            absent: 'Ausente'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'text-amber-600',
            confirmed: 'text-blue-600',
            attended: 'text-green-600',
            absent: 'text-red-600'
        };
        return colors[status] || 'text-stone-500';
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-stone-800">{client.name}</h3>
                            <p className="text-sm text-stone-400 mt-1">{client.phone} {client.email && `· ${client.email}`}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={handleDelete} className="text-[10px] font-bold text-red-500 uppercase hover:text-red-700">
                                Eliminar
                            </button>
                            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        {(['info', 'history', 'analytics'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-colors ${activeTab === tab
                                    ? 'bg-[#C5A02E] text-white'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                            >
                                {tab === 'info' ? 'Ficha' : tab === 'history' ? 'Historial' : 'Análisis'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeTab === 'info' && (
                        <div className="space-y-5">
                            {/* Tags */}
                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Tags</label>
                                <div className="flex gap-2 flex-wrap">
                                    {AVAILABLE_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${tags.includes(tag)
                                                ? 'bg-[#C5A02E] text-white'
                                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Email</label>
                                    <input
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50"
                                        placeholder="email@ejemplo.com"
                                        type="email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Cumpleaños</label>
                                    <input
                                        value={birthdate}
                                        onChange={e => setBirthdate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50"
                                        type="date"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Alergias / Cuidados Especiales</label>
                                <textarea
                                    value={allergies}
                                    onChange={e => setAllergies(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50 min-h-[60px]"
                                    placeholder="Ej: Alergia al látex, piel sensible..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Preferencias</label>
                                <textarea
                                    value={preferences}
                                    onChange={e => setPreferences(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50 min-h-[60px]"
                                    placeholder="Ej: Prefiere turnos por la mañana, le gusta charlar..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">Notas Privadas</label>
                                <textarea
                                    value={privateNotes}
                                    onChange={e => setPrivateNotes(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 outline-none focus:border-[#C5A02E]/50 min-h-[80px]"
                                    placeholder="Notas internas sobre la clienta..."
                                />
                            </div>

                            <div className="flex justify-end">
                                <Button variant="gold" onClick={handleSave}>GUARDAR CAMBIOS</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            {bookings.length === 0 ? (
                                <p className="text-center text-stone-400 py-8">Sin historial de turnos</p>
                            ) : (
                                <div className="space-y-2">
                                    {bookings.map(b => (
                                        <div key={b.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-stone-50 border border-stone-100">
                                            <div>
                                                <p className="text-sm font-bold text-stone-700">{b.serviceName}</p>
                                                <p className="text-[10px] text-stone-400">
                                                    {formatDate(b.date)} — {b.time} — {getProfessionalName(b.professionalId)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-[#C5A02E]">${b.price}</p>
                                                <p className={`text-[10px] font-bold uppercase ${getStatusColor(b.status)}`}>
                                                    {getStatusLabel(b.status)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-2xl font-bold text-[#C5A02E]">${analytics.totalSpent.toFixed(0)}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Gasto Total</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-2xl font-bold text-stone-800">{analytics.totalVisits}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Visitas</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-2xl font-bold text-stone-800">${analytics.avgSpent.toFixed(0)}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Ticket Promedio</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-2xl font-bold text-stone-800">{analytics.avgFrequency || '-'}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Días entre Visitas</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className="text-lg font-bold text-stone-800">{analytics.favoriteService}</p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Servicio Favorito</p>
                            </div>
                            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-center">
                                <p className={`text-2xl font-bold ${analytics.noShowRate > 20 ? 'text-red-500' : 'text-green-600'}`}>
                                    {analytics.noShowRate.toFixed(0)}%
                                </p>
                                <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">No-Shows</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
