"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type ServiceKey = "logo" | "www" | "druk" | "social";
type TimelineKey = "standard" | "express" | "ultra";

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

const TIMELINE_MULT: Record<TimelineKey, number> = {
    standard: 1,
    express: 1.4,
    ultra: 1.8,
};

function calcPrice(s: Selection): [number, number] | null {
    let low = 0, high = 0;
    const m = TIMELINE_MULT[s.timeline];

    if (s.service === "logo") {
        if (!s.logoType) return null;
        const base: Record<string, [number, number]> = {
            wordmark: [800, 1400],
            monogram: [1000, 1600],
            combo: [1200, 2200],
        };
        [low, high] = base[s.logoType];
        if (s.brandbook) { low += 600; high += 1000; }
    } else if (s.service === "www") {
        if (!s.wwwType) return null;
        if (s.wwwType === "onepage") { low = 1200; high = 2200; }
        else if (s.wwwType === "multipage") {
            if (s.wwwPages === "1-5") { low = 2000; high = 3800; }
            else { low = 3500; high = 6000; }
        } else { low = 4000; high = 7500; }
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

export function PriceCalculator() {
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
        ? `?usluga=${encodeURIComponent(SERVICES.find(s => s.key === sel.service)?.label ?? "")}`
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
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Krok 1 z 3</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Czego potrzebujesz?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SERVICES.map(s => (
                                    <button
                                        key={s.key}
                                        onClick={() => update({ service: s.key })}
                                        className="group text-left p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-gold/40 hover:bg-gold/5 transition-all duration-200"
                                    >
                                        <span className="text-2xl mb-3 block text-gold/70 group-hover:text-gold transition-colors">{s.emoji}</span>
                                        <p className="font-bold text-white group-hover:text-gold transition-colors mb-1">{s.label}</p>
                                        <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Krok 2: Szczegóły usługi ── */}
                    {step === 2 && !done && (
                        <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                            <button onClick={() => update({ service: null, logoType: null, wwwType: null, drukType: null, socialPosts: null, wwwPages: null })} className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors group">
                                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Wróć
                            </button>
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Krok 2 z 3</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Doprecyzuj szczegóły</h2>

                            {/* Logo options */}
                            {sel.service === "logo" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">Typ logotypu</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {([["wordmark", "Wordmark", "Samo słowo / napis"], ["monogram", "Monogram", "Inicjały / znak"], ["combo", "Kombinacja", "Znak + tekst"]] as const).map(([k, l, d]) => (
                                                <button key={k} onClick={() => update({ logoType: k })} className={`p-4 rounded-xl border text-left transition-all text-sm ${sel.logoType === k ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                                                    <span className="font-bold block mb-1">{l}</span>
                                                    <span className="text-xs text-white/40">{d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sel.brandbook ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20"}`}>
                                        <input type="checkbox" checked={sel.brandbook} onChange={e => update({ brandbook: e.target.checked })} className="mt-0.5 accent-yellow-400" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">Dodaj Brand Book</p>
                                            <p className="text-white/40 text-xs mt-0.5">Pełna dokumentacja marki — kolory, typografia, użycie logotypu</p>
                                        </div>
                                    </label>
                                    {sel.logoType && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            Zobacz wycenę <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* WWW options */}
                            {sel.service === "www" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">Typ strony</p>
                                        <div className="space-y-2">
                                            {([["onepage", "One-Page", "Jedna strona, wszystko w sekcjach — idealna na start"], ["multipage", "Multi-Page", "Kilka podstron, rozbudowany serwis"], ["shop", "Sklep / E-commerce", "Pełny sklep z koszykiem i płatnościami"]] as const).map(([k, l, d]) => (
                                                <button key={k} onClick={() => update({ wwwType: k, wwwPages: k !== "multipage" ? null : sel.wwwPages })} className={`w-full p-4 rounded-xl border text-left transition-all ${sel.wwwType === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
                                                    <span className="font-bold text-white block">{l}</span>
                                                    <span className="text-white/40 text-xs">{d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {sel.wwwType === "multipage" && (
                                        <div>
                                            <p className="text-white/60 text-sm font-medium mb-3">Liczba podstron</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {([["1-5", "Do 5 podstron"], ["5+", "Powyżej 5"]] as const).map(([k, l]) => (
                                                    <button key={k} onClick={() => update({ wwwPages: k })} className={`p-3.5 rounded-xl border text-sm font-semibold transition-all ${sel.wwwPages === k ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/60 hover:border-white/30"}`}>{l}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {sel.wwwType && (sel.wwwType !== "multipage" || sel.wwwPages) && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            Zobacz wycenę <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Druk options */}
                            {sel.service === "druk" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">Rodzaj materiału</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {([["wizytowka", "Wizytówka"], ["ulotka", "Ulotka / Folder"], ["plakat", "Plakat / Billboard"], ["banner", "Banner / Rollup"]] as const).map(([k, l]) => (
                                                <button key={k} onClick={() => update({ drukType: k })} className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all ${sel.drukType === k ? "border-gold bg-gold/10 text-white" : "border-white/10 text-white/60 hover:border-white/30"}`}>{l}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${sel.drukPrint ? "border-gold bg-gold/5" : "border-white/10 hover:border-white/20"}`}>
                                        <input type="checkbox" checked={sel.drukPrint} onChange={e => update({ drukPrint: e.target.checked })} className="mt-0.5 accent-yellow-400" />
                                        <div>
                                            <p className="text-white font-semibold text-sm">Druk u mnie (Epson A3+)</p>
                                            <p className="text-white/40 text-xs mt-0.5">Własny druk bezpośrednio — szybciej i taniej niż zewnętrzna drukarnia</p>
                                        </div>
                                    </label>
                                    {sel.drukType && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            Zobacz wycenę <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Social options */}
                            {sel.service === "social" && (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/60 text-sm font-medium mb-3">Ile postów miesięcznie?</p>
                                        <div className="space-y-2">
                                            {([["4", "4 posty / miesiąc", "Podstawowa aktywność — 1 post / tydzień"], ["8", "8 postów / miesiąc", "Regularna obecność — 2 posty / tydzień"], ["12+", "12+ postów / miesiąc", "Pełna intensywność — 3+ posty / tydzień"]] as const).map(([k, l, d]) => (
                                                <button key={k} onClick={() => update({ socialPosts: k })} className={`w-full p-4 rounded-xl border text-left transition-all ${sel.socialPosts === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
                                                    <span className="font-bold text-white block">{l}</span>
                                                    <span className="text-white/40 text-xs">{d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {sel.socialPosts && (
                                        <button onClick={() => setDone(false)} className="w-full btn-gold py-3.5 font-bold flex items-center justify-center gap-2 mt-2">
                                            Zobacz wycenę <ArrowRight size={16} />
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
                                className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors group"
                            >
                                <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Zmień szczegóły
                            </button>
                            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Krok 3 z 3</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">Termin realizacji</h2>

                            <div className="space-y-2 mb-8">
                                {([
                                    ["standard", "Standard", "~2 tygodnie", "Normalny tryb — bez dopłat"],
                                    ["express", "Ekspres", "~5 dni roboczych", "+40% do ceny"],
                                    ["ultra", "Ultra Ekspres", "~2 dni robocze", "+80% do ceny"],
                                ] as const).map(([k, l, time, note]) => (
                                    <button key={k} onClick={() => update({ timeline: k })} className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${sel.timeline === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
                                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${sel.timeline === k ? "border-gold bg-gold" : "border-white/30"}`}>
                                            {sel.timeline === k && <div className="w-1.5 h-1.5 bg-navy rounded-full" />}
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-white flex items-center gap-2">
                                                {l}
                                                {k !== "standard" && <Zap size={12} className="text-gold" />}
                                            </span>
                                            <span className="text-white/40 text-xs">{time} · {note}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Price reveal */}
                            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 mb-6">
                                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Orientacyjna wycena</p>
                                <p className="text-4xl font-black text-gold" style={{ fontFamily: "var(--font-ava-meridian)" }}>
                                    {price[0].toLocaleString("pl-PL")} – {price[1].toLocaleString("pl-PL")} zł
                                </p>
                                <p className="text-white/40 text-xs mt-2">
                                    Cena netto. Finalna wycena po krótkiej rozmowie o projekcie — zawsze stała, bez niespodzianek.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href={`/#kontakt${briefQuery}`}
                                    className="btn-gold flex-1 py-3.5 font-bold text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,235,82,0.25)]"
                                >
                                    Wyślij zapytanie <ArrowRight size={16} />
                                </Link>
                                <button onClick={reset} className="flex-1 py-3.5 rounded-full border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all font-semibold text-sm">
                                    Zacznij od nowa
                                </button>
                            </div>

                            <p className="text-center text-white/25 text-xs mt-6 flex items-center justify-center gap-1.5">
                                <CheckCircle2 size={12} className="text-green-500/60" />
                                Kalkulator to orientacja — dokładna wycena zawsze trafia w mailu
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
