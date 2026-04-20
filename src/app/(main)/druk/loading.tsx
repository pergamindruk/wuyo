export default function DrukLoading() {
    return (
        <main className="min-h-screen bg-navy pt-32 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse mb-4" />
                <div className="h-12 w-1/2 bg-white/10 rounded animate-pulse mb-4" />
                <div className="h-5 w-2/3 bg-white/10 rounded animate-pulse mb-16" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card p-6 space-y-3">
                            <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
                            <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
                            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
