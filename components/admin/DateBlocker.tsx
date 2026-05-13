import { useState } from 'react';
import { useConfig, TeamMember } from '@/context/ConfigContext';
import { getDaysInMonth, getFirstDayOfMonth, toSpainDateString, getSlotsForDate } from '@/utils/date-helpers';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function DateBlocker() {
    const { blockedDates, toggleBlockedDate, updateBlockedDates, team, professionalBlocks, addProfessionalBlock, removeProfessionalBlock, importHolidays } = useConfig();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProId, setSelectedProId] = useState<string>('global'); // 'global' or pro ID
    const [rangeMode, setRangeMode] = useState(false);
    const [rangeStart, setRangeStart] = useState<string | null>(null);
    const [selectedSlotDay, setSelectedSlotDay] = useState<number | null>(null);
    const { timeBlocks, addTimeBlock, removeTimeBlock } = useConfig();

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setRangeStart(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setRangeStart(null);
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = toSpainDateString(date);

        if (selectedProId === 'global') {
            if (rangeMode) {
                if (!rangeStart) {
                    setRangeStart(dateStr);
                } else {
                    // Complete range
                    const start = new Date(rangeStart);
                    const end = date;
                    const [startDate, endDate] = start <= end ? [start, end] : [end, start];

                    const rangeDates: string[] = [];
                    const current = new Date(startDate);
                    while (current <= endDate) {
                        rangeDates.push(toSpainDateString(current));
                        current.setDate(current.getDate() + 1);
                    }

                    const newBlocked = [...new Set([...blockedDates, ...rangeDates])];
                    updateBlockedDates(newBlocked);
                    setRangeStart(null);
                }
            } else {
                toggleBlockedDate(dateStr);
            }
        } else {
            // Professional blocking (no range mode for pros)
            const existingBlock = professionalBlocks.find(b => b.date === dateStr && b.professionalId === selectedProId);
            if (existingBlock) {
                removeProfessionalBlock(existingBlock.id);
            } else {
                addProfessionalBlock({
                    id: crypto.randomUUID(),
                    date: dateStr,
                    professionalId: selectedProId
                });
            }
        }
        setSelectedSlotDay(day);
    };

    const clearMonthBlocks = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

        if (selectedProId === 'global') {
            const filtered = blockedDates.filter(d => !d.startsWith(monthPrefix));
            updateBlockedDates(filtered);
        } else {
            const blocksToRemove = professionalBlocks.filter(
                b => b.professionalId === selectedProId && b.date.startsWith(monthPrefix)
            );
            blocksToRemove.forEach(b => removeProfessionalBlock(b.id));
        }
    };

    const isBlocked = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = toSpainDateString(date);

        if (selectedProId === 'global') {
            return blockedDates.includes(dateStr);
        } else {
            return professionalBlocks.some(b => b.date === dateStr && b.professionalId === selectedProId);
        }
    };

    const hasAnyBlock = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = toSpainDateString(date);

        const globalBlock = blockedDates.includes(dateStr);
        const proBlock = professionalBlocks.some(b => b.date === dateStr);
        return { global: globalBlock, pro: proBlock };
    };

    const isInRange = (day: number) => {
        if (!rangeMode || !rangeStart) return false;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateStr = toSpainDateString(date);
        return dateStr === rangeStart;
    };

    return (
        <Card>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-serif font-bold text-stone-800">
                    Bloquear Fechas
                </h2>
                <div className="flex flex-wrap gap-3 items-center">
                    {team.length > 0 && (
                        <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                            <span className="text-xs font-bold text-stone-500 uppercase">Afecta a:</span>
                            <select
                                value={selectedProId}
                                onChange={(e) => {
                                    setSelectedProId(e.target.value);
                                    setRangeMode(false);
                                    setRangeStart(null);
                                }}
                                className="text-sm font-medium bg-transparent border-none text-stone-700 outline-none focus:ring-0 cursor-pointer"
                            >
                                <option value="global">Cierre General</option>
                                {team.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={importHolidays}
                        className="px-3 py-2 rounded-lg text-xs font-bold uppercase bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                    >
                        Importar Feriados 2026
                    </button>
                    {selectedProId === 'global' && (
                        <button
                            onClick={() => {
                                setRangeMode(!rangeMode);
                                setRangeStart(null);
                            }}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${rangeMode
                                ? 'bg-[#C5A02E] text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                        >
                            {rangeMode ? '✓ Modo Rango' : 'Modo Rango'}
                        </button>
                    )}
                    <button
                        onClick={clearMonthBlocks}
                        className="px-3 py-2 rounded-lg text-xs font-bold uppercase bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                    >
                        Limpiar Mes
                    </button>
                </div>
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={prevMonth} className="p-2 text-stone-400 hover:text-[#C5A02E] transition-colors text-xl">
                        ←
                    </button>
                    <div className="text-center">
                        <div className="text-lg font-serif font-bold text-stone-800 uppercase">
                            {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                        </div>
                        <div className="text-sm text-stone-500 font-medium">
                            {currentDate.getFullYear()}
                        </div>
                    </div>
                    <button onClick={nextMonth} className="p-2 text-stone-400 hover:text-[#C5A02E] transition-colors text-xl">
                        →
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-3 mb-3 text-center">
                    {['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'].map((day, idx) => (
                        <div key={idx} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-3">
                    {[...Array(firstDay)].map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isSunday = date.getDay() === 0;
                        const blocked = isBlocked(day);
                        const blocks = hasAnyBlock(day);
                        const inRange = isInRange(day);

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`
                                    aspect-square flex flex-col items-center justify-center text-sm transition-all relative rounded-lg
                                    ${isSunday ? 'text-stone-300 bg-stone-100/50' : 'text-stone-600 hover:bg-white hover:shadow-sm'}
                                    ${inRange ? 'ring-2 ring-[#C5A02E] bg-[#C5A02E]/10' : ''}
                                `}
                            >
                                <span className={`${blocked ? 'font-bold' : ''}`}>{day}</span>
                                <div className="flex gap-1 mt-1">
                                    {blocked && (
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    )}
                                    {!blocked && selectedProId === 'global' && blocks.pro && (
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest justify-center">
                    <div className="flex items-center gap-2 text-stone-500">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Bloqueado (Selección)</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Bloqueo Parcial</span>
                    </div>
                </div>
            </div>

            {selectedSlotDay && (
                <div className="mt-8 pt-8 border-t border-stone-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-stone-800">
                                Bloqueo de Horarios - {selectedSlotDay} de {currentDate.toLocaleDateString('es-ES', { month: 'long' })}
                            </h3>
                            <p className="text-xs text-stone-500 mt-1 uppercase font-bold tracking-tighter">
                                Los horarios seleccionados no estarán disponibles para reservar
                            </p>
                        </div>
                        <button
                            onClick={() => setSelectedSlotDay(null)}
                            className="text-xs font-bold text-stone-400 hover:text-stone-600 uppercase"
                        >
                            Cerrar [×]
                        </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {getSlotsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedSlotDay)).map(time => {
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedSlotDay);
                            const dateStr = toSpainDateString(date);
                            const existingBlock = timeBlocks.find(b => b.date === dateStr && b.time === time);

                            return (
                                <button
                                    key={time}
                                    onClick={() => {
                                        if (existingBlock) {
                                            removeTimeBlock(existingBlock.id);
                                        } else {
                                            addTimeBlock({
                                                id: crypto.randomUUID(),
                                                date: dateStr,
                                                time: time
                                            });
                                        }
                                    }}
                                    className={`
                                        py-2 px-1 rounded-lg text-xs font-bold transition-all border
                                        ${existingBlock
                                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                                            : 'bg-white text-stone-600 border-stone-200 hover:border-[#C5A02E] hover:text-[#C5A02E]'}
                                    `}
                                >
                                    {time}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </Card >
    );
}
