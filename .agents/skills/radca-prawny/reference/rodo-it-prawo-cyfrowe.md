# RODO i prawo cyfrowe — checklist

Kontekst WUYO: dane klientów przetwarzane w panelu `/lab` (CRM, finanse, kalendarz), narzędzia analityczne i e-mail marketing na stronie publicznej. Ten plik to checklist strukturalny — konkretne kary finansowe i terminy zawsze weryfikuj przez WebSearch.

## Podstawy prawne przetwarzania (art. 6 RODO)

Dla każdego procesu przetwarzania danych (np. dane w CRM, newsletter, formularz kontaktowy) zidentyfikuj podstawę:
- **Zgoda** — musi być dobrowolna, konkretna, świadoma, jednoznaczna; łatwa do wycofania (np. zapis do newslettera).
- **Wykonanie umowy** — dane niezbędne do realizacji zlecenia dla klienta (np. dane kontaktowe i rozliczeniowe w CRM).
- **Obowiązek prawny** — np. dane do celów podatkowo-księgowych.
- **Prawnie uzasadniony interes** — np. podstawowa analityka ruchu na stronie, marketing bezpośredni istniejących klientów (wymaga testu równowagi interesów).

## Obowiązek informacyjny

Sprawdź, czy przy każdym punkcie zbierania danych (formularz kontaktowy, newsletter, umowa z klientem) jest dostępna informacja o: tożsamości administratora, celu i podstawie przetwarzania, okresie retencji, odbiorcach danych, prawach osoby (dostęp, sprostowanie, usunięcie, sprzeciw, przenoszenie), prawie wniesienia skargi do UODO.

## Cookies i consent

- Rozróżnij cookies niezbędne (bez zgody) od analitycznych/marketingowych (wymagają zgody przed załadowaniem, tzw. „prior consent”).
- Sprawdź czy banner cookie umożliwia odrzucenie równie łatwo jak akceptację.
- Zweryfikuj czy narzędzia analityczne/reklamowe (np. zewnętrzne skrypty) są uwzględnione w polityce prywatności i podlegają zgodzie.

## Umowa powierzenia przetwarzania danych (DPA / art. 28)

Wymagana przy każdym dostawcy przetwarzającym dane w imieniu WUYO jako administratora, np.:
- Hosting / infrastruktura chmurowa (w tym Supabase i inne bazy danych używane w `/lab`).
- Narzędzia CRM/e-mail marketingu.
- Narzędzia analityczne.

Checklist DPA: zakres i cel przetwarzania, kategorie danych i osób, obowiązki podprocesora, zgoda na dalsze podpowierzenie, środki bezpieczeństwa, pomoc przy realizacji praw osób, zwrot/usunięcie danych po zakończeniu umowy, prawo do audytu.

## Retencja danych

Każdy zbiór danych powinien mieć zdefiniowany okres przechowywania powiązany z celem (np. dane rozliczeniowe — okres wynikający z przepisów podatkowych; dane marketingowe — do wycofania zgody lub okresu nieaktywności).

## Zgłaszanie naruszeń (art. 33-34)

- Obowiązek zgłoszenia naruszenia do UODO **co do zasady w ciągu 72h** od stwierdzenia, chyba że naruszenie nie skutkuje ryzykiem dla praw i wolności osób — zweryfikuj aktualne wytyczne UODO.
- Jeśli naruszenie stwarza wysokie ryzyko dla osób, dodatkowo wymagane jest poinformowanie osób, których dane dotyczą.
- Prowadź wewnętrzny rejestr wszystkich naruszeń, nawet niezgłoszonych do UODO.

## Ocena skutków dla ochrony danych (DPIA)

Wymagana, gdy przetwarzanie może powodować wysokie ryzyko dla praw osób, np.: przetwarzanie na dużą skalę danych wrażliwych, systematyczne monitorowanie, profilowanie z istotnymi skutkami prawnymi. Dla typowej agencji kreatywnej rzadko wymagana, ale warto ocenić przy nowych funkcjach (np. zaawansowane profilowanie marketingowe klientów).

## Transfery międzynarodowe

Jeśli narzędzia SaaS (CRM, analytics, hosting, AI) przechowują dane poza EOG (np. w USA), zweryfikuj mechanizm transferu: decyzja o adekwatności (np. ramy UE-USA dotyczące ochrony danych, jeśli dostawca jest certyfikowany), standardowe klauzule umowne (SCC), lub inne zabezpieczenia. To dotyczy też narzędzi AI wykorzystywanych w `/lab` do przetwarzania danych klientów.

## Kiedy skierować do specjalisty

Incydent z naruszeniem danych, spór z UODO, kontrola UODO, transfer danych wrażliwych, wdrożenie nowego produktu przetwarzającego dane na dużą skalę — zawsze rekomenduj konsultację z inspektorem ochrony danych (IOD/DPO) lub radcą prawnym specjalizującym się w RODO.
