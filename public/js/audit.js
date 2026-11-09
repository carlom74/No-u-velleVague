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
export function analizzaAkn(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    const parseError = doc.querySelector('parsererror');
    if (parseError)
        return { validoXml: false, erroreXml: (parseError.textContent || 'Errore XML').trim(), elementiTotali: 0, elementiDistinti: 0, categorie: Object.fromEntries(categorie.map(c => [c, 0])), inventario: [], elementiNonClassificati: [], elementiStrutturaliVuoti: [], namespace: null };
    const all = Array.from(doc.getElementsByTagName('*'));
    const counts = new Map();
    const structuralEmpty = new Map();
    for (const el of all) {
        const name = local(el);
        counts.set(name, (counts.get(name) || 0) + 1);
        if (STRUTTURALI.has(name) && !(el.textContent || '').replace(/\s+/g, '').length)
            structuralEmpty.set(name, (structuralEmpty.get(name) || 0) + 1);
    }
    const inventario = Array.from(counts, ([elemento, occorrenze]) => ({ elemento, occorrenze, categoria: CLASSI[elemento] || 'non-classificato' }))
        .sort((a, b) => b.occorrenze - a.occorrenze || a.elemento.localeCompare(b.elemento));
    const totals = Object.fromEntries(categorie.map(c => [c, 0]));
    for (const item of inventario)
        totals[item.categoria] += item.occorrenze;
    const vuoti = Array.from(structuralEmpty, ([elemento, occorrenze]) => ({ elemento, occorrenze, categoria: 'struttura-normativa' }));
    return { validoXml: true, erroreXml: null, elementiTotali: all.length, elementiDistinti: counts.size, categorie: totals, inventario,
        elementiNonClassificati: inventario.filter(x => x.categoria === 'non-classificato'), elementiStrutturaliVuoti: vuoti,
        namespace: doc.documentElement?.namespaceURI || null };
}
