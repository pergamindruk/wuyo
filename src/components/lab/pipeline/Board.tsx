'use client'

// Uzasadnienie "use client": przeciąganie kart (natywny HTML5 DnD), wybór etapu na telefonie,
// otwarty panel zlecenia i optymistyczne przesunięcie przed odpowiedzią serwera.

import { useMemo, useOptimistic, useState, useTransition } from 'react'
import { moveJob } from '@/app/lab/lejek/actions'
import { JOB_STAGES } from '@/lib/lab/today/constants'
import { formatPLN } from '@/lib/lab/today/format'
import type { JobStage } from '@/lib/lab/today/types'
import { JobCard } from './JobCard'
import { JobDrawer } from './JobDrawer'
import type { PipelineJob } from './types'

interface Move { id: string; stage: JobStage }

export function Board({ jobs, today, nowIso }: { jobs: PipelineJob[]; today: string; nowIso: string }) {
    const now = useMemo(() => new Date(nowIso), [nowIso])
    const [view, applyMove] = useOptimistic(jobs, (state, m: Move) =>
        state.map((j) => (j.id === m.id ? { ...j, stage: m.stage } : j)),
    )
    const [, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dragId, setDragId] = useState<string | null>(null)
    const [overStage, setOverStage] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<number>(1)

    function move(id: string, stage: number) {
        const job = view.find((j) => j.id === id)
        if (!job || job.stage === stage) return
        setError(null)
        startTransition(async () => {
            applyMove({ id, stage: stage as JobStage })
            const res = await moveJob(id, stage)
            if (!res.ok) setError(res.error)
        })
    }

    const selected = selectedId ? view.find((j) => j.id === selectedId) ?? null : null

    return (
        <div>
            {error && <p className="mb-3 rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

            {/* Telefon: zakładki etapów (pigułki) */}
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3 md:hidden">
                {JOB_STAGES.map((s) => {
                    const count = view.filter((j) => j.stage === s.stage).length
                    return (
                        <button
                            key={s.stage}
                            type="button"
                            onClick={() => setActiveTab(s.stage)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                                activeTab === s.stage
                                    ? 'bg-yellow-400 text-zinc-950'
                                    : 'bg-white/[0.06] text-zinc-400'
                            }`}
                        >
                            {s.short}
                            <span className={`rounded-full px-1.5 text-[10px] ${activeTab === s.stage ? 'bg-zinc-950/15' : 'bg-white/[0.08]'}`}>{count}</span>
                        </button>
                    )
                })}
            </div>

            <div className="md:flex md:gap-4 md:overflow-x-auto md:pb-4">
                {JOB_STAGES.map((s) => {
                    const col = view.filter((j) => j.stage === s.stage)
                    const sum = col.reduce((acc, j) => acc + j.price_grosze, 0)
                    const isOver = overStage === s.stage && dragId !== null
                    return (
                        <section
                            key={s.stage}
                            onDragOver={(e) => { e.preventDefault(); setOverStage(s.stage) }}
                            onDragLeave={() => setOverStage((cur) => (cur === s.stage ? null : cur))}
                            onDrop={(e) => {
                                e.preventDefault()
                                const id = e.dataTransfer.getData('text/plain') || dragId
                                setOverStage(null)
                                setDragId(null)
                                if (id) move(id, s.stage)
                            }}
                            className={`lab-card ${activeTab === s.stage ? 'block' : 'hidden'} p-3 md:block md:w-72 md:shrink-0 ${
                                isOver ? '!border-yellow-400/60 !bg-yellow-400/[0.06]' : ''
                            }`}
                        >
                            <header className="mb-3 px-1.5 pt-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold text-white">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-[11px] font-bold text-yellow-400">{s.stage}</span>
                                        <span className="truncate">{s.label}</span>
                                    </h2>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${col.length > 0 ? 'bg-yellow-400/15 text-yellow-300' : 'bg-white/[0.06] text-zinc-400'}`}
                                        title={`${col.length} ${col.length === 1 ? "zlecenie" : col.length >= 2 && col.length <= 4 ? "zlecenia" : "zleceń"}`}
                                    >
                                        {col.length}
                                    </span>
                                </div>
                                <p className="mt-2 flex items-baseline gap-1.5">
                                    <span className="font-heading text-xl font-bold text-white">{formatPLN(sum)}</span>
                                    <span className="text-[10px] text-zinc-500">netto</span>
                                </p>
                            </header>
                            <div className="flex min-h-12 flex-col gap-2">
                                {col.length === 0 && (
                                    <p className="rounded-2xl border border-dashed border-white/[0.08] px-3 py-4 text-center text-xs text-zinc-600">Pusto. Upuść tu kartę.</p>
                                )}
                                {col.map((j) => (
                                    <JobCard
                                        key={j.id}
                                        job={j}
                                        today={today}
                                        now={now}
                                        selected={j.id === selectedId}
                                        dragging={j.id === dragId}
                                        onOpen={() => setSelectedId(j.id)}
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('text/plain', j.id)
                                            e.dataTransfer.effectAllowed = 'move'
                                            setDragId(j.id)
                                        }}
                                        onDragEnd={() => { setDragId(null); setOverStage(null) }}
                                    />
                                ))}
                            </div>
                        </section>
                    )
                })}
            </div>

            {selected && (
                <JobDrawer
                    key={selected.id}
                    job={selected}
                    onClose={() => setSelectedId(null)}
                    onMove={(stage) => move(selected.id, stage)}
                />
            )}
        </div>
    )
}
