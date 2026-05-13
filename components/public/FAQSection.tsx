"use client";

import React from 'react';
import { useConfig } from '@/context/ConfigContext';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { useLanguage } from '@/context/LanguageContext';

export function FAQSection() {
    const { faqs } = useConfig();
    const { t, language } = useLanguage();

    if (faqs.length === 0) return null;

    return (
        <section className="w-full max-w-2xl mx-auto mt-16 px-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-stone-800">{t('common.faqs')}</h2>
            </div>

            <Accordion>
                {faqs.map(faq => {
                    let question = language === 'en' && faq.question_en ? faq.question_en : faq.question;
                    let answer = language === 'en' && faq.answer_en ? faq.answer_en : faq.answer;

                    // Fallback for default items if translations are missing in DB
                    if (language === 'en' && !faq.question_en) {
                        if (faq.question.includes('cancelar')) {
                            question = t('common.faq_default_1_q');
                            answer = t('common.faq_default_1_a');
                        } else if (faq.question.includes('pago')) {
                            question = t('common.faq_default_2_q');
                            answer = t('common.faq_default_2_a');
                        }
                    }

                    return (
                        <AccordionItem key={faq.id} title={question}>
                            {answer}
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </section>
    );
}
