import Image from "next/image";
import { Star, ExternalLink } from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import type { GoogleReviewsData } from "@/lib/google-reviews";
import { odmienOpinie } from "@/lib/polish-format";

/** Rządek gwiazdek. Puste gwiazdki zostają, żeby ocena była czytelna od razu. */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`Ocena ${rating} na 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    aria-hidden="true"
                    className={i <= Math.round(rating) ? "text-gold fill-gold" : "text-white/15"}
                />
            ))}
        </span>
    );
}

function Avatar({ src, name }: { src?: string; name: string }) {
    if (src) {
        return (
            <Image
                src={src}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
                unoptimized
            />
        );
    }
    return (
        <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-bold text-sm shrink-0">
            {name.charAt(0)}
        </div>
    );
}

/**
 * Opinie z profilu firmy w Google.
 * Google wymaga podania źródła i nazwiska autora — stąd oznaczenie i odnośniki.
 */
export function GoogleReviews({ data }: { data: GoogleReviewsData }) {
    const { rating, total, reviews, mapsUrl, writeReviewUrl } = data;
    // Przy nieparzystej liczbie opinii ostatnia karta zostaje sama w rzędzie.
    // Rozciągamy ją na obie kolumny i wyśrodkowujemy przy szerokości pozostałych,
    // żeby nie wisiała przyklejona do lewej krawędzi.
    const osieroconaOstatnia = reviews.length % 2 === 1;

    return (
        <section className="py-28 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10">
                <AnimatedSection className="mb-12">
                    <p className="eyebrow mb-3">Efekty mówią same za siebie</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Co mówią klienci</h2>

                    {/* Podsumowanie oceny */}
                    <div className="inline-flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-white/10 bg-navy-light/60 backdrop-blur-sm px-6 py-4">
                        <span className="text-4xl font-bold text-white leading-none">
                            {rating.toFixed(1).replace(".", ",")}
                        </span>
                        <span className="flex flex-col gap-1">
                            <Stars rating={rating} size={16} />
                            <span className="text-white/50 text-xs">
                                {total} {odmienOpinie(total)} w Google
                            </span>
                        </span>
                        {mapsUrl && (
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-gold text-sm font-bold hover:gap-2.5 transition-all sm:ml-2"
                            >
                                Zobacz w Google <ExternalLink size={13} aria-hidden="true" />
                            </a>
                        )}
                    </div>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((review, i) => (
                        <AnimatedSection
                            key={`${review.author}-${i}`}
                            delay={i * 0.08}
                            className={
                                osieroconaOstatnia && i === reviews.length - 1
                                    ? "md:col-span-2 md:w-[calc(50%-0.5rem)] md:mx-auto"
                                    : undefined
                            }
                        >
                            <figure className="glass-card p-6 h-full flex flex-col gap-4">
                                <Stars rating={review.rating} />

                                <blockquote className="text-white/75 leading-relaxed text-sm flex-1">
                                    &ldquo;{review.text}&rdquo;
                                </blockquote>

                                <figcaption className="flex items-center gap-3 pt-3 border-t border-white/10">
                                    <Avatar src={review.authorPhotoUrl} name={review.author} />
                                    <span className="min-w-0">
                                        <span className="block text-white font-bold text-sm truncate">
                                            {review.author}
                                        </span>
                                        <span className="block text-white/40 text-xs">Opinia w Google</span>
                                    </span>
                                </figcaption>
                            </figure>
                        </AnimatedSection>
                    ))}
                </div>

                <AnimatedSection className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-gold/25 bg-navy-light/40 backdrop-blur-sm px-8 py-8 shadow-[0_0_40px_rgba(255,235,82,0.06)]">
                    <p className="text-center md:text-left">
                        <span className="eyebrow block mb-2">Pracowaliśmy razem?</span>
                        <span className="gold-flow block font-heading text-xl md:text-3xl font-bold leading-snug">
                            Dwa zdania w Google znaczą dla małego studia więcej, niż myślisz.
                        </span>
                    </p>
                    {writeReviewUrl && (
                        <a
                            href={writeReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gold px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap shrink-0"
                        >
                            Wystaw opinię
                        </a>
                    )}
                </AnimatedSection>

                <p className="text-white/30 text-xs mt-6">
                    Opinie pobierane bezpośrednio z profilu firmy w Google i odświeżane codziennie.
                </p>
            </div>
        </section>
    );
}
