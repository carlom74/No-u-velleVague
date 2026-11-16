import { CATALOGO_FETTA1, FUNZIONI_REGISTRATE } from './catalogo-fetta1.ts';
import type { AttoCanonico, NodoNormativo, TipoPartizione } from './model.ts';

export type Veste = 'novella'|'emendamento';
export type Operazione = 'sostituzione_testo'|'abrogazione'|'sostituzione_partizione'|'inserimento_partizione'|'sostituzione_rubrica'|'soppressione_rubrica';
export interface Modifica { id:string; operazione:Operazione; nodoId:string; testoAtteso?:string; testoNuovo?:string; posizione?:'prima'|'dopo'; tipoNuovo?:TipoPartizione; etichettaNuova?:string; rubricaNuova?:string; testoPartizione?:string; }
export interface Esito { atto:AttoCanonico; documento:string; diff:string[]; modifica:Modifica; } 
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
export function trovaNodo(root:NodoNormativo,id:string):NodoNormativo|null { if(root.id===id)return root; for(const c of root.figli){const x=trovaNodo(c,id);if(x)return x;}return null; }
export function tuttiNodi(root:NodoNormativo):NodoNormativo[]{return [root,...root.figli.flatMap(tuttiNodi)];}
function parentOf(root:NodoNormativo,id:string):NodoNormativo|null {for(const c of root.figli){if(c.id===id)return root;const x=parentOf(c,id);if(x)return x;}return null;}
function etichettaPulita(n:NodoNormativo):string {
 let e=(n.etichetta||'').trim();
 if(n.tipo==='articolo')e=e.replace(/^art(?:icolo)?\.?\s*/i,'').replace(/[.\s]+$/,'');
 else if(n.tipo==='comma')e=e.replace(/[.\s]+$/,'');
 else if(n.tipo==='lettera'||n.tipo==='numero')e=e.replace(/[.)\s]+$/,'');
 return e;
}
function label(n:NodoNormativo):string {const e=etichettaPulita(n);return n.tipo==='articolo'?`articolo ${e}`:n.tipo==='comma'?`comma ${e}`:n.tipo==='lettera'?`lettera ${e})`:n.tipo==='numero'?`numero ${e})`:n.tipo;}
function labelConArticolo(n:NodoNormativo):string {
 if(n.tipo==='articolo')return `l'${label(n)}`;
 if(n.tipo==='comma')return `il ${label(n)}`;
 if(n.tipo==='lettera')return `la ${label(n)}`;
 if(n.tipo==='numero')return `il ${label(n)}`;
 return `la partizione ${n.etichetta||''}`;
}
function maiuscola(s:string):string{return s.charAt(0).toUpperCase()+s.slice(1);}
function genere(n:NodoNormativo):'m'|'f'{return n.tipo==='lettera'?'f':'m';}
function participio(n:NodoNormativo,verb:'sostituito'|'abrogato'):string{return genere(n)==='f'?`${verb.slice(0,-1)}a`:verb;}
function testoPartizione(n:NodoNormativo,testo:string):string {
 const t=testo.trim(); const e=etichettaPulita(n);
 if(!e)return t;
 const prefix=n.tipo==='articolo'?`Art. ${e}.`:n.tipo==='comma'?`${e}.`:n.tipo==='lettera'?`${e})`:n.tipo==='numero'?`${e})`:'';
 if(!prefix||new RegExp(`^${esc(prefix)}(?:\\s|$)`).test(t))return t;
 return `${prefix} ${t}`;
}
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
/** Percorso gerarchico calcolato dall’albero canonico: non viene duplicato nel comando. */
export function percorsoBersaglio(root:NodoNormativo,id:string):NodoNormativo[] {
 const path:NodoNormativo[]=[]; const visit=(n:NodoNormativo):boolean=>{path.push(n);if(n.id===id)return true;for(const c of n.figli)if(visit(c))return true;path.pop();return false;};
 return visit(root)?path:[];
}
function riferimentoGerarchico(root:NodoNormativo,n:NodoNormativo):string {
 const path=percorsoBersaglio(root,n.id).filter(x=>['articolo','comma','capoverso','lettera','numero'].includes(x.tipo));
 return path.map(x=>label(x)).join(', ') || label(n);
}
function formulaBersaglio(root:NodoNormativo,n:NodoNormativo,veste:Veste,azione:'abrogazione'|'sostituzione'):string {
 const path=percorsoBersaglio(root,n.id).filter(x=>['articolo','comma','capoverso','lettera','numero'].includes(x.tipo));
 if(path.length<=1)return labelConArticolo(n);
 const target=path[path.length-1]; const ancestors=path.slice(0,-1).reverse();
 const prep=(x:NodoNormativo)=>x.tipo==='articolo'?`dell’${label(x)}`:x.tipo==='comma'?`del ${label(x)}`:x.tipo==='lettera'?`della ${label(x)}`:x.tipo==='numero'?`del ${label(x)}`:`del ${label(x)}`;
 return `${labelConArticolo(target)} ${ancestors.map(prep).join(' ')}`;
}
export function applicaModifica(source:AttoCanonico,m:Modifica,veste:Veste):Esito {
 const atto=structuredClone(source); const n=trovaNodo(atto.radice,m.nodoId); if(!n)throw new Error('Il bersaglio non è più presente nel documento. Ricaricare la fonte.');
 const before=JSON.stringify(source); let formula='';
 if(m.operazione==='sostituzione_testo'){
  const old=m.testoAtteso??'',neu=m.testoNuovo??''; if(!old)throw new Error('Selezionare il testo da sostituire.');
  const count=n.testo.split(old).length-1; if(count!==1)throw new Error(count===0?'Il testo selezionato non è più presente.':'Il testo ricorre più volte: selezionare una singola occorrenza.');
  n.testo=n.testo.replace(old,neu);
  formula=veste==='novella'?`Le parole: ${cita(old)} sono sostituite dalle seguenti: ${cita(neu)}.`:`Sostituire le parole ${cita(old)} con le seguenti: ${cita(neu)}.`;
 } else if(m.operazione==='abrogazione'){
  const parent=parentOf(atto.radice,n.id); if(!parent)throw new Error('Non è possibile abrogare la radice del documento.');
  const ref=formulaBersaglio(atto.radice,n,veste,'abrogazione');
  if(veste==='novella') formula=`${maiuscola(ref)} è ${participio(n,'abrogato')}.`;
  else formula=`Sopprimere ${ref}.`;
  parent.figli=parent.figli.filter(x=>x.id!==n.id);
 } else if(m.operazione==='sostituzione_partizione'){
  if(!m.testoPartizione?.trim())throw new Error('Inserire il testo della nuova partizione.');
  n.testo=m.testoPartizione;
  const testoNuovo=testoPartizione(n,m.testoPartizione);
  const ref=formulaBersaglio(atto.radice,n,veste,'sostituzione');
  if(veste==='novella') formula=`${maiuscola(ref)} è ${participio(n,'sostituito')} dal seguente: ${cita(testoNuovo)}`;
  else formula=`Sostituire ${ref} con il seguente: ${cita(testoNuovo)}`;
 } else if(m.operazione==='sostituzione_rubrica') {
  if(!n.rubrica) throw new Error('Il bersaglio non possiede una rubrica.');
  const nuova=(m.rubricaNuova??'').trim(); if(!nuova) throw new Error('Inserire la nuova rubrica.');
  const vecchia=n.rubrica; n.rubrica=nuova;
  formula=veste==='novella'?`La rubrica di ${riferimentoGerarchico(atto.radice,n)} è sostituita dalla seguente: ${cita(nuova)}.`:`Sostituire la rubrica di ${riferimentoGerarchico(atto.radice,n)} con la seguente: ${cita(nuova)}.`;
 } else if(m.operazione==='soppressione_rubrica') {
  if(!n.rubrica) throw new Error('Il bersaglio non possiede una rubrica.');
  n.rubrica=null;
  formula=veste==='novella'?`La rubrica di ${riferimentoGerarchico(atto.radice,n)} è soppressa.`:`Sopprimere la rubrica di ${riferimentoGerarchico(atto.radice,n)}.`;
 } else {
  const parent=parentOf(atto.radice,n.id); if(!parent)throw new Error('Selezionare una partizione che abbia una posizione di inserimento.');
  const tipo=m.tipoNuovo||n.tipo; const etichetta=m.etichettaNuova||calcolaEtichetta(parent,n,tipo,m.posizione||'dopo'); const id=`${n.id}-${tipo}-${(etichetta||'nuovo').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;
  if(trovaNodo(atto.radice,id))throw new Error('Identificativo della nuova partizione già utilizzato.');
  const nuovo:NodoNormativo={...structuredClone(n),id,idInterno:`${n.idInterno}/sintetico-${m.id}`,tipo,etichetta:etichetta||null,rubrica:m.rubricaNuova||null,testo:m.testoPartizione||'',eId:null,identificativoSorgente:null,eIdDuplicato:false,origine:'sintetico',attributi:{},figli:[],contenutoNonInterpretato:null,citato:false,metadati:{inseritoDa:m.id}};
  const i=parent.figli.findIndex(x=>x.id===n.id);parent.figli.splice(i+(m.posizione==='dopo'?1:0),0,nuovo);
  const riferimento=labelConArticolo(n);
  const testoNuovo=testoPartizione(nuovo,m.testoPartizione||'');
  formula=veste==='novella'?`Dopo ${riferimento} è inserito il seguente: ${cita(testoNuovo)}`:`Dopo ${riferimento} inserire il seguente: ${cita(testoNuovo)}`;
 }
 return {atto,documento:formula,diff:[`Operazione: ${m.operazione}`,`Bersaglio: ${m.nodoId}`,`Prima: ${before.length} caratteri serializzati`,`Dopo: ${JSON.stringify(atto).length} caratteri serializzati`],modifica:m};
}
export function testoNodo(n:NodoNormativo):string{return [n.rubrica?`(${n.rubrica})`:null,n.testo].filter(Boolean).join('\n');}
export function validaIdStabili(root:NodoNormativo):string[]{const ids=tuttiNodi(root).map(n=>n.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);}
