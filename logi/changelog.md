# Changelog (logi) — historia zmian B i kanonu

## Zasady
- Log dotyczy głównie zmian w **B** (definicje/specyfikacje/testy) oraz wpisów do **kanonu**.
- Format wpisu:
  - Data (YYYY-MM-DD)
  - Zakres (B / C / kanon / repo)
  - Co się zmieniło (konkret)
  - Powód (1–2 zdania)
  - Ryzyko regresji (jeśli dotyczy)

---

## 2026-03-01

### [repo] Reorganizacja struktury na warstwy C/B
- Dodano katalogi `C/` i `B/` oraz uporządkowano dokumenty zgodnie z warstwami.
- Dodano `README.md` (pakiet startowy) i zaktualizowano `STRUKTURA.txt`.
Powód: wymuszenie separacji heurystyki (C) od definicji/testów (B) i redukcja dryfu semantycznego.  
Ryzyko regresji: rozjazd treści, jeśli definicje zaczną wracać do C.

### [B] Terminologia i zasady — doprecyzowanie rygoru
- `B/mechanika/terminologia.md`: zdefiniowano operacyjnie m.in. `F/θ/𝓕`, model opisowy vs kontrfaktyczny, meta-kontrolę i walidację.
- `B/mechanika/zasady.md`: ustanowiono rygor B, regułę anty-rebrandingu, oraz minimalne wymagania dla dokumentów B.
Powód: ujednolicenie pojęć i wymuszenie testowalności.  
Ryzyko regresji: definicje mogą zostać użyte „elastycznie” bez testów negatywnych.

### [B] KGR — specyfikacja operacyjna i testy destrukcyjne
- `B/specyfikacje/kgr_threshold.md`:
  - v0.3: definicja B-min + wskaźniki progu Φ/Ψ/Ω + testy N1/N2/P.
  - v0.4: doprecyzowano kryteria operacyjne:
    - C1–C3 dla „kontrfaktycznego self-modelu” (anty-„implicit model”),
    - jawny test negatywny: gradient descent na stałej architekturze ≠ KGR,
    - rozróżniono walidację predykcji od zwykłego feedbacku,
    - dodano przypadki graniczne (ML training / AutoML / ewolucja / organizacje).
Powód: odpowiedź na krytykę „rebranding” i dopięcie miejsc niejednoznacznych.  
Ryzyko regresji: wzrost objętości specyfikacji; ryzyko duplikacji mini-spec w `zasady.md`.

### [B] Kanonizacja i kanon
- `B/kryteria/kanonizacja.md`: dodano kryteria przejścia C → B → kanon + anty-bullshit.
- `kanon/zatwierdzonepomysly.md`: ustandaryzowano format wpisów (data, status, linki do B) oraz dodano pozycję KGR (robocze).
Powód: kanon jako wynik procesu, nie lista życzeń.  
Ryzyko regresji: kanon może rosnąć bez testów negatywnych, jeśli procedura będzie ignorowana.

### [B] Brief jednowiadomościowy
- `B/brief_B.md`: dodano 1-stronicowy brief B do audytów przez modele.
Powód: skrócenie procesu audytu bez kopiowania wielu plików.  
Ryzyko regresji: brief może się rozjechać z pełną specyfikacją — wymaga utrzymania spójności.

### [B] KGR v0.5 — zaostrzenie „noża” i dowodu dla M
- `B/specyfikacje/kgr_threshold.md` → v0.5:
  - zdefiniowano `𝓕` formalnie jako rodzinę struktur reguł `{F_i}` + test rozróżniający θ vs 𝓕,
  - zmieniono kryterium dowodowe `M`: z OR na wymóg **C1 AND C3** (C2 pomocnicze),
  - doprecyzowano stabilność progu: N=3 jako domyślny minimum + warunek anty-„fajerwerk” + możliwość kryterium domenowego,
  - dodano N4 („lookup-table kontrfaktyczność”) oraz doprecyzowano przypadki graniczne (m.in. model-based RL).
- `B/brief_B.md` zsynchronizowano z v0.5.
- `B/mechanika/terminologia.md` zsynchronizowano z v0.5 (θ vs 𝓕).
Powód: odpowiedź na audyt (Grok+Claude): usunięcie nieostrości `𝓕` i ograniczenie fałszywych pozytywów dla `M`.  
Ryzyko regresji: wyższy próg dowodowy (mniej systemów przejdzie jako KGR); w black-boxach ablacja może być trudna.
