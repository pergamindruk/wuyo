import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, MapPin, Phone, Mail, Star } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Spotlight } from "@/components/ui/spotlight";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactBrief } from "@/components/ContactBrief";
import { PageFaq, type FaqEntry } from "@/components/PageFaq";
import { faqPageSchema } from "@/lib/faq-schema";
import { GOOGLE_PROFILE_URL } from "@/data/google-reviews-static";
import { alternatesFor, route } from "@/lib/i18n";

// Angielska wersja /grafik-rzeszow, dla obcokrajowców mieszkających w Rzeszowie.
// Ceny jak na stronach usług; wizytówki: sam druk od 99 zł, z projektem od 299 zł.

export const metadata: Metadata = {
    title: "Graphic designer in Rzeszów: logos, websites, print",
    description: "English-speaking graphic designer in Rzeszów, Poland. Logos from 890 PLN, websites from 1,990 PLN, business cards from 99 PLN. Fixed prices, quote within 24h.",
    alternates: alternatesFor("designerRzeszow", "en"),
    openGraph: {
        title: "Graphic designer in Rzeszów | WUYO",
        description: "Logos, websites and print in Rzeszów. Fixed prices, one person from brief to finished files.",
        images: ["/og-image.webp"],
        url: "https://wuyo.pl/en/graphic-designer-rzeszow",
        locale: "en_GB",
    },
};

const faqs: FaqEntry[] = [
    { q: "How much does a graphic designer in Rzeszów cost?", a: "A logo starts at 890 PLN, a full brand identity (logo + brand book + printed business cards + email signature) is 1,490 PLN, a website starts at 1,990 PLN and business cards cost from 99 PLN for print only or from 299 PLN for 50 with design. All prices are fixed, net, plus 23% VAT. You get the price before we start, not after." },
    { q: "Do you work with businesses outside Rzeszów?", a: "Yes. Design works just as well remotely, and many of my clients are outside Rzeszów. We can talk on WhatsApp, Messenger or email, and I ship print by courier." },
    { q: "How long will I wait for the finished project?", a: "Logo: 7–10 working days from the brief. Website: 7–14 working days. Printed business cards: 1–3 working days. If you have an urgent deadline, write to me and we'll work it out." },
    { q: "Can we work in English?", a: "Yes. You can write to me in English and all files, quotes and the brief can be in English. Your logo, website or print can be in English, Polish or both." },
];

const services = [
    { title: "Logo and brand identity", price: "from 890 PLN", desc: "Not a template, not Canva: a design made from scratch for your business. You get files ready for print, web and social media. Copyright included, no extra fees.", href: route("logo", "en"), items: ["Logo + icon + variants", "SVG, PNG, PDF, ready everywhere", "CMYK and HEX colours", "Full copyright"] },
    { title: "Websites", price: "from 1,990 PLN", desc: "I build sites from scratch in Next.js, or on WordPress if you want to edit content yourself. The site loads fast, works on phones and Google sees it from day one.", href: route("websites", "en"), items: ["Next.js, loads in under 1s", "Technical SEO built in", "Works on every phone", "Deployed on your hosting"] },
    { title: "Print and stationery", price: "from 99 PLN", desc: "I have my own equipment and print in-house, not at an outside print shop. You can have business cards the next day. From 50 pieces, without a week's wait.", href: route("print", "en"), items: ["Business cards, flyers, vouchers, stickers", "Design + print in one place", "Small runs from 50 pieces", "Express turnaround"] },
    { title: "Advertising graphics", price: "individual quote", desc: "Social media posts and carousels, banners, roll-ups, packaging, labels. If you need your brand to look consistent on every medium, this is it.", href: null, items: ["Posts, stories, carousels", "Banners and roll-ups", "Packaging and labels", "Presentations and infographics"] },
];

const reasons = [
    { n: "01", title: "You know what you get before you pay", desc: "Before every project you get a fixed quote. Not an hourly rate, not \"it depends\". A specific amount and a specific deadline. If something changes along the way, I tell you right away, not on the invoice." },
    { n: "02", title: "You write to me, not to a company", desc: "There's no customer service department or project manager. You write to me, I reply, I design. It saves time and avoids the misunderstandings common at agencies." },
    { n: "03", title: "Logo, website and print in one order", desc: "Most businesses need all three at once. You can give everything to one person instead of finding a designer, a web developer and a print shop separately." },
    { n: "04", title: "Small runs printed in-house", desc: "I print business cards, flyers and stickers myself. You can order 50 instead of 500 and have them the next day." },
];

export default function GraphicDesignerRzeszowPage() {
    return (
        <div className="flex-1 w-full">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }} />

            <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 md:pt-48 overflow-hidden">
                <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#FFEB52" />
                <AnimatedSection className="relative z-10 max-w-3xl" animateOnMount={true}>
                    <div className="inline-flex items-center gap-2 text-gold/80 text-sm font-medium mb-5 border border-gold/20 bg-gold/5 px-4 py-1.5 rounded-full">
                        <MapPin size={13} />
                        Rzeszów · Podkarpackie · all of Poland
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Graphic designer<br className="hidden md:block" />
                        <span className="text-gold"> in&nbsp;Rzeszów</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                        New in Rzeszów and opening a business? I tell you the price before I start and I keep deadlines. No middleman: you talk to me and I do the design. In English.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold inline-block shadow-[0_0_20px_rgba(255,235,82,0.3)]">Write to me, quote in 24h</a>
                        <Link href={route("portfolio", "en")} className="px-8 py-3.5 rounded-full font-bold inline-block border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors">See my work</Link>
                    </div>
                </AnimatedSection>
            </section>

            <AnimatedSection>
                <div className="py-8 px-6 border-y border-white/5">
                    <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
                        {[
                            { stat: "Rzeszów", label: "and all of Poland remotely" },
                            { stat: "24h", label: "and the quote is in your inbox" },
                            { stat: "1 person", label: "you write to me, not a department" },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-2xl md:text-3xl font-bold text-gold">{item.stat}</p>
                                <p className="text-white/50 text-xs md:text-sm mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Design services · Rzeszów</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">What you can hire me for</h2>
                        <p className="text-white/50 max-w-xl mx-auto mt-4">A logo, a website and business cards are three things every business needs. With me you order them in one place and talk to one person, not three different contractors. Prices net, plus 23% VAT.</p>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-6">
                        {services.map((s, i) => (
                            <AnimatedSection key={s.title} delay={i * 0.08}>
                                <div className="glass-card p-7 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-bold text-white text-lg">{s.title}</h3>
                                        <span className="text-gold font-bold text-sm shrink-0 ml-4">{s.price}</span>
                                    </div>
                                    <p className="text-white/55 text-sm leading-relaxed mb-5">{s.desc}</p>
                                    <ul className="space-y-2 flex-1">
                                        {s.items.map((item) => (
                                            <li key={item} className="flex items-center gap-2 text-white/60 text-xs">
                                                <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    {s.href && (
                                        <Link href={s.href} className="mt-5 inline-flex items-center gap-1.5 text-gold text-xs font-bold hover:gap-2.5 transition-all">
                                            More about this service <ArrowRight size={12} />
                                        </Link>
                                    )}
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-5xl mx-auto">
                    <AnimatedSection className="text-center mb-14">
                        <p className="eyebrow mb-4">Why WUYO</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white">What most agencies<br className="hidden md:block" /> in Rzeszów won&apos;t give you</h2>
                    </AnimatedSection>
                    <div className="grid md:grid-cols-2 gap-4">
                        {reasons.map((r, i) => (
                            <AnimatedSection key={r.n} delay={i * 0.07}>
                                <div className="glass-card p-6 flex gap-4">
                                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">{r.n}</div>
                                    <div>
                                        <h3 className="font-bold text-white mb-2 text-sm">{r.title}</h3>
                                        <p className="text-white/55 text-xs leading-relaxed">{r.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>
            </section>

            <TestimonialsSection locale="en" />

            <PageFaq items={faqs} title="Questions about a designer in Rzeszów" />

            <section className="py-16 px-6 md:px-12 bg-white/[0.02]">
                <div className="max-w-4xl mx-auto">
                    <AnimatedSection>
                        <div className="glass-card p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <p className="eyebrow mb-4">Write to me</p>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Tell me about your business.<br />Quote within 24h.</h2>
                                <p className="text-white/50 text-sm leading-relaxed mb-6">No automatic replies. You write, I read it and reply with a concrete proposal.</p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-white/70 text-sm"><MapPin size={15} className="text-gold shrink-0" />Rzeszów, Poland</li>
                                    <li className="flex items-center gap-3 text-white/70 text-sm"><Phone size={15} className="text-gold shrink-0" /><a href="tel:+48725182053" className="hover:text-white transition-colors">+48 725 182 053</a></li>
                                    <li className="flex items-center gap-3 text-white/70 text-sm"><Mail size={15} className="text-gold shrink-0" /><a href="mailto:kontakt@wuyo.pl" className="hover:text-white transition-colors">kontakt@wuyo.pl</a></li>
                                </ul>
                            </div>
                            <div className="flex flex-col gap-3">
                                <a href="#kontakt" className="btn-gold px-8 py-3.5 rounded-full font-bold text-center shadow-[0_0_20px_rgba(255,235,82,0.3)]">Write to me, reply within 24h</a>
                                <a href="https://wa.me/48725182053" target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full font-bold text-center border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm">WhatsApp</a>
                                <a href={GOOGLE_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 rounded-full font-bold text-center border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors text-sm"><Star size={13} className="inline -mt-0.5 mr-1" />Reviews on Google</a>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            <Suspense fallback={null}>
                <ContactBrief />
            </Suspense>
        </div>
    );
}
