"use client";

import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { projects } from "@/lib/projects";

// 3D coverflow-style carousel: cards arranged on a cylinder rotating around
// the Y axis. The viewer sees the front half-circle of cards. Continuous
// auto-rotation; hovering a card smoothly rotates the carousel so that card
// becomes the focal point at the front.

const COUNT = projects.length;
const ANGLE_STEP = 360 / COUNT;
const RADIUS = 300;        // px — distance from axis
const CARD_W = 240;
const CARD_H = 300;        // 4:5 portrait, similar to mockups
const ROTATION_DURATION = 55; // seconds for a full revolution

export function HeroProjectTiles() {
    const rotateY = useMotionValue(0);
    const [focus, setFocus] = useState<number | null>(null);

    useEffect(() => {
        if (focus !== null) {
            // Rotate to put `focus` card at angle 0 (front), via shortest path
            const targetRaw = -focus * ANGLE_STEP;
            const current = rotateY.get();
            const delta = ((targetRaw - current) % 360 + 540) % 360 - 180;
            const controls = animate(rotateY, current + delta, {
                type: "spring",
                stiffness: 70,
                damping: 18,
            });
            return () => controls.stop();
        }
        // Resume continuous rotation from current angle
        const start = rotateY.get();
        const controls = animate(rotateY, start - 360, {
            duration: ROTATION_DURATION,
            ease: "linear",
            repeat: Infinity,
        });
        return () => controls.stop();
    }, [focus, rotateY]);

    return (
        <div
            className="relative h-full w-full"
            style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
        >
            {/* Rotating carousel — width/height 0 so children orbit around the centre */}
            <motion.div
                className="absolute top-1/2 left-1/2"
                style={{
                    rotateY,
                    transformStyle: "preserve-3d",
                    width: 0,
                    height: 0,
                }}
            >
                {projects.map((p, i) => (
                    <div
                        key={p.id}
                        className="absolute rounded-2xl overflow-hidden border border-white/10 cursor-pointer group bg-[#1c1b17] transition-[box-shadow,filter] duration-500"
                        style={{
                            width: CARD_W,
                            height: CARD_H,
                            top: -CARD_H / 2,
                            left: -CARD_W / 2,
                            transform: `rotateY(${i * ANGLE_STEP}deg) translateZ(${RADIUS}px)`,
                            backfaceVisibility: "hidden",
                            boxShadow:
                                "0 30px 60px -20px rgba(0,0,0,0.55), 0 10px 25px -10px rgba(0,0,0,0.4)",
                        }}
                        onMouseEnter={() => setFocus(i)}
                        onMouseLeave={() => setFocus(null)}
                    >
                        <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                            sizes="280px"
                            loading={i < 3 ? "eager" : "lazy"}
                        />
                        {/* Soft inner highlight for legibility */}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl pointer-events-none" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
