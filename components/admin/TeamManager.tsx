"use client";

import React, { useState } from 'react';
import { useConfig, TeamMember } from '@/context/ConfigContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';

export function TeamManager() {
    const { team, updateTeam } = useConfig();
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');
    const [pin, setPin] = useState('0000');
    const [showOnHome, setShowOnHome] = useState(true);

    const resetForm = () => {
        setId('');
        setName('');
        setRole('');
        setBio('');
        setImage('');
        setPin('0000');
        setShowOnHome(true);
        setIsEditing(false);
    };

    const handleEdit = (member: TeamMember) => {
        setId(member.id);
        setName(member.name);
        setRole(member.role);
        setBio(member.bio);
        setImage(member.image);
        setPin(member.pin || '0000');
        setShowOnHome(member.showOnHome !== false);
        setIsEditing(true);
    };

    const handleDelete = (memberId: string) => {
        if (confirm('¿Eliminar a este miembro?')) {
            updateTeam(team.filter(t => t.id !== memberId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMember: TeamMember = {
            id: id || Date.now().toString(),
            name,
            role,
            bio,
            image,
            pin,
            showOnHome
        };

        if (id) {
            // Edit
            updateTeam(team.map(t => t.id === id ? newMember : t));
        } else {
            // Create
            updateTeam([...team, newMember]);
        }
        resetForm();
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif text-[#3E2C23]">
                        Equipo
                    </h2>
                    <Button
                        variant="goldOutline"
                        onClick={() => { resetForm(); setIsEditing(!isEditing); }}
                    >
                        {isEditing ? 'CERRAR' : '+ NUEVO PROFESIONAL'}
                    </Button>
                </div>

                {isEditing && (
                    <form onSubmit={handleSubmit} className="bg-[#FCFAF8] p-6 rounded-[20px] border border-[#E8DED5] animate-in slide-in-from-top-2 space-y-6">
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center overflow-hidden border border-stone-200">
                                {image ? (
                                    <img src={image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">👤</span>
                                )}
                            </div>
                            <ImageUpload onUpload={setImage} label={image ? "Cambiar Foto" : "Subir Foto"} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase tracking-tighter">Nombre Completo</label>
                                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] outline-none focus:border-[#B38A58]" placeholder="Ej: Dra. Ana García" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase tracking-tighter">Especialidad</label>
                                <input required value={role} onChange={e => setRole(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] outline-none focus:border-[#B38A58]" placeholder="Ej: Especialista Facial" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#9C8775] mb-2 uppercase tracking-tighter">Biografía</label>
                            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] outline-none focus:border-[#B38A58]" placeholder="Breve descripción profesional..." />
                        </div>

                        <div className="w-full md:w-32">
                            <label className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-tighter">PIN Acceso</label>
                            <input
                                required
                                type="text"
                                maxLength={4}
                                pattern="\d{4}"
                                value={pin}
                                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                className="w-full px-4 py-2 rounded-xl bg-white border border-[#E8DED5] text-[#3E2C23] font-mono text-center text-lg tracking-widest outline-none focus:border-[#B38A58]"
                                placeholder="0000"
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="showOnHome"
                                checked={showOnHome}
                                onChange={e => setShowOnHome(e.target.checked)}
                                className="w-5 h-5 rounded border-stone-300 text-gold-500 focus:ring-gold-500"
                            />
                            <label htmlFor="showOnHome" className="text-sm font-bold text-stone-600 select-none cursor-pointer">
                                Mostrar en Página Principal
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-stone-100">
                            <Button type="submit">Guardar Especialista</Button>
                        </div>
                    </form>
                )}

                <div className="grid gap-3">
                    {team.map(member => (
                        <div key={member.id} className="bg-[#FCFAF8] p-4 rounded-xl border border-[#E8DED5] flex items-center gap-4 group hover:border-[#B38A58]/50 hover:shadow-[0_4px_20px_rgba(179,138,88,0.08)] transition-all">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E8DED5] shrink-0">
                                {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-200 flex items-center justify-center text-xl">👤</div>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-[#3E2C23]">{member.name}</h3>
                                <p className="text-[#B08A57] text-xs font-bold">{member.role}</p>
                                <p className="text-[#B08A57] text-xs font-bold">{member.role}</p>
                                <p className="text-[10px] text-[#9C8775] font-mono">ID: {member.pin || '0000'} • {member.showOnHome !== false ? '✅ Visible' : '👁️ Oculto'}</p>
                            </div>
                            <div className="flex gap-3 transition-opacity">
                                <button
                                    onClick={() => handleEdit(member)}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(member.id)}
                                    className="text-xs font-bold text-red-600 hover:text-red-800"
                                >
                                    Borrar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
