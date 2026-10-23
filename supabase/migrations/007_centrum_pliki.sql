-- ============================================================
-- WUYO Lab: pliki z komputera studia w panelu (/lab/centrum/pliki)
-- Raporty nocnej zmiany, audyt stron, listy firm (CSV), posty,
-- szkice bloga, logi oraz maile i odpowiedzi z Harveya.
-- Zapisuje sync_centrum.py kluczem serwisowym (co 30 min); pliki,
-- których już nie ma na komputerze, skrypt usuwa. Czytają zalogowani.
-- ============================================================

CREATE TABLE IF NOT EXISTS centrum_pliki (
    sciezka     TEXT         PRIMARY KEY,   -- np. 'raporty/audyt-stron.md', 'harvey/mail/12'
    grupa       TEXT         NOT NULL,      -- sekcja na liście w panelu
    nazwa       TEXT         NOT NULL,      -- to, co widać na liście
    typ         TEXT         NOT NULL
                CHECK (typ IN ('md', 'mdx', 'csv', 'txt', 'mail', 'rozmowa')),
    tresc       TEXT         NOT NULL DEFAULT '',
    rozmiar     INTEGER      NOT NULL DEFAULT 0,
    zmieniono   TIMESTAMPTZ  NOT NULL,      -- data pliku na komputerze
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS centrum_pliki_grupa_idx ON centrum_pliki (grupa, zmieniono DESC);

ALTER TABLE centrum_pliki ENABLE ROW LEVEL SECURITY;

-- Tylko odczyt dla zalogowanych; zapis wyłącznie kluczem serwisowym.
CREATE POLICY "centrum_pliki_authenticated_read"
    ON centrum_pliki
    FOR SELECT
    TO authenticated
    USING (true);
