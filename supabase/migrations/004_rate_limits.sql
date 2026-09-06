-- ============================================================
-- WUYO: Rate limiting oparty o bazę
-- Poprzedni limiter trzymał liczniki w pamięci procesu — na Vercel
-- każde wywołanie funkcji może trafić na inną, świeżą instancję,
-- więc limit realnie się nie stosował. Ta wersja liczy w Postgresie,
-- czyli działa poprawnie niezależnie od tego, która instancja odpowiada.
-- Uruchom to w: Supabase Dashboard > SQL Editor > New query
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limit_hits (
    id         BIGSERIAL   PRIMARY KEY,
    rl_key     TEXT        NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_hits_key_created_idx
    ON rate_limit_hits (rl_key, created_at);

-- RLS włączone i bez żadnych policy — jedyne wejście to funkcja poniżej.
ALTER TABLE rate_limit_hits ENABLE ROW LEVEL SECURITY;

-- Sprawdza i zapisuje "strzał" atomowo. SECURITY DEFINER pozwala
-- funkcji ominąć RLS, mimo że wywołuje ją rola anon z przeglądarki.
CREATE OR REPLACE FUNCTION check_rate_limit(p_key TEXT, p_limit INT, p_window_seconds INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    hit_count INT;
BEGIN
    -- sprzątanie starych wpisów przy okazji, żeby tabela się nie rozrastała
    DELETE FROM rate_limit_hits
    WHERE created_at < now() - (p_window_seconds || ' seconds')::interval;

    SELECT count(*) INTO hit_count
    FROM rate_limit_hits
    WHERE rl_key = p_key
      AND created_at > now() - (p_window_seconds || ' seconds')::interval;

    IF hit_count >= p_limit THEN
        RETURN FALSE;
    END IF;

    INSERT INTO rate_limit_hits (rl_key) VALUES (p_key);
    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INT, INT) TO anon, authenticated;
