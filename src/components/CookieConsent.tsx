"use client";

// Baner zgód. Musi być wyspą kliencką: czyta pamięć przeglądarki, reaguje na
// kliknięcia i rozmawia z tagiem Google w locie. Nie da się tego zrobić na serwerze,
// bo decyzja należy do konkretnej przeglądarki, nie do żądania.

import { useCallback, useEffect, useState } from "react";
import { useMountTransition } from "@/lib/useMountTransition";
import Link from "next/link";
import { Cookie, ChartNoAxesColumn, Megaphone, ShieldCheck } from "lucide-react";
import {
    CONSENT_REOPEN_EVENT,
    applyConsent,
    readConsent,
    saveConsent,
    type ConsentChoice,
} from "@/lib/consent";
import { usePathname } from "next/navigation";
import { localeFromPath, route } from "@/lib/i18n";

type Widok = "ukryty" | "baner" | "ustawienia";

const T = {
    pl: {
        naglowek: "Ciasteczka", ustawienia: "Ustawienia ciasteczek",
        opis: "Analityka i marketing tylko za Twoją zgodą. Niezbędne działają zawsze, zgodę wycofasz w stopce.",
        akceptuje: "Akceptuję", niezbedne: "Tylko niezbędne", wybor: "Ustawienia",
        wybierz: "Wybierz, na które ciasteczka się zgadzasz.",
        kNiezbedne: "Niezbędne", kNiezbedneOpis: "Bez nich strona nie działa. Nie wymagają zgody.",
        kAnalityka: "Analityka", kAnalitykaOpis: "Google Analytics: ile osób wchodzi, skąd i co klika. Bez tego nie wiem, co poprawiać.",
        kMarketing: "Marketing", kMarketingOpis: "Piksel Meta: pokazuje, czy reklama na Facebooku przyniosła zapytanie.",
        zapisz: "Zapisz wybór", prywatnosc: "Polityka prywatności",
    },
    en: {
        naglowek: "Cookies", ustawienia: "Cookie settings",
        opis: "Analytics and marketing only with your consent. Essential cookies always run; you can withdraw consent in the footer.",
        akceptuje: "Accept", niezbedne: "Essential only", wybor: "Settings",
        wybierz: "Choose which cookies you agree to.",
        kNiezbedne: "Essential", kNiezbedneOpis: "The site does not work without them. No consent needed.",
        kAnalityka: "Analytics", kAnalitykaOpis: "Google Analytics: how many people visit, from where and what they click. Without it I don't know what to improve.",
        kMarketing: "Marketing", kMarketingOpis: "Meta Pixel: shows whether a Facebook ad brought an enquiry.",
        zapisz: "Save my choice", prywatnosc: "Privacy policy",
    },
} as const;

export function CookieConsent() {
    const locale = localeFromPath(usePathname());
    const t = T[locale];
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

        // Baner dopiero 2,5 s po wczytaniu strony. Pokazany wcześniej (było 0,8 s) stawał się
        // największym elementem na ekranie telefonu i Google liczył LCP od niego (3,5 s).
        let timer: number | undefined;
        const pokaz = () => { timer = window.setTimeout(() => setWidok("baner"), 2500); };
        if (document.readyState === "complete") pokaz();
        else window.addEventListener("load", pokaz, { once: true });
        return () => {
            window.removeEventListener("load", pokaz);
            window.clearTimeout(timer);
        };
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

    const { wDrzewie, aktywny } = useMountTransition(widok !== "ukryty", 350);

    if (!wDrzewie) return null;

    return (
        <div
            role="dialog"
            aria-labelledby="zgody-naglowek"
            aria-describedby="zgody-opis"
            data-widoczny={aktywny ? "tak" : undefined}
            className="baner-zgod fixed left-0 right-0 z-[60] px-4 sm:left-6 sm:right-auto sm:px-0 sm:max-w-[22rem]"
            style={{
                // Podnosi się nad pasek kontaktu na telefonie, tak jak dymek czatu.
                bottom: "calc(1rem + var(--mobile-bar-h, 0px))",
            }}
        >
                    {/* Tło nieprzezroczyste, nie przyszybione — baner ląduje na samej górze hero
                        i przy 95% krycia złoty przycisk pod nim przebijał przez tekst. */}
                    <div className="rounded-3xl border border-white/10 bg-navy-dark p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)]">
                        <div className="mb-2 flex items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                                <Cookie size={15} aria-hidden />
                            </span>
                            <h2 id="zgody-naglowek" className="text-sm font-bold text-white">
                                {widok === "baner" ? t.naglowek : t.ustawienia}
                            </h2>
                        </div>

                        {widok === "baner" ? (
                            <>
                                <p id="zgody-opis" className="mb-3 text-xs leading-relaxed text-white/60">
                                    {t.opis}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => zdecyduj({ analytics: true, marketing: true })}
                                        className="flex-1 cursor-pointer whitespace-nowrap rounded-full bg-gold px-4 py-2 text-xs font-bold text-navy-dark transition-colors hover:bg-gold-light"
                                    >
                                        {t.akceptuje}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => zdecyduj({ analytics: false, marketing: false })}
                                        className="flex-1 cursor-pointer whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                                    >
                                        {t.niezbedne}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setWidok("ustawienia")}
                                        className="cursor-pointer whitespace-nowrap rounded-full px-2 py-2 text-xs font-semibold text-white/50 transition-colors hover:text-white"
                                    >
                                        {t.wybor}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p id="zgody-opis" className="sr-only">
                                    {t.wybierz}
                                </p>
                                <ul className="mb-5 space-y-3">
                                    <Kategoria
                                        ikona={<ShieldCheck size={16} aria-hidden />}
                                        nazwa={t.kNiezbedne}
                                        opis={t.kNiezbedneOpis}
                                    />
                                    <Kategoria
                                        ikona={<ChartNoAxesColumn size={16} aria-hidden />}
                                        nazwa={t.kAnalityka}
                                        opis={t.kAnalitykaOpis}
                                        wlaczone={analityka}
                                        onZmiana={setAnalityka}
                                    />
                                    <Kategoria
                                        ikona={<Megaphone size={16} aria-hidden />}
                                        nazwa={t.kMarketing}
                                        opis={t.kMarketingOpis}
                                        wlaczone={marketing}
                                        onZmiana={setMarketing}
                                    />
                                </ul>
                                <button
                                    type="button"
                                    onClick={() => zdecyduj({ analytics: analityka, marketing })}
                                    className="w-full cursor-pointer rounded-full bg-gold px-6 py-3 text-sm font-bold text-navy-dark transition-colors hover:bg-gold-light"
                                >
                                    {t.zapisz}
                                </button>
                            </>
                        )}

                        <Link
                            href={route("privacy", locale)}
                            className="mt-2 block text-center text-[11px] text-white/50 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white/60"
                        >
                            {t.prywatnosc}
                        </Link>
                </div>
        </div>
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
