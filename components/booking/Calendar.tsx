import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
    DAYS,
    MONTHS,
    getDaysInMonth,
    getFirstDayOfMonth,
    generateTimeSlots,
    isSameDay,
    isPastDate,
    isWeekend,
    isSpanishHoliday,
    toSpainDateString,
    getSpainNow,
    getSlotsForDate,
    checkAvailability
} from '@/utils/date-helpers';
import { useConfig } from '@/context/ConfigContext';
import { useLanguage } from '@/context/LanguageContext';

interface CalendarProps {
    onSelect: (date: Date, time: string) => void;
    onBack: () => void;
    currentServiceDuration?: number; // Optional content
}

export function Calendar({ onSelect, onBack, currentServiceDuration = 30 }: CalendarProps) {
    const { t } = useLanguage();
    const { blockedDates, timeBlocks, bookings, services, team, professionalBlocks } = useConfig();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
        setSelectedTime(null);
    };

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        const dateStr = toSpainDateString(date);

        if (isPastDate(date) || isWeekend(date) || isSpanishHoliday(date) || blockedDates.includes(dateStr)) return;

        setSelectedDate(date);
        setSelectedTime(null);
    };

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            onSelect(selectedDate, selectedTime);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-800 flex items-center gap-2 transition-colors">
                    <span className="text-xl">←</span> {t('common.back')}
                </button>
                <span className="text-xs font-bold tracking-widest text-[#C5A02E] uppercase">{t('common.step')} 2 {t('common.of')} 3</span>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-stone-800 font-serif">{t('calendar.title')}</h2>
                <p className="text-stone-500 mt-2 font-light">{t('common.select_category')}</p>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between px-4 mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-100 rounded-full text-stone-500 hover:text-[#C5A02E] transition-all">←</button>
                <h3 className="font-serif font-bold text-xl text-stone-800 tracking-wide">
                    {t(`months.${month}`)} {year}
                </h3>
                <button onClick={handleNextMonth} className="p-2 hover:bg-stone-100 rounded-full text-stone-500 hover:text-[#C5A02E] transition-all">→</button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-8">
                {[0, 1, 2, 3, 4, 5, 6].map(d => (
                    <div key={d} className="text-[10px] font-bold text-stone-400 py-3 uppercase tracking-widest">
                        {t(`days.${d}`)}
                    </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const date = new Date(year, month, day);
                    const dateStr = toSpainDateString(date);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isPast = isPastDate(date);
                    const isWknd = isWeekend(date);
                    const isHoliday = isSpanishHoliday(date);
                    const isBlocked = blockedDates.includes(dateStr);
                    const isToday = isSameDay(date, getSpainNow());
                    const isDisabled = isPast || isWknd || isHoliday || isBlocked;

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={isDisabled}
                            className={`
                            h-10 w-10 mx-auto flex items-center justify-center text-sm font-medium rounded-full transition-all duration-300 relative
                            ${isSelected ? 'bg-[#C5A02E] text-white shadow-md scale-105' : ''}
                            ${!isSelected && !isDisabled ? 'hover:bg-[#C5A02E]/10 text-stone-600 hover:text-[#C5A02E]' : ''}
                            ${isDisabled && !isWknd ? 'text-stone-300 cursor-not-allowed opacity-50' : ''}
                            ${isWknd ? 'bg-rose-50/50 text-rose-300 cursor-not-allowed' : ''}
                            ${isToday && !isSelected && !isDisabled ? 'border border-[#C5A02E]/40 text-[#C5A02E]' : ''}
                        `}
                        >
                            {day}
                            {(isWknd || isHoliday) && (
                                <span className="absolute -bottom-1 text-[8px] font-bold text-rose-200 uppercase tracking-tighter">
                                    {t('calendar.closed')}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white/50 p-6 rounded-2xl border border-stone-100">
                    <h4 className="font-serif font-bold text-stone-800 mb-4 text-center">
                        {t('calendar.slots_for')
                            .replace('{day}', selectedDate.getDate().toString())
                            .replace('{month}', t(`months.${selectedDate.getMonth()}`))}
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {getSlotsForDate(selectedDate).filter(time => {
                            const dateStr = toSpainDateString(selectedDate);
                            // 1. Basic Block: Specific manual time block
                            const isManuallyBlocked = timeBlocks.some(block => block.date === dateStr && block.time === time);
                            if (isManuallyBlocked) return false;

                            // 2. Smart Capacity Check (Multi-staff & Duration)
                            const isAvailable = checkAvailability(
                                selectedDate,
                                time,
                                currentServiceDuration,
                                bookings,
                                services,
                                team,
                                professionalBlocks
                            );
                            return isAvailable;
                        }).map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`
                            py-3 px-2 rounded-lg text-sm font-medium border transition-all duration-300
                                ${selectedTime === time
                                        ? 'bg-[#C5A02E] text-white border-[#C5A02E] shadow-md'
                                        : 'border-stone-200 text-stone-600 hover:border-[#C5A02E]/60 hover:bg-[#C5A02E]/5 hover:text-[#C5A02E]'}
                        `}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-4">
                <Button
                    fullWidth
                    disabled={!selectedDate || !selectedTime}
                    onClick={handleConfirm}
                >
                    {t('common.confirm')}
                </Button>
            </div>
        </div>
    );
}
