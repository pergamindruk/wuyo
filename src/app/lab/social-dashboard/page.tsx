import { redirect } from 'next/navigation'

// Social Dashboard połączony z Kalendarzem: plan tygodnia, pisanie i publikacja są teraz w /lab/calendar.
export default function SocialDashboardPage() {
    redirect('/lab/calendar')
}
