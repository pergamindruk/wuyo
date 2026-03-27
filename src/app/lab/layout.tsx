import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/lab/Sidebar'

export default async function LabLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Jeśli nie ma użytkownika, nie wyświetlamy sidebar-u (np. na stronie logowania)
    if (!user) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col md:flex-row">
            <Sidebar userEmail={user.email} />

            {/* Main Content Area */}
            <main className="flex-1 p-6 lg:p-10 overflow-y-auto md:h-screen print:p-0 print:m-0 print:overflow-visible">
                {children}
            </main>
        </div>
    )
}
