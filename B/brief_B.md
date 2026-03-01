# Brief B (1 strona) — KGR i zasady oceny (v0.7 sync)

## 0) Status
Warstwa: **B (operacyjna)**  
Cel: szybki pakiet do wklejania modelom bez przerzucania całego repo.

---

## 1) Warstwy projektu
- **C**: heurystyka (narracje, intuicje, pomysły; może być sprzeczne; brak mocy normatywnej).
- **B**: definicje/specyfikacje/testy (musi być jednoznaczne i falsyfikowalne).
- **A**: ontologia – zablokowana jako argument.

Zasada: jeśli coś ma obowiązywać „w projekcie”, musi istnieć w **B**.

---

## 2) Kluczowe rozróżnienie: 𝓕_sys vs 𝓕_obj
- **`𝓕_sys`**: przestrzeń reguł **własnych operacji systemu** (to jedyna `𝓕`, która liczy się dla KGR).
- **`𝓕_obj`**: przestrzeń reguł modelowanego obiektu (środowisko, dane, kod kompilowany, proces zewnętrzny).

**KGR dotyczy wyłącznie `𝓕_sys`.** Model środowiska (`M_obj`) nie wystarcza.

---

## 3) Nóż: θ vs 𝓕_sys (+ parametry zakresu)
- `θ` = parametry w ramach tej samej formy reguły.
- `𝓕_sys` = rodzina struktur reguł `{F_i}` (operator/topologia/ograniczenia/generator reguł).

**Parametry zakresu:** jeśli zmienia się tylko zasięg/zasoby w ramach tego samego operatora (np. głębokość/horyzont/budżet), to **θ**, nie `𝓕_sys`.  
Zmiana `𝓕_sys` wymaga nowego operatora/generatora/ograniczeń (zmiany formy).

---

## 4) KGR — definicja operacyjna (rdzeń)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model `M_sys`**  
   System przewiduje skutki zmian `𝓕_sys→𝓕_sys'` **przed** wdrożeniem i używa predykcji do wyboru zmian.

   Dowód minimalny:
   - **C1:** stabilna przewaga nad baseline bez-modelowym na zadaniach wymagających zmian `𝓕_sys`,
   **ORAZ**
   - **C3:** ablacja **lub istotne zakłócenie funkcji `M_sys`** pogarsza meta-zmiany `𝓕_sys`.

   Anty-katalog (minimalna generalizacja):
   - **C4:** `M_sys` musi poprawnie ocenić co najmniej jedną zmianę `𝓕_sys'` spoza wcześniej widzianego katalogu (holdout form), a `U` musi to zwalidować po wdrożeniu.

2) **Meta-kontrola (G)**  
   Wnioski z `M_sys` inicjują zmianę `𝓕_sys` (nie tylko tuning `θ`).

3) **Walidacja predykcji (U)**  
   Po wdrożeniu `𝓕_sys'` system porównuje `M_sys(𝓕_sys')` z rzeczywistością i aktualizuje `M_sys` i/lub kryteria `G`.

4) **Próg/stabilność (anti-fajerwerk + dolina eksploracji)**  
   Domyślnie: min. 3 pełne cykle `zmiana 𝓕_sys → walidacja → aktualizacja`, a w oknie 3 cykli dopuszczalny jest max 1 cykl spadku poniżej `J_baseline − δ` (powrót najpóźniej w następnym cyklu). Domyślnie `δ=0`.

KGR jest własnością czasową: system może wejść w KGR i może z niego wypaść.

Źródło normatywne: `B/specyfikacje/kgr_threshold.md` (v0.7).

---

## 5) Testy destrukcyjne (anty-rebranding)
- **N1:** self-reference/cybII bez zmiany `𝓕_sys` → nie KGR.
- **N2:** trial-and-error tuning/search bez predykcji przed wdrożeniem → nie KGR.
- **N3:** zmiana `𝓕_sys` bez walidacji predykcji i bez aktualizacji `M_sys/G` → nie KGR.
- **N4:** „lookup-table kontrfaktyczność” bez generalizacji i bez realnej aktualizacji → nie KGR.
- **N5 (external-only):** system, który zmienia wyłącznie `𝓕_obj` bez zmiany `𝓕_sys` → nie KGR.

---

## 6) Checklist dla recenzenta
1) Czy przypadki MBRL odpadają, bo mają `M_obj`, ale nie mają `M_sys` i zmiany `𝓕_sys`?
2) Czy NAS/AutoML odpada, jeśli to tylko katalog/search bez C4?
3) Czy stabilność jest policzalna i nie zabija reorganizacji (jeden dip)?
4) Jakie 2 nowe testy negatywne dodałbyś?
5) Jaka 1 minimalna poprawka jest jeszcze potrzebna?

Wymagane zakończenie:
Implikacje systemowe:
Ryzyko:
Czy naruszono poziomy C/B/A:
