# Terminologia (B) – słownik operacyjny

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Cel: ujednolicić znaczenia pojęć używanych w projekcie (żeby uniknąć dryfu semantycznego i rebrandingu).

Zasada: jeśli termin jest używany w B, musi mieć definicję operacyjną tutaj lub w specyfikacji.

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
- kanały wpływu (przyczynowość operacyjna: „zmiana A powoduje zmianę B w obserwowalny sposób”).

---

## 2) Dynamika i reguły

### Reguła (F)
**Reguła `F`**: mechanizm przejścia mapujący `(s_t, x_t)` na `s_{t+1}` (lub rozkład stanów):  
`s_{t+1} ~ F(s_t, x_t; θ)`

### Parametr (θ)
**Parametr `θ`**: nastawa w ramach tej samej reguły/tej samej klasy reguł (tuning).  
Zmiana `θ` nie zmienia formy reguły, tylko jej konfigurację.

### Klasa reguł (𝓕)
**Klasa reguł `𝓕`**: zbiór dopuszczalnych reguł (rodzina modeli/architektur/operatorów/ograniczeń), np.:
- regulatory klasy PID,
- sieci o danej topologii,
- program z danym zestawem instrukcji,
- zbiór polityk decyzyjnych o określonej formie.

### Zmiana klasy reguł (𝓕_i → 𝓕_j)
**Zmiana klasy reguł**: przejście między rodzinami reguł (zmiana formy/architektury/operatorów/ograniczeń), a nie tylko tuning `θ`.  
To jest kluczowe rozróżnienie od adaptacji „parametrycznej”.

---

## 3) Modele wewnętrzne

### Model (M)
**Model `M`** = wewnętrzna struktura informacyjna wykorzystywana do przewidywania i/lub sterowania.

### Model opisowy
**Model opisowy**: przewiduje stany `s` przy założeniu stałych reguł `F` / stałej klasy `𝓕`.

### Model kontrfaktyczny (wymagany dla KGR)
**Model kontrfaktyczny**: przewiduje skutki hipotetycznych zmian w `F` lub `𝓕` („co się stanie, jeśli zmienię regułę / klasę reguł”), zanim zmiana zostanie wykonana.

Kryterium operacyjne:
- jeśli system nie potrafi wykazać przewagi w zadaniach wymagających zmian reguł (vs baseline bez-modelowy), to „model kontrfaktyczny” jest pustą etykietą.

---

## 4) Meta-poziom

### Meta-kontrola (G)
**Meta-kontrola `G`**: mechanizm, który wykorzystuje `M` do modyfikowania `F` lub `𝓕` (wybór/konstruowanie reguł).  
To nie jest zwykłe sterowanie stanem, tylko sterowanie **regułami**.

### Walidacja / aktualizacja (U)
**Walidacja `U`**: mechanizm aktualizacji `M` na podstawie błędu predykcji po zmianach w systemie (różnica przewidywanie↔rzeczywistość).

---

## 5) Próg (threshold)
**Próg** w projekcie = nie tylko metafora.  
Operacyjnie oznacza nieciągłość lub stabilne przekroczenie wskaźnika, który:
- koreluje z pojawieniem się pętli `F → M → G → F`,
- oraz daje przewagę funkcjonalną (np. `Ψ > 0` względem baseline).

W KGR używamy wskaźników `Φ/Ψ/Ω` (zob. `B/specyfikacje/kgr_threshold.md`).

---

## 6) KGR (skrót definicyjny)
**KGR** = próg, przy którym system spełnia łącznie:
- kontrfaktyczny self-model `M`,
- meta-kontrolę `G` zmieniającą `F` lub `𝓕` (nie tylko `θ`),
- walidację `U`,
- oraz kryterium progu (wg `Φ/Ψ/Ω` i testów N1/N2/P).

Źródło normatywne: `B/specyfikacje/kgr_threshold.md`.

---

## Implikacje systemowe:
- Terminologia wymusza rozróżnienie: tuning parametrów vs zmiana klasy reguł.
- Zmniejsza pole do „interpretacji” (np. wszystko jako „implicit model”).

## Ryzyko:
- Jeśli definicje będą naginane do przykładów, terminologia stanie się dekoracją (a nie narzędziem).
- W systemach społecznych łatwo o błąd nośnika („ludzie mają model” ≠ „system ma model”).

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono słownik operacyjny).
- **A:** nie.
