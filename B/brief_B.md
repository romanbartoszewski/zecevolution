# Brief B (1 strona) — KGR i zasady oceny (v0.6 sync)

## 0) Status
Warstwa: **B (operacyjna)**  
Cel: szybki pakiet do wklejania modelom (Claude/Grok) bez przerzucania całego repo.

---

## 1) Warstwy projektu
- **C**: heurystyka (narracje, intuicje, pomysły; może być sprzeczne; brak mocy normatywnej).
- **B**: definicje/specyfikacje/testy (musi być jednoznaczne i falsyfikowalne).
- **A**: ontologia – zablokowana jako argument.

Zasada: jeśli coś ma obowiązywać „w projekcie”, musi istnieć w **B**.

---

## 2) Kluczowe rozróżnienie: θ vs 𝓕 (nóż)
- `θ` = parametry w ramach tej samej formy reguły (tuning).
- `𝓕` = **rodzina struktur reguł** `{F_i}` (operator/topologia/ograniczenia/generator reguł).  
  Zmiana `𝓕` = dodanie/usunięcie/zamiana struktury reguły lub zmiana generatora reguł.

### Parametry zakresu (ważna granica)
Jeśli system tylko zwiększa/zmniejsza *zasięg/zasoby* w ramach tego samego operatora (np. głębiej przeszukuje, dłużej planuje), traktujemy to jako **θ**, nie `𝓕`.  
Zmiana `𝓕` wymaga innego operatora/generatora/ograniczeń (zmiany formy), nie tylko „więcej/ mniej tego samego”.

Test skrótowy: „nowa forma” (𝓕) vs „ten sam operator, inny zakres” (θ).

---

## 3) KGR — definicja operacyjna (rdzeń)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model (M)**  
   System przewiduje skutki zmian `𝓕→𝓕'` **przed** wdrożeniem i używa tych predykcji do wyboru zmian.

   Minimalny wymóg dowodowy:
   - **C1:** stabilna przewaga nad baseline bez-modelowym na zadaniach wymagających zmian `𝓕`,
   **ORAZ**
   - **C3:** ablacja **lub istotne zakłócenie funkcji M** pogarsza zdolność do sensownej meta-zmiany `𝓕`.
   (C2 – wrażliwość kontrfaktyczna – pomocnicze.)

2) **Meta-kontrola (G)**  
   Wnioski z `M` inicjują zmianę `𝓕` (nie tylko tuning `θ`).

   Test negatywny: standardowy gradient descent na stałej architekturze = tuning `θ` → **nie KGR**.

3) **Walidacja predykcji (U)**  
   Po wdrożeniu `𝓕'` system porównuje `M(𝓕')` z rzeczywistością i aktualizuje `M` i/lub kryteria `G`.

4) **Próg/stabilność**  
   Domyślnie: min. 3 pełne cykle `zmiana 𝓕 → walidacja → aktualizacja M/G` oraz brak degradacji:
   - w każdym cyklu `J ≥ J_baseline − δ` (domyślnie `δ = 0`).

KGR traktujemy jako własność **czasową**: system może wejść w KGR i może z niego wypaść, jeśli przestaje spełniać stabilność.

Źródło normatywne: `B/specyfikacje/kgr_threshold.md` (v0.6).

---

## 4) Testy destrukcyjne (anty-rebranding)
- **N1:** self-reference/cybII bez zmiany `𝓕` → nie KGR.
- **N2:** trial-and-error tuning/search bez predykcji przed wdrożeniem → nie KGR.
- **N3:** zmiana `𝓕` bez walidacji predykcji i bez aktualizacji `M/G` → nie KGR.
- **N4:** „lookup-table kontrfaktyczność” bez generalizacji i bez realnej aktualizacji → nie KGR.

Test pozytywny:
- **P:** KGR-kandydat bije baseline bez `M` na zadaniach wymagających zmian `𝓕`, z utrzymaniem stabilności.

---

## 5) Checklist dla recenzenta (Claude/Grok)
1) Czy rozróżnienie „parametry zakresu” (θ) vs „zmiana operatora/generatora” (𝓕) rozwiązuje spory graniczne?
2) Czy C3 jest testowalne (ablacja lub zakłócenie), bez preferencji dla modularnych architektur?
3) Czy stabilność jest policzalna (J_baseline, δ), bez subiektywności?
4) Jakie 2 nowe testy negatywne dodałbyś?
5) Jaką minimalną poprawkę wprowadzić, jeśli nadal są fałszywe pozytywy?

Wymagane zakończenie:
Implikacje systemowe:
Ryzyko:
Czy naruszono poziomy C/B/A:
