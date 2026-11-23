import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),app=readFileSync(new URL('../v07-app.js',import.meta.url),'utf8'),css=readFileSync(new URL('../v07.css',import.meta.url),'utf8');
test('home presenta importazione XML e campione locale',()=>{assert.match(html,/file-input/);assert.match(html,/load-sample/);});
test('editor contiene struttura, testo, bersaglio, registro e scenari',()=>{for(const id of ['tree','document-view','operation-form','registry','scenario-select','result-novella'])assert.match(html,new RegExp(`id="${id}"`));});
test('azioni essenziali sono cablate',()=>{for(const s of ['add-intervention','apply-scenario','export-project','download-text','download-html'])assert.ok(app.includes(s));});
test('nessun contenteditable o backend applicativo',()=>{assert.doesNotMatch(html+app,/contenteditable|fetch\(['"]\/(api|server)/i);});
test('asset e motore statici presenti',()=>{for(const f of ['public/js/model.js','public/js/novella-core.js','v07-app.js','v07.css','test/browser/novellazione-e2e.html'])assert.ok(existsSync(new URL('../'+f,import.meta.url)));});
test('stili responsive presenti',()=>assert.match(css,/@media\(max-width:760px\)/));
