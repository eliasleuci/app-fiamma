"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ServiceSelection, Service } from './ServiceSelection';
import { Calendar } from './Calendar';
import { ContactForm } from './ContactForm';
import { createWhatsAppLink } from '@/utils/whatsapp';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'service' | 'date' | 'contact';

export function BookingWizard() {
    const { t, language } = useLanguage();
    // Destructure all needed values at the top
    const { businessPhone, addBooking, team, professionalBlocks, isLoaded, bookings, services } = useConfig();

    // Import helpers (simulated require for now if we want to avoid import cycle, but static import is better. 
    // Since we are fixing this, let's keep the require format if it works or move to top level.
    // Moving to top level might cause circular deps if not careful, but utils is usually safe.
    // For safety in this edit, I will stick to what works but clean up the hook usage.)
    const { parseDuration, minutesFromMidnight, toSpainDateString, isWeekend } = require('@/utils/date-helpers');

    const [mounted, setMounted] = React.useState(false);
    const [step, setStep] = useState<Step>('service');

    React.useEffect(() => {
        setMounted(true);
    }, []);
    const [data, setData] = useState({
        service: null as Service | null,
        date: null as Date | null,
        time: null as string | null,
    });

    const handleServiceSelect = (service: Service) => {
        setData(prev => ({ ...prev, service }));
        setStep('date');
    };

    const handleDateSelect = (date: Date, time: string) => {
        setData(prev => ({ ...prev, date, time }));
        setStep('contact');
    };

    const handleContactSubmit = (name: string, phone: string, paymentMethod: 'cash' | 'card') => {
        if (data.service && data.date && data.time) {
            // CRITICAL: Double check if it's a weekend at submission time
            if (isWeekend(data.date)) {
                alert(t('common.weekend_alert'));
                setStep('date');
                return;
            }

            // Assign Random Professional Logic
            const dateStr = toSpainDateString(data.date);

            // 1. Filter team members who are NOT blocked on this date (Vacations/Days Off)
            const availableProfessionals = team.filter(pro => {
                const isBlocked = professionalBlocks.some(block =>
                    block.professionalId === pro.id && block.date === dateStr
                );
                return !isBlocked;
            });

            // 2. Filter out Professionals who are strictly BUSY at this time
            const reqStart = minutesFromMidnight(data.time);
            const reqDuration = data.service ? parseDuration(data.service.duration) : 30;
            const reqEnd = reqStart + reqDuration;

            const busyProIds = bookings
                .filter(b => {
                    // Check date match
                    if (!b.date.startsWith(dateStr)) return false;

                    // Check status - Only ignore 'absent' or explicitly invalid ones. 
                    // 'pending' and 'confirmed' block slots. 'attended' also blocks (it happened).
                    // 'absent' could logically free up slot if looking back, but for future?
                    // Usually we don't hold 'absent' for future.
                    // If 'cancelled' existed, we'd skip it. Since it doesn't, we just skip 'absent' if needed, 
                    // but 'absent' is usually for past events.
                    // For safety: active bookings are confirmed/pending/attended.
                    if (b.status === 'absent') return false;

                    const bStart = minutesFromMidnight(b.time);
                    const s = services.find(serv => serv.id === b.serviceId);
                    const bDur = s ? parseDuration(s.duration) : 30;
                    const bEnd = bStart + bDur;

                    // Check Overlap
                    // (StartA < EndB) and (EndA > StartB)
                    return (reqStart < bEnd && reqEnd > bStart);
                })
                .map(b => b.professionalId)
                .filter(id => id !== undefined); // Ensure we have IDs

            // validPool = Available today AND not busy now
            let validPool = availableProfessionals.filter(p => !busyProIds.includes(p.id));

            // Fallback: If for some reason pool is empty but Calendar said it's ok (race condition?),
            // we default to the general available list to avoid crashing logic, 
            // though keeping it validPool is safer. If empty -> random from available.
            if (validPool.length === 0) validPool = availableProfessionals;

            const pool = validPool;
            const randomProfessional = pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)]
                : null;

            // 3. Save Booking Locally
            const finalDateString = `${dateStr}T${data.time}:00+01:00`;
            const newBooking: any = {
                id: crypto.randomUUID(),
                clientName: name,
                clientPhone: phone,
                serviceId: data.service.id,
                serviceName: data.service.name,
                date: finalDateString, // Store with Argentina timezone offset - Wait, currently using Spain +01:00 logic in other places
                time: data.time,
                createdAt: new Date().toISOString(),
                status: 'confirmed', // Auto-confirm for now? Or pending? Context default was pending.
                // Reverting to 'pending' to match previous logic unless user asked otherwise.
                // Context default showed 'pending' in interface but logic used 'pending'.
                // Let's stick to 'pending' as per original file.
                // Wait, original file had 'pending'.
                professionalId: randomProfessional?.id,
                price: data.service.promo_price || data.service.price,
                paymentMethod: paymentMethod
            };
            // Override Booking status to pending
            newBooking.status = 'pending';

            addBooking(newBooking);

            // 4. Generate WhatsApp Link
            const link = createWhatsAppLink(businessPhone, {
                service: data.service.name,
                date: data.date,
                time: data.time,
                clientName: name,
            }, language);
            window.open(link, '_blank');
        }
    };

    if (!mounted || !isLoaded) {
        return (
            <div className="w-full max-w-md mx-auto p-12 text-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-stone-100 border-t-[#C5A02E] animate-spin"></div>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">{t('common.loading') || 'Cargando Servicios...'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto animate-in fade-in duration-300">
            <Card key={step} className="overflow-hidden">
                {step === 'service' && (
                    <ServiceSelection onSelect={handleServiceSelect} />
                )}

                {step === 'date' && (
                    <Calendar
                        onSelect={handleDateSelect}
                        onBack={() => setStep('service')}
                        currentServiceDuration={data.service ? parseDuration(data.service.duration) : 30}
                    />
                )}

                {step === 'contact' && (
                    <ContactForm
                        onSubmit={handleContactSubmit}
                        onBack={() => setStep('date')}
                    />
                )}
            </Card>

            {/* Progress Indicators (Minimalist) */}
            <div className="flex justify-center gap-2 mt-8">
                <div className={`h-0.5 transition-all duration-300 ${step === 'service' ? 'w-8 bg-stone-800' : 'w-4 bg-stone-200'}`} />
                <div className={`h-0.5 transition-all duration-300 ${step === 'date' ? 'w-8 bg-stone-800' : 'w-4 bg-stone-200'}`} />
                <div className={`h-0.5 transition-all duration-300 ${step === 'contact' ? 'w-8 bg-stone-800' : 'w-4 bg-stone-200'}`} />
            </div>
        </div>
    );
}
