// Klient Apify do szukania lokalnych firm w Google Maps (aktor compass/crawler-google-places). Tylko serwer.
import 'server-only'
import { ApifyClient } from 'apify-client'

const ACTOR = 'compass/crawler-google-places'
/** Twardy sufit wyników na jedno wyszukiwanie: chroni kredyty Apify. */
export const MAX_RESULTS_CAP = 50
/** Czekamy maksymalnie tyle na koniec przebiegu (Vercel daje funkcji 300 s). */
const WAIT_SECS = 240

export type LeadPlace = {
    name: string
    category: string | null
    phone: string | null
    website: string | null
    rating: number | null
    reviews: number | null
    address: string | null
    mapsUrl: string | null
}

type RawPlace = {
    title?: string
    categoryName?: string | null
    phone?: string | null
    phoneUnformatted?: string | null
    website?: string | null
    totalScore?: number | null
    reviewsCount?: number | null
    address?: string | null
    url?: string | null
    permanentlyClosed?: boolean
    temporarilyClosed?: boolean
}

export function apifyConfigured(): boolean {
    return Boolean(process.env.APIFY_API_TOKEN)
}

export type SearchInput = { query: string; location: string; maxResults: number; withoutWebsiteOnly: boolean }

function mapPlace(p: RawPlace): LeadPlace {
    return {
        name: p.title?.trim() || '(bez nazwy)',
        category: p.categoryName ?? null,
        phone: p.phone ?? p.phoneUnformatted ?? null,
        website: p.website ?? null,
        rating: typeof p.totalScore === 'number' ? p.totalScore : null,
        reviews: typeof p.reviewsCount === 'number' ? p.reviewsCount : null,
        address: p.address ?? null,
        mapsUrl: p.url ?? null,
    }
}

/**
 * Uruchamia aktora synchronicznie i zwraca wyniki z datasetu.
 * Limit wyników pilnowany trzy razy: maxCrawledPlacesPerSearch, maxItems (płatność za wynik) i limit odczytu datasetu.
 */
export async function searchPlaces(input: SearchInput): Promise<LeadPlace[]> {
    const token = process.env.APIFY_API_TOKEN
    if (!token) throw new Error('Brak APIFY_API_TOKEN')
    const max = Math.min(Math.max(1, Math.floor(input.maxResults)), MAX_RESULTS_CAP)
    const client = new ApifyClient({ token })

    const run = await client.actor(ACTOR).call(
        {
            searchStringsArray: [input.query],
            locationQuery: input.location,
            maxCrawledPlacesPerSearch: max,
            language: 'pl',
            // Filtr po stronie aktora: płacimy tylko za firmy bez WWW, gdy o nie chodzi.
            website: input.withoutWebsiteOnly ? 'withoutWebsite' : 'allPlaces',
            skipClosedPlaces: true,
            scrapePlaceDetailPage: false,
            scrapeContacts: false,
            maxImages: 0,
            maxReviews: 0,
        },
        { waitSecs: WAIT_SECS, maxItems: max, memory: 1024 },
    )
    if (run.status !== 'SUCCEEDED') {
        throw new Error(run.status === 'RUNNING' ? 'Apify nie skończył w 4 minuty. Zmniejsz liczbę wyników.' : `Apify: przebieg zakończony statusem ${run.status}`)
    }
    const { items } = await client.dataset<RawPlace>(run.defaultDatasetId).listItems({ limit: max, clean: true })
    const places = items.filter((p) => !p.permanentlyClosed).map(mapPlace)
    // Drugi bezpiecznik filtra (gdyby aktor zignorował parametr website).
    return input.withoutWebsiteOnly ? places.filter((p) => !p.website) : places
}
