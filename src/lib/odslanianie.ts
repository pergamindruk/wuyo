"use client";

import { useEffect, useRef } from "react";

/**
 * Odsłanianie elementów przy przewijaniu — to, co wcześniej robił framer-motion
 * przez `whileInView`. Sama animacja siedzi w CSS, tutaj jest tylko moment,
 * w którym element dostaje klasę `odslon-gotowe`.
 *
 * Obserwatory trzymamy po jednym na margines, wspólne dla całej strony.
 * Wcześniej każda z ponad stu animowanych sekcji miała własny komponent
 * biblioteki animacji.
 */
const obserwatory = new Map<string, IntersectionObserver>();

function dajObserwatora(margines: string): IntersectionObserver {
    const gotowy = obserwatory.get(margines);
    if (gotowy) return gotowy;

    const obserwator = new IntersectionObserver(
        (wpisy) => {
            for (const wpis of wpisy) {
                if (!wpis.isIntersecting) continue;
                wpis.target.classList.add("odslon-gotowe");
                // raz odsłonięte zostaje odsłonięte — odpowiednik viewport.once
                obserwator.unobserve(wpis.target);
            }
        },
        { rootMargin: margines },
    );

    obserwatory.set(margines, obserwator);
    return obserwator;
}

/** Zwraca ref do podpięcia pod element, który ma się odsłonić przy przewijaniu. */
export function useOdslona<T extends HTMLElement>(margines = "-100px") {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const obserwator = dajObserwatora(margines);
        obserwator.observe(element);
        return () => obserwator.unobserve(element);
    }, [margines]);

    return ref;
}
