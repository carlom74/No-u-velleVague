/** Modello normativo canonico No(u)velle vague — prima implementazione.
 * Il modello conserva la fonte, distingue struttura/testo e non assume eId univoci.
 */
import type { Articolo, Nodo as NodoParser } from './parser.ts';

export type TipoPartizione = 'atto'|'libro'|'parte'|'titolo'|'capo'|'sezione'|'articolo'|'comma'|'capoverso'|'lettera'|'numero'|'allegato'|'tabella'|'nota'|'periodo'|'frase'|'parola'|'intervallo'|'elemento'|'testo-citato'|'sconosciuto';
export interface Diagnostica { codice:string; severita:'info'|'avviso'|'errore'; messaggio:string; percorso?:string }
export interface ProfiloStrutturale {
  id:string; commiNumerati:boolean; partizioni:TipoPartizione[]; alfabetoLettere:string[];
  numerazioneAggiuntiva:{ primaPartizione:string; dopoUltima:string; intermedia:string; riusoNumeriAbrogati:boolean };
  riferimenti:{ articoloConCommaUnicoNonNumerato:string };
}
export const PROFILO_STANDARD:ProfiloStrutturale = {
  id:'profilo-normativo-standard', commiNumerati:true,
  partizioni:['libro','parte','titolo','capo','sezione','articolo','comma','capoverso','lettera','numero'],
  alfabetoLettere:['a','b','c','d','e','f','g','h','i','l','m','n','o','p','q','r','s','t','u','v','z'],
  numerazioneAggiuntiva:{primaPartizione:'zero-prefisso',dopoUltima:'bis-ter',intermedia:'sottoarticolazione',riusoNumeriAbrogati:false},
  riferimenti:{articoloConCommaUnicoNonNumerato:'articolo'}
};
export interface NodoNormativo {
  id:string; tipo:TipoPartizione; etichetta:string|null; rubrica:string|null; testo:string;
  eId:string|null; identificativoSorgente:string|null; eIdDuplicato:boolean; origine:'akn'|'normattiva-html'|'ricostruito'|'sintetico';
  attributi:Record<string,string>; figli:NodoNormativo[]; contenutoNonInterpretato:string|null;
  citato:boolean; metadati:Record<string,unknown>;
}
export type TipoBersaglio = 'partizione'|'capoverso'|'periodo'|'parola'|'espressione'|'intervallo';
export interface AncoraTestuale {
  nodoId:string; testoAtteso:string; contestoPrecedente?:string; contestoSuccessivo?:string;
  occorrenza?:number; intervallo?:{inizio:number;fine:number};
}
export interface BersaglioNormativo {
  tipo:TipoBersaglio; nodoId:string; ancora?:AncoraTestuale; estremi?:{inizio:AncoraTestuale;fine:AncoraTestuale};
}
export type EsitoRisoluzioneAncora =
 | {stato:'risolta';nodoId:string;inizio:number;fine:number;occorrenza:number}
 | {stato:'assente';nodoId:string;messaggio:string}
 | {stato:'ambigua';nodoId:string;occorrenze:number[];messaggio:string}
 | {stato:'contesto-non-corrispondente';nodoId:string;occorrenze:number[];messaggio:string};
export interface AttoCanonico {
  schemaVersion:'1.0.0'; id:string; identita:{ urn:string|null; titolo:string|null; tipo:string|null; numero:string|null; data:string|null; versione:string|null };
  fonte:{ tipo:'normattiva-html'|'akn'; acquisitaIl:string; nomeFile?:string; xmlOriginale?:string };
  profilo:ProfiloStrutturale; radice:NodoNormativo; diagnostica:Diagnostica[];
  indiceEid:Record<string,string[]>; statistiche:{ nodi:number; testoCaratteri:number };
}
const slug=(s:string)=>s.normalize('NFKD').replace(/[^\w.-]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'nodo';
function node(id:string,tipo:TipoPartizione,etichetta:string|null,testo:string,origine:NodoNormativo['origine'],figli:NodoNormativo[]=[]):NodoNormativo {
 return {id,tipo,etichetta,rubrica:null,testo,eId:null,identificativoSorgente:null,eIdDuplicato:false,origine,attributi:{},figli,contenutoNonInterpretato:null,citato:false,metadati:{}};
}
function fromParser(n:NodoParser,path:string):NodoNormativo {
 const x=node(path,n.tipo,n.etichetta||null,n.testo,'normattiva-html',n.figli.map((c,i)=>fromParser(c,`${path}/${c.tipo}-${slug(c.etichetta||String(i+1))}`)));
 x.metadati={marca:n.marca,implicito:n.implicito,inserito:n.inserito,continuazioni:n.continuazioni,origineParser:n.origine}; return x;
}
export function daArticoliNormattiva(articoli:Articolo[], meta:Partial<AttoCanonico['identita']>={}, urn:string|null=null):AttoCanonico {
 const diagnostica:Diagnostica[]=[];
 const children=articoli.map((a,i)=>{
   const id=`atto/articolo-${slug(a.numero||String(i+1))}`;
   const art=node(id,'articolo',a.numero,a.commi.map(c=>`${c.marca}${c.testo}${c.continuazioni.map(k=>k.testo).join('')}`).join('\n'),'normattiva-html',a.commi.map((c,j)=>fromParser(c,`${id}/${c.tipo}-${slug(c.etichetta||String(j+1))}`)));
   art.rubrica=a.rubrica; art.metadati={note:a.note,aggiornamenti:a.aggiornamenti,piatto:a.piatto,tabella:a.tabella,conservazione:a.conservazione};
   a.avvisi.forEach(v=>diagnostica.push({codice:v.codice,severita:'avviso',messaggio:v.messaggio,percorso:id}));
   if(!a.conservazione.ok) diagnostica.push({codice:'conservazione-non-verificata',severita:'errore',messaggio:a.conservazione.dettaglio||'Conservazione non verificata',percorso:id});
   return art;
 });
 return finalize({schemaVersion:'1.0.0',id:`atto-${slug(urn||meta.urn||'normattiva')}`,identita:{urn,titolo:meta.titolo??null,tipo:meta.tipo??null,numero:meta.numero??null,data:meta.data??null,versione:meta.versione??null},fonte:{tipo:'normattiva-html',acquisitaIl:new Date().toISOString()},profilo:structuredClone(PROFILO_STANDARD),radice:node('atto','atto',null,'','normattiva-html',children),diagnostica,indiceEid:{},statistiche:{nodi:0,testoCaratteri:0}});
}
const MAP:Record<string,TipoPartizione>={
 akomaNtoso:'atto',act:'atto',bill:'atto',doc:'atto',body:'elemento',mainBody:'elemento',
 book:'libro',part:'parte',title:'titolo',chapter:'capo',section:'sezione',article:'articolo',
 paragraph:'comma',subparagraph:'capoverso',point:'lettera',indent:'numero',step:'numero',
 list:'elemento',intro:'elemento',content:'elemento',hcontainer:'elemento',
 annex:'allegato',table:'tabella',tr:'elemento',td:'elemento',th:'elemento',container:'elemento',attachments:'elemento',attachment:'elemento',
 // Elementi inline/presentazionali riconosciuti: non sono partizioni normative, ma non vanno segnalati come tag ignoti.
 p:'elemento',i:'elemento',b:'elemento',span:'elemento',eol:'elemento',img:'elemento',br:'elemento',u:'elemento',sup:'elemento',sub:'elemento',a:'elemento',del:'elemento',ins:'elemento',mark:'elemento',note:'nota',
 quotedText:'testo-citato',quotedStructure:'testo-citato',quotedBlock:'testo-citato',
};
const IGNORE=new Set(['num','heading','meta','authorialNote','remark','identification','lifecycle','workflow','references','proprietary','presentation']);
function localName(el:Element):string { return (el.localName||el.tagName).replace(/^.*:/,''); }
/** Usa childNodes anziché Element.children: è più robusto con XML namespaced e DOMParser. */
function elementChildren(el:Element):Element[] { return Array.from(el.childNodes).filter((n):n is Element=>n.nodeType===1) as Element[]; }
function directText(el:Element):string {
 // Estrae il testo appartenente al nodo, attraversando i contenitori AKN
 // (content, p, intro, list), ma senza inglobare il testo di partizioni
 // normative annidate: paragraph, point, article, ecc.
 const out:string[]=[];
 const structural=new Set(['book','part','title','chapter','section','article','paragraph','subparagraph','point','indent','step','annex','quotedText','quotedStructure','quotedBlock']);
 const excluded=new Set([...IGNORE,'num','heading','meta','authorialNote','remark']);
 const walk=(n:Node,isRoot=false)=>{
  for(const c of Array.from(n.childNodes)){
   if(c.nodeType===3){out.push(c.textContent||'');continue;}
   if(c.nodeType!==1)continue;
   const child=c as Element; const name=localName(child);
   if(excluded.has(name))continue;
   if(structural.has(name))continue;
   walk(child);
  }
 };
 walk(el,true);
 return out.join('').replace(/[\t\r\n ]+/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();
}
function xmlNode(el:Element,path:string,diagnostica:Diagnostica[],eidSeen:Map<string,string[]>,sourcePath:number[]=[]):NodoNormativo {
 const local=localName(el); const tipo=MAP[local]||'sconosciuto';
 const eid=el.getAttribute('eId'); const sourceId=el.getAttribute('id');
 const id=`${path}/${slug(sourceId||eid||`${local}-${Array.from(el.parentElement?.children||[]).indexOf(el)+1}`)}`;
 const childElements=elementChildren(el);
 const num=childElements.find(c=>localName(c)==='num');
 const heading=childElements.find(c=>localName(c)==='heading');
 // Le tabelle sono contenuto documentale: non devono essere perse per effetto
 // delle esclusioni applicate ad altri rami editoriali/presentazionali.
 // I contenitori presentation sono normalmente esclusi dall'albero normativo.
 // Se però racchiudono una tabella (come negli allegati comparativi), non vanno
 // scartati: si conserva il ramo necessario a raggiungere table/tr/td/th.
 const contieneTabella=(el:Element):boolean=>{
  if(['table','tr','td','th'].includes(localName(el))) return true;
  return elementChildren(el).some(contieneTabella);
 };
 const children=childElements.filter(c=>
  ((!IGNORE.has(localName(c))) || (localName(c)==='presentation' && contieneTabella(c)))
  && !['num','heading'].includes(localName(c))
 ).map((c,i)=>xmlNode(c,`${id}/${localName(c)}-${i+1}`,diagnostica,eidSeen,[...sourcePath,childElements.indexOf(c)]));
 const label=num?.textContent?.replace(/\s+/g,' ').trim()||null;
 const x=node(id,tipo,label,directText(el),'akn',children);
 x.eId=eid; x.identificativoSorgente=sourceId||null;
 x.rubrica=heading?.textContent?.replace(/\s+/g,' ').trim()||null;
 for(const a of Array.from(el.attributes))x.attributi[a.name]=a.value;
 if(eid){const paths=eidSeen.get(eid)||[];paths.push(id);eidSeen.set(eid,paths);}
 if(tipo==='sconosciuto'){
  x.contenutoNonInterpretato=new XMLSerializer().serializeToString(el);
  diagnostica.push({codice:'akn-elemento-non-mappato',severita:'info',messaggio:`Elemento AKN non mappato: ${local}; conservato integralmente.`,percorso:id});
 }
 x.metadati={...x.metadati,nomeElementoAkn:local,percorsoXml:sourcePath};
 if(local==='hcontainer'&&el.getAttribute('name'))x.metadati={...x.metadati,nomeContenitore:el.getAttribute('name')};
 // Conserva il nome locale AKN per consentire audit e interrogazioni strutturali
 // senza confondere righe/celle con partizioni normative.
 if(['table','tr','td','th'].includes(local))x.metadati={...x.metadati,nomeElementoAkn:local,ruoloTabellare:({table:'tabella',tr:'riga',td:'cella',th:'cella-intestazione'} as Record<string,string>)[local]};
 if(['p','i','b','span','eol','img','br','u','sup','sub','a','del','ins','mark'].includes(local))x.metadati={...x.metadati,categoriaAkn:'presentazione-inline'};
 if(local==='quotedText'||local==='quotedStructure'||local==='quotedBlock')x.citato=true;
 return x;
}
function finalize(a:AttoCanonico):AttoCanonico {
 const ids=new Map<string,string[]>(); let count=0,chars=0;
 const walk=(n:NodoNormativo)=>{count++;chars+=n.testo.length;if(n.eId){const xs=ids.get(n.eId)||[];xs.push(n.id);ids.set(n.eId,xs);} n.figli.forEach(walk);}; walk(a.radice);
 for(const [eid,paths] of ids) if(paths.length>1){paths.forEach(p=>{const n=findNode(a.radice,p);if(n)n.eIdDuplicato=true;});a.diagnostica.push({codice:'eid-duplicato',severita:'avviso',messaggio:`eId "${eid}" presente ${paths.length} volte: conservate tutte le occorrenze.`});}
 a.indiceEid=Object.fromEntries(ids);a.statistiche={nodi:count,testoCaratteri:chars};return a;
}
function findNode(n:NodoNormativo,id:string):NodoNormativo|null {if(n.id===id)return n;for(const c of n.figli){const x=findNode(c,id);if(x)return x;}return null;}
export function daAkn(xml:string,options:{urn?:string|null;nomeFile?:string|null}={}):AttoCanonico {
 const doc=new DOMParser().parseFromString(xml,'application/xml'); const pe=doc.querySelector('parsererror');
 if(pe) throw new Error(`AKN/XML non valido: ${pe.textContent||'errore di parsing'}`);
 const root=doc.documentElement; if(!root) throw new Error('Documento XML vuoto.');
 const diagnostica:Diagnostica[]=[]; const seen=new Map<string,string[]>();
 const radice=xmlNode(root,'atto',diagnostica,seen);
 const byLocal=(name:string)=>Array.from(doc.getElementsByTagName('*')).find(e=>localName(e as Element)===name) as Element|undefined;
 const meta=byLocal('FRBRthis')?.getAttribute('value')||null;
 const work=byLocal('FRBRdate')?.getAttribute('date')||null;
 const title=byLocal('docTitle')?.textContent?.trim()||byLocal('publication')?.textContent?.trim()||null;
 // Il workflow è metadato del ciclo di vita e non appartiene all'albero normativo.
 // Lo conserviamo in forma strutturata sul nodo radice, senza classificarlo come partizione.
 const workflow=byLocal('workflow');
 if(workflow){
  const events=Array.from(workflow.children).filter(e=>localName(e as Element)==='step').map(e=>{const x=e as Element;return {id:x.getAttribute('id'),date:x.getAttribute('date'),actor:x.getAttribute('actor'),outcome:x.getAttribute('outcome'),href:x.getAttribute('href')}});
  radice.metadati={...radice.metadati,workflow:{eventi:events}};
 }
 if(!root.querySelector('body'))diagnostica.push({codice:'akn-body-assente',severita:'avviso',messaggio:'Elemento body non individuato: struttura importata senza interpretazione specifica.'});
 if(seen.size===0)diagnostica.push({codice:'akn-eid-assenti',severita:'info',messaggio:'Il documento non usa eId: gli identificativi XML presenti (attributo id) sono conservati separatamente e usati per gli identificativi interni.'});
 return finalize({schemaVersion:'1.0.0',id:`atto-${slug(options.urn||meta||'akn-importato')}`,identita:{urn:options.urn||null,titolo:title,tipo:null,numero:null,data:work,versione:meta},fonte:{tipo:'akn',acquisitaIl:new Date().toISOString(),...(options.nomeFile?{nomeFile:options.nomeFile}:{}),xmlOriginale:xml},profilo:structuredClone(PROFILO_STANDARD),radice,diagnostica,indiceEid:{},statistiche:{nodi:0,testoCaratteri:0}});
}
export function validaModello(a:AttoCanonico):Diagnostica[] {
 const out=[...a.diagnostica];const ids=new Set<string>();
 const walk=(n:NodoNormativo)=>{if(ids.has(n.id))out.push({codice:'id-interno-duplicato',severita:'errore',messaggio:`Identificativo interno duplicato: ${n.id}`});ids.add(n.id);n.figli.forEach(walk);};walk(a.radice);return out;
}

/** Risolve un'ancora solo quando testo e contesto individuano una singola occorrenza. */
export function risolviAncora(radice:NodoNormativo,ancora:AncoraTestuale):EsitoRisoluzioneAncora {
 const n=findNode(radice,ancora.nodoId);
 if(!n)return {stato:'assente',nodoId:ancora.nodoId,messaggio:'Nodo dell’ancora non presente nel modello.'};
 const testo=n.testo,needle=ancora.testoAtteso;
 if(!needle)return {stato:'assente',nodoId:n.id,messaggio:'Il testo atteso dell’ancora è vuoto.'};
 const pos:number[]=[];let from=0;
 while(true){const i=testo.indexOf(needle,from);if(i<0)break;pos.push(i);from=i+Math.max(1,needle.length);}
 if(!pos.length)return {stato:'assente',nodoId:n.id,messaggio:'Il testo atteso non è presente nel nodo indicato.'};
 const contextual=pos.filter(i=>{
  const before=ancora.contestoPrecedente||'',after=ancora.contestoSuccessivo||'';
  return (!before||testo.slice(Math.max(0,i-before.length),i)===before)&&(!after||testo.slice(i+needle.length,i+needle.length+after.length)===after);
 });
 if((ancora.contestoPrecedente||ancora.contestoSuccessivo)&&!contextual.length)
  return {stato:'contesto-non-corrispondente',nodoId:n.id,occorrenze:pos,messaggio:'Il testo è presente, ma il contesto specificato non coincide.'};
 const candidates=(ancora.contestoPrecedente||ancora.contestoSuccessivo)?contextual:pos;
 if(ancora.occorrenza!==undefined){const i=candidates[ancora.occorrenza-1];if(i===undefined)return {stato:'assente',nodoId:n.id,messaggio:`L’occorrenza ${ancora.occorrenza} non esiste.`};return {stato:'risolta',nodoId:n.id,inizio:i,fine:i+needle.length,occorrenza:ancora.occorrenza};}
 if(candidates.length!==1)return {stato:'ambigua',nodoId:n.id,occorrenze:candidates,messaggio:`Trovate ${candidates.length} occorrenze: è necessaria una disambiguazione esplicita.`};
 return {stato:'risolta',nodoId:n.id,inizio:candidates[0],fine:candidates[0]+needle.length,occorrenza:1};
}
