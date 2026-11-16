import { CATALOGO_FETTA1, FUNZIONI_REGISTRATE } from './catalogo-fetta1.ts';
import type { AttoCanonico, NodoNormativo, TipoPartizione } from './model.ts';

export type Veste = 'novella'|'emendamento';
export type Operazione = 'sostituzione_testo'|'abrogazione'|'sostituzione_partizione'|'inserimento_partizione';
export interface Modifica { id:string; operazione:Operazione; nodoId:string; testoAtteso?:string; testoNuovo?:string; posizione?:'prima'|'dopo'; tipoNuovo?:TipoPartizione; etichettaNuova?:string; rubricaNuova?:string; testoPartizione?:string; }
export interface Esito { atto:AttoCanonico; documento:string; diff:string[]; modifica:Modifica; } 
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function trovaNodo(root:NodoNormativo,id:string):NodoNormativo|null { if(root.id===id)return root; for(const c of root.figli){const x=trovaNodo(c,id);if(x)return x;}return null; }
export function tuttiNodi(root:NodoNormativo):NodoNormativo[]{return [root,...root.figli.flatMap(tuttiNodi)];}
function parentOf(root:NodoNormativo,id:string):NodoNormativo|null {for(const c of root.figli){if(c.id===id)return root;const x=parentOf(c,id);if(x)return x;}return null;}
function label(n:NodoNormativo):string {return n.tipo==='articolo'?`articolo ${n.etichetta||''}`:n.tipo==='comma'?`comma ${n.etichetta||''}`:n.tipo==='lettera'?`lettera ${n.etichetta||''}`:n.tipo==='numero'?`numero ${n.etichetta||''}`:n.tipo;}
function cita(t:string):string{return `«${t}»`;}
export function calcolaEtichetta(parent:NodoNormativo,anchor:NodoNormativo,tipo:TipoPartizione,posizione:'prima'|'dopo'='dopo'):string {
 const siblings=parent.figli.filter(x=>x.tipo===tipo); const i=siblings.findIndex(x=>x.id===anchor.id); const prev=siblings[i-1]?.etichetta||''; const next=siblings[i+1]?.etichetta||''; const cur=anchor.etichetta||'';
 if(tipo==='articolo'||tipo==='comma'){
  if(posizione==='dopo'&&!next){const m=cur.match(/^(\d+)(?:-(bis|ter|quater|quinquies))?$/);if(m)return m[2]?`${m[1]}-${({bis:'ter',ter:'quater',quater:'quinquies'} as any)[m[2]]||'sexies'}`:`${m[1]}-bis`;}
  if(posizione==='prima'&&!prev&&tipo==='articolo')return '01';
  const a=Number.parseInt(cur,10),b=Number.parseInt(next,10);if(Number.isFinite(a)&&Number.isFinite(b)&&b===a+1)return `${a}-bis`;
  if(cur.includes('-bis')&&next&&Number.parseInt(next,10)===Number.parseInt(cur,10)+1)return cur.replace('-bis','-ter');
  if(next&&cur&&!cur.includes('-'))return `${cur}.1`;
 }
 if(tipo==='lettera'){const alphabet='abcdefghilm nopqrstuvz'.replace(/ /g,'');const idx=alphabet.indexOf(cur.toLowerCase());if(idx>=0&&posizione==='dopo')return idx<alphabet.length-1?alphabet[idx+1]:`${cur}${cur}`;}
 return '';
}
export function applicaModifica(source:AttoCanonico,m:Modifica,veste:Veste):Esito {
 const atto=structuredClone(source); const n=trovaNodo(atto.radice,m.nodoId); if(!n)throw new Error('Il bersaglio non è più presente nel documento. Ricaricare la fonte.');
 const before=JSON.stringify(source); let formula='';
 if(m.operazione==='sostituzione_testo'){
  const old=m.testoAtteso??'',neu=m.testoNuovo??''; if(!old)throw new Error('Selezionare il testo da sostituire.');
  const count=n.testo.split(old).length-1; if(count!==1)throw new Error(count===0?'Il testo selezionato non è più presente.':'Il testo ricorre più volte: selezionare una singola occorrenza.');
  n.testo=n.testo.replace(old,neu);
  formula=veste==='novella'?`Le parole: ${cita(old)} sono sostituite dalle seguenti: ${cita(neu)}.`:`Sostituire le parole: ${cita(old)} con le seguenti: ${cita(neu)}.`;
 } else if(m.operazione==='abrogazione'){
  const parent=parentOf(atto.radice,n.id); if(!parent)throw new Error('Non è possibile abrogare la radice del documento.');
  if(veste==='novella') formula=`${n.tipo==='articolo'?'L’':n.tipo==='comma'?'Il ':'La '}${label(n)} è abrogat${n.tipo==='articolo'||n.tipo==='comma'?'o':'a'}.`;
  else formula=`Sopprimere ${label(n)}.`;
  parent.figli=parent.figli.filter(x=>x.id!==n.id);
 } else if(m.operazione==='sostituzione_partizione'){
  if(!m.testoPartizione?.trim())throw new Error('Inserire il testo della nuova partizione.');
  n.testo=m.testoPartizione;
  if(veste==='novella') formula=`${n.tipo==='articolo'?'L’':n.tipo==='comma'?'Il ':'La '}${label(n)} è sostituit${n.tipo==='articolo'||n.tipo==='comma'?'o':'a'} dal seguente: «${n.testo}»`;
  else formula=`Sostituire ${label(n)} con il seguente: «${n.testo}»`;
 } else {
  const parent=parentOf(atto.radice,n.id); if(!parent)throw new Error('Selezionare una partizione che abbia una posizione di inserimento.');
  const tipo=m.tipoNuovo||n.tipo; const etichetta=m.etichettaNuova||calcolaEtichetta(parent,n,tipo,m.posizione||'dopo'); const id=`${n.id}-${tipo}-${(etichetta||'nuovo').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
  if(trovaNodo(atto.radice,id))throw new Error('Identificativo della nuova partizione già utilizzato.');
  const nuovo:NodoNormativo={...structuredClone(n),id,idInterno:`${n.idInterno}/sintetico-${m.id}`,tipo,etichetta:etichetta||null,rubrica:m.rubricaNuova||null,testo:m.testoPartizione||'',eId:null,identificativoSorgente:null,eIdDuplicato:false,origine:'sintetico',attributi:{},figli:[],contenutoNonInterpretato:null,citato:false,metadati:{inseritoDa:m.id}};
  const i=parent.figli.findIndex(x=>x.id===n.id);parent.figli.splice(i+(m.posizione==='dopo'?1:0),0,nuovo);
  formula=veste==='novella'?`Dopo ${label(n)}, è inserito il seguente: «${nuovo.testo}»`:`Dopo ${label(n)}, inserire il seguente: «${nuovo.testo}»`;
 }
 return {atto,documento:formula,diff:[`Operazione: ${m.operazione}`,`Bersaglio: ${m.nodoId}`,`Prima: ${before.length} caratteri serializzati`,`Dopo: ${JSON.stringify(atto).length} caratteri serializzati`],modifica:m};
}
export function testoNodo(n:NodoNormativo):string{return [n.rubrica?`(${n.rubrica})`:null,n.testo].filter(Boolean).join('\n');}
export function validaIdStabili(root:NodoNormativo):string[]{const ids=tuttiNodi(root).map(n=>n.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);}
