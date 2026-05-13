"use client";

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';

export function GallerySection() {
    const { galleryImages } = useConfig();
    const { t } = useLanguage();

    if (galleryImages.length === 0) return null;

    return (
        <section className="w-full mt-24">
            <div className="text-center md:text-left mb-10">
                <h2 className="text-sm font-bold tracking-[0.2em] text-stone-400 uppercase mb-4">{t('common.gallery')}</h2>
                <h3 className="text-3xl font-serif text-stone-800 italic">{t('common.results')}</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {galleryImages.map((img, idx) => (
                    <div
                        key={idx}
                        className="aspect-[4/5] bg-stone-200 overflow-hidden"
                    >
                        <img
                            src={img}
                            alt={`Trabajo ${idx + 1}`}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
