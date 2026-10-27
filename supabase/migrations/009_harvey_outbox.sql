-- ============================================================
-- WUYO Lab: akceptacja maili Harveya w panelu (/lab/maile)
-- sync_centrum.py wysyła tu szkice z Outboxa Harveya (kluczem serwisowym).
-- Panel zapisuje tylko decyzję (approve / reject). Przy następnym syncu
-- skrypt przekazuje ją do Harveya przez jego lokalne API i wpisuje
-- zastosowano_at albo blad. Wysyłka nadal tylko z komputera (Harvey).
-- ============================================================

CREATE TABLE IF NOT EXISTS harvey_outbox (
    id              TEXT         PRIMARY KEY,           -- id z outbox Harveya
    firma           TEXT         NOT NULL DEFAULT '',
    do_email        TEXT         NOT NULL,
    temat           TEXT         NOT NULL DEFAULT '',
    tresc           TEXT         NOT NULL DEFAULT '',
    krok            INTEGER      NOT NULL DEFAULT 1,     -- 1 = pierwszy mail, 2-3 = przypomnienia
    zaplanowano     TIMESTAMPTZ,                         -- send_at z Harveya
    wyslano         TIMESTAMPTZ,
    status          TEXT         NOT NULL,               -- status w Harveyu (pending_review, approved, sent…)
    decyzja         TEXT         CHECK (decyzja IN ('approve', 'reject')),
    decyzja_at      TIMESTAMPTZ,
    zastosowano_at  TIMESTAMPTZ,                         -- kiedy Harvey dostał decyzję
    blad            TEXT,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS harvey_outbox_status_idx ON harvey_outbox (status, zaplanowano);

ALTER TABLE harvey_outbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "harvey_outbox_authenticated_read" ON harvey_outbox
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "harvey_outbox_authenticated_decide" ON harvey_outbox
    FOR UPDATE TO authenticated USING (status = 'pending_review') WITH CHECK (status = 'pending_review');

-- Zalogowany może zmienić wyłącznie decyzję; treść i status zapisuje tylko sync.
REVOKE INSERT, UPDATE, DELETE ON harvey_outbox FROM authenticated, anon;
GRANT UPDATE (decyzja, decyzja_at) ON harvey_outbox TO authenticated;
