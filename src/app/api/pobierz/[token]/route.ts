import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findDownload } from "@/data/downloads";

const VALID_DAYS = 30;

/**
 * Link z maila. Pierwsze kliknięcie potwierdza adres (confirmed_at),
 * każde kolejne zwiększa licznik pobrań. Plik czytany z /pliki-do-pobrania,
 * więc bez ważnego linku nie da się go ściągnąć.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    if (!/^[a-f0-9]{48}$/.test(token)) return NextResponse.redirect("https://wuyo.pl/blog", 302);

    const db = createAdminClient();
    const { data: row } = await db.from("downloads").select("id, file, created_at, confirmed_at, download_count").eq("token", token).maybeSingle();
    const plik = row ? findDownload(row.file as string) : undefined;
    const expired = row && Date.now() - new Date(row.created_at as string).getTime() > VALID_DAYS * 86_400_000;
    if (!row || !plik || expired) return NextResponse.redirect(plik ? `https://wuyo.pl/pobierz/${plik.slug}?wygasl=1` : "https://wuyo.pl/blog", 302);

    await db.from("downloads").update({
        confirmed_at: row.confirmed_at ?? new Date().toISOString(),
        download_count: (row.download_count as number) + 1,
    }).eq("id", row.id);

    const data = await readFile(path.join(process.cwd(), "pliki-do-pobrania", plik.file));
    return new NextResponse(new Uint8Array(data), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${plik.file}"`,
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex",
        },
    });
}
