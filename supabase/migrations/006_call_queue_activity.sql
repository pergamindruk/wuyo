-- ============================================================
-- WUYO Lab: kolejka telefonów + dziennik działań (ekran „Dziś”)
-- call_queue: firmy do kontaktu (import z Harveya / audytu / CEIDG
--             przez sync_centrum.py; status zmienia panel).
-- activity_log: każde działanie (telefon, oferta, zaliczka, notatka dnia)
--             — źródło statystyk tygodnia i podsumowania dnia.
-- ============================================================

CREATE TABLE IF NOT EXISTS call_queue (
    id            TEXT         PRIMARY KEY,            -- np. 'harvey:<company_id>'
    name          TEXT         NOT NULL,
    industry      TEXT         NOT NULL DEFAULT '',
    phone         TEXT         NOT NULL DEFAULT '',
    website       TEXT         NOT NULL DEFAULT '',
    source        TEXT         NOT NULL DEFAULT 'bez_strony'
                  CHECK (source IN ('bez_strony', 'slaba_strona', 'strona_nie_dziala', 'ceidg', 'reczny')),
    reason        TEXT         NOT NULL DEFAULT '',     -- krótki powód kontaktu, np. „brak strony”
    problems      TEXT[]       NOT NULL DEFAULT '{}',
    score         INTEGER      NOT NULL DEFAULT 0,      -- wyższy = dzwoń wcześniej
    status        TEXT         NOT NULL DEFAULT 'do_kontaktu'
                  CHECK (status IN ('do_kontaktu', 'nie_odebral', 'oddzwonic', 'nie_chce', 'chce_oferte')),
    attempts      INTEGER      NOT NULL DEFAULT 0,
    next_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),  -- kiedy znów pokazać w kolejce
    notes         TEXT,
    client_id     UUID         REFERENCES clients(id) ON DELETE SET NULL,
    job_id        UUID         REFERENCES jobs(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_queue_pick_idx ON call_queue (status, next_at, score DESC);

CREATE TABLE IF NOT EXISTS activity_log (
    id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    kind        TEXT         NOT NULL
                CHECK (kind IN ('telefon', 'mail', 'oferta', 'zaliczka', 'platnosc', 'notatka_dnia')),
    outcome     TEXT,                                   -- np. status z call_queue
    queue_id    TEXT         REFERENCES call_queue(id) ON DELETE SET NULL,
    job_id      UUID         REFERENCES jobs(id) ON DELETE SET NULL,
    note        TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_created_idx ON activity_log (created_at DESC);

ALTER TABLE call_queue   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_queue_authenticated_all" ON call_queue
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "activity_log_authenticated_all" ON activity_log
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
