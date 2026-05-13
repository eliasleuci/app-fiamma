import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'goldOutline';
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-xl font-serif font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-[#3F3129] text-[#F8F5F2] hover:bg-[#2A201A] shadow-md hover:shadow-lg hover:-translate-y-0.5 tracking-widest uppercase text-[10px] border border-[#3F3129]",
        secondary: "bg-[#FCFAF8] text-[#9C8775] hover:bg-white hover:text-[#3E2C23] border border-[#E8DED5] text-sm",
        outline: "bg-transparent border border-[#E8DED5] text-[#9C8775] hover:bg-[#FCFAF8] hover:text-[#3E2C23] text-sm uppercase tracking-widest",
        gold: "bg-gradient-to-br from-[#B38A58] to-[#C89B65] text-white hover:shadow-[0_8px_20px_rgba(179,138,88,0.25)] hover:-translate-y-0.5 text-[10px] uppercase tracking-widest font-bold",
        goldOutline: "bg-transparent border border-[#B38A58] text-[#B38A58] hover:bg-[#B38A58]/5 text-[10px] uppercase tracking-widest font-bold"
    };

    const width = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${width} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
