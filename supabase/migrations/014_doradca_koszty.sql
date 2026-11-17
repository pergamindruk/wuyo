-- ============================================================
-- WUYO Lab: Doradca, etap 3 (17.11.2026)
-- 1. koszty: wydatki firmy zapisywane z Telegrama (kwoty w groszach).
--    z_dotacji = zakup opłacony dotacją z PUP (nie idzie w koszty podatkowe).
-- 2. doradca_oczekujace: zapis czekający na „tak” Mateusza. Bot nic nie zapisuje bez potwierdzenia.
-- ============================================================

CREATE TABLE IF NOT EXISTS koszty (
    id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    data          DATE         NOT NULL,
    kwota_grosze  INTEGER      NOT NULL CHECK (kwota_grosze > 0),
    opis          TEXT         NOT NULL,
    sprzedawca    TEXT,
    z_dotacji     BOOLEAN      NOT NULL DEFAULT false,
    zrodlo        TEXT         NOT NULL DEFAULT 'telegram',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS koszty_data_idx ON koszty (data DESC);

CREATE TABLE IF NOT EXISTS doradca_oczekujace (
    id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    akcje       JSONB        NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE koszty             ENABLE ROW LEVEL SECURITY;
ALTER TABLE doradca_oczekujace ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "koszty_authenticated_all" ON koszty;
CREATE POLICY "koszty_authenticated_all" ON koszty
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "doradca_oczekujace_authenticated_all" ON doradca_oczekujace;
CREATE POLICY "doradca_oczekujace_authenticated_all" ON doradca_oczekujace
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
