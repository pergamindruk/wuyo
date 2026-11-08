"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Prędkość samego przewijania, w pikselach na sekundę. */
const PREDKOSC = 28;
/** Ile ms po ruchu użytkownika tor rusza znowu sam. */
const PAUZA_PO_RUCHU = 4000;

/**
 * Poziomy tor opinii. Same karty renderuje serwer i przychodzą tu jako dzieci —
 * treść opinii musi być w źródle strony, bo to ona pracuje na SEO.
 *
 * Tor powoli jedzie sam w kółko, żeby strona „żyła”. Do pętli potrzebna jest
 * druga kopia kart — dokładamy ją dopiero w przeglądarce, ukrytą przed czytnikami
 * (inert + aria-hidden), więc w HTML każda opinia jest jeden raz.
 * Staje, gdy ktoś najedzie myszką, dotknie palcem, przewinie albo kliknie strzałkę,
 * gdy tor nie jest widoczny i gdy system prosi o mniej ruchu.
 */
export function ReviewsTrack({ children }: { children: ReactNode }) {
    const tor = useRef<HTMLDivElement>(null);
    const kopia = useRef<HTMLDivElement>(null);
    const [petla, setPetla] = useState(false);
    const [naPoczatku, setNaPoczatku] = useState(true);
    const [naKoncu, setNaKoncu] = useState(false);

    // Wspólny stan animacji — w refach, żeby nie renderować co klatkę.
    const pozycja = useRef(0);
    const wstrzymanyDo = useRef(0);
    const najechany = useRef(false);
    const widoczny = useRef(false);

    /** Szerokość jednego kompletu kart = miejsce, gdzie zaczyna się kopia. */
    const dlugoscKompletu = useCallback(() => {
        const el = tor.current;
        const pierwszaKopia = kopia.current?.firstElementChild as HTMLElement | null;
        const pierwsza = el?.firstElementChild as HTMLElement | null;
        if (!el || !pierwszaKopia || !pierwsza) return 0;
        return pierwszaKopia.offsetLeft - pierwsza.offsetLeft;
    }, []);

    const sprawdzPozycje = useCallback(() => {
        const el = tor.current;
        if (!el) return;
        // Przy pętli wracamy niezauważalnie o jeden komplet — także przy ręcznym przewijaniu.
        const komplet = dlugoscKompletu();
        if (komplet > 0 && el.scrollLeft >= komplet) {
            el.scrollLeft -= komplet;
            pozycja.current = el.scrollLeft;
        }
        // Margines 2 px na zaokrąglenia przy powiększeniu strony
        setNaPoczatku(komplet > 0 ? false : el.scrollLeft <= 2);
        setNaKoncu(komplet > 0 ? false : el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    }, [dlugoscKompletu]);

    // Kopia kart dopiero po załadowaniu i tylko, gdy wolno animować.
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        setPetla(true);
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
    }, [sprawdzPozycje, petla]);

    // Samo przewijanie
    useEffect(() => {
        const el = tor.current;
        if (!el || !petla) return;

        const wstrzymaj = () => {
            wstrzymanyDo.current = performance.now() + PAUZA_PO_RUCHU;
        };
        const naWejscie = () => { najechany.current = true; };
        const naWyjscie = () => { najechany.current = false; };

        el.addEventListener("pointerenter", naWejscie);
        el.addEventListener("pointerleave", naWyjscie);
        el.addEventListener("pointerdown", wstrzymaj);
        el.addEventListener("wheel", wstrzymaj, { passive: true });
        el.addEventListener("touchstart", wstrzymaj, { passive: true });
        el.addEventListener("focusin", wstrzymaj);

        const obserwator = new IntersectionObserver(([wpis]) => {
            widoczny.current = wpis.isIntersecting;
        });
        obserwator.observe(el);

        pozycja.current = el.scrollLeft;
        let poprzednia = performance.now();
        let klatka = requestAnimationFrame(function krok(teraz) {
            const dt = Math.min(teraz - poprzednia, 64);
            poprzednia = teraz;
            const stoi =
                najechany.current ||
                !widoczny.current ||
                document.hidden ||
                teraz < wstrzymanyDo.current;

            if (stoi) {
                // Użytkownik mógł przewinąć — zaczynamy od miejsca, gdzie zostawił.
                pozycja.current = el.scrollLeft;
            } else {
                // Ktoś przesunął tor inaczej (klawiatura, pasek) — jedziemy dalej od tego miejsca.
                if (Math.abs(el.scrollLeft - pozycja.current) > 2) pozycja.current = el.scrollLeft;
                pozycja.current += (PREDKOSC * dt) / 1000;
                const komplet = dlugoscKompletu();
                if (komplet > 0 && pozycja.current >= komplet) pozycja.current -= komplet;
                el.scrollLeft = pozycja.current;
            }
            klatka = requestAnimationFrame(krok);
        });

        return () => {
            cancelAnimationFrame(klatka);
            obserwator.disconnect();
            el.removeEventListener("pointerenter", naWejscie);
            el.removeEventListener("pointerleave", naWyjscie);
            el.removeEventListener("pointerdown", wstrzymaj);
            el.removeEventListener("wheel", wstrzymaj);
            el.removeEventListener("touchstart", wstrzymaj);
            el.removeEventListener("focusin", wstrzymaj);
        };
    }, [petla, dlugoscKompletu]);

    function przesun(kierunek: 1 | -1) {
        const el = tor.current;
        if (!el) return;
        wstrzymanyDo.current = performance.now() + PAUZA_PO_RUCHU;
        // O szerokość jednej karty plus odstęp — bierzemy ją z pierwszego dziecka,
        // żeby nie powtarzać wymiarów, które i tak stoją w klasach.
        const karta = el.firstElementChild as HTMLElement | null;
        const krok = karta ? karta.offsetWidth + 16 : el.clientWidth * 0.8;
        // Na początku pętli „w lewo” skacze najpierw na tę samą kartę w kopii.
        const komplet = dlugoscKompletu();
        if (kierunek === -1 && komplet > 0 && el.scrollLeft < krok) el.scrollLeft += komplet;
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
                // Przyciąganie do kart tylko bez pętli — walczyłoby z płynnym przesuwaniem.
                className={`tor-opinii hide-scrollbar flex gap-4 overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold/60 rounded-2xl ${petla ? "" : "snap-x snap-mandatory"}`}
            >
                {children}
                {petla && (
                    <div ref={kopia} className="contents" aria-hidden="true" inert>
                        {children}
                    </div>
                )}
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
