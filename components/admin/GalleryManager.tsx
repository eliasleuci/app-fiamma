"use client";

import React, { useState } from 'react';
import { useConfig } from '@/context/ConfigContext';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function GalleryManager() {
    const { galleryImages, updateGallery } = useConfig();
    const [isAdding, setIsAdding] = useState(false);

    const handleUpload = (base64: string) => {
        updateGallery([...galleryImages, base64]);
        setIsAdding(false);
    };

    const handleDelete = (index: number) => {
        if (confirm('¿Borrar esta fotografía de la galería?')) {
            const newGallery = [...galleryImages];
            newGallery.splice(index, 1);
            updateGallery(newGallery);
        }
    };

    return (
        <Card>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-stone-800">
                    Galería
                </h2>
                <Button
                    variant="goldOutline"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    AGREGAR FOTO
                </Button>
            </div>

            {isAdding && (
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8 animate-in slide-in-from-top-2">
                    <ImageUpload onUpload={handleUpload} label="Seleccionar fotografía..." />
                    <p className="text-xs text-stone-400 mt-4 text-center">La imagen se publicará en el sitio principal</p>
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {galleryImages.map((url, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden border border-stone-200 relative group bg-stone-100">
                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                onClick={() => handleDelete(index)}
                                className="bg-white text-red-500 px-4 py-2 rounded-xl font-bold text-xs shadow-xl active:scale-95"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {galleryImages.length === 0 && (
                <div className="text-center py-20 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-100">
                    <p className="text-stone-400 italic">No hay fotos registradas.</p>
                </div>
            )}
        </Card>
    );
}
