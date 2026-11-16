import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html=await readFile(new URL('../fetta1.html',import.meta.url),'utf8');
const js=await readFile(new URL('../fetta1.js',import.meta.url),'utf8');
const engine=await readFile(new URL('../src/engine.ts',import.meta.url),'utf8');
test('interfaccia senza contenteditable: anteprima non modifica il modello',()=>{
 assert.doesNotMatch(html+js,/contenteditable\s*=\s*["']true/i);
 assert.match(js,/<pre id="node-preview"/);
});
test('selettore corpus e caricamento manuale restano disponibili',()=>{
 assert.match(html,/id="test-act"/);assert.match(html,/id="file"[^>]+\.akn,\.xml,\.zip/);
 for(const id of ['AS1308.akn','AS1786.akn','AS1786-A.akn','AS1924.akn'])assert.ok(html.includes(id));
});
test('operazioni rubrica e riferimento gerarchico implementati nel motore',()=>{
 assert.match(html,/sostituzione_rubrica/);assert.match(html,/soppressione_rubrica/);
 assert.match(engine,/percorsoBersaglio/);assert.match(engine,/riferimentoGerarchico/);
});
test('veste redazionale è derivata dalla fonte e non modificabile',()=>assert.match(html,/id="veste" disabled/));
