import type { Metadata } from "next";
import { PriceCalculator } from "./PriceCalculator";

export const metadata: Metadata = {
    title: "Kalkulator cen – ile kosztuje projekt graficzny?",
    description: "Sprawdź orientacyjną wycenę swojego projektu w 60 sekund. Logo, strona WWW, materiały drukowane, social media — wybierz usługę i dowiedz się, czego się spodziewać.",
    alternates: { canonical: "https://wuyo.pl/kalkulator" },
    openGraph: {
        title: "Kalkulator wyceny WUYO – Logo, Strona, Druk, Social",
        description: "Interaktywny kalkulator cen. Dowiedz się ile może kosztować Twój projekt przed pierwszym kontaktem.",
        url: "https://wuyo.pl/kalkulator",
    },
};

export default function KalkulatorPage() {
    return (
        <div className="w-full min-h-screen pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <p className="eyebrow mb-4">Bez niespodzianek</p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Kalkulator cen
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-xl mx-auto">
                        Wybierz usługę i odpowiedz na kilka pytań — dostaniesz orientacyjny przedział cenowy na miejscu. Finalna wycena zawsze przychodzi w mailu.
                    </p>
                </div>
                <PriceCalculator />
            </div>
        </div>
    );
}
