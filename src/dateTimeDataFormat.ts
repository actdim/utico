import { DateTime, type LocaleOptions } from "luxon";

// TODO: support tc39/proposal-temporal

export const DateTimeNumberFormat = {
    UnixTimeMilliseconds: "unixTimeMilliseconds",
    UnixTimeSeconds: "unixTimeSeconds",
    /** OLE Automation Date */
    OADate: "oaDate"
} as const;

export type DateTimeNumberFormat = (typeof DateTimeNumberFormat)[keyof typeof DateTimeNumberFormat];

export const DateTimePrecision = {
    Auto: "auto",
    Date: "date",
    Minute: "minute",
    Second: "second",
    Millisecond: "millisecond"
} as const;

export type DateTimePrecision = (typeof DateTimePrecision)[keyof typeof DateTimePrecision];

export const DateTimeKind = {
    Local: "local",
    Utc: "utc"
} as const;

export type DateTimeKind = (typeof DateTimeKind)[keyof typeof DateTimeKind];

// DateTimeImportInterpretation
export const DateTimeStringInterpretation = {
    Auto: "auto",
    Local: "local", // wall-clock, naive
    Utc: "utc" // universal, instant, absolute
} as const;

export type DateTimeStringInterpretation = (typeof DateTimeStringInterpretation)[keyof typeof DateTimeStringInterpretation];

export const DateTimeExportInterpretation = {
    Original: "original",
    Local: "local", // wall-clock, naive
    Utc: "utc", // universal, instant, absolute
    Match: "match"
} as const;

export type DateTimeExportInterpretation = (typeof DateTimeExportInterpretation)[keyof typeof DateTimeExportInterpretation];

const $isDateTimeExtended = Symbol("isDateTimeExtended");
export type DateTimeExtended = DateTime & {
    [$isDateTimeExtended]: true;
    precision: DateTimePrecision;
    exportToString: (
        formatOrKind?: string | DateTimeKind,
        interpretAs?: DateTimeExportInterpretation,
        options?: LocaleOptions
    ) => string;
};

export function isDateTimeExtended(obj: unknown): obj is DateTimeExtended {
    return (obj as { [$isDateTimeExtended]: unknown })[$isDateTimeExtended] == true;
}

function truncateToPrecision(dt: DateTime, precision: DateTimePrecision): DateTime {
    switch (precision) {
        case DateTimePrecision.Date:
            return dt.startOf("day");
        case DateTimePrecision.Minute:
            return dt.startOf("minute");
        case DateTimePrecision.Second:
            return dt.startOf("second");
        case DateTimePrecision.Auto:
        case DateTimePrecision.Millisecond:
        default:
            return dt;
    }
}

function extend(dt: DateTime | DateTimeExtended, precision: DateTimePrecision = DateTimePrecision.Auto): DateTimeExtended {
    const isExtended = isDateTimeExtended(dt);
    if (isExtended) {
        if (precision === DateTimePrecision.Auto) {
            precision = dt.precision;
        }
    } else {
        if (precision === DateTimePrecision.Auto) {
            precision = DateTimePrecision.Millisecond;
        }
    }
    const extended = truncateToPrecision(dt, precision) as DateTimeExtended;
    if (!isExtended) {
        extended[$isDateTimeExtended] = true;
        extended.exportToString = (
            formatOrKind: string | DateTimeKind = DateTimeKind.Utc,
            interpretAs: DateTimeExportInterpretation = DateTimeExportInterpretation.Original,
            options?: LocaleOptions
        ): string => {
            // For date-only values keep calendar date stable; for datetime values
            // reinterpret from UTC to avoid browser zone surprises.
            const sourceForInterpretation = extended.precision === DateTimePrecision.Date
                ? extended
                : extended.toUTC();
            let interpreted = sourceForInterpretation as DateTime;
            if (interpretAs === DateTimeExportInterpretation.Local) {
                interpreted = sourceForInterpretation.setZone("local", { keepLocalTime: true });
            } else if (interpretAs === DateTimeExportInterpretation.Utc) {
                interpreted = sourceForInterpretation.setZone("utc", { keepLocalTime: true });
            } else if (interpretAs === DateTimeExportInterpretation.Match) {
                if (formatOrKind === DateTimeKind.Local) {
                    interpreted = sourceForInterpretation.setZone("local", { keepLocalTime: true });
                } else if (formatOrKind === DateTimeKind.Utc) {
                    interpreted = sourceForInterpretation.setZone("utc", { keepLocalTime: true });
                }
            }
            if (formatOrKind === DateTimeKind.Local) {
                const format = extended.precision === DateTimePrecision.Date
                    ? s11nFormat.localDate
                    : s11nFormat.localDateTime;
                return interpreted.setZone("local").toFormat(format, options);
            }
            if (formatOrKind === DateTimeKind.Utc) {
                const format = extended.precision === DateTimePrecision.Date
                    ? s11nFormat.utcDate
                    : s11nFormat.utcDateTime;
                return interpreted.setZone("utc").toFormat(format, options);
            }
            return interpreted.toFormat(formatOrKind, options);
        };
    }
    extended.precision = precision;
    return extended;
}

function inferPrecisionFromFormat(format?: string): DateTimePrecision | undefined {
    if (!format) return undefined;
    if (format.includes("S")) return DateTimePrecision.Millisecond;
    if (format.includes("s")) return DateTimePrecision.Second;
    if (format.includes("m")) return DateTimePrecision.Minute;
    return DateTimePrecision.Date;
}

export type ToDateTimeOptions = {
    stringFormat?: string;
    stringInterpretAs?: DateTimeStringInterpretation;
    numberFormat?: DateTimeNumberFormat;
    numberInterpretAs?: DateTimeKind;
    dateInterpretAs?: DateTimeKind;
    precision?: DateTimePrecision;
}

export const defaultToDateTimeOptions: ToDateTimeOptions = {
    /** ISO 8601 (yyyy-MM-dd'T'HH:mm:ss.SSS[Z|±HH:mm] or yyyy-MM-dd'T'HH:mm:ss.SSS) */
    stringFormat: undefined,
    stringInterpretAs: DateTimeStringInterpretation.Auto,
    numberFormat: DateTimeNumberFormat.UnixTimeMilliseconds,
    numberInterpretAs: DateTimeKind.Utc,
    dateInterpretAs: DateTimeKind.Utc,
    precision: DateTimePrecision.Auto
};

// Serialization formats (Luxon tokens).
// Local means "without offset/timezone suffix" in the resulting string.
const s11nFormat = {
    // ISO local date (without offset), example: 2026-02-24
    localDate: "yyyy-MM-dd",
    // ISO local datetime (without offset), example: 2026-02-24T13:45:30.123
    localDateTime: "yyyy-MM-dd'T'HH:mm:ss.SSS",
    // ISO UTC date (explicit UTC suffix), example: 2026-02-24Z
    utcDate: "yyyy-MM-dd'Z'",
    // ISO UTC datetime (explicit UTC suffix), example: 2026-02-24T13:45:30.123Z
    utcDateTime: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
} as const;

export function getDateTimeFromString(
    value: string,
    format?: string,
    precision: DateTimePrecision = DateTimePrecision.Auto,
    interpretAs: DateTimeStringInterpretation = DateTimeStringInterpretation.Auto
): DateTimeExtended | null {
    if (!value) {
        return null;
    }
    let dt = format
        ? DateTime.fromFormat(value, format, { setZone: true })
        : DateTime.fromISO(value, { setZone: true });
    if (interpretAs === DateTimeStringInterpretation.Local) {
        dt = dt.setZone("local", { keepLocalTime: true });
    } else if (interpretAs === DateTimeStringInterpretation.Utc) {
        dt = dt.setZone("utc", { keepLocalTime: true });
    }
    if (!dt.isValid) {
        throw new Error(
            `Assertion. Invalid datetime format: ${value}. Expected format: ${format ?? "ISO 8601 (yyyy-MM-dd'T'HH:mm:ss.SSS[Z|±HH:mm] or yyyy-MM-dd'T'HH:mm:ss.SSS)"}.`
        );
    }
    if (precision === DateTimePrecision.Auto) {
        precision = inferPrecisionFromFormat(format) ?? DateTimePrecision.Millisecond;
    }
    return extend(dt, precision);
}

export function getDateTimeFromNumber(
    value: number,
    dtNumberFormat: DateTimeNumberFormat = DateTimeNumberFormat.UnixTimeMilliseconds,
    interpretAs: DateTimeKind = DateTimeKind.Utc,
    precision: DateTimePrecision = DateTimePrecision.Millisecond
): DateTimeExtended | null {
    if (value == null) {
        return null;
    }
    let dt: DateTime;
    switch (dtNumberFormat) {
        case DateTimeNumberFormat.UnixTimeMilliseconds:
            dt = interpretAs === "local"
                ? DateTime.fromMillis(value)
                : DateTime.fromMillis(value, { zone: "utc" });
            break;
        case DateTimeNumberFormat.UnixTimeSeconds:
            dt = interpretAs === "local"
                ? DateTime.fromSeconds(value)
                : DateTime.fromSeconds(value, { zone: "utc" });
            break;
        case DateTimeNumberFormat.OADate: {
            if (interpretAs === "local") {
                const days = Math.floor(value);
                const ms = Math.abs((value - days) * 8.64e7);
                const jsDate = new Date(1899, 11, 30 + days, 0, 0, 0, ms);
                dt = DateTime.fromJSDate(jsDate);
                break;
            }
            const oaEpochMs = Date.UTC(1899, 11, 30, 0, 0, 0, 0);
            dt = DateTime.fromMillis(oaEpochMs + value * 8.64e7, { zone: "utc" });
            break;
        }
    }
    return extend(dt, precision);
}

export function getDateTimeNumber(
    dt: DateTime | DateTimeExtended,
    dtNumberFormat: DateTimeNumberFormat = DateTimeNumberFormat.UnixTimeSeconds
): number | null {
    if (dt == null) {
        return null;
    }
    switch (dtNumberFormat) {
        case DateTimeNumberFormat.UnixTimeMilliseconds:
            return dt.toMillis();
        case DateTimeNumberFormat.UnixTimeSeconds:
            return dt.toSeconds();
        case DateTimeNumberFormat.OADate: {
            const oaEpochMs = Date.UTC(1899, 11, 30, 0, 0, 0, 0);
            return (dt.toMillis() - oaEpochMs) / 8.64e7;
        }
    }
}

// getDateTime
export function toDateTime(
    source: string | number | Date | DateTime | DateTimeExtended | null | undefined,
    options = defaultToDateTimeOptions
): DateTimeExtended | null {
    if (source == null) {
        return null;
    }
    options = { ...defaultToDateTimeOptions, ...options };
    if (!options.precision) {
        options.precision = DateTimePrecision.Auto;
    }
    if (DateTime.isDateTime(source)) {
        return extend(source, options.precision);
    }
    if (typeof source === "string") {
        return getDateTimeFromString(
            source,
            options.stringFormat,
            options.precision,
            options.stringInterpretAs
        );
    }
    if (typeof source === "number") {
        return getDateTimeFromNumber(
            source,
            options.numberFormat,
            options.numberInterpretAs,
            options.precision
        );
    }
    if (source instanceof Date) {
        const dt = options.dateInterpretAs === DateTimeKind.Utc
            ? DateTime.fromJSDate(source).toUTC()
            : DateTime.fromJSDate(source);
        return extend(dt, options.precision);
    }
    throw new Error("Unsupported DateTime source");
}

export type DateTimeTransport = {
    serialize: (dt: DateTimeExtended | null | undefined) => string | null;
    deserialize: (value: string | number | null | undefined) => DateTimeExtended | null;
};

const commonLocalDateTimeTransport: DateTimeTransport = {
    serialize: (dt) => {
        if (dt == null) {
            return null;
        }
        return dt.exportToString(DateTimeKind.Local, DateTimeKind.Local);
    },
    deserialize: (v) => {
        return toDateTime(v, {
            stringFormat: undefined,
            stringInterpretAs: DateTimeStringInterpretation.Local,
            numberFormat: DateTimeNumberFormat.UnixTimeSeconds,
            numberInterpretAs: DateTimeKind.Local,
            dateInterpretAs: DateTimeKind.Local,
            precision: DateTimePrecision.Auto
        });
    }
};

const utcDateTimeTransport: DateTimeTransport = {
    serialize: (dt) => {
        if (dt == null) {
            return null;
        }
        return dt.exportToString(DateTimeKind.Utc, DateTimeKind.Utc);
    },
    deserialize: (v) => {
        return toDateTime(v, {
            stringFormat: undefined,
            stringInterpretAs: DateTimeStringInterpretation.Utc,
            numberFormat: DateTimeNumberFormat.UnixTimeSeconds,
            numberInterpretAs: DateTimeKind.Utc,
            dateInterpretAs: DateTimeKind.Utc,
            precision: DateTimePrecision.Auto
        });
    }
};

export const dateTimeTransports = {
    commonLocal: commonLocalDateTimeTransport,
    utc: utcDateTimeTransport
}