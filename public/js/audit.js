const CLASSI = {
    akomaNtoso: 'radice-e-documento', act: 'radice-e-documento', bill: 'radice-e-documento', doc: 'radice-e-documento',
    body: 'contenitore', mainBody: 'contenitore', attachments: 'contenitore', attachment: 'contenitore',
    book: 'struttura-normativa', part: 'struttura-normativa', title: 'struttura-normativa', chapter: 'struttura-normativa',
    section: 'struttura-normativa', article: 'struttura-normativa', paragraph: 'struttura-normativa',
    subparagraph: 'struttura-normativa', point: 'struttura-normativa', indent: 'struttura-normativa', step: 'struttura-normativa',
    annex: 'struttura-normativa', quotedText: 'struttura-normativa', quotedStructure: 'struttura-normativa', quotedBlock: 'struttura-normativa',
    hcontainer: 'contenitore', container: 'contenitore', content: 'contenitore', intro: 'contenitore', list: 'contenitore',
    table: 'struttura-normativa', tr: 'contenitore', td: 'contenitore',
    p: 'presentazione', i: 'presentazione', b: 'presentazione', span: 'presentazione', eol: 'presentazione',
    img: 'presentazione', br: 'presentazione', u: 'presentazione', sup: 'presentazione', sub: 'presentazione',
    a: 'presentazione', del: 'presentazione', ins: 'presentazione', mark: 'presentazione',
    meta: 'metadati', identification: 'metadati', FRBRWork: 'metadati', FRBRExpression: 'metadati', FRBRManifestation: 'metadati',
    FRBRthis: 'metadati', FRBRuri: 'metadati', FRBRdate: 'metadati', FRBRauthor: 'metadati', FRBRcountry: 'metadati',
    FRBRsubtype: 'metadati', FRBRnumber: 'metadati', FRBRname: 'metadati', FRBRlanguage: 'metadati', references: 'metadati',
    lifecycle: 'metadati', workflow: 'metadati', eventRef: 'metadati', stepRef: 'metadati', componentInfo: 'metadati',
    componentData: 'metadati', TLCRole: 'metadati', TLCPerson: 'metadati', TLCOrganization: 'metadati',
    num: 'supporto-editoriale', heading: 'supporto-editoriale', docTitle: 'supporto-editoriale', docNumber: 'supporto-editoriale',
    docType: 'supporto-editoriale', docProponent: 'supporto-editoriale', docIntroducer: 'supporto-editoriale', coverPage: 'supporto-editoriale',
    original: 'supporto-editoriale', hasAttachment: 'supporto-editoriale', attachmentOf: 'supporto-editoriale',
    authorialNote: 'supporto-editoriale', remark: 'supporto-editoriale', note: 'supporto-editoriale',
};
const STRUTTURALI = new Set(['book', 'part', 'title', 'chapter', 'section', 'article', 'paragraph', 'subparagraph', 'point', 'indent', 'step', 'annex', 'quotedText', 'quotedStructure', 'quotedBlock', 'table']);
const categorie = ['radice-e-documento', 'struttura-normativa', 'contenitore', 'presentazione', 'metadati', 'supporto-editoriale', 'non-classificato'];
const local = (el) => el.localName || el.tagName.replace(/^.*:/, '');
function categoriaContestuale(el) {
    const name = local(el);
    // In Akoma Ntoso, workflow/step descrive il ciclo di vita dell'atto,
    // non una partizione del testo normativo.
    if (name === 'step' && el.parentElement && local(el.parentElement) === 'workflow')
        return 'metadati';
    return CLASSI[name] || 'non-classificato';
}
function hasText(el) { return !!(el.textContent || '').replace(/\s+/g, '').length; }
export function analizzaAkn(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    const emptyResult = () => ({ validoXml: false, erroreXml: (parseError?.textContent || 'Errore XML').trim(), elementiTotali: 0, elementiDistinti: 0,
        categorie: Object.fromEntries(categorie.map(c => [c, 0])), inventario: [], elementiNonClassificati: [],
        elementiStrutturaliVuoti: [], elementiVuotiContestuali: [], tabelle: [], namespace: null });
    if (parseError)
        return emptyResult();
    const all = Array.from(doc.getElementsByTagName('*'));
    const counts = new Map();
    const structuralEmpty = new Map();
    const contextualEmpty = new Map();
    for (const el of all) {
        const name = local(el), category = categoriaContestuale(el), key = `${name}\u0000${category}`;
        const item = counts.get(key) || { occorrenze: 0, categoria: category };
        item.occorrenze++;
        counts.set(key, item);
        if (STRUTTURALI.has(name) && !hasText(el)) {
            if (name === 'step' && category === 'metadati')
                contextualEmpty.set(name, (contextualEmpty.get(name) || 0) + 1);
            else
                structuralEmpty.set(name, (structuralEmpty.get(name) || 0) + 1);
        }
    }
    const inventario = Array.from(counts, ([key, v]) => ({ elemento: key.split('\u0000')[0], occorrenze: v.occorrenze, categoria: v.categoria }))
        .sort((a, b) => b.occorrenze - a.occorrenze || a.elemento.localeCompare(b.elemento) || a.categoria.localeCompare(b.categoria));
    const totals = Object.fromEntries(categorie.map(c => [c, 0]));
    for (const item of inventario)
        totals[item.categoria] += item.occorrenze;
    const vuoti = Array.from(structuralEmpty, ([elemento, occorrenze]) => ({ elemento, occorrenze, categoria: 'struttura-normativa' }));
    const vuotiContestuali = Array.from(contextualEmpty, ([elemento, occorrenze]) => ({ elemento, occorrenze, categoria: 'metadati' }));
    const tables = all.filter(el => local(el) === 'table');
    const tabelle = tables.map((table, indice) => {
        const rows = Array.from(table.children).filter(el => local(el) === 'tr');
        const cells = rows.flatMap(row => Array.from(row.children).filter(el => ['td', 'th'].includes(local(el))));
        return { indice: indice + 1, righe: rows.length, celle: cells.length, celleVuote: cells.filter(cell => !hasText(cell)).length,
            caratteriTesto: cells.reduce((n, cell) => n + (cell.textContent || '').length, 0) };
    });
    return { validoXml: true, erroreXml: null, elementiTotali: all.length, elementiDistinti: new Set(all.map(local)).size, categorie: totals, inventario,
        elementiNonClassificati: inventario.filter(x => x.categoria === 'non-classificato'), elementiStrutturaliVuoti: vuoti,
        elementiVuotiContestuali: vuotiContestuali, tabelle, namespace: doc.documentElement?.namespaceURI || null };
}
