export const DAYS_IN_WEEK = 7;
export const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const SPAIN_TZ = 'Europe/Madrid';

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

/**
 * Returns the current date/time anchored to Spain timezone
 */
export function getSpainNow(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: SPAIN_TZ }));
}

/**
 * Formats a date for display
 * Extracts date directly from ISO string to avoid timezone conversion issues
 */
export function formatDate(date: Date | string): string {
    let dateStr: string;

    if (typeof date === 'string') {
        // Extract YYYY-MM-DD from ISO string (e.g., "2025-12-29T14:00:00+01:00")
        dateStr = date.split('T')[0];
    } else {
        // For Date objects, convert to Spain timezone first
        dateStr = toSpainDateString(date);
    }

    // Parse the YYYY-MM-DD string
    const [year, monthNum, day] = dateStr.split('-').map(Number);
    return `${day} de ${MONTHS[monthNum - 1]}`;
}

export function generateTimeSlots(startHour: number = 8, endHour: number = 20, intervalMinutes: number = 30): string[] {
    const slots = [];
    for (let i = startHour; i < endHour; i++) {
        for (let j = 0; j < 60; j += intervalMinutes) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            slots.push(`${hour}:${minute}`);
        }
    }
    return slots;
}

export function getSlotsForDate(date: Date, intervalMinutes: number = 30): string[] {
    const localizedDate = new Date(date.toLocaleString('en-US', { timeZone: SPAIN_TZ }));
    const day = localizedDate.getDay();

    if (day === 0) { // Sunday
        return [];
    }

    // Mon-Sat: 9:00 - 20:00
    return generateTimeSlots(9, 20, intervalMinutes);
}

/**
 * Checks if a date is a Spanish national holiday (2025/2026 common)
 */
export function isSpanishHoliday(date: Date): boolean {
    const dateStr = toSpainDateString(date);
    const [, month, day] = dateStr.split('-').map(Number);

    // Static list of major Spanish National holidays (Month is 1-indexed from string)
    const holidays = [
        "01-01", // Año Nuevo
        "01-06", // Reyes
        "05-01", // Fiesta del Trabajo
        "08-15", // Asunción
        "10-12", // Fiesta Nacional
        "11-01", // Todos los Santos
        "12-06", // Constitución
        "12-08", // Inmaculada
        "12-25", // Navidad
    ];

    const currentDayMonth = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return holidays.includes(currentDayMonth);
}

/**
 * Checks if two dates are the same day in Spain timezone
 */
export function isSameDay(d1: Date, d2: Date): boolean {
    const s1 = toSpainDateString(d1);
    const s2 = toSpainDateString(d2);
    return s1 === s2;
}

/**
 * Checks if a date is in the past relative to Spain "today"
 */
export function isPastDate(date: Date): boolean {
    const todayStr = toSpainDateString(getSpainNow());
    const dateStr = toSpainDateString(date);

    // Compare YYYY-MM-DD strings to ignore time
    return dateStr < todayStr;
}

/**
 * Checks if a date falls on a weekend in Spain timezone
 */
export function isWeekend(date: Date): boolean {
    const localizedDate = new Date(date.toLocaleString('en-US', { timeZone: SPAIN_TZ }));
    const day = localizedDate.getDay();
    return day === 0; // 0 = Sunday. Saturday (6) is now enabled.
}

/**
 * Returns a date string in YYYY-MM-DD format based on Spain timezone
 */
export function toSpainDateString(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: SPAIN_TZ,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(date);
}


/**
 * Normalizes a date to 00:00:00 in Spain timezone for comparison
 */
export function normalizeToSpain(date: Date): Date {
    const dateStr = toSpainDateString(date);
    // Standard Spain offset is +01:00 (CET) or +02:00 (CEST)
    // For simplicity, we use the date anchor.
    return new Date(`${dateStr}T00:00:00+01:00`);
}

/**
 * Parses a duration string (e.g. "60 min", "1 h 30 min") into specific minutes
 */
export function parseDuration(durationStr: string): number {
    if (!durationStr) return 0;

    // Normalize string
    const str = durationStr.toLowerCase().replace(/\s+/g, '');
    let totalMinutes = 0;

    // Check for "Xmin" or "Xm"
    const minMatch = str.match(/(\d+)min/) || str.match(/(\d+)m/);
    if (minMatch) {
        totalMinutes += parseInt(minMatch[1], 10);
    }

    // Check for "Xh" or "Xhour" can be added if needed, but current data is "XX min"
    // Just in case:
    const hourMatch = str.match(/(\d+)h/);
    if (hourMatch) {
        totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }

    // Fallback: if just a number is stored
    if (totalMinutes === 0 && !isNaN(parseInt(str))) {
        totalMinutes = parseInt(str, 10);
    }

    return totalMinutes;
}

/**
 * Converts "HH:MM" string to minutes from midnight
 */
export function minutesFromMidnight(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Checks if a specific time slot is available considering:
 * 1. Team capacity (total staff)
 * 2. Existing bookings at that time (and overlapping ones)
 * 3. Specific professional blocks (vacations/days off)
 * 4. The duration of the *new* service being requested (look-ahead)
 */
export function checkAvailability(
    date: Date,
    time: string,
    durationMinutes: number,
    bookings: any[], // Type 'Booking' ideally, using any to avoid circular dependency in utils if strict
    services: any[], // Type 'Service'
    team: any[],     // Type 'TeamMember'
    professionalBlocks: any[] // Type 'ProfessionalBlock'
): boolean {
    const dateStr = toSpainDateString(date);

    // 1. Calculate requested time range [start, end)
    const requestStart = minutesFromMidnight(time);
    const requestEnd = requestStart + durationMinutes;

    // 2. Identify Total Staff ID Pool
    // Assumes all staff can do all services unless logic changes.
    const allStaffIds = team.map(m => m.id);

    // 3. Filter out staff who are BLOCKED for this entire day (vacations, etc.)
    // Note: Blocks currently are "All Day" based on 'date'. If blocks had time ranges, we'd check overlap.
    const blockedStaffIds = professionalBlocks
        .filter(b => b.date === dateStr)
        .map(b => b.professionalId);

    const availableStaffIds = allStaffIds.filter(id => !blockedStaffIds.includes(id));

    // Fallback capacity if the team is completely empty (e.g. brand new installation)
    const capacity = team.length === 0 ? 1 : availableStaffIds.length;

    // If no staff is working today, 0 capacity.
    if (capacity === 0) return false;

    // 4. Check collisions for EACH time slice of the requested duration
    for (let t = requestStart; t < requestEnd; t += 15) {
        let occupiedCount = 0;

        // Count who is busy at time 't'
        for (const booking of bookings) {
            // Only care about this date
            if (!booking.date.startsWith(dateStr)) continue;
            const status = booking.status;
            if (status === 'absent' || status === 'cancelled') continue;

            // Calculate booking range
            const bookingStart = minutesFromMidnight(booking.time);

            // Find service duration for this booking
            const bookingService = services.find(s => s.id === booking.serviceId) || 
                                   services.find(s => s.name.toLowerCase() === booking.serviceName?.toLowerCase());
            const bookingDuration = bookingService ? parseDuration(bookingService.duration) : 30; // Default 30 min safety

            const bookingEnd = bookingStart + bookingDuration;

            // Check overlap
            if (t >= bookingStart && t < bookingEnd) {
                occupiedCount++;
            }
        }

        // Capacity Check at time 't'
        // Also check if we go past closing time (20:00 = 1200 mins)
        const closingTime = 20 * 60; // 1200
        if (t >= closingTime) return false;

        if (occupiedCount >= capacity) {
            return false;
        }
    }

    return true;
}
