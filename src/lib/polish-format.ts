/**
 * Odmiana i formatowanie po polsku — rzeczy, których Intl nie robi za nas
 * w sposób, jakiego oczekuje czytelnik.
 */

/** Czy liczba przyjmuje formę mnogą typu „2 opinie" (końcówka 2-4, poza nastkami). */
function formaMnogaLekka(n: number): boolean {
    const ostatnia = n % 10;
    const dwieOstatnie = n % 100;
    return ostatnia >= 2 && ostatnia <= 4 && !(dwieOstatnie >= 12 && dwieOstatnie <= 14);
}

/** 1 opinia, 2-4 opinie, 5-21 opinii, 22-24 opinie... */
export function odmienOpinie(n: number): string {
    if (n === 1) return "opinia";
    return formaMnogaLekka(n) ? "opinie" : "opinii";
}
