"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatBot = dynamic(() => import("@/components/ChatBot"), {
    ssr: false,
    loading: () => null,
});

/**
 * Czat wraz z biblioteką animacji waży ~141 KB i wcześniej pobierał się razem
 * ze stroną — na każdej podstronie, także u ludzi, którzy nigdy go nie otworzą.
 * Teraz dociąga się dopiero, gdy przeglądarka ma wolną chwilę, albo natychmiast
 * przy pierwszym ruchu odwiedzającego (przewinięcie, dotknięcie, klawisz).
 * Najpóźniej po 3 sekundach — dymek zawsze zdąży przed próbą kliknięcia.
 */
export default function ChatBotLoader() {
    const [wczytaj, setWczytaj] = useState(false);

    useEffect(() => {
        const zdarzenia = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
        let sprzataj = () => {};

        const wpusc = () => {
            setWczytaj(true);
            sprzataj();
        };

        for (const nazwa of zdarzenia) {
            window.addEventListener(nazwa, wpusc, { once: true, passive: true });
        }

        const maBezczynnosc = "requestIdleCallback" in window;
        const uchwyt = maBezczynnosc
            ? window.requestIdleCallback(wpusc, { timeout: 3000 })
            : window.setTimeout(wpusc, 1500);

        sprzataj = () => {
            for (const nazwa of zdarzenia) window.removeEventListener(nazwa, wpusc);
            if (maBezczynnosc) window.cancelIdleCallback(uchwyt);
            else window.clearTimeout(uchwyt);
        };

        return () => sprzataj();
    }, []);

    return wczytaj ? <ChatBot /> : null;
}
