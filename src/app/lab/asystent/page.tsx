import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadAssistant, loadDrafts } from '@/lib/lab/asystent/load'
import { pickMoves, plural } from '@/lib/lab/asystent/pick'
import { PLAYBOOK_POINTS, PLAYBOOK_SOURCES } from '@/lib/lab/asystent/playbook'
import { BellRing, BookOpen, Sparkles, Target } from 'lucide-react'
import { PageHeader, SectionTitle } from '@/components/lab/ui/PageHeader'
import { SignalList } from '@/components/lab/asystent/SignalList'
import { MoveCard } from '@/components/lab/asystent/MoveCard'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Asystent sprzedaży — WUYO Lab' }

export default async function AssistantPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const { ranked, signals, skipped } = await loadAssistant(supabase)
    const moves = pickMoves(ranked, skipped, 3)
    const drafts = await loadDrafts(supabase, moves.map((m) => m.key))
    const left = ranked.filter((m) => !skipped.has(m.key)).length - moves.length

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                icon={Sparkles}
                eyebrow="Sprzedaż"
                title="Asystent"
                subtitle="Codziennie wybiera 3 najlepsze ruchy i przygotowuje teksty: ofertę, wiadomość i scenariusz rozmowy. Ty tylko akceptujesz, poprawiasz albo pomijasz."
                actions={left > 0 ? <span className="lab-pill px-3 py-1.5 text-sm text-zinc-300">W kolejce jeszcze <b className="text-white">{left}</b></span> : undefined}
            />

            <section aria-label="Do sprawdzenia" className="lab-card p-5 sm:p-6">
                <SectionTitle icon={BellRing} title="Do sprawdzenia" />
                <SignalList signals={signals} />
            </section>

            <section id="ruchy" aria-label="Ruchy na dziś" className="flex scroll-mt-24 flex-col gap-4">
                <SectionTitle
                    icon={Target}
                    title={`Na dziś: ${moves.length} ${plural(moves.length, 'ruch', 'ruchy', 'ruchów')}`}
                    action={left > 0 ? <p className="text-xs text-zinc-500">Kolejny wskoczy po akceptacji albo pominięciu.</p> : undefined}
                />
                {moves.length === 0 ? (
                    <div className="lab-card p-8 text-center text-sm text-zinc-400">
                        Nic nie czeka. Dodaj firmy do kolejki telefonów albo zlecenia w Lejku, a asystent je podchwyci.
                    </div>
                ) : (
                    <div className="lab-stagger flex flex-col gap-4">
                        {moves.map((m, i) => <MoveCard key={m.key} move={m} index={i} initial={drafts.get(m.key)?.draft ?? null} />)}
                    </div>
                )}
            </section>

            <details className="lab-card p-5 text-sm text-zinc-400 sm:p-6">
                <summary className="flex cursor-pointer items-center gap-2.5 font-bold text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><BookOpen size={16} aria-hidden /></span>
                    Jak pisze asystent
                </summary>
                <ul className="mt-3 list-disc space-y-1 pl-5">
                    {PLAYBOOK_POINTS.map((p) => <li key={p}>{p}</li>)}
                </ul>
                <p className="mt-3 text-xs text-zinc-500">
                    Zasady wzięte z metod agencji i danych o rozmowach sprzedażowych. Teksty piszą się Twoim głosem, z cennika WUYO, bez zakazanych słów.
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                    {PLAYBOOK_SOURCES.map((s) => (
                        <li key={s.href}><a href={s.href} target="_blank" rel="noreferrer" className="text-yellow-400/80 hover:underline">{s.label}</a></li>
                    ))}
                </ul>
            </details>
        </div>
    )
}
