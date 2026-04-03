"use client";

import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export const MouseSpotlight = () => {
    const [isMouse, setIsMouse] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(pointer: fine)");
        setIsMouse(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMouse(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        if (!isMouse) return;
        const handleMouseMove = (e: MouseEvent) => {
            if (rafId.current !== null) return;
            rafId.current = requestAnimationFrame(() => {
                mouseX.set(e.clientX);
                mouseY.set(e.clientY);
                rafId.current = null;
            });
        };
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [mouseX, mouseY, isMouse]);

    if (!isMouse) return null;

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-30"
            style={{
                background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 235, 82, 0.035),
              transparent 80%
            )
          `,
            }}
        />
    );
};
