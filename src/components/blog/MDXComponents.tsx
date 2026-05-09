import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

export const mdxComponents = {
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="text-3xl font-bold text-white mb-4 mt-10 font-syne" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="text-2xl font-bold text-white mb-3 mt-8 font-syne" {...props} />
    ),
    h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h4 className="text-xl font-bold text-white mb-2 mt-6" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="text-white/70 leading-relaxed mb-4" {...props} />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
        <strong className="text-white font-bold" {...props} />
    ),
    em: (props: React.HTMLAttributes<HTMLElement>) => (
        <em className="text-white/80 italic" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="space-y-2 mb-6 ml-1" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
        <ol className="space-y-2 mb-6 ml-4 list-decimal text-white/70" {...props} />
    ),
    li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="flex items-start gap-2 text-white/70 text-sm" {...props}>
            <span className="text-gold font-bold shrink-0 mt-0.5">→</span>
            <span>{children}</span>
        </li>
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote className="border-l-2 border-gold pl-4 my-6 text-white/60 italic" {...props} />
    ),
    hr: () => <hr className="border-white/10 my-10" />,
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a className="text-gold hover:text-gold/80 underline underline-offset-2 transition-colors" {...props} />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="overflow-x-auto my-8">
            <table className="w-full border-collapse text-sm" {...props} />
        </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead className="bg-white/5" {...props} />
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="px-4 py-3 text-left text-gold font-bold border border-white/10" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="px-4 py-3 text-white/70 border border-white/10" {...props} />
    ),
    tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr className="hover:bg-white/3 transition-colors" {...props} />
    ),

    // Custom komponenty dostępne w MDX
    Callout: ({ children, type = "info" }: { children: ReactNode; type?: "info" | "warning" | "success" }) => (
        <div className={`glass-card p-5 border-l-2 my-6 flex items-start gap-3 ${
            type === "warning" ? "border-yellow-400" :
            type === "success" ? "border-green-400" : "border-gold"
        }`}>
            {type === "warning" && <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" aria-hidden="true" />}
            {type === "info" && <Info size={16} className="text-gold shrink-0 mt-0.5" aria-hidden="true" />}
            {type === "success" && <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" aria-hidden="true" />}
            <div className="text-white/70 text-sm leading-relaxed">{children}</div>
        </div>
    ),

    GreenRed: ({ green, red }: { green: string; red: string }) => (
        <div className="grid md:grid-cols-2 gap-3 my-4">
            <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-green-300/80 text-xs leading-relaxed">{green}</p>
            </div>
            <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 flex items-start gap-2">
                <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-red-300/70 text-xs leading-relaxed">{red}</p>
            </div>
        </div>
    ),

    PriceCard: ({ title, price, desc, tag }: { title: string; price: string; desc: string; tag?: string }) => (
        <div className="glass-card p-6 space-y-2 my-2">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="font-bold text-white text-sm">{title}</p>
                    <p className="text-gold font-bold text-xl mt-1">{price}</p>
                </div>
                {tag && <span className="eyebrow text-[10px] shrink-0 mt-1">{tag}</span>}
            </div>
            <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
        </div>
    ),

    CheckItem: ({ children, ok = true }: { children: ReactNode; ok?: boolean }) => (
        <div className="flex items-start gap-2 py-1">
            {ok
                ? <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                : <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
            }
            <span className="text-white/70 text-sm">{children}</span>
        </div>
    ),

    CTABox: ({ text, href, label }: { text: string; href: string; label: string }) => (
        <div className="glass-card p-6 my-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold/20">
            <p className="text-white/80 font-medium text-sm text-center sm:text-left">{text}</p>
            <a
                href={href}
                className="shrink-0 bg-[#ffeb52] text-[#1c1b17] font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#ffe000] transition-colors whitespace-nowrap"
            >
                {label}
            </a>
        </div>
    ),
};
