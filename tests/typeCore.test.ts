import { describe, it, expect } from "vitest";
import { getByKeyPath, setByKeyPath } from "@/typeCore";

// ─── fixtures ─────────────────────────────────────────────────────────────────

interface Address {
    city: string;
    zip: string;
}

interface User {
    name: string;
    age: number;
    address: Address;
    tags: string[];
    scores: { value: number }[];
}

function makeUser(): User {
    return {
        name: "Alice",
        age: 30,
        address: { city: "Boston", zip: "02101" },
        tags: ["a", "b", "c"],
        scores: [{ value: 10 }, { value: 20 }],
    };
}

// ─── getByKeyPath ─────────────────────────────────────────────────────────────

describe("getByKeyPath", () => {
    it("reads a top-level property", () => {
        expect(getByKeyPath(makeUser(), "name")).toBe("Alice");
    });

    it("reads a numeric top-level property", () => {
        expect(getByKeyPath(makeUser(), "age")).toBe(30);
    });

    it("reads a nested property", () => {
        expect(getByKeyPath(makeUser(), "address.city")).toBe("Boston");
    });

    it("reads a deeply nested property", () => {
        expect(getByKeyPath(makeUser(), "address.zip")).toBe("02101");
    });

    it("reads an array element by index", () => {
        expect(getByKeyPath(makeUser(), "tags.0")).toBe("a");
        expect(getByKeyPath(makeUser(), "tags.2")).toBe("c");
    });

    it("reads a property of an array element", () => {
        expect(getByKeyPath(makeUser(), "scores.0")).toEqual({ value: 10 });
        expect(getByKeyPath(makeUser(), "scores.1")).toEqual({ value: 20 });
    });

    it("returns undefined for a missing top-level key", () => {
        expect(getByKeyPath(makeUser(), "missing" as any)).toBeUndefined();
    });

    it("returns undefined when an intermediate key is missing", () => {
        expect(getByKeyPath({ a: null } as any, "a.b")).toBeUndefined();
    });

    it("returns undefined for an out-of-bounds array index", () => {
        expect(getByKeyPath(makeUser(), "tags.99" as any)).toBeUndefined();
    });
});

// ─── setByKeyPath ─────────────────────────────────────────────────────────────

describe("setByKeyPath", () => {
    it("sets a top-level property", () => {
        const user = makeUser();
        setByKeyPath(user, "name", "Bob");
        expect(user.name).toBe("Bob");
    });

    it("sets a numeric top-level property", () => {
        const user = makeUser();
        setByKeyPath(user, "age", 99);
        expect(user.age).toBe(99);
    });

    it("sets a nested property", () => {
        const user = makeUser();
        setByKeyPath(user, "address.city", "Seattle");
        expect(user.address.city).toBe("Seattle");
    });

    it("sets a property on an array element", () => {
        const user = makeUser();
        setByKeyPath(user, "scores.0", { value: 99 });
        expect(user.scores[0]).toEqual({ value: 99 });
    });

    it("mutates the original object, not a copy", () => {
        const user = makeUser();
        const address = user.address;
        setByKeyPath(user, "address.zip", "99999");
        expect(address.zip).toBe("99999");
    });

    it("does nothing when an intermediate path is null", () => {
        const obj = { a: null as any };
        expect(() => setByKeyPath(obj as any, "a.b", "x")).not.toThrow();
        expect(obj.a).toBeNull();
    });

    it("does nothing when an intermediate path is undefined", () => {
        const obj = {} as any;
        expect(() => setByKeyPath(obj, "a.b" as any, "x")).not.toThrow();
    });
});
