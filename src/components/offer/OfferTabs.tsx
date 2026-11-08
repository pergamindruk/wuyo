"use client";

// Sekcja „Oferta” na stronie głównej (PL i EN): lista usług po lewej, jeden duży
// panel z wybraną usługą po prawej. Na telefonie lista rozwijana.
// "use client", bo trzyma wybraną usługę w stanie.
// Wszystkie panele są w HTML (ukryte atrybutem hidden), żeby treść i linki
// widziały roboty wyszukiwarek.

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { ServiceIcon, type ServiceIconName } from "@/components/offer/ServiceIcon";

export type OfferService = {
    icon: ServiceIconName;
    /** Krótka nazwa na liście, np. „Logo”. */
    name: string;
    title: string;
    /** Jedno zdanie opisu. */
    short: string;
    tags: string[];
    href: string;
    cta: string;
};

export function OfferTabs({ services }: { services: OfferService[] }) {
    const [active, setActive] = useState(0);
    // Telefon: wybraną kartę można zwinąć ponownym kliknięciem (komputer zawsze pokazuje panel).
    const [rozwinieta, setRozwinieta] = useState(true);
    // Stałe id (sekcja jest raz na stronie) — useId dawał różne wartości na serwerze i w przeglądarce.
    const baseId = "oferta";
    const panelsRef = useRef<HTMLDivElement>(null);
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

    // Ikona w panelu rysuje się od nowa przy każdej zmianie usługi.
    useEffect(() => {
        const box = panelsRef.current;
        if (!box) return;
        box.classList.add("beam-ready");
        box.querySelectorAll(".offer-node").forEach((n) => n.classList.remove("is-lit"));
        const frame = requestAnimationFrame(() => {
            box.querySelector(`[data-panel="${active}"] .offer-node`)?.classList.add("is-lit");
        });
        return () => cancelAnimationFrame(frame);
    }, [active]);

    // Wejście z menu: /#oferta-<ikona> albo zdarzenie „oferta:wybierz” (bez przeładowania).
    useEffect(() => {
        const wybierz = (ikona: string) => {
            const i = services.findIndex((s) => s.icon === ikona);
            if (i < 0) return;
            setActive(i);
            setRozwinieta(true);
            // Celujemy w listę usług pod stałym paskiem menu. Druga korekta po chwili,
            // bo doładowujące się elementy wyżej potrafią przesunąć stronę.
            const przewin = (zachowanie: ScrollBehavior) => {
                const el = document.querySelector(".offer-tabs");
                if (!el) return;
                const y = el.getBoundingClientRect().top + window.scrollY - 130;
                if (Math.abs(window.scrollY - y) > 30) window.scrollTo({ top: y, behavior: zachowanie });
            };
            window.setTimeout(() => przewin("smooth"), 80);
            window.setTimeout(() => przewin("auto"), 1200);
        };
        const zAdresu = () => {
            const m = window.location.hash.match(/^#oferta-([a-z]+)$/);
            if (m) wybierz(m[1]);
        };
        const zMenu = (e: Event) => wybierz((e as CustomEvent<string>).detail);
        zAdresu();
        window.addEventListener("hashchange", zAdresu);
        window.addEventListener("oferta:wybierz", zMenu);
        return () => {
            window.removeEventListener("hashchange", zAdresu);
            window.removeEventListener("oferta:wybierz", zMenu);
        };
    }, [services]);

    const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
        const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = (active + step + services.length) % services.length;
        setActive(next);
        tabsRef.current[next]?.focus();
    };

    return (
        <div className="offer-tabs max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[minmax(0,370px)_1fr] gap-6 lg:gap-8">
            {/* Lista usług */}
            <div
                role="tablist"
                aria-orientation="vertical"
                className="offer-list relative flex flex-col gap-2 lg:self-start"
                style={{ ["--active" as string]: active, ["--count" as string]: services.length }}
            >
                <span className="offer-rail hidden lg:block" aria-hidden />
                {services.map((s, i) => {
                    const selected = i === active;
                    return (
                        <div key={s.name}>
                            <button
                                ref={(el) => {
                                    tabsRef.current[i] = el;
                                }}
                                type="button"
                                role="tab"
                                id={`${baseId}-tab-${i}`}
                                aria-selected={selected}
                                aria-expanded={selected && rozwinieta}
                                aria-controls={`${baseId}-panel-${i}`}
                                tabIndex={selected ? 0 : -1}
                                onClick={() => {
                                    if (i === active) {
                                        setRozwinieta((r) => !r);
                                    } else {
                                        setActive(i);
                                        setRozwinieta(true);
                                    }
                                }}
                                onKeyDown={onKey}
                                className={`offer-tab ${selected ? "is-active" : ""} ${selected && rozwinieta ? "is-open" : ""}`}
                            >
                                <span className="offer-node offer-node-sm is-lit">
                                    <ServiceIcon name={s.icon} />
                                </span>
                                <span className="flex-1 text-left font-bold text-base md:text-lg">{s.name}</span>
                                <ChevronDown size={18} className="offer-chevron lg:hidden" aria-hidden />
                                <ArrowRight size={16} className="offer-arrow hidden lg:block" aria-hidden />
                            </button>

                            {/* Telefon: treść pod wybraną pozycją */}
                            {selected && rozwinieta && (
                                <div className="offer-panel-in lg:hidden px-2 pt-4 pb-6">
                                    <PanelBody service={s} compact />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Komputer: jeden duży panel */}
            <div ref={panelsRef} className="hidden lg:block relative">
                {services.map((s, i) => (
                    <div
                        key={s.name}
                        data-panel={i}
                        role="tabpanel"
                        id={`${baseId}-panel-${i}`}
                        aria-labelledby={`${baseId}-tab-${i}`}
                        hidden={i !== active}
                        className="offer-panel glass-card offer-panel-in h-full"
                    >
                        <PanelBody service={s} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function PanelBody({ service, compact = false }: { service: OfferService; compact?: boolean }) {
    return (
        <div className={compact ? "" : "relative flex flex-col h-full p-10 xl:p-12"}>
            {!compact && (
                <span className="offer-node offer-node-lg mb-8">
                    <ServiceIcon name={service.icon} />
                </span>
            )}
            <h3 className={`font-bold text-white mb-4 ${compact ? "text-xl" : "text-3xl xl:text-4xl leading-tight"}`}>{service.title}</h3>
            <p className={`text-white/70 leading-relaxed mb-6 ${compact ? "text-base" : "text-lg max-w-xl"}`}>{service.short}</p>
            <ul className="flex flex-wrap gap-2 mb-8">
                {service.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-gold/20 bg-gold/5 px-3.5 py-1.5 text-sm text-white/80">
                        {tag}
                    </li>
                ))}
            </ul>
            <div className={compact ? "" : "mt-auto"}>
                <Link
                    href={service.href}
                    className="btn-gold inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,235,82,0.25)]"
                >
                    {service.cta} <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}
