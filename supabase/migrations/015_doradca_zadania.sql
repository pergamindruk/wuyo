-- ============================================================
-- WUYO Lab: Doradca, zadania dla komputera (17.11.2026)
-- Bot (po „tak” Mateusza) dodaje zadanie, a wykonawca na PC
-- (narzedzia/doradca-zadania/wykonawca.py) bierze je po włączeniu komputera.
-- termin = najwcześniejszy dzień startu (NULL = od razu).
-- ============================================================

CREATE TABLE IF NOT EXISTS doradca_zadania (
    id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    tresc        TEXT         NOT NULL,
    termin       DATE,
    status       TEXT         NOT NULL DEFAULT 'oczekuje' CHECK (status IN ('oczekuje', 'w_toku', 'zrobione', 'blad')),
    wynik        TEXT,
    plik         TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    started_at   TIMESTAMPTZ,
    finished_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS doradca_zadania_kolejka_idx ON doradca_zadania (created_at) WHERE status = 'oczekuje';

ALTER TABLE doradca_zadania ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doradca_zadania_authenticated_all" ON doradca_zadania;
CREATE POLICY "doradca_zadania_authenticated_all" ON doradca_zadania
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
