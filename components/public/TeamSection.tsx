"use client";

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';

export function TeamSection() {
    const { team } = useConfig();
    const { t } = useLanguage();

    const visibleTeam = team.filter(m => m.showOnHome !== false);

    if (visibleTeam.length === 0) return null;

    return (
        <section className="w-full max-w-4xl mx-auto mt-24 px-4 animate-in fade-in duration-700 delay-200">
            <div className="text-center mb-10">
                <h2 className="text-xl font-bold text-stone-800 tracking-tight">{t('common.team')}</h2>
                <p className="text-stone-400 mt-1 text-sm font-light">{t('common.estetica_bienestar')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
                {visibleTeam.map((member) => (
                    <div
                        key={member.id}
                        className="bg-white p-6 border border-stone-100 flex flex-col items-center text-center hover:shadow-lg transition-all duration-500"
                    >
                        <div className="w-32 h-32 mb-6 overflow-hidden rounded-full grayscale hover:grayscale-0 transition-all duration-500 shrink-0">
                            {member.image ? (
                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-2xl">✨</div>
                            )}
                        </div>
                        <h3 className="text-xl font-serif text-stone-900 mb-1">{member.name}</h3>
                        <p className="text-stone-400 text-xs uppercase tracking-widest mb-4">{member.role}</p>
                        {member.bio && (
                            <p className="text-stone-500 text-sm leading-relaxed font-light">{member.bio}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
