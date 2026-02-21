import { DateTime } from "luxon";
import cultures from "./i18n/cultures";

// TODO: support tc39/proposal-temporal

const dtFormats = cultures.invariant.dateTime.formats;

export type DateTimeDataFormat = {
    serializationFormat: string;
    normalize: (source: string | number | Date) => Date | null;
    serialize: (source: string | number | Date | DateTime) => string | null;
    deserialize: (value: string) => DateTime;
    tryDeserialize: (value: string) => DateTime | null;
    isValid: (source: string | Date) => boolean;
};

export enum DateNumberFormat {
    UnixTimeMilliseconds,
    UnixTimeSeconds,
    OADate, // OLE Automation Date
}

// dotnet: "yyyy-MM-ddTHH:mm:ss.FFF"
const s11nFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS";

// https://stackoverflow.com/questions/15549823/oadate-to-milliseconds-timestamp-in-javascript
/* Convert a Microsoft OADate to ECMAScript Date
 ** Treat all values as local.
 ** @param {number} oaDate - OADate value
 ** @returns {Date}
 */
export function getDateFromOADate(oaDate: number): Date {
    // Treat integer part as whole days
    const days = Math.floor(oaDate);
    // Treat decimal part as part of 24hr day, always +ve
    const ms = Math.abs((oaDate - days) * 8.64e7);
    // Add days and add ms
    return new Date(1899, 11, 30 + days, 0, 0, 0, ms);
}

/* Convert an ECMAScript Date to a Microsoft OADate
 ** Treat all dates as local.
 ** @param {Date} date - Date to convert
 ** @returns {string}
 */
export function getOADateFromDate(date: Date): string {
    const temp = new Date(date);
    // Set temp to start of day and get whole days between dates
    const stDate = new Date(1899, 11, 30);
    const days = Math.round((temp.setHours(0, 0, 0, 0) - stDate.getTime()) / 8.64e7);
    // Get decimal part of day, OADate always assumes 24 hours in day
    const partDay = (Math.abs((date.getTime() - temp.getTime()) % 8.64e7) / 8.64e7).toFixed(10);
    return days + partDay.slice(1);
}

export function getDateFromNumber(
    value: number,
    dateNumberFormat = DateNumberFormat.UnixTimeMilliseconds
): Date | null {
    if (value == null) return null;
    switch (dateNumberFormat) {
        case DateNumberFormat.UnixTimeMilliseconds:
            return new Date(value);
        case DateNumberFormat.UnixTimeSeconds:
            return new Date(value * 1000);
        case DateNumberFormat.OADate:
            return getDateFromOADate(value);
    }
}

/** Reads the local time parts of a Date and places them in UTC.
 *  Use this when the Date was produced by `normalize()` and you need
 *  to serialize it back to the invariant wire format. */
export function fromLocalDate(date: Date): DateTime | null {
    if (date == null) return null;
    return DateTime.fromJSDate(date).setZone("utc", { keepLocalTime: true });
}

export type DateValueFormats = {
    string?: string;
    number?: DateNumberFormat;
};

function parse(value: string, format?: string): DateTime {
    if (value == null) return null;
    // When no explicit format is given, use fromISO so that strings with a
    // timezone suffix (Z, +03:00) are accepted and converted to UTC.
    // zone: "utc" acts as the fallback zone for strings that have no offset.
    const dt = format
        ? DateTime.fromFormat(value, format, { zone: "utc" })
        : DateTime.fromISO(value, { zone: "utc" });
    if (!dt.isValid) {
        throw new Error(
            `Assertion. Invalid datetime format: ${value}. Expected format: ${format ?? s11nFormat}.`
        );
    }
    return dt;
}

export function toDateTime(source: any, formats?: DateValueFormats): DateTime | null {
    if (source == null) return null;
    if (typeof source === "string") {
        return parse(source, formats?.string);
    }
    if (typeof source === "number") {
        return DateTime.fromJSDate(getDateFromNumber(source, formats?.number), { zone: "utc" });
    }
    if (source instanceof Date) {
        return DateTime.fromJSDate(source, { zone: "utc" });
    }
    if (DateTime.isDateTime(source)) {
        return source;
    }
    throw new Error("Unsupported DateTime source");
}

// dtFormats.dateTimeShort
export function formatDate(date: Date | DateTime, format?: string): string {
    if (date == null) return "";
    const dt = toDateTime(date);
    if (format == null) {
        if (!dt.hour && !dt.minute && !dt.second) {
            format = dtFormats.dateShort;
        } else if (dt.millisecond) {
            format = dtFormats.dateTime24;
        } else {
            format = dtFormats.dateTime24Short;
        }
    }
    return dt.toFormat(format);
}

const dateTimeFormat: DateTimeDataFormat = {
    serializationFormat: s11nFormat,

    isValid: (source) => {
        if (source == null) return true;
        if (typeof source === "string") {
            try {
                parse(source);
                return true;
            } catch {
                return false;
            }
        }
        if (source instanceof Date) return true;
        return false;
    },

    normalize: (source) => {
        if (source == null) return null;
        const dt = toDateTime(source);
        // Render the UTC datetime as a string without timezone, then parse as a local
        // Date. This ensures Date.getHours() etc. return the original UTC-hour values
        // regardless of the runtime's local timezone.
        return new Date(dt.toFormat(s11nFormat));
        // return toDateTime(source);
    },

    serialize: (source, formats?: DateValueFormats) => {
        if (source == null) return null;
        const dt = toDateTime(source, formats);
        return dt.toFormat(s11nFormat);
    },

    deserialize: (value) => parse(value),

    tryDeserialize: (value) => {
        try {
            return dateTimeFormat.deserialize(value);
        } catch (err) {
            console.error(err);
            return null;
        }
    },
};

export default dateTimeFormat;
