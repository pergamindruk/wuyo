import { NextRequest, NextResponse } from "next/server";
import { sendEmail, FROM_NOTIFICATION, FROM_CLIENT, TO_MATEUSZ } from "@/lib/email";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, isValidEmail, isHoneypotTripped, normalizeEmail } from "@/lib/sanitize";
import { sourceForVisitor, visitorId } from "@/lib/visitor";
import { pricedLine, type PricedLine } from "@/data/print-products";
import { ORDERS_OPEN, ORDERS_CLOSED_MESSAGE } from "@/data/orders-status";

// Pozycje mają ceny policzone na serwerze z @/data/print-products.
// Cena z przeglądarki jest tylko podglądem i tutaj w ogóle nie wchodzi.
interface OrderData {
    items: PricedLine[];
    name: string;
    email: string;
    note: string;
}

const LEAD_TYPE = "Zamówienie druku";
const MAX_ITEMS = 20;
const NAME_MAX = 200;
const NOTE_MAX = 2000;
const DETAILS_MAX = 2000;
// Ten sam koszyk od tej samej osoby w tym oknie to ponowne kliknięcie albo
// ponowienie po błędzie sieci, nie nowe zamówienie.
const DUPLICATE_WINDOW_MS = 10 * 60_000;

function priceLabel(item: PricedLine): string {
    if (item.priceNum === 0) return "wycena indywidualna";
    return `${item.priceNum} zł`;
}

function variantLabel(item: PricedLine): string {
    return item.withDesign ? `${item.qty}, z projektem` : `${item.qty}, bez projektu`;
}

// Treść zamówienia do kolumny `details`: wpis w CRM ma wystarczyć bez maila.
function buildDetails(d: OrderData): string {
    const lines = d.items.map((i) => `${i.productName} (${variantLabel(i)}): ${priceLabel(i)}`).join("; ");
    const total = d.items.reduce((sum, i) => sum + i.priceNum, 0);
    const hasCustom = d.items.some((i) => i.priceNum === 0);
    const sum = total > 0 ? `${total} zł${hasCustom ? " + pozycje z wyceną indywidualną" : ""}` : "do wyceny";
    const rabat = d.items.length >= 2 ? " | Rabat -15% na każdy kolejny produkt do ustalenia" : "";
    return `Pozycje: ${lines} | Suma orientacyjna: ${sum}${rabat} | Notatka: ${d.note || "Brak"}`.slice(0, DETAILS_MAX);
}

function buildOrderHtml(d: OrderData): string {
    const hasMultiple = d.items.length >= 2;
    const totalNum = d.items.reduce((sum, item) => sum + item.priceNum, 0);
    const hasCustom = d.items.some((item) => item.priceNum === 0);

    const itemRows = d.items
        .map(
            (item) => `
            <tr>
                <td style="padding: 10px 14px; color: #eee; font-size: 14px; border-bottom: 1px solid #2a2a3e;">${escapeHtml(item.productName)}</td>
                <td style="padding: 10px 14px; color: #aaa; font-size: 14px; border-bottom: 1px solid #2a2a3e;">${escapeHtml(variantLabel(item))}</td>
                <td style="padding: 10px 14px; color: ${item.priceNum === 0 ? "#888" : "#FFD700"}; font-size: 14px; font-weight: 700; border-bottom: 1px solid #2a2a3e; text-align: right; white-space: nowrap;">${
                    escapeHtml(priceLabel(item))
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
                <p style="color: #eee; font-size: 14px; margin: 0; white-space: pre-wrap;">${escapeHtml(d.note)}</p>
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

                <h2 style="color: #fff; font-size: 18px; margin: 0 0 4px 0;">${escapeHtml(d.name)}</h2>
                <p style="color: #FFD700; margin: 0 0 28px 0; font-size: 14px;">
                    <a href="mailto:${encodeURIComponent(d.email)}" style="color: #FFD700;">${escapeHtml(d.email)}</a>
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
    const firstName = escapeHtml(d.name.split(" ")[0] ?? "Hej");
    const hasMultiple = d.items.length >= 2;

    const itemList = d.items
        .map(
            (item) =>
                `<li style="padding: 8px 0; border-bottom: 1px solid #1e293b; color: #e2e8f0; font-size: 14px;">
                    <strong style="color:#d99e28;">${escapeHtml(item.productName)}</strong>
                    <span style="color:#94a3b8;"> — ${escapeHtml(variantLabel(item))} &nbsp; </span>
                    <span style="color:${item.priceNum === 0 ? "#64748b" : "#d99e28"}; font-weight: 700;">${
                        escapeHtml(priceLabel(item))
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
    // Blokada na serwerze: obejmuje też strony otwarte przed wyłączeniem zamówień.
    if (!ORDERS_OPEN) {
        return NextResponse.json({ error: ORDERS_CLOSED_MESSAGE }, { status: 503 });
    }

    const ip = getClientIp(req);

    // Klucz serwisowy: tabela `leads` ma RLS, anon nie ma do niej dostępu.
    // Baza jest dodatkiem do maila, nie warunkiem: bez niej zamówienie i tak dochodzi pocztą.
    let supabase: ReturnType<typeof createAdminClient> | null = null;
    try {
        supabase = createAdminClient();
    } catch (error) {
        console.error("Zamówienie: brak połączenia z bazą, pójdzie tylko mailem:", error);
    }

    if (!(await rateLimit(supabase, `order:${ip}`, LIMITS.brief.limit, LIMITS.brief.windowMs))) {
        return NextResponse.json(
            { error: "Za dużo zapytań. Spróbuj za chwilę." },
            { status: 429, headers: { "Retry-After": "60" } }
        );
    }

    try {
        const body = await req.json();

        if (isHoneypotTripped(body?.hp)) {
            return NextResponse.json({ success: true }); // cicho odrzucamy bota
        }
        const name = typeof body?.name === "string" ? body.name.trim().slice(0, NAME_MAX) : "";
        if (!name) {
            return NextResponse.json({ error: "Podaj imię, żebym wiedział jak się do Ciebie zwracać." }, { status: 400 });
        }
        if (!isValidEmail(body?.email)) {
            return NextResponse.json({ error: "Sprawdź adres e-mail — coś się w nim nie zgadza." }, { status: 400 });
        }
        if (!Array.isArray(body.items) || body.items.length === 0) {
            return NextResponse.json({ error: "Koszyk jest pusty" }, { status: 400 });
        }
        if (body.items.length > MAX_ITEMS) {
            return NextResponse.json({ error: "Za dużo pozycji w koszyku. Napisz do mnie, wycenię to osobno." }, { status: 400 });
        }
        const items = (body.items as unknown[]).map(pricedLine);
        if (items.some((i) => i === null)) {
            return NextResponse.json(
                { error: "Któraś pozycja w koszyku jest nieaktualna. Odśwież stronę i dodaj ją jeszcze raz." },
                { status: 400 }
            );
        }

        const data: OrderData = {
            items: items as PricedLine[],
            name,
            email: normalizeEmail(body.email),
            note: typeof body.note === "string" ? body.note.trim().slice(0, NOTE_MAX) : "",
        };
        const details = buildDetails(data);

        if (supabase) {
            try {
                const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
                const { data: earlier, error: dupError } = await supabase
                    .from("leads")
                    .select("id")
                    .eq("email", data.email)
                    .eq("type", LEAD_TYPE)
                    .eq("details", details)
                    .gte("created_at", since)
                    .limit(1);
                if (dupError) {
                    console.error("Zamówienie: nie udało się sprawdzić duplikatu:", dupError);
                } else if (earlier && earlier.length > 0) {
                    // To zamówienie już jest w CRM. Drugi wpis i drugi komplet maili nic nie dadzą.
                    return NextResponse.json({ success: true });
                }

                const visitor = visitorId(req);
                const { error: dbError } = await supabase.from("leads").insert([{
                    name: data.name,
                    email: data.email,
                    type: LEAD_TYPE,
                    details,
                    visitor,
                    source: await sourceForVisitor(supabase, visitor),
                }]);
                if (dbError) console.error("Database save error (order):", dbError);
            } catch (dbError) {
                console.error("Database save error (order):", dbError);
            }
        }

        const firstName = data.name.split(" ")[0] || data.name;

        await sendEmail({
            from: FROM_NOTIFICATION,
            to: TO_MATEUSZ,
            replyTo: data.email,
            subject: `🛒 Nowe zamówienie druku — ${data.name}`,
            html: buildOrderHtml(data),
        }, "zamowienie-powiadomienie");

        // Powiadomienie doszło, więc zamówienie jest przyjęte. Błąd potwierdzenia
        // dla klienta nie może zwrócić 500, bo klient wysłałby koszyk drugi raz.
        try {
            await sendEmail({
                from: FROM_CLIENT,
                to: data.email,
                subject: `Hej ${firstName}! Dostałem Twoje zamówienie 🎉`,
                html: buildAutoReplyHtml(data),
            }, "zamowienie-autoodpowiedz");
        } catch (error) {
            console.error("Zamówienie: autoodpowiedź nie wyszła, powiadomienie doszło:", error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Order API error:", error);
        return NextResponse.json({ error: "Błąd wysyłki" }, { status: 500 });
    }
}
