/** Link „Przejdź do treści” dla poruszających się klawiaturą (WCAG). Widoczny dopiero po Tab. */
export function SkipLink({ label }: { label: string }) {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-gold focus:text-navy-dark focus:px-4 focus:py-2 focus:rounded-full focus:font-bold focus:text-sm focus:shadow-lg"
        >
            {label}
        </a>
    );
}
