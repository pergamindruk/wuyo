# Instrukcje Budowy Nowoczesnych i Zoptymalizowanych Stron WWW ("start_www")

Ta instrukcja to "Złoty Standard" budowania stron internetowych. Poniższe zasady mają być absolutnym priorytetem podczas projektowania i pisania kodu każdego nowego projektu. Strony mają być nie tylko działające, ale przede wszystkim ultra-nowoczesne, zoptymalizowane, bezpieczne i "sprzedające".

Celem jest tworzenie stron w standardzie wiodących agencji ("Premium Aesthetic") dla klientów wymagających najwyższej jakości.

---

## 1. Technologia i Architektura (Stack)

*   **Fundament:** React + Next.js (App Router). Używamy Next.js ze względu na bezkonkurencyjne SSR/SSG, co gwarantuje natychmiastowe ładowanie stron.
*   **Aplikacje Typu One-Page / Multi-Page:** Routing powinien być obsługiwany wewnątrz Next.js (`src/app`).
*   **Stylizacja:** Tailwind CSS w najnowszej wersji. Żadnych preprocesorów (SASS) ani CSS-in-JS psujących wydajność – stawiamy na krystaliczny, wbudowany Vanilla CSS (`globals.css` dla zmiennych systemowych) oraz klasy użytkowe Tailwind dla reużywalności.
*   **Animacje:** Framer Motion – dla płynnych animacji przewijania, ujawniania elementów i płynnych przejść mikrointerakcji. Konieczne na stronach premium.
*   **Ikony:** Lucide React – lekkie i czyste ikony wektorowe SVG zamiast paczek spowalniających stronę (np. FontAwesome).

---

## 2. Design i Aspekt Premium (Aesthetic & UX)

Wygląd strony to pierwsze, co ocenia klient. Kod ma być piękny nie tylko logicznie, ale i wizualnie.

*   **Odrzucamy pospolitość:** Nigdy nie projektuj aplikacji o standardowym i suchym wyglądzie (np. czysty biały + primary blue). Skup się na designie premium, który od razu przyciągnie wzrok (efekt WOW).
*   **Nowoczesne kolory i kontrasty:** Zawsze wdrażaj przemyślaną paletę barw (np. deep navy, ciemne tryby z neonowo-złotymi detalami). Używaj gładkich gradientów i tekstur zamiast płaskich kolorów.
*   **Szkło (Glassmorphism):** Używaj subtelnego rozmycia teł (`backdrop-blur`) dla headerów czy kart funkcyjnych, by dodać głębi i nowoczesności.
*   **Mikro-interakcje:** Przyciski, karty ofertowe, nagłówki muszą reagować na wskaźnik myszy (`hover:scale`, `hover:shadow-lg`). Strona musi wydawać się "żywa".
*   **Typografia:** Konsekwentna typografia (np. Inter, Outfit z Google Fonts) wstrzyknięta za pomocą `next/font/google`. Zróżnicowane grubości fontów dla kontrastu informacyjnego – duży, odważny `bold` dla nagłówków, lekki do czytania. Należy zachować idealną czytelność.

---

## 3. Web Performance (Maksymalna Szybkość)

Gwarancją wyniku PageSpeed Score >90 jest optymalizacja po stronie front-endu.

*   **Zarządzanie Obrazami:** ZAWSZE używaj wbudowanego komponentu w Next.js: `<Image />` z `next/image`. Konvertuje obrazki z każdym wczytaniem na małe formaty nowej generacji (WebP/AVIF).
*   **Sztywne Wymiary Grafik:** Wszystkie obrazy muszą mieć ustawioną właściwość rozmiaru lub `fill` + `object-fit` by unikać **CLS (Cumulative Layout Shift)** – ekran nie powinien "skakać" podczas ładowania.
*   **Lazy Loading:** Dla elementów (zdjęć, map) na dole strony nie należy ładować obrazków przy wchodzeniu strony (w `<Image />` jest to domyślne).
*   **Lekkie animacje:** Animuj tylko własności sprzętowe (`transform` - `translate`, `scale` oraz `opacity`). Nigdy nie animuj `margin`, `padding`, czy `width`, gdyż obciąża to procesor graficzny.
*   **Zabójcy wydajności (UNIKAĆ):**
    *   Nigdy nie używaj `repeat: Infinity` w `framer-motion` dla efektów typu `box-shadow` lub ciężkich filtrów – to stale obciąża procesor/GPU. Jeśli potrzebujesz pulsującej kropki, użyj lekkiego `animate-pulse` w Tailwind.
    *   Dla listenerów `mousemove` lub `scroll` zawsze używaj throttlingu/debouncingu lub `requestAnimationFrame` (RAF), aby nie przeciążać głównego wątku.

---

## 4. Wzorowe SEO i Dostępność (A11y)

To podstawa pakietów WWW. Witryna jest po to, aby ją odnaleziono i każdy mógł z niej skorzystać.

*   **Semantyczny HTML5:** Do struktury odgórnej używaj właściwych tagów: `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`, `<aside>`. Unikaj wrzucania wszystkiego w `<div>`!
*   **Struktura Nagłówków:** Czysta i hierarchiczna struktura, tj. dokładnie i tylko JEDEN tag `<h1>` na całą podstronę, zachowana kolejność: `h1` -> `h2` -> `h3`.
*   **Metadane SEO (Next.js Metadata API):** Korzystaj silnie z opcji wbudowanych. 
    *   **ZAKAZ:** Nigdy nie dodawaj ręcznie tagu `<head>` w `layout.tsx`. Next.js zarządza tym przez obiekt `metadata`.
    *   **PWA / Favicony:** Manifest, apple-touch-icon i theme-color dodawaj wyłącznie przez pola `manifest: '...'`, `icons: { ... }` oraz `other: { 'theme-color': '...' }` w obiekcie `metadata`.
*   **Dostępność (WCAG):** 
    *   Dodaj `skip-to-content` link dla użytkowników klawiaturowych.
    *   Używaj `aria-label` dla przycisków ikonowych (np. hamburger menu, social media icons).
    *   Zadbaj o porządny kontrast tekstu (min 4.5:1).

---

## 5. Responsywność i Mobile First (RWD)

Ruch na mobile w dzisiejszych czasach > 60%.

*   **Zasada:** Pisz komponenty Mobile-First. Zaczynaj budować komponent na małe ekrany, układ pionowy (`flex-col`), po czym skaluj dodając dyrektywy breakpointów zaczynające się od `md:` lub `lg:`.
*   **Nawigacja Kotwicowa (Smooth Scroll):** W menu mobilnym (hamburgerze) przy klikaniu w kotwice (`#kontakt`), zawsze najpierw zamknij menu, a potem (po krótkim delayu) wywołaj scroll, aby uniknąć błędów w renderowaniu Next.js.

---

## 6. Bezpieczeństwo i Techniczne BHP

*   **Nagłówki Bezpieczeństwa:** Zawsze konfiguruj `next.config.mjs` z nagłówkami `Content-Security-Policy`, `X-Frame-Options` (ochrona przed Clickjacking) oraz `Strict-Transport-Security`.
*   **Environment Variables:** Tajne klucze tylko w `.env.local`. Publiczne – w `.env.example`.
*   **Ochrona Formularzy:** Walidacja po obu stronach + mechanizmy antyspamowe (honeypot).

---

## 7. Rozwiązywanie problemów lokalnych (Troubleshooting)

Jeśli strona lokalnie "zamula" lub nie chce się wczytać (biały ekran / błędy kompilacji):
1.  **Zabij procesy Node:** Czasem stary serwer "wisi" w tle. Zastosuj: `Get-Process -Name "node" | Stop-Process -Force`.
2.  **Wyczyść cache:** Usuń folder `.next` (nie bój się, zostanie zbudowany od nowa).
3.  **Start od zera:** `npm run dev` na czystym środowisku naprawia 90% dziwnych problemów renderingu.

---

## 8. Jak podchodzić do nowo zapoczątkowanych projektów?

1.  **Design System First:** Wymyśl Wyjątkowy Design System (Premium Aesthetic).
2.  **Setup technologiczny:** Inicjalizacja Next.js, minimalizacja zbędnych pakietów.
3.  **Modułowość:** Utrzymuj czystość w plikach, oddzielając komponenty.
4.  **Audit on Debug:** Odpoczynamy od audytu PageSpeed i SEO już w trakcie pisania pierwszych sekcji.

*Ta instrukcja pozwala dostarczać aplikacje webowe bezbłędne w warstwie UI/UX i SEO, wykraczające na 200% poza standard. Buduj używając instrukcji Start WWW!*
