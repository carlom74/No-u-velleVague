import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { parseArticolo, contaNodi } from '../src/parser.ts';

const parse = (corpo: string, num = 'Art. 3-bis') => {
  const { document } = parseHTML(`<html><body><div class="bodyTesto"><h2 class="article-num-akn">${num}</h2>${corpo}</div></body></html>`);
  return parseArticolo(document.querySelector('.bodyTesto') as any);
};
const comma = (n: string, t: string) => `<div class="art-comma-div-akn"><span class="comma-num-akn">${n} </span><span class="art_text_in_comma">${t}<br></span></div>`;
const lettera = (t: string) => `<div class="pointedList-rest-akn">${t}<br></div>`;

test('numero articolo con suffisso', () => {
  assert.equal(parse(comma('1.', 'Testo.')).numero, '3-bis');
});

test('commi con suffissi in sequenza: nessun avviso', () => {
  const a = parse(comma('1.', 'a.') + comma('1-bis.', 'b.') + comma('1-ter.', 'c.') + comma('2.', 'd.'));
  assert.deepEqual(a.avvisi, []);
  assert.equal(a.commi.length, 4);
});

test('salto di numerazione segnalato', () => {
  const a = parse(comma('1.', 'a.') + comma('3.', 'b.'));
  assert.ok(a.avvisi.some(x => x.codice === 'sequenza-comma'));
});

test("alfabeto italiano: i) è seguita da l), poi z) e aa)", () => {
  const ls = 'abcdefghilmnopqrstuvz'.split('').map(l => lettera(`${l}) voce ${l};`)).join('') + lettera('aa) voce aa;') + lettera('bb) voce bb.');
  const a = parse(`<div class="art-comma-div-akn"><div><div class="pointedList-first-akn"><span class="comma-num-akn">1. </span>Si intende per:<br></div>${ls}</div></div>`);
  assert.deepEqual(a.avvisi, []);
  assert.equal(contaNodi(a.commi).lettere, 23);
});

test('lettera j) segnalata come fuori alfabeto', () => {
  const a = parse(`<div class="art-comma-div-akn"><div><div class="pointedList-first-akn"><span class="comma-num-akn">1. </span>X:<br></div>${lettera('a) x;')}${lettera('b) y;')}${lettera('j) z.')}</div></div>`);
  assert.ok(a.avvisi.some(x => x.codice === 'lettera-non-italiana' || x.codice === 'sequenza-lettera'));
});

test('comma inserito da modifica senza span del numero: ((2-bis. ...))', () => {
  const a = parse(comma('1.', 'Uno.') + `<div class="ins-akn"><div class="art-comma-div-akn"><span class="art_text_in_comma">((2-bis. Testo inserito))</span></div></div>`);
  assert.equal(a.commi.length, 2);
  assert.equal(a.commi[1].etichetta, '2-bis');
  assert.equal(a.commi[1].testo, 'Testo inserito');
  assert.equal(a.commi[1].inserito.length, 1);
  assert.ok(a.conservazione.ok);
});

test('riferimenti di nota ((12)) non entrano nel testo', () => {
  const a = parse(comma('1.', 'Testo <div class="ins-akn">((12))</div> finale.'));
  assert.equal(a.commi[0].testo, 'Testo finale.');
  assert.deepEqual(a.note, ['12']);
});

test('parti inserite in mezzo alla frase: testo in vigore, intervallo registrato', () => {
  const a = parse(comma('1.', 'Prima <div class="ins-akn">((nuove parole))</div> dopo.'));
  const n = a.commi[0];
  assert.equal(n.testo, 'Prima nuove parole dopo.');
  assert.deepEqual(n.inserito, [[6, 18]]);
});

test('((  e  )) in blocchi diversi (inserzione a cavallo di più capoversi)', () => {
  const a = parse(comma('1.', 'Inizio ((testo') + comma('2.', 'fine))'));
  assert.equal(a.commi[0].inserito.length, 1);
  assert.equal(a.commi[1].inserito.length, 1);
});

test('lettere dentro una citazione tra caporali NON sono struttura', () => {
  const a = parse(
    `<div class="art-comma-div-akn"><div><div class="pointedList-first-akn"><span class="comma-num-akn">1. </span>Al testo unico: <br></div>` +
    lettera('a) il comma 1 è sostituito dal seguente: «1. L\'imposta è pari a:') +
    lettera('a) fino a 28.000 euro, 23 per cento;') + lettera('b) oltre 28.000 euro, 35 per cento»;') +
    lettera('b) il comma 2 è abrogato.') + `</div></div>`);
  const c = contaNodi(a.commi);
  assert.equal(c.lettere, 2);
  assert.equal(c.righeCitate, 2);
  assert.deepEqual(a.avvisi, []);
});

test('novella con virgolette dritte che inizia a capo (leggi più vecchie)', () => {
  const a = parse(
    `<div class="art-comma-div-akn"><div><div class="pointedList-first-akn"><span class="comma-num-akn">1. </span>All\'articolo 12 sono apportate le modifiche:<br></div>` +
    lettera('a) la lettera b) è sostituita dalla seguente:') +
    lettera('"b) per ciascun figlio a carico;') + lettera('c) altro testo citato".') +
    lettera('b) il comma 2 è soppresso.') + `</div></div>`);
  assert.equal(contaNodi(a.commi).lettere, 2);
});

test('virgolette dritte annidate dentro una riga non rompono la struttura', () => {
  const a = parse(`<div class="art-comma-div-akn"><div><div class="pointedList-first-akn"><span class="comma-num-akn">1. </span>X:<br></div>${lettera('a) "foo": definizione con "citazione" e ""nidificata"";')}${lettera('b) bar.')}</div></div>`);
  assert.equal(contaNodi(a.commi).lettere, 2);
  assert.deepEqual(a.avvisi, []);
});

test('testo piatto con commi numerati e capoversi a capo', () => {
  const a = parse(`<span class="art-just-text-akn"><br> 1. Primo comma. <br> 2. Secondo comma: <br> a) prima; <br> b) seconda. <br></span>`);
  assert.equal(a.commi.length, 2);
  assert.equal(contaNodi(a.commi).lettere, 2);
  assert.ok(a.avvisi.some(x => x.codice === 'testo-piatto'));
  assert.ok(a.conservazione.ok);
});

test('testo piatto senza numeri: commi impliciti, segnalati', () => {
  const a = parse(`<span class="art-just-text-akn"><br> Primo. <br> Secondo. <br></span>`, 'Art. 1');
  assert.equal(a.commi.length, 2);
  assert.ok(a.commi.every(c => c.implicito));
  assert.ok(a.avvisi.some(x => x.codice === 'flat-comma-implicito'));
});

test('tabella ASCII: segnalata e non analizzata', () => {
  const a = parse(comma('1.', 'Testo.') + `<span class="table-akn"><br>|  Testo | Glosse |<br></span>`);
  assert.ok(a.avvisi.some(x => x.codice === 'tabella-non-analizzabile'));
});

test('rubrica con parentesi e blocchi AGGIORNAMENTO esclusi dal testo', () => {
  const a = parse(`<div class="article-heading-akn">(Principi generali)</div>` + comma('1.', 'Testo.') +
    `<div class="art_aggiornamento-akn"><div class="art_aggiornamento_title-akn">AGGIORNAMENTO (1)</div><div class="art_aggiornamento_testo-akn">nota lunga</div></div>`);
  assert.equal(a.rubrica, 'Principi generali');
  assert.equal(a.aggiornamenti.length, 1);
  assert.ok(a.conservazione.ok);
});
