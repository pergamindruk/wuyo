"use client";

import { ReactNode } from "react";
import { useOdslona } from "@/lib/odslanianie";

interface OdslonaProps {
    children: ReactNode;
    className?: string;
    /** Z której strony wjeżdża treść. */
    kierunek?: "dol" | "lewo";
    /** Opóźnienie w sekundach — do układania kafelków jeden po drugim. */
    opoznienie?: number;
    /** Jak głęboko w ekranie musi się znaleźć, zanim ruszy. */
    margines?: string;
}

export function Odslona({
    children,
    className = "",
    kierunek = "dol",
    opoznienie = 0,
    margines,
}: OdslonaProps) {
    const ref = useOdslona<HTMLDivElement>(margines);

    return (
        <div
            ref={ref}
            style={opoznienie ? { transitionDelay: `${opoznienie}s` } : undefined}
            className={`odslon-el odslon-${kierunek} ${className}`}
        >
            {children}
        </div>
    );
}
