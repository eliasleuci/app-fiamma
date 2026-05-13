"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useConfig } from '@/context/ConfigContext';
import { formatDate } from '@/utils/date-helpers';
import { useLanguage } from '@/context/LanguageContext';

export function ReviewsSection() {
    const { t } = useLanguage();
    const { reviews, addReview } = useConfig();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newReview = {
            id: crypto.randomUUID(),
            clientName: formData.name,
            rating: formData.rating,
            comment: formData.comment,
            date: new Date().toISOString(),
            approved: true // Auto-approve for now
        };
        addReview(newReview);
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setIsFormOpen(false);
            setFormData({ name: '', rating: 5, comment: '' });
        }, 2000);
    };

    return (
        <section className="py-20 bg-cream-50">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-[9px] font-bold tracking-[0.4em] text-[#C5A02E]/70 uppercase mb-3">{t('common.reviews')}</h2>
                    <h3 className="text-xl md:text-2xl font-serif text-stone-700 italic">{t('reviews.title')}</h3>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-10 bg-white/50 rounded-2xl border border-stone-100 mb-12">
                        <p className="text-stone-500 italic">{t('reviews.empty') || 'Sé el primero en compartir tu experiencia.'}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {reviews.slice(0, 4).map((review) => (
                            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-soft-xl border border-stone-100">
                                <div className="flex gap-1 mb-4 text-[#C5A02E] text-lg">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                    ))}
                                </div>
                                <p className="text-stone-600 italic mb-6 leading-relaxed">"{review.comment}"</p>
                                <div className="flex justify-between items-center border-t border-stone-100 pt-4">
                                    <span className="font-bold text-stone-800 font-serif">{review.clientName}</span>
                                    <span className="text-xs text-stone-400 uppercase tracking-widest">{formatDate(new Date(review.date))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center">
                    {!isFormOpen ? (
                        <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                            {t('reviews.leave_review') || 'Dejar una Reseña'}
                        </Button>
                    ) : (
                        <Card className="max-w-lg mx-auto bg-white border-gold-200 shadow-xl">
                            {isSubmitted ? (
                                <div className="py-12 text-center text-green-600">
                                    <span className="text-4xl block mb-4">✓</span>
                                    <p className="text-xl font-serif">{t('reviews.thanks')}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                    <h4 className="text-xl font-serif text-center mb-6">{t('reviews.share')}</h4>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t('reviews.name')}</label>
                                        <input
                                            required
                                            className="w-full p-3 bg-cream-50 rounded-lg border border-stone-200 focus:border-gold-400 outline-none"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder={t('reviews.name_placeholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t('reviews.rating')}</label>
                                        <div className="flex gap-2 text-3xl cursor-pointer text-gold-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span
                                                    key={star}
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className="hover:scale-110 transition-transform"
                                                >
                                                    {star <= formData.rating ? '★' : '☆'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">{t('reviews.comment')}</label>
                                        <textarea
                                            required
                                            className="w-full p-3 bg-cream-50 rounded-lg border border-stone-200 focus:border-gold-400 outline-none min-h-[100px]"
                                            value={formData.comment}
                                            onChange={e => setFormData({ ...formData, comment: e.target.value })}
                                            placeholder={t('reviews.comment_placeholder')}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="w-1/2">
                                            {t('reviews.cancel')}
                                        </Button>
                                        <Button type="submit" variant="primary" className="w-1/2">
                                            {t('reviews.publish')}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </section>
    );
}
