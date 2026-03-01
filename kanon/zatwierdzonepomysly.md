# Kanon – zatwierdzone pomysły / definicje (roboczo)

## Status
Ten dokument jest listą pozycji uznanych za „obowiązujące roboczo” w projekcie.  
Wejście do kanonu wymaga spełnienia kryteriów z: `B/kryteria/kanonizacja.md`.

**Zasada:** kanon nie jest miejscem na narracje. Kanon linkuje do treści B.

---

## Format wpisu (obowiązkowy)
Każdy wpis ma formę:

- **YYYY-MM-DD — [Nazwa pozycji]**  
  Status: (np. v0.x / robocze / stabilne)  
  Źródło B: `ścieżka/do/pliku.md`  
  Źródło C (opcjonalnie): `ścieżka/do/pliku.md`  
  1–3 zdania: *co to jest i po co istnieje*  
  Implikacje systemowe:  
  Ryzyko:  
  Czy naruszono poziomy C/B/A:

---

## Zatwierdzone pozycje

- **2026-03-01 — KGR: próg meta-reorganizacji (specyfikacja operacyjna)**  
  Status: **v0.6 (robocze)**  
  Źródło B: `B/specyfikacje/kgr_threshold.md`  
  1–3 zdania: KGR to próg, przy którym system (a) posiada kontrfaktyczny self-model i (b) używa go do zmiany przestrzeni reguł `𝓕` (nie tylko tuningu `θ`), z walidacją predykcji i kryterium stabilności opartym o `J_baseline/δ`.  
  Implikacje systemowe: Definicja jest odporna na rebranding przez „nóż” θ vs 𝓕 (z rozróżnieniem parametrów zakresu), twardy dowód funkcji M (C1+C3), oraz testy negatywne N1–N4.  
  Ryzyko: Wymaga jawnego zdefiniowania `J` i baseline w każdej domenie; „zakłócenie M” musi być dobrze opisane, inaczej powstanie arbitralność.  
  Czy naruszono poziomy C/B/A: C – nie. B – tak. A – nie.
