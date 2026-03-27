import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, CheckCircle, AlertCircle, Zap, DollarSign } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";

const domain = "https://wuyo.pl";

export const metadata: Metadata = {
  title: "Jak stworzyć stronę internetową dla firmy? Kompletny przewodnik 2026",
  description:
    "Porównanie 3 sposobów tworzenia strony: Wix, WordPress, Next.js. Dowiedz się, który pasuje do Twojej firmy, ile kosztuje i jak wybrać wykonawcę.",
  openGraph: {
    title: "Jak stworzyć stronę internetową dla firmy? Kompletny przewodnik 2026",
    description:
      "Porównanie 3 sposobów tworzenia strony: Wix, WordPress, Next.js. Dowiedz się, który pasuje do Twojej firmy, ile kosztuje i jak wybrać wykonawcę.",
    type: "article",
    authors: ["Mateusz Machoś"],
    publishedTime: "2026-03-27T00:00:00Z",
    url: `${domain}/blog/jak-stworzyc-strone-internetowa-dla-firmy`,
    siteName: "WUYO – Dobra Grafa",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jak stworzyć stronę internetową dla firmy? Kompletny przewodnik 2026",
    description:
      "Porównanie 3 sposobów tworzenia strony: Wix, WordPress, Next.js. Dowiedz się, który pasuje do Twojej firmy, ile kosztuje i jak wybrać wykonawcę.",
  },
  alternates: {
    canonical: `${domain}/blog/jak-stworzyc-strone-internetowa-dla-firmy`,
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Jak stworzyć stronę internetową dla firmy? Kompletny przewodnik 2026",
  description:
    "Porównanie 3 sposobów tworzenia strony: Wix, WordPress, Next.js. Dowiedz się, który pasuje do Twojej firmy, ile kosztuje i jak wybrać wykonawcę.",
  datePublished: "2026-03-27T00:00:00Z",
  author: {
    "@type": "Person",
    name: "Mateusz Machoś",
  },
  publisher: {
    "@type": "Organization",
    name: "WUYO – Dobra Grafa",
  },
  url: `${domain}/blog/jak-stworzyc-strone-internetowa-dla-firmy`,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Ile czasu trwa stworzenie strony internetowej dla firmy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Czas zależy od rozwiązania. Kreator (Wix, Tilda): 1-3 dni. WordPress z szablonami: 1-2 tygodnie. Strona dedykowana (Next.js): 2-4 tygodnie.",
      },
    },
    {
      "@type": "Question",
      name: "Którą opcję wybrać dla małej firmy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dla małej firmy, która chce szybkość i niski budżet: kreator (Wix, Tilda). Jeśli chcesz więcej funkcji: WordPress. Jeśli planujesz skalowanie i wysoką konwersję: dedykowana strona.",
      },
    },
    {
      "@type": "Question",
      name: "Czy WordPress jest lepszy od Wix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nie ma \"lepszego\". WordPress daje więcej kontroli, ale wymaga utrzymania. Wix jest łatwiejszy, ale mniej elastyczny. Wybór zależy od Twoich potrzeb.",
      },
    },
    {
      "@type": "Question",
      name: "Jak wybrać wykonawcę do stworzenia strony?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sprawdź portfolio, przeczytaj recenzje, zapytaj o doświadczenie z Twoją branżą. Kluczowe: jasna umowa, harmonogram, forma wsparcia po lunch.",
      },
    },
    {
      "@type": "Question",
      name: "Czy potrzebuję domeny i hostingu oprócz tworzenia strony?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tak. Domena (np. imienazwiska.pl): ~40-50 zł/rok. Hosting zależy od platformy: Wix/Tilda mają hosting w cenie, WordPress wymaga separate hostingu (~30-200 zł/mies).",
      },
    },
  ],
};

export default function Page() {
  return (
    <main className="bg-gradient-to-b from-navy via-navy to-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative min-h-screen w-full flex items-center justify-center px-4 py-20 overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="rgba(217, 158, 40, 0.15)"
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <span className="text-sm font-bold text-gold uppercase tracking-wider">
              Przewodnik 2026
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Jak stworzyć stronę internetową dla firmy?
          </h1>
          <p className="text-xl text-white/70 mb-8 leading-relaxed">
            3 sposoby, ich zalety i wady, ile kosztują, i jak wybrać ten, który przyniesie Ci
            rzeczywisty zwrot z inwestycji.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <span>27 marca 2026</span>
            <span>•</span>
            <span>~12 min czytania</span>
          </div>
        </div>
      </section>

      {/* Table of Contents / Intro */}
      <section className="bg-navy/40 py-16 px-4 border-y border-white/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Cztery główne drogi do Twojej strony</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-navy p-4 rounded-lg border border-gold/20">
              <div className="font-bold text-gold mb-2">1. Konstruktor (Wix, Tilda)</div>
              <p className="text-white/60 text-sm">Najszybciej, najtaniej, minimal wiedzy technicznej</p>
            </div>
            <div className="bg-navy p-4 rounded-lg border border-gold/20">
              <div className="font-bold text-gold mb-2">2. WordPress</div>
              <p className="text-white/60 text-sm">Balans elastyczności i łatwości, wymaga hostingu</p>
            </div>
            <div className="bg-navy p-4 rounded-lg border border-gold/20">
              <div className="font-bold text-gold mb-2">3. Next.js / Kod</div>
              <p className="text-white/60 text-sm">Pełna kontrola, wysokie konwersje, wymaga inwestycji</p>
            </div>
            <div className="bg-navy p-4 rounded-lg border border-gold/20">
              <div className="font-bold text-gold mb-2">4. Mieszana</div>
              <p className="text-white/60 text-sm">Kreator jako MVP, rozbudowa w WordPress/kod</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Konstruktory */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-6">Opcja 1: Konstruktory stron (Wix, Tilda, Webflow)</h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              Konstruktory to gotowe narzędzia „przeciągnij i upuść". Idealne dla przedsiębiorców, którzy
              chcą stronę <strong>jutro</strong>, a nie za miesiąc.
            </p>

            <div className="bg-gold/5 border border-gold/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">✅ Zalety</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Szybko:</strong> Od zera do launchingu w 1–3 dni
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Tanie:</strong> 150–500 zł/miesiąc (hosting w cenie)
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Bez kodowania:</strong> Żaden kod, drag-and-drop interface
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Wsparcie:</strong> Zwykle dostępne, FAQ, tutoriale
                  </span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>SSL, domena, hosting:</strong> Wszystko wbudowane
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">❌ Wady</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Nie Twoja strona:</strong> Zmieniasz trendy → cena wzrasta. Zmienia się TOS → mogą Ci zablokować
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>SEO słabsze:</strong> Zwykle gorsze optimizacje niż dedicated strony
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Mało elastyczny:</strong> Chcesz coś \"szalonego\"? Nie da się w konstruktorze
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-white/80">
                    <strong>Performa:</strong> Stroma się ładuje wolniej (bloat)
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-white/60 text-sm italic border-l-2 border-gold/40 pl-4">
              <strong>Dla kogo?</strong> Startupem z mikro budżetem, portfolio artysty, wizytówka dla
              lokalnej firmy, landing page na kampanię.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 2: WordPress */}
      <section className="py-20 px-4 bg-navy/30">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-6">Opcja 2: WordPress (z szablonami lub custom)</h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              WordPress rządzi 43% internetu. To system zarządzania treścią (CMS), który daje Ci
              pełną kontrolę, ale wymaga hostingu.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">✅ Zalety</h3>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-white/80">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-1" />
                    <span>Elastyczny — co chcesz, to robisz</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-1" />
                    <span>SEO-friendly — Yoast, Rank Math pluginy</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-1" />
                    <span>Huge ecosystem — 60k+ pluginów</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-1" />
                    <span>Tania nauka — moc zasobów online</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <CheckCircle size={16} className="text-gold flex-shrink-0 mt-1" />
                    <span>Własne dane — Twój server, Twoje reguły</span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">❌ Wady</h3>
                <ul className="space-y-2">
                  <li className="flex gap-2 text-white/80">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-1" />
                    <span>Hosting osobno (~40–150 zł/m)</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-1" />
                    <span>Trzeba utrzymywać (updaty, pluginy)</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-1" />
                    <span>Zagrożenie bezpieczeństwa (nieostrożny plugin = hak)</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-1" />
                    <span>Wolniejszy niż dedykowany kod</span>
                  </li>
                  <li className="flex gap-2 text-white/80">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-1" />
                    <span>Krzywa uczenia — chcesz więcej = musisz się uczyć PHP</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-white/60 text-sm italic border-l-2 border-gold/40 pl-4">
              <strong>Dla kogo?</strong> Blogi, e-commerce (WooCommerce), agencje SEO, firmy, które chcą blog +
              landing page, portfolio autorów.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Section 3: Next.js / Kod */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-6">Opcja 3: Next.js / Dedykowany kod</h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              To jest to. Własny kod, pełna kontrola, wysoka wydajność. Wymaga inwestycji (czasu i pieniędzy),
              ale zwrot jest ogromny.
            </p>

            <div className="space-y-6">
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">✅ Zalety</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Performa:</strong> Blazing fast load times (1-2s vs 5-7s u konkurencji)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>SEO premium:</strong> Full control nad HTML, JSON-LD, metadata — ranking wyżej
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Design bez limitów:</strong> Cokolwiek sobie wymyślisz, się robi
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Skalowanie:</strong> Gotowa na 1 mln visitors, bez problemu
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle size={20} className="text-gold flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Bezpieczeństwo:</strong> Masz kontrolę — brak \"pluginu z lewej strony internetu\"
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">❌ Wady</h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Koszt:</strong> 2 900 zł – 20 000 zł+ (zależy od skali)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Czas:</strong> 2–8 tygodni budowy (vs 3 dni w Wixie)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Utrzymanie:</strong> Potrzebujesz deweloper na telefon (gotowe wsparcie)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-1" />
                    <span className="text-white/80">
                      <strong>Hosting:</strong> ~200–500 zł/mies dla wydajności
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-navy/50 border border-gold/20 rounded-lg p-6 my-6">
              <div className="flex gap-3 mb-4">
                <Zap size={24} className="text-gold flex-shrink-0" />
                <h3 className="text-lg font-bold text-white">Kiedy Next.js ma sens dla Twojej firmy?</h3>
              </div>
              <ul className="space-y-2 text-white/80">
                <li>✓ Planujesz skalowanie (chcesz organicznie rośnie)</li>
                <li>✓ Konwersja to twój #1 KPI (każdy 1% = duża kasa)</li>
                <li>✓ Branża ultra-konkurencyjna (potrzebujesz się wyróżniać)</li>
                <li>✓ Masz budżet &gt;2 500 zł na początek + gotowość na utrzymanie</li>
                <li>✓ Chcesz stronę, która będzie Ci pracować przez 5+ lat</li>
              </ul>
            </div>

            <p className="text-white/60 text-sm italic border-l-2 border-gold/40 pl-4">
              <strong>Dla kogo?</strong> Agencjach, high-ticket usługach (coaching, consulting, design), SaaS,
              e-commerce premium, firmy z ambicjami do 100k/mies organicznie.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Porównanie */}
      <section className="py-20 px-4 bg-navy/30">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-8">Porównanie 3 opcji</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/30">
                    <th className="text-left py-3 px-4 text-gold font-bold">Kryterium</th>
                    <th className="text-left py-3 px-4 text-gold font-bold">Kreator</th>
                    <th className="text-left py-3 px-4 text-gold font-bold">WordPress</th>
                    <th className="text-left py-3 px-4 text-gold font-bold">Next.js</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">Czas launchingu</td>
                    <td className="py-3 px-4 text-white/70">1-3 dni</td>
                    <td className="py-3 px-4 text-white/70">1-2 tygodnie</td>
                    <td className="py-3 px-4 text-white/70">2-8 tygodni</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">Koszt początkowy</td>
                    <td className="py-3 px-4 text-white/70">150-300 zł</td>
                    <td className="py-3 px-4 text-white/70">1-2 000 zł</td>
                    <td className="py-3 px-4 text-white/70">2 900-20 000 zł</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">Koszt miesięczny</td>
                    <td className="py-3 px-4 text-white/70">150-500 zł</td>
                    <td className="py-3 px-4 text-white/70">40-150 zł + utrzymanie</td>
                    <td className="py-3 px-4 text-white/70">200-500 zł + wsparcie</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">SEO</td>
                    <td className="py-3 px-4 text-white/70">6/10</td>
                    <td className="py-3 px-4 text-white/70">8/10</td>
                    <td className="py-3 px-4 text-white/70">10/10</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">Performa</td>
                    <td className="py-3 px-4 text-white/70">5/10</td>
                    <td className="py-3 px-4 text-white/70">7/10</td>
                    <td className="py-3 px-4 text-white/70">10/10</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">Kontrola nad designem</td>
                    <td className="py-3 px-4 text-white/70">3/10</td>
                    <td className="py-3 px-4 text-white/70">8/10</td>
                    <td className="py-3 px-4 text-white/70">10/10</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 px-4 text-white/80 font-semibold">Skalowanie</td>
                    <td className="py-3 px-4 text-white/70">Limitowane</td>
                    <td className="py-3 px-4 text-white/70">Do 100k visitors</td>
                    <td className="py-3 px-4 text-white/70">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white/80 font-semibold">Łatwość użycia</td>
                    <td className="py-3 px-4 text-white/70">10/10</td>
                    <td className="py-3 px-4 text-white/70">6/10</td>
                    <td className="py-3 px-4 text-white/70">4/10 (bez kodu)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Ile to kosztuje? */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-6">Ile kosztuje strona dla firmy?</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Koszt zależy od trzech rzeczy: <strong>opcji, zakresu, i wsparcia</strong>. Oto realne ceny 2026:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-navy/50 border border-gold/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gold mb-4">Kreator (Wix)</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">Setup (Ty sam)</p>
                    <p className="text-2xl font-bold text-white">0 zł</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Plan miesięczny</p>
                    <p className="text-2xl font-bold text-white">250-400 zł</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm">Rocznie</p>
                    <p className="text-2xl font-bold text-gold">3-5 k zł</p>
                  </div>
                </div>
              </div>

              <div className="bg-navy/50 border border-gold/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gold mb-4">WordPress</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">Agencja/freelancer</p>
                    <p className="text-2xl font-bold text-white">1-2 000 zł</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Hosting + domenę</p>
                    <p className="text-2xl font-bold text-white">60-100 zł/m</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm">Roczne + utrzymanie</p>
                    <p className="text-2xl font-bold text-gold">2-3 k zł</p>
                  </div>
                </div>
              </div>

              <div className="bg-navy/50 border border-gold/30 rounded-lg p-6 ring-2 ring-gold/40">
                <h3 className="text-lg font-bold text-gold mb-4">Next.js</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-white/60 text-sm">Dedykowana strona</p>
                    <p className="text-2xl font-bold text-white">2 900-8 000 zł</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Hosting + wsparcie</p>
                    <p className="text-2xl font-bold text-white">300-500 zł/m</p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-white/60 text-sm">1 rok inwestycji</p>
                    <p className="text-2xl font-bold text-gold">6-14 k zł</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gold/5 border border-gold/20 rounded-lg p-6">
              <p className="text-white/80 mb-4">
                <strong>ℹ️ Spostrzeżenie:</strong> Next.js jest droższy z przodu, ale:
              </p>
              <ul className="space-y-2 text-white/70">
                <li>• Konwersja wyższa o 20-40% = więcej leadów, więcej sprzedaży</li>
                <li>• SEO lepsze = organiczny ruch za darmo</li>
                <li>• Skalowanie bez dodatkowych kosztów (vs WordPress: nowe pluginy = wydatek)</li>
                <li>• W roku 2: ROI pozytywny, jeśli strona zarabia</li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Jak wybrać wykonawcę */}
      <section className="py-20 px-4 bg-navy/30">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-8">Jak wybrać wykonawcę?</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Niezależnie od opcji, wykonawca ma znaczenie. Oto 6 pytań, które musisz zadać:
            </p>

            <div className="space-y-6">
              {[
                {
                  q: "1. Jaki jest Twój proces? (Brief → Design → Dev → Launch)",
                  a: "Dobry wykonawca ma jasny proces. Jeśli on nie wie, co robi krok po kroku, uciekaj.",
                },
                {
                  q: "2. Czy mam dostęp do kodu / do admin panelu?",
                  a: "Tak. Zawsze. Jeśli mówi \"nie\" — to nie jest Twoja strona, to strona wykonawcy.",
                },
                {
                  q: "3. Co jest w cenie? Co to dodatkowe?",
                  a: "Żaden\"zaskoczony\" koszt. Strona powinna mieć fixed price albo jasny scope zmian.",
                },
                {
                  q: "4. Czy dostaję wsparcie po launchingu? Na ile?",
                  a: "Może być zapłacone, ale powinna być np. 2-4 tyg free wsparcia + bug fixes.",
                },
                {
                  q: "5. Czy robisz strony dla mojej branży?",
                  a: "Portfolio to wszystko. Robi strony dla dentystów? Świetnie dla kliniki. Dla restauracji? Może to inny partner.",
                },
                {
                  q: "6. Jakie jest Twoje doświadczenie z SEO / konwersją?",
                  a: "Nie wystarczy \"piękna strona\". Strona musi też być znaleziona i powinna konwertować.",
                },
              ].map((item, idx) => (
                <div key={idx} className="border-l-2 border-gold/40 pl-6">
                  <h3 className="text-lg font-bold text-white mb-3">{item.q}</h3>
                  <p className="text-white/70">{item.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-red-500/5 border border-red-500/20 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">🚩 Red flags — uciekaj od tego wykonawcy:</h3>
              <ul className="space-y-2 text-white/70">
                <li>✗ Brak portfolio lub mało case studies</li>
                <li>✗ Obiecuje „ranking #1 w Google za 3 miesiące"</li>
                <li>✗ Brak jasnego timescale — \"gotowe jak gotowe\"</li>
                <li>✗ Komunikacja słaba — brak odpowiedzi w 24h</li>
                <li>✗ Nie pyta o Twoim biznesie, od razu chce kod / kreator</li>
                <li>✗ Nie podpisuje umowy</li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Proces budowy */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-8">5 kroków do Twojej strony</h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Niezależnie od opcji, proces powinien wyglądać tak:
            </p>

            <div className="space-y-4">
              {[
                {
                  step: "1. Brief",
                  desc: "Wykonawca pyta o biznesie, konkurencji, celach. Ty podajesz teksty, zdjęcia, logotyp.",
                },
                {
                  step: "2. Proposal",
                  desc: "Pokazuje plan: struktura strony, timeline, cena, co jest w zakresie, co nie.",
                },
                {
                  step: "3. Design",
                  desc: "Mockup (wygląd strony) do zatwierdzenia. Poprawki do 2-3 rund.",
                },
                {
                  step: "4. Development",
                  desc: "Budowa na testowym serwerze. Testy, SEO, performa, mobile.",
                },
                {
                  step: "5. Launch & Support",
                  desc: "Upload na produkcję (wdrożenie na Twoje hosting). Wsparcie first month.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-start p-5 rounded-lg bg-navy/40 border border-gold/20 hover:border-gold/40 transition-colors"
                >
                  <div className="bg-gold text-navy font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    {item.step.split(".")[0]}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{item.step}</h4>
                    <p className="text-white/70 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Summary */}
      <section className="py-20 px-4 bg-navy/30">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-white mb-8">Podsumowanie: Którą opcję wybrać?</h2>

            <div className="space-y-6">
              <div className="bg-navy/50 border border-gold/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gold mb-3">Wybieram Wix / Tildę, jeśli:</h3>
                <p className="text-white/70">
                  Jestem micro-budżetem (&lt; 1000 zł), potrzebuję strony w weekend, nie chcę kod, i to
                  wizytówka (nie generator leadów). Zmienię na WordPress/Next.js za rok, gdy będę rosnąć.
                </p>
              </div>

              <div className="bg-navy/50 border border-gold/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gold mb-3">Wybieram WordPress, jeśli:</h3>
                <p className="text-white/70">
                  Chcę blog + landing page, mam dedykawanego dewelopera, albo sami będziemy utrzymywać. Budget
                  1-2k na budowę. Potrzebujemy elastyczności, ale bez mega kosztów.
                </p>
              </div>

              <div className="bg-navy/50 border border-gold/30 rounded-lg p-6 ring-2 ring-gold/40">
                <h3 className="text-lg font-bold text-gold mb-3">Wybieram Next.js, jeśli:</h3>
                <p className="text-white/70">
                  To strona główna biznesu. Konwersja liczy się bardziej niż nic. Planuję skalowanie.
                  Mam budżet 3-8k PLN i gotowość na wsparcie. To nie inwestycja, to <strong>zarobek</strong>.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Gotowy na swoją stronę, która będzie zarabiać?
          </h2>
          <p className="text-white/70 mb-8 text-lg leading-relaxed">
            Niezależnie, którą drogę wybierzesz, upewnij się, że strona jest zbudowana z myślą o leadach
            i konwersji — nie tylko piękną wizualnie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#kontakt"
              className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-8 py-3 rounded-full font-bold hover:bg-gold/90 transition-colors"
            >
              Wyślij zapytanie
              <ArrowRight size={16} />
            </a>
            <a
              href="/strony-www"
              className="inline-flex items-center justify-center gap-2 border border-gold/40 text-gold hover:bg-gold/10 px-8 py-3 rounded-full font-bold transition-colors"
            >
              Zobacz ofertę stron
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-navy/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Przejęte pytania (FAQ)</h2>
          <div className="space-y-6">
            {[
              {
                q: "Ile czasu trwa stworzenie strony internetowej dla firmy?",
                a: "Kreator (Wix, Tilda): 1-3 dni. WordPress z szablonami: 1-2 tygodnie. Strona dedykowana (Next.js): 2-4 tygodnie.",
              },
              {
                q: "Którą opcję wybrać dla małej firmy?",
                a: "Dla małej firmy, która chce szybkość i niski budżet: kreator (Wix, Tilda). Jeśli chcesz więcej funkcji: WordPress. Jeśli planujesz skalowanie i wysoką konwersję: dedykowana strona.",
              },
              {
                q: "Czy WordPress jest lepszy od Wix?",
                a: "Nie ma \"lepszego\". WordPress daje więcej kontroli, ale wymaga utrzymania. Wix jest łatwiejszy, ale mniej elastyczny. Wybór zależy od Twoich potrzeb.",
              },
              {
                q: "Ile kosztuje domena i hosting poza tworzeniem strony?",
                a: "Domena (~imienazwiska.pl): ~40-50 zł/rok. Hosting: Wix/Tilda mają hosting w cenie, WordPress wymaga separate hostingu (~30-200 zł/mies).",
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="group border border-white/10 rounded-lg overflow-hidden hover:border-gold/20 transition-colors"
              >
                <summary className="p-6 cursor-pointer bg-navy/40 hover:bg-navy/50 transition-colors flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{item.q}</h3>
                  <span className="text-gold group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 py-4 bg-navy/20 border-t border-white/10">
                  <p className="text-white/70 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Przeczytaj też</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/blog/strona-one-page-czy-multi-page"
              className="group p-6 rounded-lg border border-gold/20 hover:border-gold/40 bg-navy/40 transition-all"
            >
              <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors mb-2">
                Strona one-page czy multi-page?
              </h3>
              <p className="text-white/60 text-sm mb-4">
                Szczegółowe porównanie dwóch podejść + tabela decyzji, która jest lepsza dla Twojego biznesu.
              </p>
              <div className="flex items-center gap-2 text-gold text-sm font-bold">
                Czytaj
                <ArrowRight size={16} />
              </div>
            </Link>

            <Link
              href="/blog/ile-kosztuje-strona-internetowa"
              className="group p-6 rounded-lg border border-gold/20 hover:border-gold/40 bg-navy/40 transition-all"
            >
              <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors mb-2">
                Ile kosztuje strona internetowa?
              </h3>
              <p className="text-white/60 text-sm mb-4">
                5-stopniowa tabela cen, co wpływa na cenę, i ile WUYO bierze za różne typy stron.
              </p>
              <div className="flex items-center gap-2 text-gold text-sm font-bold">
                Czytaj
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
