# Test report — v0.5.0

## Verifiche eseguite

- Compilazione TypeScript: **PASS** (`npm run build`, TypeScript 5.8.3).
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
