import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => ({ get: vi.fn().mockReturnValue(null) }),
    usePathname: vi.fn().mockReturnValue("/"),
}));

vi.mock("framer-motion", () => {
    const React = require("react");
    const motionProxy = new Proxy(
        {},
        {
            get: (_t, tag: string) =>
                ({ children, initial, animate, exit, transition, whileHover, whileTap, layoutId, variants, ...rest }: Record<string, unknown>) =>
                    React.createElement(tag, rest, children),
        }
    );
    return {
        motion: motionProxy,
        AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
        useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
        useInView: () => true,
        useReducedMotion: () => false,
    };
});

vi.mock("nodemailer", () => ({
    default: {
        createTransport: vi.fn().mockReturnValue({
            sendMail: vi.fn().mockResolvedValue({ messageId: "mock-id" }),
        }),
    },
}));

vi.mock("@supabase/ssr", () => ({
    createServerClient: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
    }),
}));

vi.mock("next/headers", () => ({
    cookies: vi.fn().mockResolvedValue({
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
    }),
}));

if (typeof window !== "undefined") {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
}

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
