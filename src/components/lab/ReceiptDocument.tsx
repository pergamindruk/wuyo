import { KIND_LABEL, LEGAL, amountInWords, formatDatePl, formatPln, type ReceiptData } from '@/lib/lab/receipt'

/** Dokument do druku (A4): stały układ, czarno na białym, bez ozdobników. */
export function ReceiptDocument({ data, id }: { data: ReceiptData; id?: string }) {
    const isProtocol = data.kind === 'protokol'
    return (
        <div id={id} className="mx-auto w-full max-w-[794px] bg-white px-8 py-10 font-sans text-[13px] leading-relaxed text-zinc-900 sm:px-12 print:max-w-none print:px-0 print:py-0">
            <div className="flex items-start justify-between gap-6 border-b-2 border-zinc-900 pb-5">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{KIND_LABEL[data.kind]}</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">nr {data.number}</h1>
                </div>
                <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5 text-right text-[12px]">
                    <dt className="text-zinc-500">Miejsce wystawienia</dt><dd className="font-medium">{data.place}</dd>
                    <dt className="text-zinc-500">Data wystawienia</dt><dd className="font-medium">{formatDatePl(data.issueDate)}</dd>
                    <dt className="text-zinc-500">{isProtocol ? 'Data odbioru' : 'Data wykonania usługi'}</dt><dd className="font-medium">{formatDatePl(data.saleDate)}</dd>
                </dl>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-8">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{isProtocol ? 'Wykonawca' : 'Sprzedawca'}</p>
                    {data.seller.map((l, i) => <p key={i} className={i === 0 ? 'mt-1 font-semibold' : ''}>{l}</p>)}
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{isProtocol ? 'Zamawiający' : 'Nabywca'}</p>
                    {data.buyer.map((l, i) => <p key={i} className={i === 0 ? 'mt-1 font-semibold' : ''}>{l}</p>)}
                </div>
            </div>

            <table className="mt-8 w-full border-collapse text-[12px]">
                <thead>
                    <tr className="border-y border-zinc-900 text-left">
                        <th className="w-10 py-2 font-semibold">Lp.</th>
                        <th className="py-2 font-semibold">Nazwa usługi</th>
                        <th className="w-16 py-2 text-center font-semibold">J.m.</th>
                        <th className="w-14 py-2 text-center font-semibold">Ilość</th>
                        {!isProtocol && <th className="w-32 py-2 text-right font-semibold">Wartość</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((it, i) => (
                        <tr key={i} className="border-b border-zinc-200">
                            <td className="py-2.5 align-top">{i + 1}</td>
                            <td className="py-2.5 pr-4 align-top">{it.name}</td>
                            <td className="py-2.5 text-center align-top">{it.unit}</td>
                            <td className="py-2.5 text-center align-top">{it.qty}</td>
                            {!isProtocol && <td className="py-2.5 text-right align-top tabular-nums">{formatPln(it.amountGrosze)}</td>}
                        </tr>
                    ))}
                    {!isProtocol && data.advanceGrosze > 0 && (
                        <tr className="border-b border-zinc-200 text-zinc-600">
                            <td className="py-2.5" />
                            <td className="py-2.5" colSpan={3}>Zaliczka wpłacona wcześniej</td>
                            <td className="py-2.5 text-right tabular-nums">−{formatPln(data.advanceGrosze)}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!isProtocol && (
                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-sm rounded-md bg-zinc-100 px-5 py-4 print:bg-zinc-100">
                        <div className="flex items-baseline justify-between">
                            <span className="text-[12px] font-semibold uppercase tracking-wider">Do zapłaty</span>
                            <span className="text-xl font-bold tabular-nums">{formatPln(data.totalGrosze)}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-600">Słownie: {amountInWords(data.totalGrosze)}</p>
                    </div>
                </div>
            )}

            {!isProtocol && (
                <p className="mt-4 text-[12px]">
                    <span className="text-zinc-500">Sposób zapłaty:</span> {data.payment}
                    {data.payment === 'przelew' && data.dueDays > 0 && <> · <span className="text-zinc-500">termin:</span> {data.dueDays} dni od daty wystawienia</>}
                </p>
            )}

            {data.notes && (
                <div className="mt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Uwagi</p>
                    <p className="mt-1 whitespace-pre-line">{data.notes}</p>
                </div>
            )}

            <div className="mt-6 space-y-1 border-t border-zinc-200 pt-4 text-[11px] italic text-zinc-600">
                {LEGAL[data.kind].map((l) => <p key={l}>{l}</p>)}
            </div>

            <div className="mt-16 grid grid-cols-2 gap-16 text-center text-[11px] text-zinc-500">
                <div><div className="border-t border-zinc-400 pt-2">{isProtocol ? 'Podpis Wykonawcy' : 'Podpis Sprzedawcy'}</div></div>
                <div><div className="border-t border-zinc-400 pt-2">{isProtocol ? 'Podpis Zamawiającego' : 'Podpis Nabywcy'}</div></div>
            </div>
        </div>
    )
}
