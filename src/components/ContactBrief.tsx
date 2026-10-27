"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, Send, Star, Monitor, MessageSquare, Briefcase, Mail, Phone, Copy } from "lucide-react";
import { packages } from "@/components/PackagesSection";
import { findPricingCard } from "@/data/pricing";
import { pricingGroupsEn } from "@/data/pricing-en";
import { trackFormSubmit, trackPhoneClick, trackWhatsAppClick } from "@/lib/tracking";
import { usePathname } from "next/navigation";
import { localeFromPath, route } from "@/lib/i18n";

/* ─ Linki kontaktowe ─ */
const WA_LINK = "https://wa.me/48725182053";
const MESSENGER_LINK = "https://m.me/wuyo.dobra.grafa";
const EMAIL = "kontakt@wuyo.pl";
const TELEFON = "+48725182053";

/* ─────────── typy ─────────── */
type Path = "quick" | "branding" | "web";

interface BriefData {
    path: Path;
    companyName?: string;
    industry?: string;
    audience?: string[];
    inspiration?: string;
    siteType?: string;
    hasBranding?: string;
    webInspiration?: string;
    quickMessage?: string;
    name?: string;
    email?: string;
    note?: string;
    budget?: string;
}

const T = {
    pl: {
        audience: ["Kobiety 25–45", "Mężczyźni 25–45", "Firmy (B2B)", "Lokalne (gastronomia, usługi)", "Klienci premium", "Młodzi / Gen Z"],
        errName: "Podaj swoje imię", errEmail: "Podaj adres e-mail", errEmailBad: "Nieprawidłowy adres e-mail", errMsg: "Zostaw krótką wiadomość",
        errNetwork: "Coś się posypało podczas wysyłania. Spróbuj napisać bezpośrednio na maila 😅",
        sentTitle: "Wiadomość poszła w świat! 🎉", sentA: "Odezwę się na", sentB: "zazwyczaj w ciągu kilku godzin.",
        eyebrow: "Wyślij brief", h2: "Zacznijmy tworzyć wizerunek, który sprzedaje",
        lead: "Zaznacz opcje w poniższym briefie i zróbmy ten pierwszy krok. Dopracowana marka czeka na Ciebie na wciągnięcie ręki!",
        szybko: "Wolisz na szybko?", typBriefu: "Typ briefu",
        mailLabel: "Napisz maila", telLabel: "Zadzwoń", kopiuj: "Kopiuj", skopiowano: "Skopiowano",
        tabs: [["Wiadomość", "Szybki kontakt"], ["Logo / Branding", "Identyfikacja marki"], ["Strona WWW", "Sklep, landing, wizytówka"]],
        quickLabel: "O co chodzi? 🎤", quickSub: "Opisz co potrzebujesz, zapytaj o cenę, lub napisz kiedy możemy pogadać przez telefon.",
        quickPh: "Hej Wuyo! Potrzebuję logo, mam otwarcie sklepu za 3 tygodnie... albo: zadzwoń do mnie na xxx-xxx-xxx",
        brandInfo: "Wypełnij tyle ile wiesz — nie masz wszystkich odpowiedzi? Żaden problem, zostawiaj pola puste i dogadamy na żywo.",
        nameL: "Nazwa marki 👶", nameS: "Jak ma się nazywać firma?", namePh: "np. Złoty Piec, Studio Marta...",
        indL: "Branża i Oferta 🔧", indS: "Czym się zajmujesz?", indPh: "np. Fryzjer, sklep online, agencja...",
        audL: "Grupa docelowa 👥", audS: "Kto będzie Twoim klientem? (możesz zaznaczyć kilka)",
        inspL: "Inspiracje 👀", inspS: "Wklej linki do marek lub stron, które Ci się podobają", inspPh: "np. https://przykladowamarka.pl — lubię ich czystość i ciemne kolory...",
        webInfo: "Wypełnij tyle ile wiesz — im więcej szczegółów, tym dokładniejsza wycena. Reszty dopytam przy pierwszym kontakcie.",
        typeL: "Typ strony 🏗️", typeS: "Co konkretnie chcesz zbudować?", typeChoose: "-- Wybierz rodzaj --",
        types: ["Wizytówka / One-pager", "Landing Page (pod produkt/ofertę)", "Strona wielostronicowa", "Sklep internetowy E-commerce"],
        brL: "Branding 🎨", brS: "Masz już logo i kolory?", brChoose: "-- Wybierz --",
        brs: ["Tak, mam pełny branding (logo + wytyczne)", "Mam tylko logo, bez wytycznych", "Nie, budujemy wszystko od zera"],
        winspL: "Inspiracje 🔗", winspS: "Podrzuć linki do stron, które wyglądają tak jak tego chcesz",
        winspPh: "np. https://apple.com (czysto i nowocześnie) lub https://sklep.pl (chcę podobny układ kart)...",
        daneH: "Twoje dane kontaktowe 📬", daneS: "Gdzie wysłać odpowiedź i wycenę?",
        imie: "Imię *", imiePh: "Jak mam się do Ciebie zwracać?", emailPh: "Na jaki adres mam odpisać?",
        cos: "Coś jeszcze? Deadline? (opcjonalne)", cosPh: "Szczegóły, termin realizacji, specjalne życzenia...",
        rodo: "Administratorem danych jest Wuyo. Wysyłając wiadomość zgadzasz się, że je przechowam tylko po to, by odpisać. 😉",
        wysylam: "Wysyłam...", wyslij: "Wyślij, załatwione!",
    },
    en: {
        audience: ["Women 25–45", "Men 25–45", "Businesses (B2B)", "Local (food, services)", "Premium clients", "Young / Gen Z"],
        errName: "Please enter your name", errEmail: "Please enter your email", errEmailBad: "That email address doesn't look right", errMsg: "Leave a short message",
        errNetwork: "Something went wrong while sending. Please email me directly at kontakt@wuyo.pl 😅",
        sentTitle: "Message sent! 🎉", sentA: "I'll reply to", sentB: "usually within a few hours.",
        eyebrow: "Send a brief", h2: "Let's build a brand that sells",
        lead: "Pick the options below and let's take the first step. Feel free to write in English.",
        szybko: "Prefer something quicker?", typBriefu: "Brief type",
        mailLabel: "Email me", telLabel: "Call", kopiuj: "Copy", skopiowano: "Copied",
        tabs: [["Message", "Quick contact"], ["Logo / Branding", "Brand identity"], ["Website", "Shop, landing page, one-pager"]],
        quickLabel: "What do you need? 🎤", quickSub: "Describe what you need, ask about the price, or tell me when we can talk on the phone.",
        quickPh: "Hi WUYO! I need a logo, my shop opens in 3 weeks... or: call me on xxx-xxx-xxx",
        brandInfo: "Fill in what you know. Don't have all the answers? No problem, leave fields empty and we'll sort it out together.",
        nameL: "Brand name 👶", nameS: "What is the business called?", namePh: "e.g. Golden Oven, Studio Marta...",
        indL: "Industry and offer 🔧", indS: "What do you do?", indPh: "e.g. hairdresser, online shop, agency...",
        audL: "Target audience 👥", audS: "Who are your customers? (pick as many as you like)",
        inspL: "Inspiration 👀", inspS: "Paste links to brands or websites you like", inspPh: "e.g. https://examplebrand.com — I like how clean and dark it is...",
        webInfo: "Fill in what you know. The more detail, the more accurate the quote. I'll ask about the rest when we talk.",
        typeL: "Type of website 🏗️", typeS: "What exactly do you want to build?", typeChoose: "-- Choose type --",
        types: ["One-page site", "Landing page (for a product/offer)", "Multi-page website", "Online shop (e-commerce)"],
        brL: "Branding 🎨", brS: "Do you already have a logo and colours?", brChoose: "-- Choose --",
        brs: ["Yes, full branding (logo + guidelines)", "Only a logo, no guidelines", "No, we build everything from scratch"],
        winspL: "Inspiration 🔗", winspS: "Share links to websites that look the way you want yours to",
        winspPh: "e.g. https://apple.com (clean and modern) or https://shop.com (I want similar product cards)...",
        daneH: "Your contact details 📬", daneS: "Where should I send my reply and quote?",
        imie: "Name *", imiePh: "What should I call you?", emailPh: "Where should I reply?",
        cos: "Anything else? Deadline? (optional)", cosPh: "Details, deadline, special requests...",
        rodo: "WUYO is the data controller. By sending this message you agree that I keep your details only to reply to you. 😉",
        wysylam: "Sending...", wyslij: "Send it!",
    },
} as const;



export function ContactBrief() {
    const locale = localeFromPath(usePathname());
    const t = T[locale];
    const audienceOptions = t.audience;
    const [path, setPath] = useState<Path>("quick");
    const [data, setData] = useState<BriefData>({ path: "quick", audience: [] });
    const [honeypot, setHoneypot] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [skopiowano, setSkopiowano] = useState(false);
    const kopiujMail = () => {
        navigator.clipboard?.writeText(EMAIL).then(() => {
            setSkopiowano(true);
            window.setTimeout(() => setSkopiowano(false), 2000);
        }).catch(() => {});
    };
    const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const pakiet = searchParams.get("pakiet");
        if (pakiet) {
            const webPkg = packages.find((p) => p.name === pakiet);
            const bizPkg = locale === "en"
                ? pricingGroupsEn.flatMap((g) => g.cards).find((c) => c.name === pakiet)
                : findPricingCard(pakiet);

            let priceStr = "";
            let featuresList = "";

            if (bizPkg) {
                priceStr = ` (${bizPkg.price} ${bizPkg.priceSuffix})`;
                featuresList = (locale === "en" ? "\n\nWhat the package includes:\n" : "\n\nCo zawiera ten pakiet:\n") + bizPkg.features.map((f) => `• ${f}`).join("\n");
            } else if (webPkg) {
                priceStr = ` (${webPkg.price})`;
            }

            switchPath("quick");
            setData((prev) => ({
                ...prev,
                path: "quick",
                quickMessage: locale === "en"
                    ? `Hi! I'm interested in the "${pakiet}" package${priceStr}.${featuresList}\n\nI'd like to know more and discuss the details.`
                    : `Cześć! Interesuje mnie pakiet „${pakiet}”${priceStr}.${featuresList}\n\nChciałbym dowiedzieć się więcej i omówić szczegóły.`,
            }));
            setTimeout(() => {
                const el = document.getElementById("kontakt");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
            router.replace(`${route("home", locale)}#kontakt`, { scroll: false });
        }
    }, [searchParams]);

    const switchPath = (p: Path) => {
        setPath(p);
        setData((prev) => ({ ...prev, path: p }));
    };

    const toggleAudience = (a: string) => {
        setData((d) => {
            const arr = d.audience ?? [];
            return { ...d, audience: arr.includes(a) ? arr.filter((x) => x !== a) : [...arr, a] };
        });
    };

    // Automatyczne przewijanie do komunikatu o sukcesie
    useEffect(() => {
        if (submitted) {
            const el = document.getElementById("kontakt");
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }, [submitted]);

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const handleSubmit = async () => {
        if (honeypot) return;

        const errs: typeof fieldErrors = {}
        if (!data.name?.trim()) errs.name = t.errName
        if (!data.email?.trim()) errs.email = t.errEmail
        else if (!EMAIL_RE.test(data.email)) errs.email = t.errEmailBad
        if (path === "quick" && !data.quickMessage?.trim()) errs.message = t.errMsg

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            return
        }
        setFieldErrors({})
        setSending(true);
        setError("");
        try {
            const res = await fetch("/api/brief", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, note: locale === "en" ? `[EN, odpisz po angielsku] ${data.note ?? ""}`.trim() : data.note, hp: honeypot }),
            });
            if (!res.ok) {
                // Przy 400 serwer mówi konkretnie, co poprawić (np. zły adres) —
                // pokazujemy to, żeby dało się wysłać ponownie. Przy awarii
                // technicznej treść z serwera nic klientowi nie da, więc ogólnik.
                if (res.status === 400) {
                    const info = await res.json().catch(() => null);
                    if (typeof info?.error === "string") throw new Error(info.error);
                }
                throw new Error("network");
            }
            trackFormSubmit(path);
            setSubmitted(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : "network";
            setError(
                message === "network"
                    ? t.errNetwork
                    : message
            );
        } finally {
            setSending(false);
        }
    };

    if (submitted) {
        return (
            <section id="kontakt" className="py-28 px-6 md:px-12 relative">
                <div className="max-w-3xl mx-auto relative z-10 text-center py-20 bg-navy-light/40 border border-white/5 rounded-3xl backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(255,215,0,0.3)]" style={{ background: "#FFD700" }}>
                        <Check size={36} color="#000" strokeWidth={3} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">{t.sentTitle}</h3>
                    <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed">
                        {t.sentA} <span className="text-gold font-semibold text-xl block mt-2">{data.email}</span> {t.sentB}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="kontakt" className="py-28 px-6 md:px-12 relative overflow-hidden">
            <div className="section-glow" />
            <div className="max-w-4xl mx-auto relative z-10">

                <div className="text-center mb-12">
                    <p className="eyebrow mb-4">{t.eyebrow}</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{t.h2}</h2>
                    <p className="text-white/60 max-w-xl mx-auto">
                        {t.lead}
                    </p>
                </div>

                {/* Mail i telefon na widoku. Klienci szukali adresu mailowego, a był tylko w stopce.
                    „Kopiuj” obok, bo link mailto nic nie robi u kogoś bez programu pocztowego. */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
                    <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4">
                        <Mail size={22} className="text-gold shrink-0" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <p className="text-white/50 text-[11px] uppercase tracking-widest">{t.mailLabel}</p>
                            <a href={`mailto:${EMAIL}`} className="block text-white font-bold text-lg hover:text-gold transition-colors truncate">{EMAIL}</a>
                        </div>
                        <button
                            type="button"
                            onClick={kopiujMail}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-gold/50 hover:text-white transition-colors"
                        >
                            {skopiowano ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                            {skopiowano ? t.skopiowano : t.kopiuj}
                        </button>
                    </div>
                    <a
                        href={`tel:${TELEFON}`}
                        onClick={trackPhoneClick}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:border-gold/40 transition-colors"
                    >
                        <Phone size={22} className="text-gold shrink-0" aria-hidden="true" />
                        <div>
                            <p className="text-white/50 text-[11px] uppercase tracking-widest">{t.telLabel}</p>
                            <p className="text-white font-bold text-lg">+48 725 182 053</p>
                        </div>
                    </a>
                </div>

                {/* Szybki kontakt przez komunikatory */}
                <div className="flex flex-col items-center gap-3 mb-10">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <span className="text-white/60 text-sm">{t.szybko}</span>
                        <a
                            href={WA_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={trackWhatsAppClick}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-green-500/40 bg-green-500/10 text-green-400 text-sm font-semibold hover:bg-green-500/20 hover:border-green-500/70 transition-all duration-300"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.117 1.533 5.845L0 24l6.335-1.513C8.07 23.441 10.002 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.85 0-3.612-.497-5.13-1.363l-.363-.215-3.76.897.95-3.665-.237-.38A9.945 9.945 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                            WhatsApp
                        </a>
                        <a
                            href={MESSENGER_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 hover:border-blue-500/70 transition-all duration-300"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464C18.627 22.222 24 17.247 24 11.111 24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" /></svg>
                            Messenger
                        </a>
                    </div>
                    {locale === "pl" && <p className="text-white/50 text-xs text-center">
                        💬 Możesz też skorzystać z{" "}
                        <span className="text-gold/80 font-semibold">chatbota AI</span>{" "}
                        w prawym dolnym rogu strony &mdash; odpowie od ręki!
                    </p>}
                </div>

                <div className="bg-navy-dark/60 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">

                    {/* ZAKŁADKI */}
                    <div role="tablist" aria-label={t.typBriefu} className="relative grid grid-cols-3 border-b border-white/10 bg-navy/30">
                        {([
                            { id: "quick" as Path, icon: <MessageSquare size={18} />, label: t.tabs[0][0], sub: t.tabs[0][1] },
                            { id: "branding" as Path, icon: <Star size={18} />, label: t.tabs[1][0], sub: t.tabs[1][1] },
                            { id: "web" as Path, icon: <Monitor size={18} />, label: t.tabs[2][0], sub: t.tabs[2][1] },
                        ] as const).map((tab) => (
                            <button
                                key={tab.id}
                                role="tab"
                                aria-selected={path === tab.id}
                                aria-controls={`tabpanel-${tab.id}`}
                                id={`tab-${tab.id}`}
                                onClick={() => switchPath(tab.id)}
                                className={`relative flex flex-col items-center justify-center py-5 px-3 gap-2 transition-all duration-300 text-center
                                    ${path === tab.id ? "bg-gold text-navy-dark" : "text-white/60 hover:text-white/70 hover:bg-white/5"}`}
                            >
                                <span className={`transition-colors ${path === tab.id ? "text-navy-dark" : ""}`} aria-hidden="true">{tab.icon}</span>
                                <span className="font-bold text-xs md:text-sm leading-tight">{tab.label}</span>
                                <span className={`text-[10px] hidden md:block ${path === tab.id ? "text-navy-dark/70" : "text-white/50"}`}>{tab.sub}</span>
                            </button>
                        ))}
                        {/* Jeden wspólny pasek zamiast osobnego w każdej zakładce.
                            Kolumny są równe (grid-cols-3), więc pozycję da się wyliczyć
                            bez mierzenia czegokolwiek w JavaScripcie. */}
                        <span
                            aria-hidden="true"
                            className="pasek-zakladki absolute bottom-0 left-0 h-[3px] w-1/3 bg-gold rounded-t"
                            style={{ transform: `translateX(${["quick", "branding", "web"].indexOf(path) * 100}%)` }}
                        />
                    </div>

                    <div className="p-6 md:p-10">

                        {/* DYNAMICZNA CZĘŚĆ BRIEFU */}
                        <div
                            key={path}
                            role="tabpanel"
                            id={`tabpanel-${path}`}
                            aria-labelledby={`tab-${path}`}
                            className="panel-briefu mb-10 pb-10 border-b border-white/10 space-y-8"
                        >
                                {path === "quick" && (
                                    <BriefField label={t.quickLabel} sub={t.quickSub}>
                                        <textarea
                                            rows={5}
                                            className={`brief-input resize-none w-full ${fieldErrors.message ? "border-red-500/60" : ""}`}
                                            placeholder={t.quickPh}
                                            value={data.quickMessage ?? ""}
                                            onChange={(e) => { setData((d) => ({ ...d, quickMessage: e.target.value })); setFieldErrors(p => ({ ...p, message: undefined })) }}
                                        />
                                        {fieldErrors.message && <p id="error-message" className="text-red-400 text-xs mt-1" role="alert">{fieldErrors.message}</p>}
                                    </BriefField>
                                )}

                                {path === "branding" && (
                                    <>
                                        <div className="flex items-start gap-3 bg-gold/10 p-4 rounded-xl border border-gold/20 text-sm text-gold/90">
                                            <Briefcase size={18} className="mt-0.5 shrink-0" />
                                            <span>{t.brandInfo}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <BriefField label={t.nameL} sub={t.nameS}>
                                                <input className="brief-input w-full" placeholder={t.namePh} value={data.companyName ?? ""} onChange={(e) => setData((d) => ({ ...d, companyName: e.target.value }))} />
                                            </BriefField>
                                            <BriefField label={t.indL} sub={t.indS}>
                                                <input className="brief-input w-full" placeholder={t.indPh} value={data.industry ?? ""} onChange={(e) => setData((d) => ({ ...d, industry: e.target.value }))} />
                                            </BriefField>
                                        </div>
                                        <BriefField label={t.audL} sub={t.audS}>
                                            <div className="flex flex-wrap gap-2">
                                                {audienceOptions.map((a) => (
                                                    <button key={a} onClick={() => toggleAudience(a)}
                                                        className={`px-4 py-2 rounded-xl border text-sm transition-all ${(data.audience ?? []).includes(a) ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-white/60 hover:bg-white/5 hover:text-white"}`}>
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        </BriefField>
                                        <BriefField label={t.inspL} sub={t.inspS}>
                                            <textarea rows={3} className="brief-input resize-none w-full" placeholder={t.inspPh} value={data.inspiration ?? ""} onChange={(e) => setData((d) => ({ ...d, inspiration: e.target.value }))} />
                                        </BriefField>
                                    </>
                                )}

                                {path === "web" && (
                                    <>
                                        <div className="flex items-start gap-3 bg-gold/10 p-4 rounded-xl border border-gold/20 text-sm text-gold/90">
                                            <Monitor size={18} className="mt-0.5 shrink-0" />
                                            <span>{t.webInfo}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <BriefField label={t.typeL} sub={t.typeS}>
                                                <select className="brief-input w-full bg-navy" value={data.siteType ?? ""} onChange={(e) => setData((d) => ({ ...d, siteType: e.target.value }))}>
                                                    <option value="" disabled>{t.typeChoose}</option>
                                                    <option value="wizytowka">{t.types[0]}</option>
                                                    <option value="landing">{t.types[1]}</option>
                                                    <option value="wielostronicowa">{t.types[2]}</option>
                                                    <option value="sklep">{t.types[3]}</option>
                                                </select>
                                            </BriefField>
                                            <BriefField label={t.brL} sub={t.brS}>
                                                <select className="brief-input w-full bg-navy" value={data.hasBranding ?? ""} onChange={(e) => setData((d) => ({ ...d, hasBranding: e.target.value }))}>
                                                    <option value="" disabled>{t.brChoose}</option>
                                                    <option value="tak_pelny">{t.brs[0]}</option>
                                                    <option value="tak_czesc">{t.brs[1]}</option>
                                                    <option value="nie">{t.brs[2]}</option>
                                                </select>
                                            </BriefField>
                                        </div>
                                        <BriefField label={t.winspL} sub={t.winspS}>
                                            <textarea rows={3} className="brief-input resize-none w-full" placeholder={t.winspPh} value={data.webInspiration ?? ""} onChange={(e) => setData((d) => ({ ...d, webInspiration: e.target.value }))} />
                                        </BriefField>
                                    </>
                                )}
                        </div>

                        {/* DANE KONTAKTOWE — zawsze widoczne */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{t.daneH}</h3>
                                <p className="text-white/60 text-sm">{t.daneS}</p>
                            </div>

                            {/* bot trap */}
                            <input type="text" name="botField" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="contact-name" className="brief-label">{t.imie}</label>
                                    <input
                                        id="contact-name"
                                        className={`brief-input w-full ${fieldErrors.name ? "border-red-500/60 focus:border-red-500" : ""}`}
                                        placeholder={t.imiePh}
                                        value={data.name || ""}
                                        onChange={(e) => { setData(prev => ({ ...prev, name: e.target.value })); setFieldErrors(p => ({ ...p, name: undefined })) }}
                                        autoComplete="name"
                                        aria-required="true"
                                        aria-describedby={fieldErrors.name ? "error-name" : undefined}
                                    />
                                    {fieldErrors.name && <p id="error-name" className="text-red-400 text-xs mt-1" role="alert">{fieldErrors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="brief-label">E-mail *</label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        className={`brief-input w-full ${fieldErrors.email ? "border-red-500/60 focus:border-red-500" : ""}`}
                                        placeholder={t.emailPh}
                                        value={data.email || ""}
                                        onChange={(e) => { setData(prev => ({ ...prev, email: e.target.value })); setFieldErrors(p => ({ ...p, email: undefined })) }}
                                        autoComplete="email"
                                        aria-required="true"
                                        aria-describedby={fieldErrors.email ? "error-email" : undefined}
                                    />
                                    {fieldErrors.email && <p id="error-email" className="text-red-400 text-xs mt-1" role="alert">{fieldErrors.email}</p>}
                                </div>
                            </div>



                            <div>
                                <label className="brief-label">{t.cos}</label>
                                <textarea rows={2} className="brief-input w-full resize-none" placeholder={t.cosPh} value={data.note ?? ""} onChange={(e) => setData((d) => ({ ...d, note: e.target.value }))} />
                            </div>

                            {/* Przycisk + błąd */}
                            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
                                <div className="flex-1">
                                    {error ? (
                                        <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">⚠️ {error}</p>
                                    ) : (
                                        <p className="text-white/50 text-xs">{t.rodo}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={sending}
                                    className="btn-gold px-10 py-4 flex items-center justify-center gap-3 font-bold text-base rounded-full disabled:opacity-50 min-w-[220px] shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] w-full md:w-auto"
                                >
                                    {sending ? t.wysylam : <><Send size={18} /> {t.wyslij}</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── Helper: Field wrapper ─── */
function BriefField({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <div>
                <p className="font-bold text-white text-base">{label}</p>
                <p className="text-white/60 text-sm">{sub}</p>
            </div>
            {children}
        </div>
    );
}
