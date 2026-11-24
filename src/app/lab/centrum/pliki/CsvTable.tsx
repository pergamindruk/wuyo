'use client'

// "use client": filtrowanie tabeli na żywo podczas pisania.
import { useState } from 'react'
import { Search } from 'lucide-react'

const PHONE = /^\+?[\d\s()-]{9,}$/
const URL_RE = /^https?:\/\/\S+$/

function Cell({ value }: { value: string }) {
    const v = value.trim()
    if (PHONE.test(v)) {
        return (
            <a href={`tel:${v.replace(/[^\d+]/g, '')}`} className="text-yellow-400 hover:underline whitespace-nowrap tabular-nums">
                {v}
            </a>
        )
    }
    if (URL_RE.test(v)) {
        return (
            <a href={v} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-yellow-400 break-all">
                {v.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
        )
    }
    if (v.includes(' | ')) {
        return (
            <ul className="list-disc pl-4 space-y-0.5">
                {v.split(' | ').map((p) => <li key={p}>{p}</li>)}
            </ul>
        )
    }
    return <>{v}</>
}

export function CsvTable({ rows }: { rows: string[][] }) {
    const [q, setQ] = useState('')
    const [head, ...body] = rows
    const needle = q.trim().toLowerCase()
    const shown = needle ? body.filter((r) => r.some((c) => c.toLowerCase().includes(needle))) : body

    if (!head) return <p className="text-sm text-zinc-500">Plik jest pusty.</p>

    return (
        <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-sm">
                    <Search size={16} strokeWidth={1.8} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Szukaj w tabeli…"
                        className="lab-input w-full py-2 pl-10 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600"
                    />
                </div>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                    {shown.length === body.length ? `${body.length} wierszy` : `${shown.length} z ${body.length} wierszy`}
                </span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02]" data-lab-plain>
                <table className="w-full text-xs">
                    <thead className="bg-white/[0.03] text-left text-zinc-500">
                        <tr>
                            {head.map((h, i) => (
                                <th key={i} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                        {shown.map((r, i) => (
                            <tr key={i} className="align-top">
                                {head.map((_, j) => (
                                    <td key={j} className="px-3 py-2 text-zinc-300">
                                        <Cell value={r[j] ?? ''} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
