import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp, LIMITS } from "@/lib/rate-limit";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const ip = getClientIp(req)
    if (!rateLimit(`lead:${ip}`, LIMITS.lead.limit, LIMITS.lead.windowMs)) {
        return NextResponse.json({ error: "Za dużo zapytań." }, { status: 429, headers: { 'Retry-After': '60' } })
    }

    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Brak danych" }, { status: 400 });
        }

        const supabase = await createClient();
        const { error: dbError } = await supabase
            .from('leads')
            .insert([{
                name,
                email,
                type: 'Chatbot',
                details: 'Lead pozyskany przez chatbota AI.'
            }]);

        if (dbError) console.error("Database save error:", dbError);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const fromEmail = process.env.GMAIL_USER;

        // Wyślij email z powiadomieniem
        await transporter.sendMail({
            from: `"Wuyo Chatbot" <${fromEmail}>`,
            to: process.env.LEAD_EMAIL || "kontakt@wuyo.pl",
            subject: `🔥 Nowy lead z chatbota: ${name}`,
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 12px;">
            <h1 style="color: #FFD700; margin-bottom: 8px;">🔥 Nowy lead z chatbota!</h1>
            <p style="color: #aaa; margin-bottom: 24px;">Ktoś zostawił swoje dane w chatbocie na Twojej stronie.</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px; background: #1a1a1a; border-radius: 8px 8px 0 0; color: #FFD700; font-weight: bold;">👤 Imię</td>
                <td style="padding: 12px; background: #1a1a1a; border-radius: 8px 8px 0 0; color: #fff;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #111; color: #FFD700; font-weight: bold;">📧 E-mail</td>
                <td style="padding: 12px; background: #111; color: #fff;"><a href="mailto:${email}" style="color: #FFD700;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 12px; background: #1a1a1a; border-radius: 0 0 8px 8px; color: #FFD700; font-weight: bold;">🕐 Data</td>
                <td style="padding: 12px; background: #1a1a1a; border-radius: 0 0 8px 8px; color: #fff;">${new Date().toLocaleString("pl-PL")}</td>
              </tr>
            </table>
            <p style="margin-top: 24px; color: #aaa; font-size: 14px;">Lead pochodzi z chatbota na stronie Wuyo. Został zapisany w panelu Laboratorium.</p>
          </div>
        `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Lead API error:", error);
        return NextResponse.json({ error: "Błąd zapisu leada" }, { status: 500 });
    }
}
