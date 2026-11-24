import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadAssistant, loadDrafts } from '@/lib/lab/asystent/load'
import { pickMoves, plural } from '@/lib/lab/asystent/pick'
import { PLAYBOOK_POINTS, PLAYBOOK_SOURCES } from '@/lib/lab/asystent/playbook'
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
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <header>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400/80">Sprzedaż</p>
                <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Asystent</h1>
                <p className="mt-1 max-w-2xl text-sm text-zinc-500">
                    Codziennie wybiera 3 najlepsze ruchy i przygotowuje teksty: ofertę, wiadomość i scenariusz rozmowy.
                    Ty tylko akceptujesz, poprawiasz albo pomijasz.
                </p>
            </header>

            <section aria-labelledby="sygnaly" className="flex flex-col gap-3">
                <h2 id="sygnaly" className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">Do sprawdzenia</h2>
                <SignalList signals={signals} />
            </section>

            <section id="ruchy" aria-labelledby="ruchy-tytul" className="flex scroll-mt-24 flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="ruchy-tytul" className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
                        Na dziś: {moves.length} {plural(moves.length, 'ruch', 'ruchy', 'ruchów')}
                    </h2>
                    {left > 0 && <p className="text-xs text-zinc-500">W kolejce jeszcze {left}. Kolejny wskoczy po akceptacji albo pominięciu.</p>}
                </div>
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

            <details className="lab-card p-5 text-sm text-zinc-400">
                <summary className="cursor-pointer font-semibold text-zinc-200">Jak pisze asystent</summary>
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
