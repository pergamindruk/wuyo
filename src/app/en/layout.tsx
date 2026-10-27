import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { MobileContactBar } from "@/components/MobileContactBar";
import { SkipLink } from "@/components/SkipLink";

// Angielska wersja strony. Polska zostaje główna (x-default w hreflang), ta jest
// dla obcokrajowców z Rzeszowa i firm spoza Polski. Bez czatu: bot zna tylko polski cennik
// i polskie zwroty, na angielskiej stronie robiłby więcej szkody niż pożytku.
export const metadata: Metadata = {
    title: {
        default: "WUYO: logo design, websites & print | Rzeszów, Poland",
        template: "%s | WUYO",
    },
    description:
        "Graphic designer in Rzeszów, Poland. Logo design, fast Next.js websites, business cards and apparel printing for small businesses. Clear prices, no surprises.",
    openGraph: {
        locale: "en_GB",
        siteName: "WUYO Dobra Grafa",
    },
};

// Wspólny layout główny ma <html lang="pl">. Jedna linijka skryptu poprawia to na "en"
// zanim cokolwiek się wyświetli: czytniki ekranu czytają wtedy po angielsku, a Google
// i tak opiera się na hreflang i treści. Bez tego trzeba by rozbić layout główny na dwa.
const setLang = `document.documentElement.lang="en"`;

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex flex-col min-h-screen">
            <script dangerouslySetInnerHTML={{ __html: setLang }} />
            <SkipLink label="Skip to content" />
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer locale="en" />
            <MobileContactBar />
            <ScrollToTop />
        </div>
    );
}
