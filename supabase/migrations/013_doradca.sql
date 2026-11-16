-- ============================================================
-- WUYO Lab: Doradca na Telegramie (17.11.2026)
-- 1. doradca_wiadomosci: historia rozmowy (update_id = ochrona przed dublem z Telegrama).
-- 2. doradca_fakty: trwałe ustalenia, które bot ma pamiętać.
-- 3. doradca_terminy: terminy do pilnowania (ZUS, PIT, dotacja).
-- Tabele czyta i pisze tylko serwer (klucz serwisowy) oraz zalogowany w /lab.
-- ============================================================

CREATE TABLE IF NOT EXISTS doradca_wiadomosci (
    id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    update_id   BIGINT       UNIQUE,
    rola        TEXT         NOT NULL CHECK (rola IN ('user', 'model')),
    rodzaj      TEXT         NOT NULL DEFAULT 'rozmowa' CHECK (rodzaj IN ('rozmowa', 'glos', 'poranek')),
    tresc       TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS doradca_wiadomosci_czas_idx ON doradca_wiadomosci (created_at DESC);

CREATE TABLE IF NOT EXISTS doradca_fakty (
    id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    tresc       TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS doradca_terminy (
    id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    data        DATE         NOT NULL,
    tytul       TEXT         NOT NULL,
    zrobione    BOOLEAN      NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (data, tytul)
);
CREATE INDEX IF NOT EXISTS doradca_terminy_data_idx ON doradca_terminy (data) WHERE NOT zrobione;

ALTER TABLE doradca_wiadomosci ENABLE ROW LEVEL SECURITY;
ALTER TABLE doradca_fakty      ENABLE ROW LEVEL SECURITY;
ALTER TABLE doradca_terminy    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doradca_wiadomosci_authenticated_all" ON doradca_wiadomosci;
CREATE POLICY "doradca_wiadomosci_authenticated_all" ON doradca_wiadomosci
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "doradca_fakty_authenticated_all" ON doradca_fakty;
CREATE POLICY "doradca_fakty_authenticated_all" ON doradca_fakty
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "doradca_terminy_authenticated_all" ON doradca_terminy;
CREATE POLICY "doradca_terminy_authenticated_all" ON doradca_terminy
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
