import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], variable: "--font-syne" });

export const metadata: Metadata = {
    metadataBase: new URL("https://wuyo.pl"),
    title: {
        default: "Wuyo – Dobra Grafa | Strony internetowe i grafika",
        template: "%s | Wuyo – Dobra Grafa",
    },
    description: "Nowoczesne strony internetowe, identyfikacja wizualna i design premium. Wuyo – robię to dobrze, szybko i z duszą. Sprawdź moje realizacje!",
    keywords: ["strony internetowe", "web design", "portfolio", "freelancer", "Next.js", "grafika", "tworzenie stron www", "Rzeszów"],
    authors: [{ name: "Wuyo – Dobra Grafa", url: "https://wuyo.pl" }],
    creator: "Wuyo – Dobra Grafa",
    manifest: "/site.webmanifest",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
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
        description: "Nowoczesne strony internetowe, identyfikacja wizualna i design premium. Sprawdź moje realizacje!",
        images: [
            {
                url: "/wuyo-dobra-grafa-logo-kolorowe.webp",
                width: 1200,
                height: 630,
                alt: "Wuyo – Dobra Grafa – agencja stron internetowych i identyfikacji wizualnej",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Wuyo – Dobra Grafa | Strony internetowe i grafika",
        description: "Nowoczesne strony internetowe, identyfikacja wizualna i design premium.",
        images: ["/wuyo-dobra-grafa-logo-kolorowe.webp"],
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
            </body>
        </html>
    );
}
