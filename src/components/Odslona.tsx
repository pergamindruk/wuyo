"use client";

import { CSSProperties, ReactNode } from "react";
import { useOdslona } from "@/lib/odslanianie";

interface OdslonaProps {
    children: ReactNode;
    className?: string;
    /** Z której strony wjeżdża treść. */
    kierunek?: "dol" | "lewo" | "brak";
    /** Opóźnienie w sekundach — do układania kafelków jeden po drugim. */
    opoznienie?: number;
    /** Jak głęboko w ekranie musi się znaleźć, zanim ruszy. */
    margines?: string;
    style?: CSSProperties;
    onClick?: () => void;
}

export function Odslona({
    children,
    className = "",
    kierunek = "dol",
    opoznienie = 0,
    margines,
    style,
    onClick,
}: OdslonaProps) {
    const ref = useOdslona<HTMLDivElement>(margines);

    return (
        <div
            ref={ref}
            onClick={onClick}
            style={opoznienie ? { transitionDelay: `${opoznienie}s`, ...style } : style}
            className={`odslon-el ${kierunek !== "brak" ? `odslon-${kierunek}` : ""} ${className}`}
        >
            {children}
        </div>
    );
}
