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

const CARD_W = 336;
const CARD_H = 210;
const STEP = 142;    // odstęp między górnymi krawędziami; nakładanie = CARD_H - STEP = 68 px

// Łuk poziomy (∩ na osi X): środkowy kafelek wysuwa się w prawo, boczne cofają
const ARC_K = 9;
const ARC_MAX = CENTER * CENTER * ARC_K;        // = 81 px
const STRIP_H = CARD_H + (N - 1) * STEP;        // = 1062 px
const STRIP_W = CARD_W + ARC_MAX + 44;           // = 461 px

function arcX(i: number): number {
    const d = i - CENTER;
    return (CENTER * CENTER - d * d) * ARC_K;
}

function arcRotZ(i: number): number {
    return (i - CENTER) * 1.8; // –5.4° … +5.4° (wachlarz pionowy)
}

// ─── spring configs ───────────────────────────────────────────────────────────

const CARD_SPRING = { type: "spring" as const, stiffness: 120, damping: 22 };

// ─── komponent ────────────────────────────────────────────────────────────────

export function HeroProjectTiles() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            style={{ perspective: "1100px" }}
        >
            <div
                className="relative shrink-0"
                style={{ width: STRIP_W, height: STRIP_H }}
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
                                scale: isActive ? 1.18 : 1,
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
                                sizes="336px"
                                loading={i <= 2 ? "eager" : "lazy"}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
