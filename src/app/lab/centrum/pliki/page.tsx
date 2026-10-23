import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    ArrowLeft, FileSpreadsheet, FileText, Mail, MessageSquare, ScrollText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
    extractPosts, formatSize, formatWhen, groupFiles, MAIL_STATUS_LABEL, parseCsv, parseJson,
    parseThread, splitFrontmatter,
    type ConversationData, type FileFull, type FileKind, type FileListItem, type MailData,
} from '@/lib/lab/centrum/files'
import { AutoRefresh } from '../AutoRefresh'
import { CopyButton, DownloadButton } from './FileActions'
import { CsvTable } from './CsvTable'

export const dynamic = 'force-dynamic'

const ICON: Record<FileKind, typeof FileText> = {
    md: FileText, mdx: FileText, csv: FileSpreadsheet, txt: ScrollText, mail: Mail, rozmowa: MessageSquare,
}

const PROSE = 'prose prose-sm prose-invert prose-yellow max-w-none text-zinc-300 leading-relaxed ' +
    'prose-headings:text-white prose-a:text-yellow-400 prose-table:text-xs'

/* ───────────── lista plików ───────────── */

function FileList({ files, current }: { files: FileListItem[]; current: string | null }) {
    return (
        <nav className="flex flex-col gap-5">
            {groupFiles(files).map(([group, items]) => (
                <div key={group}>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 px-2">
                        {group} <span className="text-zinc-700">· {items.length}</span>
                    </p>
                    <ul className="flex flex-col gap-0.5">
                        {items.map((f) => {
                            const Icon = ICON[f.typ]
                            const active = f.sciezka === current
                            return (
                                <li key={f.sciezka}>
                                    <Link
                                        href={`/lab/centrum/pliki?p=${encodeURIComponent(f.sciezka)}`}
                                        className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                                            active ? 'bg-yellow-400/10 text-yellow-300'
                                                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'}`}
                                    >
                                        <Icon size={13} className="shrink-0 mt-0.5 opacity-70" />
                                        <span className="min-w-0">
                                            <span className="block break-words">{f.nazwa}</span>
                                            <span className="block text-[10px] text-zinc-600">{formatWhen(f.zmieniono)}</span>
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ))}
        </nav>
    )
}

/* ───────────── widoki treści ───────────── */

function MarkdownView({ text }: { text: string }) {
    return (
        <div className={PROSE}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
    )
}

function BlogDraftView({ text }: { text: string }) {
    const { meta, body } = splitFrontmatter(text)
    return (
        <div className="flex flex-col gap-5">
            {meta.length > 0 && (
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs">
                    {meta.map(([k, v]) => (
                        <div key={k} className="contents">
                            <dt className="text-zinc-500">{k}</dt>
                            <dd className="text-zinc-300 break-words">{v}</dd>
                        </div>
                    ))}
                </dl>
            )}
            <MarkdownView text={body} />
        </div>
    )
}

function PostsView({ text }: { text: string }) {
    const posts = extractPosts(text)
    return (
        <div className="flex flex-col gap-6">
            {posts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {posts.map((p) => (
                        <CopyButton key={p.title} text={p.copy} label={`Kopiuj: ${p.title.split('–')[0].trim()}`} />
                    ))}
                </div>
            )}
            <MarkdownView text={text} />
        </div>
    )
}

function MailView({ text }: { text: string }) {
    const m = parseJson<MailData>(text)
    if (!m) return <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{text}</pre>
    const body = [m.temat ? `Temat: ${m.temat}` : '', m.tresc ?? ''].filter(Boolean).join('\n\n')
    return (
        <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
                <dt className="text-zinc-500">Do</dt><dd className="text-zinc-200 break-all">{m.do}</dd>
                {m.firma && <><dt className="text-zinc-500">Firma</dt><dd className="text-zinc-200">{m.firma}</dd></>}
                <dt className="text-zinc-500">Status</dt>
                <dd className={m.status === 'pending_review' ? 'text-yellow-400' : 'text-zinc-200'}>
                    {MAIL_STATUS_LABEL[m.status] ?? m.status}
                </dd>
                {m.krok !== null && <><dt className="text-zinc-500">Krok</dt><dd className="text-zinc-200">mail {m.krok}</dd></>}
                {m.wyslano && <><dt className="text-zinc-500">Wysłano</dt><dd className="text-zinc-200">{formatWhen(m.wyslano)}</dd></>}
                {m.blad && <><dt className="text-zinc-500">Błąd</dt><dd className="text-red-400">{m.blad}</dd></>}
            </dl>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-sm font-semibold text-white mb-3">{m.temat || '(bez tematu)'}</p>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{m.tresc}</p>
            </div>
            {m.status === 'pending_review' && (
                <p className="text-[11px] text-zinc-500">
                    Zatwierdzasz na komputerze studia: Harvey → Outbox (127.0.0.1:5555), klawisz A lub R.
                </p>
            )}
            <div><CopyButton text={body} label="Kopiuj maila" /></div>
        </div>
    )
}

function ConversationView({ text }: { text: string }) {
    const c = parseJson<ConversationData>(text)
    if (!c) return <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{text}</pre>
    const thread = parseThread(c.watek)
    return (
        <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-xs">
                <dt className="text-zinc-500">Firma</dt><dd className="text-zinc-200">{c.firma || '—'}</dd>
                <dt className="text-zinc-500">E-mail</dt><dd className="text-zinc-200 break-all">{c.email || '—'}</dd>
                <dt className="text-zinc-500">Ocena</dt><dd className="text-yellow-400">{c.intencja ?? 'brak'}</dd>
                <dt className="text-zinc-500">Etap</dt><dd className="text-zinc-200">{c.etap ?? '—'}</dd>
            </dl>
            {thread ? (
                <ol className="flex flex-col gap-3">
                    {thread.map((msg, i) => (
                        <li key={i} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                            <p className="text-[11px] text-zinc-500 mb-2">{msg.who}{msg.at && ` · ${formatWhen(msg.at)}`}</p>
                            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{msg.text}</p>
                        </li>
                    ))}
                </ol>
            ) : <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{c.watek}</pre>}
        </div>
    )
}

function FileView({ file }: { file: FileFull }) {
    const isPosts = file.sciezka.startsWith('raporty/posty-')
    let content: React.ReactNode
    switch (file.typ) {
        case 'csv': content = <CsvTable rows={parseCsv(file.tresc)} />; break
        case 'mdx': content = <BlogDraftView text={file.tresc} />; break
        case 'md': content = isPosts ? <PostsView text={file.tresc} /> : <MarkdownView text={file.tresc} />; break
        case 'mail': content = <MailView text={file.tresc} />; break
        case 'rozmowa': content = <ConversationView text={file.tresc} />; break
        default:
            content = (
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                    {file.tresc}
                </pre>
            )
    }
    const isFile = file.typ !== 'mail' && file.typ !== 'rozmowa'
    return (
        <article className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 md:p-6 min-w-0">
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 pb-4 border-b border-zinc-800">
                <div className="min-w-0">
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">{file.grupa}</p>
                    <h2 className="text-lg font-bold text-white break-words">{file.nazwa}</h2>
                    <p className="text-[11px] text-zinc-500 mt-1">
                        {isFile && <>{file.sciezka} · {formatSize(file.rozmiar)} · </>}
                        zmieniono {formatWhen(file.zmieniono)}
                    </p>
                </div>
                {isFile && (
                    <div className="flex gap-2 shrink-0">
                        <CopyButton text={file.tresc} label="Kopiuj całość" />
                        <DownloadButton text={file.tresc} filename={file.sciezka.split('/').pop() ?? 'plik.txt'} />
                    </div>
                )}
            </header>
            {content}
        </article>
    )
}

/* ───────────── strona ───────────── */

export default async function CentrumFilesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/lab/login')

    const { p } = await searchParams
    const { data: list } = await supabase
        .from('centrum_pliki')
        .select('sciezka, grupa, nazwa, typ, rozmiar, zmieniono')
        .order('zmieniono', { ascending: false })
    const files = (list ?? []) as FileListItem[]

    const wanted = p ?? files.find((f) => f.sciezka === 'raporty/RANO.md')?.sciezka ?? files[0]?.sciezka ?? null
    let file: FileFull | null = null
    if (wanted) {
        const { data } = await supabase.from('centrum_pliki').select('*').eq('sciezka', wanted).maybeSingle()
        file = (data as FileFull | null) ?? null
    }

    return (
        <div className="flex flex-col gap-6 max-w-7xl">
            <AutoRefresh seconds={300} />
            <header>
                <Link href="/lab/centrum" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-yellow-400 mb-3">
                    <ArrowLeft size={12} /> Centrum Dowodzenia
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Raporty i pliki</h1>
                <p className="text-zinc-500 text-sm mt-1">
                    Wszystko z komputera studia: raporty, listy firm, posty, szkice i maile Harveya. Odświeża się co 30 min.
                </p>
            </header>

            {files.length === 0 ? (
                <p className="text-sm text-zinc-500">
                    Brak plików. Uruchom na komputerze studia: <code>python -I sync_centrum.py</code>
                </p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
                    <details className="lg:hidden bg-zinc-900 border border-zinc-800 rounded-xl" open={!p}>
                        <summary className="cursor-pointer px-4 py-3 text-sm text-zinc-200">
                            Wszystkie pliki ({files.length})
                        </summary>
                        <div className="px-2 pb-4"><FileList files={files} current={file?.sciezka ?? null} /></div>
                    </details>
                    <aside className="hidden lg:block sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
                        <FileList files={files} current={file?.sciezka ?? null} />
                    </aside>
                    {file ? <FileView file={file} /> : (
                        <p className="text-sm text-zinc-500">Tego pliku już nie ma. Wybierz inny z listy.</p>
                    )}
                </div>
            )}
        </div>
    )
}
