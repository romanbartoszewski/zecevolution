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
- warunki konieczne i wystarczające (o ile da się),
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

## 4) KGR – obowiązująca specyfikacja
W projekcie termin **KGR** wolno używać normatywnie tylko zgodnie z:
- `B/specyfikacje/kgr_threshold.md`

Minimalnie KGR wymaga:
- kontrfaktycznego self-modelu,
- meta-kontroli zmieniającej przestrzeń reguł (nie tylko tuning),
- walidacji zwrotnej,
- oraz przejścia progu (operacjonalizowanego wskaźnikami / testami).

---

## 5) Kanonizacja (co trafia do „kanon/”)
Kryteria i procedura są w:
- `B/kryteria/kanonizacja.md`

Zasada: do kanonu trafiają tylko elementy, które przeszły przez B (redukcja + testy negatywne).

---

## Implikacje systemowe:
- Wymusza redukcję pojęć do rdzenia i zabezpiecza przed „teorią z gumy”.
- Utrzymuje stałą jakość definicji przy pracy z modelami zewnętrznymi (Claude/Grok).

## Ryzyko:
- Może spowolnić iterację: więcej materiału zostanie w C zanim przejdzie do B.
- Jeśli testy negatywne będą pomijane „bo szkoda czasu”, B zamieni się w narrację.

## Czy naruszono poziomy C/B/A:
- **C:** nie.
- **B:** tak (ustanowiono rygor operacyjny).
- **A:** nie (A pozostaje zablokowane jako argument).
