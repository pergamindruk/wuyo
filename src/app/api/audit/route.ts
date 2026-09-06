import { NextRequest, NextResponse } from "next/server";
import { sendEmail, FROM_NOTIFICATION, TO_MATEUSZ } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { escapeHtml, isValidEmail, isSafeHttpUrl, isHoneypotTripped, normalizeEmail } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
    const ip = getClientIp(req)
    const supabase = await createClient();

    if (!(await rateLimit(supabase, `audit:${ip}`, LIMITS.audit.limit, LIMITS.audit.windowMs))) {
        return NextResponse.json({ error: "Za dużo zapytań. Spróbuj za chwilę." }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    try {
        const { url, email, hp } = await req.json();

        if (isHoneypotTripped(hp)) {
            return NextResponse.json({ success: true }); // cicho odrzucamy bota
        }
        if (!isSafeHttpUrl(url)) {
            return NextResponse.json({ error: "Sprawdź adres strony — potrzebuję pełnego linku." }, { status: 400 });
        }
        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Sprawdź adres e-mail — coś się w nim nie zgadza." }, { status: 400 });
        }
        const emailClean = normalizeEmail(email);

        const { error: dbError } = await supabase
            .from('leads')
            .insert([{
                name: 'Zgłoszenie Audytu',
                email,
                type: 'Audit',
                details: `URL: ${url}`
            }]);

        if (dbError) console.error("Database save error (audit):", dbError);

        const safeEmail = escapeHtml(email);
        const safeUrl = escapeHtml(url);

        await sendEmail({
            from: FROM_NOTIFICATION,
            to: TO_MATEUSZ,
            replyTo: emailClean,
            subject: `🔍 Nowe zgłoszenie do Audytu Bez Znieczulenia`,
            html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;"><div style="max-width:560px;margin:30px auto;background:#111;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;"><div style="background:linear-gradient(135deg,#1a0505 0%,#2a0a0a 100%);padding:28px 36px;"><p style="color:#ef4444;text-transform:uppercase;letter-spacing:2px;font-size:11px;margin:0 0 6px 0;">Audyt Bez Znieczulenia</p><h1 style="color:#ffffff;margin:0;font-size:22px;">Nowe zgłoszenie na stronie</h1></div><div style="padding:28px 36px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;width:30%;border-bottom:1px solid #222;">E-mail klienta</td><td style="padding:10px 0;color:#eee;font-size:14px;border-bottom:1px solid #222;"><a href="mailto:${encodeURIComponent(email)}" style="color:#FFD700;">${safeEmail}</a></td></tr><tr><td style="padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #222;">Link do strony</td><td style="padding:10px 0;color:#eee;font-size:14px;border-bottom:1px solid #222;"><a href="${safeUrl}" style="color:#ef4444;">${safeUrl}</a></td></tr></table><p style="color:#555;font-size:13px;margin-top:20px;">Odpowiedz bezpośrednio na tego maila — trafi do klienta.</p></div><div style="padding:16px 36px;border-top:1px solid #222;text-align:center;"><p style="color:#444;font-size:11px;margin:0;">Wuyo – Dobra Grafa · ${new Date().toLocaleString("pl-PL")}</p></div></div></body></html>`,
        }, "audyt-powiadomienie");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Audit API error:", error);
        return NextResponse.json({ error: "Błąd wysyłki" }, { status: 500 });
    }
}
