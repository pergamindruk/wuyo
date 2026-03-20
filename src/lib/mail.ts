import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: (process.env.EMAIL_PORT || "465") === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
  },
});

export const mailOptions = {
  from: process.env.EMAIL_FROM || `"${process.env.EMAIL_FROM_NAME || 'Wuyo'}" <${process.env.EMAIL_USER || process.env.GMAIL_USER}>`,
  to: process.env.LEAD_EMAIL || process.env.EMAIL_USER || process.env.GMAIL_USER,
};
