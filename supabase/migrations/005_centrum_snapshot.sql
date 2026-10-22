-- ============================================================
-- WUYO Lab: Centrum Dowodzenia
-- Jeden wiersz na klucz (np. 'latest') z danymi z komputera studia:
-- Harvey, audyt stron, nocna zmiana. Zapisuje skrypt lokalny
-- (sync_centrum.py) kluczem serwisowym; czytają tylko zalogowani.
-- ============================================================

CREATE TABLE IF NOT EXISTS centrum_snapshot (
    key         TEXT         PRIMARY KEY,
    data        JSONB        NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE centrum_snapshot ENABLE ROW LEVEL SECURITY;

-- Tylko odczyt dla zalogowanych. Brak polityk zapisu = zapis wyłącznie
-- kluczem serwisowym (omija RLS).
CREATE POLICY "centrum_snapshot_authenticated_read"
    ON centrum_snapshot
    FOR SELECT
    TO authenticated
    USING (true);
