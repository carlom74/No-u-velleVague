# Test report — v0.5.2

## Identificazione

- Versione applicativa: **0.5.2** (`public/js/version.js`).
- Versione schema modello canonico: **1.0.0**.
- Versione audit: **0.5.2**.
- Versione test browser: **0.5.2**.

## Verifiche eseguite in questa sessione

- Compilazione TypeScript (`tsc -p tsconfig.json`): **PASS**.
- Test modello canonico/ancore (`node --experimental-strip-types --test test/model.test.ts`): **3 PASS**.
- Controllo indipendente delle 84 celle di AS1786-A: **84 celle individuate; sequenza testuale normalizzata XML/modello coincidente**.
- Verifica del codice browser: predisposta, **da eseguire dopo la pubblicazione**. Non si dichiara ancora un esito PASS end-to-end nel browser.
- Suite completa: non eseguita in questa sessione; la dipendenza di sviluppo `linkedom` non risulta installata.

## Correzione v0.5.2

L'adattatore AKN conserva gli elementi `table`, `tr`, `td` e `th` nel modello canonico e assegna ai relativi nodi `metadati.nomeElementoAkn`. La pagina di test verifica numero di tabelle, righe e celle, oltre alla corrispondenza della sequenza testuale delle celle XML e del modello.

Per AS1786-A il controllo indipendente sul sorgente XML rileva 1 tabella, 42 righe e 84 celle. La comparazione del testo normalizzato delle 84 celle restituisce uguaglianza. Il risultato end-to-end va confermato eseguendo `test/browser/domparser-check.html` in un browser dopo la pubblicazione.

## Limiti

L'audit non è una validazione XSD e non certifica la conformità AKN. La conservazione tabellare verificata sul campione AS1786-A non equivale a copertura di tutte le varianti di tabelle AKN. Non è ancora verificata in modo esaustivo la semantica di ogni elemento, la gerarchia dei testi citati o la conservazione di ogni attributo.
