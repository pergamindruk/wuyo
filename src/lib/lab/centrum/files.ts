// Pliki z komputera studia (tabela centrum_pliki, zapisuje sync_centrum.py).

export type FileKind = 'md' | 'mdx' | 'csv' | 'txt' | 'mail' | 'rozmowa'

export interface FileListItem {
    sciezka: string
    grupa: string
    nazwa: string
    typ: FileKind
    rozmiar: number
    zmieniono: string
}

export interface FileFull extends FileListItem {
    tresc: string
}

export interface MailData {
    do: string
    firma: string
    temat: string | null
    tresc: string | null
    status: string
    krok: number | null
    zaplanowano: string | null
    wyslano: string | null
    blad: string | null
}

export interface ConversationData {
    firma: string
    email: string
    intencja: string | null
    etap: string | null
    status: string | null
    watek: string
}

export interface ThreadMessage {
    who: string
    text: string
    at: string
}

/** Kolejność sekcji na liście; nieznane grupy lądują na końcu. */
export const GROUP_ORDER = [
    'Dyrygent',
    'Nocna zmiana',
    'Maile do zatwierdzenia',
    'Odpowiedzi klientów',
    'Listy firm',
    'Audyt stron',
    'Blog i posty',
    'Maile zatwierdzone',
    'Maile wysłane',
    'Maile – inne',
]

export function groupFiles(files: FileListItem[]): [string, FileListItem[]][] {
    const map = new Map<string, FileListItem[]>()
    for (const f of files) {
        const list = map.get(f.grupa) ?? []
        list.push(f)
        map.set(f.grupa, list)
    }
    const rank = (g: string) => {
        const i = GROUP_ORDER.indexOf(g)
        return i === -1 ? GROUP_ORDER.length : i
    }
    return [...map.entries()].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, 'pl'))
}

/** Prosty parser CSV: cudzysłowy, separator ; albo , (wykrywany z nagłówka). */
export function parseCsv(text: string): string[][] {
    const clean = text.replace(/^\uFEFF/, '')
    const firstLine = clean.split('\n', 1)[0] ?? ''
    const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
    const rows: string[][] = []
    let row: string[] = []
    let cell = ''
    let quoted = false
    for (let i = 0; i < clean.length; i++) {
        const ch = clean[i]
        if (quoted) {
            if (ch === '"' && clean[i + 1] === '"') { cell += '"'; i++ }
            else if (ch === '"') quoted = false
            else cell += ch
        } else if (ch === '"') quoted = true
        else if (ch === sep) { row.push(cell); cell = '' }
        else if (ch === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = '' }
        else cell += ch
    }
    if (cell !== '' || row.length > 0) { row.push(cell.replace(/\r$/, '')); rows.push(row) }
    return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/** Oddziela nagłówek YAML (--- … ---) szkicu bloga od treści. */
export function splitFrontmatter(text: string): { meta: [string, string][]; body: string } {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
    if (!m) return { meta: [], body: text }
    const meta: [string, string][] = []
    for (const line of m[1].split(/\r?\n/)) {
        const kv = line.match(/^(\w+):\s*(.*)$/)
        if (kv) meta.push([kv[1], kv[2].replace(/^["']|["']$/g, '')])
    }
    return { meta, body: text.slice(m[0].length) }
}

/** Z pliku posty-*.md wyciąga gotowy do wklejenia tekst każdego posta (tekst + hashtagi). */
export function extractPosts(text: string): { title: string; copy: string }[] {
    const parts = text.split(/^###\s+/m).slice(1)
    return parts.map((part) => {
        const [titleLine, ...rest] = part.split('\n')
        const body = rest.join('\n').split(/^---\s*$/m)[0]
        const tekst = body.match(/\*\*Tekst:\*\*\s*([\s\S]*?)(?=\n\*\*[^*]+:\*\*|$)/)
        const tagi = body.match(/\*\*Hashtagi:\*\*\s*(.+)/)
        const copy = [tekst?.[1].trim() ?? body.trim(), tagi?.[1].trim() ?? '']
            .filter(Boolean)
            .join('\n\n')
        return { title: titleLine.trim(), copy }
    })
}

export function parseJson<T>(text: string): T | null {
    try {
        return JSON.parse(text) as T
    } catch {
        return null
    }
}

/** Wątek rozmowy z Harveya: format nie jest stały, więc czytamy ostrożnie. */
export function parseThread(raw: string): ThreadMessage[] | null {
    const data = parseJson<unknown>(raw)
    if (!Array.isArray(data)) return null
    return data.map((m) => {
        const o = (m && typeof m === 'object' ? m : {}) as Record<string, unknown>
        const pick = (...keys: string[]) => {
            for (const k of keys) if (typeof o[k] === 'string' && o[k]) return o[k] as string
            return ''
        }
        return {
            who: pick('role', 'from', 'sender', 'direction') || '—',
            text: pick('body', 'text', 'content', 'message') || JSON.stringify(o),
            at: pick('at', 'date', 'created_at', 'timestamp', 'sent_at'),
        }
    })
}

export const MAIL_STATUS_LABEL: Record<string, string> = {
    pending_review: 'czeka na zatwierdzenie',
    approved: 'zatwierdzony',
    sent: 'wysłany',
    rejected: 'odrzucony',
    failed: 'błąd wysyłki',
}

export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1).replace('.', ',')} KB`
}

export function formatWhen(iso: string): string {
    const d = new Date(iso.includes('T') || iso.includes('+') ? iso : `${iso.replace(' ', 'T')}Z`)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
}
