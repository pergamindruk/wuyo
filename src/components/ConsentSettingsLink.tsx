"use client";

// Mały przycisk w stopce, który każe banerowi otworzyć ustawienia zgód.
// Klient, bo musi wysłać zdarzenie w przeglądarce. RODO wymaga, żeby wycofanie
// zgody było tak samo łatwe jak jej udzielenie — bez tego linku nie byłoby jak.

import { CONSENT_REOPEN_EVENT } from "@/lib/consent";

export function ConsentSettingsLink({ className }: { className?: string }) {
    return (
        <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))}
            className={className}
        >
            Ustawienia ciasteczek
        </button>
    );
}
