import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SocialPublisher } from '@/components/lab/social/SocialPublisher'
import { recentPosts, type PostStatus } from '@/lib/social/publisher'
import { TZ } from '@/lib/lab/today/format'
import { History, ImageOff, Send } from 'lucide-react'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'

export const dynamic = 'force-dynamic'

const STATUS: Record<PostStatus, { label: string; cls: string }> = {
    opublikowane: { label: 'Opublikowane', cls: 'bg-emerald-400/15 text-emerald-300' },
    zaplanowane: { label: 'Zaplanowane', cls: 'bg-yellow-400/15 text-yellow-300' },
    w_kolejce: { label: 'W kolejce', cls: 'bg-violet-400/15 text-violet-300' },
    czesciowo: { label: 'Częściowo', cls: 'bg-orange-400/15 text-orange-300' },
    blad: { label: 'Błąd', cls: 'bg-red-400/15 text-red-300' },
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
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Send}
                title="Publikuj"
                subtitle="Jeden post na wiele kont: WUYO, Pergamin Studio, Prompteusz. Główna droga to Postiz. Gdy śpi, FB i IG WUYO idą bezpośrednio, reszta czeka w kolejce."
            />

            <SocialPublisher
                key={calendarEventId ?? 'new'}
                initialContent={initialContent}
                initialImages={initialImages}
                calendarEventId={calendarEventId}
            />

            <section className="lab-card p-5 sm:p-6">
                <SectionTitle
                    icon={History}
                    title="Historia"
                    action={posts.length > 0 ? <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">ostatnie {posts.length}</span> : undefined}
                />
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-10 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400"><Send size={22} strokeWidth={1.8} /></span>
                        <p className="text-sm text-zinc-500">Jeszcze nic nie wysłane z tego panelu. Napisz post wyżej i wybierz konta.</p>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {posts.map((p) => {
                            const st = STATUS[p.status]
                            return (
                                <li key={p.id} className="flex flex-col gap-2 rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06] sm:flex-row sm:items-start sm:gap-4">
                                    {p.obrazy[0] ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- miniatura z bucketu social
                                        <img src={p.obrazy[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-white/10" />
                                    ) : (
                                        <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-600 sm:flex"><ImageOff size={18} strokeWidth={1.8} /></div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm text-zinc-200">{p.tresc}</p>
                                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {p.wyniki.map((w) => (
                                                <span
                                                    key={w.kanal}
                                                    title={w.blad}
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${w.ok ? 'bg-emerald-400/15 text-emerald-300' : w.oczekuje ? 'bg-violet-400/15 text-violet-300' : 'bg-red-400/15 text-red-300'}`}
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
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
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
