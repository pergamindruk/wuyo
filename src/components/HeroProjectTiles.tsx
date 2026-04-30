import Image from "next/image";
import { projects } from "@/lib/projects";

// 3 columns — evenly distribute 12 projects, each column duplicated for seamless loop
const COLS = [
    [0, 3, 6, 9],
    [1, 4, 7, 10],
    [2, 5, 8, 11],
].map(indices => indices.map(i => projects[i]).filter(Boolean));

// Different scroll speeds and negative delays so columns start at different phases
const COL_CONFIG = [
    { duration: 32, delay: "0s" },
    { duration: 24, delay: "-9s" },
    { duration: 28, delay: "-14s" },
];

export function HeroProjectTiles() {
    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Gradient masks */}
            <div className="absolute inset-x-0 top-0 h-40 z-10 pointer-events-none bg-gradient-to-b from-[#141310] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-52 z-10 pointer-events-none bg-gradient-to-t from-[#1c1b17] to-transparent" />
            <div className="absolute inset-y-0 left-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-[#1c1b17] to-transparent" />

            <div className="flex gap-3 h-full">
                {COLS.map((col, ci) => {
                    const doubled = [...col, ...col];
                    const { duration, delay } = COL_CONFIG[ci];
                    return (
                        <div key={ci} className="flex-1 overflow-hidden">
                            <div
                                className="flex flex-col gap-3"
                                style={{
                                    animation: `tiles-scroll ${duration}s linear ${delay} infinite`,
                                    willChange: "transform",
                                }}
                            >
                                {doubled.map((project, i) => (
                                    <div
                                        key={`${project.id}-${i}`}
                                        className="relative rounded-2xl overflow-hidden shrink-0 border border-white/[0.06]"
                                        style={{ aspectRatio: "3/4" }}
                                    >
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                            sizes="220px"
                                            loading={i < 3 ? "eager" : "lazy"}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#141310]/55 via-transparent to-transparent" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
