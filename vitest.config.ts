import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/test/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/**/*.d.ts"],
        },
    },
});
