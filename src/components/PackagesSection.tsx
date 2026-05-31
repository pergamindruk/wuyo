"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Tag, ShoppingCart, X, Loader2, CheckCircle, AlertCircle, CreditCard, BookOpen, Gift, FileText, Frame, Magnet, Mail } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { motion, AnimatePresence } from "framer-motion";

// Pakiety biznesowe przeniesione do osobnej sekcji cennika (PricingSection / src/data/pricing.ts).

// Pakiety stron WWW — używane przez ContactBrief i strony /strony-www
export const packages = [
    {
        name: "Szybki start",
        persona: "Wejście na rynek — dla firm stawiających pierwsze kroki w sieci",
        price: "od 2 490 zł",
        desc: "Szybka, solidna strona, która działa od pierwszego dnia.",
        image: "/tworzenie-stron-www-start-v3.png",
        imageScale: "scale-100",
        features: [
            "Landing page (1 strona) — kompletna wizytówka Twojej firmy w sieci.",
            "Responsywny design — strona wygląda perfekcyjnie na telefonie, tablecie i komputerze.",
            "Formularz kontaktowy — klienci piszą bezpośrednio do Ciebie z poziomu strony.",
            "Integracja Google Maps — pokaż klientom, gdzie Cię znaleźć.",
            "Podstawowe SEO — zadbam, żeby Google w ogóle Cię widział.",
            "Czas realizacji: 5–7 dni roboczych.",
        ],
        featured: false,
        cta: "Zacznij od startu",
    },
    {
        name: "Najpopularniejszy",
        persona: "Strona która sprzedaje — dla firm gotowych na poważną obecność w sieci",
        price: "od 3 490 zł",
        desc: "Strona zaprojektowana pod konwersję — przyciąga klientów, generuje zapytania i sprzedaje nawet gdy śpisz.",
        image: "/tworzenie-stron-www-rozwoj-v3.png",
        imageScale: "scale-100",
        features: [
            "Do 5 podstron — miejsce na ofertę, blog, cennik i wszystko, czego potrzebujesz.",
            "Custom design od zera — żadnych szablonów, które wyglądają jak tysiąc innych stron.",
            "SEO on-page — optymalizacja treści, nagłówków i struktury pod Google.",
            "Google Analytics — wiesz dokładnie, kto przychodzi i co klika.",
            "Formularz kontaktowy z powiadomieniami na e-mail.",
            "Blog (opcjonalnie) — gotowy system do publikowania artykułów.",
            "Czas realizacji: 2–3 tygodnie.",
        ],
        featured: true,
        cta: "Wybierz pakiet Profesjonalny",
    },
    {
        name: "Zaawansowany",
        persona: "Sklep który zarabia — dla firm sprzedających online 24/7",
        price: "od 6 900 zł",
        desc: "Kompletny sklep internetowy lub system rezerwacji.",
        image: "/tworzenie-stron-www-kombajn-v3.png",
        imageScale: "scale-100",
        features: [
            "Sklep internetowy lub system rezerwacji — sprzedajesz 24/7, bez Twojego udziału.",
            "Panel zarządzania — dodajesz produkty i obsługujesz zamówienia bez programisty.",
            "Integracja płatności (Stripe / Przelewy24) — klienci płacą od razu.",
            "SEO techniczne i on-page — sklep widoczny w Google od pierwszego dnia.",
            "Szkolenie z obsługi panelu — wychodzisz i działasz samodzielnie.",
            "Czas realizacji: 30–45 dni roboczych.",
        ],
        featured: false,
        cta: "Otwórz sklep online",
    },
];

const printProducts = [
    {
        id: "wizytowki", name: "Wizytówki", note: "dwustronne, 300g błysk", designFee: 130, icon: <CreditCard size={44} />,
        variants: [
            { qty: "50 szt.", price: "99 zł", priceNum: 99 },
            { qty: "100 szt.", price: "159 zł", priceNum: 159 },
            { qty: "150 szt.", price: "199 zł", priceNum: 199 },
            { qty: "300 szt.", price: "299 zł", priceNum: 299 },
        ],
    },
    {
        id: "ulotki", name: "Ulotki A5", note: "dwustronne, pełny kolor", designFee: 130, icon: <BookOpen size={44} />,
        variants: [
            { qty: "50 szt.", price: "119 zł", priceNum: 119 },
            { qty: "100 szt.", price: "189 zł", priceNum: 189 },
            { qty: "150 szt.", price: "239 zł", priceNum: 239 },
            { qty: "300 szt.", price: "359 zł", priceNum: 359 },
        ],
    },
    {
        id: "vouchery", name: "Vouchery / bony", note: "", designFee: 170, icon: <Gift size={44} />,
        variants: [
            { qty: "50 szt.", price: "109 zł", priceNum: 109 },
            { qty: "100 szt.", price: "179 zł", priceNum: 179 },
        ],
    },
    {
        id: "naklejki", name: "Naklejki i etykiety", note: "", designFee: 110, icon: <Tag size={44} />,
        variants: [
            { qty: "50 szt.", price: "89 zł", priceNum: 89 },
            { qty: "100 szt.", price: "149 zł", priceNum: 149 },
            { qty: "200 szt.", price: "229 zł", priceNum: 229 },
        ],
    },
    {
        id: "plakaty", name: "Plakaty", note: "", designFee: 160, icon: <Frame size={44} />,
        variants: [
            { qty: "A4", price: "od 29 zł/szt.", priceNum: 29 },
            { qty: "A3", price: "od 39 zł/szt.", priceNum: 39 },
            { qty: "10+ szt.", price: "wycena indywidualna", priceNum: 0 },
        ],
    },
    {
        id: "magnesy", name: "Magnesy reklamowe", note: "z laminatem, format wizytówki", designFee: 130, icon: <Magnet size={44} />,
        variants: [
            { qty: "50 szt.", price: "229 zł", priceNum: 229 },
            { qty: "100 szt.", price: "379 zł", priceNum: 379 },
        ],
    },
    {
        id: "koperty", name: "Koperty z nadrukiem", note: "", designFee: 110, icon: <Mail size={44} />,
        variants: [
            { qty: "25 szt.", price: "69 zł", priceNum: 69 },
            { qty: "50 szt.", price: "119 zł", priceNum: 119 },
        ],
    },
];

type CartItem = {
    productId: string;
    productName: string;
    qty: string;
    price: string;
    priceNum: number;
    withDesign: boolean;
    designFee: number;
};

type Variant = { qty: string; price: string; priceNum: number };

// --- Product Card ---
interface ProductCardProps {
    product: (typeof printProducts)[number];
    onAddToCart: (item: CartItem) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [withDesign, setWithDesign] = useState<boolean | null>(null);
    const [justAdded, setJustAdded] = useState(false);

    const totalPrice = selectedVariant
        ? selectedVariant.priceNum === 0
            ? 0
            : selectedVariant.priceNum + (withDesign ? product.designFee : 0)
        : 0;

    const priceLabel = selectedVariant
        ? selectedVariant.priceNum === 0
            ? "wycena indywidualna"
            : `${totalPrice} zł`
        : "";

    const canAdd = selectedVariant !== null && withDesign !== null;

    function handleAdd() {
        if (!selectedVariant || withDesign === null) return;
        onAddToCart({
            productId: product.id,
            productName: product.name,
            qty: selectedVariant.qty,
            price: priceLabel,
            priceNum: totalPrice,
            withDesign,
            designFee: withDesign ? product.designFee : 0,
        });
        setJustAdded(true);
        setTimeout(() => {
            setJustAdded(false);
            setSelectedVariant(null);
            setWithDesign(null);
        }, 1500);
    }

    return (
        <div className="bg-navy/50 border border-white/10 rounded-2xl p-6 h-full flex flex-col gap-4 transition-colors hover:border-white/20">
            <div className="flex flex-col items-center text-center">
                <div className="text-gold/70 mb-3">{product.icon}</div>
                <h3 className="font-bold text-white text-lg mb-1">{product.name}</h3>
                {product.note && (
                    <p className="text-white/40 text-xs">{product.note}</p>
                )}
            </div>

            {/* Variant pills — ilość */}
            <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Ilość</p>
                <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                        const isSelected = selectedVariant?.qty === v.qty;
                        return (
                            <button
                                key={v.qty}
                                onClick={() => setSelectedVariant(isSelected ? null : v)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                                    isSelected
                                        ? "border-[#ffeb52] bg-[#ffeb52]/10 text-[#ffeb52]"
                                        : "border-white/20 text-white/60 hover:border-white/40 hover:text-white/80"
                                }`}
                            >
                                {v.qty}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Projekt toggle */}
            <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Projekt</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => setWithDesign(false)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                            withDesign === false
                                ? "border-white/60 bg-white/10 text-white"
                                : "border-white/20 text-white/50 hover:border-white/30 hover:text-white/70"
                        }`}
                    >
                        Mam swój projekt
                    </button>
                    <button
                        onClick={() => setWithDesign(true)}
                        className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                            withDesign === true
                                ? "border-[#ffeb52] bg-[#ffeb52]/10 text-[#ffeb52]"
                                : "border-white/20 text-white/50 hover:border-white/30 hover:text-white/70"
                        }`}
                    >
                        Zamawiam z projektem
                        {withDesign !== true && (
                            <span className="block text-[10px] text-white/30 font-normal">+{product.designFee} zł</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Price breakdown + Add to cart — animated reveal */}
            <AnimatePresence mode="wait">
                {canAdd && (
                    <motion.div
                        key={`${selectedVariant!.qty}-${String(withDesign)}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="mt-auto flex flex-col gap-3"
                    >
                        {/* Rozbicie ceny */}
                        {selectedVariant!.priceNum > 0 && (
                            <div className="bg-white/5 rounded-xl px-3 py-2.5 text-xs space-y-1">
                                <div className="flex justify-between text-white/50">
                                    <span>Druk ({selectedVariant!.qty})</span>
                                    <span>{selectedVariant!.price}</span>
                                </div>
                                {withDesign && (
                                    <div className="flex justify-between text-white/50">
                                        <span>Projekt graficzny</span>
                                        <span>+{product.designFee} zł</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-[#ffeb52] font-bold pt-1 border-t border-white/10">
                                    <span>Razem</span>
                                    <span>{priceLabel}</span>
                                </div>
                            </div>
                        )}
                        {selectedVariant!.priceNum === 0 && (
                            <p className="text-white/50 text-xs text-center">wycena indywidualna po kontakcie</p>
                        )}

                        <button
                            onClick={handleAdd}
                            disabled={justAdded}
                            className={`w-full py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
                                justAdded
                                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                                    : "bg-[#ffeb52] text-[#1c1b17] hover:bg-[#ffe000]"
                            }`}
                        >
                            {justAdded ? "Dodano ✓" : "Dodaj do koszyka"}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Cart Drawer ---
interface CartDrawerProps {
    items: CartItem[];
    onRemove: (index: number) => void;
    onClose: () => void;
}

function CartDrawer({ items, onRemove, onClose }: CartDrawerProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const closeRef = useRef<HTMLButtonElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const hasMultiple = items.length >= 2;
    const totalNum = items.reduce((sum, item) => sum + item.priceNum, 0);
    const hasCustom = items.some((item) => item.priceNum === 0);

    // Trap focus + ESC
    useEffect(() => {
        firstInputRef.current?.focus();
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || items.length === 0) return;
        setLoading(true);
        setStatus("idle");
        try {
            const res = await fetch("/api/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items, name: name.trim(), email: email.trim(), note: note.trim() }),
            });
            if (!res.ok) throw new Error("Błąd serwera");
            setStatus("success");
        } catch {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#111109] border-l border-white/10 z-50 flex flex-col overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Koszyk zamówienia"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
                    <h2 className="text-white font-bold text-lg">Twoje zamówienie</h2>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                        aria-label="Zamknij koszyk"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    {/* Items list */}
                    {items.length === 0 ? (
                        <p className="text-white/40 text-sm text-center mt-8">Koszyk jest pusty</p>
                    ) : (
                        <ul className="space-y-3">
                            {items.map((item, i) => (
                                <li key={i} className="flex items-start justify-between gap-3 bg-white/5 rounded-xl px-4 py-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">{item.productName}</p>
                                        <p className="text-white/50 text-xs mt-0.5">
                                            {item.qty} · {item.withDesign ? "z projektem" : "własny projekt"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`font-bold text-sm whitespace-nowrap ${item.priceNum === 0 ? "text-white/50 text-xs" : "text-[#ffeb52]"}`}>
                                            {item.priceNum === 0 ? "wycena ind." : item.price}
                                        </span>
                                        <button
                                            onClick={() => onRemove(i)}
                                            className="text-white/30 hover:text-white/70 transition-colors"
                                            aria-label={`Usuń ${item.productName}`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Discount banner */}
                    {hasMultiple && (
                        <div className="bg-[#ffeb52]/10 border border-[#ffeb52]/30 rounded-xl px-4 py-3 flex items-center gap-3">
                            <Tag size={16} className="text-[#ffeb52] shrink-0" />
                            <p className="text-[#ffeb52] text-xs font-semibold">
                                Rabat -15% na każdy kolejny produkt zostanie uwzględniony w wycenie
                            </p>
                        </div>
                    )}

                    {/* Total */}
                    {items.length > 0 && (
                        <div className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                            <span className="text-white/60 text-sm">Suma orientacyjna:</span>
                            <div className="text-right">
                                {totalNum > 0 && (
                                    <span className="text-[#ffeb52] font-bold">{totalNum} zł</span>
                                )}
                                {hasCustom && (
                                    <span className="text-white/40 text-xs block">+ wycena ind. po kontakcie</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Brief form */}
                    {status === "success" ? (
                        <div className="flex flex-col items-center gap-3 mt-4 text-center">
                            <CheckCircle size={40} className="text-green-400" />
                            <p className="text-white font-bold text-base">Zamówienie wysłane!</p>
                            <p className="text-white/60 text-sm">Odezwę się w ciągu 24h z potwierdzeniem i szczegółami realizacji.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">Dane kontaktowe</p>

                            <div>
                                <label className="text-white/60 text-xs mb-1.5 block" htmlFor="order-name">
                                    Imię i nazwisko <span className="text-[#ffeb52]">*</span>
                                </label>
                                <input
                                    ref={firstInputRef}
                                    id="order-name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Jan Kowalski"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#ffeb52]/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-white/60 text-xs mb-1.5 block" htmlFor="order-email">
                                    Email <span className="text-[#ffeb52]">*</span>
                                </label>
                                <input
                                    id="order-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jan@firma.pl"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#ffeb52]/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-white/60 text-xs mb-1.5 block" htmlFor="order-note">
                                    Dodatkowe informacje <span className="text-white/30">(opcjonalnie)</span>
                                </label>
                                <textarea
                                    id="order-note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Termin realizacji, specjalne wymagania, logo do przesłania..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#ffeb52]/50 transition-colors resize-none"
                                />
                            </div>

                            {status === "error" && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>Coś poszło nie tak. Spróbuj jeszcze raz lub napisz bezpośrednio.</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || items.length === 0}
                                className="w-full bg-[#ffeb52] text-[#1c1b17] font-bold py-4 rounded-full hover:bg-[#ffe000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Wysyłam...
                                    </>
                                ) : (
                                    "Wyślij zamówienie"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.aside>
        </>
    );
}

// --- Main Section ---
export function PackagesSection({ showButton = true, className = "py-28 px-6 md:px-12" }: { showButton?: boolean; className?: string }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    function handleAddToCart(item: CartItem) {
        setCart((prev) => [...prev, item]);
    }

    function handleRemove(index: number) {
        setCart((prev) => prev.filter((_, i) => i !== index));
    }

    // Close drawer when cart empties
    useEffect(() => {
        if (cart.length === 0 && drawerOpen) {
            // keep drawer open so user can still see the form/confirmation
        }
    }, [cart.length, drawerOpen]);

    return (
        <section id="pakiety" className={`relative ${className}`}>
            {/* Floating cart button */}
            <AnimatePresence>
                {cart.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        onClick={() => setDrawerOpen(true)}
                        className="fixed top-1/2 -translate-y-1/2 right-0 z-30 bg-[#ffeb52] text-[#1c1b17] rounded-l-xl px-3 py-4 font-bold text-xs flex flex-col items-center gap-1.5 shadow-2xl hover:bg-[#ffe000] transition-colors"
                        aria-label={`Otwórz koszyk (${cart.length} ${cart.length === 1 ? "pozycja" : "pozycje"})`}
                    >
                        <ShoppingCart size={18} />
                        <span>{cart.length}</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Cart drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <CartDrawer
                        items={cart}
                        onRemove={handleRemove}
                        onClose={() => setDrawerOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Nagłówek */}
            <AnimatedSection className="text-center mb-10 relative z-10">
                <p className="eyebrow mb-4">Druk &amp; Papeteria</p>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    Projekt + druk. Wszystko w jednym miejscu.
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                    Nie musisz szukać drukarni, tłumaczyć wizji i modlić się żeby wyszło.
                    Projektuję, drukuję, dostarczam — Ty dostajesz gotowy produkt.
                </p>
            </AnimatedSection>

            {/* Baner rabatowy */}
            <AnimatedSection delay={0.1} className="max-w-4xl mx-auto mb-10 relative z-10">
                <div className="bg-[#ffeb52] text-[#1c1b17] rounded-2xl p-5 flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                        <Tag size={22} />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-snug">
                            Zamów 2 lub więcej produktów — każdy kolejny -15%.
                        </p>
                        <p className="font-medium text-sm mt-1 opacity-80">
                            Projekty spójne wizualnie, druk w jednej partii, jeden kontakt.
                        </p>
                    </div>
                </div>
            </AnimatedSection>

            {/* Siatka produktów */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 max-w-7xl mx-auto relative z-10">
                {printProducts.map((product, i) => (
                    <AnimatedSection key={product.id} delay={0.05 * i}>
                        <ProductCard product={product} onAddToCart={handleAddToCart} />
                    </AnimatedSection>
                ))}
            </div>

            {/* CTA */}
            {showButton && (
                <AnimatedSection delay={0.3} className="mt-12 text-center relative z-10">
                    <p className="text-white/60 max-w-2xl mx-auto mb-6 text-sm md:text-base">
                        Nie wiesz co wybrać? Napisz — w 24h dostajesz konkretny zestaw dopasowany do Twojej firmy i budżetu.
                    </p>
                    <Link href="/#kontakt" className="btn-gold px-10 py-4 inline-flex items-center gap-2 font-bold rounded-full">
                        Napisz do mnie
                    </Link>
                </AnimatedSection>
            )}
        </section>
    );
}
