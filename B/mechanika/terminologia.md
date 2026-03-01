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

## 2) Dynamika i reguły

### Reguła (F)
**Reguła `F`**: mechanizm przejścia mapujący `(s_t, x_t)` na `s_{t+1}` (lub rozkład stanów):  
`s_{t+1} ~ F(s_t, x_t; θ)`

### Parametr (θ)
**Parametr `θ`**: nastawa w ramach tej samej struktury reguły (tuning).  
Zmiana `θ` nie zmienia formy reguły, tylko jej konfigurację.

### Przestrzeń reguł / klasa reguł (𝓕)
**`𝓕`** = rodzina reguł `{F_i}` o wspólnej roli (mapowanie `S×X→S`), gdzie `i` indeksuje **strukturę** reguły: operator, topologię, zestaw dopuszczalnych operacji/ograniczeń, generator reguł.

Intuicja:
- `𝓕` = „zbiór form reguł”
- `θ` = „nastawy w ramach formy”

### Zmiana θ vs zmiana 𝓕 (nóż rozróżniający)
- **Zmiana `θ` (tuning):** modyfikacja parametrów przy stałej strukturze reguły.
- **Zmiana `𝓕` (meta-zmiana):** dodanie/usunięcie/zamiana struktury reguły (`F_i ↔ F_j`) lub modyfikacja generatora/ograniczeń zmieniająca zbiór dopuszczalnych form.

### Parametry zakresu (granica, która często udaje 𝓕)
Wiele systemów ma parametry „zasięgu/zasobów” (np. głębokość search, horyzont planowania, budżet obliczeń).

**Zasada:** jeśli zmienia się tylko zasięg/zasoby w ramach tego samego operatora (np. „ten sam algorytm, tylko głębiej/dłużej”), traktujemy to jako **θ**, nie `𝓕`.  
Zmiana `𝓕` wymaga zmiany operatora/generatora/ograniczeń (zmiany formy), nie tylko „więcej/mniej tego samego”.

### Test rozróżniający (operacyjny)
- jeśli po zmianie system zyskuje/utraca możliwość wykonywania klasy transformacji, której wcześniej nie miał (albo traci możliwość jej zaniechania) → zmiana `𝓕`;
- jeśli zmienia się tylko „jak dobrze / jak daleko” w ramach tej samej formy → zmiana `θ`.

---

## 3) Modele wewnętrzne

### Model (M)
**Model `M`** = wewnętrzna struktura informacyjna wykorzystywana do przewidywania i/lub sterowania.

### Model opisowy
**Model opisowy**: przewiduje stany `s` przy założeniu stałych reguł `F` / stałej `𝓕`.

### Model kontrfaktyczny (wymagany dla KGR)
**Model kontrfaktyczny**: przewiduje skutki hipotetycznych zmian w `𝓕` („co się stanie, jeśli zmienię formę reguł”), zanim zmiana zostanie wdrożona.

**Dowód funkcji M w KGR (skrót):**
- przewaga vs baseline (C1) **oraz**
- ablacja **lub zakłócenie** funkcji M (C3) pogarsza zdolność do meta-zmiany `𝓕`.

---

## 4) Meta-poziom

### Meta-kontrola (G)
**Meta-kontrola `G`**: mechanizm, który wykorzystuje `M` do modyfikowania `𝓕` (nie tylko stanu, nie tylko `θ`).  
To sterowanie **regułami**, nie tylko przebiegiem.

### Walidacja / aktualizacja (U)
**Walidacja `U`**: mechanizm aktualizacji `M` na podstawie rozjazdu przewidywanie↔rzeczywistość po wdrożeniu zmiany `𝓕`.  
To nie jest „dowolny feedback”, tylko walidacja predykcji kontrfaktycznych.

---

## 5) Stabilność i metryki (dla progu)
- `J` = metryka celu (zależna od domeny).
- `J_baseline` = wynik baseline (system bez M / bez kontrfaktycznej pętli).
- `δ` = dopuszczalna degradacja poniżej baseline w cyklu (domyślnie `δ = 0`).

Stabilność progu (domyślna): min. 3 pełne cykle + w każdym cyklu `J ≥ J_baseline − δ`.

---

## 6) KGR (skrót definicyjny)
**KGR** = próg, przy którym system spełnia łącznie:
- kontrfaktyczny self-model `M` (C1 + C3),
- meta-kontrolę `G` zmieniającą `𝓕` (nie tylko `θ`),
- walidację `U`,
- stabilność progu.

KGR traktujemy jako własność czasową/epizodyczną: system może wejść w KGR i może z niego wypaść.

Źródło normatywne: `B/specyfikacje/kgr_threshold.md` (v0.6).

---

## Implikacje systemowe:
- Terminologia domyka sporne przypadki „zakres vs nowy operator” (AlphaZero-like).
- Stabilność jest policzalna (J_baseline, δ), więc mniej uznaniowości.

## Ryzyko:
- Bez jasno zdefiniowanego `J` i baseline nadal będzie pole do manipulacji.
- W systemach społecznych nadal wysokie ryzyko błędu nośnika.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono słownik operacyjny).
- **A:** nie.
