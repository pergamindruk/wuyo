import { createClient } from "@/lib/supabase/server";
import { Shield, RefreshCw } from "lucide-react";
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
    login: "text-blue-400",
    lead_status_change: "text-yellow-400",
    lead_delete: "text-red-400",
    project_create: "text-green-400",
    project_update: "text-blue-400",
    project_delete: "text-red-400",
    finance_add: "text-green-400",
    finance_delete: "text-red-400",
    post_publish: "text-purple-400",
    post_schedule: "text-purple-400",
    calendar_event_add: "text-cyan-400",
    calendar_event_delete: "text-red-400",
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
        <div className="p-6 md:p-10 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Shield size={22} className="text-gold" />
                    <h1 className="text-xl font-bold text-white">Audit Log</h1>
                </div>
                <Link href="/lab/audit-log" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
                    <RefreshCw size={13} /> Odśwież
                </Link>
            </div>

            {error && (
                <div className="mb-6 p-5 rounded-xl border border-red-500/30 bg-red-500/5">
                    <p className="text-red-400 text-sm font-medium mb-2">Błąd ładowania logów</p>
                    <p className="text-red-400/70 text-xs">{error}</p>
                    {error.includes("audit_log") && (
                        <details className="mt-4">
                            <summary className="text-white/50 text-xs cursor-pointer hover:text-white/70">Pokaż SQL do uruchomienia w Supabase</summary>
                            <pre className="mt-3 p-3 rounded-lg bg-white/5 text-xs text-white/60 overflow-auto leading-relaxed">{`CREATE TABLE IF NOT EXISTS audit_log (
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
                <div className="text-center py-20 text-white/30">
                    <Shield size={36} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">Brak zdarzeń w logu</p>
                    <p className="text-xs mt-1">Zdarzenia pojawią się po wykonaniu akcji w panelu</p>
                </div>
            )}

            {logs.length > 0 && (
                <div className="space-y-1">
                    {logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
                        >
                            <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-current mt-2 opacity-60" style={{ color: ACTION_COLORS[log.action]?.replace("text-", "") }} />
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                                    <span className={`font-semibold text-sm ${ACTION_COLORS[log.action] ?? "text-white/70"}`}>
                                        {ACTION_LABELS[log.action] ?? log.action}
                                    </span>
                                    <span className="text-white/25 text-xs">{formatDate(log.created_at)}</span>
                                </div>
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <p className="text-white/35 text-xs mt-1 font-mono truncate">
                                        {JSON.stringify(log.details)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
