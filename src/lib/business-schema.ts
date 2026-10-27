import { GOOGLE_PROFILE_URL, staticGoogleReviews } from "@/data/google-reviews-static";

/**
 * Jedna firma w danych strukturalnych. Wszystkie strony odwołują się do tego samego
 * @id, więc Google widzi jeden biznes, a nie kilka o różnych nazwach.
 * Zmiana nazwy, telefonu albo liczby opinii = zmiana tylko tutaj.
 */
export const BUSINESS_ID = "https://wuyo.pl/#business";
export const BUSINESS_NAME = "WUYO Dobra Grafa";

export const BUSINESS_SAME_AS = [
    "https://www.facebook.com/wuyo.dobra.grafa",
    "https://www.instagram.com/wuyo.pl/",
    GOOGLE_PROFILE_URL,
];

/** Krótkie odwołanie do firmy, np. jako provider usługi albo publisher wpisu. */
export const BUSINESS_REF = {
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: BUSINESS_NAME,
    url: "https://wuyo.pl",
} as const;

/**
 * Ocena z Google. Dawać TYLKO na stronach, które pokazują opinie
 * (strona główna i strony usług z sekcją opinii). Na blogu nie,
 * bo tam opinii nie widać, a Google traktuje to jako mylące dane.
 */
export const BUSINESS_RATING = {
    "@type": "AggregateRating",
    ratingValue: staticGoogleReviews.rating.toFixed(1),
    bestRating: "5",
    worstRating: "1",
    ratingCount: String(staticGoogleReviews.total),
    reviewCount: String(staticGoogleReviews.total),
} as const;
