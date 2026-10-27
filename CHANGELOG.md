# Registro delle modifiche

## 0.1 — prima versione dell'interfaccia

- Form per tipo, data e numero dell'atto.
- Generazione della URN e campo per il numero dell'articolo.
- Acquisizione diretta dal browser tramite API Open Data Normattiva.
- Selezione preliminare della versione vigente, originaria o a una data.
- Parsing del DOM ricevuto e visualizzazione gerarchica delle partizioni riconosciute.
- Dettaglio del nodo selezionato, avvisi del parser e valutazione prudenziale.
- HTML grezzo e metadati consultabili.
- Campione locale della legge 241/1990 per testare l'interfaccia offline.
- Ricognizione sperimentale dell'atto con richieste successive articolo per articolo.


## v0.2 — acquisizione progressiva
- Rimosso il tetto fisso di 80 articoli nella ricognizione dell'atto.
- Scansione sequenziale fino a quattro numeri consecutivi non acquisibili; nessun massimo prefissato di articoli.
- Stato di avanzamento con ultimo numero esaminato, articoli acquisiti e stima dimensione HTML.
- Avvisi informativi per corpus grandi, senza interruzione automatica in base alla dimensione.
- Documentato che la scansione non garantisce ancora suffissi, allegati e gerarchia titolo/capo.
