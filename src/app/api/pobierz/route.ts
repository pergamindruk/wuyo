import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { sendEmail, FROM_CLIENT, FROM_NOTIFICATION, TO_MATEUSZ } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, isHoneypotTripped, isValidEmail, normalizeEmail } from "@/lib/sanitize";
import { findDownload, MARKETING_CONSENT_TEXT } from "@/data/downloads";
import { sourceForVisitor, visitorId } from "@/lib/visitor";

const SITE = "https://wuyo.pl";

/**
 * Prośba o plik: zapisuje e-mail i wysyła link do pobrania na ten adres.
 * Plik dostaje tylko ktoś, kto otworzył maila, więc każdy adres w tabeli
 * downloads z confirmed_at jest prawdziwy, a każde pobranie policzone.
 */
export async function POST(req: NextRequest) {
    const db = createAdminClient();
    if (!(await rateLimit(db, `download:${getClientIp(req)}`, LIMITS.download.limit, LIMITS.download.windowMs))) {
        return NextResponse.json({ error: "Za dużo prób. Spróbuj za kilka minut." }, { status: 429 });
    }

    try {
        const body = await req.json();
        if (isHoneypotTripped(body.website)) return NextResponse.json({ ok: true });

        const plik = findDownload(String(body.slug ?? ""));
        if (!plik) return NextResponse.json({ error: "Nie ma takiego pliku." }, { status: 404 });
        if (!isValidEmail(body.email)) return NextResponse.json({ error: "Sprawdź adres e-mail." }, { status: 400 });

        const email = normalizeEmail(body.email);
        const zgoda = body.zgoda === true;
        const page = typeof body.page === "string" ? body.page.slice(0, 300) : null;
        const visitor = visitorId(req);
        const source = await sourceForVisitor(db, visitor);
        const token = randomBytes(24).toString("hex");

        const { error } = await db.from("downloads").insert({
            file: plik.slug, email, marketing_consent: zgoda, consent_text: zgoda ? MARKETING_CONSENT_TEXT : null,
            token, page, visitor, source,
        });
        if (error) throw new Error(error.message);

        const link = `${SITE}/api/pobierz/${token}`;
        await sendEmail({
            from: FROM_CLIENT,
            to: email,
            subject: `Twój plik: ${plik.title}`,
            html: `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1b17;line-height:1.6">
  <p>Dzień dobry,</p>
  <p>dziękuję za zainteresowanie. Twój plik czeka pod tym przyciskiem:</p>
  <p style="margin:28px 0"><a href="${link}" style="background:#ffeb52;color:#1c1b17;font-weight:bold;padding:12px 24px;border-radius:999px;text-decoration:none">Pobierz: ${escapeHtml(plik.title)}</a></p>
  <p>Link działa przez 30 dni. Masz pytanie do projektu albo chcesz wycenę? Po prostu odpisz na tego maila.</p>
  <p>Mateusz<br>WUYO, Rzeszów<br><a href="${SITE}" style="color:#1c1b17">wuyo.pl</a></p>
  <p style="font-size:12px;color:#777;margin-top:32px">Dostajesz tę wiadomość, bo ktoś podał ten adres na wuyo.pl, żeby pobrać plik.${zgoda ? " Zgodziłeś się też na maile z poradami i ofertami. Żeby się wypisać, odpisz „wypisz”." : ""} Szczegóły: <a href="${SITE}/polityka-prywatnosci" style="color:#777">polityka prywatności</a>.</p>
</div>`,
        }, "pobierz");

        await sendEmail({
            from: FROM_NOTIFICATION,
            to: TO_MATEUSZ,
            replyTo: email,
            subject: `Pobranie: ${plik.slug} (${email})`,
            html: `<p>Ktoś poprosił o plik <b>${escapeHtml(plik.title)}</b>.</p>
<ul><li>E-mail: ${escapeHtml(email)}</li><li>Zgoda na maile z ofertą: <b>${zgoda ? "TAK" : "nie"}</b></li>
<li>Źródło wejścia: ${escapeHtml(source)}</li><li>Strona: ${escapeHtml(page ?? "?")}</li></ul>
<p>Licznik pobrań: <a href="${SITE}/lab/analytics">/lab/analytics</a></p>`,
        }, "pobierz-powiadomienie").catch(() => { /* powiadomienie nie blokuje wysyłki pliku */ });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error("[pobierz]", e);
        return NextResponse.json({ error: "Nie udało się wysłać maila. Spróbuj jeszcze raz albo napisz na kontakt@wuyo.pl." }, { status: 500 });
    }
}
