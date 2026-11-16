import test from 'node:test';import assert from 'node:assert/strict';import { applicaModifica, calcolaEtichetta } from '../src/engine.ts';import type { AttoCanonico,NodoNormativo } from '../src/model.ts';
const n=(id:string,tipo:any,testo:string,etichetta:string|null=null,figli:NodoNormativo[]=[]):NodoNormativo=>({id,tipo,etichetta,rubrica:null,testo,eId:null,identificativoSorgente:null,eIdDuplicato:false,origine:'sintetico',attributi:{},figli,contenutoNonInterpretato:null,citato:false,metadati:{}});
const comma=n('art1-com1','comma','Il testo vigente è qui.','1');const art=n('art1','articolo','', '1',[comma]);const root=n('atto','atto','',null,[art]);const fixture:AttoCanonico={schemaVersion:'1.0.0',id:'test',identita:{urn:null,titolo:'Test',tipo:'legge',numero:'1',data:'2020-01-01',versione:'vigente'},fonte:{tipo:'akn',acquisitaIl:'2026-01-01'},profilo:{id:'test',commiNumerati:true,partizioni:['articolo','comma'],alfabetoLettere:[],numerazioneAggiuntiva:{primaPartizione:'zero-prefisso',dopoUltima:'bis-ter',intermedia:'sottoarticolazione',riusoNumeriAbrogati:false},riferimenti:{articoloConCommaUnicoNonNumerato:'articolo'}},radice:root,diagnostica:[],indiceEid:{},statistiche:{nodi:3,testoCaratteri:24}};
test('sostituzione parole, veste novella',()=>{const x=applicaModifica(fixture,{id:'1',operazione:'sostituzione_testo',nodoId:'art1-com1',testoAtteso:'vigente',testoNuovo:'aggiornato'},'novella');assert.match(x.documento,/sono sostituite/);assert.match(x.atto.radice.figli[0].figli[0].testo,/aggiornato/);assert.match(fixture.radice.figli[0].figli[0].testo,/vigente/);});
test('abrogazione partizione rimuove solo dalla copia',()=>{const x=applicaModifica(fixture,{id:'2',operazione:'abrogazione',nodoId:'art1-com1'},'novella');assert.equal(x.atto.radice.figli[0].figli.length,0);assert.equal(fixture.radice.figli[0].figli.length,1);});
test('sostituzione integrale partizione',()=>{const x=applicaModifica(fixture,{id:'3',operazione:'sostituzione_partizione',nodoId:'art1-com1',testoPartizione:'Nuovo contenuto.'},'emendamento');assert.equal(x.atto.radice.figli[0].figli[0].testo,'Nuovo contenuto.');assert.match(x.documento,/Sostituire il comma 1/);assert.match(x.documento,/Sostituire il comma 1 dell’articolo 1 con il seguente: «1\. Nuovo contenuto\.»/);});
test('inserimento partizione adiacente',()=>{const x=applicaModifica(fixture,{id:'4',operazione:'inserimento_partizione',nodoId:'art1-com1',posizione:'dopo',tipoNuovo:'comma',etichettaNuova:'1-bis',testoPartizione:'Comma aggiunto.'},'novella');assert.equal(x.atto.radice.figli[0].figli.length,2);assert.equal(x.atto.radice.figli[0].figli[1].etichetta,'1-bis');assert.match(x.documento,/Dopo il comma 1 è inserito il seguente: «1-bis\. Comma aggiunto\.»/);});
test('sostituzione ambigua non applicata',()=>{assert.throws(()=>applicaModifica(fixture,{id:'5',operazione:'sostituzione_testo',nodoId:'art1-com1',testoAtteso:'e',testoNuovo:'x'},'novella'),/ricorre più volte/);});

test('numerazione aggiuntiva dopo ultimo comma',()=>{comma.etichetta='4';const p=n('p','articolo','', '4',[comma]);assert.equal(calcolaEtichetta(p,comma,'comma','dopo'),'4-bis');});

test('formula emendativa per sostituzione di parole conforme al Catalogo E-05',()=>{const x=applicaModifica(fixture,{id:'6',operazione:'sostituzione_testo',nodoId:'art1-com1',testoAtteso:'vigente',testoNuovo:'nuovo'},'emendamento');assert.equal(x.documento,'Sostituire le parole «vigente» con le seguenti: «nuovo».');});
test('normalizzazione delle etichette AKN con prefisso e punto finale',()=>{const c=n('c','comma','Testo.','1.');const a=n('a','articolo','','Art. 1.',[c]);const r=n('r','atto','',null,[a]);const f={...fixture,radice:r};const x=applicaModifica(f,{id:'7',operazione:'sostituzione_partizione',nodoId:'c',testoPartizione:'Nuovo testo.'},'emendamento');assert.match(x.documento,/Sostituire il comma 1 dell’articolo 1 con il seguente: «1\. Nuovo testo\.»/);});

test('riferimento gerarchico completo per abrogazione di lettera annidata',()=>{
 const lettera=n('lett-a','lettera','Testo lettera.','a');
 const commaNested=n('comma-3','comma','', '3',[lettera]);
 const articoloNested=n('art-4','articolo','', '4',[commaNested]);
 const f={...fixture,radice:n('atto','atto','',null,[articoloNested])};
 const x=applicaModifica(f,{id:'nested',operazione:'abrogazione',nodoId:'lett-a'},'emendamento');
 assert.match(x.documento,/lettera a\) del comma 3 dell’articolo 4/);
});
test('sostituzione rubrica senza alterare il contenuto',()=>{
 const article=n('art-r','articolo','Contenuto invariato.','2');article.rubrica='Rubrica originaria';
 const f={...fixture,radice:n('atto','atto','',null,[article])};
 const x=applicaModifica(f,{id:'rub',operazione:'sostituzione_rubrica',nodoId:'art-r',rubricaNuova:'Rubrica aggiornata'},'emendamento');
 assert.equal(x.atto.radice.figli[0].rubrica,'Rubrica aggiornata');assert.equal(x.atto.radice.figli[0].testo,'Contenuto invariato.');assert.match(x.documento,/rubrica di articolo 2/);
});
test('soppressione rubrica lascia intatto il testo',()=>{
 const article=n('art-r2','articolo','Contenuto.','2');article.rubrica='Da eliminare';const f={...fixture,radice:n('atto','atto','',null,[article])};
 const x=applicaModifica(f,{id:'rub2',operazione:'soppressione_rubrica',nodoId:'art-r2'},'novella');assert.equal(x.atto.radice.figli[0].rubrica,null);assert.equal(x.atto.radice.figli[0].testo,'Contenuto.');
});
