import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useLanguage } from '@/context/LanguageContext';

interface ContactFormProps {
    onSubmit: (name: string, phone: string, paymentMethod: 'cash' | 'card') => void;
    onBack: () => void;
}

export function ContactForm({ onSubmit, onBack }: ContactFormProps) {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [countryCode, setCountryCode] = useState('+34');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePhone = (p: string) => {
        // Allows spaces, dashes, parentheses. Must have at least 8 digits.
        const digits = p.replace(/\D/g, '');
        // Validate roughly 7-15 digits
        return digits.length >= 7 && digits.length <= 15;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError(t('contact.error_name'));
            return;
        }

        if (!validatePhone(phone)) {
            setError(t('contact.error_phone'));
            return;
        }

        setIsSubmitting(true);
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        onSubmit(name, `${countryCode} ${phone}`, paymentMethod);
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-1">
                    ← {t('common.back')}
                </button>
                <span className="text-sm font-medium text-rose-500">{t('common.step')} 3 {t('common.of')} 3</span>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-serif text-stone-800">{t('contact.title')}</h2>
                <p className="text-stone-400 text-sm mt-1 uppercase tracking-wider">{t('contact.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                        {t('contact.name_label')}
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        placeholder={t('contact.name_placeholder')}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
                        {t('contact.phone_label')}
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="px-3 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-stone-50 text-sm font-medium w-[110px]"
                        >
                            <option value="+34">ES +34</option>
                            <option value="">OTRO</option>
                            <option value="+33">FR +33</option>
                            <option value="+44">GB +44</option>
                            <option value="+49">DE +49</option>
                            <option value="+39">IT +39</option>
                            <option value="+1">US +1</option>
                            <option value="+54">AR +54</option>
                        </select>
                        <input
                            type="tel"
                            id="phone"
                            required
                            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                            placeholder={t('contact.phone_placeholder')}
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                if (error) setError('');
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-stone-700 mb-1">
                        {t('contact.payment_label')}
                    </label>
                    <select
                        id="paymentMethod"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card')}
                    >
                        <option value="cash">{t('contact.cash')}</option>
                        <option value="card">{t('contact.card')}</option>
                    </select>
                </div>

                {error && (
                    <p className="text-sm text-red-500 font-medium animate-in slide-in-from-top-1">
                        {error}
                    </p>
                )}

                <div className="pt-4">
                    <Button
                        type="submit"
                        fullWidth
                        disabled={isSubmitting || !name || !phone}
                        className="flex items-center justify-center gap-2 mt-4"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner />
                                {t('common.processing')}
                            </>
                        ) : (
                            t('contact.submit')
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
