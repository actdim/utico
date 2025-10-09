import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";
import { resolve } from 'path';

export default defineConfig({
    // plugins: [],
    test: {
        globals: true,
        include: ["tests/**/*.test.ts"],
        watch: false,
        // npx vitest run --environment jsdom
        // environment: 'jsdom',
        // restoreMocks: true,
        // clearMocks: true,
        // isolate: true,
        // environment: 'node',
        setupFiles: [
            // './vitest.setup.ts'
            resolve('./vitest.setup.ts')
        ],
        // root: '.'
        root: resolve('.'),
    },
    resolve: {
        alias: [{ find: "@", replacement: resolve(__dirname, "./src") }]
    },
    base: "./",
    // plugins: [tsConfigPaths()]
});
