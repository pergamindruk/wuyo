import React from 'react'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/lab/Sidebar'
import { Toaster } from 'sonner'
import CommandPalette from '@/components/lab/CommandPalette'
import ShortcutsOverlay from '@/components/lab/ShortcutsOverlay'

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
        <div className="lab-ui min-h-screen text-zinc-50 font-sans flex flex-col md:flex-row md:gap-4 md:p-4">
            <Sidebar userEmail={user.email} />

            {/* Main Content Area */}
            <main className="flex-1 p-4 sm:p-6 lg:px-10 lg:py-8 overflow-y-auto md:h-[calc(100vh-2rem)] print:p-0 print:m-0 print:overflow-visible">
                {children}
            </main>
            <CommandPalette />
            <ShortcutsOverlay />
            <Toaster position="bottom-right" theme="dark" richColors />
        </div>
    )
}
