import {readFileSync,existsSync} from 'node:fs';
const required=['index.html','v07-app.js','v07.css','public/js/model.js','public/js/novella-core.js','test/browser/novellazione-e2e.html'];
for(const f of required)if(!existsSync(f))throw new Error(`File richiesto mancante: ${f}`);
const html=readFileSync('index.html','utf8');if(!html.includes('v07-app.js'))throw new Error('Entry point non collegato');
console.log(`Static build check PASS — ${required.length} file essenziali presenti; nessuna compilazione server richiesta.`);
