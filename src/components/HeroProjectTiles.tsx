"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { projects } from "@/lib/projects";

// ─── dane ────────────────────────────────────────────────────────────────────

const ITEMS = projects.slice(0, 7);
const N = ITEMS.length;
const CENTER = Math.floor(N / 2); // 3

// ─── geometria ───────────────────────────────────────────────────────────────

const CARD_W = 240;
const CARD_H = 150;
const STEP = 112;    // odstęp między górnymi krawędziami; nakładanie = CARD_H - STEP = 38 px

// Łuk poziomy (∩ na osi X): środkowy kafelek wysuwa się w prawo, boczne cofają
const ARC_K = 8;
const ARC_MAX = CENTER * CENTER * ARC_K;        // = 72 px
const STRIP_H = CARD_H + (N - 1) * STEP;        // = 822 px
const STRIP_W = CARD_W + ARC_MAX + 40;           // = 352 px

function arcX(i: number): number {
    const d = i - CENTER;
    return (CENTER * CENTER - d * d) * ARC_K;
}

function arcRotZ(i: number): number {
    return (i - CENTER) * 2.5; // –7.5° … +7.5° (wachlarz pionowy)
}

// ─── spring configs ───────────────────────────────────────────────────────────

const CARD_SPRING = { type: "spring" as const, stiffness: 280, damping: 24 };
const STRIP_SPRING = {
    type: "spring" as const,
    stiffness: 180,
    damping: 28,
    mass: 0.85,
};

// ─── komponent ────────────────────────────────────────────────────────────────

export function HeroProjectTiles() {
    const [hovered, setHovered] = useState<number | null>(null);

    // Przesuń wstęgę tak, by aktywny kafelek znalazł się w centrum
    const stripY = hovered !== null ? STEP * (CENTER - hovered) : 0;

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ perspective: "1100px" }}
        >
            {/* Wstęga pionowa – przesuwa się po osi Y przy hover */}
            <motion.div
                className="relative shrink-0"
                style={{ width: STRIP_W, height: STRIP_H }}
                animate={{ y: stripY }}
                transition={STRIP_SPRING}
            >
                {ITEMS.map((project, i) => {
                    const isActive = hovered === i;
                    const dist = i - CENTER;

                    return (
                        <motion.div
                            key={project.id}
                            className="absolute overflow-hidden cursor-pointer"
                            style={{
                                width: CARD_W,
                                height: CARD_H,
                                top: i * STEP,
                                left: 0,
                                borderRadius: 20,
                                zIndex: isActive ? 50 : N - Math.abs(Math.round(dist)),
                                boxShadow:
                                    "0 28px 60px -10px rgba(0,0,0,0.82), 0 0 0 1px rgba(255,255,255,0.07)",
                            }}
                            animate={{
                                // Kafelek wysuwa się bardziej w prawo przy hover
                                x: isActive ? arcX(i) + 10 : arcX(i),
                                // Przy hover spłaszcz rotację do subtelnej
                                rotateZ: isActive ? dist * 0.8 : arcRotZ(i),
                                // rotateY → efekt patrzenia z lewej
                                rotateY: isActive ? 2 : 8,
                                scale: isActive ? 1.09 : 1,
                            }}
                            transition={CARD_SPRING}
                            onHoverStart={() => setHovered(i)}
                            onHoverEnd={() => setHovered(null)}
                        >
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover"
                                sizes={`${CARD_W}px`}
                                loading={i <= 2 ? "eager" : "lazy"}
                            />

                            {/* Tytuł pojawia się przy hover */}
                            <motion.div
                                className="absolute inset-0 flex items-end p-3"
                                style={{
                                    background:
                                        "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 60%)",
                                }}
                                animate={{ opacity: isActive ? 1 : 0 }}
                                transition={{ duration: 0.18 }}
                            >
                                <span className="text-white text-xs font-semibold leading-tight truncate">
                                    {project.title}
                                </span>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
