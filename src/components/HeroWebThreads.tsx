"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import type { ThreadsMask } from "@/components/ui/web-threads";

// WebGL — tylko w przeglądarce, po hydracji. Nie blokuje LCP.
const WebThreads = dynamic(() => import("@/components/ui/web-threads"), { ssr: false, loading: () => null });

const DESKTOP = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
    const mq = window.matchMedia(DESKTOP);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
};
const isDesktop = () => window.matchMedia(DESKTOP).matches;

// Desktop: znikają pod tekstem po lewej. Telefon: tylko dół ekranu, pod przyciskami.
const MASK_DESKTOP: ThreadsMask = { axis: "x", from: 0.38, to: 0.62 };
const MASK_MOBILE: ThreadsMask = { axis: "y", from: 0.55, to: 0.85 };

export function HeroWebThreads() {
    const desktop = useSyncExternalStore(subscribe, isDesktop, () => true);

    return (
        <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
            <WebThreads
                colors={["#FFEB52", "#ea8e08"]}
                coreColor="#ffffff"
                threadCount={3}
                spread={0.14}
                speed={0.1}
                frequency={3.8}
                position={0.43}
                pinch={0.72}
                falloff={0.65}
                opacity={0.65}
                brightness={0.75}
                grain={0}
                mask={desktop ? MASK_DESKTOP : MASK_MOBILE}
            />
        </div>
    );
}
