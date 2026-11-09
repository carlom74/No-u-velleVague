# No(u)velle vague — editor di novelle normative (prototipo 0.5.2)

Prototipo statico, senza backend applicativo e senza database. Funziona nel browser e può essere pubblicato su GitHub Pages, Cloudflare Pages o qualsiasi hosting statico HTTPS.

## Funzioni incluse

- modello normativo canonico indipendente dalla fonte;
- importazione sperimentale di Akoma Ntoso XML nel browser;
- test browser dei quattro campioni AKN inclusi nel repository.

- selezione del tipo, data e numero dell'atto;
- generazione dell'URN di base;
- acquisizione di un articolo tramite l'API Open Data Normattiva;
- selezione del testo vigente oggi, originario o vigente a una data indicata;
- parsing dell'HTML con il parser del progetto e costruzione di un albero navigabile di commi, lettere e numeri;
- visualizzazione degli avvisi, della classificazione preliminare di affidabilità, dell'HTML originale e dei metadati;
- esempio locale basato sul campione della legge 241/1990, utile anche quando l'API non è raggiungibile;
- modalità sperimentale per ricognizione dell'atto tramite richieste successive articolo per articolo.

## Avvertenze importanti

1. L'API Normattiva espone contenuti articolo per articolo. La modalità «Intero atto» prova a enumerare gli articoli numerati, ma non garantisce di individuare articoli con suffissi, gruppi strutturati, titoli, capi o allegati. Non usare la ricognizione come indice completo dell'atto.
2. Il browser deve poter raggiungere l'API e l'API deve consentire la richiesta cross-origin (CORS). Se non è così, il prototipo mostra l'errore e resta utilizzabile con il campione locale. Un eventuale proxy può essere valutato successivamente, ma introdurrebbe un componente server.
3. L'output del parser è un DOM applicativo ricostruito dall'HTML di Normattiva. La conservazione testuale e l'assenza di avvisi non equivalgono a certificazione giuridica.
4. I testi Normattiva sono riportati con attribuzione alla fonte e avvertenza di carattere non autentico. Consultare il testo ufficiale in Gazzetta Ufficiale nei casi rilevanti.
5. Prima della redistribuzione istituzionale va chiarita la licenza del codice parser derivato da PArSe, come segnalato nel README originario.

## Esecuzione locale

È sufficiente servire la cartella via HTTP/HTTPS. Non aprire `index.html` direttamente come `file://`, perché i moduli JavaScript e il caricamento del campione locale potrebbero essere bloccati dal browser.

Con Python 3:

```bash
python3 -m http.server 8080
```

Aprire `http://localhost:8080`.

## Deploy gratuito

### GitHub Pages
1. Creare un repository e caricare tutti i file di questa cartella nella root.
2. In **Settings → Pages**, selezionare il branch principale e la cartella `/ (root)`.
3. Attendere il deploy e aprire l'URL HTTPS pubblicato.

### Cloudflare Pages
1. Creare un progetto Pages collegato al repository.
2. Impostare la directory di output alla root (`/`) e nessun comando di build.
3. Pubblicare.

## Struttura

- `index.html`: interfaccia
- `styles.css`: stile responsive
- `app.js`: orchestrazione API, UI e visualizzazione DOM
- `public/js/parser.js`, `public/js/lessico.js`: parser già compilato per il browser
- `public/campioni-normattiva.json`: campione locale
- `src/`: sorgenti TypeScript del parser

Runtime: nessun framework e nessuna dipendenza remota. Il parser viene eseguito nel browser.


## Ricognizione dell'intero atto (prototipo)

La modalità «Intero atto» non impone più un numero massimo fisso di articoli. Parte dall'articolo indicato e procede in sequenza; termina dopo quattro numeri consecutivi che l'API non riesce ad acquisire. Durante la scansione mostra il numero raggiunto, gli articoli acquisiti e una stima della dimensione HTML. Oltre determinate soglie informative avvisa che la visualizzazione potrebbe rallentare, senza interrompere automaticamente l'acquisizione.

**Limite noto:** questa è una ricognizione best-effort della sequenza numerica, non un indice normativo completo. Non garantisce il reperimento di articoli con suffisso (es. `80-bis`), allegati, partizioni strutturate per titolo/capo o articoli temporaneamente non raggiungibili. Quattro risposte consecutive non acquisibili sono un criterio di arresto euristico, non una prova formale della fine dell'atto. I testi restano da verificare prima di usarli per generare novelle.

## Modello normativo canonico (v0.2)

Il modulo `src/model.ts` introduce una rappresentazione indipendente dalla fonte di acquisizione. Il flusso Normattiva esistente produce ora anche `canonical`, mediante `daArticoliNormattiva()`. Il modello conserva identità/versione dell'atto, profilo strutturale, gerarchia, provenienza, diagnostica, statistiche e indice degli `eId` (incluse le collisioni, che non vengono risolte eliminando nodi).

È disponibile anche `daAkn(xml, options)`, adattatore preliminare client-side basato su `DOMParser`. Accetta XML AKN, conserva il documento originale e costruisce una gerarchia canonica; gli elementi non riconosciuti sono segnalati/conservati, non interpretati arbitrariamente. L'interfaccia di caricamento AKN e l'inserimento URN diretta restano incrementi successivi.

Per compilare: `npm run build`. Il modulo browser compilato è `public/js/model.js`. Test specifici: `node --experimental-strip-types --test test/model.test.ts`.

### Modello canonico e importazione AKN

Il modulo `src/model.ts` definisce il modello normativo canonico e gli adattatori per Normattiva HTML e Akoma Ntoso XML. Nell'importazione AKN sono conservati sia l'eventuale `eId` sia l'identificativo XML `id` (campo `identificativoSorgente`); i due identificativi non sono confusi. Gli elementi non ancora classificati sono conservati come frammenti XML e accompagnati da diagnostica.

Il modulo definisce inoltre `BersaglioNormativo` e `AncoraTestuale`. `risolviAncora()` non sceglie automaticamente tra più occorrenze: restituisce lo stato `ambigua`, salvo che il contesto o il numero di occorrenza rendano univoca la selezione.

### Verifica browser dell'importazione AKN
È disponibile `test/browser/domparser-check.html`, una pagina autonoma che importa i quattro campioni AKN inclusi in `test/fixtures/akn/`, li analizza con il `DOMParser` nativo e verifica testo dei commi, identificativi sorgente, validazione del modello e tabelle del testo a fronte.

Per eseguirla in locale, dalla directory del repository avviare `npm run dev` e aprire `http://localhost:8080/test/browser/domparser-check.html`. La pagina mostra un report JSON e imposta `data-status="PASS"` o `data-status="FAIL"` sull'elemento HTML. La stessa pagina può essere aperta su GitHub Pages dopo aver pubblicato il repository.


## Audit strutturale AKN (v0.5)

Il modulo `src/audit.ts` aggiunge `analizzaAkn(xml)`, un inventario lessicale client-side degli elementi XML. Classifica gli elementi in: radice/documento, struttura normativa, contenitori, presentazione, metadati, supporto editoriale e non classificati. Segnala inoltre le partizioni strutturali prive di testo. La pagina `test/browser/domparser-check.html` include ora, per ciascun campione, il riepilogo dell'audit insieme ai controlli del modello canonico.

Il modello riconosce inoltre gli elementi inline/presentazionali presenti nel corpus (ad es. `i`, `b`, `span`, `eol`, `img`) come elementi AKN noti, senza confonderli con partizioni normative e senza segnalarli come elementi XML sconosciuti. Il frammento XML originale resta conservato nell'atto canonico.

**Limite:** l'audit è un inventario e una classificazione preliminare del corpus, non è una validazione XSD, non attesta la conformità complessiva ad Akoma Ntoso e non dimostra da solo la completezza semantica della gerarchia normativa.


## v0.5.1 – Audit contestuale e conservazione

La v0.5.1 raffina l'audit AKN distinguendo il `step` del `workflow` dalle partizioni normative vuote. Gli eventi del workflow sono conservati nei metadati della radice del modello. L'audit descrive inoltre righe, celle e testo delle tabelle; il test browser confronta il testo delle celle XML con quello acquisito nel modello canonico.

La verifica non equivale a validazione XSD né attesta da sola la completezza semantica dell'importazione.


## Versione applicativa

La versione applicativa è definita in un unico punto (`public/js/version.js`) e riportata automaticamente nella home page e nel report del test browser. Il report espone separatamente `appVersion`, `modelVersion`, `auditVersion` e `testVersion`. La versione del modello indica lo schema canonico (`1.0.0`), non la versione del rilascio applicativo.

## Conservazione delle tabelle AKN (v0.5.3)

L'adattatore AKN conserva gli elementi `table`, `tr`, `td` e `th` nell'albero canonico. I nodi mantengono il tipo canonico previsto (tabella o elemento) e riportano in `metadati.nomeElementoAkn` il nome locale AKN, così da rendere verificabili righe e celle senza assimilare le celle a partizioni normative. Il testo di ciascuna cella è estratto attraversando i contenitori e gli elementi inline.


La versione 0.5.3 corregge la conservazione delle tabelle AKN nel modello canonico e applica URL versionati alle risorse statiche per ridurre gli effetti delle cache del browser/CDN.
