# Rapporto di prova — Editor di novelle normative 0.1

Data: 27 ottobre 2026

## Esiti

- `node --check app.js`: superato.
- `npm run build`: superato; sorgente TypeScript compilato in moduli JavaScript browser.
- Smoke test parser su Legge 7 agosto 1990, n. 241, art. 1: superato. Numero articolo riconosciuto, rubrica riconosciuta, cinque commi, conservazione del testo verificata, stato preliminare `candidato`.
- Suite parser: 31 test superati, 0 falliti.

## Cosa non è stato verificato

- Non è stata eseguita da questo ambiente una chiamata live all'API di produzione. Il browser dell'ambiente di prova ha bloccato la navigazione verso il server locale, quindi non è stato possibile completare un test end-to-end della UI con una richiesta reale. L'app usa l'endpoint pubblico documentato; l'accesso dipende dalla raggiungibilità dell'API e dalle policy CORS del browser.
- La ricognizione dell'intero atto è best effort: prova articoli numerati in sequenza e non garantisce di trovare suffissi, gruppi, allegati o la struttura di titoli e capi. Non va trattata come indice completo.
- La correttezza giuridica degli alberi non è certificata dai test automatici.

## Criterio di rilascio

Il prototipo è adatto a una prova d'uso tecnica e a verificare l'acquisizione di un articolo. Prima dell'uso redazionale, verificare manualmente l'albero prodotto e i metadati della versione selezionata.
