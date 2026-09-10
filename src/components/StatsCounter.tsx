"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

type StatProps = {
    target: number;
    suffix?: string;
    /** Liczba miejsc po przecinku — 1 dla oceny „5,0”, 0 dla liczb całkowitych. */
    decimals?: number;
    /** Opóźnienie startu w ms. Liczniki ruszają po kolei, nie wszystkie naraz. */
    delay?: number;
};

/** Formatowanie po polsku: przecinek dziesiętny, spacja jako separator tysięcy. */
function format(value: number, decimals: number): string {
    return value.toLocaleString("pl-PL", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

function AnimatedNumber({ target, suffix = "", decimals = 0, delay = 0 }: StatProps) {
    const reduceMotion = useReducedMotion();
    const [current, setCurrent] = useState(reduceMotion ? target : 0);
    const [phase, setPhase] = useState<"idle" | "counting" | "done">(reduceMotion ? "done" : "idle");
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView || reduceMotion) return;

        let frame = 0;
        const duration = 2200;

        // Hero jest nad zgięciem, więc bez opóźnienia całe odliczanie leci, zanim
        // ktokolwiek zdąży na nie spojrzeć. Krótka pauza sprawia, że widać ruch.
        const timer = window.setTimeout(() => {
            setPhase("counting");
            const startTime = performance.now();

            const tick = (now: number) => {
                const progress = Math.min((now - startTime) / duration, 1);
                // expo-out: szybki start, długie, miękkie wyhamowanie na końcu
                const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                setCurrent(eased * target);
                if (progress < 1) {
                    frame = requestAnimationFrame(tick);
                } else {
                    setCurrent(target);
                    setPhase("done");
                }
            };
            frame = requestAnimationFrame(tick);
        }, delay);

        return () => {
            window.clearTimeout(timer);
            cancelAnimationFrame(frame);
        };
    }, [isInView, target, delay, reduceMotion]);

    return (
        <span
            ref={ref}
            className="relative inline-block stat-number"
            data-phase={phase}
            // aria-label podaje wartość końcową, żeby czytnik ekranu nie recytował
            // każdej klatki odliczania.
            aria-label={`${format(target, decimals)}${suffix}`}
        >
            {/* Niewidoczna wartość końcowa rezerwuje szerokość. Bez niej licznik
                rośnie z „0" do „156" i co klatkę przestawia szerokość kolumny,
                przez co trzęsie się cały hero razem z kafelkami realizacji. */}
            <span aria-hidden="true" className="invisible">
                {format(target, decimals)}
                {suffix}
            </span>
            <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
            >
                {format(current, decimals)}
                {suffix}
            </span>
        </span>
    );
}

const STATS: Array<{ value: StatProps; label: string }> = [
    { value: { target: 100, suffix: "%", delay: 350 }, label: "praw do projektu" },
    { value: { target: 24, suffix: "h", delay: 550 }, label: "na wycenę" },
    { value: { target: 5, decimals: 1, delay: 750 }, label: "ocena w Google" },
];

export function StatsCounter() {
    return (
        <div className="flex items-stretch justify-center mt-14 [contain:layout]">
            {STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-stretch">
                    {i > 0 && <div className="self-stretch w-px bg-white/10" aria-hidden="true" />}
                    <div className="flex flex-col items-center px-5 sm:px-10 md:px-14">
                        <span
                            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gold leading-none mb-3 tabular-nums tracking-tight"
                            style={{ fontFamily: "var(--font-ava-meridian)" }}
                        >
                            <AnimatedNumber {...stat.value} />
                        </span>
                        <span className="text-white/35 text-[10px] uppercase tracking-[0.25em] whitespace-nowrap">
                            {stat.label}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
