import React from "react";

const words = [
    { text: "Twoi", line: 1, style: "white" },
    { text: "klienci", line: 1, style: "white" },
    { text: "oceniają", line: 2, style: "white" },
    { text: "Cię", line: 2, style: "white" },
    { text: "w", line: 2, style: "white" },
    { text: "3", line: 2, style: "white" },
    { text: "sekundy", line: 2, style: "white" },
    { text: "Zadbaj,", line: 3, style: "gold" },
    { text: "żeby", line: 3, style: "gold" },
    { text: "to", line: 3, style: "gold" },
    { text: "co", line: 3, style: "gold" },
    { text: "zobaczą,", line: 3, style: "gold" },
    { text: "sprzedawało", line: 4, style: "gold" },
    { text: "za", line: 4, style: "gold" },
    { text: "Ciebie", line: 4, style: "gold" },
];

const goldClass = "bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent uppercase font-bold";

export function HeroText() {
    const lines = [1, 2, 3, 4];

    return (
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-medium leading-tight mb-8 text-white tracking-tight flex flex-col items-center">
            {lines.map((lineNum) => (
                <div key={lineNum} className={`flex flex-wrap justify-center${lineNum >= 3 ? " mt-2" : ""}`}>
                    {words
                        .filter((w) => w.line === lineNum)
                        .map((w, i) => {
                            const globalIdx = words.filter((x) => x.line < lineNum).length + i;
                            return (
                                <span
                                    key={i}
                                    className={`inline-block mr-[0.25em] pb-1 hero-word${w.style === "gold" ? ` ${goldClass}` : ""}`}
                                    style={{ animationDelay: `${globalIdx * 0.04}s` }}
                                >
                                    {w.text}
                                </span>
                            );
                        })}
                </div>
            ))}
        </h1>
    );
}
