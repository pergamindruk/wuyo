-- ============================================================
-- WUYO: potwierdzone statystyki i pliki za e-mail (15.11.2026)
-- 1. page_views: dzienny anonimowy identyfikator odwiedzającego (skrót IP+przeglądarka
--    z solą zmienianą co dzień, bez ciasteczek), źródło wejścia i UTM.
--    Stare wiersze (bez visitor) nie wchodzą do potwierdzonych statystyk.
-- 2. leads.source / visitor: skąd przyszedł ktoś, kto wysłał formularz.
-- 3. downloads: pobrania plików za e-mail. Link przychodzi mailem, więc
--    confirmed_at = adres potwierdzony i plik naprawdę pobrany.
-- ============================================================

ALTER TABLE page_views ADD COLUMN IF NOT EXISTS visitor      TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS source       TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS ref_host     TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_source   TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_medium   TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS landing      BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS page_views_created_idx ON page_views (created_at);
CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views (visitor, created_at);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS source  TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor TEXT;

CREATE TABLE IF NOT EXISTS downloads (
    id                 UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    file               TEXT         NOT NULL,
    email              TEXT         NOT NULL,
    marketing_consent  BOOLEAN      NOT NULL DEFAULT false,
    consent_text       TEXT,
    token              TEXT         NOT NULL UNIQUE,
    confirmed_at       TIMESTAMPTZ,
    download_count     INTEGER      NOT NULL DEFAULT 0,
    page               TEXT,
    visitor            TEXT,
    source             TEXT
);
CREATE INDEX IF NOT EXISTS downloads_created_idx ON downloads (created_at);
CREATE INDEX IF NOT EXISTS downloads_email_idx   ON downloads (lower(email));

-- Tylko serwer (klucz service role). Bez polityk = brak dostępu z przeglądarki.
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
