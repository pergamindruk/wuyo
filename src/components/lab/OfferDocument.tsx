import Image from 'next/image'
import type { OfferData } from '@/lib/lab/offer'
import { formatDatePl, formatPln } from '@/lib/lab/receipt'

/** Oferta A4: wstęp / zakres / cena / CTA. Jasna, z logo i żółtym akcentem marki. */
export function OfferDocument({ data, id }: { data: OfferData; id?: string }) {
    const valid = new Date(`${data.date}T12:00:00`)
    valid.setDate(valid.getDate() + data.validDays)
    const validIso = valid.toISOString().slice(0, 10)
    return (
        <div id={id} className="mx-auto w-full max-w-[794px] bg-white px-8 py-10 text-[13.5px] leading-relaxed text-zinc-900 sm:px-12">
            <div className="flex items-start justify-between gap-6">
                <Image src="/logo_wuya2.webp" alt="WUYO" width={2866} height={1421} className="h-12 w-auto" />
                <div className="text-right text-[12px] text-zinc-500">
                    <p>Oferta nr <span className="font-semibold text-zinc-900">{data.number}</span></p>
                    <p>{formatDatePl(data.date)} · ważna do {formatDatePl(validIso)}</p>
                </div>
            </div>

            <div className="mt-10">
                <p className="text-[12px] text-zinc-500">Dla: <span className="font-semibold text-zinc-900">{[data.clientName, data.clientCompany].filter(Boolean).join(', ')}</span></p>
                <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight">{data.title}</h1>
                <div className="mt-3 h-1.5 w-16 rounded-full bg-[#FFEB52]" />
            </div>

            <p className="mt-6 whitespace-pre-line text-[14px]">{data.intro}</p>

            <h2 className="mt-8 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-500">Co dostajesz</h2>
            <ul className="mt-3 grid gap-2">
                {data.scope.map((s) => (
                    <li key={s} className="flex gap-3">
                        <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#FFEB52] ring-1 ring-zinc-900/20" />
                        <span>{s}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-zinc-950 p-6 text-white sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Cena</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-[#FFEB52]">{formatPln(data.priceGrosze)}</p>
                    {data.priceNote && <p className="mt-1 text-[12px] text-zinc-400">{data.priceNote}</p>}
                </div>
                {data.timeline && (
                    <div className="sm:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">Termin</p>
                        <p className="mt-1 text-[14px]">{data.timeline}</p>
                    </div>
                )}
            </div>

            <div className="mt-8 rounded-2xl border-2 border-[#FFEB52] p-5">
                <p className="whitespace-pre-line text-[14px] font-medium">{data.cta}</p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-1 border-t border-zinc-200 pt-4 text-[11.5px] text-zinc-500 sm:grid-cols-3">
                <p>Mateusz Machoś · WUYO</p>
                <p>725 182 053 · kontakt@wuyo.pl</p>
                <p className="sm:text-right">wuyo.pl · Rzeszów</p>
            </div>
        </div>
    )
}
