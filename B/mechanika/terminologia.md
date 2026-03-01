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
**Parametr `θ`**: nastawa w ramach tej samej reguły/tej samej struktury (tuning).  
Zmiana `θ` nie zmienia formy reguły, tylko jej konfigurację.

### Przestrzeń reguł / klasa reguł (𝓕) — definicja formalna robocza
**`𝓕`** = rodzina reguł `{F_i}` o wspólnej roli (mapowanie `S×X→S`), gdzie `i` indeksuje **strukturę** reguły: np. operator, topologię, zestaw dopuszczalnych operacji/ograniczeń, generator reguł.

Intuicja:
- `𝓕` = „zbiór form reguł”
- `θ` = „nastawy w ramach formy”

### Zmiana θ vs zmiana 𝓕 (nóż rozróżniający)
- **Zmiana `θ` (tuning):** modyfikacja parametrów przy stałej strukturze reguły.
- **Zmiana `𝓕` (meta-zmiana):** dodanie/usunięcie/zamiana struktury reguły (`F_i ↔ F_j`) lub modyfikacja generatora/ograniczeń zmieniająca zbiór dopuszczalnych form.

**Test rozróżniający (operacyjny):**
- jeśli po zmianie system zyskuje/utraca możliwość wykonywania klasy transformacji, której wcześniej nie miał (albo traci możliwość jej zaniechania) → traktujemy to jako zmianę `𝓕`;
- jeśli zmienia się tylko „jak dobrze” w ramach tej samej formy → to zmiana `θ`.

---

## 3) Modele wewnętrzne

### Model (M)
**Model `M`** = wewnętrzna struktura informacyjna wykorzystywana do przewidywania i/lub sterowania.

### Model opisowy
**Model opisowy**: przewiduje stany `s` przy założeniu stałych reguł `F` / stałej `𝓕`.

### Model kontrfaktyczny (wymagany dla KGR)
**Model kontrfaktyczny**: przewiduje skutki hipotetycznych zmian w `𝓕` („co się stanie, jeśli zmienię formę reguł”), zanim zmiana zostanie wdrożona.

Kryterium dowodowe (skrót):
- w KGR nie uznajemy „implicit model” bez wykazania przewagi vs baseline i/lub ablacji funkcji modelu (szczegóły w specyfikacji).

---

## 4) Meta-poziom

### Meta-kontrola (G)
**Meta-kontrola `G`**: mechanizm, który wykorzystuje `M` do modyfikowania `𝓕` (nie tylko stanu, nie tylko `θ`).  
To sterowanie **regułami**, nie tylko przebiegiem.

### Walidacja / aktualizacja (U)
**Walidacja `U`**: mechanizm aktualizacji `M` na podstawie rozjazdu przewidywanie↔rzeczywistość po wdrożeniu zmiany `𝓕`.  
To nie jest „dowolny feedback”, tylko walidacja predykcji kontrfaktycznych.

---

## 5) Próg (threshold)
**Próg** w projekcie = stabilne wejście w pętlę `F→M→G→F` z walidacją `U`, a nie metafora.  
Operacyjnie: domyślnie min. 3 pełne cykle + brak jednorazowego „fajerwerku”; dopuszczalne kryteria domenowe (okno czasowe, konwergencja).

---

## 6) KGR (skrót definicyjny)
**KGR** = próg, przy którym system spełnia łącznie:
- kontrfaktyczny self-model `M` (dowód: przewaga vs baseline **i** ablacja; patrz specyfikacja),
- meta-kontrolę `G` zmieniającą `𝓕` (nie tylko `θ`),
- walidację `U`,
- stabilność progu.

Źródło normatywne: `B/specyfikacje/kgr_threshold.md` (v0.5).

---

## Implikacje systemowe:
- Terminologia domyka „nóż” (θ vs 𝓕), więc spory o klasyfikację przypadków granicznych są rozstrzygalne.
- Minimalizuje ryzyko „wszystko jest KGR”.

## Ryzyko:
- Test rozróżniający wymaga jasnego opisu „możliwości klasy transformacji” w danej domenie.
- W systemach społecznych nadal wysokie ryzyko błędu nośnika („ludzie mają model” ≠ „system ma model”).

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono słownik operacyjny).
- **A:** nie.
