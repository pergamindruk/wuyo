import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-syne" });

export const metadata: Metadata = {
    metadataBase: new URL("https://wuyo.pl"),
    title: {
        default: "WUYO | Tworzenie Stron WWW & Identyfikacja Wizualna – Rzeszów i cała Polska",
        template: "%s | WUYO – Tworzenie Stron WWW & Grafika",
    },
    description: "Projektuję strony WWW, logo i identyfikację wizualną, która sprzedaje. React/Next.js, mobile-first, techniczne SEO. Termin murowany, cena bez niespodzianek. Od 1 200 zł.",
    keywords: ["tworzenie stron internetowych", "projektant graficzny", "identyfikacja wizualna", "logo design", "strony www Rzeszów", "web design Polska", "Next.js", "grafika reklamowa", "strony internetowe dla firm"],
    authors: [{ name: "Wuyo – Dobra Grafa", url: "https://wuyo.pl" }],
    creator: "Wuyo – Dobra Grafa",
    manifest: "/site.webmanifest",
    icons: {
        icon: "/favicon-wuyo.png",
        apple: "/favicon-wuyo.png",
    },
    other: {
        "theme-color": "#FFEB52",
    },
    openGraph: {
        type: "website",
        locale: "pl_PL",
        url: "https://wuyo.pl",
        siteName: "Wuyo – Dobra Grafa",
        title: "Wuyo – Dobra Grafa | Strony internetowe i grafika",
        description: "Grafik, który mówi prosto z mostu. Strony www, identyfikacja wizualna i grafiki social media od 1 200 zł. Termin murowany, cena bez niespodzianek.",
        images: [
            {
                url: "/logo_wuya2.webp",
                width: 1200,
                height: 630,
                alt: "Wuyo – Dobra Grafa – agencja stron internetowych i identyfikacji wizualnej",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Wuyo – Dobra Grafa | Strony internetowe i grafika",
        description: "Grafik, który mówi prosto z mostu. Strony www, identyfikacja wizualna i grafiki social media od 1 200 zł.",
        images: ["/logo_wuya2.webp"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "https://wuyo.pl",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl" className="scroll-smooth">
            <body suppressHydrationWarning className={`${inter.variable} ${syne.variable} font-sans antialiased bg-zinc-950`}>
                {/* Skip to content – ruch klawiaturowy (WCAG) */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-gold focus:text-navy-dark focus:px-4 focus:py-2 focus:rounded-full focus:font-bold focus:text-sm focus:shadow-lg"
                >
                    Przejdź do treści
                </a>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
