import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SocialPublisher } from '@/components/lab/social/SocialPublisher'
import { recentPosts, type PostStatus } from '@/lib/social/publisher'
import { TZ } from '@/lib/lab/today/format'

export const dynamic = 'force-dynamic'

const STATUS: Record<PostStatus, { label: string; cls: string }> = {
    opublikowane: { label: 'Opublikowane', cls: 'bg-emerald-400/10 text-emerald-300' },
    zaplanowane: { label: 'Zaplanowane', cls: 'bg-yellow-400/10 text-yellow-300' },
    w_kolejce: { label: 'W kolejce', cls: 'bg-violet-400/10 text-violet-300' },
    czesciowo: { label: 'Częściowo', cls: 'bg-orange-400/10 text-orange-300' },
    blad: { label: 'Błąd', cls: 'bg-red-400/10 text-red-300' },
}

const IMG_URL = /https?:\/\/[^\s)<>"]+\.(?:jpe?g|png|webp)/gi

function fmt(iso: string) {
    return new Date(iso).toLocaleString('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ })
}

export default async function PublishPage({ searchParams }: { searchParams: Promise<{ z?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    // Wejście z kalendarza: tekst posta (bez notatek po „---”) i jego grafika.
    const { z } = await searchParams
    let initialContent = ''
    let initialImages: string[] = []
    let calendarEventId: string | undefined
    if (z && /^[\w-]{1,64}$/.test(z)) {
        const { data: ev } = await supabase.from('calendar_events').select('id, content, topic, image_url').eq('id', z).maybeSingle()
        if (ev) {
            calendarEventId = String(ev.id)
            initialContent = (String(ev.content ?? '').split(/\n---\n/)[0] || String(ev.topic ?? '')).trim()
            const fromText = String(ev.content ?? '').match(IMG_URL) ?? []
            initialImages = [...new Set([ev.image_url, ...fromText].filter((u): u is string => typeof u === 'string' && u.startsWith('https://')))]
                .filter((u) => u.includes('/storage/v1/object/public/social/'))
        }
    }

    const posts = await recentPosts(supabase, 30)

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Publikuj</h1>
                <p className="mt-1 text-sm text-zinc-500">
                    Jeden post na wiele kont: WUYO, Pergamin Studio, Prompteusz. Główna droga to Postiz. Gdy śpi, FB i IG WUYO idą bezpośrednio, reszta czeka w kolejce.
                </p>
            </header>

            <SocialPublisher
                key={calendarEventId ?? 'new'}
                initialContent={initialContent}
                initialImages={initialImages}
                calendarEventId={calendarEventId}
            />

            <section className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white">Historia</h2>
                {posts.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-500">Jeszcze nic nie wysłane z tego panelu.</p>
                ) : (
                    <ul className="mt-4 divide-y divide-white/[0.06]">
                        {posts.map((p) => {
                            const st = STATUS[p.status]
                            return (
                                <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-4">
                                    {p.obrazy[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- miniatura z bucketu social
                                        <img src={p.obrazy[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover" />
                                    ) : (
                                        <div className="hidden h-14 w-14 shrink-0 rounded-xl border border-white/10 bg-black/30 sm:block" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm text-zinc-200">{p.tresc}</p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {p.wyniki.map((w) => (
                                                <span
                                                    key={w.kanal}
                                                    title={w.blad}
                                                    className={`rounded-full px-2 py-0.5 text-[11px] ${w.ok ? 'bg-emerald-400/10 text-emerald-300' : w.oczekuje ? 'bg-violet-400/10 text-violet-300' : 'bg-red-400/10 text-red-300'}`}
                                                >
                                                    {w.nazwa}{w.droga === 'graph' ? ' · bezpośrednio' : ''}
                                                </span>
                                            ))}
                                        </div>
                                        {p.wyniki.some((w) => w.blad && !w.ok && !w.oczekuje) && (
                                            <p className="mt-1 text-[11px] text-red-300/80">{p.wyniki.filter((w) => !w.ok && !w.oczekuje).map((w) => `${w.nazwa}: ${w.blad}`).join(' · ')}</p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                                        <span className="text-[11px] text-zinc-500">
                                            {p.termin ? `na ${fmt(p.termin)}` : fmt(p.created_at)}
                                        </span>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>
        </div>
    )
}
