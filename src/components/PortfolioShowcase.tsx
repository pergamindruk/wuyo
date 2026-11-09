"use client";

// Realizacje na stronie głównej jako „wystawa”: jedna praca na raz, duże zdjęcie,
// obok krótki opis, pod spodem taśma miniatur. Sama przechodzi dalej co kilka sekund.
// "use client", bo trzyma wybraną realizację i odlicza czas.
// Pełna siatka wszystkich prac zostaje na /realizacje (PortfolioGallery).

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ExternalLink, Images, Maximize2 } from "lucide-react";
import { projects as projectsPl, categoryLabel, localizeProject } from "@/lib/projects";
import { route, type Locale } from "@/lib/i18n";
import { ShowcaseLightbox } from "@/components/ShowcaseLightbox";

/** Ile sekund jedna realizacja stoi na ekranie. */
const CZAS = 5;

/** Te realizacje idą na początek, w tej kolejności (Kribus, billboard Dobrze Rozegrane). Reszta losowo. */
const NA_POCZATEK = [16, 17];

const T = {
    pl: {
        eyebrow: "Realizacje dla firm", h2a: "Robota, którą", h2b: "widać na mieście",
        wszystkie: "Wszystkie realizacje", online: "Zobacz stronę online", kolejne: "Kolejne zdjęcie",
        poprz: "Poprzednia realizacja", nast: "Następna realizacja", lista: "Wybierz realizację", powieksz: "Powiększ",
    },
    en: {
        eyebrow: "Work for businesses", h2a: "Work you can", h2b: "spot around town",
        wszystkie: "All projects", online: "View the live site", kolejne: "Next image",
        poprz: "Previous project", nast: "Next project", lista: "Choose a project", powieksz: "Zoom in",
    },
} as const;

export function PortfolioShowcase({ locale = "pl" }: { locale?: Locale }) {
    const t = T[locale];
    // Stała kolejność na serwerze (bez różnic przy hydracji), losowanie reszty dopiero w przeglądarce.
    const [kolejnosc, setKolejnosc] = useState<number[]>(() => [
        ...NA_POCZATEK,
        ...projectsPl.map((p) => p.id).filter((id) => !NA_POCZATEK.includes(id)),
    ]);
    const projects = kolejnosc
        .map((id) => projectsPl.find((p) => p.id === id))
        .filter((p): p is (typeof projectsPl)[number] => Boolean(p))
        .map((p) => localizeProject(p, locale));
    const [index, setIndex] = useState(0);
    const [podglad, setPodglad] = useState(false);
    const [zdjecie, setZdjecie] = useState(0);
    const [stoi, setStoi] = useState(false);
    const [widoczna, setWidoczna] = useState(false);
    const [ruch, setRuch] = useState(true);
    const sekcja = useRef<HTMLElement>(null);
    const dotyk = useRef<number | null>(null);

    const project = projects[index];
    const zdjecia = [project.image, ...(project.images ?? [])];
    const [branza, zakres] = (project.desc ?? "").split(" · ");

    const idzDo = (i: number) => {
        setIndex((i + projects.length) % projects.length);
        setZdjecie(0);
    };

    useEffect(() => {
        setKolejnosc((k) => {
            const reszta = k.slice(NA_POCZATEK.length);
            for (let i = reszta.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [reszta[i], reszta[j]] = [reszta[j], reszta[i]];
            }
            return [...k.slice(0, NA_POCZATEK.length), ...reszta];
        });
    }, []);

    // Odtwarzanie tylko, gdy sekcja jest na ekranie i system nie prosi o mniej ruchu.
    useEffect(() => {
        const el = sekcja.current;
        if (!el) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const ustawRuch = () => setRuch(!mq.matches);
        ustawRuch();
        mq.addEventListener("change", ustawRuch);
        const obserwator = new IntersectionObserver(([w]) => setWidoczna(w.isIntersecting), { threshold: 0.25 });
        obserwator.observe(el);
        return () => {
            obserwator.disconnect();
            mq.removeEventListener("change", ustawRuch);
        };
    }, []);

    const gra = ruch && widoczna && !stoi && !podglad;

    return (
        <section
            id="portfolio"
            ref={sekcja}
            className="py-28 px-6 md:px-12 relative"
            onPointerEnter={() => setStoi(true)}
            onPointerLeave={() => setStoi(false)}
            onFocus={() => setStoi(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setStoi(false);
            }}
        >
            {/* Wielki, ledwo widoczny napis w tle — robi klimat, nie jest treścią */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
                <div
                    className="absolute right-0 top-10 leading-none select-none pr-4 hidden lg:block font-black tracking-tighter text-white/[0.025]"
                    style={{ fontSize: "clamp(6rem,16vw,14rem)", fontFamily: "var(--font-ava-meridian)" }}
                >
                    {locale === "en" ? "WORK" : "PRACE"}
                </div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <p className="eyebrow mb-3">{t.eyebrow}</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            {t.h2a}<br className="hidden md:block" /> {t.h2b}
                        </h2>
                    </div>
                    <Link
                        href={route("portfolio", locale)}
                        className="inline-flex items-center gap-2 text-gold font-bold text-sm hover:gap-3 transition-all shrink-0"
                    >
                        {t.wszystkie} ({projects.length}) <ArrowRight size={16} aria-hidden />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-stretch">
                    {/* Duże zdjęcie */}
                    <div
                        className="wystawa-kadr relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-navy-light"
                        // Telefon: przesunięcie palcem w bok zmienia realizację.
                        onTouchStart={(e) => { dotyk.current = e.touches[0].clientX; }}
                        onTouchEnd={(e) => {
                            if (dotyk.current === null) return;
                            const dx = e.changedTouches[0].clientX - dotyk.current;
                            dotyk.current = null;
                            if (Math.abs(dx) > 50) idzDo(index + (dx < 0 ? 1 : -1));
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setPodglad(true)}
                            className="absolute inset-0 z-[1] cursor-zoom-in"
                            aria-label={`${t.powieksz}: ${project.title}`}
                        />
                        <span className="pointer-events-none absolute top-4 right-4 z-[2] grid place-items-center w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-white" aria-hidden>
                            <Maximize2 size={17} />
                        </span>
                        <Image
                            key={zdjecia[zdjecie]}
                            src={zdjecia[zdjecie]}
                            alt={project.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 760px"
                            quality={90}
                            className="wystawa-zdjecie object-cover"
                            style={{ objectPosition: project.cardObjectPosition ?? "center" }}
                        />
                        {zdjecia.length > 1 && (
                            <button
                                type="button"
                                onClick={() => setZdjecie((zdjecie + 1) % zdjecia.length)}
                                className="absolute bottom-4 right-4 z-[2] inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2 text-sm font-bold text-white hover:border-gold/60 hover:text-gold transition-colors"
                            >
                                <Images size={16} aria-hidden /> {t.kolejne} · {zdjecie + 1}/{zdjecia.length}
                            </button>
                        )}
                    </div>

                    {/* Opis */}
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="numer-ozdobny text-4xl font-black leading-none tabular-nums" aria-hidden>
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="text-white/50 text-sm tabular-nums">/ {String(projects.length).padStart(2, "0")}</span>
                            <span className="wystawa-pasek flex-1" aria-hidden>
                                <span
                                    key={index}
                                    className="wystawa-pasek-wypelnienie"
                                    style={{ animationDuration: `${CZAS}s`, animationPlayState: gra ? "running" : "paused" }}
                                    onAnimationEnd={() => idzDo(index + 1)}
                                />
                            </span>
                        </div>

                        <div key={index} className="wystawa-opis" aria-live="polite">
                            <p className="eyebrow mb-3">{categoryLabel(project.category, locale)}{project.year ? ` · ${project.year}` : ""}</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">{project.title}</h3>
                            {branza && <p className="text-white/80 text-lg mb-2">{branza}</p>}
                            {zakres && <p className="text-white/60 leading-relaxed">{zakres.charAt(0).toUpperCase() + zakres.slice(1)}</p>}
                            {project.demoUrl && (
                                <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 inline-flex items-center gap-2 text-gold font-bold text-sm hover:gap-3 transition-all"
                                >
                                    {t.online} <ExternalLink size={14} aria-hidden />
                                </a>
                            )}
                        </div>

                        <div className="mt-auto pt-8 flex gap-2">
                            <button type="button" onClick={() => idzDo(index - 1)} aria-label={t.poprz} className="wystawa-strzalka">
                                <ChevronLeft size={20} aria-hidden />
                            </button>
                            <button type="button" onClick={() => idzDo(index + 1)} aria-label={t.nast} className="wystawa-strzalka">
                                <ChevronRight size={20} aria-hidden />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Taśma miniatur: płynie w kółko (lista zdublowana, przesuw o połowę),
                    staje po najechaniu. Przy „mniej ruchu” zwykła przewijana taśma. */}
                <div
                    role="group"
                    aria-label={t.lista}
                    className={`wystawa-tasma mt-8 ${ruch ? "plynie" : "overflow-x-auto hide-scrollbar"}`}
                >
                    <div className="wystawa-tasma-tor" style={{ animationPlayState: widoczna ? undefined : "paused" }}>
                        {(ruch ? [...projects, ...projects] : projects).map((p, n) => {
                            const i = n % projects.length;
                            const kopia = n >= projects.length;
                            return (
                                <button
                                    key={`${p.id}-${n}`}
                                    type="button"
                                    onClick={() => idzDo(i)}
                                    aria-pressed={kopia ? undefined : i === index}
                                    aria-label={p.title}
                                    aria-hidden={kopia || undefined}
                                    tabIndex={kopia ? -1 : undefined}
                                    className={`wystawa-miniatura ${i === index ? "is-active" : ""}`}
                                    style={{ animationDelay: `${-(n % 7) * 0.9}s` }}
                                >
                                    <Image src={p.image} alt="" fill sizes="160px" quality={90} className="object-cover" style={{ objectPosition: p.cardObjectPosition ?? "center" }} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {podglad && (
                <ShowcaseLightbox
                    title={project.title}
                    images={zdjecia}
                    start={zdjecie}
                    locale={locale}
                    onClose={() => setPodglad(false)}
                />
            )}
        </section>
    );
}
