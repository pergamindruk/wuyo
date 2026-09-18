"use client";

import { useEffect, useState } from "react";

/**
 * Trzyma element w drzewie przez czas animacji znikania — to samo, co robił
 * AnimatePresence z framer-motion, tylko na czystym CSS.
 *
 * `wDrzewie`  — czy element w ogóle renderować
 * `aktywny`   — czy jest w stanie „widoczny" (do sterowania klasą CSS)
 */
export function useMountTransition(widoczny: boolean, czasZnikaniaMs: number) {
    const [wDrzewie, setWDrzewie] = useState(widoczny);
    const [aktywny, setAktywny] = useState(widoczny);

    useEffect(() => {
        if (widoczny) {
            setWDrzewie(true);
            // Klatka przerwy, inaczej przeglądarka scali stan początkowy
            // i końcowy w jeden i przejście się nie odegra.
            const klatka = requestAnimationFrame(() => setAktywny(true));
            return () => cancelAnimationFrame(klatka);
        }

        setAktywny(false);
        const licznik = setTimeout(() => setWDrzewie(false), czasZnikaniaMs);
        return () => clearTimeout(licznik);
    }, [widoczny, czasZnikaniaMs]);

    return { wDrzewie, aktywny };
}
