# Kanon – zatwierdzone pomysły / definicje (roboczo)

## Status
Ten dokument jest listą pozycji uznanych za „obowiązujące roboczo” w projekcie.  
Wejście do kanonu wymaga spełnienia kryteriów z: `B/kryteria/kanonizacja.md`.

**Zasada:** kanon nie jest miejscem na narracje. Kanon linkuje do treści B.

---

## Format wpisu (obowiązkowy)
Każdy wpis ma formę:

- **YYYY-MM-DD — [Nazwa pozycji]**  
  Status: (np. v0.3 / robocze / stabilne)  
  Źródło B: `ścieżka/do/pliku.md`  
  Źródło C (opcjonalnie): `ścieżka/do/pliku.md`  
  1–3 zdania: *co to jest i po co istnieje*  
  Implikacje systemowe:  
  Ryzyko:  
  Czy naruszono poziomy C/B/A:

---

## Zatwierdzone pozycje

- **2026-03-01 — KGR: próg meta-reorganizacji (specyfikacja operacyjna)**  
  Status: v0.3 (robocze)  
  Źródło B: `B/specyfikacje/kgr_threshold.md`  
  1–3 zdania: KGR to próg, przy którym system utrzymuje kontrfaktyczny self-model i używa go do zmiany przestrzeni reguł (nie tylko tuningu), z walidacją zwrotną.  
  Implikacje systemowe: Umożliwia test destrukcyjny „czy to tylko rebranding” poprzez warunek odróżniający (zmiana klasy reguł) oraz wskaźniki progu (Φ/Ψ/Ω).  
  Ryzyko: Źle dobrany baseline i nieprecyzyjna miara wpływu mogą fałszywie „udowodnić” KGR.  
  Czy naruszono poziomy C/B/A: C – nie. B – tak. A – nie.
