# KGR – próg meta-reorganizacji (specyfikacja operacyjna v0.6)

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Cel: definicje + kryteria progu + bateria testów destrukcyjnych (anty-rebranding).  
Ten dokument jest źródłem normatywnym dla użycia terminu **KGR** w projekcie.

---

## 1) Zakres i założenia
- **Węzeł** = jednostka strukturalna analizy; realizm wyłącznie **instrumentalny**.
- **System** = układ z dynamiką w czasie, z wyodrębnialnymi stanami, transformacjami i kanałami wpływu.
- KGR to **warunek strukturalno-funkcjonalny**, nie etykieta narracyjna.

---

## 2) Definicje minimalne (B)

### 2.1 Reguła, parametr, przestrzeń reguł
- **Reguła `F`**: mechanizm przejścia mapujący stan i wejścia na następny stan (lub dystrybucję stanów):  
  `s_{t+1} ~ F(s_t, x_t; θ)`
- **Parametry `θ`**: nastawy w ramach tej samej struktury reguły.
- **Przestrzeń reguł `𝓕` (formalnie, roboczo)**: rodzina reguł `{F_i}` o wspólnej roli (mapowanie `S×X→S`), gdzie `i` indeksuje **strukturę** reguły: operator, topologię, zestaw dopuszczalnych operacji/ograniczeń, generator reguł.

**Zmiana `θ` (tuning):** modyfikacja parametrów przy stałej strukturze reguły.  
**Zmiana `𝓕` (meta-zmiana):** dodanie/usunięcie/zamiana struktury reguły (`F_i ↔ F_j`) lub modyfikacja generatora/ograniczeń zmieniająca zbiór dopuszczalnych form.

### 2.2 Parametry zakresu operacji: granica θ/𝓕 (uszczelnienie)
Wiele systemów ma „parametry zakresu” (np. głębokość search, horyzont planowania, budżet obliczeń), które zwiększają *zasięg* działania bez zmiany operatora.

**Zasada rozstrzygająca:**
- jeśli zmiana dotyczy tylko *zasięgu/zasobów* w ramach tego samego operatora (np. „ten sam MCTS, tylko głębiej”), traktujemy to jako **θ** (nie `𝓕`);
- jeśli zmiana wprowadza/usuwa **inny operator/generator/ograniczenia** (np. przejście z MCTS do innego algorytmu przeszukiwania, albo dodanie nowego operatora wnioskowania), traktujemy to jako zmianę **`𝓕`**.

To rozstrzyga przypadki typu „AlphaZero zmienia głębokość”: zwykle tuning `θ`, nie KGR przez G.

### 2.3 Test rozróżniający (operacyjny)
- jeśli po zmianie system zyskuje/utraca możliwość wykonywania klasy transformacji, której wcześniej nie miał (albo traci możliwość jej zaniechania) → zmiana `𝓕`;
- jeśli zmienia się tylko „jak dobrze / jak daleko” w ramach tej samej formy → zmiana `θ`.

---

## 3) Definicja KGR (B-min)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model `M`**: system generuje i ocenia przewidywania skutków zmian w `𝓕` **przed** wdrożeniem.  
2) **Meta-kontrola `G`**: wnioski z `M` inicjują zmianę `𝓕` (nie tylko tuning `θ`).  
3) **Walidacja `U`**: po zmianie `𝓕` system porównuje przewidywania `M` z rzeczywistością i aktualizuje `M` i/lub kryteria `G`.  
4) **Próg/stabilność**: 1–3 zachodzą stabilnie wg kryterium z sekcji 6.

Wymagana pętla:
`F → M → G → F` oraz `F → U → M`.

---

## 4) Kryteria operacyjne dla self-modelu (anty-„implicit model”)

### 4.1 Minimalny wymóg dowodowy dla `M`
Żeby `M` nie było etykietą, wymagane jest:

- **C1 (przewaga nad baseline):** stabilna przewaga nad baseline bez-modelowym na zadaniach wymagających zmian `𝓕`,
**ORAZ**
- **C3 (ablacja lub zakłócenie):** wyłączenie *albo istotne zakłócenie funkcji `M`* pogarsza zdolność do sensownej meta-zmiany `𝓕`.

Zakłócenie (przykłady operacyjne): dodanie szumu do reprezentacji, ograniczenie horyzontu predykcji, degradacja kanału predykcji, ograniczenie pamięci modelu — byle miało interpretację „funkcja M została osłabiona”.

C2 jest pomocnicze:
- **C2 (wrażliwość kontrfaktyczna):** `M(𝓕') ≠ M(𝓕)` dla co najmniej jednej kontrfaktycznej modyfikacji, a różnica wpływa na wybór w `G`.

---

## 5) Kryteria operacyjne „zmiany 𝓕” i walidacji

### 5.1 „Zmiana 𝓕” – test negatywny wymagany
- **Standardowy gradient descent na stałej architekturze**: zmienia `θ`, nie `𝓕` → **nie KGR**.

### 5.2 Walidacja `U` ≠ zwykły feedback
Walidacja w KGR to:
- predykcja kontrfaktyczna `M(𝓕')`,
- wdrożenie `𝓕'`,
- pomiar rozjazdu przewidywanie↔rzeczywistość,
- aktualizacja `M` i/lub kryteriów `G`.

**Test negatywny:** zmiana `𝓕` bez walidacji predykcji i bez aktualizacji `M/G` → **nie KGR**.

---

## 6) Próg/stabilność – metryka minimalna (bez subiektywności)

### 6.1 Kryterium stabilności (domyślne)
Warunki 1–3 uznajemy za stabilnie spełnione, jeśli:
- wystąpią co najmniej **N = 3** pełne cykle `zmiana 𝓕 → walidacja → aktualizacja M/G`,
**oraz**
- w każdym cyklu metryka celu `J` nie spada poniżej `J_baseline` o więcej niż `δ` (domyślnie `δ = 0`, czyli nie spada poniżej baseline).

To jest domyślny „anti-fajerwerk”: brak jednorazowego skoku kosztem trwałej degradacji.

**Uwaga:** N=3 i δ to minimum operacyjne. Jeśli domena ma lepsze kryterium stabilności (okno czasowe, konwergencja, test generalizacji) — zastępujemy je i zapisujemy w protokole.

### 6.2 KGR jako własność czasowa
KGR traktujemy jako własność **czasową/epizodyczną**: system może wejść w stan spełnienia KGR i może z niego wypaść, jeśli przestaje spełniać warunki stabilności.  
W kanonie możemy osobno oznaczać „KGR-epizodyczne” vs „KGR-trwałe” (jeśli wystąpi w danej klasie systemów).

---

## 7) Wskaźniki progu (opcjonalnie, pomocnicze)
- **Φ**: wpływ pętli `F→M→G→F` na `J` (estymowany ablacjami / wpływem na wynik, nie liczbą wywołań).
- **Ψ**: przewaga nad baseline (wymaga sensownie zdefiniowanego baseline’u; preferowany w black-box).
- **Ω**: raportuj jako **dwie wartości**: (a) zdarzenia przełączeń `𝓕`, (b) ich wpływ na `J`. Nie redukuj do jednego skalara bez jawnej definicji agregacji.

---

## 8) Bateria testów destrukcyjnych (anty-rebranding)
- **N1:** self-reference/cybII bez zmiany `𝓕` → nie KGR.
- **N2:** trial-and-error tuning/search bez predykcji przed wdrożeniem → nie KGR.
- **N3:** zmiana `𝓕` bez walidacji predykcji i bez aktualizacji `M/G` → nie KGR.
- **N4:** „lookup-table kontrfaktyczność” (brak generalizacji i brak realnej aktualizacji) → nie KGR.

Test pozytywny:
- **P:** KGR-kandydat bije baseline bez `M` na zadaniach wymagających zmian `𝓕`, z utrzymaniem stabilności wg sekcji 6.

---

## 9) Przypadki graniczne (rozstrzygnięcia robocze)
- **Model-based RL**: nie KGR, jeśli nie wykazuje zmiany `𝓕` (a jedynie aktualizację polityki/parametrów w stałej klasie).
- **AlphaZero/MCTS zmieniające głębokość/budżet**: zwykle tuning `θ` (zakres), nie zmiana `𝓕`.
- **AutoML/NAS**: może być KGR-kandydatem, jeśli spełnia warunki i stabilność.
- **Ewolucja biologiczna jako selekcja**: zwykle nie KGR (brak predykcji przed wdrożeniem).
- **PGO/JIT/RLHF/CAI**: traktować jako test zakresu; czy przejście ma być akceptowane, to decyzja polityki projektu (kanon), nie automatyczny warunek definicyjny.

---

## Implikacje / ryzyka (B)
Implikacje:
- Uszczelniono granicę θ/𝓕 dla parametrów zakresu (eliminuje spory typu AlphaZero).
- C3 jest testowalne także dla systemów bez modularnej ablacji (zakłócenie funkcji M).
- Stabilność ma minimalny parametr `δ` (koniec subiektywności „fajerwerku”).

Ryzyko:
- Wymaga jawnego zdefiniowania `J` i `J_baseline` dla danej domeny (inaczej δ nie ma sensu).
- „Zakłócenie M” musi być sensownie zaprojektowane, inaczej będzie arbitralne.
