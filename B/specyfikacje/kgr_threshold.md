# KGR – próg meta-reorganizacji (specyfikacja operacyjna v0.4)

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Cel: definicje + kryteria progu + bateria testów destrukcyjnych (anty-rebranding).  
Ten dokument jest źródłem normatywnym dla użycia terminu **KGR** w projekcie.

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
- **Przestrzeń reguł**: to, co może zostać zmienione na poziomie `F`/`𝓕` (forma reguły, topologia, operator, ograniczenia, generator reguł) – nie tylko `θ`.
- **Zmiana klasy reguł**: przejście `𝓕_i → 𝓕_j` (zmiana formy reguł/architektury/operatorów/ograniczeń), a nie tylko `θ` w obrębie `𝓕_i`.

**Warunek odróżniający KGR od adaptacji:** KGR wymaga zmiany *przestrzeni reguł* (`F` lub `𝓕`) albo mechanizmu generowania reguł, nie tylko strojenia parametrów.

### 2.2 Model własny (self-model) – operacyjnie
- **Model własny `M`**: wewnętrzna struktura informacyjna umożliwiająca przewidywanie skutków **kontrfaktycznych** zmian w `F` lub `𝓕` (tj. „co się stanie, jeśli zmienię regułę” zanim zmiana zostanie wykonana).

Rozróżnienie:
- **Model opisowy**: przewiduje stany przy stałych regułach `F`/stałej `𝓕`.
- **Model kontrfaktyczny (wymagany w KGR)**: przewiduje skutki zmian reguł/klasy reguł.

### 2.3 Meta-kontrola i walidacja
- **Meta-kontrola `G`**: mechanizm, który używa `M` do modyfikowania `F` lub `𝓕` (wybór/konstruowanie reguł).
- **Walidacja `U`**: mechanizm aktualizacji `M` na podstawie błędu predykcji po zmianach reguł.

---

## 3) Definicja KGR (B-min)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model `M`**: system potrafi generować i oceniać przewidywania skutków zmian w `F` lub `𝓕`.  
2) **Meta-kontrola `G`**: wnioski z `M` powodują zmiany w `F` lub `𝓕` (nie tylko parametry `θ`).  
3) **Sprzężenie walidacyjne `U`**: po zmianie reguł system aktualizuje `M` i/lub kryteria `G` na podstawie różnic przewidywanie↔rzeczywistość.

Wymagana pętla:
`F → M → G → F` oraz `F → U → M`.

---

## 4) Kryteria operacyjne dla kluczowych warunków (domknięcie)

### 4.1 Kryterium operacyjne „kontrfaktycznego self-modelu”
Żeby `M` nie było etykietą („implicit model”), wymagane jest spełnienie co najmniej jednego z:

- **C1 (przewaga kontrfaktyczna):** system systematycznie wybiera zmiany `F/𝓕`, które dają lepszy wynik niż baseline bez-modelowy (random/local), na zadaniach wymagających zmian reguł, a nie tylko tuningu.
- **C2 (wrażliwość na zmianę reguł):** `M(F') ≠ M(F)` dla co najmniej jednej kontrfaktycznej modyfikacji, a różnica wpływa na wybór działania (nie jest „opisowa po fakcie”).
- **C3 (ablacja):** wyłączenie `M` degraduje zdolność do sensownej meta-zmiany reguł, przy zachowaniu reszty systemu.

Jeśli nie da się wykazać C1/C2/C3, to `M` traktujemy jako niedookreślone i KGR nie jest zaliczone.

### 4.2 Kryterium operacyjne „zmiany przestrzeni reguł”
Żeby odciąć tuning:

- **Tuning parametryczny (NIE KGR):** zmienia się `θ`, ale `𝓕` jest stałe (np. gradient descent na stałej architekturze, standardowy trening modelu).
- **Meta-zmiana reguł (KGR-kandydat):** zmienia się `F` lub `𝓕` (architektura, operator, ograniczenia, generator reguł), a zmiana jest inicjowana przez wnioskowanie na `M`.

**Test negatywny (obowiązkowy przykład):**
- Standardowy **gradient descent** na stałej architekturze (parametry `θ` się zmieniają, `𝓕` stałe) → **nie przechodzi** warunku 2.

### 4.3 Walidacja zwrotna ≠ zwykłe sprzężenie zwrotne
Walidacja w KGR to nie „jakikolwiek feedback”. To:
- system dokonuje przewidywania kontrfaktycznego `M(F')`,
- wdraża `F'`,
- mierzy rozjazd przewidywanie↔rzeczywistość,
- aktualizuje `M` i/lub kryteria `G`.

**Test negatywny:**
- system zmienia reguły, ale nie weryfikuje przewidywań `M` i nie aktualizuje `M/G` → **nie KGR**.

---

## 5) Operacjonalizacja „progu” (order parameter) – trzy kandydaty

### 5.1 Φ: udział pętli meta-kauzalnej w regulacji (strukturalny)
Intuicja: „ile adaptacji płynie przez `F→M→G→F`”.

Definicja robocza:
`Φ = I(F→M→G→F) / I(całkowity wpływ regulacyjny)`

gdzie `I(·)` to miara wpływu/istotności kanału (np. ablacjami, analizą przyczynową, spadkiem metryki celu po wyłączeniu ścieżki).

**Kryterium progu (praktyczne):**
- KGR-kandydat, gdy `Φ` przekracza ustalony próg i utrzymuje się w czasie (nie jednorazowy epizod).

### 5.2 Ψ: przewaga kontrfaktycznego modelu nad baseline (funkcjonalny)
Intuicja: self-model musi dawać przewagę nad heurystykami bez-modelowymi.

Definicja:
`Ψ = ΔJ_z_modelem − ΔJ_baseline`

**Kryterium progu:**
- KGR-kandydat, gdy `Ψ > 0` stabilnie, a przewaga rośnie na zadaniach wymagających zmian klasy reguł.

### 5.3 Ω: intensywność przełączeń klas reguł (dyskretność)
Intuicja: KGR powinno korelować z nieciągłym skokiem „mocy reorganizacji”.

Definicja:
`Ω = f(częstość przejść 𝓕_i↔𝓕_j, skala zmiany, poprawa J)`

**Kryterium progu:**
- KGR-kandydat, gdy pojawia się nieciągłość (skok) w `Ω` powiązana z trwałą poprawą `J` i stabilnością.

---

## 6) Reguła decyzji: kiedy mówimy „KGR zaszło”
System uznajemy za **KGR**, jeśli:
- spełnia definicję **B-min** (sekcja 3),
- spełnia co najmniej jedno z kryteriów C1/C2/C3 (sekcja 4.1),
- oraz zachodzi co najmniej jedno z:
  - `Φ` przekracza próg strukturalny,
  - `Ψ` stabilnie dodatnie vs baseline,
  - `Ω` wykazuje nieciągłość skorelowaną z poprawą `J`.

Preferencja: `Φ` jako najbardziej definicyjne; `Ψ` i `Ω` jako testy wzmacniające.

---

## 7) Bateria testów destrukcyjnych (anty-rebranding)

### N1: cybernetyka II rzędu bez zmiany klasy reguł
**Konstrukcja:** self-reference/obserwacja własnych operacji bez zdolności zmiany `𝓕` (tylko stan i parametry).  
**Wynik:** **nie** jest KGR.

### N2: tuning bez kontrfaktycznego self-modelu
**Konstrukcja:** optymalizacja parametrów/hiperparametrów bez kontrfaktycznej oceny skutków zmian reguł (search/tuning).  
**Wynik:** **nie** jest KGR.

### N3: zmiana reguł bez walidacji predykcji
**Konstrukcja:** system zmienia `F/𝓕`, ale nie weryfikuje predykcji `M` i nie aktualizuje `M/G`.  
**Wynik:** **nie** jest KGR.

### P: zwycięstwo kontrfaktyczności
**Konstrukcja:** KGR-kandydat vs baseline bez `M` na zadaniach wymagających zmian klasy reguł.  
**Wynik:** `Ψ>0` i/lub wysokie `Φ`, stabilna poprawa `J`.

---

## 8) Przypadki graniczne (żeby nie udawać, że jest prosto)
To nie są definicje, tylko rozstrzygnięcia robocze wg kryteriów powyżej:

- **Standardowy trening modelu ML (gradient descent, stała architektura):** zazwyczaj **nie KGR** (tuning `θ`, brak zmiany `𝓕`).
- **AutoML / NAS / systemy modyfikujące architekturę na podstawie modelu skutków:** potencjalnie **KGR-kandydaci**, jeśli spełniają 4.1 i walidację 4.3.
- **Ewolucja biologiczna jako proces (bez wewnętrznego modelu kontrfaktycznego systemu jako całości):** zazwyczaj **nie KGR** (brak `M` w sensie operacyjnym).
- **Organizacje społeczne:** przypadek wysokiego ryzyka błędu nośnika (czy „system” ma `M`, czy mają go jednostki). Wymaga ostrożnej operacjonalizacji `M/G/U`.

---

## Implikacje / ryzyka (B)
Implikacje:
- KGR = dominująca pętla meta-kauzalna + kontrfaktyczność + zmiana przestrzeni reguł + walidacja predykcji.
- „Krytyczność” ma sens tylko jako wskaźniki `Φ/Ψ/Ω` + testy N1/N2/N3/P.

Ryzyka:
- `Φ` wymaga sensownej miary wpływu; bez tego grozi arbitralność.
- `Ψ` zależy od doboru baseline; zły baseline daje fałszywe KGR.
- `Ω` może mylić „częste zmiany” z „sensowną reorganizacją”.
- Sekcja 8 (przypadki graniczne) musi być utrzymywana zgodnie ze zmianami definicji, inaczej stanie się folklorem.
