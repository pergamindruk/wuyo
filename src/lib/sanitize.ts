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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: unknown): email is string {
    return typeof email === "string" && email.length <= 254 && EMAIL_RE.test(email)
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
