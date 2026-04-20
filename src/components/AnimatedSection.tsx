"use client";

import { motion } from "framer-motion";
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
    const initial = hero ? { opacity: 1, y: 20 } : { opacity: 0, y: 50 };
    const target = hero ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 };

    const animationProps = animateOnMount
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, margin: "-100px" } };

    return (
        <motion.div
            id={id}
            initial={initial}
            {...animationProps}
            transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
}
