"use client";

// Piksel Meta dociągany dopiero po zgodzie na marketing.
//
// Wcześniej siedział na każdej podstronie w <head>: 110 KB transferu i połączenie
// do serwerów Facebooka przy każdym wejściu, mimo że bez zgody i tak nie miał prawa
// nic wysłać. Teraz plik nie leci wcale, dopóki ktoś nie kliknie zgody.
//
// Klient, bo decyzja zależy od tego, co siedzi w pamięci tej konkretnej przeglądarki.

import { useCallback, useEffect, useRef } from "react";
import { CONSENT_CHANGED_EVENT, readConsent, type ConsentChoice } from "@/lib/consent";

type PixelWindow = Window & {
    fbq?: ((command: string, ...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void;
        queue?: unknown[];
        loaded?: boolean;
        version?: string;
        push?: unknown;
    };
    _fbq?: unknown;
};

export function MetaPixel({ pixelId }: { pixelId: string }) {
    const wczytany = useRef(false);

    const wczytaj = useCallback(() => {
        if (wczytany.current || !pixelId) return;
        wczytany.current = true;

        const w = window as PixelWindow;

        // Oficjalny fragment Meta, przepisany na TypeScript. Tworzy kolejkę `fbq`,
        // która zbiera wywołania do czasu, aż fbevents.js skończy się wczytywać.
        if (!w.fbq) {
            const kolejka = function (this: unknown, ...args: unknown[]) {
                const f = w.fbq;
                if (f?.callMethod) f.callMethod(...args);
                else f?.queue?.push(args);
            } as NonNullable<PixelWindow["fbq"]>;

            kolejka.queue = [];
            kolejka.loaded = true;
            kolejka.version = "2.0";
            kolejka.push = kolejka;
            w.fbq = kolejka;
            if (!w._fbq) w._fbq = kolejka;
        }

        const skrypt = document.createElement("script");
        skrypt.async = true;
        skrypt.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(skrypt);

        w.fbq?.("init", pixelId);
        w.fbq?.("track", "PageView");
    }, [pixelId]);

    useEffect(() => {
        if (readConsent()?.marketing) wczytaj();

        const naZmiane = (e: Event) => {
            const wybor = (e as CustomEvent<Pick<ConsentChoice, "marketing">>).detail;
            if (wybor?.marketing) wczytaj();
            // Wycofanie zgody obsługuje `applyConsent` przez fbq('consent','revoke').
            // Raz wczytanego skryptu nie da się odwczytać — dlatego liczy się to,
            // żeby nie wczytywać go bez potrzeby.
        };

        window.addEventListener(CONSENT_CHANGED_EVENT, naZmiane);
        return () => window.removeEventListener(CONSENT_CHANGED_EVENT, naZmiane);
    }, [wczytaj]);

    return null;
}
