'use client'

// "use client": wybór plików, pasek postępu i wysyłka prosto do prywatnego bucketu przez jednorazowy link.
import { useRef, useState } from 'react'
import { CheckCircle2, FileUp, Loader2, Paperclip } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BUCKET = 'pliki-klientow'
const MAX = 25 * 1024 * 1024

function size(n: number) {
    return n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`
}

type Row = { name: string; size: number; state: 'wait' | 'up' | 'ok' | 'err'; err?: string }

export function UploadBox({ projectId, existing }: { projectId: string; existing: { name: string; size: number }[] }) {
    const input = useRef<HTMLInputElement>(null)
    const [rows, setRows] = useState<Row[]>([])
    const [drag, setDrag] = useState(false)
    const busy = rows.some((r) => r.state === 'wait' || r.state === 'up')

    const upload = async (files: File[]) => {
        const start = rows.length
        setRows((r) => [...r, ...files.map((f) => ({ name: f.name, size: f.size, state: 'wait' as const }))])
        const supabase = createClient()
        const sent: string[] = []
        for (let i = 0; i < files.length; i++) {
            const f = files[i]
            const set = (patch: Partial<Row>) => setRows((r) => r.map((x, k) => (k === start + i ? { ...x, ...patch } : x)))
            if (f.size > MAX) { set({ state: 'err', err: 'ponad 25 MB, wyślij link z Google Drive' }); continue }
            set({ state: 'up' })
            const res = await fetch('/api/strefa/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'start', projectId, fileName: f.name, size: f.size }) })
            const j = (await res.json().catch(() => ({}))) as { path?: string; token?: string; error?: string }
            if (!res.ok || !j.path || !j.token) { set({ state: 'err', err: j.error ?? 'nie udało się' }); continue }
            const { error } = await supabase.storage.from(BUCKET).uploadToSignedUrl(j.path, j.token, f, { contentType: f.type || 'application/octet-stream' })
            if (error) { set({ state: 'err', err: 'ten typ pliku nie przeszedł, spakuj do ZIP' }); continue }
            set({ state: 'ok' })
            sent.push(f.name)
        }
        if (sent.length) {
            await fetch('/api/strefa/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'done', projectId, names: sent }) }).catch(() => {})
        }
    }

    const pick = (list: FileList | null) => { if (list?.length) upload(Array.from(list)) }

    return (
        <div className="flex flex-col gap-4">
            <button type="button" onClick={() => input.current?.click()} disabled={busy}
                onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files) }}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${drag ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/15 hover:border-yellow-400/50 hover:bg-white/[0.03]'}`}>
                <FileUp className="text-yellow-400" />
                <span className="text-sm font-semibold text-white">Przeciągnij pliki tutaj albo kliknij, żeby wybrać</span>
                <span className="text-xs text-zinc-500">Logo, zdjęcia, teksty, PDF, ZIP · do 25 MB na plik</span>
            </button>
            <input ref={input} type="file" multiple className="hidden" onChange={(e) => { pick(e.target.files); e.target.value = '' }} />

            {(rows.length > 0 || existing.length > 0) && (
                <ul className="flex flex-col gap-1.5">
                    {rows.map((r, i) => (
                        <li key={`n${i}`} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
                            {r.state === 'ok' ? <CheckCircle2 size={16} className="shrink-0 text-emerald-400" /> : r.state === 'err' ? <Paperclip size={16} className="shrink-0 text-red-400" /> : <Loader2 size={16} className="shrink-0 animate-spin text-yellow-400" />}
                            <span className="min-w-0 flex-1 truncate text-zinc-200">{r.name}</span>
                            <span className={`shrink-0 text-xs ${r.state === 'err' ? 'text-red-400' : 'text-zinc-500'}`}>{r.state === 'err' ? r.err : r.state === 'ok' ? 'wysłany' : size(r.size)}</span>
                        </li>
                    ))}
                    {existing.map((f, i) => (
                        <li key={`e${i}`} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm">
                            <CheckCircle2 size={16} className="shrink-0 text-zinc-600" />
                            <span className="min-w-0 flex-1 truncate text-zinc-400">{f.name}</span>
                            <span className="shrink-0 text-xs text-zinc-600">{size(f.size)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
