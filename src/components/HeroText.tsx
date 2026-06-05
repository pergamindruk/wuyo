// Server component — h1 renders in HTML without waiting for JS
// Ż: CS Harley nie ma polskiego glifa — składamy Z + kropka pozycjonowana CSS

function ZWithDot({ color = "white" }: { color?: string }) {
    return (
        <span className="relative inline-block">
            Z
            <span
                aria-hidden="true"
                style={{
                    position: "absolute",
                    display: "block",
                    width: "0.13em",
                    height: "0.13em",
                    borderRadius: "50%",
                    background: color,
                    top: "-0.04em",
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
            />
        </span>
    );
}

export function HeroText() {
    return (
        <h1 className="mb-8 tracking-tight uppercase">
            <span
                className="hero-word block text-white font-cs-harley font-bold"
                style={{ fontSize: "clamp(36px, 11vw, 54px)", lineHeight: 1.0 }}
            >
                PIERWSZE
            </span>
            <span
                className="hero-word block text-white font-cs-harley font-bold"
                style={{ fontSize: "clamp(36px, 11vw, 54px)", lineHeight: 1.0, animationDelay: "0.05s" }}
                aria-label="WRAŻENIE"
            >
                <span aria-hidden="true">WRA<ZWithDot color="white" />ENIE</span>
            </span>
            <span
                className="hero-word block text-[#FFEB52] font-cs-harley font-normal mt-2"
                style={{ fontSize: "clamp(26px, 8.5vw, 42px)", lineHeight: 1.1, animationDelay: "0.10s" }}
            >
                MASZ TYLKO JEDNO.
            </span>
        </h1>
    );
}
