import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, History, Shield, RefreshCw } from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/lab/ui/PageHeader";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
    login: "Logowanie",
    lead_status_change: "Zmiana statusu leada",
    lead_delete: "Usunięcie leada",
    project_create: "Nowy projekt",
    project_update: "Aktualizacja projektu",
    project_delete: "Usunięcie projektu",
    finance_add: "Dodanie transakcji",
    finance_delete: "Usunięcie transakcji",
    post_publish: "Publikacja posta",
    post_schedule: "Zaplanowanie posta",
    calendar_event_add: "Dodanie eventu",
    calendar_event_delete: "Usunięcie eventu",
};

const ACTION_COLORS: Record<string, string> = {
    login: "bg-white/[0.06] text-zinc-300",
    lead_status_change: "bg-yellow-400/15 text-yellow-300",
    lead_delete: "bg-red-400/15 text-red-300",
    project_create: "bg-emerald-400/15 text-emerald-300",
    project_update: "bg-yellow-400/15 text-yellow-300",
    project_delete: "bg-red-400/15 text-red-300",
    finance_add: "bg-emerald-400/15 text-emerald-300",
    finance_delete: "bg-red-400/15 text-red-300",
    post_publish: "bg-emerald-400/15 text-emerald-300",
    post_schedule: "bg-yellow-400/15 text-yellow-300",
    calendar_event_add: "bg-emerald-400/15 text-emerald-300",
    calendar_event_delete: "bg-red-400/15 text-red-300",
};

/** Kolor kropki przy wierszu, zgodny z pigułką akcji. */
const DOT: Record<string, string> = {
    "bg-yellow-400/15 text-yellow-300": "bg-yellow-400",
    "bg-red-400/15 text-red-300": "bg-red-400",
    "bg-emerald-400/15 text-emerald-300": "bg-emerald-400",
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pl-PL", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default async function AuditLogPage() {
    let logs: Array<{ id: string; action: string; details: Record<string, unknown>; created_at: string }> = [];
    let error: string | null = null;

    try {
        const supabase = await createClient();
        const { data, error: dbError } = await supabase
            .from("audit_log")
            .select("id, action, details, created_at")
            .order("created_at", { ascending: false })
            .limit(200);

        if (dbError) {
            if (dbError.code === "42P01") {
                error = "Tabela audit_log nie istnieje. Uruchom migrację SQL.";
            } else {
                error = dbError.message;
            }
        } else {
            logs = data ?? [];
        }
    } catch (e) {
        error = e instanceof Error ? e.message : "Nieznany błąd";
    }

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <PageHeader
                icon={Shield}
                title="Dziennik zmian"
                subtitle="Ostatnie 200 akcji w panelu: logowania, zmiany leadów, projekty, finanse i posty."
                actions={
                    <Link href="/lab/audit-log" className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200">
                        <RefreshCw size={16} strokeWidth={1.8} /> Odśwież
                    </Link>
                }
            />

            {error && (
                <div className="lab-card border-red-400/30 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-400/15 text-red-300"><AlertTriangle size={18} strokeWidth={1.8} /></span>
                        <div>
                            <p className="text-sm font-semibold text-red-300">Błąd ładowania logów</p>
                            <p className="text-xs text-red-300/70">{error}</p>
                        </div>
                    </div>
                    {error.includes("audit_log") && (
                        <details className="mt-4">
                            <summary className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-yellow-300">Pokaż SQL do uruchomienia w Supabase</summary>
                            <pre className="mt-3 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-relaxed text-zinc-400">{`CREATE TABLE IF NOT EXISTS audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Index dla sortowania po dacie
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx
  ON audit_log (created_at DESC);

-- RLS: tylko zalogowany user może czytać i pisać
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_read" ON audit_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_insert" ON audit_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');`}</pre>
                        </details>
                    )}
                </div>
            )}

            {!error && logs.length === 0 && (
                <div className="lab-card flex flex-col items-center gap-3 p-12 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500"><Shield size={22} strokeWidth={1.8} /></span>
                    <p className="font-semibold text-white">Brak zdarzeń w logu</p>
                    <p className="text-sm text-zinc-500">Zdarzenia pojawią się po wykonaniu akcji w panelu.</p>
                </div>
            )}

            {logs.length > 0 && (
                <section className="lab-card p-5 sm:p-6">
                    <SectionTitle icon={History} title={`Ostatnie zdarzenia · ${logs.length}`} />
                    <ul className="flex flex-col gap-2">
                        {logs.map((log) => {
                            const color = ACTION_COLORS[log.action] ?? "bg-white/[0.06] text-zinc-300";
                            return (
                                <li
                                    key={log.id}
                                    className="flex items-start gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.06]"
                                >
                                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${DOT[color] ?? "bg-zinc-500"}`} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${color}`}>
                                                {ACTION_LABELS[log.action] ?? log.action}
                                            </span>
                                            <span className="text-xs tabular-nums text-zinc-500">{formatDate(log.created_at)}</span>
                                        </div>
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <p className="mt-1.5 truncate font-mono text-xs text-zinc-500">
                                                {JSON.stringify(log.details)}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            )}
        </div>
    );
}
