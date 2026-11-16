# Test report — Fetta 1 / v0.6.2

Data: 16 novembre 2026.

## Esiti eseguiti

| Verifica | Esito | Ambito |
|---|---|---|
| Compilazione TypeScript (`tsc -p tsconfig.json`) | PASS | sorgenti TS inclusi nel progetto |
| Build moduli browser (`npm run build`) | PASS | parser, modello, audit, motore e catalogo Fetta 1 |
| Test unitari `test/fetta1.test.ts` | PASS 6/6 | sostituzione parole, abrogazione, sostituzione partizione, inserimento, ambiguità, numerazione in coda |
| Sintassi `fetta1.js` (`node --check`) | PASS | controllo sintattico |
| Suite preesistente completa | NON ESEGUITA CON SUCCESSO | richiede `linkedom`; installazione dipendenze non completata nel tempo disponibile |
| Test browser `test/browser/fetta1-check.html` | PREDISPOSTO, NON ESEGUITO in questa sessione | deve essere aperto in un browser tramite HTTP |
| Test browser `test/browser/id-regression.html` | PREDISPOSTO, NON ESEGUITO con esito affidabile | Chromium headless non ha completato il caricamento entro il timeout; da eseguire in browser ordinario |
| Test unitari `test/model.test.ts` | PASS 3/3 | adattatore, identificativi, ancore testuali |
| Test unitari `test/fetta1.test.ts` | PASS 6/6 | motore Fetta 1 |
| Build TypeScript (`tsc -p tsconfig.json`) | PASS | sorgenti e moduli browser aggiornati |

## Correzioni v0.6.2

- Introdotto `idInterno`, percorso univoco comprensivo dei wrapper non normativi. La validazione delle collisioni usa questo campo.
- Conservati gli ID semantici delle partizioni normative (ad es. `art3`, `art3-com2`) senza incorporare i wrapper.
- Mappato AKN `ref` come elemento inline riconosciuto nel modello e nell'audit lessicale.
- Inseriti nel corpus di regressione quattro AKN Senato (`AS1308`, `AS1786`, `AS1924`, `AS1786-A`) e quattro XML Normattiva (D.Lgs. 123/1998, L. 241/1990, D.L. 69/2013, D.L. 203/2005).
- Aggiunta la pagina `test/browser/id-regression.html`. I test su corpus reale restano da eseguire e verificare in un browser.

## Limiti da non confondere con test superati

1. La numerazione implementata è preliminare e non copre ancora tutti i casi NUM-01…NUM-14. NUM-05 resta indeterminato secondo il Catalogo.
2. Il compositore produce una bozza per gruppi di modifiche; la citazione dell'atto modificato resta un segnaposto quando i metadati AKN non bastano a costruirla con certezza. Non va considerato un documento legislativo pronto alla presentazione.
3. La configurazione `catalogo-fetta1.ts` è un primo sottoinsieme eseguibile e non è ancora allineata a tutte le 87 righe del Catalogo v0.11.
4. Il profilo della fonte viene derivato da `bill`/`act` quando questi elementi sono presenti nell'AKN; per AKN non classificabili la veste resta selezionabile e richiede verifica.
5. La lettura ZIP gestisce gli archivi standard con entry non cifrate e metodi Store/Deflate; ZIP64, cifratura e formati non standard non sono coperti.
6. La lettura e la conservazione dei sottoalberi citati sono predisposte nel parser; la modifica operativa delle novelle annidate appartiene alla Fetta 4.

Il superamento dei test sopra elencati non costituisce validazione AKN generale, XSD o giuridica.
