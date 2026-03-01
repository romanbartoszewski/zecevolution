# Terminologia (B) – słownik operacyjny

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Cel: ujednolicić znaczenia pojęć używanych w projekcie (redukcja dryfu semantycznego i rebrandingu).

Zasada: jeśli termin jest używany normatywnie w B, musi mieć definicję operacyjną tutaj lub w specyfikacji.

---

## 1) Jednostki analizy

### Węzeł
**Węzeł** = jednostka strukturalna analizy (neutralna ontologicznie).  
Realizm jest instrumentalny: traktujemy węzły „jak realne”, bo to umożliwia modelowanie i testy; bez deklaracji metafizycznej.

### System
**System** = układ z dynamiką w czasie, w którym można wyróżnić:
- stany `s_t`,
- wejścia/zakłócenia `x_t`,
- transformacje/reguły `F`,
- kanały wpływu (operacyjnie: zmiana A powoduje obserwowalną zmianę B).

---

## 2) Reguły i przestrzenie reguł

### Reguła (F)
**Reguła `F`**: mechanizm przejścia mapujący `(s_t, x_t)` na `s_{t+1}` (lub rozkład stanów):  
`s_{t+1} ~ F(s_t, x_t; θ)`

### Parametr (θ)
**Parametr `θ`**: nastawa w ramach tej samej struktury reguły (tuning).  
Zmiana `θ` nie zmienia formy reguły, tylko jej konfigurację.

### Dwa obiekty: 𝓕_sys vs 𝓕_obj (kluczowe dla KGR)
- **`𝓕_sys`**: przestrzeń reguł **własnych operacji systemu** (jedyna `𝓕` istotna dla KGR).
- **`𝓕_obj`**: przestrzeń reguł modelowanego obiektu (środowisko, dane, kod, proces zewnętrzny).

Model obiektu (`M_obj`) nie jest self-modelem. KGR wymaga self-modelu (`M_sys`) dotyczącego `𝓕_sys`.

### Przestrzeń reguł systemu (𝓕_sys)
**`𝓕_sys`** = rodzina reguł `{F_i}` o wspólnej roli (mapowanie `S×X→S`), gdzie `i` indeksuje **strukturę** reguły: operator, topologia, zestaw dopuszczalnych operacji/ograniczeń, generator reguł.

---

## 3) Nóż: zmiana θ vs zmiana 𝓕_sys

### Zmiana θ (tuning)
Zmiana parametrów `θ` przy stałej strukturze reguły.

### Zmiana 𝓕_sys (meta-zmiana)
Dodanie/usunięcie/zamiana struktury reguły (`F_i ↔ F_j`) lub modyfikacja generatora/ograniczeń zmieniająca zbiór dopuszczalnych form.

### Parametry zakresu (granica, która często udaje 𝓕_sys)
Jeśli zmienia się tylko zasięg/zasoby w ramach tego samego operatora (np. głębokość search, horyzont planowania, budżet), traktujemy to jako **θ**, nie `𝓕_sys`.  
Zmiana `𝓕_sys` wymaga nowego operatora/generatora/ograniczeń (zmiany formy).

### Test rozróżniający (operacyjny)
- jeśli po zmianie system zyskuje/utraca możliwość wykonywania klasy transformacji, której wcześniej nie miał (albo traci możliwość jej zaniechania) → zmiana `𝓕_sys`;
- jeśli zmienia się tylko „jak dobrze / jak daleko” w ramach tej samej formy → zmiana `θ`.

---

## 4) Modele i meta-poziom

### Self-model systemu (M_sys)
**`M_sys`** = kontrfaktyczny model własnych reguł (`𝓕_sys`), używany do wyboru zmian `𝓕_sys` przed wdrożeniem.

Dowód funkcji `M_sys` w KGR (skrót):
- C1: przewaga vs baseline na zadaniach wymagających zmian `𝓕_sys`,
- C3: ablacja lub zakłócenie `M_sys` pogarsza meta-zmiany `𝓕_sys`,
- C4 (anty-katalog): poprawna ocena co najmniej jednej zmiany `𝓕_sys'` spoza wcześniej widzianego katalogu + walidacja po wdrożeniu.

### Model obiektu (M_obj)
**`M_obj`** = model środowiska / danych / procesu zewnętrznego. Może być użyteczny, ale nie jest wystarczający dla KGR.

### Meta-kontrola (G)
**Meta-kontrola `G`**: mechanizm wykorzystujący `M_sys` do modyfikacji `𝓕_sys`.

### Walidacja (U)
**Walidacja `U`**: aktualizacja `M_sys` na podstawie rozjazdu predykcja↔rzeczywistość po wdrożeniu zmiany `𝓕_sys`.

---

## 5) Stabilność i metryki (dla progu)
- `J` = metryka celu (domena).
- `J_baseline` = wynik baseline.
- `δ` = dopuszczalna degradacja poniżej baseline w cyklu (domyślnie `δ = 0`).

Stabilność progu (domyślna): min. 3 cykle; w oknie 3 cykli dopuszczalny max 1 cykl poniżej `J_baseline − δ`, z powrotem w kolejnym cyklu.

---

## 6) KGR (skrót definicyjny)
**KGR** = próg, przy którym system spełnia łącznie:
- `M_sys` (C1 + C3 + C4),
- meta-kontrolę `G` zmieniającą `𝓕_sys` (nie tylko `θ`),
- walidację `U`,
- stabilność progu.

KGR jest własnością czasową/epizodyczną.

Źródło normatywne: `B/specyfikacje/kgr_threshold.md` (v0.7).

---

## Implikacje systemowe:
- Rozróżnienie `𝓕_sys` vs `𝓕_obj` domyka największą lukę (MBRL jako „model obiektu”).
- C4 blokuje „katalog NAS/lookup” bez wprowadzania intencjonalności.

## Ryzyko:
- W praktyce trzeba jawnie opisywać, co jest `𝓕_sys` w danej domenie.
- Projektowanie holdout form (C4) wymaga dyscypliny, inaczej będzie udawane.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono słownik operacyjny).
- **A:** nie.
