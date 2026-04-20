"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const SCROLL_DELAY_SAME_PAGE = 300; // czas na aktualizację DOM przed scrollem
const SCROLL_DELAY_CROSS_PAGE = 600; // czas na załadowanie nowej strony przed scrollem

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Zamknij menu i zescrolluj do sekcji na tej samej stronie
    // lub przejdź na stronę główną, a po załadowaniu zescrolluj
    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);

        const scrollToSection = () => {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        if (pathname === "/") {
            // Jesteśmy już na stronie głównej – zaktualizuj hash i scrolluj
            window.history.pushState(null, "", `/#${sectionId}`);
            setTimeout(scrollToSection, SCROLL_DELAY_SAME_PAGE);
        } else {
            // Inny URL – zaktualizuj URL i nawiguj
            router.push(`/#${sectionId}`, { scroll: false });
            setTimeout(scrollToSection, SCROLL_DELAY_CROSS_PAGE);
        }
    };

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (pathname === "/") {
            window.history.pushState(null, "", "/");
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            router.push("/", { scroll: false });
            setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), SCROLL_DELAY_SAME_PAGE);
        }
    };

    const hamburgerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const menu = document.getElementById("mobile-menu");
        const focusable = menu?.querySelectorAll<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.[0]?.focus();

        const handleTrap = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsMobileMenuOpen(false);
                hamburgerRef.current?.focus();
                return;
            }
            if (e.key !== "Tab" || !focusable?.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        };
        document.addEventListener("keydown", handleTrap);
        return () => document.removeEventListener("keydown", handleTrap);
    }, [isMobileMenuOpen]);

    const closeMenu = () => setIsMobileMenuOpen(false);
    const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 h-20 md:h-24 px-6 md:px-12 lg:px-24 bg-navy/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">

                {/* Lewa strona - Wielkie Logo (wystające za Header, zero efektów) */}
                <div className="flex-1 flex items-center justify-start">
                    <a
                        href="/"
                        onClick={handleHomeClick}
                        aria-label="Wuyo – Dobra Grafa, strona główna"
                        className={`absolute left-6 md:left-12 lg:left-24 z-50 block cursor-pointer transition-all duration-300 ease-out origin-top-left ${scrolled
                            ? "top-3 md:top-4 h-10 w-20 md:h-12 md:w-28 lg:h-12 lg:w-36 opacity-90"
                            : "top-3 md:top-4 h-12 w-24 md:h-14 md:w-32 lg:h-14 lg:w-44 opacity-100"
                            }`}
                    >
                        <Image
                            src="/logo_wuya2.webp"
                            alt="WUYO – Dobra Grafa logo"
                            fill
                            sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 384px"
                            className="object-contain object-left"
                            priority
                        />
                    </a>
                </div>

                {/* Środek - Nawigacja (tylko desktop) */}
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <nav aria-label="Nawigacja główna" className="flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/70">
                        <a href="/#portfolio" onClick={(e) => handleAnchorClick(e, "portfolio")} className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Portfolio
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </a>
                        <Link href="/cennik" className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Cennik
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="/druk" className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Druk
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="/blog" className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Blog
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <a href="/#kontakt" onClick={(e) => handleAnchorClick(e, "kontakt")} className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Kontakt
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    </nav>
                </div>

                {/* Prawa strona - Przycisk / Mobile Menu */}
                <div className="flex-1 flex justify-end items-center gap-4">
                    <a
                        href="/#kontakt"
                        onClick={(e) => handleAnchorClick(e, "kontakt")}
                        className="hidden md:inline-flex btn-gold px-6 py-2.5 rounded-full font-bold text-sm shadow-[0_0_15px_rgba(255,235,82,0.15)] hover:shadow-[0_0_25px_rgba(255,235,82,0.3)]"
                    >
                        Napisz do mnie
                    </a>

                    <button
                        ref={hamburgerRef}
                        className="md:hidden text-white p-2 hover:text-gold transition-colors"
                        onClick={toggleMenu}
                        aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMobileMenuOpen ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Menu mobilne"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 bg-navy backdrop-blur-3xl pt-32 px-6 flex flex-col md:hidden border-b border-white/10"
                    >
                        <nav aria-label="Menu mobilne" className="flex flex-col gap-6 text-xl font-medium text-white/90">
                            <a href="/#portfolio" onClick={(e) => handleAnchorClick(e, "portfolio")} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Portfolio</a>
                            <Link href="/cennik" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Cennik</Link>
                            <Link href="/druk" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Druk</Link>
                            <Link href="/blog" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Blog</Link>
                            <a href="/#kontakt" onClick={(e) => handleAnchorClick(e, "kontakt")} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Kontakt</a>
                        </nav>
                        <div className="mt-10 mx-auto">
                            <a
                                href="/#kontakt"
                                onClick={(e) => handleAnchorClick(e, "kontakt")}
                                className="btn-gold px-8 py-3 text-sm rounded-full"
                            >
                                Napisz do mnie
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
