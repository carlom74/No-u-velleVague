import { parseArticolo, valutaAffidabilita, contaNodi, scegliVersione } from './public/js/parser.js';

const $ = (id) => document.getElementById(id);
const API = 'https://api.normattiva.it/t/normattiva.api/bff-opendata/v1/api/v1/atto/dettaglio-atto-urn';
const state = { articles: [], selected: null, rawResponses: [], busy: false };
const suffixes = ['bis','ter','quater','quinquies'];

function actDate() { return $('act-date').value; }
function actType() { return $('act-type').value; }
function actNumber() { return $('act-number').value.trim(); }
function baseUrn() {
  const type = actType();
  if (type === 'costituzione') return 'urn:nir:stato:costituzione:1947-12-27';
  return `urn:nir:stato:${type}:${actDate()};${actNumber()}`;
}
function articleUrn(n) { return `${baseUrn()}~art${String(n).replace(/\s+/g,'').replace(/-/g,'-')}`; }
function previewUrn() { $('urn-preview').textContent = baseUrn(); }
function updateDateControls() {
  const mode = $('version-mode').value;
  $('vigence-field').hidden = mode !== 'data';
  $('vigence-date').required = mode === 'data';
}
function status(kind, title, message) {
  const el = $('status'); el.className = `status ${kind || ''}`.trim();
  el.replaceChildren();
  const dot = document.createElement('span'); dot.className = 'status-dot';
  const wrap = document.createElement('div');
  const strong = document.createElement('strong'); strong.textContent = title;
  const p = document.createElement('p'); p.textContent = message;
  wrap.append(strong,p); el.append(dot,wrap);
}
function setBusy(busy) {
  state.busy = busy; $('download-btn').disabled = busy; $('load-sample').disabled = busy;
  $('download-btn').innerHTML = busy ? '<span class="button-icon">…</span> Acquisizione in corso' : '<span class="button-icon">↓</span> Acquisisci e parsa';
}
function escapeText(s) { return String(s ?? ''); }
function normalizeResponse(json) {
  if (!json || typeof json !== 'object') throw new Error('La risposta non è un oggetto JSON riconoscibile.');
  if (json.code && json.code !== 0 && json.code !== '0') {
    const msg = json.message || `Codice di errore API ${json.code}`;
    throw new Error(`${msg} (codice ${json.code})`);
  }
  const data = json.data ?? json;
  let atto = data.atto ?? data.dettaglioAtto ?? data;
  let list = data.lista;
  if (Array.isArray(list) && list.length) {
    const usable = list.filter(x => x && typeof x.articoloHtml === 'string' && x.articoloHtml.trim());
    if (usable.length) atto = scegliVersione(usable).scelta;
  }
  const html = atto.articoloHtml ?? atto.html ?? atto.testoHtml ?? data.articoloHtml;
  if (typeof html !== 'string' || !html.trim()) {
    const message = data.message || json.message || 'La risposta non contiene HTML dell’articolo.';
    throw new Error(message);
  }
  return { atto, html, data, raw: json };
}
async function apiRequest(urn) {
  const mode = $('version-mode').value;
  const body = { urn };
  if (mode === 'data') body.dataVigenza = $('vigence-date').value;
  else if (mode === 'originale') body.versione = 0;
  else body.dataVigenza = new Date().toISOString().slice(0,10);
  // In questa API il testo è richiesto tramite URN; la versione è indicata nel corpo della richiesta.
  const response = await fetch(API, {
    method: 'POST', mode: 'cors',
    headers: { 'accept': 'application/json, text/plain, */*', 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error(`Risposta non JSON (HTTP ${response.status}). Anteprima: ${text.slice(0,180)}`); }
  if (!response.ok) throw new Error(`Normattiva ha risposto HTTP ${response.status}: ${json.message || response.statusText}`);
  return normalizeResponse(json);
}
function parseHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Il parser lavora sul DOM restituito da Normattiva, senza ricostruire prima il testo.
  const root = doc.querySelector('.bodyTesto') || doc.body;
  const parsed = parseArticolo(root);
  const validation = valutaAffidabilita(parsed);
  return { parsed, validation, doc };
}
function countAll(nodes) {
  const counts = contaNodi(nodes);
  return counts;
}
function articleLabel(a) {
  return `Art. ${a.parsed.numero}${a.parsed.rubrica ? ` — ${a.parsed.rubrica}` : ''}`;
}
function renderResults() {
  $('results').hidden = false;
  const first = state.articles[0];
  if (!first) return;
  $('result-title').textContent = state.articles.length === 1 ? articleLabel(first) : `${state.articles.length} articoli acquisiti`;
  $('result-subtitle').textContent = `${first.meta.titolo || baseUrn()} · URN ${first.urn}`;
  const v = first.validation;
  $('validation-badge').className = `validation-badge ${v.stato}`;
  $('validation-badge').textContent = v.titolo;
  const totals = state.articles.reduce((acc, a) => {
    const c = countAll(a.parsed.commi);
    acc.commi += c.commi; acc.lettere += c.lettere; acc.numeri += c.numeri; acc.warnings += a.parsed.avvisi.length;
    return acc;
  }, { commi:0, lettere:0, numeri:0, warnings:0 });
  $('metrics').replaceChildren();
  [['Articoli',state.articles.length],['Commi',totals.commi],['Lettere / numeri',`${totals.lettere} / ${totals.numeri}`],['Avvisi parser',totals.warnings]].forEach(([label,value])=>{
    const card=document.createElement('div');card.className='metric';const l=document.createElement('span');l.textContent=label;const n=document.createElement('strong');n.textContent=value;card.append(l,n);$('metrics').append(card);
  });
  $('tree').replaceChildren();
  state.articles.forEach((a, index) => {
    const root = document.createElement('div'); root.className = 'tree-item';
    if (state.articles.length > 1) {
      const head = document.createElement('button'); head.className = 'tree-node'; head.innerHTML = `<span class="tree-label">Art. ${a.parsed.numero}</span><span class="tree-preview"></span>`;
      head.querySelector('.tree-preview').textContent = a.parsed.rubrica || '(senza rubrica)';
      head.addEventListener('click', () => selectNode({ articleIndex:index, node:null, type:'articolo', label:`Art. ${a.parsed.numero}`, text: articleText(a.parsed), path:`Art. ${a.parsed.numero}` })); root.append(head);
    }
    const parent = state.articles.length > 1 ? document.createElement('div') : root;
    if (state.articles.length > 1) { parent.className='tree-children'; root.append(parent); }
    a.parsed.commi.forEach((n) => renderNode(n, index, parent, `Art. ${a.parsed.numero}`));
    $('tree').append(root);
  });
  $('tree-count').textContent = `${state.articles.length} articolo/i`;
  $('raw-html').textContent = first.html;
  $('raw-meta').textContent = JSON.stringify({
    urn: first.urn,
    metadata: first.meta,
    validazione: first.validation,
    conservazione: first.parsed.conservazione,
    avvisi: first.parsed.avvisi,
    note: first.parsed.note,
    aggiornamenti: first.parsed.aggiornamenti,
    scope: $('scope').value,
    articoloTotale: state.articles.length
  }, null, 2);
  selectNode({ articleIndex:0, node:null, type:'articolo', label:`Art. ${first.parsed.numero}`, text: articleText(first.parsed), path:`Art. ${first.parsed.numero}` });
}
function articleText(parsed) {
  const lines=[];
  if (parsed.rubrica) lines.push(`(${parsed.rubrica})`);
  function rec(nodes, level=0) {
    for (const n of nodes) {
      lines.push(`${'  '.repeat(level)}${n.marca ? n.marca+' ' : ''}${n.testo}${(n.continuazioni||[]).map(c=>c.testo).join('')}`);
      rec(n.figli||[],level+1);
    }
  }
  rec(parsed.commi);
  return lines.join('\n\n');
}
function renderNode(node, articleIndex, container, parentPath) {
  const label = node.tipo === 'comma' ? `Comma ${node.etichetta || '(implicito)'}` : node.tipo === 'lettera' ? `Lettera ${node.etichetta}` : `Numero ${node.etichetta}`;
  const path = `${parentPath} › ${label}`;
  const item = document.createElement('div'); item.className='tree-item';
  const btn = document.createElement('button'); btn.className='tree-node'; btn.setAttribute('role','treeitem');
  const tag=document.createElement('span');tag.className='tree-label';tag.textContent=node.marca || label;
  const preview=document.createElement('span');preview.className='tree-preview';preview.textContent=(node.testo||'').trim() || '(testo non disponibile)';
  btn.append(tag,preview);
  btn.addEventListener('click',()=>selectNode({articleIndex,node,type:node.tipo,label,text:nodeText(node),path}));
  item.append(btn);
  if (node.figli?.length) { const children=document.createElement('div');children.className='tree-children';node.figli.forEach(child=>renderNode(child,articleIndex,children,path));item.append(children); }
  container.append(item);
}
function nodeText(node) { return `${node.marca ? node.marca+' ' : ''}${node.testo || ''}${(node.continuazioni||[]).map(c=>c.testo).join('')}`; }
function selectNode(sel) {
  state.selected = sel;
  document.querySelectorAll('.tree-node.selected').forEach(x=>x.classList.remove('selected'));
  const a=state.articles[sel.articleIndex];
  $('selected-type').textContent=sel.type;
  $('selected-detail').replaceChildren();
  const h=document.createElement('h4');h.textContent=sel.path;
  const meta=document.createElement('div');meta.className='detail-meta';meta.textContent=`Fonte: ${a.urn} · stato: ${a.validation.stato}`;
  $('selected-detail').append(h,meta);
  if (a.validation.stato !== 'candidato') {
    const warn=document.createElement('div');warn.className='detail-warning';warn.textContent=`${a.validation.titolo}. ${a.validation.motivi.join(' ')}`;$('selected-detail').append(warn);
  }
  const text=document.createElement('div');text.className='selected-text';text.textContent=sel.text;$('selected-detail').append(text);
}
function addArticle(html, meta, urn, raw) {
  const result=parseHtml(html);
  state.articles.push({ html, meta, urn, raw, parsed:result.parsed, validation:result.validation });
  state.rawResponses.push(raw);
}
async function loadSingle(urnOverride, sampleRecord=null) {
  const urn=urnOverride || articleUrn($('article-number').value || '1');
  if (sampleRecord) {
    const normalized=normalizeResponse(sampleRecord);
    addArticle(normalized.html,normalized.atto,urn,sampleRecord);
    return;
  }
  const result=await apiRequest(urn);
  addArticle(result.html,result.atto,urn,result.raw);
}
async function loadActBestEffort() {
  // First request is always the selected article; probing later articles is bounded and cancellable only by reloading.
  const firstNum = Number.parseInt($('article-number').value || '1',10);
  await loadSingle(articleUrn(String(firstNum)));
  const firstBase = Number.isFinite(firstNum) ? firstNum : 1;
  const maxArticles = 80;
  let misses=0, found=1;
  status('loading','Articolo iniziale acquisito',`Ricognizione sperimentale degli articoli successivi (massimo ${maxArticles} tentativi). I suffissi e le strutture di titolo/capo non sono ancora indicizzati in modo completo.`);
  for (let n=firstBase+1; n<=maxArticles; n++) {
    try {
      const result=await apiRequest(articleUrn(String(n)));
      addArticle(result.html,result.atto,articleUrn(String(n)),result.raw);found++;misses=0;
      if (found % 5 === 0) status('loading','Ricognizione dell’atto',`Acquisiti ${found} articoli. Verifica in corso fino all’individuazione della fine dell’atto.`);
    } catch (err) {
      misses++;
      // The API may signal a missing article as an application-level response or HTTP error.
      if (misses >= 4 && found > 0) break;
    }
  }
  if (state.articles.length===0) throw new Error('Nessun articolo recuperato.');
}
async function submit(event) {
  event?.preventDefault();
  if (state.busy) return;
  if (!actDate() && actType() !== 'costituzione') { status('error','Data mancante','Inserisci la data dell’atto.'); return; }
  if (!actNumber() && actType() !== 'costituzione') { status('error','Numero mancante','Inserisci il numero dell’atto.'); return; }
  if ($('version-mode').value==='data' && !$('vigence-date').value) { status('error','Data di vigenza mancante','Indica la data alla quale vuoi ricostruire il testo vigente.'); return; }
  state.articles=[];state.rawResponses=[];$('results').hidden=true;setBusy(true);
  try {
    if ($('scope').value==='act') {
      status('loading','Acquisizione dell’atto','Avvio della ricognizione sperimentale. L’API fornisce contenuti per articolo; la ricognizione può richiedere tempo e non garantisce di rilevare tutti i suffissi o i titoli/capi.');
      await loadActBestEffort();
      renderResults();
      status('success','Acquisizione terminata',`Sono stati acquisiti ${state.articles.length} articoli. La ricognizione è best effort: controlla l’indice prima di usare il testo per una novella.`);
    } else {
      status('loading','Contatto Normattiva','Richiesta dell’articolo, parsing HTML e costruzione dell’albero DOM.');
      await loadSingle();renderResults();
      status('success','Articolo acquisito e parsato','L’articolo è disponibile nell’albero DOM. Se sono presenti avvisi, verifica la struttura prima di qualsiasi modifica.');
    }
  } catch (error) {
    console.error(error);
    const message = error?.message || String(error);
    status('error','Acquisizione non riuscita',`${message}. Se il problema è CORS o rete, prova l’esempio locale incluso oppure usa il deploy statico tramite un server HTTP/HTTPS.`);
  } finally { setBusy(false); }
}
async function loadLocalSample() {
  if (state.busy) return;
  setBusy(true);state.articles=[];state.rawResponses=[];$('results').hidden=true;
  try {
    const samples=await fetch('./public/campioni-normattiva.json').then(r=>{if(!r.ok)throw new Error('Campione locale non trovato.');return r.json();});
    const key='urn:nir:stato:legge:1990-08-07;241~art1';
    const sample=samples[key]; if(!sample) throw new Error('Articolo di esempio assente dal corpus.');
    $('act-type').value='legge';$('act-date').value='1990-08-07';$('act-number').value='241';$('article-number').value='1';$('scope').value='article';previewUrn();
    await loadSingle(key,sample);renderResults();
    status('success','Esempio locale caricato','È stato usato il campione incluso nel progetto; nessuna chiamata a Normattiva è stata effettuata.');
  } catch(e) { status('error','Impossibile caricare l’esempio',e.message); }
  finally {setBusy(false);}
}
$('act-form').addEventListener('submit',submit);
['act-type','act-date','act-number'].forEach(id=>$(id).addEventListener('input',previewUrn));
$('version-mode').addEventListener('change',updateDateControls);
$('copy-urn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(baseUrn());status('success','URN copiata',baseUrn());}catch{status('','URN pronta',baseUrn());}});
$('load-sample').addEventListener('click',loadLocalSample);
updateDateControls();previewUrn();
