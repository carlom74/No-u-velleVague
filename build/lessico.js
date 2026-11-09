// Regole di riconoscimento delle partizioni, SEPARATE dal codice del parser.
// Aggiungere un caso degenere = aggiungere/modificare una voce qui + un test.
//
// Derivato dalla grammatica dell'articolato di PArSe (Senato della Repubblica,
// Servizio dell'Informatica): stessi livelli (articolo > comma > lettera > numero)
// e stessa numerazione con suffissi latini (-bis, -ter, ...), adattato all'HTML di Normattiva.
// NB: prima di redistribuire verificare la licenza di PArSe (README: CC BY 3.0; GitHub: GPL-3.0).
// Suffissi latini in ordine (art. 3-bis, 3-ter, ...).
export const SUFFISSI = [
    'bis', 'ter', 'quater', 'quinquies', 'sexies', 'septies', 'octies', 'novies',
    'decies', 'undecies', 'duodecies', 'terdecies', 'quaterdecies', 'quinquiesdecies',
    'sexiesdecies', 'septiesdecies', 'octiesdecies', 'noviesdecies', 'vicies',
    'unvicies', 'duovicies', 'tervicies', 'quatervicies', 'quinvicies', 'sexvicies',
    'septivicies', 'duodetricies', 'undetricies', 'tricies',
];
const S = SUFFISSI.join('|');
// Alfabeto della tecnica legislativa italiana: 21 lettere (niente j, k, w, x, y).
// Dopo la 'z' si prosegue con aa), bb), cc), ...
export const LETTERE_ITA = 'abcdefghilmnopqrstuvz'.split('');
export const LETTERE_STRANIERE = 'jkwxy'.split('');
export const RE = {
    // "1. ", "2-bis. ", "3-quater. "
    comma: new RegExp(`^(\\d+(?:-(?:${S}))?)\\.(?:\\s+|$)`, 'i'),
    // "a) ", "aa) ", "a-bis) "
    lettera: new RegExp(`^((?:([a-z])\\2|[a-z])(?:-(?:${S}))?)\\)(?:\\s+|$)`, 'i'),
    // "1) ", "2-bis) "
    numero: new RegExp(`^(\\d+(?:-(?:${S}))?)\\)(?:\\s+|$)`, 'i'),
    // "1° ", "2° " (ordinali dei codici)
    numeroOrdinale: /^(\d+)\s?[°º](?:\s+|$)/,
    // "Art. 13-bis"
    articolo: new RegExp(`^\\s*art(?:icolo|\\.)?\\s*(\\d+(?:[-\\s]?(?:${S}))?)\\.?\\s*$`, 'i'),
    // numero di nota (dopo la rimozione: ((12)) )
    notaRiferimento: /\s*\(\(\s*\d+\s*\)\)/g,
};
// Classi CSS di Normattiva (HTML derivato da Akoma Ntoso)
export const CLASSI = {
    articoloNumero: 'article-num-akn',
    rubrica: ['article-heading-akn', 'article-pre-comma-text-akn'],
    saltare: ['preamble-', 'formula-introduttiva'], // prefissi
    aggiornamento: 'art_aggiornamento-akn',
    commaBlocco: 'art-comma-div-akn',
    commaNumero: 'comma-num-akn',
    elencoTesta: 'pointedList-first-akn',
    elencoResto: 'pointedList-rest-akn',
    testoPiatto: 'art-just-text-akn',
    tabella: 'table-akn',
};
