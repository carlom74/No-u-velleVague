# Changelog — 0.7.0

## Baseline
Derivata da `No-u-velleVague-v0.6.5-Fetta1-foundations.zip`. I moduli preesistenti di parsing, modello canonico, lessico e audit sono mantenuti; la precedente interfaccia sperimentale non è più l'entry point della release.

## Aggiunto
- Nuova interfaccia editoriale a tre aree: indice, testo integrale, pannello contestuale.
- Importazione locale XML/AKN e caricamento del fixture L. 241/1990.
- Motore client-side per registro permissivo, analisi conflitti, scenari, applicazione non distruttiva e composizione.
- Aggregazioni proposte per articolo con validazione dell'utente.
- Esportazione TXT/HTML e progetto JSON versionato `.nvw`.
- Suite automatica 0.7 e pagina browser E2E.

## Corretto / consolidato
- Il testo sorgente resta immutato durante la simulazione.
- L'abrogazione e la sostituzione integrale dello stesso bersaglio possono coesistere nel registro e sono incompatibili solo nello scenario congiunto.
- Le formule candidate sono marcate come candidate e non come attestate.
- Le operazioni mostrate nell'editor sono filtrate in base al tipo di bersaglio.

## Non completato
Le lacune elencate in `RELEASE-STATUS.md` impediscono di qualificare 0.7.0 come release conforme integralmente alla Direttiva v1.0. Il pacchetto è una release candidate da sottoporre a test manuale e a completamento tecnico.
