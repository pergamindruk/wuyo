"use client";

import { useState } from "react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AlertTriangle, Check } from "lucide-react";

export function AuditSection() {
    const [url, setUrl] = useState("");
    const [email, setEmail] = useState("");
    const [honeypot, setHoneypot] = useState(""); // bot trap
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (honeypot) return; // cicho odrzucamy bota
        if (!url.trim() || !email.trim()) {
            setError("Wklej link i podaj e-mail — bez tego nie zadziała! 😅");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: url.trim(), email: email.trim() }),
            });
            if (!res.ok) throw new Error();
            setSubmitted(true);
        } catch {
            setError("Ups, coś się posypało. Spróbuj jeszcze raz! 😅");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="audyt" className="py-24 px-6 md:px-12 relative overflow-hidden bg-navy-light/30 border-t border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/5 xl:via-transparent to-gold/10 pointer-events-none" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <AnimatedSection>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                        <AlertTriangle size={28} className="animate-pulse" />
                    </div>
                    <p className="eyebrow mb-4 text-red-500 font-bold uppercase tracking-[0.2em] animate-pulse">Szczera i bolesna analiza</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Audyt Konwersji Bez Znieczulenia
                    </h2>
                    <p className="text-white/70 leading-relaxed mb-10 text-lg max-w-2xl mx-auto">
                        Twoja strona nie sprzedaje, a grafika w social mediach przypomina ubiegłą dekadę? Wklej link lub prześlij materiały. Wskażę Ci najsłabsze punkty Twojego wizerunku i powiem dokładnie, co zmienić, by w końcu zacząć na nich zarabiać. Bez owijania w bawełnę.
                    </p>

                    {submitted ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#FFD700" }}>
                                <Check size={24} color="#000" />
                            </div>
                            <p className="text-white font-semibold text-lg">Git! Dostałem Twoje zgłoszenie 🎉</p>
                            <p className="text-white/50 text-sm">Audyt wyślę na <span className="text-gold">{email}</span> — zazwyczaj w ciągu 24–48 h.</p>
                        </div>
                    ) : (
                        <form
                            className="flex flex-col gap-3 max-w-xl mx-auto"
                            onSubmit={handleSubmit}
                        >
                            {/* Honeypot — niewidoczne dla ludzi, boty je wypełniają */}
                            <input
                                type="text"
                                name="website"
                                value={honeypot}
                                onChange={(e) => setHoneypot(e.target.value)}
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                                style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
                            />
                            <input
                                type="text"
                                placeholder="Wklej link (np. www.mojastrona.pl)"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full bg-navy-dark border border-white/10 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/30"
                            />
                            <input
                                type="email"
                                placeholder="Twój e-mail — tu wyślę audyt *"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-navy-dark border border-white/10 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-white/30"
                            />
                            {error && <p className="text-red-400 text-sm px-2">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-white text-navy font-bold px-8 py-4 rounded-full text-sm hover:bg-gold hover:text-navy-dark transition-all disabled:opacity-50 w-full"
                            >
                                {loading ? "Wysyłam zgłoszenie..." : "Sprawdźmy to"}
                            </button>
                        </form>
                    )}
                </AnimatedSection>
            </div>
        </section>
    );
}
