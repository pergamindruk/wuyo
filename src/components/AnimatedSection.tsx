"use client";

import { ReactNode, useEffect, useRef } from "react";
import { useOdslona } from "@/lib/odslanianie";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    delay?: number;
    animateOnMount?: boolean;
    /** Tryb hero: mniejszy dystans, żeby pierwszy ekran nie skakał */
    hero?: boolean;
}

export function AnimatedSection({
    children,
    className = "",
    id,
    delay = 0,
    animateOnMount = false,
    hero = false,
}: AnimatedSectionProps) {
    // Sekcje odsłaniane przewijaniem podpinają się pod wspólny obserwator;
    // te animowane od razu po wejściu na stronę nie potrzebują go wcale.
    const refObserwowany = useOdslona<HTMLDivElement>();
    const refOdRazu = useRef<HTMLDivElement>(null);
    const ref = animateOnMount ? refOdRazu : refObserwowany;

    useEffect(() => {
        if (!animateOnMount) return;
        const element = refOdRazu.current;
        if (!element) return;
        // Klatka przerwy, inaczej przeglądarka scali oba stany w jeden
        // i przejście w ogóle się nie odegra.
        const klatka = requestAnimationFrame(() => element.classList.add("odslon-gotowe"));
        return () => cancelAnimationFrame(klatka);
    }, [animateOnMount]);

    return (
        <div
            ref={ref}
            id={id}
            data-odslon={hero ? "hero" : undefined}
            style={delay ? { transitionDelay: `${delay}s` } : undefined}
            className={`odslon w-full ${className}`}
        >
            {children}
        </div>
    );
}
