const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function trovaNodo(root, id) { if (root.id === id)
    return root; for (const c of root.figli) {
    const x = trovaNodo(c, id);
    if (x)
        return x;
} return null; }
export function tuttiNodi(root) { return [root, ...root.figli.flatMap(tuttiNodi)]; }
function parentOf(root, id) { for (const c of root.figli) {
    if (c.id === id)
        return root;
    const x = parentOf(c, id);
    if (x)
        return x;
} return null; }
function etichettaPulita(n) {
    let e = (n.etichetta || '').trim();
    if (n.tipo === 'articolo')
        e = e.replace(/^art(?:icolo)?\.?\s*/i, '').replace(/[.\s]+$/, '');
    else if (n.tipo === 'comma')
        e = e.replace(/[.\s]+$/, '');
    else if (n.tipo === 'lettera' || n.tipo === 'numero')
        e = e.replace(/[.)\s]+$/, '');
    return e;
}
function label(n) { const e = etichettaPulita(n); return n.tipo === 'articolo' ? `articolo ${e}` : n.tipo === 'comma' ? `comma ${e}` : n.tipo === 'lettera' ? `lettera ${e})` : n.tipo === 'numero' ? `numero ${e})` : n.tipo; }
function labelConArticolo(n) {
    if (n.tipo === 'articolo')
        return `l'${label(n)}`;
    if (n.tipo === 'comma')
        return `il ${label(n)}`;
    if (n.tipo === 'lettera')
        return `la ${label(n)}`;
    if (n.tipo === 'numero')
        return `il ${label(n)}`;
    return `la partizione ${n.etichetta || ''}`;
}
function maiuscola(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function genere(n) { return n.tipo === 'lettera' ? 'f' : 'm'; }
function participio(n, verb) { return genere(n) === 'f' ? `${verb.slice(0, -1)}a` : verb; }
function testoPartizione(n, testo) {
    const t = testo.trim();
    const e = etichettaPulita(n);
    if (!e)
        return t;
    const prefix = n.tipo === 'articolo' ? `Art. ${e}.` : n.tipo === 'comma' ? `${e}.` : n.tipo === 'lettera' ? `${e})` : n.tipo === 'numero' ? `${e})` : '';
    if (!prefix || new RegExp(`^${esc(prefix)}(?:\\s|$)`).test(t))
        return t;
    return `${prefix} ${t}`;
}
function cita(t) { return `«${t}»`; }
export function calcolaEtichetta(parent, anchor, tipo, posizione = 'dopo') {
    const siblings = parent.figli.filter(x => x.tipo === tipo);
    const i = siblings.findIndex(x => x.id === anchor.id);
    const prev = siblings[i - 1]?.etichetta || '';
    const next = siblings[i + 1]?.etichetta || '';
    const cur = anchor.etichetta || '';
    if (tipo === 'articolo' || tipo === 'comma') {
        if (posizione === 'dopo' && !next) {
            const m = cur.match(/^(\d+)(?:-(bis|ter|quater|quinquies))?$/);
            if (m)
                return m[2] ? `${m[1]}-${{ bis: 'ter', ter: 'quater', quater: 'quinquies' }[m[2]] || 'sexies'}` : `${m[1]}-bis`;
        }
        if (posizione === 'prima' && !prev && tipo === 'articolo')
            return '01';
        const a = Number.parseInt(cur, 10), b = Number.parseInt(next, 10);
        if (Number.isFinite(a) && Number.isFinite(b) && b === a + 1)
            return `${a}-bis`;
        if (cur.includes('-bis') && next && Number.parseInt(next, 10) === Number.parseInt(cur, 10) + 1)
            return cur.replace('-bis', '-ter');
        if (next && cur && !cur.includes('-'))
            return `${cur}.1`;
    }
    if (tipo === 'lettera') {
        const alphabet = 'abcdefghilm nopqrstuvz'.replace(/ /g, '');
        const idx = alphabet.indexOf(cur.toLowerCase());
        if (idx >= 0 && posizione === 'dopo')
            return idx < alphabet.length - 1 ? alphabet[idx + 1] : `${cur}${cur}`;
    }
    return '';
}
export function applicaModifica(source, m, veste) {
    const atto = structuredClone(source);
    const n = trovaNodo(atto.radice, m.nodoId);
    if (!n)
        throw new Error('Il bersaglio non è più presente nel documento. Ricaricare la fonte.');
    const before = JSON.stringify(source);
    let formula = '';
    if (m.operazione === 'sostituzione_testo') {
        const old = m.testoAtteso ?? '', neu = m.testoNuovo ?? '';
        if (!old)
            throw new Error('Selezionare il testo da sostituire.');
        const count = n.testo.split(old).length - 1;
        if (count !== 1)
            throw new Error(count === 0 ? 'Il testo selezionato non è più presente.' : 'Il testo ricorre più volte: selezionare una singola occorrenza.');
        n.testo = n.testo.replace(old, neu);
        formula = veste === 'novella' ? `Le parole: ${cita(old)} sono sostituite dalle seguenti: ${cita(neu)}.` : `Sostituire le parole ${cita(old)} con le seguenti: ${cita(neu)}.`;
    }
    else if (m.operazione === 'abrogazione') {
        const parent = parentOf(atto.radice, n.id);
        if (!parent)
            throw new Error('Non è possibile abrogare la radice del documento.');
        if (veste === 'novella')
            formula = `${maiuscola(labelConArticolo(n))} è ${participio(n, 'abrogato')}.`;
        else
            formula = `Sopprimere ${labelConArticolo(n)}.`;
        parent.figli = parent.figli.filter(x => x.id !== n.id);
    }
    else if (m.operazione === 'sostituzione_partizione') {
        if (!m.testoPartizione?.trim())
            throw new Error('Inserire il testo della nuova partizione.');
        n.testo = m.testoPartizione;
        const testoNuovo = testoPartizione(n, m.testoPartizione);
        if (veste === 'novella')
            formula = `${maiuscola(labelConArticolo(n))} è ${participio(n, 'sostituito')} dal seguente: ${cita(testoNuovo)}`;
        else
            formula = `Sostituire ${labelConArticolo(n)} con il seguente: ${cita(testoNuovo)}`;
    }
    else {
        const parent = parentOf(atto.radice, n.id);
        if (!parent)
            throw new Error('Selezionare una partizione che abbia una posizione di inserimento.');
        const tipo = m.tipoNuovo || n.tipo;
        const etichetta = m.etichettaNuova || calcolaEtichetta(parent, n, tipo, m.posizione || 'dopo');
        const id = `${n.id}-${tipo}-${(etichetta || 'nuovo').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        if (trovaNodo(atto.radice, id))
            throw new Error('Identificativo della nuova partizione già utilizzato.');
        const nuovo = { ...structuredClone(n), id, idInterno: `${n.idInterno}/sintetico-${m.id}`, tipo, etichetta: etichetta || null, rubrica: m.rubricaNuova || null, testo: m.testoPartizione || '', eId: null, identificativoSorgente: null, eIdDuplicato: false, origine: 'sintetico', attributi: {}, figli: [], contenutoNonInterpretato: null, citato: false, metadati: { inseritoDa: m.id } };
        const i = parent.figli.findIndex(x => x.id === n.id);
        parent.figli.splice(i + (m.posizione === 'dopo' ? 1 : 0), 0, nuovo);
        const riferimento = labelConArticolo(n);
        const testoNuovo = testoPartizione(nuovo, m.testoPartizione || '');
        formula = veste === 'novella' ? `Dopo ${riferimento} è inserito il seguente: ${cita(testoNuovo)}` : `Dopo ${riferimento} inserire il seguente: ${cita(testoNuovo)}`;
    }
    return { atto, documento: formula, diff: [`Operazione: ${m.operazione}`, `Bersaglio: ${m.nodoId}`, `Prima: ${before.length} caratteri serializzati`, `Dopo: ${JSON.stringify(atto).length} caratteri serializzati`], modifica: m };
}
export function testoNodo(n) { return [n.rubrica ? `(${n.rubrica})` : null, n.testo].filter(Boolean).join('\n'); }
export function validaIdStabili(root) { const ids = tuttiNodi(root).map(n => n.id); return ids.filter((id, i) => ids.indexOf(id) !== i); }
