import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";

// Technical update to trigger Vercel redeploy with new Env Vars

interface BriefData {
    path: "branding" | "web" | "quick";
    companyName?: string;
    industry?: string;
    audience?: string[];
    inspiration?: string;
    siteType?: string;
    hasBranding?: string;
    webInspiration?: string;
    quickMessage?: string;
    name?: string;
    email?: string;
    note?: string;
    budget?: string;
}

const siteTypeLabel: Record<string, string> = {
    wizytowka: "Wizytówka / One-pager",
    landing: "Landing Page",
    wielostronicowa: "Strona wielostronicowa",
    sklep: "Sklep internetowy",
};

const brandingLabel: Record<string, string> = {
    tak_pelny: "Tak, mam gotowy branding (logo, kolory, fonty)",
    tak_czesc: "Mam tylko logo, reszta do ustalenia",
    nie: "Nie, budujemy od zera",
};

const pathLabel: Record<string, string> = {
    branding: "🎨 Logo / Identyfikacja wizualna",
    web: "🌐 Strona WWW",
    quick: "💬 Szybkie zapytanie",
};

function buildHtml(d: BriefData): string {
    const rows: [string, string][] = [];

    if (d.path === "branding") {
        rows.push(["Nazwa firmy/marki", d.companyName ?? "—"]);
        rows.push(["Branża / co robi", d.industry ?? "—"]);
        rows.push(["Grupa docelowa", (d.audience?.join(", ")) || "—"]);
        rows.push(["Inspiracje / podobające się marki", d.inspiration ?? "—"]);
    }
    if (d.path === "web") {
        rows.push(["Typ strony", siteTypeLabel[d.siteType ?? ""] ?? d.siteType ?? "—"]);
        rows.push(["Posiadany branding", brandingLabel[d.hasBranding ?? ""] ?? d.hasBranding ?? "—"]);
        rows.push(["Inspiracje stron WWW", d.webInspiration ?? "—"]);
    }
    if (d.path === "quick") {
        rows.push(["Wiadomość", d.quickMessage ?? "—"]);
    }

    rows.push(["Budżet orientacyjny", d.budget ?? "Nie podano"]);
    if (d.note) rows.push(["Dodatkowe uwagi", d.note]);

    const tableRows = rows
        .map(([k, v]) => `
            <tr>
                <td style="padding: 10px 14px; background: #1a1a2e; color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 35%; border-bottom: 1px solid #2a2a3e;">${k}</td>
                <td style="padding: 10px 14px; color: #eee; font-size: 14px; border-bottom: 1px solid #2a2a3e; white-space: pre-wrap;">${v}</td>
            </tr>`)
        .join("");

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width:600px; margin:30px auto; background:#111; border-radius:16px; overflow:hidden; border:1px solid #2a2a2a;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a0a 100%); padding: 32px 40px;">
                <p style="color: #FFD700; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; margin: 0 0 8px 0;">Nowy Brief ze strony</p>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Wuyo – Dobra Grafa</h1>
            </div>
            <div style="padding: 32px 40px;">
                <div style="background: #FFD700; display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #000; margin-bottom: 24px;">
                    ${pathLabel[d.path]}
                </div>
                <h2 style="color: #fff; font-size: 18px; margin: 0 0 4px 0;">${d.name ?? "Nieznany"}</h2>
                <p style="color: #FFD700; margin: 0 0 24px 0; font-size: 14px;">
                    <a href="mailto:${d.email}" style="color: #FFD700;">${d.email ?? "—"}</a>
                </p>
                <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden;">
                    ${tableRows}
                </table>
            </div>
            <div style="padding: 20px 40px; border-top: 1px solid #2a2a2a; text-align: center;">
                <p style="color:#444; font-size:11px; margin:0;">Brief wysłany przez formularz na wuyo.pl &nbsp;·&nbsp; ${new Date().toLocaleString("pl-PL")}</p>
            </div>
        </div>
    </body>
    </html>`;
}

function buildAutoReply(d: BriefData): string {
    const firstName = d.name?.split(" ")[0] ?? "Hej";
    const serviceMap: Record<string, string> = {
        branding: "logo i identyfikację wizualną",
        web: "stronę internetową",
        quick: "projekt",
    };
    const service = serviceMap[d.path] ?? "projekt";

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width:560px; margin:30px auto; background:#111827; border-radius:16px; overflow:hidden; border:1px solid #1f2937;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%); padding: 36px 40px; text-align:center;">
                <p style="color: #d99e28; text-transform: uppercase; letter-spacing: 3px; font-size: 11px; margin: 0 0 10px 0; font-weight:700;">WUYO – Dobra Grafa</p>
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight:800; line-height:1.3;">Brief dotarł! 🎉</h1>
            </div>

            <!-- Body -->
            <div style="padding: 36px 40px;">
                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                    Hej <strong style="color:#d99e28;">${firstName}</strong>!
                </p>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 16px 0;">
                    Dostałem Twoje zapytanie o <strong style="color:#e2e8f0;">${service}</strong>. Przejrzę je dzisiaj i odezwę się z wyceną oraz propozycją kolejnych kroków.
                </p>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                    Zazwyczaj odpowiadam w ciągu <strong style="color:#d99e28;">kilku godzin</strong>, najpóźniej do następnego ranka.
                </p>

                <!-- CTA box -->
                <div style="background:#1e293b; border:1px solid #d99e28; border-radius:12px; padding:20px 24px; margin-bottom:28px;">
                    <p style="color:#d99e28; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Masz pytanie na już?</p>
                    <p style="color:#e2e8f0; font-size:14px; margin:0 0 12px 0;">Napisz na WhatsApp — odpisuję szybciej niż na maila.</p>
                    <a href="https://wa.me/48725182053" style="display:inline-block; background:#d99e28; color:#000; padding:10px 24px; border-radius:999px; text-decoration:none; font-weight:700; font-size:14px;">
                        📱 WhatsApp: 725 182 053
                    </a>
                </div>

                <!-- Footer note -->
                <p style="color:#475569; font-size:13px; line-height:1.7; margin:0;">
                    Do zobaczenia wkrótce!<br/>
                    <strong style="color:#94a3b8;">Mateusz</strong> z WUYO
                </p>
            </div>

            <!-- Bottom bar -->
            <div style="padding:16px 40px; border-top:1px solid #1e293b; text-align:center;">
                <p style="color:#374151; font-size:11px; margin:0;">
                    <a href="https://wuyo.pl" style="color:#d99e28; text-decoration:none;">wuyo.pl</a>
                    &nbsp;·&nbsp; Rzeszów & cała Polska
                </p>
            </div>
        </div>
    </body>
    </html>`;
}

export async function POST(req: NextRequest) {
    const ip = getClientIp(req)
    if (!rateLimit(`brief:${ip}`, LIMITS.brief.limit, LIMITS.brief.windowMs)) {
        return NextResponse.json({ error: "Za dużo zapytań. Spróbuj za chwilę." }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    try {
        const data: BriefData = await req.json();

        if (!data.email || !data.name) {
            return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const supabase = await createClient();
        const typeLabel: Record<string, string> = {
            branding: 'Branding',
            web: 'Strona WWW',
            quick: 'Szybki Kontakt'
        };

        const { error: dbError } = await supabase
            .from('leads')
            .insert([{
                name: data.name,
                email: data.email,
                type: typeLabel[data.path] || data.path,
                details: `Budżet: ${data.budget || 'Brak'}. Notatka: ${data.note || 'Brak'}`
            }]);

        if (dbError) console.error("Database save error (brief):", dbError);


        const pathNames: Record<string, string> = {
            branding: "Logo/Identyfikacja",
            web: "Strona WWW",
            quick: "Szybkie zapytanie",
        };

        const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER;

        // Email do Mateusza
        await transporter.sendMail({
            from: `"Wuyo Brief" <${fromEmail}>`,
            to: "kontakt@wuyo.pl",
            replyTo: data.email,
            subject: `📋 Nowy Brief: ${pathNames[data.path] ?? data.path} — ${data.name}`,
            html: buildHtml(data),
        });

        // Auto-reply do klienta
        await transporter.sendMail({
            from: `"Mateusz z WUYO" <${fromEmail}>`,
            to: data.email,
            subject: `Cześć ${data.name?.split(" ")[0] ?? ""}! Dostałem Twój brief 👋`,
            html: buildAutoReply(data),
        });

        // Dodaj do Mailerlite
        try {
            const mlRes = await fetch('https://connect.mailerlite.com/api/subscribers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
                },
                body: JSON.stringify({
                    email: data.email,
                    fields: { name: data.name },
                    groups: [process.env.MAILERLITE_GROUP_ID],
                }),
            });
            if (!mlRes.ok) {
                const mlErr = await mlRes.text();
                console.error('Mailerlite error:', mlRes.status, mlErr);
            } else {
                console.log('Mailerlite: subscriber added OK');
            }
        } catch (mlErr) {
            console.error('Mailerlite fetch error:', mlErr);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Brief API error:", error);
        return NextResponse.json({ error: "Błąd wysyłki" }, { status: 500 });
    }
}
