"use client";

import { motion, Variants } from "framer-motion";

export function HeroText() {
    const line1 = "Twoi klienci oceniają Cię w 3 sekundy.";
    const line2 = "Zadbaj, żeby to co zobaczą, sprzedawało za Ciebie";

    const container: Variants = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            }
        }
    };

    const item: Variants = {
        hidden: { y: "130%", rotate: 2 },
        show: {
            y: "0%",
            rotate: 0,
            transition: { type: "spring", stiffness: 80, damping: 15, mass: 1 }
        }
    };

    return (
        <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight mb-8 text-white tracking-tight flex flex-col items-center"
        >
            <div className="flex flex-wrap justify-center">
                {line1.split(" ").map((word, i) => (
                    <span key={`line1-${i}`} className="overflow-hidden inline-block mr-[0.25em] pb-1">
                        <motion.span variants={item} className="inline-block origin-bottom-left">
                            {word}
                        </motion.span>
                    </span>
                ))}
            </div>
            <div className="flex flex-wrap justify-center mt-2 items-baseline">
                {line2.split(" ").map((word, i) => (
                    <span key={`line2-${i}`} className="overflow-hidden inline-block mr-[0.25em] pb-2">
                        <motion.span
                            variants={item}
                            className="inline-block origin-bottom-left bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent uppercase font-bold"
                        >
                            {word}
                        </motion.span>
                    </span>
                ))}
                <span className="overflow-hidden inline-block pb-2">
                    <motion.span
                        variants={item}
                        className="inline-block origin-bottom-left uppercase font-bold"
                        style={{ color: "#FFFBDB" }}
                    >
                        .
                    </motion.span>
                </span>
            </div>
        </motion.h1>
    );
}
