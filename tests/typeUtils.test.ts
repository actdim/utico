import { describe, it, expect, vi } from "vitest";
import {
    keysOf, entry, keyOf, nameOf, _nh, _keyMap,
    getPropertyPath, combinePropertyPath,
    createConstructor, typed, getPrototypes, proxify,
    getEnumValue, getEnumValues, getEnumKeys,
    assignWith, update, copy,
    isPlainObject, orderedStringify, jsonEquals, jsonClone,
    toReadOnly,
} from "@/typeUtils";

// ─── keysOf ──────────────────────────────────────────────────────────────────

describe("keysOf", () => {
    it("returns keys of an object", () => {
        expect(keysOf({ a: 1, b: 2 })).toEqual(["a", "b"]);
    });

    it("returns empty array for empty object", () => {
        expect(keysOf({})).toEqual([]);
    });
});

// ─── entry ────────────────────────────────────────────────────────────────────

describe("entry", () => {
    const obj = { Foo: 1, Bar: 2 };

    it("finds key case-insensitively by default", () => {
        const [k, v] = entry(obj, "foo" as any);
        expect(k).toBe("Foo");
        expect(v).toBe(1);
    });

    it("finds key case-sensitively when flag is false", () => {
        const [k, v] = entry(obj, "Foo", false);
        expect(k).toBe("Foo");
        expect(v).toBe(1);
    });

    it("returns undefined key+value when not found", () => {
        const [k, v] = entry(obj, "missing" as any);
        expect(k).toBeUndefined();
        expect(v).toBeUndefined();
    });

    it("returns undefined when obj is falsy", () => {
        expect(entry(null, "foo" as any)).toBeUndefined();
    });
});

// ─── keyOf ────────────────────────────────────────────────────────────────────

describe("keyOf", () => {
    it("returns the key as-is", () => {
        expect(keyOf<{ name: string }>("name")).toBe("name");
    });
});

// ─── nameOf ───────────────────────────────────────────────────────────────────

describe("nameOf", () => {
    it("returns property name via proxy", () => {
        type T = { age: number };
        expect(nameOf<T>(x => x.age)).toBe("age");
    });

    it("returns nested property name (first access)", () => {
        type T = { a: { b: number } };
        expect(nameOf<T>(x => x.a)).toBe("a");
    });
});

// ─── $nh ──────────────────────────────────────────────────────────────────────

describe("$nh", () => {
    it("nameOf works same as standalone nameOf", () => {
        type T = { value: string };
        expect(_nh<T>().nameOf(x => x.value)).toBe("value");
    });
});

// ─── $keyMap ──────────────────────────────────────────────────────────────────

describe("$keyMap", () => {
    it("returns property name as value", () => {
        type T = { x: number; y: number };
        const m = _keyMap<T>();
        expect(m.x).toBe("x");
        expect(m.y).toBe("y");
    });
});

// ─── getPropertyPath ──────────────────────────────────────────────────────────

describe("getPropertyPath", () => {
    it("returns single-level path", () => {
        type T = { a: number };
        expect(getPropertyPath<T>(x => x.a)).toEqual(["a"]);
    });

    it("returns multi-level path", () => {
        type T = { a: { b: { c: number } } };
        expect(getPropertyPath<T>(x => x.a.b.c)).toEqual(["a", "b", "c"]);
    });
});

// ─── combinePropertyPath ──────────────────────────────────────────────────────

describe("combinePropertyPath", () => {
    it("combines path segments into bracket notation", () => {
        expect(combinePropertyPath(["a", "b", "c"])).toBe(`["a"]["b"]["c"]`);
    });

    it("returns empty string for empty path", () => {
        expect(combinePropertyPath([])).toBe("");
    });
});

// ─── createConstructor ────────────────────────────────────────────────────────

describe("createConstructor", () => {
    it("creates instance via new", () => {
        class Foo { constructor(public x: number) {} }
        const FooCtor = createConstructor(Foo);
        expect(new FooCtor(42).x).toBe(42);
    });

    it("creates instance without new (callable)", () => {
        class Foo { constructor(public x: number) {} }
        const FooCtor = createConstructor(Foo) as any;
        expect(FooCtor(42).x).toBe(42);
    });

    it("preserves instanceof for non-primitive", () => {
        class Bar {}
        const BarCtor = createConstructor(Bar) as any;
        expect(BarCtor() instanceof Bar).toBe(true);
    });

    it("handles String as non-object type", () => {
        const S = createConstructor(String) as any;
        expect(S).toBe(String);
    });

    it("handles Number as non-object type", () => {
        const N = createConstructor(Number) as any;
        expect(N).toBe(Number);
    });
});

// ─── typed ────────────────────────────────────────────────────────────────────

describe("typed", () => {
    it("returns the same constructor reference", () => {
        class Foo {}
        expect(typed(Foo)).toBe(Foo);
    });
});

// ─── getPrototypes ────────────────────────────────────────────────────────────

describe("getPrototypes", () => {
    it("includes Object.prototype in chain", () => {
        const chain = getPrototypes({});
        expect(chain).toContain(Object.prototype);
    });

    it("includes parent prototype for subclass", () => {
        class A {}
        class B extends A {}
        const chain = getPrototypes(new B());
        expect(chain).toContain(A.prototype);
        expect(chain).toContain(B.prototype);
    });
});

// ─── proxify ──────────────────────────────────────────────────────────────────

describe("proxify", () => {
    it("reads from the latest source value", () => {
        let obj = { x: 1 };
        const proxy = proxify(() => obj);
        expect(proxy.x).toBe(1);
        obj = { x: 99 };
        expect(proxy.x).toBe(99);
    });

    it("writes through to the source", () => {
        const obj = { x: 1 };
        const proxy = proxify(() => obj);
        proxy.x = 42;
        expect(obj.x).toBe(42);
    });
});

// ─── getEnumValue / getEnumValues / getEnumKeys ───────────────────────────────

enum Color { Red = "red", Green = "green", Blue = "blue" }

describe("getEnumValue", () => {
    it("returns matching enum value", () => {
        expect(getEnumValue(Color, "Red", Color.Blue)).toBe(Color.Red);
    });

    it("returns default when key not found", () => {
        expect(getEnumValue(Color, "Purple", Color.Blue)).toBe(Color.Blue);
    });

    it("returns default when name is empty", () => {
        expect(getEnumValue(Color, "", Color.Green)).toBe(Color.Green);
    });
});

describe("getEnumKeys", () => {
    it("returns string keys only (no numeric reverse mappings)", () => {
        expect(getEnumKeys(Color)).toEqual(["Red", "Green", "Blue"]);
    });
});

describe("getEnumValues", () => {
    it("returns enum values", () => {
        expect(getEnumValues(Color)).toEqual(["red", "green", "blue"]);
    });
});

// ─── assignWith ───────────────────────────────────────────────────────────────

describe("assignWith", () => {
    it("calls callback for each src key", () => {
        const dst = { a: 0 };
        const cb = vi.fn((_key, _val, set) => set(_val));
        assignWith(dst, { a: 5, b: 10 } as any, cb);
        expect(cb).toHaveBeenCalledTimes(2);
    });

    it("sets value via set callback", () => {
        const dst: any = {};
        assignWith(dst, { x: 7 }, (_key, val, set) => set(val));
        expect(dst.x).toBe(7);
    });

    it("does nothing when src is falsy", () => {
        const dst = { a: 1 };
        assignWith(dst, null);
        expect(dst.a).toBe(1);
    });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe("update", () => {
    it("updates all keys when no props filter", () => {
        const dst: any = { a: 1, b: 2 };
        update(dst, { a: 10, b: 20 });
        expect(dst).toEqual({ a: 10, b: 20 });
    });

    it("updates only specified props", () => {
        const dst: any = { a: 1, b: 2 };
        update(dst, { a: 10, b: 20 }, ["a"]);
        expect(dst.a).toBe(10);
        expect(dst.b).toBe(2);
    });
});

// ─── copy ─────────────────────────────────────────────────────────────────────

describe("copy", () => {
    it("copies properties from src to dst", () => {
        const src = { x: 1, y: 2 };
        const dst: any = {};
        copy(src, dst);
        expect(dst).toEqual({ x: 1, y: 2 });
    });
});

// ─── isPlainObject ────────────────────────────────────────────────────────────

describe("isPlainObject", () => {
    it("returns true for plain object literal", () => {
        expect(isPlainObject({ a: 1 })).toBe(true);
    });

    it("returns true for Object.create(null)", () => {
        expect(isPlainObject(Object.create(null))).toBe(true);
    });

    it("returns false for class instance", () => {
        expect(isPlainObject(new class Foo {}())).toBe(false);
    });

    it("returns false for array", () => {
        expect(isPlainObject([])).toBe(false);
    });

    it("returns false for null", () => {
        expect(isPlainObject(null)).toBe(false);
    });
});

// ─── orderedStringify ─────────────────────────────────────────────────────────

describe("orderedStringify", () => {
    it("produces stable output regardless of key insertion order", () => {
        const a = orderedStringify({ z: 1, a: 2 });
        const b = orderedStringify({ a: 2, z: 1 });
        expect(a).toBe(b);
    });

    it("sorts nested objects too", () => {
        const a = orderedStringify({ b: { y: 1, x: 2 }, a: 3 });
        const b = orderedStringify({ a: 3, b: { x: 2, y: 1 } });
        expect(a).toBe(b);
    });
});

// ─── jsonEquals ───────────────────────────────────────────────────────────────

describe("jsonEquals", () => {
    it("returns true for structurally equal objects", () => {
        expect(jsonEquals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    });

    it("returns false for different objects", () => {
        expect(jsonEquals({ a: 1 }, { a: 2 })).toBe(false);
    });
});

// ─── jsonClone ────────────────────────────────────────────────────────────────

describe("jsonClone", () => {
    it("returns a deep clone", () => {
        const src = { a: { b: 42 } };
        const clone = jsonClone(src);
        expect(clone).toEqual(src);
        expect(clone).not.toBe(src);
        expect(clone.a).not.toBe(src.a);
    });

    it("returns null as-is", () => {
        expect(jsonClone(null)).toBeNull();
    });

    it("throws for non-object types", () => {
        expect(() => jsonClone("string" as any)).toThrow();
    });
});

// ─── toReadOnly ───────────────────────────────────────────────────────────────

describe("toReadOnly", () => {
    it("allows reading properties", () => {
        const ro = toReadOnly({ x: 42 });
        expect(ro.x).toBe(42);
    });

    it("silently ignores writes by default", () => {
        const obj = { x: 1 };
        const ro = toReadOnly(obj);
        (ro as any).x = 99;
        expect(obj.x).toBe(1);
    });

    it("throws on write when throwOnSet is true", () => {
        const ro = toReadOnly({ x: 1 }, true);
        expect(() => { (ro as any).x = 99; }).toThrow("read-only");
    });

    it("handles nested objects", () => {
        const ro = toReadOnly({ a: { b: 1 } });
        expect(ro.a.b).toBe(1);
    });
});
