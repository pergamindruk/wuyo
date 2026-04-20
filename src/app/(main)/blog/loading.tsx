export default function BlogLoading() {
    return (
        <main className="min-h-screen bg-navy pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-4" />
                <div className="h-10 w-2/3 bg-white/10 rounded animate-pulse mb-16" />
                <div className="grid gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card p-8 flex gap-6">
                            <div className="w-48 h-32 bg-white/10 rounded-xl animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                                <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse" />
                                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                                <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
