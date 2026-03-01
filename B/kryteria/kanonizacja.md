# Kanonizacja – kryteria przenoszenia treści do „kanon/” (B)

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Cel: zdefiniować, co znaczy „zatwierdzone” oraz jak treści przechodzą z C → B → kanon.

---

## 1) Definicje robocze
- **C (heurystyka)**: narracje, intuicje, hipotezy, pomysły surowe. Mogą być sprzeczne. Nie są normatywne.
- **B (operacyjne)**: definicje, specyfikacje, testy negatywne/pozytywne, protokoły. Mają być falsyfikowalne.
- **Kanon**: zbiór elementów, które przeszły minimalną kontrolę jakości B i są uznane za „obowiązujące roboczo” w projekcie.

---

## 2) Co może trafić do kanonu
Do kanonu trafiają wyłącznie elementy spełniające warunki:

1) **Jednoznaczny status warstwy**  
   Materiał musi mieć wskazane: czy to C czy B.  
   Do kanonu trafia treść B lub treść C *przepisana* na B.

2) **Definicja / teza w formie testowalnej**  
   Jeśli to pojęcie: musi mieć definicję operacyjną.  
   Jeśli to teza: musi mieć warunki obalenia lub przynajmniej testy negatywne.

3) **Powiązania**  
   Materiał musi linkować do:
   - terminologii (`B/mechanika/terminologia.md`) jeśli używa kluczowych pojęć,
   - odpowiedniej specyfikacji (np. `B/specyfikacje/kgr_threshold.md`), jeśli dotyczy KGR,
   - źródła w C (jeśli powstał jako rozwinięcie/podsumowanie).

4) **Sekcje końcowe (obowiązkowe)**  
   Każdy kandydat do kanonu kończy się:
   - Implikacje systemowe:
   - Ryzyko:
   - Czy naruszono poziomy C/B/A:

---

## 3) Procedura kanonizacji (minimalna)
Krok po kroku:

1) **Wpis w C** (pomysł / narracja / intuicja) ląduje w `C/...` i dostaje datę.
2) **Redukcja do B**: tworzymy/aktualizujemy dokument w `B/...`:
   - definicja,
   - warunki odróżniające,
   - testy destrukcyjne,
   - (opcjonalnie) metryki / order parameter.
3) **Przegląd destrukcyjny**:
   - jeśli nie przechodzi testów negatywnych → wraca do C jako „odrzucone / nierozstrzygnięte”,
   - jeśli przechodzi → idzie do kanonu jako wpis/pozycja.
4) **Wpis do kanonu**:
   - `kanon/zatwierdzonepomysly.md` dostaje nowy punkt z linkiem do właściwego dokumentu B.

W projekcie na tym etapie zatwierdza: **właściciel repo (Roman)**.

---

## 4) Kryteria odrzucenia (anty-bullshit)
Materiał NIE trafia do kanonu, jeśli:
- jest wyłącznie narracyjny (C) i nie ma wersji B,
- miesza warstwy (np. A jako „argument” dla B),
- jest niefalsyfikowalny lub tak elastyczny, że pasuje do wszystkiego,
- jest rebrandingiem bez warunku odróżniającego (np. KGR = „meta-learning” bez dodatkowego noża).

---

## Implikacje systemowe:
- Kanon przestaje być „ładną półką”, a staje się wynikiem procesu filtracji C → B.
- Ogranicza dryf i zmniejsza ryzyko, że Claude/Grok będą dyskutować o pojęciach bez rygoru.

## Ryzyko:
- Zbyt restrykcyjne kryteria mogą spowolnić iterację: wtedy więcej rzeczy zostaje w C.
- Zbyt luźne kryteria rozwodnią kanon i wróci chaos semantyczny.

## Czy naruszono poziomy C/B/A:
- **C:** nie (C nadal działa jako generator).
- **B:** tak (to jest mechanizm kontroli jakości).
- **A:** nie (A nie uczestniczy w procesie jako argument).
