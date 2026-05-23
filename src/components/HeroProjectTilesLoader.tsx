"use client";

import dynamic from "next/dynamic";

// Ładowane dopiero po hydracji — nie blokuje LCP/TBT na desktopie
const HeroProjectTilesInner = dynamic(
    () => import("@/components/HeroProjectTiles").then(m => ({ default: m.HeroProjectTiles })),
    { ssr: false, loading: () => null }
);

export function HeroProjectTilesLoader() {
    return <HeroProjectTilesInner />;
}
