import { describe, it, expect, vi } from "vitest";
import { delay, delayError, withTimeout, memoEffect } from "@/utils";

describe("utils", () => {
    // process.on("unhandledRejection", (reason, promise) => {
    //     console.error("Unhandled Rejection at:", promise, "reason:", reason);
    //     process.exit(1);
    // });

    // window.onerror = (message, source, lineno, colno, error) => {
    //     console.error("Caught error:", error);
    // };

    // window.onunhandledrejection = (event) => {
    //     console.error("Unhandled rejection:", event.reason);
    // };

    it("memoEffect works", () => {
        let dep = "test";
        let id = 0;
        let c = 0;
        const action = (a: string, fake = false) => {
            if (!fake) {
                id++;
            }
            return a + id;
        };
        const fn = memoEffect(
            () => dep,
            (str) => {
                c++;
                return action(str);
            }
        );

        let r = fn();
        expect(r).toBe(action(dep, true));
        let oldR = r;
        r = fn();
        expect(r).toBe(oldR);
        expect(c).toBe(1);
        dep = "new";
        r = fn();
        expect(r).toBe(action(dep, true));
        expect(c).toBe(2);
    });
});
