import { Moment } from "moment";
import moment from "moment";
import cultures from "./i18n/cultures";

// TODO: use Luxon
const dtFormats = cultures.invariant.dateTime.formats;

export interface IDateTimeDataFormat {
    serializationFormat: string;
    normalize: (source: string | number | Date) => Date;
    serialize: (source: string | number | Date | Moment) => string;
    deserialize: (value: string) => Moment;
    tryDeserialize: (value: string) => Moment;
    isValid: (source: string | number | Date) => boolean;
}

export enum DateNumberFormat {
    UnixTimeMilliseconds,
    UnixTimeSeconds,
    OADate // OLE Automation Date
}

const USE_LOCAL_TIME = false; // invariant dates

// dotnet: "yyyy-MM-ddTHH:mm:ss.FFF"
const invariantFormat = "YYYY-MM-DDTHH:mm:ss.SSS";
const s11nFormat = "YYYY-MM-DDTHH:mm:ss.SSS"; // TODO: support USE_LOCAL_TIME

const m = USE_LOCAL_TIME ? moment : moment.utc;
const toDate = USE_LOCAL_TIME ? (m: Moment) => m.toDate() : (m: Moment) => new Date(m.format(invariantFormat));

// https://stackoverflow.com/questions/15549823/oadate-to-milliseconds-timestamp-in-javascript
/* Convert a Microsoft OADate to ECMAScript Date
 ** Treat all values as local.
 ** @param {string|number} oaDate - OADate value
 ** @returns {Date}
 */
export function getDateFromOADate(oaDate: number) {
    // Treat integer part is whole days
    const days = Math.floor(oaDate); // parseInt(oaDate + "")
    // Treat decimal part as part of 24hr day, always +ve
    const ms = Math.abs((oaDate - days) * 8.64e7); // +oaDate
    // Add days and add ms
    return new Date(1899, 11, 30 + days, 0, 0, 0, ms);
}

/* Convert an ECMAScript Date to a Microsoft OADate
 ** Treat all dates as local.
 ** @param {Date} date - Date to convert
 ** @returns {Date}
 */
export function getOADateFromDate(date: Date) {
    const temp = new Date(date);
    // Set temp to start of day and get whole days between dates
    const stDate = new Date(1899, 11, 30);
    const days = Math.round((temp.setHours(0, 0, 0, 0) - stDate.getTime()) / 8.64e7);
    // Get decimal part of day, OADate always assumes 24 hours in day
    const partDay = (Math.abs((date.getTime() - temp.getTime()) % 8.64e7) / 8.64e7).toFixed(10);
    return days + partDay.substr(1);
}

export function getDateFromNumber(value: number, dateNumberFormat = DateNumberFormat.UnixTimeMilliseconds) {
    if (value == undefined) {
        return null;
    }
    switch (dateNumberFormat) {
        case DateNumberFormat.UnixTimeMilliseconds:
            return new Date(value);
        case DateNumberFormat.UnixTimeSeconds:
            return new Date(value * 1000);
        case DateNumberFormat.OADate:
            return getDateFromOADate(value);
    }
}

export type DateValueFormats = {
    string?: string;
    number?: DateNumberFormat;
};

export function toMoment(source: any, formats?: DateValueFormats) {
    if (source == undefined) {
        return null;
    }
    let md: Moment;
    if (typeof source === "string") {
        md = parse(source, formats?.string);
    } else if (typeof source === "number") {
        md = moment(getDateFromNumber(source, formats?.number));
    } else if (source instanceof Date) {
        // moment.isDate?
        md = moment(source);
    } else {
        if (!moment.isMoment(source)) {
            // Invalid
            throw new Error("Unsupported Moment Source");
        }
        md = source;
    }
    return md;
}

function parse(value: string, format?: string) {
    if (value == undefined) {
        return null;
    }
    if (format == undefined) {
        format = s11nFormat;
    }
    let md: Moment;
    if (format) {
        md = m(value, format, true);
    } else {
        md = m(value);
        // md = m(value, format, true); // ?
    }

    // assertInvariant?
    // !md.isSame(m(value))
    if (md.format(s11nFormat) !== m(value).format(s11nFormat)) {
        const errMsg = `Invalid date transport value: ${value}`;
        console.warn(errMsg);
        // throw new Error(errMsg);
    }
    if (!md.isValid()) {
        throw new Error(`Assertion. Invalid datetime format: ${value}. Expected format: ${format || s11nFormat}.`);
    }
    return md;
}

// dtFormats.dateTimeShort
export function formatDate(date: Date | moment.Moment, format?: string) {
    if (date == undefined) {
        return "";
    }
    const md = toMoment(date);
    if (format == undefined) {
        if (!md.hours() && !md.minutes() && !md.seconds()) {
            format = dtFormats.dateShort;
        } else if (md.milliseconds()) {
            // dtFormats.dateTime?
            format = dtFormats.dateTime24;
        } else {
            // dtFormats.dateTimeShort?
            format = dtFormats.dateTime24Short;
        }
    }
    return md.format(format);
}

const dateTimeFormat = {
    serializationFormat: s11nFormat,
    isValid: (source: any) => {
        if (source == null) {
            return true; // no value, it is OK
        }
        if (typeof source === "string") {
            return !!parse(source, s11nFormat);
        }
        // if (typeof source === 'number') {
        //     return true;
        // }
        if (source instanceof Date) {
            return true;
        }
        return false;
    },
    normalize: (source: string | number | Date | Moment) => {
        if (source == undefined) {
            return null;
        }
        if (typeof source === "string") {
            const md = parse(source);
            // const md = parse(source, s11nFormat);
            source = md;
        } else if (typeof source === "number") {
            // source = getMomentFromUnixTime(source); // ?
            source = m(source);
        } else if (source instanceof Date) {
            // return source;
            // not moment.utc(source)!
            source = moment(source);
        } else {
            if (!moment.isMoment(source)) {
                // Invalid
                throw new Error("Unsupported source");
            }
        }
        return toDate(source);
    },
    serialize: (source: string | number | Date | Moment, formats?: DateValueFormats) => {
        if (source == undefined) {
            return null;
        }
        const md = toMoment(source, formats);
        return md.format(s11nFormat);
    },
    deserialize: (value: string) => {
        return parse(value);
    },
    tryDeserialize: (value: string) => {
        try {
            return dateTimeFormat.deserialize(value);
        } catch (err) {
            console.error(err);
            return null;
        }
    }
} as IDateTimeDataFormat;

export default dateTimeFormat;
