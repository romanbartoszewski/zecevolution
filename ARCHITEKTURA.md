# Architektura projektu (C / B / A) + warstwa prezentacji

## 0) Status dokumentu
Ten dokument definiuje strukturę repozytorium i reguły pracy warstwami **C / B / A**.  
Jest normatywny organizacyjnie (jak porządkujemy treści), ale nie definiuje ontologii.

---

## 1) Fundament
### 1.1 Węzeł
**Węzeł = jednostka strukturalna analizy (neutralna ontologicznie).**  
Realizm jest wyłącznie instrumentalny: traktujemy węzły „jak realne”, bo to umożliwia testy i modelowanie, bez deklaracji metafizycznej.

### 1.2 KGR (minimalna definicja robocza)
**KGR = próg strukturalny, przy którym system:**
1) wytwarza model własnej architektury,
2) używa tego modelu do modyfikacji własnych reguł działania.

Definicja operacyjna i kryteria progu są w: `B/specyfikacje/kgr_threshold.md`.

---

## 2) Warstwy projektu

### C — warstwa heurystyczna (eksploracja)
**Rola:** generowanie hipotez, narracji, intuicji, pomysłów.  
**Własności:** może być sprzeczna, nie musi być precyzyjna, może używać metafor.  
**Zakaz:** C nie jest źródłem definicji normatywnych.

Lokalizacja:
- `C/manifest/` – cele, manifest, vision
- `C/narracje/` – narracje i modele intuicyjne
- `C/notatki/` – pomysły surowe i szkice

### B — warstwa operacyjna (model systemowy)
**Rola:** definicje, specyfikacje, testy, protokoły, kryteria falsyfikacji.  
**Własności:** ma być jednoznaczna, testowalna, redukowalna do rdzenia.  
**Zasada:** jeśli coś ma obowiązywać „w projekcie”, musi mieć postać B.

Lokalizacja:
- `B/mechanika/` – terminologia i zasady
- `B/specyfikacje/` – specyfikacje operacyjne (np. KGR threshold)
- `B/kryteria/` – kryteria procesowe (np. kanonizacja)
- `B/brief_B.md` – jednowiadomościowy brief do audytów

### A — ambicja ontologiczna (niezałożona)
**Rola:** ewentualny rezultat emergentny, jeśli B wymusi jednoznaczne roszczenia ontologiczne.  
**Zasada krytyczna:** A nie może być używana jako argument wzmacniający B ani C.  
Na tym etapie A jest wyłącznie „rejestrem możliwych hipotez”, jeśli się pojawi.

---

## 3) Warstwa prezentacji (poza C/B/A)
### docs/ — interfejs (GitHub Pages)
`docs/` zawiera statyczny interfejs projektu i jest publikowany przez GitHub Pages.  
To jest warstwa **prezentacji/narzędzi**, nie warstwa definicji koncepcji.

Zasady:
- `docs/` nie jest ani C ani B (nie wprowadza definicji KGR).
- UI może wizualizować dane/strukturę, ale „prawda definicyjna” jest w B.

---

## 4) Kanon i logi
### Kanon
**Kanon** to lista elementów uznanych za „obowiązujące roboczo” po przejściu przez B.  
Kryteria są w: `B/kryteria/kanonizacja.md`.

Lokalizacja:
- `kanon/` – zatwierdzone pozycje (wynik procesu)

### Logi
`logi/` to historia zmian, krytyka, notatki rewizyjne.

---

## 5) Zasady pracy (operacyjne)
1) Nowe pomysły trafiają do **C**.
2) Jeśli pomysł ma być używany jako definicja/teza w projekcie → musi zostać przepisany do **B**.
3) Każda analiza kończy się sekcjami:
   - Implikacje systemowe:
   - Ryzyko:
   - Czy naruszono poziomy C/B/A:
4) Jeśli pojawia się spór „czy to już istnieje jako pojęcie gdzie indziej”:
   - w B wymagamy **warunku odróżniającego** + **testów negatywnych**,
   - inaczej trafia do C jako narracja (bez roszczeń nowości).

---

## 6) Źródło prawdy (dla asystentów / modeli)
Jeśli prosimy modele o ocenę KGR lub pracę na definicjach:
- Podajemy najpierw zestaw B:
  - `B/mechanika/terminologia.md`
  - `B/mechanika/zasady.md`
  - `B/specyfikacje/kgr_threshold.md`
  - `B/brief_B.md`
  - (opcjonalnie) `B/kryteria/kanonizacja.md`
- Treści z C podajemy tylko, jeśli prosimy o eksplorację.

`docs/` podajemy modelom tylko, jeśli pytanie dotyczy interfejsu/implementacji UI.

---

## Implikacje systemowe:
- Repo wymusza separację heurystyki i definicji, co zmniejsza dryf i rebranding.
- UI jest jawnie odseparowany od definicji, więc nie miesza poziomów.

## Ryzyko:
- Jeśli zaczniemy wkładać definicje do `docs/`, wróci chaos semantyczny.
- Jeśli kanon będzie rósł bez testów negatywnych, stanie się listą życzeń.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono reguły operacyjne pracy).
- **A:** nie.
