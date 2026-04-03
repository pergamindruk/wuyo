import type { Metadata } from "next";
import { Inter, Syne, Goldman } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// Wstaw swój GA4 Measurement ID z https://analytics.google.com → Admin → Data Streams
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-syne", display: "swap" });
const goldman = Goldman({
    subsets: ["latin"],
    weight: ["700"],
    variable: "--font-ava-meridian",
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://wuyo.pl"),
    title: {
        default: "WUYO – Logo, Strony WWW & Grafika | Rzeszów",
        template: "%s | WUYO – Dobra Grafa",
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
    verification: {
        google: "wGuZz4Ws_-z7QaM1H_Y6kmS_i7kgYVnUxadeldIEEyw",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": "https://wuyo.pl/#business",
    "name": "WUYO – Dobra Grafa",
    "alternateName": "WUYO",
    "description": "Projektowanie stron WWW, logo i identyfikacja wizualna. React/Next.js, mobile-first, techniczne SEO.",
    "url": "https://wuyo.pl",
    "logo": "https://wuyo.pl/logo_wuya2.webp",
    "image": ["https://wuyo.pl/logo_wuya2.webp"],
    "email": "kontakt@wuyo.pl",
    "telephone": "+48725182053",
    "founder": {
        "@type": "Person",
        "name": "Mateusz Machoś",
        "jobTitle": "Graphic Designer & Web Developer",
    },
    "areaServed": [
        { "@type": "City", "name": "Rzeszów" },
        { "@type": "Country", "name": "Polska" },
    ],
    "serviceType": [
        "Web Design",
        "Graphic Design",
        "Brand Identity",
        "Logo Design",
        "Social Media Graphics",
    ],
    "priceRange": "800–5000 PLN",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Rzeszów",
        "addressCountry": "PL",
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Polish",
        "email": "kontakt@wuyo.pl",
        "telephone": "+48725182053",
    },
    "sameAs": [
        "https://www.facebook.com/wuyo.dobra.grafa",
        "https://www.instagram.com/wuyo.pl/",
        "https://www.youtube.com/@wuyo.dobra.grafa",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl" className="scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {GA_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                            strategy="afterInteractive"
                        />
                        <Script id="ga4-init" strategy="afterInteractive">
                            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
                        </Script>
                    </>
                )}
            </head>
            <body suppressHydrationWarning className={`${inter.variable} ${syne.variable} ${goldman.variable} font-sans antialiased bg-zinc-950`}>
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
