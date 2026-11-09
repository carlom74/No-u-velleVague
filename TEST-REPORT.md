# Test report — v0.4

## Verifiche eseguite in questo ambiente
- Compilazione TypeScript (`tsc -p tsconfig.json`): superata.
- Test modello e ancore (`node --experimental-strip-types --test test/model.test.ts`): 3 superati.
- Ispezione dei quattro XML AKN con parser XML: tutti ben formati.
- Verifica strutturale indipendente dell’estrazione del testo: nessun elemento `paragraph` vuoto nei tre atti con articoli (AS1308, AS1786, AS1924).
- AS1786-A: rilevata e conservata la tabella del testo a fronte.
- Il browser headless disponibile nell’ambiente non ha completato l’esecuzione della pagina; il test con DOMParser nativo è quindi predisposto ma resta da eseguire manualmente in un browser.

## Test DOMParser da eseguire
Aprire `test/browser/domparser-check.html` tramite un server HTTP (non con `file://`). La pagina produce un report JSON. Esito atteso: `status: PASS`, nessun errore, nessun comma vuoto nei tre atti e almeno una tabella in AS1786-A.

## Limiti residui
La verifica manuale nel browser è necessaria prima della pubblicazione. Il test completo Node continua a richiedere l’installazione delle devDependencies (`npm install`, in particolare `linkedom`).
