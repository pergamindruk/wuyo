"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const WELCOME_MESSAGE: Message = {
    role: "assistant",
    content:
        "Hej! 👋 Zamiast tracić czas na szukanie, napisz wprost czego potrzebujesz. Logo, nowa strona, a może szybka wycena? Jak mogę pomóc Twojej marce zarabiać więcej?",
};

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState<Message | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setHasNewMessage(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = async (overrideMessages?: Message[]) => {
        if ((!input.trim() && !overrideMessages) || isLoading) return;

        const userMessage: Message = overrideMessages
            ? overrideMessages[overrideMessages.length - 1]
            : { role: "user", content: input.trim() };
        const newMessages = overrideMessages ?? [...messages, userMessage];

        if (!overrideMessages) {
            setMessages(newMessages);
            setInput("");
        }
        setLastUserMessage(userMessage);
        setIsLoading(true);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
                signal: controller.signal,
            });

            const data = await response.json();

            if (data.message) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
                if (!isOpen) setHasNewMessage(true);
            } else if (data.error === "RATE_LIMIT") {
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: "Chwilowo dużo ruchu — za sekundkę odpiszę! ⏳ Napisz ponownie za chwilę.",
                }]);
            } else {
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: "Ups, coś się posypało. Spróbuj jeszcze raz! 😅",
                }]);
            }
        } catch (err: unknown) {
            const isAbort = err instanceof Error && err.name === "AbortError";
            setMessages((prev) => [...prev, {
                role: "assistant",
                content: isAbort
                    ? "Odpowiedź trwała za długo. Spróbuj ponownie. ⏳"
                    : "Problem z siecią. Spróbuj jeszcze raz! 😅",
            }]);
        } finally {
            clearTimeout(timeout);
            setIsLoading(false);
        }
    };

    const retryLastMessage = () => {
        if (!lastUserMessage || isLoading) return;
        setMessages((prev) => [...prev, lastUserMessage]);
        sendMessage([...messages, lastUserMessage]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed right-20 z-50 w-[calc(100vw-6rem)] sm:w-[380px] max-w-[420px]"
                        style={{ top: "clamp(0.5rem, calc(50dvh - 260px), calc(100dvh - 530px))" }}
                    >
                        <div
                            className="flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                            style={{
                                background: "rgba(10, 10, 10, 0.97)",
                                backdropFilter: "blur(20px)",
                                height: "min(520px, calc(100dvh - 1rem))",
                            }}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center justify-between px-4 py-3 border-b border-white/10"
                                style={{ background: "rgba(20,20,20,0.9)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-800">
                                            <img src="/Profilowe_wuyo.webp" alt="Wuyo" className="w-full h-full object-cover" />
                                        </div>
                                        <span
                                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black"
                                            style={{ background: "#22c55e" }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm leading-tight">
                                            Wuyo – dobra grafa ⚡
                                        </p>
                                        <p className="text-xs" style={{ color: "#22c55e" }}>
                                            <span className="sr-only">Status: </span>Online – odpowie w sekundy
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Zamknij okno czatu"
                                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                                >
                                    <X size={18} aria-hidden="true" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div
                                className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin"
                                aria-live="polite"
                                aria-label="Historia wiadomości"
                                role="log"
                            >
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        {/* Avatar */}
                                        <div
                                            className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${msg.role === "user"
                                                ? "bg-white/10"
                                                : ""
                                                }`}
                                            style={
                                                msg.role === "assistant"
                                                    ? { background: "transparent" }
                                                    : {}
                                            }
                                        >
                                            {msg.role === "assistant" ? (
                                                <img src="/Profilowe_wuyo.webp" alt="Wuyo" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <User size={14} color="#fff" />
                                            )}
                                        </div>

                                        {/* Bubble */}
                                        <div
                                            className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                                ? "rounded-tr-sm text-white"
                                                : "rounded-tl-sm text-gray-100"
                                                }`}
                                            style={
                                                msg.role === "user"
                                                    ? { background: "#FFD700", color: "#000" }
                                                    : { background: "rgba(255,255,255,0.07)" }
                                            }
                                        >
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Typing Indicator */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-2 items-center"
                                    >
                                        <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                                            <img src="/Profilowe_wuyo.webp" alt="Wuyo" className="w-full h-full object-cover" />
                                        </div>
                                        <div
                                            className="px-4 py-3 rounded-2xl rounded-tl-sm"
                                            style={{ background: "rgba(255,255,255,0.07)" }}
                                        >
                                            <div className="flex gap-1.5 items-center">
                                                {[0, 1, 2].map((i) => (
                                                    <span
                                                        key={i}
                                                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                        style={{ background: "#FFD700", animationDelay: `${i * 200}ms`, animationDuration: "1.2s" }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div
                                className="p-3 border-t border-white/10"
                                style={{ background: "rgba(15,15,15,0.95)" }}
                            >
                                <div
                                    className="flex gap-2 items-center px-3 py-2 rounded-xl border border-white/10"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Napisz wiadomość..."
                                        aria-label="Wpisz wiadomość do asystenta"
                                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={() => sendMessage()}
                                        disabled={!input.trim() || isLoading}
                                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ background: "#FFD700" }}
                                    >
                                        <Send size={14} color="#000" />
                                    </button>
                                </div>
                                <p className="text-center text-gray-600 text-xs mt-2">
                                    Wuyo – dobra grafa ⚡
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                onClick={() => setIsOpen((v) => !v)}
                className="fixed bottom-6 right-4 sm:bottom-10 sm:right-6 z-50 rounded-full flex items-center shadow-2xl overflow-hidden pr-4 pl-1.5 py-1.5 gap-3 group"
                style={{ background: "rgba(10, 10, 10, 0.95)", border: "1px solid rgba(255, 215, 0, 0.3)", backdropFilter: "blur(10px)" }}
                whileHover={{ scale: 1.05, border: "1px solid rgba(255, 215, 0, 0.8)" }}
                whileTap={{ scale: 0.95 }}
                animate={!isOpen ? {
                    boxShadow: [
                        "0 0 0 0 rgba(255,215,0,0.4)",
                        "0 0 0 15px rgba(255,215,0,0)",
                        "0 0 0 0 rgba(255,215,0,0)"
                    ]
                } : {}}
                transition={!isOpen ? {
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                } : {}}
                aria-label={isOpen ? "Zamknij chat" : "Otwórz chat"}
                aria-expanded={isOpen}
            >
                <div className="relative">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-800">
                        <img src="/Profilowe_wuyo.webp" alt="Chat" className="w-full h-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 border-2 border-[#1a1a1a] w-3.5 h-3.5 rounded-full bg-green-500"></span>
                </div>

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.span
                            key="close"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.15 }}
                            className="font-semibold text-white tracking-wide pr-2 flex items-center gap-2"
                        >
                            Zamknij <X size={18} color="#FFD700" />
                        </motion.span>
                    ) : (
                        <motion.span
                            key="open"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="font-semibold text-white tracking-wide flex flex-col items-start leading-tight"
                        >
                            <span className="text-sm">Porozmawiajmy</span>
                            <span className="text-[10px] text-green-400 font-normal">Jestem online</span>
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Notification dot */}
                {hasNewMessage && !isOpen && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black"
                    />
                )}
            </motion.button>
        </>
    );
}
