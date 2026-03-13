"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RefreshCcw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Loguj błąd (np. do Sentry)
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-screen bg-navy-dark flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-lg relative z-10"
            >
                <div className="relative mb-6">
                    <span className="text-[160px] md:text-[200px] font-black leading-none text-white/5 select-none">
                        500
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl md:text-7xl font-black text-rose-400">!</span>
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Coś poszło nie tak.
                </h1>
                <p className="text-white/50 mb-10 leading-relaxed">
                    Po naszej stronie wystąpił niespodziewany błąd. Spróbuj odświeżyć stronę lub wróć na stronę główną – zwykle wystarczy jedno kliknięcie.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="btn-gold px-8 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,235,82,0.25)]"
                    >
                        <RefreshCcw size={16} />
                        Spróbuj ponownie
                    </button>
                    <Link
                        href="/"
                        className="px-8 py-3.5 rounded-full font-bold text-sm border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={16} />
                        Strona główna
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
