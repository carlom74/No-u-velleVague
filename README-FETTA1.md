# No(u)velle vague — Fetta 1 (v0.6.2)

## Avvio locale

1. Estrarre il contenuto dello ZIP mantenendo le cartelle.
2. Aprire il repository con un server statico locale (ad esempio `npm run dev`). È necessario un origin HTTP per i moduli ES e per i caricamenti locali; non è necessario alcun backend.
3. Aprire `/fetta1.html`.
4. Caricare un file AKN/XML oppure uno ZIP contenente AKN/XML. L'archivio viene letto localmente nel browser.
5. Selezionare una partizione nell'albero. Per la sostituzione di parole selezionare una sequenza testuale nel riquadro del testo.
6. Scegliere l'operazione, inserire il testo richiesto e applicare. Il testo iniziale resta immutato; le modifiche agiscono su una copia.

## Pubblicazione GitHub Pages

Caricare nella root del repository tutti i file e le cartelle contenuti nello ZIP, senza creare un'ulteriore cartella contenitore. Conservare la gerarchia `src/`, `public/`, `test/`.

## Operazioni incluse

- sostituzione di una singola occorrenza testuale;
- abrogazione di una partizione;
- sostituzione integrale di una partizione;
- inserimento prima/dopo una partizione selezionata;
- prima implementazione di numerazione aggiuntiva (non ancora copertura completa NUM-01…NUM-14);
- generazione preliminare di formule per novella/emendamento;
- anteprima del testo risultante, esportazione JSON e documento formulare TXT;
- annulla/ripristina della copia modificata.

## Test

- `test/browser/id-regression.html` esegue nel browser la regressione sugli ID interni e sui riferimenti AKN `ref` usando quattro atti del Senato e quattro XML Normattiva inclusi come fixture.

- `npm run build`: compilazione TypeScript e aggiornamento dei moduli browser.
- `node --experimental-strip-types --test test/fetta1.test.ts`: test unitari del motore Fetta 1.
- Aprire `test/browser/fetta1-check.html` via HTTP per verificare nel browser DOMParser, identificativi stabili e riconoscimento del sottoalbero citato.
- `npm test`: suite completa preesistente; richiede `npm install` per installare `linkedom`.

## Limiti espliciti della consegna

Questa è una prima implementazione eseguibile della Fetta 1, non una certificazione di copertura completa del Catalogo. La numerazione è parziale e non copre ancora tutti i casi NUM-01…NUM-14; il compositore multi-operazione per atto, l'applicazione automatica della veste in base ai metadati della fonte e l'allineamento di tutte le formule ai rispettivi ID del Catalogo richiedono completamento e test dedicati prima di dichiarare la Fetta 1 conclusa. I PDF dei fascicoli Senato sono corpus di evidenza e non vengono caricati nel runtime dell'applicazione.
