"use client";

import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const styles = {
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        error: 'bg-red-50 text-red-600 border-red-100'
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999] animate-in fade-in zoom-in-95 duration-300 p-6">
            <div className={`px-8 py-5 rounded-[2.5rem] border shadow-2xl flex items-center gap-5 pointer-events-auto ${styles[type]} transform -translate-y-12 max-w-[90%] sm:max-w-md`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-2xl">
                        {type === 'success' ? '✅' : '⚠️'}
                    </span>
                </div>
                <p className="font-bold text-lg tracking-tight leading-tight">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="ml-2 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-stone-400"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
