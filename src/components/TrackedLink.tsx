"use client";

import Link from "next/link";
import { trackWhatsAppClick, trackPhoneClick } from "@/lib/tracking";

type TrackType = "whatsapp" | "phone";

interface Props {
    href: string;
    trackAs: TrackType;
    className?: string;
    children: React.ReactNode;
    target?: string;
    rel?: string;
}

const handlers: Record<TrackType, () => void> = {
    whatsapp: trackWhatsAppClick,
    phone: trackPhoneClick,
};

export function TrackedLink({ href, trackAs, className, children, target, rel }: Props) {
    return (
        <Link href={href} onClick={handlers[trackAs]} className={className} target={target} rel={rel}>
            {children}
        </Link>
    );
}
