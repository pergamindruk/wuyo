import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

export async function POST(req: NextRequest) {
    try {
        const data: BriefData = await req.json();

        if (!data.email || !data.name) {
            return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "mail.wuyo.pl", // Dynamic host for better SEOHost compatibility
            port: 587, // STARTTLS port for SEOHost
            secure: false, // TLS requires secure: false for port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                ciphers: 'SSLv3', // Sometimes helps with handshake
                rejectUnauthorized: false
            }
        });

        const briefRecord = {
            ...data,
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substring(7)
        };

        // Usunięto zapis do pliku JSON (niekompatybilne z Vercel)


        const pathNames: Record<string, string> = {
            branding: "Logo/Identyfikacja",
            web: "Strona WWW",
            quick: "Szybkie zapytanie",
        };

        const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER;

        await transporter.sendMail({
            from: `"Wuyo Brief" <${fromEmail}>`,
            to: process.env.LEAD_EMAIL || fromEmail,
            replyTo: data.email,
            subject: `📋 Nowy Brief: ${pathNames[data.path] ?? data.path} — ${data.name}`,
            html: buildHtml(data),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Brief API error:", error);
        return NextResponse.json({ error: "Błąd wysyłki" }, { status: 500 });
    }
}
