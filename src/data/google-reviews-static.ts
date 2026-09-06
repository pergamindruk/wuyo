import type { GoogleReviewsData } from "@/lib/google-reviews";

/**
 * Prawdziwe opinie z profilu firmy w Google, przepisane ręcznie.
 *
 * Dlaczego nie z API: Places API wymaga konta Google Cloud z podpiętą kartą,
 * nawet gdy zużycie mieści się w darmowym limicie. Decyzja: zero kosztów
 * i zero karty, więc opinie stoją tutaj. Gdy w zmiennych środowiskowych
 * pojawi się GOOGLE_PLACES_API_KEY i GOOGLE_PLACE_ID, kod automatycznie
 * przełączy się na pobieranie na żywo i ten plik przestanie być używany.
 *
 * AKTUALIZACJA: po nowej opinii dopisz ją tutaj (autor, ocena, treść, data).
 * Profil: https://maps.google.com/?cid=14360924900788498345
 *
 * Daty są przybliżone do dnia — Google podaje tylko "2 miesiące temu",
 * a nie dokładną datę. Wystarczy, bo i tak wyświetlamy odstęp czasu.
 * Stan na 7 września 2026.
 */

export const GOOGLE_PLACE_ID = "ChIJcxLR_WT7PEcRqW-PHRxBTMc";
export const GOOGLE_PROFILE_URL = "https://maps.google.com/?cid=14360924900788498345";
export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

export const staticGoogleReviews: GoogleReviewsData = {
    rating: 5,
    total: 5,
    mapsUrl: GOOGLE_PROFILE_URL,
    writeReviewUrl: GOOGLE_WRITE_REVIEW_URL,
    reviews: [
        {
            author: "Dominika Szafrańska",
            rating: 5,
            text: "Polecam! Nadruk na koszulkach został wykonany bardzo dokładnie i profesjonalnie. Jakość wykonania jest świetna, a efekt końcowy w pełni spełnił moje oczekiwania. Miła obsługa, szybka realizacja i bardzo dobry kontakt. Na pewno wrócę z kolejnymi zamówieniami.",
            publishTime: "2026-07-07",
        },
        {
            author: "Jagoda Lech",
            rating: 5,
            text: "Potrzebowałam naklejek na szyszki weselne i plakatu rozpisu gości na wesele, bardzo szybka usługa i profesjonalne wykonanie :) Gorąco polecam :)",
            publishTime: "2026-07-07",
        },
        {
            author: "Dawid Cichoń",
            rating: 5,
            text: "Szybki czas realizacji i profesjonalne doradztwo, za które jestem bardzo wdzięczny, bo w sumie sam nie wiedziałem czego dokładnie potrzebuję.",
            publishTime: "2026-06-07",
        },
        {
            author: "Akser Osak",
            rating: 5,
            text: "Zdecydowanie polecam! Świetny kontakt, szybki projekt i ekspresowe wykonanie. Na pewno wrócę.",
            publishTime: "2026-05-07",
        },
        {
            author: "Taki Ziomek",
            rating: 5,
            text: "Polecam. Miła obsługa dobry kontakt.",
            publishTime: "2026-06-07",
        },
    ],
};
