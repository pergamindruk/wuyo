-- ============================================================
-- WUYO Lab: SEO-radca (/lab/seo, cron /api/cron/seo-radca codziennie rano)
-- seo_runs    = wynik każdego przeglądu (alarmy, liczby z Search Console)
-- seo_changes = zmiany tytułów i opisów stron oraz propozycje większych zmian.
--   status 'aktywna' / 'utrzymana' = podmiana działa na wuyo.pl (czyta ją src/lib/seo-overrides.ts)
--   'utrzymana' = po 28 dniach dała nie gorszy CTR; 'cofnieta' = gorszy, wraca stary tytuł
--   'zastapiona' = na tej stronie weszła nowsza zmiana
--   status 'do_akceptacji' = czeka na Mateusza w /lab/seo; propozycja: 'zaakceptowana' → 'zrobiona'
-- Dostęp: zalogowany (panel) + klucz serwisowy (cron, strona).
-- ============================================================

CREATE TABLE IF NOT EXISTS seo_runs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    alarms      JSONB        NOT NULL DEFAULT '[]'::jsonb,   -- [{key, level: alarm|uwaga, text}]
    stats       JSONB        NOT NULL DEFAULT '{}'::jsonb,   -- kliknięcia/wyświetlenia 7 dni vs poprzednie 7, strony
    actions     JSONB        NOT NULL DEFAULT '[]'::jsonb,   -- co radca zrobił w tym przebiegu
    error       TEXT
);

CREATE INDEX IF NOT EXISTS seo_runs_created_idx ON seo_runs (created_at DESC);

CREATE TABLE IF NOT EXISTS seo_changes (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    path            TEXT         NOT NULL,                       -- np. /logo, /blog/cmyk-i-rgb-czym-sie-roznia
    kind            TEXT         NOT NULL CHECK (kind IN ('meta', 'propozycja')),
    status          TEXT         NOT NULL CHECK (status IN ('aktywna', 'do_akceptacji', 'odrzucona', 'cofnieta', 'utrzymana', 'zaakceptowana', 'zastapiona', 'zrobiona')),
    auto            BOOLEAN      NOT NULL DEFAULT false,         -- true = radca wprowadził sam
    query           TEXT,                                        -- fraza z Search Console, której dotyczy
    reason          TEXT         NOT NULL DEFAULT '',
    before          JSONB        NOT NULL DEFAULT '{}'::jsonb,   -- {title, description}
    after           JSONB        NOT NULL DEFAULT '{}'::jsonb,   -- {title, description} albo {plan}
    metrics_before  JSONB,                                       -- {clicks, impressions, ctr, position} z 28 dni przed
    metrics_after   JSONB,
    applied_at      TIMESTAMPTZ,
    evaluate_after  DATE,                                        -- kiedy porównać wynik
    decided_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS seo_changes_status_idx ON seo_changes (status, created_at DESC);
-- Na jedną stronę najwyżej jedna aktywna podmiana.
CREATE UNIQUE INDEX IF NOT EXISTS seo_changes_one_active ON seo_changes (path) WHERE status IN ('aktywna', 'utrzymana') AND kind = 'meta';

ALTER TABLE seo_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_runs_authenticated_all" ON seo_runs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "seo_changes_authenticated_all" ON seo_changes FOR ALL TO authenticated USING (true) WITH CHECK (true);
