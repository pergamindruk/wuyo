"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { localeFromPath } from "@/lib/i18n";

const TELEFON = "+48725182053";
const WHATSAPP = "https://wa.me/48725182053";

/**
 * Stały pasek kontaktu na telefonie.
 *
 * Formularz jest na dole strony, więc klient, który zdecydował się w połowie
 * czytania, musiałby przewijać do końca. Pasek daje mu kontakt bez przewijania.
 *
 * Pojawia się dopiero po opuszczeniu sekcji hero — na samej górze klient ma
 * przyciski w treści i nie warto mu zasłaniać ekranu. Znika przy formularzu
 * kontaktowym i przy stopce, żeby nie dublować tego, co i tak ma przed oczami.
 *
 * Pasek zgłasza swoją wysokość przez zmienną --mobile-bar-h, dzięki czemu
 * dymek chatbota podnosi się dokładnie o tyle, ile trzeba, zamiast chować się
 * pod paskiem.
 */
export function MobileContactBar() {
    const locale = localeFromPath(usePathname());
    const [widoczny, setWidoczny] = useState(false);
    const pasekRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const kontakt = document.getElementById("kontakt");
        const stopka = document.querySelector("footer");

        const wZasiegu = (el: Element | null) => {
            if (!el) return false;
            const box = el.getBoundingClientRect();
            return box.top < window.innerHeight && box.bottom > 0;
        };

        const przelicz = () => {
            const poHero = window.scrollY > window.innerHeight * 0.9;

            // Formularz w zasięgu wzroku — pasek jest wtedy zbędny.
            const przyFormularzu = wZasiegu(kontakt);
            // Stopka ma własne WhatsApp, mail i telefon, a pasek leżał na jej
            // ostatnim wierszu i zasłaniał „Politykę prywatności" i „Ustawienia ciasteczek".
            const przyStopce = wZasiegu(stopka);

            setWidoczny(poHero && !przyFormularzu && !przyStopce);
        };

        przelicz();
        window.addEventListener("scroll", przelicz, { passive: true });
        window.addEventListener("resize", przelicz);
        return () => {
            window.removeEventListener("scroll", przelicz);
            window.removeEventListener("resize", przelicz);
        };
    }, []);

    // Wysokość mierzona z DOM, a nie wpisana na sztywno — zmiana paddingu czy
    // rozmiaru czcionki nie rozjedzie odstępu pod chatbotem.
    useEffect(() => {
        const root = document.documentElement;

        if (!widoczny) {
            root.style.setProperty("--mobile-bar-h", "0px");
            return;
        }

        const ustaw = () => {
            const wysokosc = pasekRef.current?.offsetHeight ?? 0;
            root.style.setProperty("--mobile-bar-h", `${wysokosc}px`);
        };

        ustaw();
        window.addEventListener("resize", ustaw);
        return () => {
            window.removeEventListener("resize", ustaw);
            root.style.setProperty("--mobile-bar-h", "0px");
        };
    }, [widoczny]);

    return (
        <div
            ref={pasekRef}
            className={`md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 transition-all duration-300 ${
                widoczny ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
            }`}
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
            aria-hidden={!widoczny}
        >
            <div className="flex gap-2 rounded-2xl bg-navy-light/95 backdrop-blur-md border border-white/10 p-2 shadow-[0_-4px_24px_rgba(0,0,0,0.45)]">
                <a
                    href={WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={widoczny ? 0 : -1}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white font-bold text-sm active:bg-white/10 transition-colors"
                >
                    <MessageCircle size={17} aria-hidden="true" />
                    WhatsApp
                </a>
                {/* Mail na pasku, bo klienci pytali, gdzie jest adres — był tylko w stopce. */}
                <a
                    href="mailto:kontakt@wuyo.pl"
                    tabIndex={widoczny ? 0 : -1}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 text-white font-bold text-sm active:bg-white/10 transition-colors"
                >
                    <Mail size={17} aria-hidden="true" />
                    Mail
                </a>
                <a
                    href={`tel:${TELEFON}`}
                    tabIndex={widoczny ? 0 : -1}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#ffeb52] text-[#1c1b17] font-bold text-sm active:bg-[#ffe000] transition-colors"
                >
                    <Phone size={17} aria-hidden="true" />
                    {locale === "en" ? "Call" : "Zadzwoń"}
                </a>
            </div>
        </div>
    );
}
