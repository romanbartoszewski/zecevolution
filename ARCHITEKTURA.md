# Architektura projektu (C / B / A)

## 0) Status dokumentu
Ten dokument definiuje strukturę repozytorium i reguły pracy warstwami **C / B / A**.  
Jest normatywny organizacyjnie (jak porządkujemy treści), ale nie definiuje jeszcze ontologii.

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

### A — ambicja ontologiczna (niezałożona)
**Rola:** ewentualny rezultat emergentny, jeśli B wymusi jednoznaczne roszczenia ontologiczne.  
**Zasada krytyczna:** A nie może być używana jako argument wzmacniający B ani C.  
Na tym etapie A jest wyłącznie „rejestrem możliwych hipotez”, jeśli się pojawi.

---

## 3) Kanon i logi
### Kanon
**Kanon** to lista elementów uznanych za „obowiązujące roboczo” po przejściu przez B.  
Kryteria są w: `B/kryteria/kanonizacja.md`.

Lokalizacja:
- `kanon/` – zatwierdzone pozycje (wynik procesu)

### Logi
`logi/` to historia zmian, krytyka, notatki rewizyjne.

---

## 4) Zasady pracy (operacyjne)
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

## 5) Źródło prawdy (dla asystentów / modeli)
Jeśli prosimy modele (Claude/Grok/ChatGPT) o ocenę KGR lub pracę na definicjach:
- Podajemy najpierw zestaw B:
  - `B/mechanika/terminologia.md`
  - `B/mechanika/zasady.md`
  - `B/specyfikacje/kgr_threshold.md`
  - (opcjonalnie) `B/kryteria/kanonizacja.md`
- Treści z C podajemy tylko, jeśli prosimy o eksplorację lub generowanie hipotez.

---

## Implikacje systemowe:
- Repo wymusza separację heurystyki i definicji, co zmniejsza dryf i rebranding.
- KGR jest oceniane przez B (specyfikacje + testy), nie przez narracje.

## Ryzyko:
- Jeśli zaczniemy wkładać definicje do C, wróci chaos semantyczny.
- Jeśli kanon będzie rósł bez testów negatywnych, stanie się listą życzeń.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono reguły operacyjne pracy).
- **A:** nie (A jest zablokowane jako argument).
