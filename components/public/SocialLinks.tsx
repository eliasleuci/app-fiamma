"use client";

import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

export function SocialLinks() {
    const { businessPhone, instagramLink } = useConfig();

    // Clean phone for WhatsApp link
    const cleanPhone = businessPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;

    return (
        <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
            {/* Instagram */}
            {instagramLink && (
                <a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white rounded-full shadow-lg border border-stone-100 flex items-center justify-center text-stone-700 hover:text-[#E4405F] hover:scale-110 transition-all group"
                    aria-label="Instagram"
                >
                    <Instagram className="w-6 h-6" />
                </a>
            )}

            {/* WhatsApp */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all border-4 border-white"
                aria-label="WhatsApp"
            >
                <MessageCircle className="w-8 h-8 fill-current" />
            </a>
        </div>
    );
}
