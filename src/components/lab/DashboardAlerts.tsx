'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

type Alert = {
    type: 'danger' | 'warning' | 'success'
    title: string
    description: string
    href: string
}

export function DashboardAlerts({ alerts }: { alerts: Alert[] }) {
    useEffect(() => {
        alerts.forEach((alert, i) => {
            setTimeout(() => {
                if (alert.type === 'danger') {
                    toast.error(alert.title, { description: alert.description })
                } else if (alert.type === 'warning') {
                    toast.warning(alert.title, { description: alert.description })
                } else {
                    toast.success(alert.title, { description: alert.description })
                }
            }, i * 400)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}
