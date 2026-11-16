# Rapporto di verifica — v0.6.5

## Esito sintetico

- Compilazione TypeScript (`npm run build`): **PASS**.
- Test motore e regressione funzionale (`test/fetta1.test.ts`, `test/functional-real.mjs`): **12 PASS, 0 FAIL**.
- Test contrattuali UI (`test/ui-contract.test.mjs`): **4 PASS, 0 FAIL**.
- Verifica completa di `test/*.test.ts`: **non completabile in questo ambiente** per assenza del pacchetto di sviluppo `linkedom`, richiesto da `casi.test.ts`, `corpus-strutturale.test.ts` e `validazione.test.ts`. Questi tre file non sono classificati come PASS né come regressioni del codice.
- Test end-to-end in browser reale: **da eseguire dall'utente**; non è stato simulato né dichiarato come superato.

## Copertura aggiunta

1. Riferimento gerarchico derivato dall'albero canonico, senza memorizzare un percorso duplicato nel comando.
2. Riferimento esplicito anche per lettere annidate (es. «la lettera a) del comma 3 dell’articolo 4»).
3. Operazioni distinte di sostituzione e soppressione della rubrica.
4. Albero con espansione dei livelli strutturali e percorso del bersaglio visibile.
5. Operazioni disabilitate quando non applicabili al tipo di nodo selezionato.
6. Formula mostrata insieme al percorso del bersaglio.
7. Anteprima in sola lettura; rimosso `contenteditable`. La selezione testuale è acquisita dalla vista e applicata esclusivamente al modello tramite il motore.
8. Test su articoli, commi, lettere annidate, rubriche e regressione funzionale.

## Vincoli conservati

- Selettore degli atti di test incluso e caricamento manuale AKN/XML/ZIP conservato.
- Elaborazione client-side; nessun componente server introdotto.
- Le formule sono implementazioni operative da sottoporre a validazione redazionale; il riferimento gerarchico esplicito non sostituisce il controllo delle formule rispetto alla Circolare e agli esempi del Catalogo.
