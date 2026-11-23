# Stato della release 0.7.0

**Classificazione:** Release Candidate (RC), non release finale conforme alla Direttiva v1.0.

## Implementato
- Importazione locale XML/AKN e parsing mediante modello canonico preesistente.
- Editor con indice, testo e pannello operativo contestuale.
- Operazioni di modifica del nucleo dichiarato nel README.
- Registro permissivo e conflitto certo abrogazione/sostituzione sullo stesso bersaglio.
- Relazione gerarchica certa per trasformazione di antenato e modifica di discendente.
- Scenari e simulazione non distruttiva.
- Aggregazioni proposte e validabili.
- Composizione derivata e mapping `blockId` ↔ `interventionIds`.
- Salvataggio locale e export/import JSON `.nvw`.

## Test eseguiti
- `npm test`: 28 PASS, 0 FAIL.
- `npm run build`: PASS (controllo statico asset/entry point).
- `node --check v07-app.js`: PASS.
- `node --check public/js/novella-core.js`: PASS.

## Test non eseguiti
- Pagina browser E2E in Chromium: NON ESEGUITA. Il tentativo di apertura automatizzata dell'URL locale è stato bloccato dall'ambiente (`ERR_BLOCKED_BY_ADMINISTRATOR`); il tentativo headless CLI è terminato per timeout.
- GitHub Pages: NON ESEGUITO; richiede pubblicazione nel repository dell'utente.
- Collaudo manuale: NON ESEGUITO; da svolgere dall'utente.

## Scostamenti dalla Direttiva v1.0 da chiudere
1. Ricerca/acquisizione Normattiva via estremi identificativi e ricostruzione completa articolo-per-articolo con indice verificato.
2. Verifica affidabile della completezza del documento acquisito.
3. Copertura completa delle operazioni del Catalogo v0.11, incluse numerazione e profili non standard.
4. Resolver avanzato per selezione di parola/intervallo, contesti e occorrenze; intervalli multi-nodo.
5. Tassonomia completa delle relazioni, dipendenze, interferenze d'ordine e conservazione della storia delle relazioni superate.
6. Applicazione generale delle patch con gestione corretta di più intervalli disgiunti nello stesso nodo.
7. Composizione completa secondo Catalogo e Circolare, con validazione delle formule, alinea, layout, virgolette e numerazione.
8. Persistenza automatica IndexedDB con fallback localStorage; il file `.nvw` esportato è JSON versionato e non un contenitore ZIP conforme al formato definitivo del Metamodello.
9. Test E2E browser eseguito e report automatico completo.
10. Audit di accessibilità e usabilità.

## Decisione
Il pacchetto è adatto a una prima prova tecnica dell'interfaccia e del flusso centrale, ma **non deve essere considerato ancora idoneo alla produzione di un documento modificativo definitivo**. La composizione va trattata come bozza tecnica da sottoporre a revisione.
