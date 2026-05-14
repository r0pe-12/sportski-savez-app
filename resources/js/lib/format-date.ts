/**
 * Konzistentno formatiranje datuma kroz cijelu React aplikaciju.
 *
 * Crnogorska konvencija: `DD.MM.YYYY.` (sa tačkom na kraju)
 * za samo datum, i `DD.MM.YYYY. HH:mm` za timestamp.
 *
 * Locale strategija: pokušaj `me-ME`, pa `sr-Latn-ME`, pa `sr-Latn`.
 * U slučaju da Intl ne podržava nijedan locale, padamo na ručno
 * sastavljanje stringa iz Date metoda.
 */

export type DateInput = string | number | Date | null | undefined;

const DATE_LOCALES: readonly string[] = ['me-ME', 'sr-Latn-ME', 'sr-Latn'];

const DATE_OPTS: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
};

const DATETIME_OPTS: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
};

function parseInput(input: DateInput): Date | null {
    if (input === null || input === undefined || input === '') {
        return null;
    }

    if (input instanceof Date) {
        return Number.isNaN(input.getTime()) ? null : input;
    }

    // String ulaz: ISO ('2027-12-31'), Laravel timestamp ('2027-12-31T15:42:00.000000Z'),
    // ili 'YYYY-MM-DD HH:mm:ss'. Date konstruktor pokriva sve modulo poslednji oblik
    // (njega zamijenimo razdjelnikom 'T' radi sigurnosti u Safariju).
    if (typeof input === 'string') {
        const trimmed = input.trim();

        if (trimmed === '') {
            return null;
        }

        const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed)
            ? trimmed.replace(' ', 'T')
            : trimmed;

        const d = new Date(normalized);

        return Number.isNaN(d.getTime()) ? null : d;
    }

    if (typeof input === 'number') {
        // Heuristika: ako broj djeluje kao sekunde (Unix < 10^12), pomnoži sa 1000.
        const ms = input < 1e12 ? input * 1000 : input;
        const d = new Date(ms);

        return Number.isNaN(d.getTime()) ? null : d;
    }

    return null;
}

function formatWithFallback(date: Date, opts: Intl.DateTimeFormatOptions): string {
    // Provjeri da li bilo koji od željenih locale-ova zaista postoji u runtime-u.
    // Intl.DateTimeFormat NE baca grešku za nepodržan locale — silently se
    // prebaci na default (obično en-US sa formatom MM/DD/YYYY), pa moramo
    // koristiti supportedLocalesOf prije nego ga koristimo.
    const supported = Intl.DateTimeFormat.supportedLocalesOf(DATE_LOCALES as string[]);

    if (supported.length > 0) {
        try {
            return new Intl.DateTimeFormat(supported[0], opts).format(date);
        } catch {
            // Padaj na ručno sastavljanje.
        }
    }

    // Ručno sastavljanje (CG/SR konvencija: DD.MM.YYYY. sa tačkom poslije godine).
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    if (opts.hour) {
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${dd}.${mm}.${yyyy}. ${hh}:${min}`;
    }

    return `${dd}.${mm}.${yyyy}.`;
}

/**
 * Vraća datum u formatu `DD.MM.YYYY.` (npr. `31.12.2027.`).
 * Za `null`/`undefined`/nevalidan ulaz vraća prazan string.
 */
export function formatDate(input: DateInput): string {
    const date = parseInput(input);

    if (date === null) {
        return '';
    }

    const formatted = formatWithFallback(date, DATE_OPTS);

    // Intl.DateTimeFormat za 'sr-Latn*' obično vraća `31.12.2027.` već sa tačkom,
    // ali nekad i bez. Osiguravamo trailing tačku.
    return formatted.endsWith('.') ? formatted : `${formatted}.`;
}

/**
 * Vraća timestamp u formatu `DD.MM.YYYY. HH:mm` (24h).
 * Za `null`/`undefined`/nevalidan ulaz vraća prazan string.
 */
export function formatDateTime(input: DateInput): string {
    const date = parseInput(input);

    if (date === null) {
        return '';
    }

    const formatted = formatWithFallback(date, DATETIME_OPTS);

    // Intl.DateTimeFormat na nekim runtime-ovima ubaci zarez između datuma i vremena
    // (npr. `31.12.2027., 15:42`). Normalizujemo na razmak.
    const cleaned = formatted.replace(',', '');

    // Osiguravamo tačku poslije godine — Intl već stavlja, ali za sigurnost.
    return /^\d{2}\.\d{2}\.\d{4}\.\s/.test(cleaned)
        ? cleaned
        : cleaned.replace(/^(\d{2}\.\d{2}\.\d{4})\s/, '$1. ');
}

/**
 * Relativni datum — "prije 3 dana", "za 2 mjeseca", "danas".
 * Koristi `Intl.RelativeTimeFormat` sa CG locale-om i fallback-ovima.
 * Za `null`/`undefined`/nevalidan ulaz vraća prazan string.
 */
export function formatRelativeDate(input: DateInput): string {
    const date = parseInput(input);

    if (date === null) {
        return '';
    }

    const diffMs = date.getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const absSec = Math.abs(diffSec);

    const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
        { unit: 'year', seconds: 60 * 60 * 24 * 365 },
        { unit: 'month', seconds: 60 * 60 * 24 * 30 },
        { unit: 'week', seconds: 60 * 60 * 24 * 7 },
        { unit: 'day', seconds: 60 * 60 * 24 },
        { unit: 'hour', seconds: 60 * 60 },
        { unit: 'minute', seconds: 60 },
        { unit: 'second', seconds: 1 },
    ];

    const { unit, seconds } = units.find(({ seconds }) => absSec >= seconds) ?? {
        unit: 'second' as Intl.RelativeTimeFormatUnit,
        seconds: 1,
    };

    const value = Math.round(diffSec / seconds);

    for (const locale of DATE_LOCALES) {
        try {
            return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
        } catch {
            // Probaj sljedeći locale.
        }
    }

    // Fallback — vrati apsolutni datum ako Intl.RelativeTimeFormat nije dostupan.
    return formatDate(input);
}
