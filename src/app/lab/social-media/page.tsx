'use client'

import { useEffect, useState } from 'react'
import { Share2, CheckCircle, AlertTriangle, ExternalLink, Camera, Globe, Play, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { getPlatformStatus, getPublishedPosts } from './actions'
import Link from 'next/link'

type PlatformStatus = { instagram: boolean; facebook: boolean; youtube: boolean }
type PublishedPost = {
    id: string
    topic: string
    platform: string
    published_at: string | null
    ig_post_id: string | null
    fb_post_id: string | null
    yt_video_id: string | null
}

const SETUP_STEPS = {
    instagram: [
        'Utwórz konto Instagram Business lub Creator (wymaga konta Facebook)',
        'Wejdź na developers.facebook.com → utwórz aplikację (typ: Business)',
        'Dodaj produkt: Instagram Graph API',
        'W ustawieniach aplikacji → Instagram → Dodaj konto Instagram',
        'Wygeneruj długoterminowy token dostępu (60 dni, odnawiaj lub ustaw never-expire)',
        'Skopiuj ID konta Instagram (INSTAGRAM_USER_ID) i token (INSTAGRAM_ACCESS_TOKEN) do .env.local',
    ],
    facebook: [
        'Utwórz Stronę Firmową na Facebooku (facebook.com/pages/create)',
        'Wejdź na developers.facebook.com → ta sama aplikacja co dla IG',
        'Dodaj produkt: Facebook Login for Business',
        'Wygeneruj Page Access Token dla swojej strony w Graph API Explorer',
        'Skopiuj ID strony (FACEBOOK_PAGE_ID) i token (FACEBOOK_PAGE_ACCESS_TOKEN) do .env.local',
    ],
    youtube: [
        'Utwórz konto Google (może być to samo co YT channel)',
        'Wejdź na console.cloud.google.com → utwórz projekt',
        'Włącz YouTube Data API v3',
        'Utwórz OAuth2 Client ID (typ: Web Application)',
        'Wygeneruj Refresh Token (narzędzie: OAuth Playground lub own script)',
        'Skopiuj YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN do .env.local',
        'Uwaga: YouTube upload wymaga pliku wideo. Moduł generuje tylko metadane (tytuł, opis, tagi).',
    ],
}

function StatusBadge({ ok }: { ok: boolean }) {
    return ok ? (
        <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">
            <CheckCircle size={13} /> Połączone
        </span>
    ) : (
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
            <AlertTriangle size={13} /> Nieskonfigurowane
        </span>
    )
}

function PlatformCard({
    name,
    icon,
    color,
    connected,
    steps,
}: {
    name: string
    icon: React.ReactNode
    color: string
    connected: boolean
    steps: string[]
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className={`bg-zinc-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all ${connected ? 'border-zinc-800' : 'border-amber-400/20'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${color}`}>
                        {icon}
                    </div>
                    <span className="font-bold text-white">{name}</span>
                </div>
                <StatusBadge ok={connected} />
            </div>

            {!connected && (
                <button
                    onClick={() => setOpen(o => !o)}
                    className="text-xs text-amber-400 hover:text-white transition-colors text-left"
                >
                    {open ? '▲ Ukryj instrukcję' : '▼ Jak skonfigurować?'}
                </button>
            )}

            {!connected && open && (
                <ol className="flex flex-col gap-1.5 text-xs text-zinc-400 list-none">
                    {steps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-[10px] font-bold">
                                {i + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                        </li>
                    ))}
                </ol>
            )}

            {connected && (
                <p className="text-xs text-zinc-500">
                    Klucze API skonfigurowane. Możesz publikować z poziomu Kalendarza Postów.
                </p>
            )}
        </div>
    )
}

export default function SocialMediaPage() {
    const [status, setStatus] = useState<PlatformStatus | null>(null)
    const [posts, setPosts] = useState<PublishedPost[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const [s, p] = await Promise.all([getPlatformStatus(), getPublishedPosts()])
            setStatus(s)
            setPosts(p)
            setLoading(false)
        }
        load()
    }, [])

    const totalConnected = status ? Object.values(status).filter(Boolean).length : 0

    return (
        <div className="flex flex-col gap-8">
            {/* Nagłówek */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center text-zinc-950">
                    <Share2 size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Social Media</h1>
                    <p className="text-zinc-400 text-sm">
                        Centrum publikacji WUYO — Instagram, Facebook, YouTube.
                    </p>
                </div>
            </div>

            {/* Status podsumowanie */}
            {!loading && status && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black
                        ${totalConnected === 3 ? 'bg-green-400/20 text-green-400' :
                          totalConnected > 0 ? 'bg-amber-400/20 text-amber-400' :
                          'bg-zinc-800 text-zinc-500'}`}>
                        {totalConnected}/3
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">
                            {totalConnected === 3
                                ? 'Wszystkie platformy gotowe do publikacji!'
                                : totalConnected > 0
                                ? `${totalConnected} z 3 platform skonfigurowane`
                                : 'Żadna platforma nie jest jeszcze skonfigurowana'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Posty tworzysz i publikujesz z{' '}
                            <Link href="/lab/calendar" className="text-yellow-400 hover:underline">
                                Kalendarza Postów
                            </Link>
                        </p>
                    </div>
                    <Link
                        href="/lab/calendar"
                        className="ml-auto flex items-center gap-2 text-xs font-bold bg-zinc-800 hover:bg-yellow-400 hover:text-zinc-950 text-white border border-zinc-700 hover:border-yellow-400 px-4 py-2 rounded-lg transition-all"
                    >
                        <CalendarDays size={15} /> Idź do Kalendarza
                    </Link>
                </div>
            )}

            {/* Platformy */}
            {loading ? (
                <p className="text-zinc-500 text-sm">Wczytywanie statusu platform...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <PlatformCard
                        name="Instagram"
                        icon={<Camera size={18} />}
                        color="bg-gradient-to-br from-purple-600 to-pink-500"
                        connected={status!.instagram}
                        steps={SETUP_STEPS.instagram}
                    />
                    <PlatformCard
                        name="Facebook"
                        icon={<Globe size={18} />}
                        color="bg-blue-600"
                        connected={status!.facebook}
                        steps={SETUP_STEPS.facebook}
                    />
                    <PlatformCard
                        name="YouTube"
                        icon={<Play size={18} />}
                        color="bg-red-600"
                        connected={status!.youtube}
                        steps={SETUP_STEPS.youtube}
                    />
                </div>
            )}

            {/* Historia publikacji */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-5">Historia publikacji</h2>

                {loading ? (
                    <p className="text-zinc-500 text-sm">Wczytywanie...</p>
                ) : posts.length === 0 ? (
                    <p className="text-zinc-500 text-sm italic">
                        Brak opublikowanych postów. Wejdź do Kalendarza i kliknij &quot;Opublikuj&quot; na zatwierdzonym poście.
                    </p>
                ) : (
                    <div className="flex flex-col divide-y divide-zinc-800">
                        {posts.map((post) => (
                            <div key={post.id} className="flex items-center gap-4 py-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-200 truncate">{post.topic}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">{post.platform}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {post.ig_post_id && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/20">
                                            IG
                                        </span>
                                    )}
                                    {post.fb_post_id && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                                            FB
                                        </span>
                                    )}
                                    {post.yt_video_id && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                                            YT
                                        </span>
                                    )}
                                </div>

                                <span className="text-xs text-zinc-500 shrink-0">
                                    {post.published_at
                                        ? format(new Date(post.published_at), 'dd MMM yyyy', { locale: pl })
                                        : '—'}
                                </span>

                                {post.ig_post_id && post.ig_post_id.startsWith('http') && (
                                    <a
                                        href={post.ig_post_id}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-600 hover:text-yellow-400 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}

                                {post.fb_post_id && post.fb_post_id.startsWith('http') && (
                                    <a
                                        href={post.fb_post_id}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-600 hover:text-yellow-400 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Plik konfiguracji */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Plik konfiguracji (.env.local)
                </h2>
                <pre className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto leading-relaxed">
{`# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=twoj_token
INSTAGRAM_USER_ID=twoje_ig_user_id

# Facebook Graph API (Strona firmowa)
FACEBOOK_PAGE_ACCESS_TOKEN=twoj_page_token
FACEBOOK_PAGE_ID=twoje_page_id

# YouTube OAuth2 (generowanie metadanych)
YOUTUBE_CLIENT_ID=twoj_client_id
YOUTUBE_CLIENT_SECRET=twoj_client_secret
YOUTUBE_REFRESH_TOKEN=twoj_refresh_token`}
                </pre>
                <p className="text-xs text-zinc-500 mt-3">
                    Pełna instrukcja krok po kroku:{' '}
                    <code className="text-yellow-400">SOCIAL_MEDIA_SETUP.md</code> w folderze głównym WUYO.
                </p>
            </div>
        </div>
    )
}
