/**
 * Opinie pobierane wprost z profilu firmy w Google (Places API New).
 *
 * Ograniczenia narzucone przez Google, nie przez nas:
 * - zwracanych jest maksymalnie 5 opinii, wybranych przez Google jako
 *   „najbardziej trafne"; nie da się ich stronicować ani wybrać samemu,
 * - treści opinii nie wolno przechowywać u siebie na stałe — dlatego
 *   odpytujemy Google raz na dobę zamiast kopiować opinie do bazy,
 * - przy wyświetlaniu wymagane jest oznaczenie źródła i nazwisko autora.
 *
 * Bez ustawionych zmiennych środowiskowych funkcja zwraca null, a sekcja
 * opinii korzysta z dotychczasowej listy. Nic się nie psuje.
 */

export type GoogleReview = {
    author: string;
    authorPhotoUrl?: string;
    authorProfileUrl?: string;
    rating: number;
    text: string;
    relativeTime?: string;
    publishTime?: string;
};

export type GoogleReviewsData = {
    rating: number;
    total: number;
    reviews: GoogleReview[];
    mapsUrl?: string;
    writeReviewUrl?: string;
};

type PlacesReview = {
    rating?: number;
    relativePublishTimeDescription?: string;
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
};

type PlacesResponse = {
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    reviews?: PlacesReview[];
};

/** Odświeżamy raz na dobę — opinii nie przybywa co minutę, a limity są płatne. */
const REVALIDATE_SECONDS = 60 * 60 * 24;

export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) return null;

    const fields = ["rating", "userRatingCount", "googleMapsUri", "reviews"].join(",");
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=pl&fields=${fields}`;

    try {
        const res = await fetch(url, {
            headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": fields,
            },
            next: { revalidate: REVALIDATE_SECONDS },
        });

        if (!res.ok) {
            console.error(`[opinie-google] Places API odpowiedziało ${res.status}:`, (await res.text()).slice(0, 300));
            return null;
        }

        const data = (await res.json()) as PlacesResponse;

        const reviews: GoogleReview[] = (data.reviews ?? [])
            .map((r) => ({
                author: r.authorAttribution?.displayName?.trim() ?? "",
                authorPhotoUrl: r.authorAttribution?.photoUri,
                authorProfileUrl: r.authorAttribution?.uri,
                rating: r.rating ?? 0,
                text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
                relativeTime: r.relativePublishTimeDescription ?? "",
                publishTime: r.publishTime,
            }))
            // Opinie bez treści (sama ocena gwiazdkowa) nie mają czego pokazać.
            .filter((r) => r.author && r.text);

        if (reviews.length === 0) return null;

        return {
            rating: data.rating ?? 0,
            total: data.userRatingCount ?? reviews.length,
            reviews,
            mapsUrl: data.googleMapsUri,
            writeReviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`,
        };
    } catch (err) {
        console.error("[opinie-google] blad pobierania opinii:", err);
        return null;
    }
}
