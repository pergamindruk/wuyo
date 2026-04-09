"use client";

import dynamic from "next/dynamic";

const Spotlight = dynamic(() => import("@/components/ui/spotlight").then(m => ({ default: m.Spotlight })), { ssr: false });
const MouseSpotlight = dynamic(() => import("@/components/ui/mouse-spotlight").then(m => ({ default: m.MouseSpotlight })), { ssr: false });
const StatsCounter = dynamic(() => import("@/components/StatsCounter").then(m => ({ default: m.StatsCounter })), { ssr: false });

export function HeroClientEffects() {
    return (
        <>
            <MouseSpotlight />
            <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
            <Spotlight className="top-10 left-full md:right-40 md:top-20" fill="white" />
        </>
    );
}

export function HeroStats() {
    return <StatsCounter />;
}
