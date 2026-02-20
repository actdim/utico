import { describe, it, expect } from "vitest";
import { equals, compare, ciCompare, ciStartsWith, ciEndsWith, ciIndexOf, ciIncludes } from "@/stringCore";

const L = "en-US";

// ─── equals ───────────────────────────────────────────────────────────────────

describe("equals", () => {
    it("returns true for identical strings", () => {
        expect(equals("hello", "hello", false, L)).toBe(true);
    });

    it("returns false for different strings", () => {
        expect(equals("hello", "world", false, L)).toBe(false);
    });

    it("is case-sensitive by default", () => {
        expect(equals("Hello", "hello", false, L)).toBe(false);
    });

    it("ignores case when ignoreCase=true", () => {
        expect(equals("Hello", "hello", true, L)).toBe(true);
        expect(equals("HELLO", "hello", true, L)).toBe(true);
    });

    it("returns true for two empty strings", () => {
        expect(equals("", "", false, L)).toBe(true);
    });

    it("returns false when one string is empty and the other is not", () => {
        expect(equals("", "a", false, L)).toBe(false);
        expect(equals("a", "", false, L)).toBe(false);
    });

    it("uses reference equality for non-string values", () => {
        const obj = {};
        expect(equals(obj as any, obj as any)).toBe(true);
        expect(equals(obj as any, {} as any)).toBe(false);
        expect(equals(null as any, null as any)).toBe(true);
        expect(equals(null as any, undefined as any)).toBe(false);
    });
});

// ─── compare ──────────────────────────────────────────────────────────────────

describe("compare", () => {
    it("returns 0 for equal strings", () => {
        expect(compare("abc", "abc", false, L)).toBe(0);
    });

    it("returns negative when strA < strB", () => {
        expect(compare("abc", "abd", false, L)).toBeLessThan(0);
    });

    it("returns positive when strA > strB", () => {
        expect(compare("abd", "abc", false, L)).toBeGreaterThan(0);
    });

    it("is case-sensitive by default", () => {
        // 'a' and 'A' differ in case-sensitive mode
        expect(compare("a", "A", false, L)).not.toBe(0);
    });

    it("ignores case when ignoreCase=true", () => {
        expect(compare("Hello", "hello", true, L)).toBe(0);
    });

    it("falls back to collator compare for non-strings", () => {
        // should not throw; result type is number
        const result = compare(1 as any, 2 as any);
        expect(typeof result).toBe("number");
    });
});

// ─── ciCompare ────────────────────────────────────────────────────────────────

describe("ciCompare", () => {
    it("returns 0 for strings that differ only in case", () => {
        expect(ciCompare("Hello", "hello", L)).toBe(0);
        expect(ciCompare("WORLD", "world", L)).toBe(0);
    });

    it("returns 0 for identical strings", () => {
        expect(ciCompare("abc", "abc", L)).toBe(0);
    });

    it("returns non-zero for strings that differ beyond case", () => {
        expect(ciCompare("abc", "abd", L)).not.toBe(0);
    });

    it("returns negative when strA < strB case-insensitively", () => {
        expect(ciCompare("apple", "Banana", L)).toBeLessThan(0);
    });

    it("returns positive when strA > strB case-insensitively", () => {
        expect(ciCompare("Banana", "apple", L)).toBeGreaterThan(0);
    });
});

// ─── ciStartsWith ─────────────────────────────────────────────────────────────

describe("ciStartsWith", () => {
    it("returns true when str starts with searchStr (same case)", () => {
        expect(ciStartsWith("Hello World", "Hello", L)).toBe(true);
    });

    it("returns true when str starts with searchStr (different case)", () => {
        expect(ciStartsWith("Hello World", "hello", L)).toBe(true);
        expect(ciStartsWith("hello world", "HELLO", L)).toBe(true);
    });

    it("returns false when str does not start with searchStr", () => {
        expect(ciStartsWith("Hello World", "World", L)).toBe(false);
    });

    it("returns true for empty searchStr", () => {
        expect(ciStartsWith("Hello", "", L)).toBe(true);
    });

    it("returns false when searchStr is longer than str", () => {
        expect(ciStartsWith("Hi", "Hello", L)).toBe(false);
    });

    it("returns false for non-string inputs", () => {
        expect(ciStartsWith(null as any, "x", L)).toBe(false);
        expect(ciStartsWith("hello", null as any, L)).toBe(false);
    });
});

// ─── ciEndsWith ───────────────────────────────────────────────────────────────

describe("ciEndsWith", () => {
    it("returns true when str ends with searchStr (same case)", () => {
        expect(ciEndsWith("Hello World", "World", L)).toBe(true);
    });

    it("returns true when str ends with searchStr (different case)", () => {
        expect(ciEndsWith("Hello World", "world", L)).toBe(true);
        expect(ciEndsWith("hello world", "WORLD", L)).toBe(true);
    });

    it("returns false when str does not end with searchStr", () => {
        expect(ciEndsWith("Hello World", "Hello", L)).toBe(false);
    });

    it("returns true for empty searchStr", () => {
        expect(ciEndsWith("Hello", "", L)).toBe(true);
    });

    it("returns false when searchStr is longer than str", () => {
        expect(ciEndsWith("Hi", "Hello", L)).toBe(false);
    });

    it("returns false for non-string inputs", () => {
        expect(ciEndsWith(null as any, "x", L)).toBe(false);
        expect(ciEndsWith("hello", null as any, L)).toBe(false);
    });
});

// ─── ciIndexOf ────────────────────────────────────────────────────────────────

describe("ciIndexOf", () => {
    it("finds a substring at the start", () => {
        expect(ciIndexOf("Hello World", "hello", L)).toBe(0);
    });

    it("finds a substring in the middle", () => {
        expect(ciIndexOf("Hello World", "world", L)).toBe(6);
    });

    it("finds a substring regardless of case", () => {
        expect(ciIndexOf("Hello World", "WORLD", L)).toBe(6);
        expect(ciIndexOf("HELLO WORLD", "hello", L)).toBe(0);
    });

    it("returns -1 when the substring is not found", () => {
        expect(ciIndexOf("Hello World", "xyz", L)).toBe(-1);
    });

    it("returns 0 for empty searchStr", () => {
        expect(ciIndexOf("Hello", "", L)).toBe(0);
    });

    it("returns -1 when searchStr is longer than str", () => {
        expect(ciIndexOf("Hi", "Hello", L)).toBe(-1);
    });

    it("returns -1 for non-string inputs", () => {
        expect(ciIndexOf(null as any, "x", L)).toBe(-1);
        expect(ciIndexOf("hello", null as any, L)).toBe(-1);
    });
});

// ─── ciIncludes ───────────────────────────────────────────────────────────────

describe("ciIncludes", () => {
    it("returns true when str contains searchStr (same case)", () => {
        expect(ciIncludes("Hello World", "World", L)).toBe(true);
    });

    it("returns true when str contains searchStr (different case)", () => {
        expect(ciIncludes("Hello World", "world", L)).toBe(true);
        expect(ciIncludes("Hello World", "HELLO", L)).toBe(true);
    });

    it("returns false when str does not contain searchStr", () => {
        expect(ciIncludes("Hello World", "xyz", L)).toBe(false);
    });

    it("returns true for empty searchStr", () => {
        expect(ciIncludes("Hello", "", L)).toBe(true);
    });

    it("returns false when searchStr is longer than str", () => {
        expect(ciIncludes("Hi", "Hello", L)).toBe(false);
    });

    it("returns false for non-string inputs", () => {
        expect(ciIncludes(null as any, "x", L)).toBe(false);
        expect(ciIncludes("hello", null as any, L)).toBe(false);
    });
});
