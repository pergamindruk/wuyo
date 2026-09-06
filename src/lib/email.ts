import { Resend } from "resend";

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
export async function sendEmail(payload: SendPayload, context: string): Promise<void> {
    const { data, error } = await resend.emails.send(payload);

    if (error) {
        console.error(`[email:${context}] Resend odrzucil wysylke:`, error);
        throw new Error(`Wysylka maila nie powiodla sie (${context}): ${error.message ?? "nieznany blad"}`);
    }

    console.info(`[email:${context}] wyslano, id=${data?.id}`);
}
