# Editor di novelle normative — prototipo 0.1

Prototipo statico, senza backend applicativo e senza database. Funziona nel browser e può essere pubblicato su GitHub Pages, Cloudflare Pages o qualsiasi hosting statico HTTPS.

## Funzioni incluse

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
