"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-full border border-stone-200 shadow-sm">
            <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'es'
                        ? 'bg-stone-800 text-white shadow-md'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en'
                        ? 'bg-stone-800 text-white shadow-md'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
            >
                EN
            </button>
        </div>
    );
}
