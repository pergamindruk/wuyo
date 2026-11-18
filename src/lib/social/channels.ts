// Wspólne typy i reguły kanałów social media (bez sekretów — import także w komponentach klienckich).

export const BRANDS = ['WUYO', 'Pergamin Studio', 'Prompteusz'] as const
export type Brand = (typeof BRANDS)[number]

export type Platform = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'inna'

/** Skąd pochodzi kanał: Postiz albo bezpośrednie Graph API (zapas, tylko WUYO). */
export type ChannelSource = 'postiz' | 'graph'

export type SocialChannel = {
    /** Postiz: id integracji. Graph: „graph:facebook” / „graph:instagram”. */
    id: string
    name: string
    platform: Platform
    /** Identyfikator dostawcy w Postiz (np. „instagram-standalone”), potrzebny do ustawień posta. */
    provider: string
    brand: Brand
    picture?: string
    source: ChannelSource
    /** Kanał widoczny, ale nie do wyboru (np. YouTube, dopóki panel nie obsługuje wideo). */
    disabled?: boolean
    disabledReason?: string
}

export type ChannelsResponse = {
    channels: SocialChannel[]
    postiz: { configured: boolean; online: boolean; error?: string }
}

/** Limity znaków opisu posta. */
export const CHAR_LIMITS: Record<Platform, number> = {
    facebook: 63206,
    instagram: 2200,
    tiktok: 2200,
    youtube: 5000,
    inna: 2200,
}

export const PLATFORM_LABEL: Record<Platform, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    inna: 'Inna',
}

export function platformFromProvider(provider: string): Platform {
    const p = provider.toLowerCase()
    if (p.startsWith('instagram')) return 'instagram'
    if (p.startsWith('facebook')) return 'facebook'
    if (p.startsWith('tiktok')) return 'tiktok'
    if (p.startsWith('youtube')) return 'youtube'
    return 'inna'
}

/** Marka po nazwie klienta w Postiz albo nazwie konta; domyślnie WUYO. */
export function brandFromName(...names: (string | undefined | null)[]): Brand {
    const s = names.filter(Boolean).join(' ').toLowerCase()
    if (s.includes('pergamin')) return 'Pergamin Studio'
    if (s.includes('prompteusz')) return 'Prompteusz'
    return 'WUYO'
}

/** Najniższy limit znaków wśród wybranych kanałów (domyślnie IG, bo najczęstszy). */
export function charLimitFor(platforms: Platform[]): number {
    if (platforms.length === 0) return CHAR_LIMITS.instagram
    return Math.min(...platforms.map((p) => CHAR_LIMITS[p]))
}
