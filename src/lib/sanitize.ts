// Wspólne funkcje walidacji/sanityzacji dla formularzy publicznych (lead, order, brief, audit).
// Bez tego dane od użytkownika lądowały 1:1 w treści maila jako HTML (mail/HTML injection).

export function escapeHtml(input: unknown): string {
    return String(input ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

// Świadomie węższy niż "cokolwiek z małpą". Odrzuca znaki, których dostawca
// poczty nie przyjmie w polu reply_to (nawiasy kątowe, przecinki, średniki,
// cudzysłowy) — lepiej od razu poprosić klienta o poprawny adres, niż przyjąć
// zgłoszenie i wywrócić się dopiero przy wysyłce powiadomienia.
const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/

/** Obcina białe znaki i sprowadza do małych liter. Klienci wklejają adresy ze spacjami. */
export function normalizeEmail(email: unknown): string {
    return typeof email === "string" ? email.trim().toLowerCase() : ""
}

export function isValidEmail(email: unknown): email is string {
    if (typeof email !== "string") return false
    const value = email.trim()
    return value.length <= 254 && !value.includes("..") && EMAIL_RE.test(value)
}

// Tylko http(s) — blokuje javascript:/data: itp. wstrzyknięte w pole "url" (audyt strony)
export function isSafeHttpUrl(url: unknown): url is string {
    if (typeof url !== "string" || url.length > 2048) return false
    try {
        const parsed = new URL(url.match(/^https?:\/\//i) ? url : `https://${url}`)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
        return false
    }
}

// Honeypot: puste pole niewidoczne dla ludzi, boty je wypełniają.
// Sprawdzane po stronie serwera, bo front-end można pominąć wysyłając POST bezpośrednio.
export function isHoneypotTripped(value: unknown): boolean {
    return typeof value === "string" && value.trim().length > 0
}
