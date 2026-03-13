import { AnimatedSection } from "@/components/AnimatedSection";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
    title: "Polityka Prywatności | Wuyo – Dobra Grafa",
    description: "Informacje o przetwarzaniu danych osobowych, plikach cookies i sposobach ochrony Twojej prywatności na stronie Wuyo.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="flex-1 w-full bg-navy-dark pt-40 md:pt-48 pb-24 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
                <AnimatedSection>
                    <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-gold transition-colors mb-12 font-medium">
                        <ArrowLeft size={20} /> Wróć na pełną
                    </Link>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Polityka prywatności.</h1>
                    <p className="text-white/60 text-lg max-w-2xl mb-16">
                        Poniżej pełne, formalne info o tym, jak dbam o Twoje dane i dlaczego to wszystko jest bezpieczne. Żadnych haczyków, czysty biznes.
                    </p>
                </AnimatedSection>

                <div className="space-y-12 text-white/70 prose prose-invert prose-p:leading-relaxed prose-a:text-gold hover:prose-a:text-white max-w-none">
                    <AnimatedSection delay={0.1}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 1 Informacje ogólne</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Niniejsza polityka dotyczy Serwisu www, funkcjonującego pod adresem strony internetowej operatora.</li>
                            <li>Operatorem serwisu oraz Administratorem danych osobowych jest <strong>Wuyo</strong>.</li>
                            <li>Adres kontaktowy poczty elektronicznej operatora: <strong>kontakt@wuyo.pl</strong>.</li>
                            <li>Operator jest Administratorem Twoich danych osobowych w odniesieniu do danych podanych dobrowolnie w Serwisie.</li>
                            <li>Serwis wykorzystuje dane osobowe w następujących celach:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>obsługa zapytań przez formularz kontaktowy lub email,</li>
                                    <li>realizacja zamówionych usług,</li>
                                    <li>prezentacja oferty lub informacji.</li>
                                </ul>
                            </li>
                            <li>Serwis realizuje funkcje pozyskiwania informacji o użytkownikach i ich zachowaniu w następujący sposób:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Poprzez dobrowolnie wprowadzone dane, które zostają wprowadzone do systemów Operatora.</li>
                                    <li>Poprzez zapisywanie w urządzeniach końcowych plików cookie (tzw. „ciasteczka”).</li>
                                </ul>
                            </li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.2}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 2 Wybrane metody ochrony danych stosowane przez operatora</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Miejsca logowania (jeśli dotyczy) i wprowadzania danych osobowych są chronione w warstwie transmisji (certyfikat SSL). Dzięki temu dane osobowe i dane logowania, wprowadzone na stronie, zostają zaszyfrowane w komputerze użytkownika i mogą być odczytane jedynie na docelowym serwerze.</li>
                            <li>W celu ochrony danych Operator regularnie wykonuje kopie bezpieczeństwa.</li>
                            <li>Istotnym elementem ochrony danych jest regularna aktualizacja wszelkiego oprogramowania, wykorzystywanego przez Operatora do przetwarzania danych osobowych.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.3}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 3 Hosting</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Serwis jest hostowany (technicznie utrzymywany) na serwerach operatora: <strong>Seohost</strong>. Twoje dane tam są bezpieczne i nikomu ich nie sprzedajemy na zapleczu.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.4}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 4 Twoje prawa i dodatkowe informacje o sposobie wykorzystania danych</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>W niektórych sytuacjach Administrator ma prawo przekazywać Twoje dane osobowe innym odbiorcom, jeśli będzie to niezbędne do wykonania zawartej z Tobą umowy. Dotyczy to takich grup odbiorców:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>firma hostingowa na zasadzie powierzenia,</li>
                                    <li>upoważnieni pracownicy i współpracownicy.</li>
                                </ul>
                            </li>
                            <li>Twoje dane osobowe przetwarzane przez Administratora nie dłużej, niż jest to konieczne do wykonania związanych z nimi czynności określonych osobnymi przepisami.</li>
                            <li>Przysługuje Ci prawo żądania od Administratora:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>dostępu do danych osobowych Ciebie dotyczących,</li>
                                    <li>ich sprostowania, usunięcia, ograniczenia przetwarzania,</li>
                                    <li>przenoszenia danych.</li>
                                </ul>
                            </li>
                            <li>Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi procesów zapytania ofertowego i realizacji usługi.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.5}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 5 Informacja o plikach cookies</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Serwis korzysta z plików cookies.</li>
                            <li>Pliki cookies (tzw. „ciasteczka”) stanowią dane informatyczne, w szczególności pliki tekstowe, które przechowywane są w urządzeniu końcowym Użytkownika Serwisu i przeznaczone są do korzystania ze stron internetowych Serwisu.</li>
                            <li>Podmiotem zamieszczającym na urządzeniu końcowym Użytkownika Serwisu pliki cookies oraz uzyskującym do nich dostęp jest operator Serwisu.</li>
                            <li>Pliki cookies wykorzystywane są w celach statystycznych, poprawnego działania witryny oraz technicznych.</li>
                            <li>Oprogramowanie do przeglądania stron internetowych (przeglądarka internetowa) zazwyczaj domyślnie dopuszcza przechowywanie plików cookies w urządzeniu końcowym Użytkownika. Użytkownicy Serwisu mogą dokonać zmiany ustawień w tym zakresie lub zarządzać nimi bezpośrednio w ustawieniach przeglądarki.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.6}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 6 Postanowienia końcowe</h2>
                        <p>Zawsze wiesz gdzie mnie znaleźć. Napisz na maila <strong>kontakt@wuyo.pl</strong> jeśli masz jakiekolwiek wątpliwości lub pytania o swoje dane.</p>
                    </AnimatedSection>
                </div>
            </div>
        </main>
    );
}
