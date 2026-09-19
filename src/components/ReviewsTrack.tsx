"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Poziomy tor opinii. Same karty renderuje serwer i przychodzą tu jako dzieci —
 * treść opinii musi być w źródle strony, bo to ona pracuje na SEO.
 * Tutaj jest tylko przewijanie: strzałki dla myszy, gest dla palca,
 * a dla klawiatury sam kontener (strzałkami w bok po wejściu tabulatorem).
 */
export function ReviewsTrack({ children }: { children: ReactNode }) {
    const tor = useRef<HTMLDivElement>(null);
    const [naPoczatku, setNaPoczatku] = useState(true);
    const [naKoncu, setNaKoncu] = useState(false);

    const sprawdzPozycje = useCallback(() => {
        const el = tor.current;
        if (!el) return;
        // Margines 2 px na zaokrąglenia przy powiększeniu strony
        setNaPoczatku(el.scrollLeft <= 2);
        setNaKoncu(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    }, []);

    useEffect(() => {
        const el = tor.current;
        if (!el) return;
        sprawdzPozycje();
        el.addEventListener("scroll", sprawdzPozycje, { passive: true });
        window.addEventListener("resize", sprawdzPozycje);
        return () => {
            el.removeEventListener("scroll", sprawdzPozycje);
            window.removeEventListener("resize", sprawdzPozycje);
        };
    }, [sprawdzPozycje]);

    function przesun(kierunek: 1 | -1) {
        const el = tor.current;
        if (!el) return;
        // O szerokość jednej karty plus odstęp — bierzemy ją z pierwszego dziecka,
        // żeby nie powtarzać wymiarów, które i tak stoją w klasach.
        const karta = el.firstElementChild as HTMLElement | null;
        const krok = karta ? karta.offsetWidth + 16 : el.clientWidth * 0.8;
        el.scrollBy({ left: krok * kierunek, behavior: "smooth" });
    }

    return (
        <div className="relative">
            <div
                ref={tor}
                // tabIndex — obszar przewijany musi dać się obsłużyć z klawiatury,
                // inaczej jest nie do przejścia bez myszy
                tabIndex={0}
                role="region"
                aria-label="Opinie klientów, przewijane w poziomie"
                className="tor-opinii hide-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold/60 rounded-2xl"
            >
                {children}
            </div>

            {/* Strzałki tylko tam, gdzie jest mysz. Na telefonie przewija się palcem. */}
            <div className="hidden md:flex justify-end gap-2 mt-6 pr-[var(--margines-toru)]">
                <StrzalkaToru
                    kierunek="lewo"
                    wylaczona={naPoczatku}
                    onClick={() => przesun(-1)}
                />
                <StrzalkaToru
                    kierunek="prawo"
                    wylaczona={naKoncu}
                    onClick={() => przesun(1)}
                />
            </div>
        </div>
    );
}

function StrzalkaToru({
    kierunek,
    wylaczona,
    onClick,
}: {
    kierunek: "lewo" | "prawo";
    wylaczona: boolean;
    onClick: () => void;
}) {
    const Ikona = kierunek === "lewo" ? ChevronLeft : ChevronRight;
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={wylaczona}
            aria-label={kierunek === "lewo" ? "Poprzednie opinie" : "Następne opinie"}
            className="w-11 h-11 rounded-full border border-white/15 bg-navy-light/60 backdrop-blur-sm flex items-center justify-center text-white/70 transition-all hover:border-gold/50 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/15 disabled:hover:text-white/70"
        >
            <Ikona size={20} aria-hidden="true" />
        </button>
    );
}
