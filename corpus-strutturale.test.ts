import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { parseArticolo, scegliVersione, contaNodi } from '../src/parser.ts';
import type { Articolo } from '../src/parser.ts';

const corpusPath = new URL('../public/campioni-normattiva.json', import.meta.url);
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8')) as Record<string, any>;

function articolo(urn: string): Articolo {
  const entry = corpus[urn];
  assert.ok(entry, `URN non presente nel corpus: ${urn}`);
  const d = entry.data;
  let html: string | null | undefined = d?.atto?.articoloHtml;
  if (!html && d?.lista?.length) html = scegliVersione(d.lista).scelta.articoloHtml;
  assert.ok(html, `HTML non disponibile per ${urn}: ${entry.message ?? entry.code ?? 'risposta vuota'}`);
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  const root = document.querySelector('.bodyTesto') ?? document.body;
  return parseArticolo(root as any);
}

const labels = (a: Articolo) => a.commi.map(n => n.etichetta || '(implicito)');
const childLabels = (a: Articolo, comma: string) => {
  const n = a.commi.find(c => c.etichetta === comma);
  assert.ok(n, `comma ${comma} non trovato`);
  return n.figli.map(f => `${f.tipo}:${f.etichetta}`);
};

test('golden: legge 241/1990, art. 1 — commi con suffissi e conservazione', () => {
  const a = articolo('urn:nir:stato:legge:1990-08-07;241~art1');
  assert.equal(a.numero, '1');
  assert.deepEqual(labels(a), ['1', '1-bis', '1-ter', '2', '2-bis']);
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('golden: TU enti locali, art. 50 — 14 commi e suffissi 7-bis/7-ter', () => {
  const a = articolo('urn:nir:stato:decreto.legislativo:2000-08-18;267~art50');
  assert.deepEqual(labels(a), ['1','2','3','4','5','6','7','7-bis','7-ter','8','9','10','11','12']);
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('golden: legge 190/2012, art. 1 — articolato esteso e lettere con suffissi', () => {
  const a = articolo('urn:nir:stato:legge:2012-11-06;190~art1');
  const c = contaNodi(a.commi);
  assert.equal(a.commi.length, 87);
  assert.equal(c.lettere, 110);
  assert.equal(c.numeri, 11);
  assert.deepEqual(childLabels(a, '2'), ['lettera:a','lettera:b','lettera:c','lettera:d','lettera:e','lettera:f','lettera:f-bis','lettera:g']);
  assert.ok(childLabels(a, '53').includes('lettera:i-bis'));
  assert.ok(childLabels(a, '53').includes('lettera:i-ter'));
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('golden: d.lgs. 165/2001, art. 35 — sequenza di commi aggiunti e lettere', () => {
  const a = articolo('urn:nir:stato:decreto.legislativo:2001-03-30;165~art35');
  assert.deepEqual(labels(a), ['1','2','3','3-bis','3-ter','3-quater','4','4-bis','4-ter','4-quater','4-quinquies','4-sexies','4-septies','4-octies','5','5-bis','5-ter','5-quater','5-quinquies','5-sexies','6','7']);
  assert.deepEqual(childLabels(a, '3'), ['lettera:a','lettera:b','lettera:c','lettera:d','lettera:e','lettera:e-bis','lettera:e-ter']);
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('golden: d.lgs. 81/2008, art. 2 — alfabeto italiano e lettere doppie', () => {
  const a = articolo('urn:nir:stato:decreto.legislativo:2008-04-09;81~art2');
  const expected = 'abcdefghilmnopqrstuvz'.split('').concat(['aa','bb','cc','dd','ee','ff']).map(x => `lettera:${x}`);
  assert.deepEqual(childLabels(a, '1'), expected);
  assert.equal(contaNodi(a.commi).lettere, 27);
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('controllo di sicurezza: Costituzione, art. 117 — testo piatto non è validato automaticamente', () => {
  const a = articolo('urn:nir:stato:costituzione:1947-12-27~art117');
  assert.equal(a.piatto, true);
  assert.ok(a.avvisi.some(x => x.codice === 'testo-piatto'));
  assert.ok(a.avvisi.some(x => x.codice === 'flat-comma-implicito'));
  assert.equal(a.conservazione.ok, true);
  // La conservazione del testo non è sufficiente a certificare la gerarchia.
  // Il caso deve quindi restare in revisione manuale, non essere un golden pass pulito.
  assert.notDeepEqual(a.avvisi, []);
});

test('golden: legge 207/2024, art. 1 — legge finanziaria con oltre cento commi', () => {
  const a = articolo('urn:nir:stato:legge:2024-12-30;207~art1');
  const c = contaNodi(a.commi);
  assert.equal(a.commi.length, 102);
  assert.ok(labels(a).includes('48-bis'));
  assert.ok(labels(a).includes('52-bis'));
  assert.equal(c.lettere, 50);
  assert.equal(c.numeri, 19);
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('golden: decreto-legge 18/2020, art. 1 — struttura semplice a tre commi', () => {
  const a = articolo('urn:nir:stato:decreto.legge:2020-03-17;18~art1');
  assert.deepEqual(labels(a), ['1','2','3']);
  assert.equal(a.conservazione.ok, true);
  assert.deepEqual(a.avvisi, []);
});

test('controllo di sicurezza: d.lgs. 36/2023, art. 10 — struttura piatta con commi riconosciuti', () => {
  const a = articolo('urn:nir:stato:decreto.legislativo:2023-03-31;36~art10');
  assert.equal(a.piatto, true);
  assert.deepEqual(labels(a), ['1','2','3']);
  assert.ok(a.avvisi.some(x => x.codice === 'testo-piatto'));
  assert.equal(a.conservazione.ok, true);
});

test('controllo di sicurezza: Costituzione, art. 1 — il testo piatto richiede revisione', () => {
  const a = articolo('urn:nir:stato:costituzione:1947-12-27~art1');
  assert.equal(a.piatto, true);
  assert.deepEqual(labels(a), ['(implicito)','(implicito)']);
  assert.ok(a.avvisi.some(x => x.codice === 'testo-piatto'));
  assert.ok(a.avvisi.some(x => x.codice === 'flat-comma-implicito'));
});
