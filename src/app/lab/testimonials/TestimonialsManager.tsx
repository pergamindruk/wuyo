"use client";

import { useState, useTransition } from "react";
import { Star, Trash2, Plus, StarOff } from "lucide-react";
import type { Testimonial } from "./page";
import { addTestimonial, deleteTestimonial, toggleFeatured } from "./actions";

const SERVICES = ["Strona WWW", "Logo & Identyfikacja", "Identyfikacja wizualna", "Druk", "Wizytówka", "Social media", "Inne"];

const EMPTY = { quote: "", name: "", role: "", company: "", service: "Strona WWW", featured: false };

export default function TestimonialsManager({ initialData }: { initialData: Testimonial[] }) {
    const [items, setItems] = useState<Testimonial[]>(initialData);
    const [form, setForm] = useState(EMPTY);
    const [adding, setAdding] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    }

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!form.quote.trim() || !form.name.trim()) return;
        setError(null);
        startTransition(async () => {
            try {
                await addTestimonial(form);
                setForm(EMPTY);
                setAdding(false);
                // refresh — server revalidates, optimistic local insert
                const fake: Testimonial = { ...form, id: crypto.randomUUID(), created_at: new Date().toISOString() };
                setItems(prev => [fake, ...prev]);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Błąd dodawania");
            }
        });
    }

    function handleDelete(id: string) {
        startTransition(async () => {
            try {
                await deleteTestimonial(id);
                setItems(prev => prev.filter(t => t.id !== id));
            } catch { /* ignore */ }
        });
    }

    function handleToggle(id: string, current: boolean) {
        startTransition(async () => {
            try {
                await toggleFeatured(id, !current);
                setItems(prev => prev.map(t => t.id === id ? { ...t, featured: !current } : t));
            } catch { /* ignore */ }
        });
    }

    return (
        <div className="p-6 md:p-10 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-xl font-bold text-white">Testimoniale</h1>
                <button
                    onClick={() => setAdding(v => !v)}
                    className="flex items-center gap-2 bg-yellow-400 text-zinc-950 font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
                >
                    <Plus size={15} /> Dodaj opinię
                </button>
            </div>

            {/* Formularz dodawania */}
            {adding && (
                <form onSubmit={handleAdd} className="mb-8 p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4">
                    <h2 className="font-semibold text-white text-sm mb-2">Nowa opinia</h2>
                    <textarea
                        name="quote"
                        value={form.quote}
                        onChange={handleChange}
                        placeholder="Treść opinii *"
                        rows={3}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:border-yellow-400/50"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Imię i nazwisko *" required className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50" />
                        <input name="role" value={form.role} onChange={handleChange} placeholder="Stanowisko" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50" />
                        <input name="company" value={form.company} onChange={handleChange} placeholder="Firma" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50" />
                        <select name="service" value={form.service} onChange={handleChange} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-400/50">
                            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                        <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="accent-yellow-400" />
                        Wyróżniona opinia (duży blok na stronie)
                    </label>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <div className="flex gap-3">
                        <button type="submit" disabled={isPending} className="bg-yellow-400 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50">
                            {isPending ? "Zapisuję..." : "Zapisz"}
                        </button>
                        <button type="button" onClick={() => setAdding(false)} className="text-white/40 hover:text-white text-sm px-5 py-2.5 rounded-lg transition-colors">Anuluj</button>
                    </div>
                </form>
            )}

            {/* Lista */}
            {items.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                    <Star size={32} className="mx-auto mb-3 opacity-30" />
                    <p>Brak opinii. Dodaj pierwszą!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map(t => (
                        <div key={t.id} className="flex gap-4 p-5 rounded-2xl border border-white/8 bg-white/[0.02] group">
                            <div className="flex-1 min-w-0">
                                <p className="text-white/75 text-sm leading-relaxed mb-3 line-clamp-3">&ldquo;{t.quote}&rdquo;</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                    <span className="font-bold text-white">{t.name}</span>
                                    {t.role && <span className="text-white/40">{t.role}</span>}
                                    {t.company && <span className="text-white/40">· {t.company}</span>}
                                    <span className="ml-auto text-yellow-400/60 border border-yellow-400/20 px-2 py-0.5 rounded-full font-semibold">{t.service}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <button
                                    onClick={() => handleToggle(t.id, t.featured)}
                                    title={t.featured ? "Usuń wyróżnienie" : "Wyróżnij"}
                                    className={`p-2 rounded-lg transition-colors ${t.featured ? "text-yellow-400 bg-yellow-400/10" : "text-white/20 hover:text-yellow-400/60"}`}
                                >
                                    {t.featured ? <Star size={14} /> : <StarOff size={14} />}
                                </button>
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
