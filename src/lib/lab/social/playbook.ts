/**
 * Zasady postów WUYO w jednym miejscu, dla generatora /lab/post.
 * Źródła: SOCIAL MEDIA - STRATEGIA/STRATEGIA_SM_2026.md (filary, formaty, głos),
 * narzedzia/content-tydzien/prompt-content.md (warsztat: hooki, ból, 3 formaty, CTA),
 * miniatury_ai.py (okładka w stylu YouTube) i ustalenia Mateusza (content, nie oferta).
 * Zmiana zasad = zmiana tutaj i w prompt-content.md (nocny generator tygodnia).
 */

export const PILLARS = {
    ekspert: 'EKSPERT (40%): wiedza, którą właściciel małej firmy wykorzysta sam. Konkretne błędy ("dlaczego Twoje logo nie działa"), decyzje projektowe i dlaczego. Głos: pewny, jak ktoś, kto widział to 100 razy.',
    dowod: 'DOWÓD (30%): prawdziwa realizacja, detal druku, proces. TYLKO z faktów podanych przez Mateusza. Historia "chciał X, zrobiłem Y, efekt Z". Skromnie, fakty mówią same.',
    zasieg: 'ZASIĘG (20%): opinia, która polaryzuje przekonanie (nie osobę): "Canva to nie logo", "szablon za 500 zł widać". Liczby i rachunek straty z treści. Jeden "wróg" = przekonanie.',
    czlowiek: 'CZŁOWIEK (10%): kulisy pracy bez filtra, moment, gdy projekt nie idzie, opinia o branży. Autentycznie, bez motywacyjnych haseł.',
} as const

export type Pillar = keyof typeof PILLARS
export type PostFormat = 'karuzela' | 'rolka' | 'post'
export type CtaGoal = 'zapis' | 'komentarz' | 'udostepnienie' | 'wejscie'

export const FORMATS: Record<PostFormat, string> = {
    karuzela: 'KARUZELA 5-7 slajdów: slajd 1 = okładka z hasłem; środkowe = jedna wskazówka na slajd (nagłówek do 8 słów + jedno zdanie "jak to zastosować"); ostatni = podsumowanie + CTA. Mało znane, praktyczne rady, nic oczywistego.',
    rolka: 'ROLKA / SHORTS pion 9:16, 30-45 s, max 100 słów, do nagrania telefonem w pracowni. Jedno nagranie idzie na Instagram Reels, Facebook Reels i YouTube Shorts. Hook w 1-3 s (napis na ekranie, ciche odtwarzanie), problem, w którym widz się rozpozna, krótka scena z pracy, wniosek, CTA. Co 5-7 s [ZMIANA] (nowy kadr, zbliżenie, napis). Bezpośrednie spojrzenie w obiektyw, prawdziwe biurko. Napisy na ekranie przez cały film. Bez muzyki z prawami autorskimi.',
    post: 'POST Z GRAFIKĄ: jedna myśl, okładka jako jedyna grafika, tekst rozwija hasło i kończy się pytaniem albo prośbą o zapis.',
}

export const CTA_GOALS: Record<CtaGoal, string> = {
    zapis: 'zapis posta (Saves liczą się najbardziej: ktoś chce wrócić = potencjalny klient). CTA typu "Zapisz przed następnym drukiem".',
    komentarz: 'komentarz zdaniowy (nie emoji): pytanie, na które łatwo odpowiedzieć z własnego doświadczenia, albo "który błąd masz?".',
    udostepnienie: 'udostępnienie: treść, którą właściciel firmy prześle wspólnikowi albo znajomemu z branży ("wyślij temu, kto zamawia ulotki").',
    wejscie: 'wejście na wuyo.pl: post daje konkret, a pełną odpowiedź ma wpis na blogu (link w poście na FB, na IG "link w bio").',
}

export const SOCIAL_RULES = `GŁOS NA SOCIAL (Mateusz, WUYO, Rzeszów):
- Ekspert bez korporacyjnego bełkotu. Bezpośredni i pewny, bo szanuje czas odbiorcy. Miły i kulturalny, nigdy złośliwy wobec ludzi.
- Pierwsza osoba ("drukuję", "robię", "sprawdzam"), do czytelnika na "Ty". Krótkie zdania. Pierwsze zdanie od razu konkret, bez powitań i przedstawiania się.
- Przewaga, którą wolno opowiadać (jako historię, nie ofertę): projektuję, drukuję i wycinam sam, u siebie w Rzeszowie.
- ODBIORCA: właściciel małej firmy z Rzeszowa i okolic, 40-55 lat, nie zna się na grafice, liczy każdą złotówkę, przekonują go konkrety i przykłady.
- TO JEST CONTENT, NIE OFERTA: żadnych cen studia, pakietów, "napisz po wycenę", "zamów", "mam dla Ciebie". Sprzedaje to, że Mateusz zna się na rzeczy.
- NIE wymyślaj realizacji, klientów, opinii, liczb ani wyników. Dowód tylko z faktów podanych przez Mateusza.
- NIE wymyślaj też doświadczeń Mateusza ("robię to u siebie co roku", "ostatnio klient mi powiedział", "widzę to codziennie"). Bez faktów pisz radę wprost, bez udawanej anegdoty.
- Mocne zdania kieruj w przekonanie, nie w ludzi. Bez "nienawidzę", "głupi", wyśmiewania i straszenia.
- Fakty techniczne (spady, CMYK, rozdzielczość, formaty, przepisy) tylko pewne. Nie wiesz = nie podawaj liczby.
- Zakazane: kompleksowy, dedykowany, profesjonalny, rozwiązania, innowacyjny, premium, synergia, długie myślniki, "Pan/Pani", ukośniki typu "zadowolony/a", anglicyzmy (także w hashtagach: nie "branding", "design", "tip", "marketing"). Bez obiecywania terminów.
- Facebook do 900 znaków, 1-2 hashtagi (#Rzeszów + tematyczny). Instagram do 600 znaków, 3-5 hashtagów, w tym #Rzeszów. Max 1 emoji na post. Bez sztucznej presji czasu.`

export const HOOK_WORKSHOP = `WARSZTAT (zrób w głowie po kolei, zanim napiszesz):
1. Wypisz 8 konkretnych frustracji odbiorcy w tym temacie ("drukarnia zepsuła kolory", "strona nie dzwoni"). Każdą zamień w hook do 10 słów jego językiem.
2. Dopisz 4 hooki z formatów, które teraz niosą się w niszy: "niepopularna opinia", "przed i po", "proces krok po kroku", "jedno mocne zdanie do kamery", "rachunek: ile tracisz".
3. Wybierz 3 najmocniejsze i każdemu przypisz inny haczyk: luka ciekawości, strach przed stratą, konkretna liczba z treści, myśl odbiorcy w 1. osobie, ostrzeżenie. Pierwszy = najlepszy.
4. Sprawdź: czy właściciel firmy zatrzyma kciuk? Czy post spełnia obietnicę hooka? Czy ktoś by to zapisał albo wysłał dalej i dlaczego?`

export const SHORTS_RULES = `YOUTUBE SHORTS (tylko dla rolki):
- "tytul": do 70 znaków, pytanie albo obietnica jak hook, z frazą, którą ludzie wpisują (np. "Ile kosztuje logo dla firmy?"). Bez clickbaitu, bez wielkich liter i emoji.
- "opis": 2-3 zdania o czym jest film + link do wpisu na wuyo.pl (jeśli jest) + 3 hashtagi, pierwszy #Shorts.
- "tagi": 5-8 fraz po polsku (np. "logo dla firmy", "grafik Rzeszów").`

export const COVER_RULES = `OKŁADKA (pierwsza grafika, styl najlepszych miniatur z YouTube):
- "haslo": 2-4 słowa WIELKIMI LITERAMI, max 22 znaki. Okładka + pierwsze zdanie posta = jedna historia: hasło dokłada stawkę, zaskoczenie albo myśl odbiorcy, nie streszcza posta.
  Jeden haczyk (np. "TEGO NIE WIEDZIAŁEM", "TRACISZ KLIENTÓW", "3 MM ZAPASU", "SERIO TAK WYJDZIE?", "NIE DRUKUJ TEGO"). Proste słowa, na "Ty". Bez cen, "WUYO", anglicyzmów i emoji.
- "akcent": jedno słowo skopiowane z hasła, będzie żółte (to z emocją albo liczbą).
- "scena": opis zdjęcia PO ANGIELSKU, 50-90 słów. Jedna osoba ze świata ODBIORCY (właściciel/ka małej firmy 26-55 lat: warsztat, sklep, piekarnia, salon, biuro, hala) LOOKS STRAIGHT INTO THE CAMERA z jedną naturalną emocją pasującą do hasła (zdziwienie, "serio?", ulga, pewność, wątpliwość). Bez przesadnych min i rąk przy głowie.
  Trzyma albo stoi przy DUŻYM, dosłownym przedmiocie z tematu (wydruk, wizytówki, telefon ze stroną, koszulka, szyld, umowa). Subject in the LOWER 55-60% of a 4:5 portrait frame, calm darker blurred background in the TOP 40% for the headline. Strong key light on the face, real Polish place, ordinary, not luxurious.
  No readable text, letters, digits, handwriting, logos or brands anywhere. To ilustracja, nie klient: w tekście posta nie sugeruj, że osoba ze zdjęcia to klient.`

/** Styl dla modelu obrazu (to samo co narzedzia/content-tydzien/zdjecia_ai.py). */
export const COVER_PHOTO_STYLE =
    'A real photograph, never a 3D render or illustration, portrait 4:5, true proportions, real skin and materials. ' +
    'High-impact social media cover photo in the style of the best YouTube thumbnails: the subject sits in the LOWER 55-60% ' +
    'of the frame, big and close; the TOP 40% is calm, simple and darker (out-of-focus background, no objects, no faces) ' +
    'because a headline will be placed there. Strong key light on the face and the main object, darker background, punchy ' +
    'contrast, rich but natural colors, very shallow depth of field. Ordinary Polish small-business reality, no luxury. ' +
    'Signal yellow (#FFD60A) at most once as a real object. ABSOLUTELY NO readable text, letters, numbers, handwriting, ' +
    'logos or brand names anywhere, no watermark; screens and papers blurred. No exaggerated open-mouth faces, no hands ' +
    'on the head, no stock grin, no arrows or emoji.'
