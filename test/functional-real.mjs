import fs from 'node:fs';
import { applicaModifica, tuttiNodi, trovaNodo } from '../build/engine.js';
const source=JSON.parse(fs.readFileSync(new URL('./fixtures/AS1308-functional-model.json',import.meta.url),'utf8'));
const comma=trovaNodo(source.radice,'art1-com1');
const original=comma.testo;
const results=[];
function test(name,fn){try{results.push({name,status:'PASS',detail:fn()??''});}catch(e){results.push({name,status:'FAIL',detail:e.message});}}
test('AS1308 art. 1, comma 1: testo effettivo importato',()=>{if(!original.includes('rubrica del titolo'))throw Error('testo non corrispondente');return original;});
test('Sostituzione testuale singola',()=>{const x=applicaModifica(source,{id:'r1',operazione:'sostituzione_testo',nodoId:comma.id,testoAtteso:'animali',testoNuovo:'specie animali'},'emendamento');if(!trovaNodo(x.atto.radice,comma.id).testo.includes('specie animali'))throw Error('testo sostitutivo assente');if(comma.testo!==original)throw Error('fonte originale alterata');return x.documento;});
test('Sostituzione integrale del comma',()=>{const x=applicaModifica(source,{id:'r2',operazione:'sostituzione_partizione',nodoId:comma.id,testoPartizione:'La rubrica è sostituita dal testo seguente.'},'emendamento');if(trovaNodo(x.atto.radice,comma.id).testo!=='La rubrica è sostituita dal testo seguente.')throw Error('sostituzione non applicata');return x.documento;});
test('Abrogazione del comma',()=>{const x=applicaModifica(source,{id:'r3',operazione:'abrogazione',nodoId:comma.id},'emendamento');if(trovaNodo(x.atto.radice,comma.id))throw Error('comma ancora presente');if(!trovaNodo(source.radice,comma.id))throw Error('fonte alterata');return x.documento;});
test('Inserimento comma 1-bis',()=>{const x=applicaModifica(source,{id:'r4',operazione:'inserimento_partizione',nodoId:comma.id,posizione:'dopo',tipoNuovo:'comma',etichettaNuova:'1-bis',testoPartizione:'È aggiunto il seguente comma.'},'emendamento');const art=trovaNodo(x.atto.radice,'art1');if(!art.figli.some(n=>n.etichetta==='1-bis'))throw Error('comma 1-bis non presente');return x.documento;});
test('ID interni univoci dopo inserimento',()=>{const x=applicaModifica(source,{id:'r5',operazione:'inserimento_partizione',nodoId:comma.id,posizione:'dopo',tipoNuovo:'comma',etichettaNuova:'1-ter',testoPartizione:'Altro comma.'},'emendamento');const ids=tuttiNodi(x.atto.radice).map(n=>n.idInterno);if(new Set(ids).size!==ids.length)throw Error('ID duplicati');return `${ids.length} ID interni univoci`;});
console.log(JSON.stringify(results,null,2));console.log(`${results.filter(x=>x.status==='PASS').length} PASS · ${results.filter(x=>x.status==='FAIL').length} FAIL`);
