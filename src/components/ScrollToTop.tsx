"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useMountTransition } from "@/lib/useMountTransition";

export function ScrollToTop() {
    const [widoczny, setWidoczny] = useState(false);
    const { wDrzewie, aktywny } = useMountTransition(widoczny, 250);

    useEffect(() => {
        const przelacz = () => setWidoczny(window.scrollY > 500);
        // passive: przeglądarka nie musi czekać, czy zablokujemy przewijanie
        window.addEventListener("scroll", przelacz, { passive: true });
        przelacz();
        return () => window.removeEventListener("scroll", przelacz);
    }, []);

    if (!wDrzewie) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-widoczny={aktywny ? "tak" : undefined}
            // Wysokość paska kontaktu doliczona jak przy dymku czatu: bez niej dymek
            // podnosił się nad pasek i siadał dokładnie na tym przycisku.
            className="wskocz-na-gore fixed bottom-[calc(7rem+var(--mobile-bar-h,0px))] right-4 sm:bottom-[calc(8rem+var(--mobile-bar-h,0px))] sm:right-6 lg:bottom-[120px] lg:right-8 z-50 p-3 bg-gold text-navy rounded-full shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_30px_rgba(255,235,82,0.6)] hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border border-white/20"
            aria-label="Wróć na górę strony"
        >
            <ArrowUp size={24} className="stroke-[3px]" />
        </button>
    );
}
