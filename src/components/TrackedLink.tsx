import Link from "next/link";

// Kliknięcia w telefon i WhatsApp liczy globalny nasłuch w PageTracker.
// `trackAs` zostaje tylko jako opis intencji w miejscu użycia.
type TrackType = "whatsapp" | "phone";

interface Props {
    href: string;
    trackAs: TrackType;
    className?: string;
    children: React.ReactNode;
    target?: string;
    rel?: string;
}

export function TrackedLink({ href, className, children, target, rel }: Props) {
    return (
        <Link href={href} className={className} target={target} rel={rel}>
            {children}
        </Link>
    );
}
