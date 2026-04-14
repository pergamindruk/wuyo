-- ============================================================
-- WUYO Lab: Dodaj kolumnę scheduled_at do calendar_events
-- Wymagana przez cron /api/cron/publish
-- Uruchom w: Supabase Dashboard > SQL Editor > New query
-- ============================================================

ALTER TABLE calendar_events
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Indeks dla szybkiego pobierania zaplanowanych postów przez cron
CREATE INDEX IF NOT EXISTS idx_calendar_events_scheduled_at
    ON calendar_events (scheduled_at)
    WHERE scheduled_at IS NOT NULL AND status = 'Zaplanowane';
