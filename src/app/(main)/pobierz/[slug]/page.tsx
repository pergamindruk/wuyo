import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { DownloadForm } from "@/components/DownloadForm";
import { DOWNLOADS, findDownload, MARKETING_CONSENT_TEXT } from "@/data/downloads";

export function generateStaticParams() {
    return DOWNLOADS.map((d) => ({ slug: d.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const d = findDownload((await params).slug);
    if (!d) return {};
    return {
        title: `${d.title}: pobierz za darmo`,
        description: d.desc,
        alternates: { canonical: `https://wuyo.pl/pobierz/${d.slug}` },
    };
}

export default async function DownloadPage({ params, searchParams }: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ wygasl?: string }>
}) {
    const d = findDownload((await params).slug);
    if (!d) notFound();
    const wygasl = (await searchParams).wygasl === "1";

    return (
        <main className="flex-1 w-full px-6 pt-36 pb-24 md:pt-44">
            <div className="max-w-xl mx-auto">
                {d.article && (
                    <Link href={d.article} className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-8">
                        <ArrowLeft size={14} aria-hidden="true" /> Wróć do artykułu
                    </Link>
                )}
                <div className="flex items-center gap-3 mb-4">
                    <FileText className="text-gold" size={28} aria-hidden="true" />
                    <p className="eyebrow">Darmowy plik</p>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{d.title}</h1>
                <p className="text-white/60 mb-8 leading-relaxed">{d.desc} Podaj e-mail, a wyślę Ci link do pobrania.</p>
                {wygasl && (
                    <p className="mb-6 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-white/80">
                        Ten link już wygasł. Podaj e-mail jeszcze raz, a wyślę nowy.
                    </p>
                )}
                <DownloadForm slug={d.slug} consentText={MARKETING_CONSENT_TEXT} />
            </div>
        </main>
    );
}
