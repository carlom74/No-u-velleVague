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

## [0.2.0] - 2026-11-09

- Introdotto il modello normativo canonico (`src/model.ts`).
- Aggiunto l'adattatore dall'attuale parser HTML Normattiva al modello canonico.
- Integrata la costruzione del modello canonico nel flusso di acquisizione già esistente.
- Aggiunti profilo strutturale standard, diagnostica, statistiche e indice eId che conserva le collisioni.
- Aggiunto l'adattatore preliminare AKN/XML lato browser (`daAkn`), senza dipendenze server.
- Aggiunti test unitari del modello e aggiornato lo script di build.

## v0.3.0 — Importazione AKN e ancore testuali
- Raffinato l'adattatore AKN: attraversa i contenitori `content`, `intro`, `list`, `p` e gli altri elementi figli; conserva gli elementi non mappati come XML serializzato.
- Conservato separatamente l'identificativo XML sorgente (`id`) dall'eventuale `eId`; gli identificativi interni sono derivati dal percorso e dall'identificativo sorgente.
- Riconosciuti ulteriori elementi AKN (`bill`, `doc`, `mainBody`, `hcontainer`, `step`, testi citati).
- Introdotti i tipi per bersagli normativi e ancore testuali, con risoluzione che segnala assenza, ambiguità e mancata corrispondenza del contesto senza selezioni arbitrarie.
- Aggiunti test per la risoluzione delle ancore.

## v0.4 — Correzione estrazione testo AKN e test browser
- Corretto `directText()` per attraversare `content`, `p`, `intro` e i contenitori intermedi senza perdere il testo.
- Il testo dei nodi normativi non ingloba quello delle partizioni normative discendenti.
- Gli elementi inline AKN (`i`, `b`, `span`, `eol`, `img`) sono conservati come elementi, senza diagnostica di elemento sconosciuto.
- `num` e `heading` sono trattati come etichetta/rubrica e non duplicati come nodi figli.
- Aggiunti i quattro AKN reali come fixture e una pagina di test browser basata sul `DOMParser` nativo.


## v0.4.1 — anteprima pubblicabile
- Aggiornata l’identificazione della versione nell’interfaccia.
- Aggiunto accesso diretto al test browser dell’importazione AKN dalla barra superiore.
- Aggiornata la documentazione introduttiva.
