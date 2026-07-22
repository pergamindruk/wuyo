# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Architektura, komendy i konwencje projektu: @AGENTS.md

## Zasady kodu

- Domyślnie React Server Components. `"use client"` tylko dla realnie interaktywnych wysp
  (konfigurator, koszyk, drawer). Uzasadnij każde nowe `"use client"`.
- TypeScript strict, zero `any`.
- Ceny ZAWSZE jako liczby całkowite w groszach. Formatowanie do PLN tylko w warstwie widoku.
- Nazwy plików i komponentów po angielsku, teksty UI po polsku.

## Bezpieczeństwo — twarda reguła

Cena wyliczona w przeglądarce jest WYŁĄCZNIE podglądem. Autorytatywną cenę pozycji
koszyka wylicza backend WooCommerce. Nigdy nie ufamy cenie przysłanej z frontu.
Pliki klientów trafiają do prywatnego bucketu, nigdy pod publiczny URL.

## Czego nie robić

- Nie instalować nowych zależności bez pytania.
