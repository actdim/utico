/// <reference types="mocha" />
/// <reference types="chai" />

import "./mocha"
// import "mocha";

import { expect } from "chai";
import { PersistentStore } from "@/store/persistentStore";

describe("PersistentStore", () => {
    it("should open a store", async () => {
        const store = await PersistentStore.openAsync("TestDB");
        expect(store).to.exist;
        // expect(store).to.undefined;
    });
});