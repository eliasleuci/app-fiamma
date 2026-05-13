"use client";

import React, { useState } from 'react';
import { X, Download, Share2 } from 'lucide-react';

interface QRCodeSectionProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QRCodeSection({ isOpen, onClose }: QRCodeSectionProps) {
    if (!isOpen) return null;

    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}&margin=10`;

    const handleDownload = async () => {
        try {
            const response = await fetch(qrCodeUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'beauty-room-qr.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading QR code:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Fiamma Maniscalco - Reservas',
                    text: 'Reserva tu turno con Fiamma Maniscalco',
                    url: currentUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(currentUrl);
            alert('Enlace copiado al portapapeles');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    <div className="inline-block p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-6">
                        <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-48 h-48 md:w-64 md:h-64 object-contain"
                        />
                    </div>

                    <h3 className="text-2xl font-serif text-stone-800 mb-2">Tu QR de Reserva</h3>
                    <p className="text-stone-500 text-sm mb-8">
                        Descarga o comparte este código para que tus clientes accedan directamente a tu agenda.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 bg-stone-800 text-white py-3 px-4 rounded-xl hover:bg-stone-900 transition-colors font-medium text-sm"
                        >
                            <Download size={18} />
                            Descargar
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 border border-stone-200 text-stone-700 py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors font-medium text-sm"
                        >
                            <Share2 size={18} />
                            Compartir
                        </button>
                    </div>
                </div>

                <div className="bg-stone-50 p-4 text-center border-t border-stone-100">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                        Fiamma Maniscalco
                    </p>
                </div>
            </div>
        </div>
    );
}
