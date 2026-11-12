-- ============================================================
-- WUYO Lab: sprzedaż (12.11.2026)
-- 1. jobs.lost_reason: powód przegranej osobno (statystyki), backfill z notes.
-- 2. call_queue.score_manual*: ręczna ocena leada; sync_centrum.py jej nie nadpisuje.
-- 3. call_notes: notatki z rozmów + analiza AI (propozycja, zapis po kliknięciu).
-- 4. activity_log.kind: nowy rodzaj 'rozmowa'.
-- ============================================================

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS lost_reason TEXT;

UPDATE jobs
SET lost_reason = trim(substring(notes FROM 'Przegrane:\s*([^\n]+)'))
WHERE outcome = 'przegrane'
  AND lost_reason IS NULL
  AND notes ~ 'Przegrane:';

ALTER TABLE call_queue ADD COLUMN IF NOT EXISTS score_manual INTEGER
    CHECK (score_manual IS NULL OR (score_manual BETWEEN 0 AND 100));
ALTER TABLE call_queue ADD COLUMN IF NOT EXISTS score_manual_reason TEXT;

CREATE TABLE IF NOT EXISTS call_notes (
    id              UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id       UUID         REFERENCES clients(id) ON DELETE CASCADE,
    job_id          UUID         REFERENCES jobs(id) ON DELETE SET NULL,
    queue_id        TEXT         REFERENCES call_queue(id) ON DELETE SET NULL,
    tresc           TEXT         NOT NULL,
    analiza         JSONB,
    zastosowano_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_notes_client_idx ON call_notes (client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS call_notes_queue_idx  ON call_notes (queue_id);

ALTER TABLE call_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "call_notes_authenticated_all" ON call_notes;
CREATE POLICY "call_notes_authenticated_all" ON call_notes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_kind_check;
ALTER TABLE activity_log ADD CONSTRAINT activity_log_kind_check
    CHECK (kind IN ('telefon', 'mail', 'oferta', 'zaliczka', 'platnosc', 'notatka_dnia', 'rozmowa'));
