export default function CennikLoading() {
    return (
        <main className="min-h-screen bg-navy pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse mb-4" />
                <div className="h-12 w-2/5 bg-white/10 rounded animate-pulse mb-16" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-8 space-y-5">
                            <div className="h-6 w-1/2 bg-white/10 rounded animate-pulse" />
                            <div className="h-10 w-2/3 bg-white/10 rounded animate-pulse" />
                            <div className="space-y-2">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="h-4 w-full bg-white/10 rounded animate-pulse" />
                                ))}
                            </div>
                            <div className="h-12 w-full bg-white/10 rounded-full animate-pulse mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
