"use client";

import { motion, useReducedMotion } from "framer-motion";

const words = [
    { text: "Twoi klienci", line: 1, style: "white" },
    { text: "oceniają Cię", line: 2, style: "white" },
    { text: "w 3 sekundy", line: 3, style: "white" },
    { text: "Zadbaj,", line: 4, style: "gold" },
    { text: "żeby", line: 4, style: "gold" },
    { text: "to", line: 4, style: "gold" },
    { text: "co", line: 4, style: "gold" },
    { text: "zobaczą,", line: 4, style: "gold" },
    { text: "sprzedawało", line: 5, style: "gold" },
    { text: "za", line: 5, style: "gold" },
    { text: "Ciebie", line: 5, style: "gold" },
];

const goldClass = "bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent uppercase font-bold";

export function HeroText() {
    const shouldReduceMotion = useReducedMotion();
    const lines = [1, 2, 3, 4, 5];

    return (
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8 text-white tracking-tight flex flex-col items-center">
            {lines.map((lineNum) => (
                <div key={lineNum} className={`flex flex-wrap justify-center${lineNum >= 4 ? " mt-2" : ""}`}>
                    {words
                        .filter((w) => w.line === lineNum)
                        .map((w, i) => {
                            const globalIdx = words.filter((x) => x.line < lineNum).length + i;
                            return (
                                <motion.span
                                    key={i}
                                    className={`inline-block mr-[0.25em] pb-1${w.style === "gold" ? ` ${goldClass}` : ""}`}
                                    initial={shouldReduceMotion ? false : { y: 18 }}
                                    animate={{ y: 0 }}
                                    transition={{
                                        delay: globalIdx * 0.045,
                                        duration: 0.55,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                >
                                    {w.text}
                                </motion.span>
                            );
                        })}
                </div>
            ))}
        </h1>
    );
}
