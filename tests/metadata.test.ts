import { describe, it, expect } from "vitest";
import { metadata, getPropertyMetadata, updatePropertyMetadata } from "@/metadata";

describe("metadata", () => {

    describe("decorator @metadata", () => {
        it("sets metadata on a class property", () => {
            class Foo {
                @metadata("myValue", "mySlot")
                bar: string;
            }

            const meta = getPropertyMetadata(new Foo(), "bar", "mySlot");
            expect(meta).toBe("myValue");
        });

        it("sets multiple slots on the same property", () => {
            class Foo {
                @metadata("value1", "slot1")
                @metadata("value2", "slot2")
                bar: string;
            }

            const instance = new Foo();
            expect(getPropertyMetadata(instance, "bar", "slot1")).toBe("value1");
            expect(getPropertyMetadata(instance, "bar", "slot2")).toBe("value2");
        });

        it("sets metadata on multiple properties", () => {
            class Foo {
                @metadata("aProp", "label")
                a: string;

                @metadata("bProp", "label")
                b: string;
            }

            const instance = new Foo();
            expect(getPropertyMetadata(instance, "a", "label")).toBe("aProp");
            expect(getPropertyMetadata(instance, "b", "label")).toBe("bProp");
        });
    });

    describe("getPropertyMetadata", () => {
        it("returns undefined when no metadata set", () => {
            class Foo {
                bar: string;
            }
            expect(getPropertyMetadata(new Foo(), "bar")).toBeUndefined();
        });

        it("returns undefined for unknown slotName", () => {
            class Foo {
                @metadata("val", "slot1")
                bar: string;
            }
            expect(getPropertyMetadata(new Foo(), "bar", "unknownSlot")).toBeUndefined();
        });

        it("returns all property metadata when slotName is omitted", () => {
            class Foo {
                @metadata("v1", "s1")
                @metadata("v2", "s2")
                bar: string;
            }

            const meta = getPropertyMetadata(new Foo(), "bar");
            expect(meta).toEqual({ s1: "v1", s2: "v2" });
        });

        it("resolves metadata through the prototype chain", () => {
            class Base {
                @metadata("baseVal", "slot")
                prop: string;
            }

            class Child extends Base {}

            expect(getPropertyMetadata(new Child(), "prop", "slot")).toBe("baseVal");
        });

        it("returns undefined when target is falsy", () => {
            expect(getPropertyMetadata(null as any, "prop")).toBeUndefined();
        });
    });

    describe("updatePropertyMetadata", () => {
        it("overwrites an existing slot value", () => {
            class Foo {
                @metadata("original", "slot")
                bar: string;
            }

            const proto = Foo.prototype;
            updatePropertyMetadata(proto, "bar", "updated", "slot");

            expect(getPropertyMetadata(new Foo(), "bar", "slot")).toBe("updated");
        });
    });
});
