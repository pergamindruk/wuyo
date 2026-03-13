"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-28 right-4 sm:bottom-32 sm:right-6 lg:bottom-[120px] lg:right-8 z-50 p-3 bg-gold text-navy rounded-full shadow-[0_0_20px_rgba(255,235,82,0.4)] hover:shadow-[0_0_30px_rgba(255,235,82,0.6)] transition-shadow hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border border-white/20"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={24} className="stroke-[3px]" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
