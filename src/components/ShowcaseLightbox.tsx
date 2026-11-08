"use client";

// Podgląd realizacji na cały ekran: zdjęcie w pełnym rozmiarze, dopasowane do okna.
// Strzałki ← → zmieniają zdjęcie tej samej realizacji, ESC albo klik w tło zamyka.

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
    title: string;
    images: string[];
    start: number;
    locale: "pl" | "en";
    onClose: () => void;
};

const T = {
    pl: { zamknij: "Zamknij podgląd", poprz: "Poprzednie zdjęcie", nast: "Następne zdjęcie" },
    en: { zamknij: "Close preview", poprz: "Previous image", nast: "Next image" },
} as const;

export function ShowcaseLightbox({ title, images, start, locale, onClose }: Props) {
    const t = T[locale];
    const [nr, setNr] = useState(start);
    const zamknij = useRef<HTMLButtonElement>(null);
    const dotyk = useRef<number | null>(null);

    const zmien = (krok: number) => setNr((n) => (n + krok + images.length) % images.length);

    // Klawiatura, blokada przewijania strony pod spodem, fokus na „zamknij”.
    useEffect(() => {
        const poprzedni = document.activeElement as HTMLElement | null;
        zamknij.current?.focus();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const naKlawisz = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") zmien(1);
            if (e.key === "ArrowLeft") zmien(-1);
        };
        window.addEventListener("keydown", naKlawisz);
        return () => {
            window.removeEventListener("keydown", naKlawisz);
            document.body.style.overflow = overflow;
            poprzedni?.focus();
        };
        // zmien/onClose są stabilne w praktyce; nasłuch zakładamy raz
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <div
            className="podglad-wystawy fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="flex items-center gap-3 px-4 md:px-8 py-4 text-white">
                <p className="font-bold truncate flex-1 min-w-0">{title}</p>
                {images.length > 1 && <span className="text-white/60 text-sm tabular-nums">{nr + 1} / {images.length}</span>}
                <button ref={zamknij} type="button" onClick={onClose} className="podglad-przycisk" aria-label={t.zamknij}>
                    <X size={20} aria-hidden />
                </button>
            </div>

            <div
                className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-20 pb-6"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
                // Telefon: przesunięcie palcem w bok zmienia zdjęcie.
                onTouchStart={(e) => { dotyk.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                    if (dotyk.current === null || images.length < 2) return;
                    const dx = e.changedTouches[0].clientX - dotyk.current;
                    dotyk.current = null;
                    if (Math.abs(dx) > 50) zmien(dx < 0 ? 1 : -1);
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element -- pełna rozdzielczość pliku, bez przeliczania przez next/image */}
                <img
                    key={images[nr]}
                    src={images[nr]}
                    alt={`${title}${images.length > 1 ? ` ${nr + 1}` : ""}`}
                    className="podglad-zdjecie max-w-full max-h-full object-contain rounded-xl select-none"
                    draggable={false}
                />

                {images.length > 1 && (
                    <>
                        <button type="button" onClick={() => zmien(-1)} aria-label={t.poprz} className="podglad-przycisk absolute left-3 md:left-6 top-1/2 -translate-y-1/2">
                            <ChevronLeft size={22} aria-hidden />
                        </button>
                        <button type="button" onClick={() => zmien(1)} aria-label={t.nast} className="podglad-przycisk absolute right-3 md:right-6 top-1/2 -translate-y-1/2">
                            <ChevronRight size={22} aria-hidden />
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body,
    );
}
