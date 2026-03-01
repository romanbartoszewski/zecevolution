# KGR – próg meta-reorganizacji (specyfikacja operacyjna v0.5)

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
- **Parametry `θ`**: nastawy w ramach tej samej reguły/tej samej struktury.
- **Przestrzeń reguł `𝓕` (definicja formalna robocza)**: rodzina reguł `{F_i}` o wspólnej funkcji roli (mapowanie `S×X→S`), gdzie `i` indeksuje **strukturę** reguły (np. operator, topologia, zestaw dopuszczalnych operacji/ograniczeń, generator reguł).  
  Intuicja: `𝓕` to „zbiór form”, a `θ` to „nastawy w ramach formy”.

**Zmiana `θ` (tuning):** modyfikacja parametrów przy stałej strukturze reguły.  
**Zmiana `𝓕` (meta-zmiana):** dodanie/usunięcie/zamiana struktury reguły (`F_i ↔ F_j`) lub modyfikacja generatora reguł / operatorów / ograniczeń w sposób, który zmienia zbiór dopuszczalnych form.

**Test rozróżniający (operacyjny):**
- jeśli po modyfikacji system uzyskuje/utraca **możliwość** wykonywania klasy transformacji, której wcześniej nie miał (albo przestaje być w stanie jej nie wykonywać), traktujemy to jako zmianę `𝓕`;
- jeśli zmienia się tylko „jak dobrze” w ramach tej samej formy — to zmiana `θ`.

---

## 3) Definicja KGR (B-min)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model `M`**: system potrafi generować i oceniać przewidywania skutków zmian w `F` lub `𝓕` **przed** wdrożeniem.  
2) **Meta-kontrola `G`**: wnioski z `M` powodują zmianę `𝓕` (nie tylko tuning `θ`).  
3) **Walidacja `U`**: po zmianie `𝓕` system porównuje przewidywania `M` z rzeczywistością i aktualizuje `M` i/lub kryteria `G`.  
4) **Próg/stabilność**: 1–3 zachodzą stabilnie wg kryterium z sekcji 6.

Wymagana pętla:
`F → M → G → F` oraz `F → U → M`.

---

## 4) Kryteria operacyjne dla self-modelu (anty-„implicit model”)

### 4.1 Minimalny wymóg dowodowy dla `M`
Żeby `M` nie było etykietą, wymagane jest:

- **C1 (przewaga nad baseline):** system wykazuje stabilną przewagę nad baseline bez-modelowym na zadaniach wymagających zmian `𝓕`,
**ORAZ**
- **C3 (ablacja):** wyłączenie/istotne osłabienie komponentu pełniącego funkcję `M` pogarsza zdolność do sensownej meta-zmiany `𝓕`.

C2 jest pomocnicze, nie wystarczające:
- **C2 (wrażliwość kontrfaktyczna):** `M(𝓕') ≠ M(𝓕)` dla co najmniej jednej kontrfaktycznej modyfikacji, a różnica wpływa na wybór w `G`.

**Zasada:**  
C2 może wzmacniać interpretację, ale bez C1+C3 nie uznajemy `M` za udowodnione operacyjnie.

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

## 6) Operacjonalizacja „progu” (stabilność) – bez arbitralności

### 6.1 Kryterium stabilności (domyślne)
Warunki 1–3 uznajemy za stabilnie spełnione, jeśli wystąpią:
- co najmniej **N = 3** pełne cykle `zmiana 𝓕 → walidacja predykcji → aktualizacja M/G`,
**i**
- po każdym cyklu nie obserwujemy degradacji metryki celu `J` poniżej baseline przez więcej niż 1 cykl (brak „jednorazowego fajerwerku”).

**Uwaga:** N=3 to domyślne minimum operacyjne (nie teoria fizyczna).  
Jeśli domena ma lepsze kryterium stabilności (okno czasowe, konwergencja, test generalizacji) — zastępujemy N=3 kryterium domenowym i zapisujemy to w protokole testu.

### 6.2 Order parameters (opcjonalnie)
- **Φ**: udział pętli `F→M→G→F` w regulacji (estymowany ablacjami / wpływem na `J`, nie liczbą wywołań).
- **Ψ**: przewaga nad baseline (wymaga sensownie zdefiniowanego baseline’u).
- **Ω**: miara dwuskładnikowa: (a) zdarzenia przełączeń `𝓕`, (b) ich wpływ na `J` — nie łączymy tego w jeden nieczytelny skalar bez opisu.

---

## 7) Bateria testów destrukcyjnych (anty-rebranding)

### N1: self-reference/cybII bez zmiany 𝓕
Self-reference bez zdolności zmiany `𝓕` → **nie KGR**.

### N2: tuning/search bez kontrfaktycznego `M` (trial-and-error)
Zmiany reguł „na próbę” bez predykcji przed wdrożeniem → **nie KGR**.

### N3: zmiana 𝓕 bez walidacji predykcji
Zmiana `𝓕` bez walidacji predykcji i bez aktualizacji `M/G` → **nie KGR**.

### N4: „lookup-table kontrfaktyczność” (brak generalizacji)
System ma tablicę przypadków i „udaje” predykcję zmian, ale nie aktualizuje `M/G` poza predefiniowanymi sytuacjami → **nie KGR**.

### P: zwycięstwo kontrfaktyczności
KGR-kandydat bije baseline bez `M` na zadaniach wymagających zmian `𝓕`, z utrzymaniem stabilności wg sekcji 6.

---

## 8) Przypadki graniczne (rozstrzygnięcia robocze)
- **Model-based RL**: przechodzi część warunków (model + walidacja), ale **nie jest KGR**, jeśli nie wykazuje zmiany `𝓕` (a jedynie aktualizację polityki/parametrów w stałej klasie).
- **AutoML/NAS**: może być KGR-kandydatem, jeśli ma kontrfaktyczny `M` + meta-kontrolę zmieniającą `𝓕` + walidację predykcji + stabilność.
- **Ewolucja biologiczna jako proces selekcji**: zazwyczaj **nie KGR** (brak `M` w sensie predykcji przed wdrożeniem; dominują mechanizmy trial-and-error).
- **JIT/kompilatory adaptacyjne**: traktować jako test graniczny; jeśli przechodzą, to znaczy, że definicja obejmuje „inżynierską meta-adaptację” — decyzja, czy to akceptujemy, jest polityką projektu (kanon).

---

## Implikacje / ryzyka (B)
Implikacje:
- `𝓕` jest teraz obiektem operacyjnym (rodzina struktur reguł), więc „nóż” G staje się rozstrzygalny.
- `M` ma twardy wymóg dowodowy (C1+C3), co tnie „implicit model” i redukuje fałszywe pozytywy.

Ryzyko:
- C1+C3 podnosi próg dowodowy (mniej rzeczy przejdzie jako KGR, ale to jest cel).
- W black-box systemach ablacja może być trudna — wtedy trzeba zdefiniować substytut eksperymentalny i opisać go w protokole.
