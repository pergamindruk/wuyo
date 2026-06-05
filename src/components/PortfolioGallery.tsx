"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Maximize2 } from "lucide-react";
import { TABS, projects, type Project } from "@/lib/projects";

export function PortfolioGallery({ initialVisible = 9 }: { initialVisible?: number }) {
    const [activeTab, setActiveTab] = useState("Wszystkie");
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [visibleCount, setVisibleCount] = useState(initialVisible);
    const [fullscreenSrc, setFullscreenSrc] = useState<string | null>(null);
    const [drawerActiveImg, setDrawerActiveImg] = useState<string | null>(null);
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicator, setIndicator] = useState({ left: 0, width: 0 });

    const filteredProjects = projects.filter(p =>
        activeTab === "Wszystkie" ? true : p.category === activeTab
    );
    const visibleProjects = filteredProjects.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProjects.length;

    // Update sliding tab indicator
    useEffect(() => {
        const update = () => {
            const tab = tabRefs.current[activeTabIndex];
            if (tab) {
                setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
            }
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [activeTabIndex]);

    const handleTabChange = (id: string, idx: number) => {
        setActiveTab(id);
        setActiveTabIndex(idx);
        setVisibleCount(initialVisible);
    };

    const openPanel = (project: Project) => {
        setSelectedProject(project);
        setDrawerActiveImg(project.image);
        document.body.style.overflow = "hidden";
    };

    const closePanel = () => {
        setSelectedProject(null);
        document.body.style.overflow = "auto";
    };

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (fullscreenSrc) {
                    setFullscreenSrc(null);
                } else {
                    closePanel();
                }
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [fullscreenSrc]);

    return (
        <section id="portfolio" className="py-28 px-6 md:px-12 relative overflow-hidden">

            {/* Decorative large background word */}
            <div
                className="absolute right-0 top-10 leading-none select-none pointer-events-none pr-4 hidden lg:block font-black tracking-tighter text-white/[0.025]"
                style={{ fontSize: "clamp(6rem,16vw,14rem)", fontFamily: "var(--font-ava-meridian)" }}
                aria-hidden
            >
                PRACE
            </div>

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Section header – editorial, left-aligned */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-6">
                    <div>
                        <p className="eyebrow mb-3">Dowody, nie obietnice</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Projekty, które<br className="hidden md:block" /> już zarabiają
                        </h2>
                    </div>

                    {/* Animated project count */}
                    <div className="flex flex-col items-start md:items-end gap-0.5 shrink-0">
                        <motion.span
                            key={filteredProjects.length}
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-5xl font-black leading-none"
                            style={{ color: "rgba(255,235,82,0.2)", fontFamily: "var(--font-ava-meridian)" }}
                            aria-hidden
                        >
                            {String(filteredProjects.length).padStart(2, "0")}
                        </motion.span>
                        <span className="text-white/30 text-xs uppercase tracking-widest">projektów</span>
                    </div>
                </div>

                {/* Category tabs with sliding gold underline */}
                <div className="mb-8" ref={tabsContainerRef}>
                    <div className="relative flex overflow-x-auto hide-scrollbar border-b border-white/10">
                        {TABS.map((tab, idx) => (
                            <button
                                key={tab.id}
                                ref={el => { tabRefs.current[idx] = el; }}
                                onClick={() => handleTabChange(tab.id, idx)}
                                className={`relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? "text-white"
                                        : "text-white/40 hover:text-white/70"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                        {/* Sliding gold indicator */}
                        <motion.div
                            className="absolute bottom-0 h-[2px] bg-gold pointer-events-none"
                            animate={indicator}
                            transition={{ type: "spring", stiffness: 400, damping: 36 }}
                        />
                    </div>
                </div>

                {/* Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                    <AnimatePresence mode="popLayout">
                        {visibleProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                                whileHover="hover"
                                onClick={() => openPanel(project)}
                                className="relative overflow-hidden rounded-2xl cursor-pointer bg-white/[0.03]"
                                style={{ height: "280px" }}
                            >
                                {/* Image with motion scale */}
                                <motion.div
                                    className="absolute inset-0"
                                    variants={{ hover: { scale: 1.06 } }}
                                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        priority={index < 3}
                                        className="object-cover"
                                        style={project.cardObjectPosition ? { objectPosition: project.cardObjectPosition } : undefined}
                                    />
                                </motion.div>

                                {/* Base gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />

                                {/* Hover overlay */}
                                <motion.div
                                    className="absolute inset-0 bg-black/30 z-10"
                                    variants={{ hover: { opacity: 1 } }}
                                    initial={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                />

                                {/* Category chip top-right */}
                                <motion.div
                                    className="absolute top-4 right-4 z-20"
                                    variants={{ hover: { opacity: 1, y: 0 } }}
                                    initial={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                                        {project.category}
                                    </span>
                                </motion.div>

                                {/* Bottom info */}
                                <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                                    <motion.div
                                        variants={{ hover: { y: 0, opacity: 1 } }}
                                        initial={{ y: 6, opacity: 0.85 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h3 className="text-white font-bold text-base leading-tight">
                                            {project.title}
                                        </h3>
                                        {project.desc && (
                                            <motion.p
                                                className="text-white/50 text-xs mt-1.5 line-clamp-1"
                                                variants={{ hover: { opacity: 1, y: 0 } }}
                                                initial={{ opacity: 0, y: 4 }}
                                                transition={{ duration: 0.25, delay: 0.05 }}
                                            >
                                                {project.desc}
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Gold line */}
                                    <motion.div
                                        className="h-[2px] bg-gold mt-3 origin-left"
                                        variants={{ hover: { scaleX: 1 } }}
                                        initial={{ scaleX: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Load more */}
                {hasMore && (
                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setVisibleCount(v => v + 6)}
                            className="btn-outline text-sm px-8 py-3"
                        >
                            Pokaż więcej projektów
                        </button>
                    </div>
                )}
            </div>

            {/* ── Side drawer panel ────────────────────────────────── */}
            <AnimatePresence>
                {selectedProject && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closePanel}
                            className="fixed inset-0 bg-navy-dark/80 backdrop-blur-md z-40"
                        />

                        {/* Panel */}
                        <motion.aside
                            key="drawer"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 280, damping: 32 }}
                            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-[#1e1d19] z-50 flex flex-col shadow-2xl border-l border-white/5 overflow-hidden"
                        >
                            {/* Close */}
                            <button
                                onClick={closePanel}
                                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                                aria-label="Zamknij"
                            >
                                <X size={16} />
                            </button>

                            {/* Project image */}
                            <div className="relative w-full shrink-0 bg-navy group/img" style={{ aspectRatio: "16/10" }}>
                                <Image
                                    src={drawerActiveImg || selectedProject.image}
                                    alt={selectedProject.title}
                                    fill
                                    className="object-contain p-6"
                                    sizes="460px"
                                />
                                {/* Fullscreen button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFullscreenSrc(drawerActiveImg || selectedProject.image); }}
                                    className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-lg bg-navy-dark/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-navy-dark/90 transition-all opacity-0 group-hover/img:opacity-100"
                                    title="Pełna rozdzielczość"
                                >
                                    <Maximize2 size={13} />
                                </button>
                                {/* Fade into panel bg */}
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1e1d19] to-transparent pointer-events-none" />
                            </div>

                            {/* Thumbnail gallery */}
                            {selectedProject.images && selectedProject.images.length > 0 && (
                                <div className="flex gap-2 px-4 py-3 bg-[#1a1916] shrink-0 overflow-x-auto hide-scrollbar">
                                    {[selectedProject.image, ...selectedProject.images].map((src, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setDrawerActiveImg(src)}
                                            className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                                                (drawerActiveImg || selectedProject.image) === src
                                                    ? "border-gold"
                                                    : "border-white/10 hover:border-white/30"
                                            }`}
                                        >
                                            <Image src={src} alt={`${selectedProject.title} ${i + 1}`} fill className="object-cover" sizes="80px" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8">

                                {/* Number + category + year */}
                                <div className="flex items-start gap-4 mb-6">
                                    <span
                                        className="text-5xl font-black leading-none shrink-0"
                                        style={{ color: "rgba(255,235,82,0.22)", fontFamily: "var(--font-ava-meridian)" }}
                                        aria-hidden
                                    >
                                        {String(projects.findIndex(p => p.id === selectedProject.id) + 1).padStart(2, "0")}
                                    </span>
                                    <div className="pt-1.5">
                                        <p className="text-gold text-xs uppercase tracking-[0.18em] font-bold mb-0.5">
                                            {selectedProject.category}
                                        </p>
                                        {selectedProject.year && (
                                            <p className="text-white/25 text-xs tracking-wide">{selectedProject.year}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
                                    {selectedProject.title}
                                </h3>

                                {/* Gold divider */}
                                <div className="w-10 h-[2px] bg-gold/40 mb-5" />

                                {/* Description */}
                                {selectedProject.desc && (
                                    <p className="text-white/55 text-sm leading-relaxed mb-8">
                                        {selectedProject.desc}
                                    </p>
                                )}

                                {/* Demo link */}
                                {selectedProject.demoUrl && (
                                    <a
                                        href={selectedProject.demoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2.5 bg-gold text-navy-dark font-bold px-6 py-3 rounded-full text-sm hover:bg-gold/90 transition-all group hover:shadow-[0_0_20px_rgba(255,235,82,0.35)]"
                                    >
                                        Zobacz stronę online
                                        <ExternalLink
                                            size={14}
                                            className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                                        />
                                    </a>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── Fullscreen image overlay ─────────────────────── */}
            <AnimatePresence>
                {fullscreenSrc && (
                    <motion.div
                        key="fullscreen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setFullscreenSrc(null)}
                        className="fixed inset-0 z-[70] bg-black/97 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setFullscreenSrc(null); }}
                            className="fixed top-5 right-5 z-[75] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all"
                            aria-label="Zamknij podgląd"
                        >
                            <X size={16} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.93 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.93 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                            className="cursor-default"
                        >
                            <Image
                                src={fullscreenSrc}
                                alt="Pełna rozdzielczość"
                                width={1920}
                                height={1440}
                                className="max-w-[92vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            />
                        </motion.div>

                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/20 text-xs tracking-[0.2em] uppercase select-none">
                            ESC lub klik aby zamknąć
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
