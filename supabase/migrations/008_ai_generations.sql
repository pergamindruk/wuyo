-- ============================================================
-- WUYO Lab: historia AI Studio (/lab/ai-studio, zakładka Historia)
-- Odpowiedzi do klientów z wyceną, ściągawki do telefonu, posty.
-- Kod zapisywał tu od dawna, ale tabeli nie było, więc historia była pusta.
-- Dostęp tylko dla zalogowanego (rejestracja w panelu jest wyłączona).
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_generations (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT         NOT NULL CHECK (type IN ('content', 'quote')),
    input_data  JSONB        NOT NULL DEFAULT '{}'::jsonb,   -- kind: odpowiedz | telefon, temat, kanał...
    output      TEXT         NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_generations_created_idx ON ai_generations (created_at DESC);

ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_generations_authenticated_all"
    ON ai_generations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
