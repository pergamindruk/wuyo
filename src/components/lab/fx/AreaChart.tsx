/**
 * Wykres warstwowy w stylu panelu: świecąca żółta linia + gradient pod spodem, rysuje się przy wejściu.
 * Czyste SVG (komponent serwerowy), bez bibliotek. values = punkty od lewej do prawej.
 */
type Props = {
    id: string
    values: number[]
    width?: number
    height?: number
    /** Ile punktów ma mieć cała oś (np. dni miesiąca); wartości rysują się od lewej, reszta osi zostaje pusta. */
    slots?: number
    /** Podpis przy ostatnim punkcie (dymek), np. „24.11 · 4 200 zł”. */
    label?: string
    strokeWidth?: number
    className?: string
}

function smoothPath(pts: [number, number][]) {
    if (pts.length < 2) return ''
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i - 1] ?? pts[i]
        const [x1, y1] = pts[i]
        const [x2, y2] = pts[i + 1]
        const [x3, y3] = pts[i + 2] ?? pts[i + 1]
        const c1x = x1 + (x2 - x0) / 6, c1y = y1 + (y2 - y0) / 6
        const c2x = x2 - (x3 - x1) / 6, c2y = y2 - (y3 - y1) / 6
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`
    }
    return d
}

export function AreaChart({ id, values, width = 600, height = 160, slots, label, strokeWidth = 3, className = '' }: Props) {
    const n = Math.max(slots ?? values.length, 2)
    const data = values.length >= 2 ? values : [values[0] ?? 0, values[0] ?? 0]
    const max = Math.max(...data, 1)
    const pad = strokeWidth * 2 + 4
    const top = label ? 46 : pad
    const pts: [number, number][] = data.map((v, i) => [
        (i / (n - 1)) * (width - pad * 2) + pad,
        height - pad - (v / max) * (height - pad - top),
    ])
    const line = smoothPath(pts)
    const last = pts[pts.length - 1]
    const area = `${line} L ${last[0].toFixed(1)} ${height} L ${pts[0][0].toFixed(1)} ${height} Z`
    const len = Math.round(width * 1.6)

    const xPct = (last[0] / width) * 100
    const yPct = (last[1] / height) * 100

    return (
        <div className={`relative ${className}`}>
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="block h-full w-full" aria-hidden="true">
            <defs>
                <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FFD60A" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="#FFD60A" stopOpacity="0" />
                </linearGradient>
                <filter id={`${id}-glow`} x="-10%" y="-50%" width="120%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d={area} fill={`url(#${id}-fill)`} className="lab-area" />
            <path d={line} fill="none" stroke="#FFD60A" strokeWidth={strokeWidth} strokeLinecap="round"
                filter={`url(#${id}-glow)`} className="lab-draw" style={{ ['--len' as string]: len }} vectorEffect="non-scaling-stroke" />
            {label && (
                <line x1={last[0]} x2={last[0]} y1={last[1]} y2={height} stroke="rgba(255,255,255,.25)" strokeDasharray="4 5"
                    vectorEffect="non-scaling-stroke" className="lab-area" />
            )}
        </svg>
        {label && (
            <div className="lab-area pointer-events-none absolute" style={{ left: `${xPct}%`, top: `${yPct}%` }}>
                <span className="lab-ping absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full bg-[#FFD60A]/50" />
                <span className="absolute -left-[9px] -top-[9px] h-[18px] w-[18px] rounded-full border-[3px] border-[#FFD60A] bg-[#0b0b0d]" />
                <span className={`absolute bottom-4 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-lg ${xPct > 80 ? 'right-0' : '-translate-x-1/2'}`}>
                    {label}
                </span>
            </div>
        )}
        </div>
    )
}
