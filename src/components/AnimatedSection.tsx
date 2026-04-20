"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    delay?: number;
    animateOnMount?: boolean;
    /** Tryb hero: startuje z opacity:1 (widoczny od razu dla LCP), animuje tylko Y */
    hero?: boolean;
}

export function AnimatedSection({ children, className = "", id, delay = 0, animateOnMount = false, hero = false }: AnimatedSectionProps) {
    const shouldReduceMotion = useReducedMotion();

    // opacity zawsze 1 — treść dostępna dla AT i crawlerów; animujemy tylko Y
    const initial = { opacity: 1, y: shouldReduceMotion ? 0 : (hero ? 20 : 50) };
    const target = { opacity: 1, y: 0 };

    const animationProps = animateOnMount
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, margin: "-100px" } };

    return (
        <motion.div
            id={id}
            initial={initial}
            {...animationProps}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
