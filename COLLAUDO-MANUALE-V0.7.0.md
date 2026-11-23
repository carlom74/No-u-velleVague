# Collaudo manuale — No(u)velle vague 0.7.0

Eseguire su GitHub Pages dopo la pubblicazione oppure in locale con `python3 -m http.server 8080`.

## A. Apertura e importazione
1. Aprire l'applicazione.
2. Selezionare «Apri il campione L. 241/1990».
3. Verificare titolo, fonte, metadati, conteggio nodi e messaggio sulla completezza.
4. Verificare che nell'indice compaiano articoli e commi e che il testo sia leggibile.
5. Importare un secondo XML Normattiva dal proprio disco e verificare che l'atto venga sostituito senza errori.

**PASS:** l'XML viene parsato; struttura e testo sono consultabili; diagnostiche visibili. Annotare separatamente se la completezza coincide con Normattiva.

## B. Navigazione e selezione
1. Cercare un articolo nell'indice.
2. Selezionare un comma e controllare il percorso mostrato nel pannello destro.
3. Selezionare con il mouse una sequenza univoca nel testo del comma.
4. Verificare che la sequenza sia riportata nel campo «Testo esatto da individuare».
5. Cambiare il tipo di bersaglio e verificare che le operazioni non compatibili siano disabilitate.

**PASS:** il bersaglio selezionato corrisponde alla porzione visibile e le operazioni contestuali sono coerenti.

## C. Operazioni singole
1. Su un comma, sostituire una parola univoca.
2. Registrare l'intervento.
3. Creare uno scenario e includere l'intervento.
4. Simulare.
5. Verificare il testo risultante e che il testo vigente non sia cambiato.
6. Ripetere con sostituzione integrale e con abrogazione su un comma di prova.

**PASS:** il registro conserva l'intervento; la simulazione modifica solo la copia derivata.

## D. Conflitto e scenari alternativi
1. Sullo stesso comma registrare abrogazione.
2. Sul medesimo comma registrare sostituzione integrale.
3. Verificare che entrambi restino nel registro.
4. Creare uno scenario che include solo l'abrogazione e simularlo.
5. Creare uno scenario che include solo la sostituzione e simularlo.
6. Creare uno scenario che include entrambi.

**PASS:** i due interventi sono conservati; gli scenari alternativi sono validi; quello congiunto è bloccato con motivazione.

## E. Documento modificativo
1. Registrare due interventi compatibili nello stesso articolo.
2. Simulare lo scenario.
3. Verificare se viene proposta un'aggregazione.
4. Accettare l'aggregazione e controllare il blocco unitario.
5. Rifiutarla e verificare il ripristino dei blocchi separati.
6. Esportare TXT e HTML.
7. Aprire i file con un editor esterno/browser.

**PASS:** ogni blocco mostra localizzazione e ID interventi; le formule candidate sono segnalate. La correttezza redazionale va comunque verificata rispetto al Catalogo e alla Circolare.

## F. Persistenza
1. Esportare il progetto `.nvw`.
2. Ricaricare la pagina e verificare il ripristino locale.
3. Importare il progetto esportato.
4. Verificare atto, registro, relazioni e scenari.

**PASS:** i dati del progetto sono ricostruiti senza perdita.

## Verbale
Per ogni anomalia annotare: data, browser/versione, ID prova, passaggi, atteso, osservato, screenshot, severità. Distinguere errori bloccanti, difetti funzionali e difetti redazionali.
