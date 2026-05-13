"use client";

import React, { useState } from 'react';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
}

export function AccordionItem({ title, children }: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-stone-200 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-4 text-left font-serif text-stone-800 hover:text-stone-500 transition-colors"
            >
                <span>{title}</span>
                <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="text-stone-600 leading-relaxed">{children}</p>
            </div>
        </div>
    );
}

export function Accordion({ children }: { children: React.ReactNode }) {
    return (
        <div className="w-full border-t border-stone-200">
            <div className="px-0">
                {children}
            </div>
        </div>
    );
}
