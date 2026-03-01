# Brief B (1 strona) — KGR i zasady oceny (v0.5 sync)

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

## 2) Kluczowe rozróżnienie: θ vs 𝓕 (nóż)
- `θ` = parametry w ramach tej samej formy reguły (tuning).
- `𝓕` = **rodzina struktur reguł** `{F_i}` (operator/topologia/ograniczenia/generator reguł).  
  Zmiana `𝓕` = dodanie/usunięcie/zamiana struktury reguły lub zmiana generatora reguł.
- Test rozróżniający: jeśli po zmianie system zyskuje/utraca możliwość wykonywania klasy transformacji (a nie tylko „robi to lepiej/gorzej”) → to zmiana `𝓕`.

---

## 3) KGR — definicja operacyjna (rdzeń)
System osiąga **KGR** wtedy i tylko wtedy, gdy spełnia łącznie:

1) **Kontrfaktyczny self-model (M)**  
   System przewiduje skutki zmian `𝓕→𝓕'` **przed** wdrożeniem i używa tych przewidywań do wyboru zmian.

   Minimalny wymóg dowodowy (anty-„implicit model”):
   - **C1:** stabilna przewaga nad baseline bez-modelowym na zadaniach wymagających zmian `𝓕`,
   **ORAZ**
   - **C3:** ablacja/istotne osłabienie funkcji `M` pogarsza zdolność do sensownej meta-zmiany `𝓕`.
   (C2 – wrażliwość kontrfaktyczna – jest pomocnicze, niewystarczające samo.)

2) **Meta-kontrola przestrzeni reguł (G)** — nóż odróżniający  
   Wnioski z `M` inicjują zmianę `𝓕` (nie tylko tuning `θ`).

   Test negatywny: standardowy gradient descent na stałej architekturze = tuning `θ` → **nie KGR**.

3) **Walidacja predykcji (U)**  
   Po wdrożeniu `𝓕'` system porównuje przewidywania `M(𝓕')` z rzeczywistością i aktualizuje `M` i/lub kryteria `G`.
   To nie jest dowolny feedback; to walidacja predykcji kontrfaktycznych.

4) **Próg/stabilność**  
   1–3 zachodzą stabilnie: domyślnie min. 3 pełne cykle `zmiana 𝓕 → walidacja predykcji → aktualizacja M/G` + brak jednorazowego „fajerwerku” (brak trwałej degradacji poniżej baseline).

Źródło normatywne: `B/specyfikacje/kgr_threshold.md` (v0.5).

---

## 4) Testy destrukcyjne (anty-rebranding)
Jeśli którykolwiek z poniższych przechodzi jako KGR → definicja jest za szeroka:

- **N1:** self-reference/cybII bez zmiany `𝓕` → nie KGR.
- **N2:** trial-and-error tuning/search bez predykcji przed wdrożeniem → nie KGR.
- **N3:** zmiana `𝓕` bez walidacji predykcji i bez aktualizacji `M/G` → nie KGR.
- **N4:** „lookup-table kontrfaktyczność” (brak generalizacji i brak realnej aktualizacji) → nie KGR.

Test pozytywny:
- **P:** KGR-kandydat bije baseline bez `M` na zadaniach wymagających zmian `𝓕`, z utrzymaniem stabilności.

---

## 5) Checklist dla recenzenta (Claude/Grok)
Odpowiedz wprost:

1) Czy `𝓕` jest rozstrzygalne w praktyce (θ vs 𝓕) dla przykładów granicznych?
2) Czy wymóg C1+C3 skutecznie tnie „implicit model” i fałszywe pozytywy?
3) Czy walidacja `U` odróżnia KGR od zwykłego feedbacku/RL?
4) Jakie nowe testy negatywne byś dodał?
5) Jakie 1–2 minimalne poprawki podniosą ostrość bez nadmuchiwania?

Wymagane zakończenie:
Implikacje systemowe:
Ryzyko:
Czy naruszono poziomy C/B/A:
