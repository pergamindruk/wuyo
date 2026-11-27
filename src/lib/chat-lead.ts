// Tylko serwer. Lead z czatu razem z treścią rozmowy: zapis w bazie i powiadomienie.
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, LIMITS } from "@/lib/rate-limit";
import { sendEmail, FROM_NOTIFICATION, TO_MATEUSZ } from "@/lib/email";
import { escapeHtml, isValidEmail, normalizeEmail } from "@/lib/sanitize";
import { sourceForVisitor } from "@/lib/visitor";

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

/** Identyfikator jednej rozmowy z okienka czatu (crypto.randomUUID w przeglądarce). */
export function isChatId(value: unknown): value is string {
    return typeof value === "string" && /^[A-Za-z0-9-]{8,64}$/.test(value);
}

const SPEAKER: Record<ChatMessage["role"], string> = { user: "Klient", assistant: "Czat" };
const LEAD_TAG = /\[LEAD:[^\]]+\]/g;

/** Wiadomości od pierwszej wiadomości klienta. Powitanie bota jest zawsze takie samo, więc go pomijamy. */
function fromFirstUser(messages: ChatMessage[]): ChatMessage[] {
    const start = messages.findIndex((m) => m.role === "user");
    if (start < 0) return [];
    return messages
        .slice(start)
        .map((m) => ({ role: m.role, content: m.content.replace(LEAD_TAG, "").trim() }))
        .filter((m) => m.content);
}

/**
 * Rozmowa jako zwykły tekst do leads.details. Zaczyna się od pierwszej wiadomości
 * klienta, więc w zwiniętym widoku /lab/crm od razu widać, o co pytał.
 */
export function chatTranscript(messages: ChatMessage[]): string {
    return fromFirstUser(messages)
        .map((m) => `${SPEAKER[m.role]}: ${m.content}`)
        .join("\n\n");
}

function transcriptHtml(messages: ChatMessage[]): string {
    return fromFirstUser(messages)
        .map((m) => {
            const isUser = m.role === "user";
            return `<div style="margin: 0 0 10px; padding: 10px 12px; border-radius: 10px; background: ${isUser ? "#2a2410" : "#1a1a1a"}; color: #fff; white-space: pre-wrap; line-height: 1.5;"><strong style="color: ${isUser ? "#FFD700" : "#aaa"};">${SPEAKER[m.role]}</strong><br>${escapeHtml(m.content)}</div>`;
        })
        .join("");
}

/**
 * Lead z czatu. Pierwszy raz: nowy wiersz w leads z całą rozmową + mail i Telegram.
 * Ten sam czat podał kontakt drugi raz: aktualizacja tego samego leada, bez drugiego maila.
 */
export async function saveChatLead(input: {
    name: string;
    email: string;
    chatId: string | null;
    messages: ChatMessage[];
    visitor: string;
    ip: string;
}): Promise<void> {
    const { name, email, chatId, messages, visitor, ip } = input;
    if (!name.trim() || !isValidEmail(email)) return;

    const db = createAdminClient();
    const details = chatTranscript(messages) || "Lead z czatu, bez treści rozmowy.";

    if (chatId) {
        const { data: existing } = await db.from("leads").select("id").eq("chat_id", chatId).maybeSingle();
        if (existing) {
            const { error } = await db.from("leads").update({ name, email, details }).eq("id", existing.id);
            if (error) console.error("Aktualizacja leada z czatu:", error);
            return;
        }
    }

    if (!(await rateLimit(db, `lead:${ip}`, LIMITS.lead.limit, LIMITS.lead.windowMs))) {
        console.warn("Lead z czatu pominięty: limit zapytań dla tego adresu");
        return;
    }

    const { error } = await db.from("leads").insert([{
        name,
        email,
        type: "Chatbot",
        details,
        chat_id: chatId,
        visitor,
        source: await sourceForVisitor(db, visitor),
    }]);
    // Błąd bazy nie zatrzymuje maila: kontakt do klienta jest ważniejszy niż wiersz w tabeli.
    if (error) console.error("Zapis leada z czatu:", error);

    const safeName = escapeHtml(name);
    const date = new Date().toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
    const rozmowa = transcriptHtml(messages);

    await sendEmail({
        from: FROM_NOTIFICATION,
        to: TO_MATEUSZ,
        replyTo: normalizeEmail(email),
        subject: `🔥 Nowy lead z chatbota: ${safeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 12px;">
            <h1 style="color: #FFD700; margin-bottom: 8px;">🔥 Nowy lead z chatbota!</h1>
            <p style="color: #aaa; margin-bottom: 24px;">Ktoś zostawił swoje dane w czacie na Twojej stronie.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; background: #1a1a1a; color: #FFD700; font-weight: bold;">👤 Imię</td>
                <td style="padding: 12px; background: #1a1a1a; color: #fff;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #111; color: #FFD700; font-weight: bold;">📧 E-mail</td>
                <td style="padding: 12px; background: #111; color: #fff;"><a href="mailto:${encodeURIComponent(email)}" style="color: #FFD700;">${escapeHtml(email)}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #1a1a1a; color: #FFD700; font-weight: bold;">🕐 Data</td>
                <td style="padding: 12px; background: #1a1a1a; color: #fff;">${date}</td>
              </tr>
            </table>
            <h2 style="color: #FFD700; font-size: 16px; margin: 28px 0 12px;">💬 Rozmowa</h2>
            ${rozmowa || '<p style="color: #aaa;">Brak treści rozmowy.</p>'}
            <p style="margin-top: 24px; color: #aaa; font-size: 14px;">Jeśli klient pisał dalej, pełna rozmowa jest w panelu: <a href="https://wuyo.pl/lab/crm" style="color: #FFD700;">Zapytania</a> (kolumna Detale).</p>
          </div>
        `,
    }, "lead-powiadomienie", name);
}

/**
 * Klient pisze dalej po zostawieniu kontaktu: dopisujemy rozmowę do jego leada.
 * Bez adresu e-mail w wiadomościach klienta leada nie ma, więc nie pytamy bazy.
 */
export async function updateChatTranscript(chatId: string, messages: ChatMessage[]): Promise<void> {
    if (!messages.some((m) => m.role === "user" && m.content.includes("@"))) return;
    const details = chatTranscript(messages);
    if (!details) return;

    const db = createAdminClient();
    const { error } = await db.from("leads").update({ details }).eq("chat_id", chatId);
    if (error) console.error("Dopisanie rozmowy do leada:", error);
}
