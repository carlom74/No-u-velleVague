# Test report — v0.5.4

## Obiettivo

Introdurre una GUI di ispezione del modello canonico AKN, senza modificare il metamodello e senza aggiungere componenti server.

## Modifiche

- Nuova pagina `test/browser/model-inspector.html`, collegata dalla home page.
- Caricamento dei quattro campioni AKN inclusi e di file `.akn`/`.xml` locali.
- Albero gerarchico con espansione/compressione e filtro.
- Pannello di dettaglio con testo, identificativi, attributi, metadati e contenuto non interpretato.
- Anteprima tabellare basata sui nodi `table`/`tr`/`td`/`th` già conservati dall’adattatore.
- Riepilogo statistiche e diagnostiche.

## Verifiche eseguite in questa sessione

- Build TypeScript (`npm run build`): **PASS**.
- Test modello (`test/model.test.ts`): **3 PASS**.
- Suite completa (`npm test`): **non completata** perché `linkedom` non è installato nell’ambiente; tre file di test non sono stati eseguiti.
- Test browser dell’esploratore: **da eseguire dopo il deploy** su GitHub Pages.
- Test browser di importazione AKN/tabella v0.5.3: già eseguito dall’utente con esito **PASS** sui quattro campioni, inclusa la conservazione di 42 righe, 84 celle e 18 celle vuote in AS1786-A.

## Limiti

La pagina è uno strumento di ispezione, non un editor. Non modifica il modello né genera novelle. La visualizzazione riproduce la struttura attualmente costruita dall’adattatore: non certifica completezza semantica AKN, conformità XSD o copertura di tutte le tipologie documentali. Il test browser della nuova pagina deve ancora essere confermato dall’utente dopo la pubblicazione.
