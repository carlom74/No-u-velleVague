# Mappa requisiti — Direttiva v1.0 → 0.7.0 RC

| Requisito Direttiva | Implementazione 0.7 | Test / stato |
|---|---|---|
| App statica, GitHub Pages, nessun backend | `index.html`, moduli JS, percorsi relativi | UI-04; build check; Pages non testato |
| Importazione locale AKN/XML | `daAkn()` da `public/js/model.js` | E2E predisposto; XML 12/12 well-formed; E2E non eseguito |
| Ricerca Normattiva per estremi / API | Non implementata | NON IMPLEMENTATO |
| Completezza verificata dell'atto | Si dichiara solo parsing integrale del file ricevuto | Limite esplicito; verifica fonte manuale |
| Modello canonico / ID | Modello baseline 0.6.5 | Regressione browser E2E predisposta; corpus Node contract |
| Editor integrale e albero | UI `v07-app.js` | Contratto UI; E2E non eseguito |
| Selezione diretta | Click su nodo; selezione testuale nello stesso nodo | Manuale B; resolver multi-nodo non implementato |
| Operazioni nucleo | Abrogazione, sostituzione partizione, testo, inserimento dopo ancora, rubrica | Core tests; copertura Catalogo parziale |
| Validazione intrinseca | `validateOperation()` | Core tests |
| Validazione redazionale distinta | `record.redaction` con regola/stato | Test formule candidate; Catalogo non integralmente eseguibile |
| Registro permissivo | `addIntervention()` non blocca conflitti | REG core tests |
| Conflitto stesso bersaglio e gerarchico | `analyzeRelations()` | Core tests |
| Interferenze complete e dipendenze | Parziali | NON COMPLETATO |
| Scenari e inclusione/esclusione | `makeScenario`, `validateScenario` | Core tests |
| Simulazione su copia | `applyScenario()` | Core tests immutabilità |
| Diff originario/risultante | Vista leggibile del testo risultante; diff puntuale non completo | Manuale da eseguire |
| Aggregazioni proposte/validate | Proposta per stesso articolo e accettazione/rifiuto | Core test aggregazione |
| Composizione documento | Blocchi derivati e mapping ID | Core tests; copertura formule parziale |
| Persistenza locale | IndexedDB, fallback localStorage | Non test browser; test manuale richiesto |
| Export/import `.nvw` | JSON versionato con estensione `.nvw` | Core round-trip JSON |
| Export TXT/HTML | Implementato | Verifica manuale file richiesto |
| E2E browser reale | Pagina predisposta | NON ESEGUITO |
| Collaudo manuale | Procedura in `COLLAUDO-MANUALE-V0.7.0.md` | NON ESEGUITO |

La colonna di stato non va interpretata come certificazione giuridica. Una funzione implementata non è automaticamente validata rispetto a tutte le fonti redazionali.
