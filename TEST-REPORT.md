# Test report — v0.5.5

## Obiettivo

Aggiungere tracciabilità bidirezionale di consultazione tra nodo canonico e frammento XML sorgente, più strumenti di osservabilità dell'importazione. Nessun intervento sul metamodello v0.11 o sulla semantica dei mapping.

## Modifiche

- `metadati.percorsoXml`: percorso composto dagli indici degli elementi figli rispetto alla radice XML; consente di ritrovare l'elemento sorgente nel documento caricato.
- L'esploratore mostra il frammento XML corrispondente al nodo selezionato.
- Inventario dei nodi per tipo canonico, elenco degli elementi non mappati e pannello diagnostiche persistente.
- Aggiunto il campione `Normattiva-26G00200.akn` (circa 557 KB; 2.169 elementi XML, 69 nomi locali distinti, 54 elementi `article` nel documento sorgente).
- Versione applicativa e cache-busting aggiornati a 0.5.5.

## Verifiche eseguite in questa sessione

- Build TypeScript (`npm run build`): **PASS**.
- Test mirati del modello (`node --experimental-strip-types --test test/model.test.ts`): **3 PASS**.
- Suite completa (`npm test`): **parziale/non completata**. I tre test che importano `linkedom` non partono perché il pacchetto non è installato nell'ambiente; i tre test del modello passano.
- Test browser end-to-end della nuova tracciabilità: **non certificato in questa sessione**. È incluso `test/browser/trace-check.html` per la verifica nel browser dopo il deploy.
- I quattro campioni precedenti mantengono i test e gli esiti già documentati nella baseline 0.5.4/0.5.3; non sono stati rieseguiti integralmente in questa sessione.

## Limiti

Il percorso XML garantisce la rintracciabilità tecnica dell'elemento nel documento caricato, non la correttezza semantica della sua classificazione nel modello. I mapping restano volutamente invariati e preliminari. L'importazione non certifica conformità XSD né completezza semantica AKN. Il campione Normattiva è incluso come fixture, ma il suo test completo nel browser resta da confermare dopo la pubblicazione.
