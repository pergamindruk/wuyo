import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { url, email } = await req.json();

        if (!email || !url) {
            return NextResponse.json({ error: "Brak wymaganych pól" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT || "465"),
            secure: true,
            auth: {
                user: process.env.EMAIL_USER || process.env.GMAIL_USER,
                pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
            },
        });

        const fromEmail = process.env.EMAIL_USER || process.env.GMAIL_USER;

        await transporter.sendMail({
            from: `"Wuyo Audyt" <${fromEmail}>`,
            to: process.env.LEAD_EMAIL ?? fromEmail,
            replyTo: email,
            subject: `🔍 Nowe zgłoszenie do Audytu Bez Znieczulenia`,
            html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0; padding:0; background:#0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
                <div style="max-width:560px; margin:30px auto; background:#111; border-radius:16px; overflow:hidden; border:1px solid #2a2a2a;">
                    <div style="background: linear-gradient(135deg, #1a0505 0%, #2a0a0a 100%); padding: 28px 36px;">
                        <p style="color: #ef4444; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; margin: 0 0 6px 0;">Audyt Bez Znieczulenia</p>
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Nowe zgłoszenie na stronie</h1>
                    </div>
                    <div style="padding: 28px 36px;">
                        <table style="width:100%; border-collapse:collapse;">
                            <tr>
                                <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; width: 30%; border-bottom: 1px solid #222;">E-mail klienta</td>
                                <td style="padding: 10px 0; color: #eee; font-size: 14px; border-bottom: 1px solid #222;">
                                    <a href="mailto:${email}" style="color: #FFD700;">${email}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #222;">Link do strony</td>
                                <td style="padding: 10px 0; color: #eee; font-size: 14px; border-bottom: 1px solid #222;">
                                    <a href="${url}" target="_blank" style="color: #ef4444;">${url}</a>
                                </td>
                            </tr>
                        </table>
                        <p style="color: #555; font-size: 13px; margin-top: 20px;">
                            Odpowiedz bezpośrednio na tego maila — trafi do klienta.
                        </p>
                    </div>
                    <div style="padding: 16px 36px; border-top: 1px solid #222; text-align: center;">
                        <p style="color:#444; font-size:11px; margin:0;">Wuyo – Dobra Grafa · ${new Date().toLocaleString("pl-PL")}</p>
                    </div>
                </div>
            </body>
            </html>`,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Audit API error:", error);
        return NextResponse.json({ error: "Błąd wysyłki" }, { status: 500 });
    }
}
