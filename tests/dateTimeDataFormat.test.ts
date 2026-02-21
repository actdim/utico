import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import dateTimeFormat, {
    getDateFromOADate,
    getOADateFromDate,
    getDateFromNumber,
    DateNumberFormat,
    toDateTime,
    formatDate,
    fromLocalDate,
} from "@/dateTimeDataFormat";

// "2024-03-15T10:30:45.123" — no timezone suffix (treated as local by Date constructor)
const isoStr = "2024-03-15T10:30:45.123";
const isoStrNoMs = "2024-03-15T10:30:45.000";

describe("dateTimeDataFormat", () => {
    describe("serialize / deserialize", () => {
        it("deserialize returns a Luxon DateTime", () => {
            const dt = dateTimeFormat.deserialize(isoStr);
            expect(DateTime.isDateTime(dt)).toBe(true);
        });

        it("deserialize parses all fields correctly (UTC)", () => {
            const dt = dateTimeFormat.deserialize(isoStr);
            expect(dt.year).toBe(2024);
            expect(dt.month).toBe(3);
            expect(dt.day).toBe(15);
            expect(dt.hour).toBe(10);
            expect(dt.minute).toBe(30);
            expect(dt.second).toBe(45);
            expect(dt.millisecond).toBe(123);
        });

        it("deserialize sets zone to UTC", () => {
            const dt = dateTimeFormat.deserialize(isoStr);
            expect(dt.zoneName).toBe("UTC");
        });

        it("serialize round-trips with deserialize", () => {
            const dt = dateTimeFormat.deserialize(isoStr);
            expect(dateTimeFormat.serialize(dt)).toBe(isoStr);
        });

        it("serialize accepts a Date", () => {
            // Build a UTC Date then serialize it
            const dt = dateTimeFormat.deserialize(isoStr);
            const result = dateTimeFormat.serialize(dt.toJSDate());
            expect(result).toBe(isoStr);
        });

        it("serialize accepts a string", () => {
            expect(dateTimeFormat.serialize(isoStr)).toBe(isoStr);
        });

        it("serialize returns null for null input", () => {
            expect(dateTimeFormat.serialize(null)).toBeNull();
        });

        it("deserialize accepts a string with Z suffix", () => {
            const dt = dateTimeFormat.deserialize("2024-03-15T10:30:45.123Z");
            expect(dt.hour).toBe(10);
            expect(dt.zoneName).toBe("UTC");
        });

        it("deserialize accepts a string with +HH:mm offset and converts to UTC", () => {
            const dt = dateTimeFormat.deserialize("2024-03-15T10:30:45.123+03:00");
            expect(dt.hour).toBe(7); // 10:30+03:00 -> 07:30 UTC
            expect(dt.zoneName).toBe("UTC");
        });

        it("deserialize accepts a string without timezone (treated as UTC)", () => {
            const dt = dateTimeFormat.deserialize("2024-03-15T10:30:45.123");
            expect(dt.hour).toBe(10);
            expect(dt.zoneName).toBe("UTC");
        });

        it("deserialize throws on invalid format", () => {
            expect(() => dateTimeFormat.deserialize("not-a-date")).toThrow(
                /Invalid datetime format/
            );
        });

        it("tryDeserialize returns a DateTime on valid input", () => {
            const dt = dateTimeFormat.tryDeserialize(isoStr);
            expect(DateTime.isDateTime(dt)).toBe(true);
        });

        it("tryDeserialize returns null on invalid input", () => {
            const result = dateTimeFormat.tryDeserialize("not-a-date");
            expect(result).toBeNull();
        });
    });

    describe("serializationFormat", () => {
        it("is the Luxon-syntax ISO format string", () => {
            expect(dateTimeFormat.serializationFormat).toBe("yyyy-MM-dd'T'HH:mm:ss.SSS");
        });
    });

    describe("isValid", () => {
        it("returns true for a valid serialization string", () => {
            expect(dateTimeFormat.isValid(isoStr)).toBe(true);
        });

        it("returns true for null", () => {
            expect(dateTimeFormat.isValid(null)).toBe(true);
        });

        it("returns true for a Date instance", () => {
            expect(dateTimeFormat.isValid(new Date())).toBe(true);
        });

        it("returns false for an invalid string", () => {
            expect(dateTimeFormat.isValid("not-a-date")).toBe(false);
        });

        it("returns false for a wrong format string", () => {
            expect(dateTimeFormat.isValid("2024/03/15 10:30:45")).toBe(false);
        });
    });

    describe("normalize", () => {
        it("returns a native Date", () => {
            expect(dateTimeFormat.normalize(isoStr)).toBeInstanceOf(Date);
        });

        it("returns null for null input", () => {
            expect(dateTimeFormat.normalize(null)).toBeNull();
        });

        it("local accessors (getHours etc.) reflect the original UTC values", () => {
            // normalize() renders the UTC time as local — so Date.getHours() === UTC hour
            const result = dateTimeFormat.normalize(isoStr);
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(2); // 0-indexed
            expect(result.getDate()).toBe(15);
            expect(result.getHours()).toBe(10);
            expect(result.getMinutes()).toBe(30);
            expect(result.getSeconds()).toBe(45);
        });

        it("normalizes a numeric unix-ms value", () => {
            const ms = Date.UTC(2024, 2, 15, 10, 30, 45, 123);
            const result = dateTimeFormat.normalize(ms);
            expect(result).toBeInstanceOf(Date);
            expect(result.getHours()).toBe(10);
        });
    });

    describe("toDateTime", () => {
        it("returns null for null", () => {
            expect(toDateTime(null)).toBeNull();
        });

        it("converts a serialization string to a UTC DateTime", () => {
            const dt = toDateTime(isoStr);
            expect(DateTime.isDateTime(dt)).toBe(true);
            expect(dt.zoneName).toBe("UTC");
            expect(dt.year).toBe(2024);
            expect(dt.hour).toBe(10);
        });

        it("converts a Date to a UTC DateTime", () => {
            const date = new Date(Date.UTC(2024, 2, 15, 10, 30, 45, 123));
            const dt = toDateTime(date);
            expect(dt.hour).toBe(10);
            expect(dt.zoneName).toBe("UTC");
        });

        it("passes a DateTime through unchanged", () => {
            const original = DateTime.fromISO(isoStr, { zone: "utc" });
            expect(toDateTime(original)).toBe(original);
        });

        it("converts unix milliseconds with explicit format", () => {
            const ms = Date.UTC(2024, 2, 15, 10, 30, 45, 123);
            const dt = toDateTime(ms, { number: DateNumberFormat.UnixTimeMilliseconds });
            expect(dt.year).toBe(2024);
            expect(dt.hour).toBe(10);
        });

        it("converts unix seconds", () => {
            const ms = Date.UTC(2024, 2, 15, 0, 0, 0, 0);
            const dt = toDateTime(ms / 1000, { number: DateNumberFormat.UnixTimeSeconds });
            expect(dt.year).toBe(2024);
            expect(dt.month).toBe(3);
            expect(dt.day).toBe(15);
        });

        it("uses string format override when provided", () => {
            const dt = toDateTime("03/15/2024", { string: "MM/dd/yyyy" });
            expect(dt.year).toBe(2024);
            expect(dt.month).toBe(3);
            expect(dt.day).toBe(15);
        });

        it("throws for unsupported source type", () => {
            expect(() => toDateTime(true)).toThrow("Unsupported DateTime source");
        });
    });

    describe("getDateFromOADate / getOADateFromDate", () => {
        it("getDateFromOADate returns a Date", () => {
            expect(getDateFromOADate(45000)).toBeInstanceOf(Date);
        });

        it("round-trips an integer OADate (midnight)", () => {
            const original = new Date(2024, 2, 15, 0, 0, 0, 0);
            const oa = getOADateFromDate(original);
            const result = getDateFromOADate(parseFloat(oa));
            expect(result.getFullYear()).toBe(2024);
            expect(result.getMonth()).toBe(2);
            expect(result.getDate()).toBe(15);
            expect(result.getHours()).toBe(0);
        });

        it("getOADateFromDate returns a string", () => {
            expect(typeof getOADateFromDate(new Date(2024, 0, 1))).toBe("string");
        });
    });

    describe("getDateFromNumber", () => {
        it("returns null for null input", () => {
            expect(getDateFromNumber(null)).toBeNull();
        });

        it("converts unix milliseconds (default)", () => {
            const ms = Date.UTC(2024, 2, 15, 0, 0, 0, 0);
            expect(getDateFromNumber(ms).getTime()).toBe(ms);
        });

        it("converts unix seconds", () => {
            const ms = Date.UTC(2024, 2, 15, 0, 0, 0, 0);
            expect(
                getDateFromNumber(ms / 1000, DateNumberFormat.UnixTimeSeconds).getTime()
            ).toBe(ms);
        });

        it("converts OADate", () => {
            const date = new Date(2024, 2, 15, 0, 0, 0, 0);
            const oa = parseFloat(getOADateFromDate(date));
            const result = getDateFromNumber(oa, DateNumberFormat.OADate);
            expect(result.getFullYear()).toBe(2024);
        });
    });

    describe("fromLocalDate", () => {
        it("returns null for null input", () => {
            expect(fromLocalDate(null)).toBeNull();
        });

        it("reads local time parts as UTC", () => {
            // Simulate a Date produced by normalize(): getHours() === the original UTC hour
            const normalized = dateTimeFormat.normalize(isoStr);
            const dt = fromLocalDate(normalized);
            expect(DateTime.isDateTime(dt)).toBe(true);
            expect(dt.zoneName).toBe("UTC");
            expect(dt.year).toBe(2024);
            expect(dt.month).toBe(3);
            expect(dt.day).toBe(15);
            expect(dt.hour).toBe(10);
            expect(dt.minute).toBe(30);
            expect(dt.second).toBe(45);
            expect(dt.millisecond).toBe(123);
        });

        it("round-trips normalize -> fromLocalDate -> serialize", () => {
            const normalized = dateTimeFormat.normalize(isoStr);
            expect(dateTimeFormat.serialize(fromLocalDate(normalized))).toBe(isoStr);
        });
    });

    describe("formatDate", () => {
        it("returns empty string for null", () => {
            expect(formatDate(null)).toBe("");
        });

        it("formats with an explicit Luxon format string", () => {
            const dt = DateTime.fromISO(isoStr, { zone: "utc" });
            expect(formatDate(dt, "yyyy-MM-dd")).toBe("2024-03-15");
        });

        it("auto-selects dateShort when time is midnight", () => {
            const dt = DateTime.fromISO("2024-03-15T00:00:00.000", { zone: "utc" });
            const result = formatDate(dt);
            // Should contain the date without time
            expect(result).toMatch(/2024/);
            expect(result).toMatch(/15/);
        });

        it("auto-selects dateTime24 when milliseconds are present", () => {
            const dt = DateTime.fromISO(isoStr, { zone: "utc" });
            const result = formatDate(dt);
            // dateTime24 includes seconds and milliseconds
            expect(result).toContain("45");
            expect(result).toContain("123");
        });

        it("auto-selects dateTime24Short when time has no milliseconds", () => {
            const dt = DateTime.fromISO(isoStrNoMs, { zone: "utc" });
            const result = formatDate(dt);
            // dateTime24Short does NOT include milliseconds
            expect(result).not.toMatch(/\.000/);
        });

        it("accepts a native Date", () => {
            const date = new Date(Date.UTC(2024, 2, 15, 10, 30, 45, 0));
            const result = formatDate(date, "yyyy-MM-dd");
            expect(result).toBe("2024-03-15");
        });
    });
});
