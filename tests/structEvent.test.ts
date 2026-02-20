import { describe, it, expect, vi } from "vitest";
import { StructEvent, StructEventTarget } from "@/structEvent";

type TestStruct = {
    change: { value: number };
    reset: void;
};

function makeTarget() {
    return new StructEventTarget<TestStruct>();
}

function makeEvent(target: StructEventTarget<TestStruct>, value: number): StructEvent<TestStruct, StructEventTarget<TestStruct>> {
    return new StructEvent("change", { target, detail: { value } });
}

describe("StructEventTarget", () => {

    describe("addEventListener", () => {
        it("registers a listener", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            expect(target.hasEventListener("change", listener)).toBe(true);
        });

        it("listener is called on dispatchEvent", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            target.dispatchEvent(makeEvent(target, 42));
            expect(listener).toHaveBeenCalledOnce();
        });

        it("passes event detail to listener", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            target.dispatchEvent(makeEvent(target, 99));
            expect(listener.mock.calls[0][0].detail).toEqual({ value: 99 });
        });

        it("multiple listeners on the same type all fire", () => {
            const target = makeTarget();
            const l1 = vi.fn();
            const l2 = vi.fn();
            target.addEventListener("change", l1);
            target.addEventListener("change", l2);
            target.dispatchEvent(makeEvent(target, 1));
            expect(l1).toHaveBeenCalledOnce();
            expect(l2).toHaveBeenCalledOnce();
        });

        it("listeners on different types are independent", () => {
            const target = makeTarget();
            const onChange = vi.fn();
            const onReset = vi.fn();
            target.addEventListener("change", onChange);
            target.addEventListener("reset", onReset);
            target.dispatchEvent(makeEvent(target, 1));
            expect(onChange).toHaveBeenCalledOnce();
            expect(onReset).not.toHaveBeenCalled();
        });
    });

    describe("removeEventListener", () => {
        it("unregisters the listener", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            target.removeEventListener("change", listener);
            expect(target.hasEventListener("change", listener)).toBe(false);
        });

        it("listener is not called after removal", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            target.removeEventListener("change", listener);
            target.dispatchEvent(makeEvent(target, 1));
            expect(listener).not.toHaveBeenCalled();
        });

        it("removing one listener does not affect others", () => {
            const target = makeTarget();
            const l1 = vi.fn();
            const l2 = vi.fn();
            target.addEventListener("change", l1);
            target.addEventListener("change", l2);
            target.removeEventListener("change", l1);
            target.dispatchEvent(makeEvent(target, 1));
            expect(l1).not.toHaveBeenCalled();
            expect(l2).toHaveBeenCalledOnce();
        });

        it("removing a listener that was never added does not throw", () => {
            const target = makeTarget();
            const listener = vi.fn();
            expect(() => target.removeEventListener("change", listener)).not.toThrow();
        });
    });

    describe("hasEventListener", () => {
        it("returns false when no listeners registered", () => {
            const target = makeTarget();
            const listener = vi.fn();
            expect(target.hasEventListener("change", listener)).toBe(false);
        });

        it("returns true after addEventListener", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            expect(target.hasEventListener("change", listener)).toBe(true);
        });

        it("returns false after removeEventListener", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            target.removeEventListener("change", listener);
            expect(target.hasEventListener("change", listener)).toBe(false);
        });

        it("returns false for a different listener on the same type", () => {
            const target = makeTarget();
            const l1 = vi.fn();
            const l2 = vi.fn();
            target.addEventListener("change", l1);
            expect(target.hasEventListener("change", l2)).toBe(false);
        });

        it("returns false for the right listener on a different type", () => {
            const target = makeTarget();
            const listener = vi.fn();
            target.addEventListener("change", listener);
            expect(target.hasEventListener("reset", listener as any)).toBe(false);
        });
    });

    describe("dispatchEvent", () => {
        it("returns true when dispatched successfully", () => {
            const target = makeTarget();
            const result = target.dispatchEvent(makeEvent(target, 0));
            expect(result).toBe(true);
        });

        it("sets event.target to the dispatching target", () => {
            const target = makeTarget();
            let received: StructEvent<TestStruct, typeof target, "change"> | undefined;
            target.addEventListener("change", (e) => { received = e; });
            target.dispatchEvent(makeEvent(target, 7));
            expect(received.target).toBe(target);
        });
    });
});
