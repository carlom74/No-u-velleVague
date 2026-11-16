# Test report — Fetta 1 / v0.6.0

Data: 16 novembre 2026.

## Esiti eseguiti

| Verifica | Esito | Ambito |
|---|---|---|
| Compilazione TypeScript (`tsc -p tsconfig.json`) | PASS | sorgenti TS inclusi nel progetto |
| Build moduli browser (`npm run build`) | PASS | parser, modello, audit, motore e catalogo Fetta 1 |
| Test unitari `test/fetta1.test.ts` | PASS 6/6 | sostituzione parole, abrogazione, sostituzione partizione, inserimento, ambiguità, numerazione in coda |
| Sintassi `fetta1.js` (`node --check`) | PASS | controllo sintattico |
| Suite preesistente completa | NON ESEGUITA CON SUCCESSO | richiede `linkedom`; installazione dipendenze non completata nel tempo disponibile |
| Test browser `test/browser/fetta1-check.html` | PREDISPOSTO, NON ESEGUITO | deve essere aperto in un browser tramite HTTP |

## Limiti da non confondere con test superati

1. La numerazione implementata è preliminare e non copre ancora tutti i casi NUM-01…NUM-14. NUM-05 resta indeterminato secondo il Catalogo.
2. Il compositore produce una bozza per gruppi di modifiche; la citazione dell'atto modificato resta un segnaposto quando i metadati AKN non bastano a costruirla con certezza. Non va considerato un documento legislativo pronto alla presentazione.
3. La configurazione `catalogo-fetta1.ts` è un primo sottoinsieme eseguibile e non è ancora allineata a tutte le 87 righe del Catalogo v0.11.
4. Il profilo della fonte viene derivato da `bill`/`act` quando questi elementi sono presenti nell'AKN; per AKN non classificabili la veste resta selezionabile e richiede verifica.
5. La lettura ZIP gestisce gli archivi standard con entry non cifrate e metodi Store/Deflate; ZIP64, cifratura e formati non standard non sono coperti.
6. La lettura e la conservazione dei sottoalberi citati sono predisposte nel parser; la modifica operativa delle novelle annidate appartiene alla Fetta 4.

Il superamento dei test sopra elencati non costituisce validazione AKN generale, XSD o giuridica.
