# No(u)velle vague — Release 0.7.0 (candidate)

Editor client-side per la novellazione di un singolo atto normativo vigente. La release deriva dalla baseline software 0.6.5 e mantiene il parser e il modello canonico AKN già presenti.

## Avvio rapido

Non aprire `index.html` con `file://`: usare un server statico locale.

```bash
python3 -m http.server 8080
```

Aprire `http://localhost:8080/`.

Per una prima prova selezionare **Apri il campione L. 241/1990** oppure importare un file XML/Akoma Ntoso integrale proveniente da Normattiva.

## Pubblicazione GitHub Pages

1. Estrarre il contenuto dello ZIP nella root del repository (mantenendo la struttura delle cartelle).
2. Pubblicare il branch e la cartella root con GitHub Pages.
3. Aprire l'URL Pages del repository. Gli asset sono richiamati con percorsi relativi.

L'applicazione non richiede backend, proxy, database remoto o servizi esterni. I testi sono elaborati nel browser.

## Funzioni implementate

- Importazione locale XML/AKN tramite `DOMParser` e parser canonico della baseline.
- Fixture locale L. 241/1990 vigente al 1° gennaio 2026.
- Indice gerarchico e visualizzazione integrale dei nodi interpretati.
- Selezione diretta di una partizione e selezione di testo con mouse per predisporre l'ancora.
- Operazioni: abrogazione, sostituzione integrale, sostituzione/soppressione di parole, inserimento dopo un'ancora, modifica/soppressione rubrica.
- Validazione intrinseca separata dalla compatibilità con gli altri interventi.
- Registro permissivo, relazioni di interferenza e scenari alternativi.
- Simulazione su copia dell'atto base.
- Proposte di aggregazione per interventi riferiti allo stesso articolo, accettabili/rifiutabili.
- Documento modificativo derivato dal registro, con mapping blocco-interventi.
- Esportazione TXT e HTML stampabile.
- Salvataggio locale automatico, esportazione/importazione progetto `.nvw` (JSON versionato).

## Limiti noti — leggere prima di utilizzare

Questa è una **release candidate funzionale**, non ancora una release che soddisfa integralmente tutti i criteri della Direttiva v1.0.

1. **Acquisizione Normattiva:** il percorso end-to-end verificabile usa un XML/AKN integrale importato localmente. Non è implementata una ricerca completa dell'atto via API: l'endpoint Normattiva noto restituisce un articolo per chiamata e non espone un indice generale. L'app non dichiara quindi di aver ricostruito automaticamente tutti gli articoli a partire dai soli estremi.
2. **Completezza della fonte:** viene parsato tutto il file caricato; non è possibile attestare automaticamente che il file fornito contenga tutte le partizioni pubblicate. La verifica di completezza rispetto alla fonte ufficiale resta in capo al collaudo.
3. **Operazioni del Catalogo:** sono implementate le famiglie elencate sopra, non tutte le 87 voci del Catalogo v0.11. Le formule candidate sono marcate come tali; le rubriche restano non validate sul piano redazionale.
4. **Selezione testuale:** le ancore operano sul testo diretto del nodo selezionato. Non è ancora disponibile una selezione robusta di intervalli che attraversino più nodi inline, né un resolver con disambiguazione avanzata per tutte le forme del Metamodello.
5. **Conflitti:** sono implementati i conflitti certi sullo stesso bersaglio e la relazione gerarchica antenato/discendente. La tassonomia completa delle interferenze potenziali, dipendenze, ordine e ricalcolo storico non è ancora completa.
6. **Applicazione:** la simulazione applica le operazioni implementate su una copia. La gestione generale di patch multiple su intervalli disgiunti nello stesso nodo richiede ulteriore estensione.
7. **Composizione:** il compositore produce formule per il nucleo implementato. Non copre tutte le regole di numerazione, i casi di commi non numerati, le partizioni superiori, le formule candidate e tutte le regole di layout del Catalogo.
8. **Persistenza:** il progetto `.nvw` è JSON versionato, non archivio ZIP; la persistenza automatica usa IndexedDB, con fallback a localStorage, e non sincronizza dispositivi.
9. **Collaudo browser:** è inclusa una pagina E2E. L'esecuzione Chromium automatizzata non è stata completata nell'ambiente di generazione; va eseguita dall'utente in locale o su GitHub Pages.
10. **Accessibilità:** layout responsive e controlli semantici di base; non è stato svolto un audit WCAG completo.

## Test automatici

Richiede Node.js 22 o successivo.

```bash
npm test
npm run build
```

`npm test` esegue la suite 0.7 indipendente da dipendenze esterne. `npm run build` esegue un controllo statico degli asset e dell'entry point (non una compilazione TypeScript).

Per la pagina browser E2E:

```bash
python3 -m http.server 8080
```

Aprire `http://localhost:8080/test/browser/novellazione-e2e.html`.

## Struttura

- `index.html`, `v07-app.js`, `v07.css`: applicazione 0.7.
- `public/js/novella-core.js`: motore di interventi, conflitti, scenari e composizione.
- `public/js/model.js`, `parser.js`, `lessico.js`: moduli browser ereditati dalla baseline 0.6.5.
- `src/`: sorgenti TypeScript originali della baseline.
- `test/v07-core.test.mjs`: test unitari del nuovo motore.
- `test/v07-ui-contract.test.mjs`: test del contratto UI.
- `test/browser/novellazione-e2e.html`: pagina di regressione browser.
- `test/fixtures/atti/`: corpus XML/AKN di regressione e fixture principale.

## Stato del rilascio

Vedere `RELEASE-STATUS.md`, `TEST-REPORT-V0.7.0.md` e `COLLAUDO-MANUALE-V0.7.0.md`. Non usare il documento modificativo generato come testo normativo validato senza revisione redazionale e giuridica.
