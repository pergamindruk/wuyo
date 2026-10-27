"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { route, type Locale } from "@/lib/i18n";

type ServiceKey = "logo" | "www" | "druk" | "social";
type TimelineKey = "standard" | "express";

interface Selection {
    service: ServiceKey | null;
    // logo
    logoType: "wordmark" | "monogram" | "combo" | null;
    brandbook: boolean;
    // www
    wwwType: "onepage" | "multipage" | "shop" | null;
    wwwPages: "1-5" | "5+" | null;
    // druk
    drukType: "wizytowka" | "ulotka" | "plakat" | "banner" | null;
    drukPrint: boolean;
    // social
    socialPosts: "4" | "8" | "12+" | null;
    // shared
    timeline: TimelineKey;
}

const INIT: Selection = {
    service: null,
    logoType: null,
    brandbook: false,
    wwwType: null,
    wwwPages: null,
    drukType: null,
    drukPrint: false,
    socialPosts: null,
    timeline: "standard",
};

const SERVICES = [
    { key: "logo" as ServiceKey, label: "Logo & Identyfikacja", emoji: "✦", desc: "Logotyp, brand book, system wizualny" },
    { key: "www" as ServiceKey, label: "Strona internetowa", emoji: "⬡", desc: "One-Page, multi-page lub sklep e-com" },
    { key: "druk" as ServiceKey, label: "Materiały drukowane", emoji: "◈", desc: "Wizytówki, ulotki, plakaty, bannery" },
    { key: "social" as ServiceKey, label: "Social media", emoji: "◉", desc: "Grafiki, karuzele, posty miesięczne" },
];

// Teksty w dwóch językach. Kwoty i logika liczenia wspólne (CENNIK.md).
const T = {
    pl: {
        services: [
            ["Logo & Identyfikacja", "Logotyp, brand book, system wizualny"],
            ["Strona internetowa", "One-Page, multi-page lub sklep e-com"],
            ["Materiały drukowane", "Wizytówki, ulotki, plakaty, bannery"],
            ["Social media", "Grafiki, karuzele, posty miesięczne"],
        ],
        krok: (n: number) => `Krok ${n} z 3`, czego: "Czego potrzebujesz?", wroc: "Wróć", doprecyzuj: "Doprecyzuj szczegóły",
        typLogo: "Typ logotypu", logoTypes: [["Wordmark", "Samo słowo / napis"], ["Monogram", "Inicjały / znak"], ["Kombinacja", "Znak + tekst"]],
        brandbook: "Dodaj Brand Book", brandbookDesc: "Pełna dokumentacja marki — kolory, typografia, użycie logotypu",
        zobacz: "Zobacz wycenę", typStrony: "Typ strony",
        wwwTypes: [["One-Page", "Jedna strona, wszystko w sekcjach — idealna na start"], ["Multi-Page", "Kilka podstron, rozbudowany serwis"], ["Sklep / E-commerce", "Pełny sklep z koszykiem i płatnościami"]],
        podstrony: "Liczba podstron", pages: ["Do 5 podstron", "Powyżej 5"],
        rodzaj: "Rodzaj materiału", druk: ["Wizytówka", "Ulotka / Folder", "Plakat / Billboard", "Banner / Rollup"],
        drukU: "Druk u mnie (do A3+)", drukUDesc: "Własny druk bezpośrednio — szybciej i taniej niż zewnętrzna drukarnia",
        ilePostow: "Ile postów miesięcznie?",
        posts: [["4 posty / miesiąc", "Podstawowa aktywność — 1 post / tydzień"], ["8 postów / miesiąc", "Regularna obecność — 2 posty / tydzień"], ["12+ postów / miesiąc", "Pełna intensywność — 3+ posty / tydzień"]],
        zmien: "Zmień szczegóły", termin: "Termin realizacji",
        timelines: [["Standard", "logo 7–10, strona 7–14 dni roboczych", "Normalny tryb — bez dopłat"], ["Ekspres", "szybszy termin, ustalany przy wycenie", "+30% do ceny"]],
        orient: "Orientacyjna wycena", waluta: "zł", liczby: "pl-PL",
        finalna: "Finalna wycena po krótkiej rozmowie o projekcie — zawsze stała, bez niespodzianek.",
        wyslij: "Wyślij zapytanie", odNowa: "Zacznij od nowa", stopka: "Kalkulator to orientacja — dokładna wycena zawsze trafia w mailu",
    },
    en: {
        services: [
            ["Logo & identity", "Logo, brand book, visual system"],
            ["Website", "One-page, multi-page or online shop"],
            ["Print materials", "Business cards, flyers, posters, banners"],
            ["Social media", "Graphics, carousels, monthly posts"],
        ],
        krok: (n: number) => `Step ${n} of 3`, czego: "What do you need?", wroc: "Back", doprecyzuj: "Fine-tune the details",
        typLogo: "Logo type", logoTypes: [["Wordmark", "Just a word / lettering"], ["Monogram", "Initials / symbol"], ["Combination", "Symbol + text"]],
        brandbook: "Add a brand book", brandbookDesc: "Full brand documentation: colours, typography, logo usage",
        zobacz: "See the estimate", typStrony: "Type of website",
        wwwTypes: [["One-page", "One page with sections, ideal to start"], ["Multi-page", "Several subpages, a bigger website"], ["Shop / e-commerce", "A full shop with cart and payments"]],
        podstrony: "Number of pages", pages: ["Up to 5 pages", "More than 5"],
        rodzaj: "Type of material", druk: ["Business card", "Flyer / brochure", "Poster / billboard", "Banner / roll-up"],
        drukU: "Printed by me (up to A3+)", drukUDesc: "In-house print: faster and cheaper than an outside print shop",
        ilePostow: "How many posts a month?",
        posts: [["4 posts / month", "Basic activity: 1 post a week"], ["8 posts / month", "Regular presence: 2 posts a week"], ["12+ posts / month", "Full intensity: 3+ posts a week"]],
        zmien: "Change details", termin: "Turnaround",
        timelines: [["Standard", "logo 7–10, website 7–14 working days", "Normal pace, no extra charge"], ["Express", "faster deadline, agreed with the quote", "+30% to the price"]],
        orient: "Estimated price (net)", waluta: "PLN", liczby: "en-GB",
        finalna: "The final quote follows a short chat about your project. It's always fixed, with no surprises.",
        wyslij: "Send an enquiry", odNowa: "Start again", stopka: "The calculator is a guide. The exact quote always comes by email",
    },
} as const;

const TIMELINE_MULT: Record<TimelineKey, number> = {
    standard: 1,
    // CENNIK.md, zasady: "Ekspres 24–48h: +30% do całości".
    express: 1.3,
};

function calcPrice(s: Selection): [number, number] | null {
    let low = 0, high = 0;
    const m = TIMELINE_MULT[s.timeline];

    if (s.service === "logo") {
        if (!s.logoType) return null;
        const base: Record<string, [number, number]> = {
            wordmark: [900, 1400],
            monogram: [1000, 1600],
            combo: [1200, 2200],
        };
        [low, high] = base[s.logoType];
        if (s.brandbook) { low += 600; high += 1000; }
    } else if (s.service === "www") {
        if (!s.wwwType) return null;
        if (s.wwwType === "onepage") { low = 1990; high = 3000; }
        else if (s.wwwType === "multipage") {
            if (s.wwwPages === "1-5") { low = 2990; high = 5500; }
            else { low = 5900; high = 9000; }
        } else { low = 6900; high = 12000; }
    } else if (s.service === "druk") {
        if (!s.drukType) return null;
        const base: Record<string, [number, number]> = {
            wizytowka: [300, 500],
            ulotka: [400, 700],
            plakat: [500, 900],
            banner: [400, 750],
        };
        [low, high] = base[s.drukType];
        if (s.drukPrint) { low += 150; high += 400; }
    } else if (s.service === "social") {
        if (!s.socialPosts) return null;
        const base: Record<string, [number, number]> = {
            "4": [400, 650],
            "8": [700, 1100],
            "12+": [1000, 1600],
        };
        [low, high] = base[s.socialPosts];
    } else {
        return null;
    }

    return [Math.round(low * m / 100) * 100, Math.round(high * m / 100) * 100];
}

function getStep(s: Selection): number {
    if (!s.service) return 1;
    if (s.service === "logo" && !s.logoType) return 2;
    if (s.service === "www" && !s.wwwType) return 2;
    if (s.service === "www" && s.wwwType === "multipage" && !s.wwwPages) return 2;
    if (s.service === "druk" && !s.drukType) return 2;
    if (s.service === "social" && !s.socialPosts) return 2;
    if (s.service && calcPrice(s) === null) return 2;
    return 3;
}

const stepVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
};

export function PriceCalculator({ locale = "pl" }: { locale?: Locale }) {
    const t = T[locale];
    const services = SERVICES.map((s, i) => ({ ...s, label: t.services[i][0], desc: t.services[i][1] }));
    const [sel, setSel] = useState<Selection>(INIT);
    const [done, setDone] = useState(false);

    const step = getStep(sel);
    const price = calcPrice(sel);

    function update(patch: Partial<Selection>) {
        setSel(prev => ({ ...prev, ...patch }));
    }

    function reset() {
        setSel(INIT);
        setDone(false);
    }

    const briefQuery = sel.service
        ? `?usluga=${encodeURIComponent(services.find(s => s.key === sel.service)?.label ?? "")}`
        : "";

    return (
        <div className="glass-card rounded-3xl overflow-hidden">
            {/* Progress bar */}
            <div className="h-1 bg-white/5">
                <motion.div
                    className="h-full bg-gold"
                    animate={{ width: done ? "100%" : step === 1 ? "0%" : step === 2 ? "50%" : "85%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            </div>

            <div className="p-8 md:p-12">
                <AnimatePresence mode="wait">
                    {/* ── Krok 1: Wybór usługi ── */}
                    {step === 1 && !done && (
                        <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{t.krok(1)}</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{t.czego}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {services.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => update({ service: s.key })}
                                        className="group text-left p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-gold/5 transition-all duration-200"
                                    >
                                        <span className="text-2xl mb-3 block text-gold/70 group-hover:text-gold transition-colors">{s.emoji}</span>
                                        <p className="font-bold text-white group-hover:text-gold transition-colors mb-1">{s.label}</p>
                                        <p className="text-white/60 text-xs leading-relaxed">{s.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Krok 2: Szczegóły usługi ── */}
                    {step === 2 && !done && (
                        <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                            <button onClick={() => update({ service: null, logoType: null, wwwType: null, drukType: null, socialPosts: null, wwwPages: null })} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white/70 text-sm mb-6 transition-colors group">
                                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> {t.wroc}
                            </button>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{t.krok(2)}</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{t.doprecyzuj}</h2>

                            {/* Logo options */}
                            {sel.service === "logo" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">{t.typLogo}</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(["wordmark", "monogram", "combo"] as const).map((k, i) => [k, t.logoTypes[i][0], t.logoTypes[i][1]] as const).map(([k, l, d]) => (
                                                <button key={k} onClick={() => update({ logoType: k })} className={`p-4 rounded-xl border text-left transition-all text-sm ${sel.logoType === k ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                                                    <span className="font-bold block mb-1">{l}</span>
                                                    <span className="text-xs text-white/60">{d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sel.brandbook ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20"}`}>
                                        <input type="checkbox" checked={sel.brandbook} onChange={e => update({ brandbook: e.target.checked })} className="mt-0.5 accent-yellow-400" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">{t.brandbook}</p>
                                            <p className="text-white/60 text-xs mt-0.5">{t.brandbookDesc}</p>
                                        </div>
                                    </label>
                                    {sel.logoType && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            {t.zobacz} <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* WWW options */}
                            {sel.service === "www" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">{t.typStrony}</p>
                                        <div className="space-y-2">
                                            {(["onepage", "multipage", "shop"] as const).map((k, i) => [k, t.wwwTypes[i][0], t.wwwTypes[i][1]] as const).map(([k, l, d]) => (
                                                <button key={k} onClick={() => update({ wwwType: k, wwwPages: k !== "multipage" ? null : sel.wwwPages })} className={`w-full p-4 rounded-xl border text-left transition-all ${sel.wwwType === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
                                                    <span className="font-bold text-white block">{l}</span>
                                                    <span className="text-white/60 text-xs">{d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {sel.wwwType === "multipage" && (
                                        <div>
                                            <p className="text-white/60 text-sm font-medium mb-3">{t.podstrony}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {(["1-5", "5+"] as const).map((k, i) => [k, t.pages[i]] as const).map(([k, l]) => (
                                                    <button key={k} onClick={() => update({ wwwPages: k })} className={`p-3.5 rounded-xl border text-sm font-semibold transition-all ${sel.wwwPages === k ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/60 hover:border-white/30"}`}>{l}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {sel.wwwType && (sel.wwwType !== "multipage" || sel.wwwPages) && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            {t.zobacz} <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Druk options */}
                            {sel.service === "druk" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">{t.rodzaj}</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(["wizytowka", "ulotka", "plakat", "banner"] as const).map((k, i) => [k, t.druk[i]] as const).map(([k, l]) => (
                                                <button key={k} onClick={() => update({ drukType: k })} className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all ${sel.drukType === k ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/60 hover:border-white/30"}`}>{l}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sel.drukPrint ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20"}`}>
                                        <input type="checkbox" checked={sel.drukPrint} onChange={e => update({ drukPrint: e.target.checked })} className="mt-0.5 accent-yellow-400" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">{t.drukU}</p>
                                            <p className="text-white/60 text-xs mt-0.5">{t.drukUDesc}</p>
                                        </div>
                                    </label>
                                    {sel.drukType && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            {t.zobacz} <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Social options */}
                            {sel.service === "social" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">{t.ilePostow}</p>
                                        <div className="space-y-2">
                                            {(["4", "8", "12+"] as const).map((k, i) => [k, t.posts[i][0], t.posts[i][1]] as const).map(([k, l, d]) => (
                                                <button key={k} onClick={() => update({ socialPosts: k })} className={`w-full p-4 rounded-xl border text-left transition-all ${sel.socialPosts === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
                                                    <span className="font-bold text-white block">{l}</span>
                                                    <span className="text-white/60 text-xs">{d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {sel.socialPosts && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            {t.zobacz} <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Krok 3: Termin + Wynik ── */}
                    {step === 3 && !done && price && (
                        <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                            <button
                                onClick={() => update({ logoType: null, wwwType: null, drukType: null, socialPosts: null, wwwPages: null })}
                                className="inline-flex items-center gap-1.5 text-white/60 hover:text-white/70 text-sm mb-6 transition-colors group"
                            >
                                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> {t.zmien}
                            </button>
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-2">{t.krok(3)}</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">{t.termin}</h2>

                            <div className="space-y-2 mb-8">
                                {(["standard", "express"] as const).map((k, i) => [k, t.timelines[i][0], t.timelines[i][1], t.timelines[i][2]] as const).map(([k, l, time, note]) => (
                                    <button key={k} onClick={() => update({ timeline: k })} className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${sel.timeline === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
                                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${sel.timeline === k ? "border-gold bg-gold" : "border-white/30"}`}>
                                            {sel.timeline === k && <div className="w-1.5 h-1.5 bg-navy rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-white flex items-center gap-2">
                                                {l}
                                                {k !== "standard" && <Zap size={12} className="text-gold" />}
                                            </span>
                                            <span className="text-white/60 text-xs">{time} · {note}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Price reveal */}
                            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 mb-6">
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{t.orient}</p>
                                <p className="text-4xl font-black text-gold" style={{ fontFamily: "var(--font-ava-meridian)" }}>
                                    {price[0].toLocaleString(t.liczby)} – {price[1].toLocaleString(t.liczby)} {t.waluta}
                                </p>
                                <p className="text-white/60 text-xs mt-2">
                                    {t.finalna}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={`${route("home", locale)}${briefQuery}#kontakt`}
                                    className="btn-gold flex-1 py-3.5 font-bold text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,235,82,0.25)]"
                                >
                                    {t.wyslij} <ArrowRight size={16} />
                                </Link>
                                <button onClick={reset} className="flex-1 py-3.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all font-semibold text-sm">
                                    {t.odNowa}
                                </button>
                            </div>

                            <p className="text-center text-white/50 text-xs mt-6 flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={12} className="text-green-500/60" />
                                {t.stopka}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
