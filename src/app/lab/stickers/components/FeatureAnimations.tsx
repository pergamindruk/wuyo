/**
 * Sześć małych animacji SVG: co robi Sticker Studio, krok po kroku.
 * Bez "use client": to sam SVG i CSS, nic tu nie reaguje na kliknięcia.
 */

const CSS = `
.fa svg { width: 100%; height: auto; display: block; }
.fa-pop { transform-origin: 60px 42px; animation: fa-pop 3.2s ease-in-out infinite; }
.fa-spark { animation: fa-spark 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
.fa-spark:nth-of-type(2) { animation-delay: .5s; } .fa-spark:nth-of-type(3) { animation-delay: 1s; }
.fa-bg { animation: fa-fade 3.2s ease-in-out infinite; }
.fa-march { stroke-dasharray: 4 3; animation: fa-march 1.2s linear infinite; }
.fa-grow { transform-origin: 60px 42px; animation: fa-grow 3.2s ease-in-out infinite; }
.fa-slot { opacity: 0; animation: fa-slot 4s ease-out infinite; }
.fa-slot:nth-of-type(2) { animation-delay: .35s; } .fa-slot:nth-of-type(3) { animation-delay: .7s; }
.fa-slot:nth-of-type(4) { animation-delay: 1.05s; } .fa-slot:nth-of-type(5) { animation-delay: 1.4s; }
.fa-slot:nth-of-type(6) { animation-delay: 1.75s; }
.fa-gloss { animation: fa-gloss 3s ease-in-out infinite; }
.fa-roll { transform-box: fill-box; transform-origin: center; animation: fa-roll 1s linear infinite; }
@keyframes fa-pop { 0%,15% { transform: scale(.2); opacity: 0 } 35%,85% { transform: scale(1); opacity: 1 } 100% { transform: scale(1); opacity: 0 } }
@keyframes fa-spark { 0%,100% { transform: scale(.4); opacity: .2 } 50% { transform: scale(1.1); opacity: 1 } }
@keyframes fa-fade { 0%,25% { opacity: 1 } 55%,85% { opacity: 0 } 100% { opacity: 1 } }
@keyframes fa-march { to { stroke-dashoffset: -14 } }
@keyframes fa-grow { 0%,20% { transform: scale(.82) } 50%,80% { transform: scale(1) } 100% { transform: scale(.82) } }
@keyframes fa-slot { 0% { opacity: 0; transform: translateY(-8px) } 15%,80% { opacity: 1; transform: none } 100% { opacity: 0 } }
@keyframes fa-gloss { 0% { transform: translateX(-70px) } 60%,100% { transform: translateX(90px) } }
@keyframes fa-roll { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) { .fa * { animation: none !important; opacity: 1 !important; } }
`

const BLOB = 'M60 18c10 0 14 8 22 10s14 8 12 18-10 12-12 18-12 12-22 10-16-4-22-10-12-10-10-18 6-14 12-18 10-10 20-10z'
const CUT = 'M60 11c12 0 17 8 25 11s19 9 16 23-12 15-14 21-14 16-27 14-19-6-25-13-15-12-12-22 8-17 14-21 11-13 23-13z'

const items = [
    {
        title: 'Gemini rysuje',
        text: 'Opisujesz naklejkę, Gemini 3 Pro Image robi grafikę 2K na białym tle.',
        svg: (
            <>
                <g className="fa-pop"><path d={BLOB} fill="#facc15" stroke="#18181b" strokeWidth="2.5" /><circle cx="52" cy="38" r="3" fill="#18181b" /><circle cx="68" cy="38" r="3" fill="#18181b" /><path d="M52 50q8 7 16 0" stroke="#18181b" strokeWidth="2.5" fill="none" strokeLinecap="round" /></g>
                <path className="fa-spark" d="M18 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fde047" />
                <path className="fa-spark" d="M100 14l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#fde047" />
                <path className="fa-spark" d="M104 62l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#fde047" />
            </>
        ),
    },
    {
        title: 'Tło znika',
        text: 'Białe tło wycina się samo. Wgrany PNG z przezroczystością zostaje jak jest.',
        svg: (
            <>
                <defs><pattern id="fa-chk" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#27272a" /><rect width="4" height="4" fill="#3f3f46" /><rect x="4" y="4" width="4" height="4" fill="#3f3f46" /></pattern></defs>
                <rect x="20" y="6" width="80" height="72" rx="6" fill="url(#fa-chk)" />
                <rect className="fa-bg" x="20" y="6" width="80" height="72" rx="6" fill="#fafafa" />
                <path d={BLOB} fill="#fb7185" stroke="#18181b" strokeWidth="2.5" />
            </>
        ),
    },
    {
        title: 'Obwódka i kontur',
        text: 'Linia cięcia idzie w równej odległości od grafiki. Offset i spad ustawiasz w mm.',
        svg: (
            <>
                <path className="fa-grow" d={CUT} fill="#fafafa" />
                <path d={BLOB} fill="#38bdf8" stroke="#18181b" strokeWidth="2.5" />
                <path className="fa-grow fa-march" d={CUT} fill="none" stroke="#ef4444" strokeWidth="1.6" />
            </>
        ),
    },
    {
        title: 'Skład na A4',
        text: 'Naklejki układają się na arkuszu same, z dala od znaczników rejestracyjnych.',
        svg: (
            <>
                <rect x="36" y="2" width="48" height="80" rx="2" fill="#fafafa" />
                <rect x="38" y="4" width="4" height="4" fill="#18181b" />
                <path d="M68 5h14v14M38 66v14h14" stroke="#18181b" strokeWidth="1.4" fill="none" />
                {[[46, 22], [62, 22], [46, 38], [62, 38], [46, 54], [62, 54]].map(([x, y], i) => (
                    <rect key={i} className="fa-slot" x={x} y={y} width="12" height="12" rx="4" fill={['#facc15', '#fb7185', '#38bdf8', '#a3e635', '#c084fc', '#fb923c'][i]} stroke="#ef4444" strokeWidth=".8" />
                ))}
            </>
        ),
    },
    {
        title: 'Laminat',
        text: 'Po druku na Epsonie L18050 folia błyszcząca albo matowa z laminatora rolowego.',
        svg: (
            <>
                <defs>
                    <clipPath id="fa-sheet"><rect x="22" y="14" width="76" height="56" rx="3" /></clipPath>
                    <linearGradient id="fa-shine" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".75" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
                </defs>
                <rect x="22" y="14" width="76" height="56" rx="3" fill="#fafafa" />
                <circle cx="42" cy="34" r="9" fill="#facc15" /><circle cx="78" cy="34" r="9" fill="#38bdf8" /><circle cx="60" cy="54" r="9" fill="#fb7185" />
                <g clipPath="url(#fa-sheet)"><rect className="fa-gloss" x="22" y="0" width="26" height="90" fill="url(#fa-shine)" transform="skewX(-20)" /></g>
                <g className="fa-roll"><circle cx="60" cy="8" r="6" fill="#52525b" /><path d="M60 3v10" stroke="#a1a1aa" strokeWidth="1.5" /></g>
            </>
        ),
    },
    {
        title: 'Cameo 5 tnie',
        text: 'DXF 1:1 w mm do Silhouette Studio Basic. Kamera czyta znaczniki, nóż jedzie po linii.',
        svg: (
            <>
                <path d={CUT} fill="#fafafa" />
                <path d={BLOB} fill="#a3e635" stroke="#18181b" strokeWidth="2.5" />
                <path d={CUT} fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="3 3" />
                <g>
                    <circle r="3.5" fill="#18181b" stroke="#fde047" strokeWidth="1.5" />
                    <animateMotion dur="4s" repeatCount="indefinite" path={CUT} />
                </g>
            </>
        ),
    },
]

export default function FeatureAnimations() {
    return (
        <section className="fa">
            <style>{CSS}</style>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Jak to działa</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {items.map((it, i) => (
                    <div key={it.title} className="lab-card lab-hover p-4">
                        <div className="mb-3 rounded-2xl bg-zinc-950/60 p-2">
                            <svg viewBox="0 0 120 84" aria-hidden="true">{it.svg}</svg>
                        </div>
                        <p className="text-xs font-semibold text-white"><span className="mr-1.5 text-yellow-400">{i + 1}.</span>{it.title}</p>
                        <p className="mt-1 text-[11px] leading-snug text-zinc-400">{it.text}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
