"use client";

// Baner zgód. Musi być wyspą kliencką: czyta pamięć przeglądarki, reaguje na
// kliknięcia i rozmawia z tagiem Google w locie. Nie da się tego zrobić na serwerze,
// bo decyzja należy do konkretnej przeglądarki, nie do żądania.

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, ChartNoAxesColumn, Megaphone, ShieldCheck } from "lucide-react";
import {
    CONSENT_REOPEN_EVENT,
    applyConsent,
    readConsent,
    saveConsent,
    type ConsentChoice,
} from "@/lib/consent";

type Widok = "ukryty" | "baner" | "ustawienia";

export function CookieConsent() {
    const [widok, setWidok] = useState<Widok>("ukryty");
    const [analityka, setAnalityka] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        const zapisany = readConsent();

        if (zapisany) {
            setAnalityka(zapisany.analytics);
            setMarketing(zapisany.marketing);
            // GA4 dostało tę decyzję już ze skryptu w <head>, ale Piksel Meta jeszcze nie —
            // w chwili jego uruchomienia startuje z 'revoke' i sam nic nie wie o zapisie.
            applyConsent(zapisany);
            return;
        }

        // Chwila zwłoki, żeby baner nie wjeżdżał w trakcie pierwszego malowania strony.
        const timer = window.setTimeout(() => setWidok("baner"), 800);
        return () => window.clearTimeout(timer);
    }, []);

    // Stopka otwiera ustawienia tym zdarzeniem — wycofanie zgody musi być
    // tak samo łatwe jak jej udzielenie.
    useEffect(() => {
        const otworz = () => setWidok("ustawienia");
        window.addEventListener(CONSENT_REOPEN_EVENT, otworz);
        return () => window.removeEventListener(CONSENT_REOPEN_EVENT, otworz);
    }, []);

    const zdecyduj = useCallback((wybor: Pick<ConsentChoice, "analytics" | "marketing">) => {
        const pelny: ConsentChoice = { ...wybor, decidedAt: new Date().toISOString() };
        saveConsent(pelny);
        applyConsent(pelny);
        setAnalityka(wybor.analytics);
        setMarketing(wybor.marketing);
        setWidok("ukryty");
    }, []);

    return (
        <AnimatePresence>
            {widok !== "ukryty" && (
                <motion.div
                    role="dialog"
                    aria-labelledby="zgody-naglowek"
                    aria-describedby="zgody-opis"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed left-0 right-0 z-[60] px-4 sm:left-6 sm:right-auto sm:px-0 sm:max-w-[26rem]"
                    style={{
                        // Podnosi się nad pasek kontaktu na telefonie, tak jak dymek czatu.
                        bottom: "calc(1rem + var(--mobile-bar-h, 0px))",
                        transition: "bottom 300ms ease",
                    }}
                >
                    {/* Tło nieprzezroczyste, nie przyszybione — baner ląduje na samej górze hero
                        i przy 95% krycia złoty przycisk pod nim przebijał przez tekst. */}
                    <div className="rounded-3xl border border-white/10 bg-navy-dark p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)]">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                                <Cookie size={18} aria-hidden />
                            </span>
                            <h2 id="zgody-naglowek" className="text-base font-bold text-white">
                                {widok === "baner" ? "Ciasteczka" : "Ustawienia ciasteczek"}
                            </h2>
                        </div>

                        {widok === "baner" ? (
                            <>
                                <p id="zgody-opis" className="mb-5 text-sm leading-relaxed text-white/60">
                                    Niezbędne działają zawsze — bez nich strona się nie uruchomi. Na analitykę
                                    i marketing potrzebuję Twojej zgody. Możesz ją wycofać w każdej chwili.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => zdecyduj({ analytics: true, marketing: true })}
                                        className="w-full cursor-pointer rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy-dark transition-colors hover:bg-gold-light"
                                    >
                                        Akceptuję wszystkie
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => zdecyduj({ analytics: false, marketing: false })}
                                            className="flex-1 cursor-pointer rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                                        >
                                            Tylko niezbędne
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWidok("ustawienia")}
                                            className="flex-1 cursor-pointer rounded-full px-4 py-3 text-sm font-semibold text-white/50 transition-colors hover:text-white"
                                        >
                                            Wybieram sam
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <p id="zgody-opis" className="sr-only">
                                    Wybierz, na które ciasteczka się zgadzasz.
                                </p>
                                <ul className="mb-5 space-y-3">
                                    <Kategoria
                                        ikona={<ShieldCheck size={16} aria-hidden />}
                                        nazwa="Niezbędne"
                                        opis="Bez nich strona nie działa. Nie wymagają zgody."
                                    />
                                    <Kategoria
                                        ikona={<ChartNoAxesColumn size={16} aria-hidden />}
                                        nazwa="Analityka"
                                        opis="Google Analytics: ile osób wchodzi, skąd i co klika. Bez tego nie wiem, co poprawiać."
                                        wlaczone={analityka}
                                        onZmiana={setAnalityka}
                                    />
                                    <Kategoria
                                        ikona={<Megaphone size={16} aria-hidden />}
                                        nazwa="Marketing"
                                        opis="Piksel Meta: pokazuje, czy reklama na Facebooku przyniosła zapytanie."
                                        wlaczone={marketing}
                                        onZmiana={setMarketing}
                                    />
                                </ul>
                                <button
                                    type="button"
                                    onClick={() => zdecyduj({ analytics: analityka, marketing })}
                                    className="w-full cursor-pointer rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy-dark transition-colors hover:bg-gold-light"
                                >
                                    Zapisz wybór
                                </button>
                            </>
                        )}

                        <Link
                            href="/polityka-prywatnosci"
                            className="mt-4 block text-center text-xs text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/60"
                        >
                            Polityka prywatności
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

type KategoriaProps = {
    ikona: React.ReactNode;
    nazwa: string;
    opis: string;
    /** Brak `wlaczone` oznacza kategorię wymuszoną, bez przełącznika. */
    wlaczone?: boolean;
    onZmiana?: (wartosc: boolean) => void;
};

function Kategoria({ ikona, nazwa, opis, wlaczone, onZmiana }: KategoriaProps) {
    const wymuszona = wlaczone === undefined || onZmiana === undefined;
    const aktywna = wymuszona ? true : wlaczone;

    return (
        <li className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
            <span className="mt-0.5 shrink-0 text-gold/70">{ikona}</span>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{nazwa}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/45">{opis}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={aktywna}
                aria-label={nazwa}
                disabled={wymuszona}
                onClick={() => onZmiana?.(!wlaczone)}
                className={`mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors ${
                    aktywna ? "border-gold/40 bg-gold/80" : "border-white/15 bg-white/10"
                } ${wymuszona ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            >
                <span
                    className={`block h-3.5 w-3.5 rounded-full bg-navy-dark transition-transform ${
                        aktywna ? "translate-x-[1.125rem]" : "translate-x-[0.1875rem]"
                    }`}
                />
            </button>
        </li>
    );
}
