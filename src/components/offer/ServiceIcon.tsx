// Ikony usług w sekcji „Oferta”. Rysowane linią, żeby dało się je „narysować”
// animacją, gdy dotrze do nich wiązka światła (patrz OfferBeam i style .offer-*).
// Same ścieżki <path> — pathLength="1" na prostokątach i kołach nie wszędzie działa.

export type ServiceIconName = "logo" | "www" | "print" | "apparel" | "social" | "design" | "automation";

/** Zaokrąglony prostokąt jako ścieżka. */
function rr(x: number, y: number, w: number, h: number, r: number) {
    return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
}

/** Koło jako ścieżka. */
function circle(cx: number, cy: number, r: number) {
    return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

/** Linia rysowana animacją. `i` = kolejność (opóźnienie). */
function D({ d, i = 0, className = "" }: { d: string; i?: number; className?: string }) {
    return <path d={d} pathLength={1} className={`ic-d ${className}`} style={{ ["--i" as string]: i }} />;
}

function LogoIcon() {
    return (
        <>
            <D d="M8 36C14 12 34 12 40 36" i={0} />
            <D d="M8 36L14 12" i={1} className="ic-thin" />
            <D d="M40 36L34 12" i={1} className="ic-thin" />
            <D d={rr(6, 34, 4, 4, 0.5)} i={2} />
            <D d={rr(38, 34, 4, 4, 0.5)} i={2} />
            <g className="ic-bob">
                <D d={circle(14, 12, 2)} i={3} />
            </g>
            <g className="ic-bob ic-bob-late">
                <D d={circle(34, 12, 2)} i={3} />
            </g>
        </>
    );
}

function WwwIcon() {
    return (
        <>
            <D d={rr(5, 9, 38, 30, 3)} i={0} />
            <D d="M5 16H43" i={1} />
            <D d="M9 12.5h.01M12.5 12.5h.01M16 12.5h.01" i={1} className="ic-dots" />
            <D d={rr(10, 20, 16, 3, 1.5)} i={2} />
            <D d="M10 27H28M10 30.5H22" i={2} className="ic-thin" />
            <g className="ic-tap">
                <D d="M30 25L30 35.5L32.8 32.8L35.2 37.6L37.2 36.6L34.8 31.9L38.6 31.6Z" i={3} />
            </g>
        </>
    );
}

function PrintIcon() {
    return (
        <>
            <D d="M15 18V8H33V18" i={0} />
            <D d={rr(8, 18, 32, 13, 3)} i={1} />
            <D d={circle(34, 22.5, 0.9)} i={2} className="ic-dots" />
            <D d="M13 27H35" i={2} />
            <g className="ic-sheet">
                <D d="M15 27V40H33V27" i={3} />
                <D d="M19 32H29M19 35.5H26" i={3} className="ic-thin" />
            </g>
        </>
    );
}

function ApparelIcon() {
    return (
        <>
            <D d="M17 8L10 11L5 18L10 22L13 19V40H35V19L38 22L43 18L38 11L31 8C29 11.5 19 11.5 17 8Z" i={0} />
            <g className="ic-pulse">
                <D d="M24 20L25.6 24.4L30 26L25.6 27.6L24 32L22.4 27.6L18 26L22.4 24.4Z" i={2} />
            </g>
        </>
    );
}

function SocialIcon() {
    return (
        <>
            <D d={rr(14, 5, 20, 38, 4)} i={0} />
            <D d="M21 9H27" i={1} className="ic-thin" />
            <g className="ic-beat">
                <D d="M24 31C17 26 17.5 19.5 21 19.5C22.8 19.5 24 21 24 22.3C24 21 25.2 19.5 27 19.5C30.5 19.5 31 26 24 31Z" i={2} />
            </g>
            <g className="ic-float">
                <D d="M38 14C35.5 12.3 35.7 10 37 10C37.6 10 38 10.5 38 11C38 10.5 38.4 10 39 10C40.3 10 40.5 12.3 38 14Z" i={3} className="ic-thin" />
            </g>
        </>
    );
}

function DesignIcon() {
    return (
        <>
            <D d="M24 10L39 17.5L24 25L9 17.5Z" i={0} />
            <D d="M9 17.5V32.5L24 40L39 32.5V17.5" i={1} />
            <D d="M24 25V40" i={1} />
            <D d="M16.5 13.75L31.5 21.25" i={2} className="ic-thin" />
            <g className="ic-twinkle">
                <D d="M41 3L42 6.5L45.5 7.5L42 8.5L41 12L40 8.5L36.5 7.5L40 6.5Z" i={3} className="ic-thin" />
            </g>
        </>
    );
}

function AutomationIcon() {
    return (
        <>
            <g className="ic-spin">
                <D d="M10.2 21.6A14 14 0 0 1 34.7 15" i={0} />
                <D d="M35 9L34.7 15L28.8 14.3" i={1} />
                <D d="M37.8 26.4A14 14 0 0 1 13.3 33" i={0} />
                <D d="M13 39L13.3 33L19.2 33.7" i={1} />
            </g>
            <g className="ic-pulse">
                <D d="M25.5 16L19.5 25H24.5L22.5 32L28.5 23H23.5Z" i={2} />
            </g>
        </>
    );
}

const ICONS: Record<ServiceIconName, () => React.JSX.Element> = {
    automation: AutomationIcon,
    logo: LogoIcon,
    www: WwwIcon,
    print: PrintIcon,
    apparel: ApparelIcon,
    social: SocialIcon,
    design: DesignIcon,
};

export function ServiceIcon({ name }: { name: ServiceIconName }) {
    const Icon = ICONS[name];
    return (
        <svg
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <Icon />
        </svg>
    );
}
