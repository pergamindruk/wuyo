"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const categories = ["Wszystkie", "Logotypy/Branding", "Do druku", "Strony Internetowe", "Social media", "Odzież/Gadżety"];

const projects = [
    { id: 1, title: "Naklejka Admar", category: "Do druku", image: "/realizacje/naklejka_Admar_Mockup.png" },
    { id: 2, title: "Wizytówka Czysta Gablota", category: "Do druku", image: "/realizacje/CzystaGablota-Wizytowka-mockup.png" },
    { id: 3, title: "Logo Arkom", category: "Logotypy/Branding", image: "/realizacje/logo_arkom.png" },
    { id: 4, title: "Prezentacja Marki Arkom", category: "Logotypy/Branding", image: "/realizacje/arkom-present.png" },
    { id: 5, title: "Wizytówka Czysta Gablota v2", category: "Do druku", image: "/realizacje/CzystaGablota-Wizytowka-mockup2.png" },
    { id: 6, title: "Hoodie Czysta Gablota", category: "Odzież/Gadżety", image: "/realizacje/bluza-czystagablota.png" },
    { id: 7, title: "Projekt Wizytówki", category: "Do druku", image: "/realizacje/Business_Card.png" },
    { id: 101, title: "Projektowanie Logo", category: "Logotypy/Branding", image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2670&auto=format&fit=crop" },
    { id: 103, title: "Design Stron WWW", category: "Strony Internetowe", image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2670&auto=format&fit=crop" },
    { id: 104, title: "Grafika Social Media", category: "Social media", image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=2670&auto=format&fit=crop" },
];

export function PortfolioGallery() {
    const [activeFilter, setActiveFilter] = useState("Wszystkie");
    const [visibleCount, setVisibleCount] = useState(9); // Limit 3x3
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const filteredProjects = projects.filter((project) =>
        activeFilter === "Wszystkie" ? true : project.category === activeFilter
    );

    const visibleProjects = filteredProjects.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProjects.length;

    const handleFilterChange = (category: string) => {
        setActiveFilter(category);
        setVisibleCount(9); // Reset count on filter change
    };

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 9);
    };

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
        document.body.style.overflow = "auto";
    };

    const showNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev! + 1) % visibleProjects.length);
        }
    };

    const showPrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectedImageIndex !== null) {
            setSelectedImageIndex((prev) => (prev! - 1 + visibleProjects.length) % visibleProjects.length);
        }
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") setSelectedImageIndex((prev) => (prev! + 1) % visibleProjects.length);
            if (e.key === "ArrowLeft") setSelectedImageIndex((prev) => (prev! - 1 + visibleProjects.length) % visibleProjects.length);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, visibleProjects.length]);

    return (
        <section id="portfolio" className="py-28 px-6 md:px-12 relative">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <p className="eyebrow mb-4">Dowody, nie obietnice</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">
                        Projekty, które już zarabiają
                    </h2>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleFilterChange(category)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeFilter === category
                                    ? "bg-gold text-navy-dark shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <motion.div
                    layout
                    className="columns-1 md:columns-2 lg:columns-3 gap-6"
                >
                    <AnimatePresence>
                        {visibleProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => openLightbox(index)}
                                className="group relative rounded-2xl overflow-hidden cursor-zoom-in bg-navy-light border border-white/5 break-inside-avoid mb-6 inline-block w-full"
                            >
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    width={800}
                                    height={1000}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                                />
                                {/* Center Zoom Icon */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                                    <div className="bg-navy-dark/80 p-3 rounded-full text-white backdrop-blur-sm border border-white/10">
                                        <ZoomIn size={24} />
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <div className="text-gold text-xs font-bold uppercase tracking-wider mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        {project.category}
                                    </div>
                                    <h3 className="text-white text-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                        {project.title}
                                    </h3>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleLoadMore}
                            className="btn-outline inline-flex items-center justify-center text-white hover:bg-white/5 transition-all text-sm font-semibold px-8 py-3 rounded-full"
                        >
                            Zobacz więcej
                        </button>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        className="fixed inset-0 z-50 bg-navy-dark/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all z-50"
                            onClick={closeLightbox}
                        >
                            <X size={24} />
                        </button>

                        {/* Prev button */}
                        <button
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all z-50"
                            onClick={showPrevImage}
                        >
                            <ChevronLeft size={32} />
                        </button>

                        {/* Next button */}
                        <button
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-3 rounded-full transition-all z-50"
                            onClick={showNextImage}
                        >
                            <ChevronRight size={32} />
                        </button>

                        {/* Image Container */}
                        <div
                            className="w-full max-w-5xl max-h-[85vh] relative flex flex-col items-center justify-center cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                key={selectedImageIndex}
                                src={visibleProjects[selectedImageIndex].image}
                                alt={visibleProjects[selectedImageIndex].title}
                                width={1920}
                                height={1080}
                                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10"
                            />

                            <div className="mt-6 text-center">
                                <h3 className="text-2xl font-bold text-white mb-2">{visibleProjects[selectedImageIndex].title}</h3>
                                <div className="text-gold text-sm font-bold uppercase tracking-wider">{visibleProjects[selectedImageIndex].category}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
