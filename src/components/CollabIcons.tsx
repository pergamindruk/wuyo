// Animowane ikony do drzewka „Współpraca” na stronie głównej (zamiast cyfr 1, 2, 3).
// Rysowane linią: najpierw się „rysują”, potem każda ma swój mały ruch w pętli.
// Start animacji: klasa `odslon-gotowe` na przodku (komponent Odslona). Style: .wsp-*

function Svg({ children }: { children: React.ReactNode }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="wsp-svg">
            {children}
        </svg>
    );
}

/** 01 — Szybki brief: dymek rozmowy, w środku ktoś „pisze”. */
export function BriefIcon() {
    return (
        <Svg>
            <path pathLength={1} className="wsp-rys" d="M10 11H38A4 4 0 0 1 42 15V30A4 4 0 0 1 38 34H22L14 40V34H10A4 4 0 0 1 6 30V15A4 4 0 0 1 10 11Z" />
            <circle className="wsp-kropka" cx="16" cy="22.5" r="2.8" fill="currentColor" stroke="none" />
            <circle className="wsp-kropka wsp-k2" cx="24" cy="22.5" r="2.8" fill="currentColor" stroke="none" />
            <circle className="wsp-kropka wsp-k3" cx="32" cy="22.5" r="2.8" fill="currentColor" stroke="none" />
        </Svg>
    );
}

/** 02 — Projekt i realizacja: ołówek, który rysuje falę.
    Ołówek rysowany poziomo (szpic w punkcie 0,0), potem obrócony o 45° i postawiony
    szpicem na końcu fali. Zewnętrzna grupa jest animowana, wewnętrzna tylko ustawia. */
export function DesignStepIcon() {
    return (
        <Svg>
            <path pathLength={1} className="wsp-fala" d="M6 36C10 28 14 28 17 33S23 40 26 34" />
            <g className="wsp-olowek">
                <g transform="translate(26 34) rotate(-45) scale(0.9)">
                    {/* korpus */}
                    <path pathLength={1} className="wsp-rys" d="M9 -4.5H27V4.5H9" />
                    {/* drewniany szpic */}
                    <path pathLength={1} className="wsp-rys" d="M9 -4.5L0 0L9 4.5" />
                    {/* grafit */}
                    <path d="M0 0L3.2 -1.6V1.6Z" fill="currentColor" stroke="none" />
                    {/* opaska i gumka */}
                    <path pathLength={1} className="wsp-rys wsp-rys-pozno" d="M27 -4.5V4.5M30 -4.5V4.5" />
                    <path pathLength={1} className="wsp-rys wsp-rys-pozno" d="M30 -4.5H32A3 3 0 0 1 35 -1.5V1.5A3 3 0 0 1 32 4.5H30" />
                    {/* przetłoczenie wzdłuż korpusu */}
                    <path pathLength={1} className="wsp-rys wsp-rys-pozno" d="M12 0H24" strokeWidth={1.2} opacity={0.6} />
                </g>
            </g>
        </Svg>
    );
}

/** 03 — Gotowe. Działa.: koło z ptaszkiem i fala „gotowe” rozchodząca się dookoła. */
export function DoneIcon() {
    return (
        <Svg>
            <circle className="wsp-fala-kolo" cx="24" cy="24" r="17" strokeWidth={1.5} />
            <path pathLength={1} className="wsp-rys" d="M24 7A17 17 0 1 1 23.99 7" />
            <path pathLength={1} className="wsp-rys wsp-ptaszek" d="M16 24.5L21.5 30L32.5 18.5" />
        </Svg>
    );
}
