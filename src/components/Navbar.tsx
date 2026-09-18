"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X, House, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMountTransition } from "@/lib/useMountTransition";

const SCROLL_DELAY_SAME_PAGE = 300; // czas na aktualizację DOM przed scrollem
const SCROLL_DELAY_CROSS_PAGE = 600; // czas na załadowanie nowej strony przed scrollem

// Cztery usługi pod jedną pozycją w menu. Wcześniej w pasku były Druk i Odzież,
// a Logo i Strony WWW — najdroższe usługi — nie miały linku w ogóle.
const USLUGI = [
    { href: "/logo", label: "Logo" },
    { href: "/strony-www", label: "Strony WWW" },
    { href: "/druk", label: "Druk & papeteria" },
    { href: "/odziez", label: "Odzież & nadruki" },
] as const;

/** Rozwijana „Oferta" w pasku na desktopie. Na telefonie usługi idą płaską listą. */
function OfertaMenu() {
    const [otwarte, setOtwarte] = useState(false);
    const { wDrzewie: listaWDrzewie, aktywny: listaAktywna } = useMountTransition(otwarte, 180);
    const obszarRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Wejście na podstronę zamyka listę — inaczej zostaje rozwinięta po kliknięciu.
    useEffect(() => {
        setOtwarte(false);
    }, [pathname]);

    useEffect(() => {
        if (!otwarte) return;

        const naKlawiszu = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOtwarte(false);
        };
        // mousedown, nie click — inaczej kliknięcie w link zamykałoby listę
        // dopiero po nawigacji.
        const naKlikniecieObok = (e: MouseEvent) => {
            if (!obszarRef.current?.contains(e.target as Node)) setOtwarte(false);
        };

        document.addEventListener("keydown", naKlawiszu);
        document.addEventListener("mousedown", naKlikniecieObok);
        return () => {
            document.removeEventListener("keydown", naKlawiszu);
            document.removeEventListener("mousedown", naKlikniecieObok);
        };
    }, [otwarte]);

    const naUsludze = USLUGI.some((u) => pathname === u.href);

    return (
        <div
            ref={obszarRef}
            className="relative"
            onMouseEnter={() => setOtwarte(true)}
            onMouseLeave={() => setOtwarte(false)}
        >
            <button
                type="button"
                aria-expanded={otwarte}
                aria-haspopup="true"
                onClick={() => setOtwarte((v) => !v)}
                className={`relative group flex items-center gap-1 cursor-pointer transition-colors hover:text-white whitespace-nowrap ${naUsludze ? "text-white" : ""}`}
            >
                Oferta
                <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${otwarte ? "rotate-180" : ""}`}
                />
                <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300 ${naUsludze ? "w-full" : "w-0 group-hover:w-full"}`}
                />
            </button>

            {listaWDrzewie && (
                <div
                    data-widoczny={listaAktywna ? "tak" : undefined}
                    // pt-4 to mostek dla kursora między przyciskiem a listą —
                    // bez niego lista zamykałaby się w drodze do niej.
                    // Przesunięcie o -50% siedzi w .menu-rozwijane razem z animacją,
                    // bo jedna właściwość `transform` nie pomieści dwóch źródeł.
                    className="menu-rozwijane absolute left-1/2 top-full pt-4"
                >
                    <ul className="min-w-[13rem] rounded-2xl border border-white/10 bg-navy-dark p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)]">
                        {USLUGI.map((u) => (
                            <li key={u.href}>
                                <Link
                                    href={u.href}
                                    onClick={() => setOtwarte(false)}
                                    className={`block rounded-xl px-4 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-white ${pathname === u.href ? "text-gold" : "text-white/70"}`}
                                >
                                    {u.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { wDrzewie: menuWDrzewie, aktywny: menuAktywne } = useMountTransition(isMobileMenuOpen, 200);
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

                {/* Lewa strona - Wielkie Logo (wystające za Header) */}
                <div className="flex-1 flex items-center justify-start">
                    {/* Zwykły <a> z animacją w CSS, nie motion.a. Framer Motion startował
                        logo z opacity:0, a to jest element LCP strony — nic się nie pokazywało,
                        dopóki nie ruszył JavaScript. Ten sam zabieg co przy hero. */}
                    <a
                        href="/"
                        onClick={handleHomeClick}
                        aria-label="Wuyo – Dobra Grafa, strona główna"
                        className={`logo-in absolute left-6 md:left-12 lg:left-24 z-50 block cursor-pointer transition-[top,height,width] duration-300 ease-out origin-top-left ${scrolled
                            ? "top-3 md:top-4 h-14 w-14 md:h-14 md:w-14"
                            : "top-4 md:top-6 h-24 w-48 md:h-32 md:w-64 lg:h-40 lg:w-[22rem]"
                            }`}
                    >
                        {scrolled ? (
                            <Image
                                src="/favicon-wuyo.png"
                                alt="WUYO – Dobra Grafa logo"
                                fill
                                sizes="56px"
                                className="object-contain"
                            />
                        ) : (
                            <Image
                                src="/logo_wuya2.webp"
                                alt="WUYO – Dobra Grafa logo"
                                fill
                                sizes="(max-width: 768px) 192px, (max-width: 1024px) 256px, 384px"
                                className="object-contain object-left"
                                priority
                            />
                        )}
                    </a>
                </div>

                {/* Środek - Nawigacja (tylko desktop) */}
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <nav aria-label="Nawigacja główna" className="flex items-center gap-6 lg:gap-8 text-sm font-medium text-white/70">
                        <a
                            href="/"
                            onClick={handleHomeClick}
                            aria-label="Strona główna"
                            className="text-white/50 hover:text-gold transition-colors duration-200"
                        >
                            <House size={18} aria-hidden="true" />
                        </a>
                        <OfertaMenu />
                        <Link href="/cennik" className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Cennik
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="/realizacje" className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Realizacje
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                        <Link href="/blog" className="relative group transition-colors hover:text-white whitespace-nowrap">
                            Blog
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
                        </Link>
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
            {menuWDrzewie && (
                <div
                    id="mobile-menu"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu mobilne"
                    data-widoczny={menuAktywne ? "tak" : undefined}
                    className="menu-mobilne fixed inset-0 z-40 bg-navy backdrop-blur-3xl pt-32 px-6 flex flex-col md:hidden border-b border-white/10"
                >
                    <nav aria-label="Menu mobilne" className="flex flex-col gap-6 text-xl font-medium text-white/90">
                        <a href="/" onClick={handleHomeClick} className="hover:text-gold transition-colors border-b border-white/5 pb-4 flex items-center gap-3">
                            <House size={20} aria-hidden="true" />
                            Strona główna
                        </a>
                        {/* Na telefonie usługi idą płaską listą pod nagłówkiem —
                            rozwijane menu w szufladzie to jedno kliknięcie za dużo. */}
                        <p className="text-xs font-bold uppercase tracking-widest text-white/50 -mb-2">Oferta</p>
                        {USLUGI.map((u) => (
                            <Link
                                key={u.href}
                                href={u.href}
                                onClick={closeMenu}
                                className="hover:text-gold transition-colors border-b border-white/5 pb-4 pl-4"
                            >
                                {u.label}
                            </Link>
                        ))}
                        <Link href="/cennik" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Cennik</Link>
                        <Link href="/realizacje" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Realizacje</Link>
                        <Link href="/blog" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">Blog</Link>
                        <Link href="/o-mnie" onClick={closeMenu} className="hover:text-gold transition-colors border-b border-white/5 pb-4">O mnie</Link>
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
                </div>
            )}
        </>
    );
}
