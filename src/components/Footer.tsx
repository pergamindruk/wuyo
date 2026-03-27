import Link from "next/link";
import Image from "next/image";
import { Youtube, Instagram, Facebook, MessageCircle, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-navy-dark border-t border-white/5 px-6 py-16 md:px-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                    <div className="space-y-6">
                        <Link href="/" className="relative block h-16 w-56 md:h-24 md:w-80 transition-opacity duration-300 hover:opacity-80">
                            <Image src="/logo_wuya2.webp" alt="WUYO" fill className="object-contain object-left" />
                        </Link>
                        <p className="text-white/50 text-xs sm:text-sm max-w-sm leading-relaxed">
                            Wuyo – Twój strategiczny partner w designie. Zamieniam dobre pomysły w marki, które zarabiają i wyróżniają się na tle konkurencji.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Szybkie linki</h4>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/" className="text-white/60 hover:text-white transition-colors">Główna</Link></li>
                                <li><Link href="/#portfolio" className="text-white/60 hover:text-white transition-colors">Portfolio</Link></li>
                                <li><Link href="/logo" className="text-white/60 hover:text-white transition-colors">Projektowanie logo</Link></li>
                                <li><Link href="/strony-www" className="text-white/60 hover:text-white transition-colors">Strony internetowe</Link></li>
                                <li><Link href="/druk" className="text-white/60 hover:text-white transition-colors">Druk & papeteria</Link></li>
                                <li><Link href="/cennik" className="text-white/60 hover:text-white transition-colors">Cennik</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Znajdziesz mnie</h4>
                            <ul className="space-y-3 text-sm flex flex-col gap-2">
                                <li><Link href="https://www.youtube.com/@wuyo.dobra.grafa" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"><Youtube size={18} className="group-hover:text-red-500 transition-colors" /> YouTube</Link></li>
                                <li><Link href="https://www.instagram.com/wuyo.pl/" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"><Instagram size={18} className="group-hover:text-pink-500 transition-colors" /> Instagram</Link></li>
                                <li><Link href="https://www.facebook.com/wuyo.dobra.grafa" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"><Facebook size={18} className="group-hover:text-blue-500 transition-colors" /> Facebook</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Pogadajmy</h4>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <Link href="https://wa.me/48725182053" target="_blank" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-2">
                                        <MessageCircle size={18} className="group-hover:text-green-500 transition-colors" /> WhatsApp
                                    </Link>
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

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/20">
                    <p>&copy; 2026 Wuyo – Dobra Grafa.</p>

                    <div className="flex items-center gap-4 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500">
                        <Image src="/ikonki/ikona-adobe-photoshop.webp" alt="Photoshop" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-adobe-illustrator.webp" alt="Illustrator" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-adobe-indesign.webp" alt="InDesign" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-figma.webp" alt="Figma" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                        <Image src="/ikonki/ikona-capcut.webp" alt="CapCut" width={20} height={20} className="hover:scale-125 transition-transform duration-300" />
                    </div>

                    <div className="flex gap-6">
                        <Link href="/polityka-prywatnosci" className="hover:text-white/50 transition-colors">Polityka prywatności</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
