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
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            {/* Telefon: zakładki etapów */}
            <div className="md:hidden flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1">
                {JOB_STAGES.map((s) => {
                    const count = view.filter((j) => j.stage === s.stage).length
                    return (
                        <button
                            key={s.stage}
                            type="button"
                            onClick={() => setActiveTab(s.stage)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                                activeTab === s.stage
                                    ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400 font-semibold'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                        >
                            {s.short} · {count}
                        </button>
                    )
                })}
            </div>

            <div className="md:flex md:gap-3 md:overflow-x-auto md:pb-4">
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
                            className={`${activeTab === s.stage ? 'block' : 'hidden'} md:block md:w-72 md:shrink-0 rounded-xl border p-3 transition-colors ${
                                isOver ? 'border-yellow-400/60 bg-yellow-400/5' : 'border-zinc-800 bg-zinc-900'
                            }`}
                        >
                            <header className="mb-3">
                                <h2 className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                    {s.stage}. {s.label}
                                </h2>
                                <p className="mt-1 flex items-baseline gap-2">
                                    <span className="font-heading text-lg font-bold text-white">{formatPLN(sum)}</span>
                                    <span className="text-[10px] text-zinc-600">netto</span>
                                    <span className="ml-auto text-xs text-zinc-500">{col.length} zl.</span>
                                </p>
                            </header>
                            <div className="flex flex-col gap-2 min-h-12">
                                {col.length === 0 && (
                                    <p className="text-xs text-zinc-700 py-2">Pusto.</p>
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
