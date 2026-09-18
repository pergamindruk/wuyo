"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

// Orby ładowane tylko po hydracji, żeby nie blokować TBT
const LazyAmbientOrbs = dynamic(() => Promise.resolve(AmbientOrbsInner), { ssr: false });

const Spotlight = dynamic(() => import("@/components/ui/spotlight").then(m => ({ default: m.Spotlight })), { ssr: false });
const MouseSpotlight = dynamic(() => import("@/components/ui/mouse-spotlight").then(m => ({ default: m.MouseSpotlight })), { ssr: false });
const StatsCounter = dynamic(() => import("@/components/StatsCounter").then(m => ({ default: m.StatsCounter })), { ssr: false });

export function HeroClientEffects() {
    return (
        <>
            <MouseSpotlight />
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
            <Spotlight className="top-10 left-full md:right-40 md:top-20" fill="white" />
        </>
    );
}

export function HeroStats() {
    return <StatsCounter />;
}

// Wewnętrzny komponent — czyste CSS, zero JS na głównym wątku
function AmbientOrbsInner() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />
        </div>
    );
}

export function HeroAmbientOrbs() {
    return <LazyAmbientOrbs />;
}

export function HeroBackgroundText() {
    const ref = useRef<HTMLDivElement>(null);

    // Wielkie „WUYO" w tle odjeżdża i znika przy przewijaniu. Wcześniej liczyła
    // to biblioteka animacji; teraz jeden nasłuch przewijania wpisuje wartości
    // do zmiennych CSS, a rysuje przeglądarka. Pomiar raz na klatkę, żeby nie
    // liczyć przy każdym zdarzeniu przewijania.
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        let zaplanowane = false;

        const przelicz = () => {
            zaplanowane = false;
            const przewiniete = window.scrollY;
            const przesuniecie = -70 * Math.min(przewiniete / 600, 1);
            const krycie = 1 - Math.min(przewiniete / 350, 1);
            element.style.setProperty("--przesun", `${przesuniecie.toFixed(1)}px`);
            element.style.setProperty("--krycie", krycie.toFixed(3));
        };

        const naPrzewijanie = () => {
            if (zaplanowane) return;
            zaplanowane = true;
            requestAnimationFrame(przelicz);
        };

        przelicz();
        window.addEventListener("scroll", naPrzewijanie, { passive: true });
        return () => window.removeEventListener("scroll", naPrzewijanie);
    }, []);

    return (
        <div
            ref={ref}
            className="napis-w-tle absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden
        >
            <span
                className="font-black text-white/[0.028] tracking-tighter -rotate-6"
                style={{ fontSize: "clamp(8rem,22vw,20rem)", fontFamily: "var(--font-ava-meridian)" }}
            >
                WUYO
            </span>
        </div>
    );
}

export function ScrollIndicator() {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 pointer-events-none select-none scroll-indicator-bounce">
            <span className="text-[10px] uppercase tracking-[0.2em]">Odkryj</span>
            <ChevronDown size={20} />
        </div>
    );
}
