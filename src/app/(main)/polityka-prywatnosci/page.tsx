import { AnimatedSection } from "@/components/AnimatedSection";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { alternatesFor } from "@/lib/i18n";

export const metadata = {
    title: "Polityka prywatności",
    description: "Informacje o przetwarzaniu danych osobowych, plikach cookies i sposobach ochrony Twojej prywatności na stronie Wuyo.",
    alternates: alternatesFor("privacy", "pl"),
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
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 3 Kto przetwarza Twoje dane na moje zlecenie</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Do działania Serwisu korzystam z usług firm, którym powierzam przetwarzanie danych (art. 28 RODO). Przetwarzają one dane tylko na moje zlecenie i w zakresie potrzebnym do wykonania usługi:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><strong>Vercel Inc.</strong> (USA): hosting Serwisu. Przez jego serwery przechodzą wszystkie dane wysyłane przez stronę, w tym treść formularzy. Vercel zbiera też anonimowe statystyki odwiedzin i szybkości strony (Vercel Analytics, Speed Insights), bez plików cookies.</li>
                                    <li><strong>Supabase Inc.</strong> (serwery w Irlandii, UE): baza danych, w której zapisuję zapytania z formularzy i czatu oraz anonimowe dane o odwiedzanych podstronach.</li>
                                    <li><strong>Resend</strong> (Plus Five Five Inc., USA): wysyłka wiadomości e-mail z Serwisu, czyli powiadomień o Twoim zapytaniu i potwierdzeń wysłanych na Twój adres.</li>
                                    <li><strong>Google</strong> (Gemini API): czat na stronie. Treść wiadomości wpisanych w czacie trafia do Google, który generuje odpowiedź. Korzystam z bezpłatnej wersji tej usługi, dlatego Google może wykorzystywać treść rozmów do ulepszania swoich usług, a jego pracownicy mogą ją przeglądać. W tym zakresie Google działa jako osobny administrator danych na zasadach swojej polityki prywatności (policies.google.com/privacy). Nie wpisuj w czacie danych osobowych innych niż potrzebne do kontaktu ani danych wrażliwych. Jeśli wolisz, napisz na kontakt@wuyo.pl albo skorzystaj z formularza.</li>
                                    <li><strong>Google Ireland Limited</strong> i <strong>Meta Platforms Ireland Limited</strong>: statystyki i pomiar reklam, tylko po Twojej zgodzie (szczegóły w § 5).</li>
                                </ul>
                            </li>
                            <li>Część z tych firm ma siedzibę lub serwery w USA. Przekazanie danych poza Europejski Obszar Gospodarczy odbywa się na podstawie decyzji Komisji Europejskiej w sprawie EU-U.S. Data Privacy Framework (art. 45 RODO) albo standardowych klauzul umownych zatwierdzonych przez Komisję Europejską (art. 46 RODO).</li>
                            <li>Twoje dane mogą też trafić do organów publicznych, gdy wymaga tego prawo, a dane z faktur do biura rachunkowego.</li>
                            <li>Twoich danych nikomu nie sprzedaję.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.4}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 4 Podstawy prawne, czas przechowywania i Twoje prawa</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Podstawy przetwarzania danych:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>odpowiedź na zapytanie i przygotowanie wyceny: działania przed zawarciem umowy na Twoje żądanie (art. 6 ust. 1 lit. b RODO),</li>
                                    <li>realizacja zamówionej usługi: wykonanie umowy (art. 6 ust. 1 lit. b RODO),</li>
                                    <li>wystawianie faktur i prowadzenie księgowości: obowiązek prawny (art. 6 ust. 1 lit. c RODO),</li>
                                    <li>dochodzenie lub obrona przed roszczeniami oraz anonimowe statystyki działania strony: prawnie uzasadniony interes Administratora (art. 6 ust. 1 lit. f RODO),</li>
                                    <li>cookies analityczne i marketingowe: Twoja zgoda (art. 6 ust. 1 lit. a RODO).</li>
                                </ul>
                            </li>
                            <li>Jak długo przechowuję dane:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>zapytania, po których nie doszło do współpracy: do 12 miesięcy od ostatniego kontaktu,</li>
                                    <li>dane klientów: przez czas współpracy, a potem do upływu terminu przedawnienia roszczeń,</li>
                                    <li>faktury i dokumenty księgowe: 5 lat od końca roku, w którym minął termin zapłaty podatku,</li>
                                    <li>dane z cookies: do wycofania zgody lub wygaśnięcia pliku cookie.</li>
                                </ul>
                            </li>
                            <li>Przysługuje Ci prawo żądania od Administratora:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>dostępu do danych osobowych Ciebie dotyczących,</li>
                                    <li>ich sprostowania, usunięcia, ograniczenia przetwarzania,</li>
                                    <li>przenoszenia danych,</li>
                                    <li>sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,</li>
                                    <li>wycofania zgody w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania przed jej wycofaniem.</li>
                                </ul>
                            </li>
                            <li>Żeby skorzystać ze swoich praw, napisz na <strong>kontakt@wuyo.pl</strong>.</li>
                            <li>Masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</li>
                            <li>Twoje dane nie są wykorzystywane do zautomatyzowanego podejmowania decyzji, w tym profilowania, które wywołuje wobec Ciebie skutki prawne.</li>
                            <li>Podanie danych osobowych jest dobrowolne, lecz niezbędne do obsługi zapytania ofertowego i realizacji usługi.</li>
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
                            <li>
                                Serwis korzysta z narzędzi zewnętrznych, które zapisują własne pliki cookies:
                                <ul className="list-disc pl-5 mt-2 space-y-2">
                                    <li><strong>Google Analytics 4</strong> (Google Ireland Limited) — statystyka ruchu: liczba odwiedzin, źródła wejść, oglądane podstrony, wysłane formularze i kliknięcia w kontakt. Cookies analityczne.</li>
                                    <li><strong>Piksel Meta</strong> (Meta Platforms Ireland Limited) — pomiar skuteczności reklam na Facebooku i Instagramie. Cookies marketingowe.</li>
                                </ul>
                                Oba narzędzia mogą przekazywać dane do Stanów Zjednoczonych na podstawie decyzji Komisji Europejskiej o odpowiednim stopniu ochrony (EU–US Data Privacy Framework).
                            </li>
                            <li>Cookies analityczne i marketingowe uruchamiają się dopiero po wyrażeniu zgody w banerze wyświetlanym przy pierwszej wizycie. Do tego momentu są zablokowane — Serwis korzysta z trybu zgody Google (Consent Mode v2). Cookies niezbędne do działania Serwisu nie wymagają zgody.</li>
                            <li>Zgodę można w każdej chwili zmienić lub wycofać, klikając <strong>„Ustawienia ciasteczek”</strong> w stopce Serwisu. Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania, które odbyło się przed jej wycofaniem.</li>
                        </ol>
                    </AnimatedSection>

                    <AnimatedSection delay={0.6}>
                        <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-4">§ 6 Postanowienia końcowe</h2>
                        <p>Zawsze wiesz gdzie mnie znaleźć. Napisz na maila <strong>kontakt@wuyo.pl</strong> jeśli masz jakiekolwiek wątpliwości lub pytania o swoje dane.</p>
                        <p className="mt-4 text-sm text-white/50">Ostatnia aktualizacja: 27.10.2026.</p>
                    </AnimatedSection>
                </div>
            </div>
        </main>
    );
}
