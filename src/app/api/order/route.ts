import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";

interface CartItem {
    productId: string;
    productName: string;
    qty: string;
    price: string;
    priceNum: number;
}

interface OrderData {
    items: CartItem[];
    name: string;
    email: string;
    note: string;
}

function buildOrderHtml(d: OrderData): string {
    const hasMultiple = d.items.length >= 2;
    const totalNum = d.items.reduce((sum, item) => sum + item.priceNum, 0);
    const hasCustom = d.items.some((item) => item.priceNum === 0);

    const itemRows = d.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 10px 14px; color: #eee; font-size: 14px; border-bottom: 1px solid #2a2a3e;">${item.productName}</td>
                <td style="padding: 10px 14px; color: #aaa; font-size: 14px; border-bottom: 1px solid #2a2a3e;">${item.qty}</td>
                <td style="padding: 10px 14px; color: ${item.priceNum === 0 ? "#888" : "#FFD700"}; font-size: 14px; font-weight: 700; border-bottom: 1px solid #2a2a3e; text-align: right; white-space: nowrap;">${
                    item.priceNum === 0 ? "wycena indywidualna" : item.price
                }</td>
            </tr>`
        )
        .join("");

    const discountRow = hasMultiple
        ? `<tr>
                <td colspan="2" style="padding: 10px 14px; color: #FFD700; font-size: 13px; font-style: italic; border-bottom: 1px solid #2a2a3e;">Rabat -15% na każdy kolejny produkt</td>
                <td style="padding: 10px 14px; color: #FFD700; font-size: 13px; text-align: right; border-bottom: 1px solid #2a2a3e;">do ustalenia</td>
            </tr>`
        : "";

    const totalSection = totalNum > 0
        ? `<p style="color: #aaa; font-size: 14px; margin: 0 0 8px 0;">
                Suma orientacyjna: <strong style="color: #FFD700; font-size: 16px;">${totalNum} zł</strong>
                ${hasCustom ? `<br/><span style="color: #666; font-size: 12px;">+ pozycje z wyceną indywidualną po kontakcie</span>` : ""}
           </p>`
        : `<p style="color: #888; font-size: 14px; margin: 0 0 8px 0;">Wycena zostanie przedstawiona po kontakcie.</p>`;

    const noteSection = d.note
        ? `<div style="margin-top: 24px; background: #1a1a2e; border-radius: 8px; padding: 14px 18px;">
                <p style="color: #aaa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0;">Notatka klienta</p>
                <p style="color: #eee; font-size: 14px; margin: 0; white-space: pre-wrap;">${d.note}</p>
           </div>`
        : "";

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width:600px; margin:30px auto; background:#111; border-radius:16px; overflow:hidden; border:1px solid #2a2a2a;">
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a0a 100%); padding: 32px 40px;">
                <p style="color: #FFD700; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; margin: 0 0 8px 0;">Nowe zamówienie ze strony</p>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Wuyo – Dobra Grafa</h1>
            </div>
            <div style="padding: 32px 40px;">
                <div style="background: #FFD700; display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #000; margin-bottom: 24px;">
                    🛒 Zamówienie druku
                </div>

                <h2 style="color: #fff; font-size: 18px; margin: 0 0 4px 0;">${d.name}</h2>
                <p style="color: #FFD700; margin: 0 0 28px 0; font-size: 14px;">
                    <a href="mailto:${d.email}" style="color: #FFD700;">${d.email}</a>
                </p>

                <table style="width:100%; border-collapse:collapse; border-radius:8px; overflow:hidden; margin-bottom: 20px;">
                    <thead>
                        <tr>
                            <th style="padding: 10px 14px; background: #1a1a2e; color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: left; border-bottom: 1px solid #2a2a3e;">Produkt</th>
                            <th style="padding: 10px 14px; background: #1a1a2e; color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: left; border-bottom: 1px solid #2a2a3e;">Wariant</th>
                            <th style="padding: 10px 14px; background: #1a1a2e; color: #aaa; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; text-align: right; border-bottom: 1px solid #2a2a3e;">Cena</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                        ${discountRow}
                    </tbody>
                </table>

                ${totalSection}
                ${noteSection}
            </div>
            <div style="padding: 20px 40px; border-top: 1px solid #2a2a2a; text-align: center;">
                <p style="color:#444; font-size:11px; margin:0;">Zamówienie wysłane przez konfigurator na wuyo.pl &nbsp;·&nbsp; ${new Date().toLocaleString("pl-PL")}</p>
            </div>
        </div>
    </body>
    </html>`;
}

function buildAutoReplyHtml(d: OrderData): string {
    const firstName = d.name.split(" ")[0] ?? "Hej";
    const hasMultiple = d.items.length >= 2;

    const itemList = d.items
        .map(
            (item) =>
                `<li style="padding: 8px 0; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 14px;">
                    <strong style="color:#d99e28;">${item.productName}</strong>
                    <span style="color:#94a3b8;"> — ${item.qty} &nbsp; </span>
                    <span style="color:${item.priceNum === 0 ? "#64748b" : "#d99e28"}; font-weight: 700;">${
                        item.priceNum === 0 ? "wycena indywidualna" : item.price
                    }</span>
                </li>`
        )
        .join("");

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background:#f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width:560px; margin:30px auto; background:#111827; border-radius:16px; overflow:hidden; border:1px solid #1f2937;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #0f172a 100%); padding: 36px 40px; text-align:center;">
                <p style="color: #d99e28; text-transform: uppercase; letter-spacing: 3px; font-size: 11px; margin: 0 0 10px 0; font-weight:700;">WUYO – Dobra Grafa</p>
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight:800; line-height:1.3;">Zamówienie przyjęte! 🎉</h1>
            </div>

            <!-- Body -->
            <div style="padding: 36px 40px;">
                <p style="color: #e2e8f0; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                    Hej <strong style="color:#d99e28;">${firstName}</strong>!
                </p>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 20px 0;">
                    Dostałem Twoje zamówienie druku. Przejrzę je i odezwę się w ciągu <strong style="color:#d99e28;">24 godzin</strong> z potwierdzeniem i szczegółami realizacji.
                </p>

                <!-- Items -->
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 8px 0;">Zamówione produkty:</p>
                <ul style="list-style: none; margin: 0 0 20px 0; padding: 0; background: #1e293b; border-radius: 10px; overflow: hidden; padding: 0 16px;">
                    ${itemList}
                </ul>

                ${
                    hasMultiple
                        ? `<div style="background: #1e293b; border: 1px solid #d99e28; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px;">
                            <p style="color: #d99e28; font-size: 13px; font-weight: 700; margin: 0;">
                                Rabat -15% na każdy kolejny produkt zostanie uwzględniony w wycenie finalnej.
                            </p>
                           </div>`
                        : ""
                }

                <!-- CTA box -->
                <div style="background:#1e293b; border:1px solid #d99e28; border-radius:12px; padding:20px 24px; margin-bottom:28px;">
                    <p style="color:#d99e28; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin:0 0 6px 0;">Masz pytanie na już?</p>
                    <p style="color:#e2e8f0; font-size:14px; margin:0 0 12px 0;">Napisz na WhatsApp — odpisuję szybciej niż na maila.</p>
                    <a href="https://wa.me/48725182053" style="display:inline-block; background:#d99e28; color:#000; padding:10px 24px; border-radius:999px; text-decoration:none; font-weight:700; font-size:14px;">
                        📱 WhatsApp: 725 182 053
                    </a>
                </div>

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
    const ip = getClientIp(req);
    if (!rateLimit(`order:${ip}`, LIMITS.brief.limit, LIMITS.brief.windowMs)) {
        return NextResponse.json(
            { error: "Za dużo zapytań. Spróbuj za chwilę." },
            { status: 429, headers: { "Retry-After": "60" } }
        );
    }

    try {
        const data: OrderData = await req.json();

        if (!data.name || !data.email) {
            return NextResponse.json({ error: "Brak wymaganych pól: name, email" }, { status: 400 });
        }
        if (!Array.isArray(data.items) || data.items.length === 0) {
            return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const fromEmail = process.env.GMAIL_USER;
        const firstName = data.name.split(" ")[0] ?? data.name;

        // Email do Mateusza
        await transporter.sendMail({
            from: `"Wuyo Zamówienia" <${fromEmail}>`,
            to: "kontakt@wuyo.pl",
            replyTo: data.email,
            subject: `🛒 Nowe zamówienie druku — ${data.name}`,
            html: buildOrderHtml(data),
        });

        // Auto-reply do klienta
        await transporter.sendMail({
            from: `"Mateusz z WUYO" <${fromEmail}>`,
            to: data.email,
            subject: `Hej ${firstName}! Dostałem Twoje zamówienie 🎉`,
            html: buildAutoReplyHtml(data),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Order API error:", error);
        return NextResponse.json({ error: "Błąd wysyłki" }, { status: 500 });
    }
}
