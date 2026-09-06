/**
 * Odmiana i formatowanie po polsku — rzeczy, których Intl nie robi za nas
 * w sposób, jakiego oczekuje czytelnik.
 */

/** Czy liczba przyjmuje formę mnogą typu „2 opinie" (końcówka 2-4, poza nastkami). */
export function formaMnogaLekka(n: number): boolean {
    const ostatnia = n % 10;
    const dwieOstatnie = n % 100;
    return ostatnia >= 2 && ostatnia <= 4 && !(dwieOstatnie >= 12 && dwieOstatnie <= 14);
}

/** 1 opinia, 2-4 opinie, 5-21 opinii, 22-24 opinie... */
export function odmienOpinie(n: number): string {
    if (n === 1) return "opinia";
    return formaMnogaLekka(n) ? "opinie" : "opinii";
}

/**
 * Odstęp czasu liczony przy renderowaniu, żeby „2 miesiące temu" nie zostało
 * na stronie na zawsze. Google podaje tylko przybliżenie, więc my też.
 * Zwraca pusty tekst przy braku lub błędnej dacie — widok to pomija.
 */
export function odstepCzasu(publishTime?: string): string {
    if (!publishTime) return "";
    const wtedy = new Date(publishTime);
    if (Number.isNaN(wtedy.getTime())) return "";

    const dni = Math.floor((Date.now() - wtedy.getTime()) / 86_400_000);
    if (dni < 0) return "";
    if (dni < 14) return "w tym tygodniu";
    if (dni < 31) return `${Math.floor(dni / 7)} tyg. temu`;

    const miesiace = Math.max(1, Math.round(dni / 30.44));
    if (miesiace < 12) {
        if (miesiace === 1) return "miesiąc temu";
        return `${miesiace} ${formaMnogaLekka(miesiace) ? "miesiące" : "miesięcy"} temu`;
    }

    const lata = Math.floor(miesiace / 12);
    if (lata === 1) return "rok temu";
    return `${lata} ${formaMnogaLekka(lata) ? "lata" : "lat"} temu`;
}
