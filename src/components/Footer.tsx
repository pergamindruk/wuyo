import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, MessageCircle, Mail } from "lucide-react";
import { TrackedLink } from "@/components/TrackedLink";
import { ConsentSettingsLink } from "@/components/ConsentSettingsLink";
import { route, type Locale, type RouteKey } from "@/lib/i18n";

const T = {
    pl: {
        opis: "Studio graficzne z Rzeszowa. Logo, strony internetowe i druk dla firm z całej Polski. Zamieniam dobre pomysły w marki, które zarabiają.",
        szybkie: "Szybkie linki", glowna: "Główna", logo: "Projektowanie logo", www: "Strony internetowe",
        druk: "Druk & papeteria", odziez: "Odzież & personalizacja", oMnie: "O mnie",
        lokalnie: "Rzeszów i okolice", grafikRz: "Grafik Rzeszów", wwwRz: "Strony internetowe Rzeszów", drukRz: "Druk wizytówek Rzeszów",
        znajdziesz: "Znajdziesz mnie", pogadajmy: "Pogadajmy", prywatnosc: "Polityka prywatności",
    },
    en: {
        opis: "Graphic design studio in Rzeszów, Poland. Logos, websites and print for businesses across Poland. I turn good ideas into brands that make money.",
        szybkie: "Quick links", glowna: "Home", logo: "Logo design", www: "Websites",
        druk: "Print & stationery", odziez: "Apparel printing", oMnie: "About",
        lokalnie: "Rzeszów area", grafikRz: "Graphic designer Rzeszów", wwwRz: "Web design Rzeszów", drukRz: "Printing Rzeszów",
        znajdziesz: "Find me", pogadajmy: "Let's talk", prywatnosc: "Privacy policy",
    },
} as const;

export function Footer({ locale = "pl" }: { locale?: Locale }) {
    const t = T[locale];
    const r = (key: RouteKey) => route(key, locale);
    return (
        <footer className="bg-navy-dark border-t border-white/5 px-6 py-16 md:px-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-12">
                    <div className="space-y-6">
                        <Link href={r("home")} className="relative block h-16 w-56 md:h-24 md:w-80 transition-opacity duration-300 hover:opacity-80">
                            <Image src="/logo_wuya2.webp" alt="WUYO" fill className="object-contain object-left" />
                        </Link>
                        <p className="text-white/60 text-xs sm:text-sm max-w-sm leading-relaxed">
                            {t.opis}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 lg:gap-12">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">{t.szybkie}</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href={r("home")} className="text-white/60 hover:text-white transition-colors">{t.glowna}</Link></li>
                                <li><Link href={`${r("home")}#portfolio`} className="text-white/60 hover:text-white transition-colors">Portfolio</Link></li>
                                <li><Link href={r("logo")} className="text-white/60 hover:text-white transition-colors">{t.logo}</Link></li>
                                <li><Link href={r("websites")} className="text-white/60 hover:text-white transition-colors">{t.www}</Link></li>
                                <li><Link href={r("print")} className="text-white/60 hover:text-white transition-colors">{t.druk}</Link></li>
                                <li><Link href={r("apparel")} className="text-white/60 hover:text-white transition-colors">{t.odziez}</Link></li>
                                <li><Link href={r("about")} className="text-white/60 hover:text-white transition-colors">{t.oMnie}</Link></li>
                            </ul>
                        </div>
                        {/* Strony lokalne trafiają do stopki, bo walczą o frazy z „rzeszów”,
                            a linkował do nich dotąd tylko blog — pięć linków na stronę. */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">{t.lokalnie}</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href={r("designerRzeszow")} className="text-white/60 hover:text-white transition-colors">{t.grafikRz}</Link></li>
                                <li><Link href={r("websitesRzeszow")} className="text-white/60 hover:text-white transition-colors">{t.wwwRz}</Link></li>
                                <li><Link href={r("printRzeszow")} className="text-white/60 hover:text-white transition-colors">{t.drukRz}</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">{t.znajdziesz}</h4>
                            <ul className="space-y-3 text-sm flex flex-col gap-2">
                                <li><Link href="https://www.instagram.com/wuyo.pl/" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"><Instagram size={18} className="group-hover:text-pink-500 transition-colors" /> Instagram</Link></li>
                                <li><Link href="https://www.facebook.com/wuyo.dobra.grafa" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"><Facebook size={18} className="group-hover:text-blue-500 transition-colors" /> Facebook</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">{t.pogadajmy}</h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <TrackedLink href="https://wa.me/48725182053" trackAs="whatsapp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-2">
                                        <MessageCircle size={18} className="group-hover:text-green-500 transition-colors" /> WhatsApp
                                    </TrackedLink>
                                </li>
                                <li>
                                    <Link href="https://m.me/wuyo.dobra.grafa" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-2">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] group-hover:text-blue-500 transition-colors"><path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464C18.627 22.222 24 17.247 24 11.111 24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z" /></svg> Messenger
                                    </Link>
                                </li>
                                <li>
                                    <Link href="mailto:kontakt@wuyo.pl" className="flex items-center gap-2 text-gold hover:text-white transition-colors group">
                                        <Mail size={18} className="group-hover:text-white transition-colors" /> kontakt@wuyo.pl
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50">
                    <p>&copy; 2026 WUYO Dobra Grafa.</p>

                    <div className="flex items-center gap-4 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                        <Image src="/ikonki/ikona-adobe-photoshop.webp" alt="Photoshop" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-adobe-illustrator.webp" alt="Illustrator" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-adobe-indesign.webp" alt="InDesign" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-figma.webp" alt="Figma" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-capcut.webp" alt="CapCut" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                    </div>

                    <div className="flex gap-6">
                        <Link href={r("privacy")} className="hover:text-white/60 transition-colors">{t.prywatnosc}</Link>
                        <ConsentSettingsLink className="cursor-pointer hover:text-white/60 transition-colors" label={locale === "en" ? "Cookie settings" : "Ustawienia ciasteczek"} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
