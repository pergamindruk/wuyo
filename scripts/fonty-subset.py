# -*- coding: utf-8 -*-
"""Przycina fonty wuyo.pl do realnie potrzebnego zestawu znakow.

Uruchamianie (wymaga: pip install fonttools brotli):
    python scripts/fonty-subset.py
Pliki zrodlowe .ttf pobierz z https://github.com/google/fonts (licencja OFL)
i polóz obok skryptu. Wynik wgraj do public/fonts/.

Zakres dobrany tak, zeby objac: cala lacine podstawowa, wszystkie polskie znaki,
oraz Latin-1 (nazwiska i nazwy firm zachodnioeuropejskich: Müller, Nuñez, Beyoncé).
Poza tym tylko ta interpunkcja i te symbole, ktorych strona faktycznie uzywa.
Emoji celowo pominiete - te rysuje font systemowy, nie nasz.
"""
import subprocess, sys, pathlib

ZAKRES = ",".join([
    "U+0020-007E",              # lacina podstawowa
    "U+00A0-00FF",              # Latin-1: ü ö ä ñ ç é ß ° ² × ÷ § ·
    "U+0104-0107",              # Ą ą Ć ć
    "U+0118-0119",              # Ę ę
    "U+0141-0144",              # Ł ł Ń ń
    "U+015A-015B",              # Ś ś
    "U+0179-017C",              # Ź ź Ż ż
    "U+0152-0153,U+0160-0161,U+0178,U+017D-017E",  # Œ Š Ÿ Ž - czeste w tekstach zachodnich
    "U+2010-2027,U+2030,U+2039-203A",              # mysliniki, cudzyslowy, bullet, wielokropek
    "U+20AC",                   # euro
    "U+2122",                   # znak towarowy
    "U+2190-2199",              # strzalki
    "U+2212,U+2215,U+2260,U+2264,U+2265",          # matematyka
    "U+2605,U+2606,U+2713,U+2717,U+2726",          # gwiazdki i ptaszki
    "U+FEFF,U+FFFD",
])

def zbuduj(zrodlo, cel, osie=None):
    src = zrodlo
    if osie:
        tmp = "t-" + pathlib.Path(cel).stem + ".ttf"
        subprocess.run([sys.executable, "-m", "fontTools.varLib.instancer",
                        zrodlo, *osie.split(), "-o", tmp],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        src = tmp
    subprocess.run([sys.executable, "-m", "fontTools.subset", src,
        f"--unicodes={ZAKRES}", f"--output-file={cel}", "--flavor=woff2",
        "--layout-features=kern,liga,calt,ccmp,mark,mkmk,locl,rlig",
        "--name-IDs=1,2,3,4,6", "--drop-tables+=DSIG",
        "--no-hinting", "--desubroutinize"],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return pathlib.Path(cel).stat().st_size

# opsz=14 - Inter to tekst ciagly; wght plynne, bo uzywamy od light po black
wyniki = [
    ("Inter",   zbuduj("Inter.ttf", "../public/fonts/inter-subset.woff2", "opsz=14 wght=100:900")),
    ("Syne",    zbuduj("Syne.ttf", "../public/fonts/syne-subset.woff2", "wght=600:800")),
    ("Goldman", zbuduj("Goldman-Bold.ttf", "../public/fonts/goldman-subset.woff2")),
]
for n, b in wyniki:
    print(f"{n:<10}{b/1024:>8.1f} KB")
