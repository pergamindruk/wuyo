import { createClient } from "@/lib/supabase/server";

export type AuditAction =
    | "login"
    | "lead_status_change"
    | "lead_delete"
    | "project_create"
    | "project_update"
    | "project_delete"
    | "finance_add"
    | "finance_update"
    | "finance_delete"
    | "post_publish"
    | "post_schedule"
    | "calendar_event_add"
    | "calendar_event_delete";

export async function logAuditEvent(
    action: AuditAction,
    details?: Record<string, unknown>
) {
    try {
        const supabase = await createClient();
        await supabase.from("audit_log").insert([
            {
                action,
                details: details ?? {},
                created_at: new Date().toISOString(),
            },
        ]);
    } catch {
        // audit log errors are non-fatal
    }
}
