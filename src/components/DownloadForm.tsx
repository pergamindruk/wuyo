"use client";

// Wyspa kliencka: formularz z wysyłką i komunikatem po wysłaniu.
import { useState } from "react";
import Link from "next/link";
import { Mail, Check } from "lucide-react";
import { trackDownloadRequest } from "@/lib/tracking";

type Props = { slug: string; consentText: string };

export function DownloadForm({ slug, consentText }: Props) {
    const [email, setEmail] = useState("");
    const [zgoda, setZgoda] = useState(false);
    const [website, setWebsite] = useState(""); // honeypot
    const [stan, setStan] = useState<"pusty" | "wysylam" | "wyslane" | "blad">("pusty");
    const [blad, setBlad] = useState("");

    async function wyslij(e: React.FormEvent) {
        e.preventDefault();
        setStan("wysylam");
        try {
            const res = await fetch("/api/pobierz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, email, zgoda, website, page: document.referrer ? new URL(document.referrer).pathname : location.pathname }),
            });
            const data = (await res.json()) as { ok?: boolean; error?: string };
            if (!res.ok || !data.ok) throw new Error(data.error ?? "Coś poszło nie tak.");
            trackDownloadRequest(slug);
            setStan("wyslane");
        } catch (err) {
            setBlad((err as Error).message);
            setStan("blad");
        }
    }

    if (stan === "wyslane") {
        return (
            <div className="glass-card p-8 text-center border border-gold/30">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center">
                    <Check className="text-gold" size={24} aria-hidden="true" />
                </div>
                <p className="text-white font-bold text-lg mb-2">Sprawdź skrzynkę</p>
                <p className="text-white/60 text-sm">Link do pliku wysłałem na <b className="text-white">{email}</b>. Jeśli nie widzisz maila w ciągu kilku minut, zajrzyj do folderu Oferty albo Spam.</p>
            </div>
        );
    }

    return (
        <form onSubmit={wyslij} className="glass-card p-6 md:p-8 space-y-4 border border-gold/20">
            <label className="block">
                <span className="text-white/70 text-sm">Twój e-mail</span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 focus-within:border-gold/60">
                    <Mail size={16} className="text-white/40" aria-hidden="true" />
                    <input
                        type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="np. jan@firma.pl" className="w-full bg-transparent py-3 text-white placeholder:text-white/30 outline-none"
                    />
                </div>
            </label>
            <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />
            <label className="flex items-start gap-3 text-white/60 text-xs leading-relaxed cursor-pointer">
                <input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-0.5 accent-[#ffeb52]" />
                <span>{consentText} (nieobowiązkowe)</span>
            </label>
            <button type="submit" disabled={stan === "wysylam"} className="w-full btn-gold px-6 py-3.5 rounded-full font-bold disabled:opacity-60">
                {stan === "wysylam" ? "Wysyłam…" : "Wyślij mi plik"}
            </button>
            {stan === "blad" && <p className="text-red-400 text-sm" role="alert">{blad}</p>}
            <p className="text-white/40 text-[11px] leading-relaxed">
                Adres wykorzystam, żeby wysłać Ci plik. Maile z poradami i ofertami dostaniesz tylko, jeśli zaznaczysz zgodę wyżej. Więcej w <Link href="/polityka-prywatnosci" className="underline hover:text-white">polityce prywatności</Link>.
            </p>
        </form>
    );
}
