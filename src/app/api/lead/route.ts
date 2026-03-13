import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function POST(req: NextRequest) {
    try {
        const { name, email } = await req.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Brak danych" }, { status: 400 });
        }

        const lead = {
            id: Math.random().toString(36).substring(7),
            name,
            email,
            timestamp: new Date().toISOString(),
            source: "chatbot",
        };

        // Zapisz lead do pliku JSON
        const leadsPath = path.join(process.cwd(), "leads.json");
        let leads: typeof lead[] = [];
        if (fs.existsSync(leadsPath)) {
            try {
                leads = JSON.parse(fs.readFileSync(leadsPath, "utf-8"));
            } catch {
                leads = [];
            }
        }
        leads.push(lead);
        fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));

        // Wyślij email z powiadomieniem
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
            await transporter.sendMail({
                from: `"Wuyo Chatbot" <${process.env.GMAIL_USER}>`,
                to: process.env.LEAD_EMAIL,
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
            <p style="margin-top: 24px; color: #aaa; font-size: 14px;">Lead pochodzi z chatbota na stronie Wuyo.</p>
          </div>
        `,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Lead API error:", error);
        return NextResponse.json({ error: "Błąd zapisu leada" }, { status: 500 });
    }
}
