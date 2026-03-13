"use client";

import { useMotionValue, useMotionTemplate, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export const MouseSpotlight = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Throttle przez requestAnimationFrame – jeden update na klatkę animacji max
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
    }, [mouseX, mouseY]);

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
