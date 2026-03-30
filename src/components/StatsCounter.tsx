"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [current, setCurrent] = useState(0);
    const [done, setDone] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref as React.RefObject<Element>, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;
        const duration = 1800;
        const startTime = performance.now();

        const tick = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCurrent(Math.round(eased * target));
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setDone(true);
            }
        };
        requestAnimationFrame(tick);
    }, [isInView, target]);

    return (
        <span
            ref={ref}
            className={`inline-block transition-[filter] duration-700 ${
                done ? "drop-shadow-[0_0_16px_rgba(255,235,82,0.65)]" : ""
            }`}
        >
            {current}{suffix}
        </span>
    );
}

export function StatsCounter() {
    return (
        <div className="flex items-stretch justify-center mt-14 gap-0">
            {/* Stat 1 */}
            <div className="flex flex-col items-center px-12 sm:px-20">
                <span className="text-6xl md:text-7xl font-bold text-gold leading-none mb-3 tabular-nums tracking-tight" style={{ fontFamily: "var(--font-ava-meridian)" }}>
                    <AnimatedNumber target={156} suffix="+" />
                </span>
                <span className="text-white/35 text-[10px] uppercase tracking-[0.25em]">projektów</span>
            </div>

            {/* Divider */}
            <div className="self-stretch w-px bg-white/10" />

            {/* Stat 2 */}
            <div className="flex flex-col items-center px-12 sm:px-20">
                <span className="text-6xl md:text-7xl font-bold text-gold leading-none mb-3 tabular-nums tracking-tight" style={{ fontFamily: "var(--font-ava-meridian)" }}>
                    <AnimatedNumber target={46} />
                </span>
                <span className="text-white/35 text-[10px] uppercase tracking-[0.25em]">branż</span>
            </div>
        </div>
    );
}
