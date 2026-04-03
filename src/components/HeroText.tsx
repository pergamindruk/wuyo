"use client";

import { motion, Variants } from "framer-motion";

export function HeroText() {
    const line1 = "Twoi klienci";
    const line2 = "oceniają Cię w 3 sekundy";
    const line3 = "Zadbaj, żeby to co zobaczą,";
    const line4 = "sprzedawało za Ciebie";

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
        hidden: { y: 16, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 80, damping: 15, mass: 1 }
        }
    };

    const renderWords = (line: string, keyPrefix: string, className: string) =>
        line.split(" ").map((word, i) => (
            <span key={`${keyPrefix}-${i}`} className="inline-block mr-[0.25em] pb-1">
                <motion.span variants={item} className={`inline-block origin-bottom-left ${className}`}>
                    {word}
                </motion.span>
            </span>
        ));

    const whiteStyle = "";
    const goldStyle = "bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent uppercase font-bold";

    return (
        <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight mb-8 text-white tracking-tight flex flex-col items-center"
        >
            <div className="flex flex-wrap justify-center">
                {renderWords(line1, "line1", whiteStyle)}
            </div>
            <div className="flex flex-wrap justify-center">
                {renderWords(line2, "line2", whiteStyle)}
            </div>
            <div className="flex flex-wrap justify-center mt-2">
                {renderWords(line3, "line3", goldStyle)}
            </div>
            <div className="flex flex-wrap justify-center">
                {renderWords(line4, "line4", goldStyle)}
            </div>
        </motion.h1>
    );
}
