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

const CARD_W = 290;
const CARD_H = 182;
const STEP = 124;    // odstęp między górnymi krawędziami; nakładanie = CARD_H - STEP = 58 px

// Łuk poziomy (∩ na osi X): środkowy kafelek wysuwa się w prawo, boczne cofają
const ARC_K = 9;
const ARC_MAX = CENTER * CENTER * ARC_K;        // = 81 px
const STRIP_H = CARD_H + (N - 1) * STEP;        // = 926 px
const STRIP_W = CARD_W + ARC_MAX + 44;           // = 415 px

function arcX(i: number): number {
    const d = i - CENTER;
    return (CENTER * CENTER - d * d) * ARC_K;
}

function arcRotZ(i: number): number {
    return (i - CENTER) * 1.8; // –5.4° … +5.4° (wachlarz pionowy)
}

// ─── spring configs ───────────────────────────────────────────────────────────

const CARD_SPRING = { type: "spring" as const, stiffness: 160, damping: 22 };
const STRIP_SPRING = {
    type: "spring" as const,
    stiffness: 110,
    damping: 22,
    mass: 1.0,
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
                                x: isActive ? arcX(i) + 10 : arcX(i),
                                rotateZ: isActive ? dist * 0.5 : arcRotZ(i),
                                rotateY: isActive ? 1 : 5,
                                scale: isActive ? 1.07 : 1,
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
                                sizes="290px"
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
