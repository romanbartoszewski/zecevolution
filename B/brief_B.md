# Brief B (1 strona) — KGR i zasady oceny

## 0) Status
Warstwa: **B (operacyjna)**  
Cel: szybki pakiet do wklejania modelom (Claude/Grok) bez przerzucania całego repo.

---

## 1) Warstwy projektu
- **C**: heurystyka (narracje, intuicje, pomysły; może być sprzeczne; brak mocy normatywnej).
- **B**: definicje/specyfikacje/testy (musi być jednoznaczne i falsyfikowalne).
- **A**: ontologia – zablokowana jako argument (może się wyłonić, ale nie wspiera B/C).

Zasada: jeśli coś ma obowiązywać „w projekcie”, musi istnieć w **B**.

---

## 2) KGR — definicja operacyjna (rdzeń)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model (M)**  
   System potrafi ocenić skutki zmian reguł/klasy reguł (`F/𝓕`) **przed** wdrożeniem i używa tego do wyboru zmian.  
   Anty-„implicit”: musi przejść co najmniej jedno z kryteriów:
   - C1: przewaga nad baseline bez-modelowym na zadaniach wymagających zmian reguł,
   - C2: wrażliwość `M(F') ≠ M(F)` wpływa na wybór,
   - C3: ablacja M pogarsza meta-zmiany reguł.

2) **Meta-kontrola przestrzeni reguł (G)** — nóż odróżniający  
   System zmienia **przestrzeń reguł** (`F` lub `𝓕`), a nie tylko parametry `θ`.  
   Test negatywny: standardowy gradient descent na stałej architekturze = tuning `θ` → **nie KGR**.

3) **Walidacja predykcji (U)**  
   Po zmianie reguł system porównuje przewidywania `M` z rzeczywistością i aktualizuje `M` i/lub kryteria `G`.  
   To nie jest dowolny feedback; to walidacja predykcji kontrfaktycznych.

4) **Próg (stabilność)**  
   1–3 zachodzi stabilnie (min. 3 cykle modyfikacja reguł → walidacja → aktualizacja).

Źródło normatywne pełnej specyfikacji: `B/specyfikacje/kgr_threshold.md`.

---

## 3) Próba „krytyczności” (order parameter)
Trzy wskaźniki progu (nie metafora):
- **Φ**: udział pętli `F→M→G→F` w regulacji (strukturalny).
- **Ψ**: przewaga modelu kontrfaktycznego nad baseline bez-modelowym (funkcjonalny).
- **Ω**: intensywność przełączeń klas reguł skorelowana z poprawą celu (dyskretność).

---

## 4) Testy destrukcyjne (anty-rebranding)
Jeśli którykolwiek z poniższych przechodzi jako KGR → definicja jest za szeroka:

- **N1:** cybernetyka II rzędu / self-reference bez zdolności zmiany `𝓕` → nie KGR.
- **N2:** tuning/search bez kontrfaktycznego `M` → nie KGR.
- **N3:** zmiana `F/𝓕` bez walidacji predykcji i bez aktualizacji `M/G` → nie KGR.

Test pozytywny:
- **P:** KGR-kandydat bije baseline bez `M` na zadaniach wymagających zmian klasy reguł.

---

## 5) Checklist dla recenzenta (Claude/Grok)
Odpowiedz wprost:

1) Czy warunki 1–4 są jednoznaczne i niesprzeczne?
2) Czy „nóż” (zmiana `𝓕`) realnie odróżnia KGR od cybII/meta-learningu?
3) Czy kryteria C1–C3 skutecznie tną „implicit model”?
4) Czy Φ/Ψ/Ω są mierzalne, czy generują fałszywe pozytywy?
5) Jakie minimalne poprawki zawężą KGR bez rozbudowy?

Wymagane zakończenie:
Implikacje systemowe:
Ryzyko:
Czy naruszono poziomy C/B/A:
