-- ============================================================
-- WUYO Lab: Tabela ewidencji przychodów (finanse)
-- Uruchom to w: Supabase Dashboard > SQL Editor > New query
-- ============================================================

CREATE TABLE IF NOT EXISTS finances (
    id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type TEXT         NOT NULL,
    date          DATE         NOT NULL,
    client_info   TEXT         NOT NULL,
    description   TEXT         NOT NULL,
    amount        NUMERIC      NOT NULL,
    created_at    TIMESTAMPTZ  DEFAULT now()
);

-- Row-Level Security: tylko zalogowani mogą modyfikować
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finances_authenticated_all"
    ON finances
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
