import type { Metadata, Viewport } from "next";
import { Inter, Syne, Goldman } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageTracker } from "@/components/PageTracker";
import { CookieConsent } from "@/components/CookieConsent";
import { MetaPixel } from "@/components/MetaPixel";
import { CONSENT_STORAGE_KEY } from "@/lib/consent";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

// Kształt zapisu musi zgadzać się z tym, co zapisuje `saveConsent` w src/lib/consent.ts.
const consentDefaultScript = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
try{var z=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}'));if(z&&typeof z==='object'){gtag('consent','update',{analytics_storage:z.analytics?'granted':'denied',ad_storage:z.marketing?'granted':'denied',ad_user_data:z.marketing?'granted':'denied',ad_personalization:z.marketing?'granted':'denied'});}}catch(e){}`;

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
const syne = Syne({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-syne", display: "swap" });
const goldman = Goldman({
    subsets: ["latin"],
    weight: ["700"],
    variable: "--font-ava-meridian",
    display: "swap",
});
const csHarley = localFont({
    src: [
        { path: "../../public/fonts/cs-harley-regular.woff2", weight: "400", style: "normal" },
        { path: "../../public/fonts/cs-harley-bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--font-cs-harley",
    display: "swap",
});

// color-scheme trafia do <meta> w HTML, więc działa jeszcze przed pobraniem CSS
export const viewport: Viewport = {
    colorScheme: "dark",
    themeColor: "#FFEB52",
};

export const metadata: Metadata = {
    metadataBase: new URL("https://wuyo.pl"),
    title: {
        default: "WUYO – Logo, Strony WWW & Grafika | Rzeszów",
        // Sama „WUYO" zamiast „WUYO – Dobra Grafa": Google pokazuje około 60 znaków,
        // a dłuższa końcówka zjadała je podstronom i wpisom blogowym.
        template: "%s | WUYO",
    },
    description: "Projektuję strony WWW, logo i identyfikację wizualną, która sprzedaje. React/Next.js, mobile-first, techniczne SEO. Termin murowany, cena bez niespodzianek. Od 890 zł.",
    keywords: ["tworzenie stron internetowych", "projektant graficzny", "identyfikacja wizualna", "logo design", "strony www Rzeszów", "web design Polska", "Next.js", "grafika reklamowa", "strony internetowe dla firm"],
    authors: [{ name: "Wuyo – Dobra Grafa", url: "https://wuyo.pl" }],
    creator: "Wuyo – Dobra Grafa",
    manifest: "/site.webmanifest",
    icons: {
        icon: "/favicon-wuyo.png",
        apple: "/favicon-wuyo.png",
    },
    openGraph: {
        type: "website",
        locale: "pl_PL",
        url: "https://wuyo.pl",
        siteName: "Wuyo – Dobra Grafa",
        title: "Wuyo – Dobra Grafa | Strony internetowe i grafika",
        description: "Grafik, który mówi prosto z mostu. Strony www, identyfikacja wizualna i grafiki social media od 890 zł. Termin murowany, cena bez niespodzianek.",
        images: [
            {
                url: "/og-image.webp",
                width: 1200,
                height: 630,
                alt: "Wuyo – Dobra Grafa – agencja stron internetowych i identyfikacji wizualnej",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Wuyo – Dobra Grafa | Strony internetowe i grafika",
        description: "Grafik, który mówi prosto z mostu. Strony www, identyfikacja wizualna i grafiki social media od 890 zł.",
        images: ["/og-image.webp"],
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
        "streetAddress": "ul. Siemieńskiego 17A/38",
        "addressLocality": "Rzeszów",
        "postalCode": "35-203",
        "addressRegion": "Podkarpacie",
        "addressCountry": "PL",
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": "Polish",
        "email": "kontakt@wuyo.pl",
        "telephone": "+48725182053",
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "6",
        "reviewCount": "6",
    },
    "sameAs": [
        "https://www.facebook.com/wuyo.dobra.grafa",
        "https://www.instagram.com/wuyo.pl/",
        "https://www.youtube.com/@wuyo.dobra.grafa",
        "https://share.google/2xca9wmLz1mI5NvIX",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl" className="scroll-smooth" style={{ backgroundColor: "#1c1b17" }}>
            <head>
                {/* Nawiązanie połączenia z serwerem zbierającym zdarzenia GA4 zajmowało
                    324 ms w krytycznej ścieżce. Przeglądarka robi to teraz z wyprzedzeniem.
                    Świadomie BEZ connect.facebook.net — Piksel wczytuje się dopiero po
                    zgodzie i preconnect łączyłby się z Facebookiem u każdego, kto jej nie da. */}
                <link rel="preconnect" href="https://region1.google-analytics.com" />
                <link rel="preconnect" href="https://www.googletagmanager.com" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                {/* Consent Mode v2. Zwykły <script>, a nie next/script, bo musi wykonać się
                    przed tagiem Google — inaczej pierwsze zdarzenia poszłyby bez zgody.
                    Domyślnie wszystko zablokowane; zapisany wybór wracającego odwiedzającego
                    czytamy z pamięci przeglądarki od razu, w tym samym skrypcie. */}
                <script dangerouslySetInnerHTML={{ __html: consentDefaultScript }} />
                {GA_ID && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                            strategy="afterInteractive"
                        />
                        {/* traffic_type: wejścia z podglądów Vercela i localhosta oznaczamy jako
                            ruch wewnętrzny, żeby filtr w GA4 mógł je wyciąć z raportów. */}
                        <Script id="ga4-init" strategy="afterInteractive">
                            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{traffic_type:location.hostname==='wuyo.pl'?'external':'internal'});`}
                        </Script>
                    </>
                )}
                {/* Piksel Meta nie startuje z <head> — wczytuje go <MetaPixel /> dopiero
                    po zgodzie na marketing. Szczegóły w src/components/MetaPixel.tsx. */}
            </head>
            <body suppressHydrationWarning className={`${inter.variable} ${syne.variable} ${goldman.variable} ${csHarley.variable} font-sans antialiased bg-zinc-950`}>
                {/* Skip to content – ruch klawiaturowy (WCAG) */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-gold focus:text-navy-dark focus:px-4 focus:py-2 focus:rounded-full focus:font-bold focus:text-sm focus:shadow-lg"
                >
                    Przejdź do treści
                </a>
                {children}
                <CookieConsent />
                {META_PIXEL_ID && <MetaPixel pixelId={META_PIXEL_ID} />}
                <PageTracker />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
