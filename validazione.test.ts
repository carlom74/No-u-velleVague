import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { parseArticolo, valutaAffidabilita } from '../src/parser.ts';

function parse(body: string, num = 'Art. 3') {
  const { document } = parseHTML(`<html><body><div class="bodyTesto"><h2 class="article-num-akn">${num}</h2>${body}</div></body></html>`);
  return parseArticolo(document.querySelector('.bodyTesto') as any);
}
const comma = (n: string, t: string) => `<div class="art-comma-div-akn"><span class="comma-num-akn">${n} </span><span class="art_text_in_comma">${t}<br></span></div>`;

test('validazione: articolo strutturato e senza avvisi è candidato, non certificato', () => {
  const a = parse(comma('1.', 'Testo normativo.') + comma('2.', 'Altro testo.'));
  const esito = valutaAffidabilita(a);
  assert.equal(esito.stato, 'candidato');
  assert.match(esito.titolo, /Candidato/);
  assert.ok(esito.motivi.some(x => x.includes('revisione editoriale')));
});

test('validazione: testo piatto richiede revisione', () => {
  const a = parse('<span class="art-just-text-akn"><br> 1. Primo comma. <br> 2. Secondo comma. <br></span>');
  assert.equal(valutaAffidabilita(a).stato, 'revisione');
});

test('validazione: sequenza irregolare richiede revisione', () => {
  const a = parse(comma('1.', 'Testo.') + comma('3.', 'Testo successivo.'));
  assert.equal(valutaAffidabilita(a).stato, 'revisione');
});

test('validazione: conservazione fallita blocca l’elaborazione', () => {
  const a = parse(comma('1.', 'Testo.'));
  a.conservazione = { ok: false, dettaglio: 'test deliberato' };
  const esito = valutaAffidabilita(a);
  assert.equal(esito.stato, 'bloccato');
  assert.ok(esito.motivi.some(x => x.includes('conservazione')));
});

test('validazione: tabella non analizzabile blocca l’elaborazione', () => {
  const a = parse(comma('1.', 'Testo.') + '<div class="table-akn">A | B</div>');
  assert.equal(valutaAffidabilita(a).stato, 'bloccato');
});
