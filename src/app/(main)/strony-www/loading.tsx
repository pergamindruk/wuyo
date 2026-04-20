export default function StronyWwwLoading() {
    return (
        <main className="min-h-screen bg-navy pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse mb-4" />
                <div className="h-12 w-1/2 bg-white/10 rounded animate-pulse mb-4" />
                <div className="h-5 w-2/3 bg-white/10 rounded animate-pulse mb-16" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card p-8 space-y-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl animate-pulse" />
                            <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                            <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
