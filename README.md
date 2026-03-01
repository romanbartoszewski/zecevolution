# zecevolution — projekt KGR (C / B / A)

## TL;DR
Projekt testuje KGR jako uniwersalny model reorganizacji systemów złożonych.

**KGR (roboczo):** próg, przy którym system utrzymuje kontrfaktyczny self-model i używa go do zmiany przestrzeni reguł (nie tylko tuningu), z walidacją zwrotną.

Źródło normatywne definicji KGR: `B/specyfikacje/kgr_threshold.md`.

---

## Jak czytać repo
Repo jest rozdzielone warstwami:

- **C/** — heurystyka (eksploracja, narracje, pomysły surowe; może być sprzeczne).
- **B/** — operacyjne definicje/specyfikacje/testy (musi być jednoznaczne).
- **kanon/** — lista zatwierdzonych pozycji (wynik procesu C → B → kanon).
- **logi/** — historia i krytyka.

Zasada: jeśli coś ma obowiązywać w projekcie, musi istnieć w **B**.

Szczegóły: `ARCHITEKTURA.md`.

---

## Pakiet dla modeli (Claude / Grok / ChatGPT)
Jeśli pytasz model o ocenę KGR, podawaj w pierwszej kolejności:

1) `ARCHITEKTURA.md`
2) `B/mechanika/terminologia.md`
3) `B/mechanika/zasady.md`
4) `B/specyfikacje/kgr_threshold.md`
5) (opcjonalnie) `B/kryteria/kanonizacja.md`

Treści z `C/` dawaj tylko, jeśli prosisz o eksplorację.

---

## Status (na dziś)
- KGR: specyfikacja operacyjna v0.3 (robocze)
- Kanon: format z datami i linkami do B

---

## Implikacje systemowe:
- Repo wymusza separację heurystyki i definicji, co zmniejsza dryf semantyczny i rebranding.

## Ryzyko:
- Jeśli definicje zaczną lądować w C, struktura przestanie działać.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (README steruje użyciem repo).
- **A:** nie.
