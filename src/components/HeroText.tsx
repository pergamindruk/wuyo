// Server component — h1 renderuje się w HTML bez czekania na JS
// Animacje przez CSS aby nie blokować LCP

const goldClass = "bg-gradient-to-r from-[#FFEB52] to-[#e5d34a] bg-clip-text text-transparent uppercase font-bold";

const lines: { words: string[]; style: "white" | "gold" }[] = [
    { words: ["Twoi klienci"],                          style: "white" },
    { words: ["oceniają Cię"],                          style: "white" },
    { words: ["w 3 sekundy"],                           style: "white" },
    { words: ["Zadbaj,", "żeby", "to", "co", "zobaczył,", "sprzedawało"], style: "gold"  },
    { words: ["za", "Ciebie"],                          style: "gold"  },
];

export function HeroText() {
    let idx = 0;

    return (
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8 text-white tracking-tight flex flex-col items-center">
            {lines.map((line, li) => (
                <div key={li} className={`flex flex-wrap justify-center${li >= 3 ? " mt-2" : ""}`}>
                    {line.words.map((word) => {
                        const delay = (idx++ * 0.045).toFixed(3);
                        return (
                            <span
                                key={word + delay}
                                className={`inline-block mr-[0.25em] pb-1 hero-word${line.style === "gold" ? ` ${goldClass}` : " font-heading"}`}
                                style={{ animationDelay: `${delay}s` }}
                            >
                                {word}
                            </span>
                        );
                    })}
                </div>
            ))}
        </h1>
    );
}
