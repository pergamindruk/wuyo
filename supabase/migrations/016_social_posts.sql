-- ============================================================
-- WUYO Lab: historia publikacji w social mediach (18.11.2026)
-- Panel /lab/publikuj wysyła posty przez Postiz (self-hosted).
-- Gdy Postiz nie odpowiada: FB/IG idą przez Graph API (zapas),
-- reszta czeka w kolejce (status 'w_kolejce'), cron /api/cron/publish ponawia.
-- ============================================================

CREATE TABLE IF NOT EXISTS social_posts (
    id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    tresc         TEXT         NOT NULL,
    obrazy        TEXT[]       NOT NULL DEFAULT '{}',
    -- [{ id, nazwa, platforma, marka }]
    kanaly        JSONB        NOT NULL DEFAULT '[]'::jsonb,
    tryb          TEXT         NOT NULL CHECK (tryb IN ('teraz', 'zaplanuj')),
    termin        TIMESTAMPTZ,
    status        TEXT         NOT NULL DEFAULT 'w_kolejce'
                  CHECK (status IN ('w_kolejce', 'zaplanowane', 'opublikowane', 'czesciowo', 'blad')),
    -- 'postiz' | 'graph' | 'mieszana'
    droga         TEXT,
    -- [{ kanal, ok, droga, blad?, postId? }]
    wyniki        JSONB        NOT NULL DEFAULT '[]'::jsonb,
    proby         INT          NOT NULL DEFAULT 0,
    calendar_event_id TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_posts_kolejka_idx ON social_posts (termin) WHERE status = 'w_kolejce';
CREATE INDEX IF NOT EXISTS social_posts_created_idx ON social_posts (created_at DESC);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "social_posts_authenticated_all" ON social_posts;
CREATE POLICY "social_posts_authenticated_all" ON social_posts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Ostatnia znana lista kanałów z Postiz (gdy PC z Postizem śpi, panel dalej je pokazuje).
CREATE TABLE IF NOT EXISTS social_channels_cache (
    id          TEXT         PRIMARY KEY,
    dane        JSONB        NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
ALTER TABLE social_channels_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "social_channels_cache_authenticated_all" ON social_channels_cache;
CREATE POLICY "social_channels_cache_authenticated_all" ON social_channels_cache
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
