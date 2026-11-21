import { MARKETING_CONSENT_TEXT } from "@/data/downloads";

// Treść zgody na maile z poradami i ofertami w formularzu briefu.
// Serwer zapisuje tekst stąd, a nie z żądania: dowód zgody musi pokazywać
// to, co klient faktycznie widział przy polu wyboru.
export const BRIEF_MARKETING_CONSENT = {
    pl: MARKETING_CONSENT_TEXT,
    en: "I want to receive emails with tips and offers from WUYO at this address. I can opt out at any time by replying “unsubscribe” or using the link in the email.",
} as const;

export type ConsentLocale = keyof typeof BRIEF_MARKETING_CONSENT;
