"use client";

import dynamic from "next/dynamic";
import "@/components/ui/web-threads.css";

// WebGL — tylko w przeglądarce, po hydracji. Nie blokuje LCP.
const WebThreads = dynamic(() => import("@/components/ui/web-threads"), { ssr: false, loading: () => null });

export function HeroWebThreads() {
    return (
        <div className="hero-threads-mask absolute inset-0 pointer-events-none z-0" aria-hidden>
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
            />
        </div>
    );
}
