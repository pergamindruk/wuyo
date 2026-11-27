import { Resend } from "resend";
import { powiadomWlasciciela } from "@/lib/lab/doradca/telegram";

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Nadawca powiadomień wewnętrznych (formularze, zamówienia, leady).
 *
 * WAŻNE: NIE może to być kontakt@wuyo.pl. Ten adres jest w Gmailu skonfigurowany
 * jako alias "wyślij jako", więc Gmail oznacza przychodzącą pocztę od niego
 * etykietą SENT — traktuje ją jak wiadomość wysłaną przez nas samych.
 * Skutek: brak powiadomienia i wątek sklejony z własną korespondencją.
 * Adres poniżej nie jest aliasem, więc powiadomienia trafiają do skrzynki
 * jak normalna nowa poczta.
 */
export const FROM_NOTIFICATION =
    process.env.EMAIL_FROM_NOTIFICATION ?? "WUYO Formularz <formularz@wuyo.pl>";

/** Nadawca wiadomości do klienta — tu zostaje prawdziwy adres firmowy. */
export const FROM_CLIENT = process.env.EMAIL_FROM_CLIENT ?? "Mateusz z WUYO <kontakt@wuyo.pl>";

/** Odbiorca powiadomień wewnętrznych. */
export const TO_MATEUSZ = process.env.EMAIL_TO_OWNER ?? "kontakt@wuyo.pl";

type SendPayload = Parameters<typeof resend.emails.send>[0];

/**
 * Wysyła maila i NIE przemilcza błędu.
 *
 * `resend.emails.send` nie rzuca wyjątku przy odrzuceniu wysyłki — zwraca
 * { data, error }. Wcześniej wynik był ignorowany, więc odrzucona wysyłka
 * wyglądała jak sukces i nikt się o niej nie dowiadywał.
 *
 * Teraz każda nieudana wysyłka jest logowana i rzucana dalej, żeby trasa API
 * zwróciła 500 zamiast udawać, że zapytanie doszło.
 */
export async function sendEmail(payload: SendPayload, context: string, imie?: string | null): Promise<void> {
    // Powiadomienie o kliencie idzie też na Telegram, równolegle z mailem.
    // Wysyła się nawet wtedy, gdy mail padnie. Błąd Telegrama nic nie psuje.
    const etykieta = NA_TELEGRAM[context];
    const telegram = etykieta && payload.to === TO_MATEUSZ
        ? powiadomWlasciciela(telegramTekst(etykieta, imie))
        : Promise.resolve();
    try {
        await wyslijMaila(payload, context);
    } finally {
        await telegram;
    }
}

/**
 * Powiadomienia o klientach, które przychodzą też na Telegram.
 * Telegram ma siedzibę poza UE, więc idzie tam tylko rodzaj zdarzenia i imię.
 * E-mail, telefon, treść zapytania i rozmowy zostają w mailu i w /lab.
 */
const NA_TELEGRAM: Record<string, string> = {
    "lead-powiadomienie": "🔥 Nowy lead z czatu",
    "brief-powiadomienie": "📋 Nowy brief",
    "brief-klienta": "📋 Klient wypełnił brief",
    "audyt-powiadomienie": "🔍 Nowe zgłoszenie do audytu",
    "oferta-akceptacja": "✅ Klient zaakceptował ofertę",
    "zamowienie-powiadomienie": "🛒 Nowe zamówienie druku",
    "strefa-pliki": "📎 Klient wrzucił pliki",
    "pobierz-powiadomienie": "⬇️ Ktoś pobrał plik",
};

/** Treść powiadomienia na Telegram: etykieta + imię (jeśli jest), nic więcej. */
export function telegramTekst(etykieta: string, imie?: string | null): string {
    const czysteImie = (imie ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    return `${etykieta}${czysteImie ? `: ${czysteImie}` : ""}\nSzczegóły w mailu i w panelu /lab.`;
}

async function wyslijMaila(payload: SendPayload, context: string): Promise<void> {
    const { data, error } = await resend.emails.send(payload);

    if (!error) {
        console.info(`[email:${context}] wyslano, id=${data?.id}`);
        return;
    }

    console.error(`[email:${context}] Resend odrzucil wysylke:`, error);

    // Adres w polu "odpowiedz do" pochodzi od klienta, więc mimo walidacji może
    // się zdarzyć taki, którego dostawca poczty nie przyjmie. Powiadomienie jest
    // ważniejsze niż wygoda odpisywania — ponawiamy bez tego pola, bo adres
    // klienta i tak jest w treści wiadomości.
    const odrzuconyReplyTo =
        typeof error.message === "string" &&
        error.message.includes("reply_to") &&
        "replyTo" in payload &&
        payload.replyTo;

    if (odrzuconyReplyTo) {
        const { replyTo: _pominiety, ...bezReplyTo } = payload as SendPayload & { replyTo?: unknown };
        const ponowna = await resend.emails.send(bezReplyTo as SendPayload);

        if (!ponowna.error) {
            console.warn(`[email:${context}] wyslano bez pola reply_to, id=${ponowna.data?.id}`);
            return;
        }

        console.error(`[email:${context}] ponowna wysylka rowniez odrzucona:`, ponowna.error);
        throw new Error(
            `Wysylka maila nie powiodla sie (${context}): ${ponowna.error.message ?? "nieznany blad"}`
        );
    }

    throw new Error(`Wysylka maila nie powiodla sie (${context}): ${error.message ?? "nieznany blad"}`);
}
