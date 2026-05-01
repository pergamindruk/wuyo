"use client";

import { useRef, useState } from "react";
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
const STEP = 142;

const ARC_K = 9;
const ARC_MAX = CENTER * CENTER * ARC_K;
const STRIP_H = CARD_H + (N - 1) * STEP;
const STRIP_W = CARD_W + ARC_MAX + 44;

const PUSH = 32; // ile pikseli sąsiednie karty odsuwają się od hovered

function arcX(i: number): number {
    const d = i - CENTER;
    return (CENTER * CENTER - d * d) * ARC_K;
}

function arcRotZ(i: number): number {
    return (i - CENTER) * 1.8;
}

// ─── spring config ────────────────────────────────────────────────────────────

const CARD_SPRING = { type: "spring" as const, stiffness: 120, damping: 22 };

// ─── komponent ────────────────────────────────────────────────────────────────

export function HeroProjectTiles() {
    const [hovered, setHovered] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Dla kart sąsiednich: rozsuń o PUSH × odległość.
    // Dla hovered: dopchaj do widoku jeśli jest obcięta (skrajne karty).
    function cardY(i: number): number {
        if (hovered === null) return 0;

        if (i !== hovered) return (i - hovered) * PUSH;

        // Oblicz o ile hovered karta jest obcięta przez overflow-hidden
        const h = containerRef.current?.clientHeight ?? 0;
        if (!h) return 0;
        const stripTop = (h - STRIP_H) / 2;
        const cardTop = stripTop + i * STEP;
        const cardBot = cardTop + CARD_H;
        const PAD = 12;

        if (cardTop < PAD) return PAD - cardTop;        // karta obcięta u góry → przesuń w dół
        if (cardBot > h - PAD) return (h - PAD) - cardBot; // obcięta u dołu → przesuń w górę
        return 0;
    }

    return (
        <div
            ref={containerRef}
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
                                y: cardY(i),
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
