# Zasady pracy (B) – rygor, redukcja, test destrukcyjny

## 0) Status dokumentu
Warstwa: **B (operacyjna)**  
Ten dokument definiuje reguły operacyjne projektu: jak redukujemy koncepcje do rdzenia i jak unikamy rebrandingu.

---

## 1) Zasady ogólne
1) **Separacja warstw jest obowiązkowa**  
   - C = eksploracja (może być sprzeczne, metaforyczne)  
   - B = definicje/specyfikacje/testy (musi być jednoznaczne)  
   - A = tylko jeśli wyłoni się emergentnie; nie jest argumentem

2) **Zakaz „miękkich definicji” w B**  
   Jeśli pojęcie nie ma warunku odróżniającego i testów negatywnych → zostaje w C.

3) **Każda analiza kończy się trzema sekcjami (obowiązkowo):**
   - Implikacje systemowe:
   - Ryzyko:
   - Czy naruszono poziomy C/B/A:

---

## 2) Minimalny standard dla treści B
Każdy dokument B powinien zawierać (jeśli dotyczy):
- definicje pojęć (operacyjnie),
- warunki konieczne i (jeśli możliwe) wystarczające,
- testy negatywne (co ma NIE przechodzić),
- (opcjonalnie) metryki / wskaźniki / protokół testu.

---

## 3) Reguła anty-rebrandingu
Jeśli pojawia się zarzut „to już istnieje”:
1) wskazujemy najbliższe istniejące pojęcie/ramę (np. cybII, meta-learning),
2) dokładamy **warunek odróżniający** (jeden, ostry „nóż”),
3) projektujemy **test destrukcyjny**, który obali pojęcie, jeśli jest tylko etykietą.

Jeśli nie da się dodać noża lub testu → materiał pozostaje C (narracja), bez roszczeń nowości.

---

## 4) KGR – mini-spec (inline) + testy negatywne
Użycie terminu **KGR** w projekcie jest normatywne tylko wtedy, gdy spełnione są łącznie warunki:

### 4.1 Kontrfaktyczny self-model (M) — definicja minimalna
System posiada wewnętrzną reprezentację `M` własnej architektury/reguł taką, że:
- potrafi ocenić skutki co najmniej jednej kontrfaktycznej zmiany `F→F'` lub `𝓕→𝓕'` **przed** wdrożeniem zmiany,
- a przewidywania `M(F')` są używane do wyboru/odrzucenia zmian (nie są opisem “po fakcie”).

Kryterium operacyjne (minimalne): model daje przewagę nad baseline bez-modelowym na zadaniach wymagających zmian reguł/klasy reguł.

### 4.2 Meta-kontrola przestrzeni reguł (G) — „nóż” odróżniający
System potrafi modyfikować **przestrzeń reguł** (`F` lub klasę `𝓕`), a nie tylko parametry `θ` w obrębie stałej `𝓕`.

- tuning: `θ` zmienia się, `𝓕` stałe → **nie wystarcza**
- KGR: `𝓕` lub generator reguł się zmienia → **wymagane**

### 4.3 Walidacja zwrotna (U) — definicja minimalna
Po wdrożeniu zmiany reguł system porównuje skutki z przewidywaniami `M` i:
- aktualizuje `M` i/lub kryteria wyboru w `G` (zamknięta pętla uczenia na błędzie).

To nie jest “dowolne sprzężenie zwrotne”, tylko walidacja **predykcji kontrfaktycznych** po zmianie reguł.

### 4.4 Próg (stabilność spełnienia)
Warunki 4.1–4.3 muszą zachodzić **stabilnie** (nie jednorazowo):
- przez `N ≥ 3` cykle *modyfikacja reguł → walidacja → aktualizacja modelu*  
  lub przez minimalny czas `T` odpowiadający co najmniej 3 takim cyklom w danym systemie.

### Testy negatywne (obowiązkowe w ocenie KGR)
- **N1 (cybII bez zmiany klasy reguł):** self-reference bez zdolności zmiany `𝓕` → **nie KGR**.
- **N2 (tuning bez kontrfaktyczności):** optymalizacja parametrów/hiperparametrów bez kontrfaktycznego `M` → **nie KGR**.
- **N3 (zmiana reguł bez walidacji):** system zmienia reguły, ale nie weryfikuje predykcji `M` i nie aktualizuje `M/G` → **nie KGR**.

Pełna specyfikacja i metryki progu: `B/specyfikacje/kgr_threshold.md`.

---

## 5) Kanonizacja (co trafia do „kanon/”)
Kryteria i procedura są w:
- `B/kryteria/kanonizacja.md`

Zasada: do kanonu trafiają tylko elementy, które przeszły przez B (redukcja + testy negatywne).

---

## Implikacje systemowe:
- `zasady.md` przestaje być szkieletem: zawiera minimalną definicję i testy negatywne KGR inline.
- Linki do specyfikacji przestają zastępować definicje; pełnią rolę rozwinięcia.

## Ryzyko:
- Inline mini-spec może się rozjechać z `kgr_threshold.md` (ryzyko duplikacji). Trzeba utrzymywać spójność wersji.
- Warunek `N ≥ 3` to arbitralne minimum: może wymagać korekty w zależności od domeny.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (uszczelniono definicję i testy).
- **A:** nie.
