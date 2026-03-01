# KGR – próg meta-reorganizacji (specyfikacja operacyjna v0.3)

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Cel: definicje + kryteria progu + bateria testów destrukcyjnych (anty-rebranding).  
Ten dokument jest normatywny dla użycia terminu **KGR** w projekcie.

---

## 1) Zakres i założenia
- **Węzeł** = jednostka strukturalna analizy; realizm wyłącznie **instrumentalny** (traktujemy „jak realne”, bo to umożliwia testy; brak roszczeń metafizycznych).
- **System** = układ z dynamiką w czasie, z wyodrębnialnymi stanami, transformacjami i kanałami wpływu.
- KGR to **warunek strukturalno-funkcjonalny**, nie etykieta narracyjna.

---

## 2) Definicje minimalne (B)

### 2.1 Reguła, przestrzeń reguł, klasa reguł
- **Reguła `F`**: mechanizm przejścia mapujący stan i wejścia na następny stan (lub dystrybucję stanów):  
  `s_{t+1} ~ F(s_t, x_t; θ)`
- **Parametry `θ`**: nastawy w ramach tej samej reguły/tej samej klasy (tuning).
- **Klasa reguł `𝓕`**: zbiór dopuszczalnych reguł (rodzina modeli/architektur/operatorów/ograniczeń).
- **Zmiana klasy reguł**: przejście `𝓕_i → 𝓕_j` (zmiana formy reguł/architektury/operatorów/ograniczeń), a nie tylko `θ` w obrębie `𝓕_i`.

**Warunek odróżniający KGR od adaptacji:** KGR wymaga zmiany *przestrzeni reguł* lub mechanizmu generowania reguł, nie tylko strojenia parametrów.

### 2.2 Model własny (self-model) – operacyjnie
- **Model własny `M`**: wewnętrzna struktura informacyjna umożliwiająca przewidywanie skutków **kontrfaktycznych** zmian w `F` lub `𝓕` (tj. „co się stanie, jeśli zmienię regułę” zanim zmiana zostanie wykonana).

Rozróżnienie:
- **Model opisowy**: przewiduje stany przy stałych regułach.
- **Model kontrfaktyczny (wymagany w KGR)**: przewiduje skutki zmian reguł/klasy reguł.

### 2.3 Meta-kontrola i walidacja
- **Meta-kontrola `G`**: mechanizm, który używa `M` do modyfikowania `F` lub `𝓕` (wybór/konstruowanie reguł).
- **Walidacja `U`**: mechanizm aktualizacji `M` na podstawie błędu predykcji po zmianach w systemie.

---

## 3) Definicja KGR (B-min)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model `M`**: system potrafi generować i oceniać przewidywania skutków zmian w `F` lub `𝓕`.  
2) **Meta-kontrola `G`**: wnioski z `M` powodują zmiany w `F` lub `𝓕` (nie tylko parametry `θ`).  
3) **Sprzężenie walidacyjne `U`**: po zmianie reguł system aktualizuje `M` i/lub kryteria `G` na podstawie różnic przewidywanie↔rzeczywistość.

Wymagana pętla:
`F → M → G → F` oraz `F → U → M`.

---

## 4) Operacjonalizacja „progu” (order parameter) – trzy kandydaty

### 4.1 Φ: udział pętli meta-kauzalnej w regulacji (strukturalny)
Intuicja: „ile adaptacji płynie przez `F→M→G→F`”.

Definicja robocza:
`Φ = I(F→M→G→F) / I(całkowity wpływ regulacyjny)`

gdzie `I(·)` to miara wpływu/istotności kanału (np. ablacjami, analizą przyczynową, spadkiem metryki celu po wyłączeniu ścieżki).

**Kryterium progu (praktyczne):**
- KGR-kandydat, gdy `Φ` przekracza ustalony próg i utrzymuje się w czasie (nie jednorazowy epizod).
- Dla systemów inżynieryjnych: estymacja przez ablacjami („wyłącz M” / „wyłącz G”) i porównanie wpływu na wynik.

### 4.2 Ψ: przewaga kontrfaktycznego modelu nad baseline (funkcjonalny)
Intuicja: self-model musi dawać przewagę nad heurystykami bez-modelowymi.

Definicja:
`Ψ = ΔJ_z_modelem − ΔJ_baseline`

gdzie:
- `J` = metryka celu (sprawność, koszt, stabilność, przeżywalność, etc.),
- baseline = procedura modyfikacji reguł bez kontrfaktycznego `M` (random search, lokalne heurystyki, tuning parametrów).

**Kryterium progu:**
- KGR-kandydat, gdy `Ψ > 0` stabilnie, a przewaga rośnie na zadaniach wymagających zmian klasy reguł.

### 4.3 Ω: intensywność przełączeń klas reguł (dyskretność)
Intuicja: KGR powinno korelować z nieciągłym skokiem „mocy reorganizacji”.

Definicja:
`Ω = f(częstość przejść 𝓕_i↔𝓕_j, skala zmiany, poprawa J)`

**Kryterium progu:**
- KGR-kandydat, gdy pojawia się nieciągłość (skok) w `Ω` powiązana z trwałą poprawą `J` i utrzymaniem stabilności (brak natychmiastowej degradacji).

---

## 5) Reguła decyzji: kiedy mówimy „KGR zaszło”
System uznajemy za **KGR**, jeśli:
- spełnia definicję **B-min** (sekcja 3),
- oraz zachodzi co najmniej jedno z:
  - `Φ` przekracza próg strukturalny,
  - `Ψ` stabilnie dodatnie vs baseline,
  - `Ω` wykazuje nieciągłość skorelowaną z poprawą `J`.

Preferencja: `Φ` jako najbardziej definicyjne; `Ψ` i `Ω` jako testy wzmacniające.

---

## 6) Bateria testów destrukcyjnych (anty-rebranding)

### N1: cybernetyka II rzędu bez zmiany klasy reguł
**Konstrukcja:** system ma self-reference/obserwuje własne obserwowanie, ale nie może zmieniać `𝓕` (tylko stan i parametry).  
**Wynik oczekiwany:** **nie** jest KGR (brak warunku 2 z B-min).

Jeśli N1 przechodzi jako KGR → definicja jest za szeroka (rebranding cybernetyki II rzędu).

### N2: meta-learning tuningowy bez kontrfaktycznego self-modelu
**Konstrukcja:** system optymalizuje hiperparametry/procedury, ale bez jawnej kontrfaktycznej oceny skutków zmian reguł (czarny tuning/search).  
**Wynik oczekiwany:** **nie** jest KGR (brak warunku 1).

Jeśli N2 przechodzi jako KGR → „model” jest pustym słowem.

### P: zwycięstwo kontrfaktyczności
**Konstrukcja:** porównaj system KGR-kandydata z baseline bez `M` na zadaniach wymagających zmian klasy reguł (tuning nie wystarczy).  
**Wynik oczekiwany:** `Ψ>0` i/lub wysokie `Φ`, oraz stabilna poprawa `J`.

Jeśli P nie zachodzi → KGR nie ma wartości operacyjnej (jest narracją).

---

## 7) Granice i wyłączenia
- Sama autopoiesis / samoprodukcja komponentów **nie implikuje KGR** bez kontrfaktycznego `M` i meta-zmiany `𝓕`.
- Klasyczne regulatory adaptacyjne / homeostaza / PID / termostat **nie są KGR** (zwykle brak zmiany `𝓕`, brak kontrfaktyczności).

---

## 8) Implikacje / ryzyka (B)
Implikacje:
- KGR w tej specyfikacji ≠ „system jest samo-referencyjny”.  
  KGR = dominująca pętla meta-kauzalna + kontrfaktyczność + zmiana przestrzeni reguł.
- „Krytyczność” ma sens tylko jako wskaźniki `Φ/Ψ/Ω` + testy N1/N2/P.

Ryzyka:
- `Φ` wymaga sensownej miary wpływu; bez tego grozi arbitralność.
- `Ψ` zależy od doboru baseline; zły baseline daje fałszywe KGR.
- `Ω` może mylić „częste zmiany” z „sensowną reorganizacją” — dlatego musi być związane z `J` i stabilnością.
