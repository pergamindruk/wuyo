/** Ładowanie podstrony /lab: szkielety kart w kształcie ekranu, pulsują do czasu danych. */
function Bone({ className = '' }: { className?: string }) {
    return <span className={`block rounded-full bg-white/[0.06] ${className}`} />
}

export default function LabLoading() {
    return (
        <div className="mx-auto flex max-w-7xl animate-pulse flex-col gap-5 lg:gap-6" aria-busy="true" aria-live="polite">
            <span className="sr-only">Ładuję…</span>

            {/* Nagłówek */}
            <div className="flex items-center gap-4">
                <span className="h-12 w-12 shrink-0 rounded-2xl bg-yellow-400/20 sm:h-14 sm:w-14" />
                <div className="flex flex-col gap-2.5">
                    <Bone className="h-3 w-32" />
                    <Bone className="h-7 w-56 sm:h-9 sm:w-72" />
                </div>
            </div>

            {/* Rząd liczb */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="lab-card p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <span className="h-11 w-11 shrink-0 rounded-2xl bg-white/[0.07] sm:h-14 sm:w-14" />
                            <div className="flex flex-1 flex-col gap-2">
                                <Bone className="h-2.5 w-3/4" />
                                <Bone className="h-6 w-10" />
                            </div>
                        </div>
                        <span className="mt-4 block h-12 rounded-2xl bg-gradient-to-t from-yellow-400/[0.07] to-transparent" />
                    </div>
                ))}
            </div>

            {/* Duże karty */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
                <div className="lab-card p-6 lg:col-span-3">
                    <Bone className="h-3 w-28" />
                    <Bone className="mt-4 h-9 w-48" />
                    <Bone className="mt-5 h-3 w-2/3" />
                    <span className="mt-6 block h-32 rounded-2xl bg-gradient-to-t from-yellow-400/[0.08] to-transparent" />
                </div>
                <div className="flex min-h-56 flex-col justify-center gap-3 rounded-[1.75rem] bg-yellow-400/[0.12] p-6 ring-1 ring-yellow-400/20 lg:col-span-2">
                    <span className="block h-3 w-28 rounded-full bg-yellow-400/25" />
                    <span className="block h-8 w-3/4 rounded-full bg-yellow-400/25" />
                    <span className="mt-4 block h-12 w-full rounded-full bg-yellow-400/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="lab-card flex flex-col gap-3 p-6">
                        <Bone className="h-4 w-1/3" />
                        <span className="h-12 rounded-2xl bg-white/[0.04]" />
                        <span className="h-12 rounded-2xl bg-white/[0.04]" />
                        <span className="h-12 rounded-2xl bg-white/[0.04]" />
                    </div>
                ))}
            </div>
        </div>
    )
}
