import React from 'react';

export function Card({ children, className = '', variant = 'default' }: { children: React.ReactNode; className?: string, variant?: 'default' | 'glass' }) {
    const variants = {
        default: "bg-white shadow-[0_8px_30px_rgba(120,90,60,0.05)] border border-[#E8DED5]",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
    };

    return (
        <div
            className={`p-8 md:p-10 rounded-[24px] transition-all duration-300 ${variants[variant]} ${className}`}
        >
            {children}
        </div>
    );
}
