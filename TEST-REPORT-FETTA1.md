# Test report — Fetta 1 / v0.6.3 (consolidamento storico v0.6.2)

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


## v0.6.3 — Regressione funzionale preliminare su A.S. 1308

**Fonte di prova:** `test/fixtures/akn/AS1308.akn`, articolo 1, comma 1.

Il testo del comma è stato estratto dal documento AKN reale. Il test del motore opera su un modello canonico fixture derivato da quel testo; non equivale a una prova end-to-end dell'adattatore AKN nel browser. È stata inoltre predisposta `test/browser/functional-real.html`, che importa il documento con `daAkn()` via DOMParser e prova le quattro operazioni nel browser.

| Verifica | Esito | Perimetro |
|---|---|---|
| Build TypeScript (`npm run build`) | PASS | Sorgenti e moduli browser compilati |
| Test Fetta 1 | PASS — 8/8 | Operazioni, formule, ambiguità e numerazione |
| Test funzionale su modello derivato da AS1308 | PASS — 6/6 | Sostituzione testuale, sostituzione integrale, abrogazione, inserimento, conservazione fonte, unicità ID |
| Browser `functional-real.html` | DA ESEGUIRE | Harness predisposto, Chromium headless non ha completato l'esecuzione nell'ambiente di lavoro |
| Suite completa | PARZIALE — 11 PASS, 3 file bloccati | `linkedom` non installato (`casi`, `corpus-strutturale`, `validazione`) |

### Correzioni alle formule

- Emendamento: `Sostituire le parole «X» con le seguenti: «Y».` (E-05).
- Emendamento: `Sostituire il comma 1 con il seguente: «1. ...»` (E-03).
- Emendamento: `Sopprimere il comma 1.` (E-18).
- Novella: `Dopo il comma 1 è inserito il seguente: «1-bis. ...»` (N-17).

Il testo del nodo canonico resta privo della numerazione di presentazione; la numerazione è resa nella formula/testo citato.

### Limiti e backlog emersi

1. Le etichette AKN con prefisso `Art.` e punto finale sono normalizzate prima della composizione delle formule.

1. Le formule per inserimento prima del bersaglio non sono ancora differenziate e validate rispetto alla formula specifica; non considerare coperta la posizione `prima`.
2. Le formule per lettere/numeri e per bersagli annidati richiedono test dedicati e verifica puntuale con il Catalogo.
3. Il compositore multi-operazione e la veste derivata dalla fonte vanno collaudati a livello UI.
4. Il riquadro testuale è `contenteditable`: verificare e correggere il rischio che l'utente modifichi la sola rappresentazione DOM senza aggiornare il modello canonico.
5. La regressione browser effettiva è ancora da eseguire.

**Valutazione:** v0.6.3 è una correzione candidata per il motore delle formule nei casi verificati, non una Fetta 1 completata né una release da pubblicare senza il successivo collaudo browser.
