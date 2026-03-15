-- ============================================================
-- WUYO Lab: Tabela kalendarza postów social media
-- Uruchom to w: Supabase Dashboard > SQL Editor > New query
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_events (
    id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    topic        TEXT         NOT NULL,
    platform     TEXT         NOT NULL DEFAULT 'Instagram, Facebook',
    format       TEXT         NOT NULL DEFAULT 'Post',
    goal         TEXT         NOT NULL DEFAULT 'Edukacja',
    date         DATE         NOT NULL,
    status       TEXT         NOT NULL DEFAULT 'Szkic',
    content      TEXT,
    image_url    TEXT,
    published_at TIMESTAMPTZ,
    ig_post_id   TEXT,
    fb_post_id   TEXT,
    yt_video_id  TEXT,
    created_at   TIMESTAMPTZ  DEFAULT now()
);

-- Row-Level Security: tylko zalogowani mogą modyfikować
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_authenticated_all"
    ON calendar_events
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
