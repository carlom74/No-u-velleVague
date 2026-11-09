import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daArticoliNormattiva, PROFILO_STANDARD, validaModello, risolviAncora } from '../src/model.ts';
import type { Articolo } from '../src/parser.ts';
const articolo:Articolo={numero:'3-bis',rubrica:'Disposizioni',commi:[{tipo:'comma',marca:'1.',etichetta:'1',implicito:false,testo:'Testo normativo.',inserito:[],continuazioni:[],figli:[{tipo:'lettera',marca:'a)',etichetta:'a',implicito:false,testo:'una voce',inserito:[],continuazioni:[],figli:[],origine:'html'}],origine:'html'}],note:[],aggiornamenti:[],tabella:null,piatto:false,attesiCommiHtml:1,avvisi:[],conservazione:{ok:true}};
test('adattatore Normattiva produce il modello canonico e conserva gerarchia',()=>{
 const a=daArticoliNormattiva([articolo],{},'urn:nir:stato:legge:2020-01-01;1~art3-bis');
 assert.equal(a.radice.figli[0].tipo,'articolo'); assert.equal(a.radice.figli[0].rubrica,'Disposizioni');
 assert.equal(a.radice.figli[0].figli[0].figli[0].tipo,'lettera'); assert.equal(a.profilo.id,PROFILO_STANDARD.id);
 assert.equal(a.statistiche.nodi,4); assert.deepEqual(validaModello(a),[]);
});
test('il modello distingue identificativo interno e eId sorgente',()=>{
 const a=daArticoliNormattiva([articolo]); const n=a.radice.figli[0].figli[0];
 assert.ok(n.id); assert.equal(n.eId,null); assert.equal(n.origine,'normattiva-html');
});

test('ancora testuale: risolve univocamente e segnala le occorrenze ambigue',()=>{
 const a=daArticoliNormattiva([articolo]);
 const n=a.radice.figli[0].figli[0];
 assert.deepEqual(risolviAncora(a.radice,{nodoId:n.id,testoAtteso:'Testo normativo.'}),{stato:'risolta',nodoId:n.id,inizio:0,fine:16,occorrenza:1});
 const duplicato={...n,id:'duplicato',testo:'parola e parola'};
 const root={...a.radice,figli:[duplicato]};
 assert.equal(risolviAncora(root,{nodoId:'duplicato',testoAtteso:'parola'}).stato,'ambigua');
 assert.equal(risolviAncora(root,{nodoId:'duplicato',testoAtteso:'parola',occorrenza:2}).stato,'risolta');
});
