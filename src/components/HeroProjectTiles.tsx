import Image from "next/image";
import { projects } from "@/lib/projects";

// Deterministic per-position transforms — each slot in the stack gets its own
// rotation + horizontal offset so the column flows diagonally like a stack of
// slides floating through space.
const CARD_VARIANTS = [
    { rotate: -7, x: -8 },
    { rotate: 6, x: 9 },
    { rotate: -4, x: 12 },
    { rotate: 9, x: -10 },
    { rotate: -10, x: 6 },
    { rotate: 4, x: -12 },
    { rotate: -6, x: 11 },
    { rotate: 8, x: -7 },
    { rotate: -3, x: 9 },
    { rotate: 7, x: -11 },
    { rotate: -8, x: 7 },
    { rotate: 5, x: -6 },
];

export function HeroProjectTiles() {
    // Duplicate the list so the upward translateY(-50%) animation loops seamlessly
    const doubled = [...projects, ...projects];

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Edge fades — top, bottom, and left so cards melt into the section bg */}
            <div className="absolute inset-x-0 top-0 h-40 z-20 pointer-events-none bg-gradient-to-b from-[#1c1b17] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-52 z-20 pointer-events-none bg-gradient-to-t from-[#1c1b17] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-16 z-20 pointer-events-none bg-gradient-to-r from-[#1c1b17] to-transparent" />

            {/* 3D perspective camera */}
            <div
                className="absolute inset-0"
                style={{
                    perspective: "1800px",
                    perspectiveOrigin: "65% 45%",
                }}
            >
                {/* Static 3D rotation — tilts the whole column like the Pinterest reference */}
                <div
                    className="absolute inset-0 flex justify-center"
                    style={{
                        transform: "rotateY(-22deg) rotateX(6deg) rotateZ(-3deg)",
                        transformStyle: "preserve-3d",
                    }}
                >
                    {/* Vertical infinite scroll */}
                    <div
                        className="flex flex-col gap-6 py-12"
                        style={{
                            animation: "tiles-scroll 42s linear infinite",
                            willChange: "transform",
                            width: "min(420px, 85%)",
                        }}
                    >
                        {doubled.map((project, i) => {
                            const v = CARD_VARIANTS[i % CARD_VARIANTS.length];
                            return (
                                // Outer: per-card translate + rotate (the diagonal stack)
                                <div
                                    key={`${project.id}-${i}`}
                                    className="shrink-0 w-full"
                                    style={{
                                        transform: `translateX(${v.x}%) rotateZ(${v.rotate}deg)`,
                                    }}
                                >
                                    {/* Inner: handles hover scale independently of the per-card rotation */}
                                    <div
                                        className="group relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#1c1b17] transition-transform duration-500 ease-out hover:scale-[1.06] hover:z-20"
                                        style={{
                                            aspectRatio: "16/10",
                                            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
                                        }}
                                    >
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="420px"
                                            loading={i < 2 ? "eager" : "lazy"}
                                        />
                                        {/* Subtle bottom gradient for legibility */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
