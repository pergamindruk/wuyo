import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Pliki od klientów (logo, teksty, zdjęcia) w PRYWATNYM buckecie Supabase „pliki-klientow”.
 * Nigdy publiczny URL: klient wrzuca przez jednorazowy podpisany link do wysyłki,
 * Mateusz pobiera przez link ważny 1 godzinę. Ścieżka: <projectId>/<czas>-<nazwa>.
 * Darmowy plan Supabase: 1 GB na wszystkie pliki, limit 25 MB na plik.
 */
export const CLIENT_BUCKET = 'pliki-klientow'
export const MAX_FILE_BYTES = 25 * 1024 * 1024
export const MAX_FILES_PER_PROJECT = 40

export type ClientFile = { path: string; name: string; size: number; createdAt: string }

const PROJECT_RE = /^[a-z0-9]{6,20}$/

/** Nazwa pliku bez polskich znaków, spacji i ścieżek (Storage nie lubi znaków spoza ASCII). */
export function safeFileName(name: string): string {
    const base = name.split(/[\\/]/).pop() ?? 'plik'
    const clean = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
        .replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    return (clean || 'plik').slice(-80)
}

/** Nazwa do wyświetlenia: bez prefiksu czasu. */
export function displayName(path: string): string {
    return (path.split('/').pop() ?? path).replace(/^\d{13}-/, '')
}

export async function projectExists(projectId: string): Promise<boolean> {
    if (!PROJECT_RE.test(projectId)) return false
    const { data } = await createAdminClient().from('projects').select('id').eq('id', projectId).maybeSingle()
    return !!data
}

export async function listClientFiles(projectId: string): Promise<ClientFile[]> {
    if (!PROJECT_RE.test(projectId)) return []
    const { data } = await createAdminClient().storage.from(CLIENT_BUCKET)
        .list(projectId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })
    return (data ?? []).filter((f) => f.id).map((f) => ({
        path: `${projectId}/${f.name}`,
        name: displayName(f.name),
        size: Number((f.metadata as { size?: number } | null)?.size ?? 0),
        createdAt: f.created_at ?? '',
    }))
}

export async function createUploadUrl(projectId: string, fileName: string): Promise<{ path: string; token: string } | null> {
    const path = `${projectId}/${Date.now()}-${safeFileName(fileName)}`
    const { data, error } = await createAdminClient().storage.from(CLIENT_BUCKET).createSignedUploadUrl(path)
    if (error || !data) return null
    return { path, token: data.token }
}

export async function createDownloadUrl(path: string): Promise<string | null> {
    const { data } = await createAdminClient().storage.from(CLIENT_BUCKET).createSignedUrl(path, 3600, { download: displayName(path) })
    return data?.signedUrl ?? null
}

export async function removeClientFile(path: string): Promise<boolean> {
    const { error } = await createAdminClient().storage.from(CLIENT_BUCKET).remove([path])
    return !error
}

export function formatBytes(n: number): string {
    if (n < 1024) return `${n} B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
    return `${(n / 1024 / 1024).toFixed(1)} MB`
}
