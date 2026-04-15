"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

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

export function ScrollIndicator() {
    return (
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30 pointer-events-none select-none"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
            <span className="text-[10px] uppercase tracking-[0.2em]">Odkryj</span>
            <ChevronDown size={20} />
        </motion.div>
    );
}
