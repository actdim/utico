import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
    getDateTimeFromString,
    getDateTimeFromNumber,
    getDateTimeNumber,
    DateTimeNumberFormat,
    DateTimeKind,
    DateTimeExportInterpretation,
    DateTimePrecision,
    DateTimeStringInterpretation,
    dateTimeTransports,
    toDateTime
} from "@/dateTimeDataFormat";

const isoLocal = "2024-03-15T10:30:45.123";

describe("dateTimeDataFormat", () => {
    describe("toDateTime", () => {
        it("returns null for null input", () => {
            expect(toDateTime(null)).toBeNull();
        });

        it("parses local ISO string as local zone", () => {
            const dt = toDateTime(isoLocal);
            expect(dt.zoneName).toBe(DateTime.local().zoneName);
            expect(dt.year).toBe(2024);
            expect(dt.hour).toBe(10);
        });

        it("parses Date to UTC by default", () => {
            const date = new Date(Date.UTC(2024, 2, 15, 10, 30, 45, 123));
            const dt = toDateTime(date);
            expect(dt.zoneName).toBe("UTC");
            expect(dt.hour).toBe(10);
        });

        it("supports dateInterpretAs=local", () => {
            const date = new Date(Date.UTC(2024, 2, 15, 10, 30, 45, 123));
            const dt = toDateTime(date, { dateInterpretAs: DateTimeKind.Local });
            expect(dt.zoneName).toBe(DateTime.local().zoneName);
        });

        it("supports numberInterpretAs=local", () => {
            const ms = Date.UTC(2024, 2, 15, 10, 30, 45, 123);
            const dt = toDateTime(ms, {
                numberFormat: DateTimeNumberFormat.UnixTimeMilliseconds,
                numberInterpretAs: DateTimeKind.Local
            });
            expect(dt.zoneName).toBe(DateTime.local().zoneName);
        });

        it("supports string format override", () => {
            const dt = toDateTime("03/15/2024", { stringFormat: "MM/dd/yyyy" });
            expect(dt.year).toBe(2024);
            expect(dt.month).toBe(3);
            expect(dt.day).toBe(15);
        });

        it("supports stringInterpretAs=utc", () => {
            const dt = toDateTime(isoLocal, { stringInterpretAs: DateTimeStringInterpretation.Utc });
            expect(dt.zoneName).toBe("UTC");
            expect(dt.hour).toBe(10);
        });

        it("keeps existing precision for DateTimeExtended when options.precision=auto", () => {
            const source = getDateTimeFromString("2024-03-15", "yyyy-MM-dd", DateTimePrecision.Date);
            const dt = toDateTime(source);
            expect(dt.precision).toBe(DateTimePrecision.Date);
            expect(dt.hour).toBe(0);
            expect(dt.minute).toBe(0);
            expect(dt.second).toBe(0);
            expect(dt.millisecond).toBe(0);
        });
    });

    describe("getDateTimeFromString", () => {
        it("parses Z suffix as UTC", () => {
            const dt = getDateTimeFromString("2024-03-15T10:30:45.123Z");
            expect(dt.zoneName).toBe("UTC");
            expect(dt.hour).toBe(10);
        });

        it("keeps explicit offset when provided", () => {
            const dt = getDateTimeFromString("2024-03-15T10:30:45.123+03:00");
            expect(dt.offset).toBe(180);
            expect(dt.hour).toBe(10);
        });

        it("throws on invalid format", () => {
            expect(() => getDateTimeFromString("not-a-date")).toThrow(/Invalid datetime format/);
        });

        it("infers date precision from format", () => {
            const dt = getDateTimeFromString("2024-03-15", "yyyy-MM-dd");
            expect(dt.precision).toBe(DateTimePrecision.Date);
        });

        it("uses millisecond precision for auto without explicit format", () => {
            const dt = getDateTimeFromString("2024-03-15");
            expect(dt.precision).toBe(DateTimePrecision.Millisecond);
        });
    });

    describe("number conversion", () => {
        it("parses unix milliseconds by default", () => {
            const ms = Date.UTC(2024, 2, 15, 0, 0, 0, 0);
            expect(getDateTimeFromNumber(ms).toMillis()).toBe(ms);
        });

        it("parses unix seconds", () => {
            const ms = Date.UTC(2024, 2, 15, 0, 0, 0, 0);
            expect(getDateTimeFromNumber(ms / 1000, DateTimeNumberFormat.UnixTimeSeconds).toMillis()).toBe(ms);
        });

        it("round-trips OADate", () => {
            const original = DateTime.fromISO("2024-03-15T10:30:45.123Z");
            const oa = getDateTimeNumber(original, DateTimeNumberFormat.OADate);
            const result = getDateTimeFromNumber(oa, DateTimeNumberFormat.OADate);
            expect(Math.abs(result.toMillis() - original.toMillis())).toBeLessThan(1);
        });

        it("getDateTimeNumber uses unix seconds by default", () => {
            const dt = DateTime.fromISO("2024-03-15T00:00:00Z");
            expect(getDateTimeNumber(dt)).toBe(dt.toSeconds());
        });
    });

    describe("DateTimeExtended.exportToString", () => {
        it("uses local date format for date precision", () => {
            const dt = getDateTimeFromString("2024-03-15", "yyyy-MM-dd", DateTimePrecision.Date);
            expect(dt.exportToString(DateTimeKind.Local)).toBe("2024-03-15");
        });

        it("uses utc datetime format for utc kind", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS");
            const result = dt.exportToString(DateTimeKind.Utc);
            expect(result.endsWith("Z")).toBe(true);
        });

        it("supports custom format string", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS");
            expect(dt.exportToString("yyyy/MM/dd")).toBe("2024/03/15");
        });

        it("supports interpretAs=original", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS");
            const expected = dt.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
            expect(dt.exportToString("yyyy-MM-dd'T'HH:mm:ss.SSS", DateTimeExportInterpretation.Original)).toBe(expected);
        });

        it("supports interpretAs=match", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS");
            expect(dt.exportToString("z", DateTimeExportInterpretation.Match)).toBe("UTC");
            expect(dt.exportToString(DateTimeKind.Local, DateTimeExportInterpretation.Match)).toContain("T");
        });

        it("truncates to minute precision", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS", DateTimePrecision.Minute);
            expect(dt.second).toBe(0);
            expect(dt.millisecond).toBe(0);
        });

        it("truncates to second precision", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS", DateTimePrecision.Second);
            expect(dt.second).toBe(45);
            expect(dt.millisecond).toBe(0);
        });
    });

    describe("transports", () => {
        it("commonLocal DateTimeTransport serializes to local ISO without suffix", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS");
            const expected = dt.exportToString(DateTimeKind.Local, DateTimeExportInterpretation.Local);
            expect(dateTimeTransports.commonLocal.serialize(dt)).toBe(expected);
        });

        it("utc DateTimeTransport serializes with Z suffix", () => {
            const dt = getDateTimeFromString(isoLocal, "yyyy-MM-dd'T'HH:mm:ss.SSS");
            expect(dateTimeTransports.utc.serialize(dt).endsWith("Z")).toBe(true);
        });

        it("utc DateTimeTransport deserializes unix seconds as UTC", () => {
            const sec = Date.UTC(2024, 2, 15, 10, 30, 45, 123) / 1000;
            const dt = dateTimeTransports.utc.deserialize(sec);
            expect(dt.zoneName).toBe("UTC");
        });

        it("transport deserialize returns null for null", () => {
            expect(dateTimeTransports.utc.deserialize(null)).toBeNull();
            expect(dateTimeTransports.commonLocal.deserialize(undefined)).toBeNull();
        });

        it("transport serialize returns null for null/undefined", () => {
            expect(dateTimeTransports.utc.serialize(null)).toBeNull();
            expect(dateTimeTransports.commonLocal.serialize(undefined)).toBeNull();
        });
    });
});
