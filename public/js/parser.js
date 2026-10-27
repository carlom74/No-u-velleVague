// Parser dell'HTML di un articolo di Normattiva -> albero di partizioni.
// Indipendente dal DOM concreto: lavora su qualunque Element (browser o linkedom).
// Principi: (1) nessun errore silenzioso: ogni dubbio genera un Avviso;
//           (2) nessuna perdita di testo: la conservazione è verificata;
//           (3) le regole stanno in lessico.ts, non qui.
import { RE, CLASSI, LETTERE_ITA, LETTERE_STRANIERE, SUFFISSI } from "./lessico.js";
/**
 * Valutazione prudenziale per l'interfaccia: non certifica la correttezza giuridica.
 * 'candidato' significa soltanto che i controlli automatici disponibili non hanno
 * rilevato problemi; 'revisione' richiede conferma umana; 'bloccato' impedisce
 * operazioni automatiche finché il problema non è risolto.
 */
export function valutaAffidabilita(a) {
    const blocchi = [];
    const revisioni = [];
    if (!a.numero.trim() || a.avvisi.some(x => x.codice === 'numero-articolo'))
        blocchi.push('Numero dell’articolo non riconosciuto.');
    if (!a.conservazione.ok)
        blocchi.push('La conservazione del testo non è verificata.');
    if (a.tabella)
        blocchi.push('È presente una tabella non analizzabile in questa versione.');
    if (a.commi.length === 0)
        blocchi.push('Non è stata riconosciuta alcuna partizione normativa.');
    if (a.piatto)
        revisioni.push('Testo ricevuto senza struttura HTML: gerarchia ricostruita dal testo.');
    if (a.avvisi.some(x => x.codice === 'flat-comma-implicito'))
        revisioni.push('Sono stati inferiti uno o più commi non numerati.');
    if (a.avvisi.some(x => x.codice.startsWith('sequenza-') || x.codice === 'lettera-non-italiana'))
        revisioni.push('La sequenza delle etichette richiede verifica.');
    if (a.avvisi.some(x => x.codice.startsWith('virgolette-')))
        revisioni.push('Una citazione potrebbe non essere delimitata correttamente.');
    if (a.avvisi.some(x => x.codice === 'conteggio-commi'))
        revisioni.push('Il conteggio dei commi non coincide con quello ricavato dall’HTML.');
    if (a.avvisi.some(x => x.codice === 'numero-diretto-sotto-comma' || x.codice === 'lettera-senza-comma' || x.codice === 'numero-senza-comma'))
        revisioni.push('La gerarchia di una o più partizioni è stata inferita.');
    if (a.avvisi.some(x => !['numero-articolo', 'conservazione-testo', 'tabella-non-analizzabile'].includes(x.codice)) && revisioni.length === 0)
        revisioni.push('Il parser ha prodotto avvisi che richiedono una verifica.');
    if (a.avvisi.some(x => x.codice === 'testo-piatto') && !revisioni.some(x => x.startsWith('Testo ricevuto')))
        revisioni.push('Il testo è piatto e richiede verifica della gerarchia.');
    if (blocchi.length)
        return { stato: 'bloccato', titolo: 'Elaborazione automatica bloccata', motivi: [...blocchi, ...revisioni] };
    if (a.avvisi.length || revisioni.length)
        return { stato: 'revisione', titolo: 'Revisione umana richiesta', motivi: [...new Set([...revisioni, ...a.avvisi.map(x => x.messaggio)])] };
    return { stato: 'candidato', titolo: 'Candidato ai controlli preliminari', motivi: ['Conservazione verificata e nessun avviso automatico. È comunque necessaria la revisione editoriale.'] };
}
const èEl = (n) => n.nodeType === 1;
const classi = (e) => (e.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
const haClasse = (e, c) => classi(e).includes(c);
function estrai(radice) {
    const out = {
        numero: '', rubricaGrezza: '', toks: [], aggiornamenti: [], tabella: null,
        commiHtml: 0, piatto: false, fonte: '',
    };
    const salta = (cl) => cl.some(c => CLASSI.saltare.some(p => c.startsWith(p)));
    const testoDi = (n) => (n.textContent ?? '');
    function visita(n) {
        if (n.nodeType === 3) {
            const s = n.textContent ?? '';
            out.toks.push({ t: 'text', s });
            out.fonte += s;
            return;
        }
        if (!èEl(n))
            return;
        const tag = n.tagName.toLowerCase();
        const cl = classi(n);
        if (tag === 'br') {
            out.toks.push({ t: 'br' });
            return;
        }
        if (salta(cl))
            return;
        if (cl.includes(CLASSI.articoloNumero)) {
            out.numero = testoDi(n).trim();
            return;
        }
        if (cl.some(c => CLASSI.rubrica.includes(c))) {
            out.rubricaGrezza += ' ' + testoDi(n);
            return;
        }
        if (cl.includes(CLASSI.aggiornamento)) {
            out.aggiornamenti.push(testoDi(n).replace(/\s+/g, ' ').trim());
            return;
        }
        if (cl.includes(CLASSI.tabella)) {
            out.tabella = (out.tabella ?? '') + testoDi(n);
            return;
        }
        if (cl.includes(CLASSI.commaNumero)) {
            const s = testoDi(n);
            out.toks.push({ t: 'num', s });
            out.fonte += s;
            return;
        }
        let blocco = null;
        if (cl.includes(CLASSI.commaBlocco)) {
            blocco = 'comma';
            out.commiHtml++;
        }
        else if (cl.includes(CLASSI.elencoTesta))
            blocco = 'pfirst';
        else if (cl.includes(CLASSI.elencoResto))
            blocco = 'prest';
        const piatto = cl.includes(CLASSI.testoPiatto);
        if (blocco)
            out.toks.push({ t: 'open', k: blocco });
        if (piatto) {
            out.toks.push({ t: 'flat', on: true });
            out.piatto = true;
        }
        for (let i = 0; i < n.childNodes.length; i++)
            visita(n.childNodes[i]);
        if (piatto)
            out.toks.push({ t: 'flat', on: false });
        if (blocco)
            out.toks.push({ t: 'close' });
    }
    for (let i = 0; i < radice.childNodes.length; i++)
        visita(radice.childNodes[i]);
    return out;
}
function inRighe(toks) {
    const righe = [];
    const pila = [];
    let prossimoId = 1, piatto = 0, buf = '', numPendente;
    const flush = () => {
        const vuoto = buf.replace(/[\s\u00a0]+/g, '') === '';
        if (vuoto && numPendente === undefined) {
            buf = '';
            return;
        }
        const top = pila[pila.length - 1];
        if (top) {
            righe.push({ origine: top.k, id: top.id, cont: top.righe > 0, num: numPendente, grezzo: buf });
            top.righe++;
        }
        else {
            righe.push({ origine: 'flat', id: 0, cont: false, num: numPendente, grezzo: buf });
        }
        buf = '';
        numPendente = undefined;
    };
    for (const t of toks) {
        if (t.t === 'text')
            buf += t.s;
        else if (t.t === 'num') {
            flush();
            numPendente = t.s;
        }
        else if (t.t === 'br')
            flush();
        else if (t.t === 'open') {
            flush();
            pila.push({ k: t.k, id: prossimoId++, righe: 0 });
        }
        else if (t.t === 'close') {
            flush();
            pila.pop();
        }
        else if (t.t === 'flat') {
            flush();
            piatto += t.on ? 1 : -1;
        }
    }
    flush();
    return righe;
}
function pulisci(grezzo, st) {
    let s = grezzo.replace(/[\u00a0\s]+/g, ' ');
    const note = [];
    s = s.replace(RE.notaRiferimento, m => { note.push(m.replace(/\D/g, '')); return ''; });
    let out = '';
    const ins = [];
    if (st.aperto)
        st.inizio = 0;
    for (let i = 0; i < s.length; i++) {
        const c = s[i], d = s[i + 1];
        if (!st.aperto && c === '(' && d === '(') {
            st.aperto = true;
            st.inizio = out.length;
            st.profondita = 0;
            i++;
            continue;
        }
        if (st.aperto) {
            if (c === '(') {
                st.profondita++;
                out += c;
                continue;
            }
            if (c === ')') {
                if (st.profondita > 0) {
                    st.profondita--;
                    out += c;
                    continue;
                }
                if (d === ')') {
                    ins.push([st.inizio, out.length]);
                    st.aperto = false;
                    i++;
                    continue;
                }
            }
        }
        out += c;
    }
    if (st.aperto)
        ins.push([st.inizio, out.length]);
    // trim con correzione degli intervalli
    const lead = out.length - out.trimStart().length;
    const testo = out.trim();
    const corr = ins
        .map(([a, b]) => [Math.max(0, a - lead), Math.min(testo.length, b - lead)])
        .filter(([a, b]) => b > a);
    return { testo, ins: corr, note };
}
function chiaveNumerica(et) {
    const m = /^(\d+)(?:-([a-z]+))?$/i.exec(et);
    if (!m)
        return null;
    const suff = m[2] ? SUFFISSI.indexOf(m[2].toLowerCase()) + 1 : 0;
    if (m[2] && suff === 0)
        return null;
    return { n: Number(m[1]), suff };
}
function indiceLettera(et) {
    const m = /^([a-z])(\1)?(?:-([a-z]+))?$/i.exec(et);
    if (!m)
        return null;
    const l = m[1].toLowerCase();
    let base = LETTERE_ITA.indexOf(l);
    const straniera = base < 0 && LETTERE_STRANIERE.includes(l);
    if (base < 0)
        base = 100 + l.charCodeAt(0);
    const idx = m[2] ? LETTERE_ITA.length + base : base; // aa = 21, bb = 22, ...
    const suff = m[3] ? SUFFISSI.indexOf(m[3].toLowerCase()) + 1 : 0;
    return { idx, suff, straniera };
}
function seguitoNumerico(prec, att) {
    if (att.n === prec.n)
        return att.suff === prec.suff + 1;
    return att.n === prec.n + 1 && att.suff === 0;
}
function controllaSequenze(figli, tipo, dove, avvisi) {
    let prec = null;
    for (const f of figli) {
        if (f.tipo === tipo && f.etichetta) {
            if (tipo === 'lettera') {
                const a = indiceLettera(f.etichetta);
                if (a?.straniera)
                    avvisi.push({ codice: 'lettera-non-italiana', messaggio: `lettera "${f.etichetta}" fuori dall'alfabeto della tecnica legislativa`, dove });
                if (prec) {
                    const p = indiceLettera(prec.etichetta);
                    const ok = p && a && ((a.idx === p.idx && a.suff === p.suff + 1) || (a.idx === p.idx + 1 && a.suff === 0));
                    if (!ok)
                        avvisi.push({ codice: 'sequenza-lettera', messaggio: `dopo "${prec.etichetta})" segue "${f.etichetta})"`, dove });
                }
                else if (a && !(a.idx === 0 && a.suff === 0)) {
                    avvisi.push({ codice: 'sequenza-lettera', messaggio: `l'elenco inizia con "${f.etichetta})" invece di "a)"`, dove });
                }
            }
            else {
                const a = chiaveNumerica(f.etichetta);
                if (prec) {
                    const p = chiaveNumerica(prec.etichetta);
                    if (!(p && a && seguitoNumerico(p, a)))
                        avvisi.push({ codice: 'sequenza-' + tipo, messaggio: `dopo "${prec.etichetta}" segue "${f.etichetta}"`, dove });
                }
                else if (a && !(a.n === 1 && a.suff === 0)) {
                    avvisi.push({ codice: 'sequenza-' + tipo, messaggio: `la numerazione inizia con "${f.etichetta}" invece di "1"`, dove });
                }
            }
            prec = f;
        }
        // ricorsione
        const dove2 = `${dove}${f.etichetta ? (f.tipo === 'comma' ? ' c.' : ' ') + f.etichetta : ''}`;
        for (const t of ['lettera', 'numero']) {
            controllaSequenze(f.figli.filter(x => x.tipo === t), t, dove2, avvisi);
        }
    }
}
// ---------- 5. righe -> albero ----------
function costruisci(righe, numeroArt, avvisi) {
    const commi = [];
    const note = [];
    const st = { aperto: false, inizio: 0, profondita: 0 };
    let corrente = null; // ultimo nodo creato (per le continuazioni)
    let comma = null;
    let lettera = null;
    let testoPulito = '';
    // virgolette: il testo tra « » (o " ") su più righe è la parte CITATA di una modifica,
    // le sue "a) b) c)" appartengono all'atto modificato, non all'articolo che stiamo leggendo.
    let capDepth = 0, dppAperto = false;
    const nuovo = (tipo, marca, etichetta, testo, ins, origine, implicito = false) => ({ tipo, marca, etichetta, implicito, testo, inserito: ins, continuazioni: [], figli: [], origine });
    for (const r of righe) {
        const p = pulisci(r.grezzo, st);
        note.push(...p.note);
        let { testo, ins } = p;
        let numEsplicito = r.num ? r.num.replace(/[\s.]+$/g, '').trim() : undefined;
        testoPulito += (r.num ?? '') + p.testo;
        if (!testo && !numEsplicito)
            continue;
        // --- stato delle virgolette a inizio riga ---
        // « » : profondità. Virgolette dritte: valgono solo se la riga INIZIA con una virgoletta
        // (novelle delle leggi più vecchie); il conteggio dei " dentro una riga è inaffidabile
        // (virgolette annidate con lo stesso carattere, es. D.Lgs. 81/2008 art. 2 lett. ff).
        const chiudeDpp = (t) => /["”][\s.;,:)]*$/.test(t) && t.trim().length > 1;
        let dentroCitazione = capDepth > 0 || dppAperto;
        if (numEsplicito !== undefined && dentroCitazione) {
            avvisi.push({ codice: 'virgolette-non-chiuse', messaggio: `citazione non chiusa prima del comma ${numEsplicito}: stato azzerato`, dove: `art. ${numeroArt}` });
            capDepth = 0;
            dppAperto = false;
            dentroCitazione = false;
        }
        const apreDpp = !dentroCitazione && numEsplicito === undefined && /^["“]/.test(testo);
        const aggiornaVirgolette = (t) => {
            for (const ch of t) {
                if (ch === '«')
                    capDepth++;
                else if (ch === '»')
                    capDepth = Math.max(0, capDepth - 1);
            }
            if (dppAperto && chiudeDpp(t))
                dppAperto = false;
            else if (apreDpp && !chiudeDpp(t))
                dppAperto = true;
        };
        if ((dentroCitazione || apreDpp) && corrente) {
            corrente.continuazioni.push({ testo: p.testo, citato: true });
            aggiornaVirgolette(p.testo);
            continue;
        }
        aggiornaVirgolette(p.testo); // la riga che APRE una citazione è struttura, ma sposta lo stato
        const taglia = (len) => {
            testo = testo.slice(len);
            ins = ins.map(([a, b]) => [Math.max(0, a - len), b - len]).filter(([, b]) => b > 0);
        };
        const lead = (s) => s.length - s.trimStart().length;
        // --- classificazione ---
        let tipo = null, marca = '', etichetta = '';
        if (numEsplicito !== undefined) {
            tipo = 'comma';
            etichetta = numEsplicito;
            marca = etichetta + '.';
        }
        else {
            let m;
            const soloComma = r.origine === 'comma' || r.origine === 'pfirst' || r.origine === 'flat';
            if (r.cont && r.origine !== 'flat') {
                // capoverso successivo dentro lo stesso blocco: sempre continuazione, salvo etichetta esplicita
                if ((m = RE.lettera.exec(testo))) {
                    tipo = 'lettera';
                    etichetta = m[1];
                    marca = etichetta + ')';
                    taglia(m[0].length);
                }
                else if ((m = RE.numero.exec(testo))) {
                    tipo = 'numero';
                    etichetta = m[1];
                    marca = etichetta + ')';
                    taglia(m[0].length);
                }
            }
            else {
                if (soloComma && (m = RE.comma.exec(testo))) {
                    tipo = 'comma';
                    etichetta = m[1];
                    marca = etichetta + '.';
                    taglia(m[0].length);
                }
                else if ((m = RE.lettera.exec(testo))) {
                    tipo = 'lettera';
                    etichetta = m[1];
                    marca = etichetta + ')';
                    taglia(m[0].length);
                }
                else if ((m = RE.numero.exec(testo))) {
                    tipo = 'numero';
                    etichetta = m[1];
                    marca = etichetta + ')';
                    taglia(m[0].length);
                }
                else if ((m = RE.numeroOrdinale.exec(testo))) {
                    tipo = 'numero';
                    etichetta = m[1] + '°';
                    marca = etichetta;
                    taglia(m[0].length);
                }
            }
        }
        // dopo l'etichetta eventuale spazio residuo
        if (tipo && numEsplicito === undefined) {
            const l = lead(testo);
            if (l)
                taglia(l);
        }
        if (tipo && numEsplicito !== undefined) {
            const l = lead(testo);
            if (l)
                taglia(l);
        }
        // --- nessuna etichetta ---
        if (!tipo) {
            const dove = `art. ${numeroArt}`;
            if (r.cont || r.origine === 'prest') {
                if (corrente) {
                    corrente.continuazioni.push({ testo, citato: false });
                    continue;
                }
            }
            if (r.origine === 'flat' && corrente && corrente.tipo !== 'comma' && /^[a-zàèéìòù]/.test(testo)) {
                avvisi.push({ codice: 'flat-continuazione-presunta', messaggio: `riga senza etichetta unita a "${corrente.marca}": "${testo.slice(0, 50)}…"`, dove });
                corrente.continuazioni.push({ testo, citato: false });
                continue;
            }
            if (r.origine === 'flat' && (comma || corrente)) {
                avvisi.push({ codice: 'flat-comma-implicito', messaggio: `riga senza etichetta trattata come nuovo comma non numerato: "${testo.slice(0, 50)}…"`, dove });
            }
            tipo = 'comma';
            etichetta = '';
            marca = '';
        }
        const nodo = nuovo(tipo, marca, etichetta, testo, ins, r.origine, tipo === 'comma' && !etichetta);
        if (tipo === 'comma') {
            commi.push(nodo);
            comma = nodo;
            lettera = null;
        }
        else if (tipo === 'lettera') {
            if (!comma) {
                avvisi.push({ codice: 'lettera-senza-comma', messaggio: `lettera "${etichetta})" senza comma: creato comma implicito`, dove: `art. ${numeroArt}` });
                comma = nuovo('comma', '', '', '', [], 'sintetico', true);
                commi.push(comma);
            }
            comma.figli.push(nodo);
            lettera = nodo;
        }
        else {
            const genitore = lettera ?? comma;
            if (!genitore) {
                avvisi.push({ codice: 'numero-senza-comma', messaggio: `numero "${etichetta})" senza comma: creato comma implicito`, dove: `art. ${numeroArt}` });
                comma = nuovo('comma', '', '', '', [], 'sintetico', true);
                commi.push(comma);
                comma.figli.push(nodo);
            }
            else {
                if (!lettera)
                    avvisi.push({ codice: 'numero-diretto-sotto-comma', messaggio: `numero "${etichetta})" direttamente sotto il comma (nessuna lettera)`, dove: `art. ${numeroArt}` });
                genitore.figli.push(nodo);
            }
        }
        corrente = nodo;
    }
    if (capDepth > 0 || dppAperto)
        avvisi.push({ codice: 'virgolette-non-bilanciate', messaggio: 'a fine articolo resta una citazione aperta («» o "")', dove: `art. ${numeroArt}` });
    controllaSequenze(commi, 'comma', `art. ${numeroArt}`, avvisi);
    return { commi, note, testoPulito };
}
// ---------- 6. conservazione del testo ----------
const senzaSpazi = (s) => s.replace(/[\s\u00a0]+/g, '');
function ricostruisci(nodi) {
    return nodi.map(n => n.marca + n.testo + n.continuazioni.map(c => c.testo).join('') + ricostruisci(n.figli)).join('');
}
function toglimarcatori(s) {
    return s.replace(RE.notaRiferimento, '').replace(/\(\(/g, '').replace(/\)\)/g, '');
}
// ---------- API ----------
export function parseArticolo(radice) {
    const ex = estrai(radice);
    const avvisi = [];
    const mNum = RE.articolo.exec(ex.numero);
    const numero = mNum ? mNum[1].replace(/\s+/, '-').toLowerCase() : ex.numero;
    if (!mNum)
        avvisi.push({ codice: 'numero-articolo', messaggio: `intestazione non riconosciuta: "${ex.numero}"` });
    const righe = inRighe(ex.toks);
    const { commi, note, testoPulito } = costruisci(righe, numero, avvisi);
    // rubrica
    const st = { aperto: false, inizio: 0, profondita: 0 };
    let rubrica = pulisci(ex.rubricaGrezza, st).testo;
    rubrica = rubrica.replace(/^\(\s*/, '').replace(/\s*\)\.?$/, '').trim() || null;
    // conteggio commi rispetto all'HTML
    const commiDaBlocchi = commi.filter(c => c.origine === 'comma' || c.origine === 'pfirst').length;
    const attesi = ex.piatto && ex.commiHtml === 0 ? null : ex.commiHtml;
    if (attesi !== null && attesi !== commiDaBlocchi + commi.filter(c => c.origine === 'flat').length)
        avvisi.push({ codice: 'conteggio-commi', messaggio: `commi nell'HTML: ${attesi}; trovati: ${commi.length}`, dove: `art. ${numero}` });
    if (ex.tabella)
        avvisi.push({ codice: 'tabella-non-analizzabile', messaggio: 'il testo contiene una tabella ASCII: non modificabile in questa versione', dove: `art. ${numero}` });
    if (ex.piatto)
        avvisi.push({ codice: 'testo-piatto', messaggio: 'testo privo di struttura HTML: partizioni ricostruite dal solo testo (affidabilità minore)', dove: `art. ${numero}` });
    // conservazione: (A) DOM -> righe, (B) righe -> albero
    const fonte = senzaSpazi(toglimarcatori(ex.fonte));
    const righeTesto = senzaSpazi(testoPulito);
    const albero = senzaSpazi(ricostruisci(commi));
    let conservazione = { ok: true };
    const confronta = (a, b, nome) => {
        if (a === b)
            return null;
        let i = 0;
        while (i < a.length && a[i] === b[i])
            i++;
        return `${nome}: differenza alla posizione ${i}: «${a.slice(Math.max(0, i - 25), i + 25)}» ≠ «${b.slice(Math.max(0, i - 25), i + 25)}»`;
    };
    const dA = confronta(fonte, righeTesto, 'DOM→righe');
    const dB = confronta(righeTesto, albero, 'righe→albero');
    if (dA || dB) {
        conservazione = { ok: false, dettaglio: [dA, dB].filter(Boolean).join(' | ') };
        avvisi.push({ codice: 'conservazione-testo', messaggio: conservazione.dettaglio, dove: `art. ${numero}` });
    }
    return {
        numero, rubrica, commi, note, aggiornamenti: ex.aggiornamenti, tabella: ex.tabella,
        piatto: ex.piatto, attesiCommiHtml: attesi, avvisi, conservazione,
    };
}
export function scegliVersione(lista) {
    const nonRip = lista.filter(v => !/^\s*ripubblicazione/i.test(v.sottoTitolo ?? ''));
    if (nonRip.length >= 1) {
        const scelta = [...nonRip].sort((a, b) => b.articoloDataInizioVigenza.localeCompare(a.articoloDataInizioVigenza))[0];
        return { scelta, scartate: lista.filter(v => v !== scelta), motivo: 'esclusa la ripubblicazione con note' };
    }
    return { scelta: lista[0], scartate: lista.slice(1), motivo: 'nessuna regola applicabile: prima voce' };
}
export function contaNodi(commi) {
    let c = 0, l = 0, n = 0, ins = 0, cont = 0, citate = 0;
    const rec = (xs) => xs.forEach(x => {
        if (x.tipo === 'comma')
            c++;
        else if (x.tipo === 'lettera')
            l++;
        else
            n++;
        ins += x.inserito.length;
        cont += x.continuazioni.length;
        citate += x.continuazioni.filter(k => k.citato).length;
        rec(x.figli);
    });
    rec(commi);
    return { commi: c, lettere: l, numeri: n, inserzioni: ins, continuazioni: cont, righeCitate: citate };
}
