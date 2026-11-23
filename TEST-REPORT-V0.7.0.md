# Rapporto dei test — No(u)velle vague 0.7.0 RC

**Data:** 18 novembre 2026  
**Baseline:** ZIP `No-u-velleVague-v0.6.5-Fetta1-foundations(1).zip`  
**Ambiente:** Node.js 22.16.0; Python 3.13; Chromium disponibile ma test browser automatizzato bloccato dall'ambiente.

## Esiti automatici

| Prova | Comando/metodo | Esito |
|---|---|---:|
| Test core e UI | `npm test` | **30 PASS, 0 FAIL** |
| Controllo statico release | `npm run build` | **PASS** |
| Sintassi modulo UI | `node --check v07-app.js` | **PASS** |
| Sintassi motore | `node --check public/js/novella-core.js` | **PASS** |
| XML corpus | `xml.etree.ElementTree.parse` su 12 fixture AKN/XML | **12/12 well-formed** |
| Browser E2E | `test/browser/novellazione-e2e.html` | **NON ESEGUITO** |
| GitHub Pages | deploy repository | **NON ESEGUITO** |
| Collaudo manuale | procedura dedicata | **NON ESEGUITO** |

### Composizione dei 30 test Node

- 22 test core: modello, percorso, localizzazione, ammissibilità, registrazione permissiva, conflitti, scenari, simulazione, immutabilità, aggregazione, composizione, tracciabilità, round-trip e formule candidate.
- 6 test contratto UI/asset: importazione, pannelli, azioni, assenza di `contenteditable` e backend, presenza asset, responsive.
- 2 test corpus: presenza dei dodici fixture e identificazione del fixture L. 241/1990.

Il controllo XML 12/12 è una verifica separata di well-formedness eseguita con la libreria standard Python; non equivale alla verifica semantica del parser applicativo.

## Test browser: motivazione della mancata esecuzione

È stato avviato un server HTTP statico locale. Il tentativo Playwright/Chromium di aprire la pagina locale ha restituito `net::ERR_BLOCKED_BY_ADMINISTRATOR`; il tentativo Chromium headless da riga di comando è terminato per timeout. Per questo motivo il test E2E è incluso nel pacchetto ma non viene dichiarato PASS.

## Limiti funzionali noti

I limiti sono descritti analiticamente in `RELEASE-STATUS.md` e `README.md`. In particolare, non sono completati l'acquisizione Normattiva per estremi e ricostruzione automatica dell'intero atto, la copertura integrale del Catalogo, il resolver avanzato multi-nodo, la tassonomia completa delle interferenze e la composizione pienamente conforme a tutte le regole redazionali. La persistenza IndexedDB è implementata; il file `.nvw` è JSON versionato, non ZIP.

## Decisione tecnica

**Esito: release candidate per test funzionali iniziali.** I test Node e i controlli statici sono superati. Non si dichiara soddisfatta integralmente la Direttiva v1.0 e non si dichiara la release pronta per uso redazionale definitivo. È necessario il collaudo browser e utente, oltre al completamento delle funzioni residue.
