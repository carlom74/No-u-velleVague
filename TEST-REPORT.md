# Test report — v0.5.1

## Verifiche eseguite

- Compilazione TypeScript: **PASS** (`tsc -p tsconfig.json`, TypeScript 5.8.3).
- Test modello canonico/ancore: **3 PASS** (`node --experimental-strip-types --test test/model.test.ts`).
- Suite completa: **non completata** nell'ambiente di build, perché la dipendenza di sviluppo `linkedom` non è installata; i test che la importano non possono essere avviati.
- Test browser end-to-end della nuova pagina audit: predisposto in `test/browser/domparser-check.html`; richiede esecuzione in un browser via HTTP/HTTPS.

## Corpus analizzato

Inventario XML indipendente dei quattro fixture inclusi nel pacchetto (conteggio degli elementi e dei nomi locali):

| Documento | Elementi XML | Nomi distinti |
|---|---:|---:|
| AS1308.akn | 376 | 45 |
| AS1786.akn | 525 | 52 |
| AS1924.akn | 449 | 45 |
| AS1786-A.akn | 603 | 48 |

L'inventario del corpus è stato classificato nei gruppi previsti dal modulo audit. Nei quattro campioni attuali tutti i nomi di elemento incontrati sono presenti nella tassonomia preliminare; ciò non equivale a copertura dell'intero vocabolario AKN.

## Interpretazione e limiti

La v0.5 riduce le false anomalie dovute a elementi inline/presentazionali noti. Il test browser espone per ogni file: validità XML, numero totale e distinto di elementi, conteggi per categoria, elementi non classificati e partizioni strutturali senza testo.

L'audit non è una validazione XSD e non certifica conformità AKN. Non è ancora verificata in modo esaustivo la semantica di ogni elemento, la gerarchia di testi citati, la conservazione di tutti gli attributi o la corrispondenza integrale tra XML sorgente e modello canonico. Le diagnostiche del modello vanno quindi interpretate separatamente dall'inventario lessicale.


## v0.5.1 – Verifiche aggiuntive predisposte

La pagina `test/browser/domparser-check.html` ora verifica: (a) conservazione degli eventi `workflow/step` come metadati; (b) conteggio di righe e celle delle tabelle; (c) uguaglianza della sequenza testuale delle celle XML e dei corrispondenti nodi del modello. La classificazione contestuale evita di segnalare come partizione normativa vuota lo `step` collocato in `workflow`.

Questi controlli devono essere eseguiti nel browser dopo la pubblicazione. La compilazione TypeScript e i test automatizzati disponibili sono riportati separatamente; non viene dichiarata una validazione XSD.

- Test modello canonico/ancore rieseguiti nella sessione v0.5.1: **3 PASS** (`node --experimental-strip-types --test test/model.test.ts`).
- Suite completa non eseguita con successo: `linkedom` non disponibile nell ambiente di lavoro; l installazione della dipendenza è andata in timeout.
- Test browser v0.5.1: codice aggiornato e compilato, ma non eseguito in questa sessione. Richiede verifica manuale su GitHub Pages o in un browser locale.
