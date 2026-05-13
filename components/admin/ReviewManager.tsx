"use client";

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/utils/date-helpers';
import { Button } from '@/components/ui/Button';

export function ReviewManager() {
    const { reviews, deleteReview } = useConfig();

    return (
        <Card>
            <h2 className="text-2xl font-serif font-bold mb-6 text-stone-800">
                Gestión de Reseñas
            </h2>
            {reviews.length === 0 ? (
                <p className="text-stone-400 italic text-sm py-10">No hay reseñas aún.</p>
            ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                    {reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex justify-between gap-4 group hover:bg-stone-100 transition-all">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-stone-700">{review.clientName}</span>
                                    <span className="text-gold-500 text-xs">{'★'.repeat(review.rating)}</span>
                                </div>
                                <p className="text-stone-500 text-sm italic">"{review.comment}"</p>
                                <span className="text-[10px] text-stone-300 mt-2 block font-bold uppercase tracking-widest">{formatDate(new Date(review.date))}</span>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('¿Eliminar esta reseña?')) deleteReview(review.id);
                                }}
                                className="text-xs font-bold text-stone-300 hover:text-red-500 transition-colors"
                            >
                                Borrar
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}
