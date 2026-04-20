import { createClient } from "@/lib/supabase/server";
import TestimonialsManager from "./TestimonialsManager";

export const dynamic = "force-dynamic";

export type Testimonial = {
    id: string;
    quote: string;
    name: string;
    role: string;
    company: string;
    service: string;
    featured: boolean;
    created_at: string;
};

const MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT '',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_all" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');`;

export default async function TestimonialsPage() {
    let testimonials: Testimonial[] = [];
    let dbError: string | null = null;

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            dbError = error.code === "42P01"
                ? "MIGRATION_NEEDED"
                : error.message;
        } else {
            testimonials = data ?? [];
        }
    } catch (e) {
        dbError = e instanceof Error ? e.message : "Nieznany błąd";
    }

    if (dbError === "MIGRATION_NEEDED") {
        return (
            <div className="p-6 md:p-10 max-w-3xl">
                <h1 className="text-xl font-bold text-white mb-6">Testimoniale</h1>
                <div className="p-5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 mb-4">
                    <p className="text-yellow-400 font-medium text-sm mb-3">Tabela nie istnieje — uruchom migrację w Supabase Dashboard:</p>
                    <pre className="p-4 rounded-lg bg-black/40 text-xs text-white/70 overflow-auto leading-relaxed">{MIGRATION_SQL}</pre>
                </div>
            </div>
        );
    }

    return <TestimonialsManager initialData={testimonials} />;
}
