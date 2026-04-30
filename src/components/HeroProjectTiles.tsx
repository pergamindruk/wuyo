"use client";

import Image from "next/image";
import { useState } from "react";
import { projects } from "@/lib/projects";

// Subtle per-card variations — each slot in the column gets a small rotation
// and horizontal nudge so the stack feels like organic floating slides rather
// than a rigid list. Kept gentle (±5°) per "less dynamic" request.
const CARD_VARIANTS = [
    { rotate: -3, x: -4 },
    { rotate: 4, x: 3 },
    { rotate: -2, x: 5 },
    { rotate: 5, x: -3 },
    { rotate: -4, x: 2 },
    { rotate: 2, x: -5 },
    { rotate: -3, x: 4 },
    { rotate: 4, x: -2 },
    { rotate: -2, x: 3 },
    { rotate: 3, x: -4 },
    { rotate: -4, x: 2 },
    { rotate: 2, x: -3 },
];

export function HeroProjectTiles() {
    const [paused, setPaused] = useState(false);
    // Duplicate the list so the upward translateY(-50%) animation loops seamlessly
    const doubled = [...projects, ...projects];

    return (
        <div
            className="relative h-full w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    perspective: "2200px",
                    perspectiveOrigin: "50% 35%",
                }}
            >
                {/* Strong top-down camera pose — slides laid out below the viewer */}
                <div
                    className="absolute inset-0 flex justify-center"
                    style={{
                        transform: "rotateX(48deg) rotateZ(-14deg)",
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Slow vertical scroll; pauses while the user hovers any card */}
                    <div
                        className="flex flex-col gap-10 py-16"
                        style={{
                            animation: "tiles-scroll 110s linear infinite",
                            animationPlayState: paused ? "paused" : "running",
                            willChange: "transform",
                            width: "min(420px, 90%)",
                        }}
                    >
                        {doubled.map((project, i) => {
                            const v = CARD_VARIANTS[i % CARD_VARIANTS.length];
                            return (
                                // Outer: per-card translate + rotate (organic stack)
                                <div
                                    key={`${project.id}-${i}`}
                                    className="shrink-0 w-full"
                                    style={{
                                        transform: `translateX(${v.x}%) rotateZ(${v.rotate}deg)`,
                                    }}
                                >
                                    {/* Inner: hover scale, isolated from per-card rotation */}
                                    <div
                                        className="group relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#1c1b17] transition-transform duration-700 ease-out hover:scale-[1.04]"
                                        style={{
                                            aspectRatio: "16/10",
                                            boxShadow:
                                                "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                            sizes="420px"
                                            loading={i < 2 ? "eager" : "lazy"}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
