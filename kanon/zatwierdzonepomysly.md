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
  Status: **v0.7 (robocze)**  
  Źródło B: `B/specyfikacje/kgr_threshold.md`  
  1–3 zdania: KGR to próg, przy którym system posiada kontrfaktyczny self-model `M_sys` i używa go do zmiany własnej przestrzeni reguł `𝓕_sys` (nie tylko tuningu `θ`), z walidacją predykcji i kryterium stabilności opartym o `J_baseline/δ` (z dopuszczalną jedną „doliną eksploracji”). Model obiektu (`𝓕_obj`) nie wystarcza.  
  Implikacje systemowe: Definicja jest odporna na mylenie z MBRL (wymóg `𝓕_sys/M_sys`) oraz na „katalog NAS/lookup” (C4 novelty check), a testy negatywne N1–N5 domykają rebranding.  
  Ryzyko: Wymaga jawnego rozdzielenia `𝓕_sys` vs `𝓕_obj` w każdej domenie oraz projektowania holdout form dla C4; inaczej wróci interpretacyjność.  
  Czy naruszono poziomy C/B/A: C – nie. B – tak. A – nie.
