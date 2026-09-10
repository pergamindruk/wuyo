/**
 * Jedna linijka pod blokiem cen na podstronach usługowych.
 *
 * Kwoty w całym serwisie są netto (patrz CENNIK.md). Bez tego dopisku klient,
 * który wchodzi z Google prosto na podstronę, zakłada, że widzi cenę końcową
 * i dostaje niespodziankę na fakturze.
 */
export function NettoNote({ className = "" }: { className?: string }) {
    return (
        <p className={`text-white/35 text-xs ${className}`}>
            Kwoty netto — do faktury dochodzi 23% VAT.
        </p>
    );
}
