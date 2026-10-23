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

    if (!head) return <p className="text-sm text-zinc-600">Plik jest pusty.</p>

    return (
        <div className="flex flex-col gap-3 min-w-0">
            <label className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm max-w-sm">
                <Search size={14} className="text-zinc-500 shrink-0" />
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Szukaj w tabeli…"
                    className="bg-transparent outline-none text-zinc-200 placeholder:text-zinc-600 w-full"
                />
            </label>
            <p className="text-[11px] text-zinc-500">
                {shown.length === body.length ? `${body.length} wierszy` : `${shown.length} z ${body.length} wierszy`}
            </p>
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full text-xs">
                    <thead className="bg-zinc-950 text-zinc-500 text-left">
                        <tr>
                            {head.map((h, i) => (
                                <th key={i} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {shown.map((r, i) => (
                            <tr key={i} className="hover:bg-zinc-800/40 align-top">
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
