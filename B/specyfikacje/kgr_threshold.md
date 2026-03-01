# KGR – próg meta-reorganizacji (specyfikacja operacyjna v0.7)

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

### 2.1 Dwa obiekty: reguły systemu vs model obiektu
W tej specyfikacji rozróżniamy:

- **`𝓕_sys`**: przestrzeń reguł **własnych operacji systemu** (to jest jedyna `𝓕`, która liczy się dla KGR).  
  Przykłady: klasa algorytmów decyzyjnych/wnioskowania używanych przez system, generator reguł, operator przetwarzania, topologia architektury, ograniczenia działań systemu.

- **`𝓕_obj`**: przestrzeń reguł **modelowanego obiektu** (środowiska, danych, kodu kompilowanego, procesu zewnętrznego).  
  Zmiany `𝓕_obj` nie są same w sobie KGR.

**KGR dotyczy wyłącznie `𝓕_sys`.**  
System może modelować `𝓕_obj`, ale KGR zachodzi dopiero, gdy używa tego do zmiany `𝓕_sys`.

### 2.2 Reguła, parametr, przestrzeń reguł
- **Reguła `F`**: mechanizm przejścia mapujący stan i wejścia na następny stan (lub dystrybucję stanów):  
  `s_{t+1} ~ F(s_t, x_t; θ)`
- **Parametry `θ`**: nastawy w ramach tej samej struktury reguły.
- **Przestrzeń reguł `𝓕_sys` (formalnie, roboczo)**: rodzina reguł `{F_i}` o wspólnej roli (mapowanie `S×X→S`), gdzie `i` indeksuje **strukturę** reguły: operator, topologię, zestaw dopuszczalnych operacji/ograniczeń, generator reguł.

**Zmiana `θ` (tuning):** modyfikacja parametrów przy stałej strukturze reguły.  
**Zmiana `𝓕_sys` (meta-zmiana):** dodanie/usunięcie/zamiana struktury reguły (`F_i ↔ F_j`) lub modyfikacja generatora/ograniczeń zmieniająca zbiór dopuszczalnych form.

### 2.3 Parametry zakresu operacji: granica θ/𝓕 (uszczelnienie)
Jeśli system tylko zwiększa/zmniejsza *zasięg/zasoby* w ramach tego samego operatora (np. głębokość search, horyzont, budżet), traktujemy to jako **θ**, nie `𝓕_sys`.  
Zmiana `𝓕_sys` wymaga zmiany operatora/generatora/ograniczeń (zmiany formy), nie tylko „więcej/mniej tego samego”.

### 2.4 Test rozróżniający (operacyjny)
- jeśli po zmianie system zyskuje/utraca możliwość wykonywania klasy transformacji, której wcześniej nie miał (albo traci możliwość jej zaniechania) → zmiana `𝓕_sys`;
- jeśli zmienia się tylko „jak dobrze / jak daleko” w ramach tej samej formy → zmiana `θ`.

---

## 3) Definicja KGR (B-min)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model `M_sys`**: system generuje i ocenia przewidywania skutków zmian w `𝓕_sys` **przed** wdrożeniem.  
2) **Meta-kontrola `G`**: wnioski z `M_sys` inicjują zmianę `𝓕_sys` (nie tylko tuning `θ`).  
3) **Walidacja `U`**: po zmianie `𝓕_sys` system porównuje przewidywania `M_sys` z rzeczywistością i aktualizuje `M_sys` i/lub kryteria `G`.  
4) **Próg/stabilność**: 1–3 zachodzą stabilnie wg kryterium z sekcji 6.

Wymagana pętla:
`F → M_sys → G → F` oraz `F → U → M_sys`.

**Konsekwencja:** model środowiska (`M_obj`) nie jest wystarczający. KGR wymaga `M_sys` o własnych regułach operacji.

---

## 4) Kryteria operacyjne dla self-modelu (anty-„implicit model” + anty-katalog)

### 4.1 Minimalny wymóg dowodowy dla `M_sys`
Wymagane jest:

- **C1 (przewaga nad baseline):** stabilna przewaga nad baseline bez-modelowym na zadaniach wymagających zmian `𝓕_sys`,
**ORAZ**
- **C3 (ablacja lub zakłócenie):** wyłączenie albo istotne zakłócenie funkcji `M_sys` pogarsza zdolność do sensownej meta-zmiany `𝓕_sys`.

Zakłócenie (przykłady): szum w reprezentacji, ograniczenie horyzontu predykcji, degradacja kanału predykcji, ograniczenie pamięci modelu — byle miało interpretację „funkcja `M_sys` została osłabiona”.

### 4.2 Anty-katalog (minimalna generalizacja)
Żeby odciąć NAS/lookup udające kontrfaktyczność:

- **C4 (novelty check):** `M_sys` musi poprawnie rangować/oceniać co najmniej **jedną** zmianę `𝓕_sys'` spoza wcześniej widzianego katalogu zmian (holdout form), a walidacja `U` musi tę predykcję skonfrontować z wdrożeniem.

C4 jest lekkie, ale blokuje „czyste przeszukiwanie katalogu”.

---

## 5) Kryteria operacyjne „zmiany 𝓕_sys” i walidacji

### 5.1 „Zmiana 𝓕_sys” – test negatywny wymagany
- **Standardowy gradient descent na stałej architekturze**: zmienia `θ`, nie `𝓕_sys` → **nie KGR**.

### 5.2 Walidacja `U` ≠ zwykły feedback
Walidacja w KGR to:
- predykcja kontrfaktyczna `M_sys(𝓕_sys')`,
- wdrożenie `𝓕_sys'`,
- pomiar rozjazdu przewidywanie↔rzeczywistość,
- aktualizacja `M_sys` i/lub kryteriów `G`.

**Test negatywny:** zmiana `𝓕_sys` bez walidacji predykcji i bez aktualizacji `M_sys/G` → **nie KGR**.

---

## 6) Próg/stabilność – metryka minimalna (z „doliną eksploracji”)

### 6.1 Kryterium stabilności (domyślne)
Warunki 1–3 uznajemy za stabilnie spełnione, jeśli:
- wystąpią co najmniej **N = 3** pełne cykle `zmiana 𝓕_sys → walidacja → aktualizacja M_sys/G`,
**oraz**
- w oknie `W = N` cykli:
  - dopuszczamy maksymalnie **1** cykl „spadku eksploracyjnego” poniżej `J_baseline − δ`,
  - ale system musi wrócić do `J ≥ J_baseline − δ` najpóźniej w następnym cyklu.

Domyślnie `δ = 0`. Domena może ustawić `δ > 0` jeśli baseline jest szumne lub cel wymaga kosztownej reorganizacji.

To utrzymuje anti-fajerwerk, ale nie zabija reorganizacji z przejściową stratą.

### 6.2 KGR jako własność czasowa
KGR jest własnością **czasową/epizodyczną**: system może wejść w stan spełnienia KGR i może z niego wypaść, jeśli przestaje spełniać kryteria stabilności.

---

## 7) Wskaźniki progu (opcjonalnie, pomocnicze)
- **Φ**: wpływ pętli `F→M_sys→G→F` na `J` (ablation/influence, nie liczbą wywołań).
- **Ψ**: przewaga nad baseline (preferowany w black-box).
- **Ω**: raportuj jako **dwie wartości**: (a) zdarzenia przełączeń `𝓕_sys`, (b) ich wpływ na `J`.

---

## 8) Bateria testów destrukcyjnych (anty-rebranding)
- **N1:** self-reference/cybII bez zmiany `𝓕_sys` → nie KGR.
- **N2:** trial-and-error tuning/search bez predykcji przed wdrożeniem → nie KGR.
- **N3:** zmiana `𝓕_sys` bez walidacji predykcji i bez aktualizacji `M_sys/G` → nie KGR.
- **N4:** „lookup-table kontrfaktyczność” (brak generalizacji i brak realnej aktualizacji) → nie KGR.

Nowy test zakresowy (opcjonalny, jeśli chcesz ostro):
- **N5 (external-only):** system, który modeluje/zmienia `𝓕_obj` (świat, kod, dane) bez zmiany `𝓕_sys` → nie KGR.

Test pozytywny:
- **P:** KGR-kandydat bije baseline bez `M_sys` na zadaniach wymagających zmian `𝓕_sys`, z utrzymaniem stabilności wg sekcji 6.

---

## 9) Przypadki graniczne (rozstrzygnięcia robocze)
- **Model-based RL**: nie KGR, jeśli ma wyłącznie `M_obj` (model środowiska) i nie wykazuje `M_sys` + zmiany `𝓕_sys`.  
- **AlphaZero/MCTS zmieniające głębokość/budżet**: zwykle tuning `θ` (zakres), nie zmiana `𝓕_sys`.
- **AutoML/NAS**: może być KGR-kandydatem tylko, jeśli spełnia `M_sys` (C1+C3) i C4 (novelty), oraz ma zamkniętą walidację `U` dla zmian `𝓕_sys` (nie tylko ranking katalogu).
- **Ewolucja biologiczna jako selekcja**: zwykle nie KGR (brak predykcji `M_sys` przed wdrożeniem; dominują mechanizmy trial-and-error).
- **PGO/JIT/RLHF/CAI**: traktować jako test zakresu. Jeśli dotyczą `𝓕_obj` bez `𝓕_sys`, nie przechodzą. Jeśli rzeczywiście zmieniają `𝓕_sys`, mogą być kandydatami (decyzja kanonu).

---

## Implikacje / ryzyka (B)
Implikacje:
- Zamykamy lukę Claude’a: KGR dotyczy `𝓕_sys`, nie `𝓕_obj`, więc MBRL „model środowiska” przestaje automatycznie przechodzić.
- C4 ogranicza „NAS jako katalog”, bez wprowadzania psychologii/intencjonalności.

Ryzyko:
- Trzeba jasno opisywać, co w danej domenie jest `𝓕_sys` vs `𝓕_obj`, inaczej wróci interpretacyjność.
- C4 wymaga zaprojektowania holdout form (inaczej będzie udawane).
