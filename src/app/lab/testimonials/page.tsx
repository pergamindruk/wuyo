import { ExternalLink, Star } from 'lucide-react'
import { getGoogleReviews } from '@/lib/google-reviews'
import { GOOGLE_WRITE_REVIEW_URL, staticGoogleReviews } from '@/data/google-reviews-static'
import { CopyButton } from './CopyButton'

export const dynamic = 'force-dynamic'

const ASK_MESSAGE = `Dziękuję za współpracę! Mam małą prośbę: jeśli wszystko było w porządku, czy mogę prosić o kilka słów opinii w Google? To dla mnie duża pomoc, bo nowi klienci właśnie tam zaglądają. Link: ${GOOGLE_WRITE_REVIEW_URL}`

function monthsAgo(iso?: string): string {
    if (!iso) return ''
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
    if (days < 31) return `${days} dni temu`
    const m = Math.floor(days / 30)
    return m === 1 ? 'miesiąc temu' : `${m} mies. temu`
}

export default async function TestimonialsPage() {
    const live = await getGoogleReviews()
    const data = live ?? staticGoogleReviews
    const newest = [...data.reviews].sort((a, b) => (b.publishTime ?? '').localeCompare(a.publishTime ?? ''))[0]

    return (
        <div className="flex flex-col gap-6 max-w-4xl">
            <header>
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500/80 mb-2">Google</p>
                <h1 className="text-2xl font-bold text-white leading-tight">Opinie klientów</h1>
                <p className="text-zinc-400 text-sm mt-1">
                    Te same opinie widać na wuyo.pl (strona główna i podstrony usług).
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Ocena</p>
                    <p className="font-heading text-2xl font-bold text-yellow-400 flex items-center gap-1.5">
                        {data.rating.toFixed(1)} <Star size={18} className="fill-yellow-400" />
                    </p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Opinii</p>
                    <p className="font-heading text-2xl font-bold text-white">{data.total}</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                    <p className="font-heading text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">Ostatnia</p>
                    <p className="font-heading text-lg font-bold text-white">{monthsAgo(newest?.publishTime) || 'brak'}</p>
                </div>
            </div>

            <section className="bg-zinc-900 border border-yellow-400/20 rounded-2xl p-5 flex flex-col gap-3">
                <h2 className="text-white font-bold text-sm">Poproś o opinię</h2>
                <p className="text-zinc-400 text-sm whitespace-pre-line">{ASK_MESSAGE}</p>
                <div className="flex flex-wrap gap-2">
                    <CopyButton text={ASK_MESSAGE} label="Kopiuj wiadomość" />
                    <CopyButton text={GOOGLE_WRITE_REVIEW_URL} label="Kopiuj sam link" />
                    {data.mapsUrl && (
                        <a href={data.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors">
                            Profil w Google <ExternalLink size={12} />
                        </a>
                    )}
                </div>
            </section>

            <ul className="flex flex-col gap-3">
                {data.reviews.map((r, i) => (
                    <li key={`${r.author}-${i}`} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="text-white text-sm font-semibold">{r.author}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-2">
                                <span className="text-yellow-400">{'★'.repeat(Math.round(r.rating))}</span>
                                {monthsAgo(r.publishTime)}
                            </p>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed">{r.text}</p>
                    </li>
                ))}
            </ul>

            {!live && (
                <p className="text-xs text-zinc-600">
                    Nowa opinia w Google? Dopisz ją w pliku <code className="text-zinc-400">src/data/google-reviews-static.ts</code> albo napisz mi, to dodam.
                </p>
            )}
        </div>
    )
}
