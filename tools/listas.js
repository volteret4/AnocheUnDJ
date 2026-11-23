// Vuelca las «Listas de los clubs» del final del libro (build/chapters/21.txt) a data/21-listas.js.
// Cada lista se añade como discos esenciales (ess: 1) a la escena del club que ya existe; si el disco ya
// estaba en algún capítulo, se reutilizan su artista, título y año exactos para que se fusionen.
// Uso: node tools/listas.js   (desde la raíz del libro)
global.window = global;
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
require(path.join(root, 'data/core.js'));
for (const f of fs.readdirSync(path.join(root, 'data')).filter((f) => /^\d\d-.*\.js$/.test(f) && !f.startsWith('21')).sort())
  require(path.join(root, 'data', f));

// Lista del libro → escena.
const MAP = {
  'Jimmy Savile original eight': 'savile',
  'Wigan Casino 50': 'wigan-casino',
  'Loft 100': 'loft',
  'Gallery 50': 'gallery',
  'Saint 70': 'the-saint',
  'Paradise Garage 100': 'paradise-garage',
  'Cosmic Club 50': 'cosmic',
  'Liaisons Dangereuses 80 (programa de radio).': 'musica-ab',
  'Warehouse 50': 'warehouse',
  'Music Box 50': 'music-box',
  'Roxy 100': 'roxy',
  'Soul II Soul at the Africa Centre 50': 'soul-ii-soul',
  'Jive Turkey 100': 'house-norte',
  'Haçienda 50': 'hacienda',
  'Shoom 50': 'shoom',
  'Rage 50': 'rage',
  'Sound Factory 50': 'sound-factory',
  'Feel Real 50': 'garage-britanico',
  'Stealth 50': 'coldcut-marrs',
  'Twice As Nice 50': 'two-step',
  'Popcorn 50': 'popcorn',
};

const norm = (s) => s.toLowerCase().replace(/[’‘´`]/g, "'").replace(/&/g, ' and ').replace(/\bfeat(uring)?\.?\b.*$/, '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^the\s+/, '').replace(/[^a-z0-9]+/g, '');
const normT = (s) => norm(s.replace(/\(.*?\)/g, ''));

const known = [];
for (const g of ANOCHE.genres.values()) for (const t of g.tracks) known.push(t);
function match(a, t) {
  const na = norm(a), nt = normT(t);
  return known.find((k) => norm(k.a) === na && normT(k.t) === nt)
    || known.find((k) => normT(k.t) === nt && nt.length > 3 && (norm(k.a).startsWith(na.slice(0, 5)) || na.startsWith(norm(k.a).slice(0, 5))));
}

const lines = fs.readFileSync(path.join(root, 'build/chapters/21.txt'), 'utf8').split('\n');
const lists = [];
let cur = null, prefix = '';
for (let raw of lines) {
  raw = raw.trim();
  if (!raw) continue;
  if (raw.startsWith('## ')) { cur = { title: raw.slice(3), entries: [], by: '' }; lists.push(cur); continue; }
  let s = raw.replace(/^\[pág\. ≈\d+\]\s*/, '');
  const by = s.match(/\s*\(compilada por (.+?)\)\.?$/);
  if (by) { cur.by = by[1]; s = s.slice(0, by.index).trim(); if (!s) continue; }
  s = prefix + s; prefix = '';
  if (/\s(–|-)\s/.test(s)) { cur.entries.push(s); continue; }
  if (/\s(and|y|&|feat\.?)$/i.test(s)) { prefix = s + ' '; continue; }   // continúa en la línea siguiente
  if (cur.entries.length) cur.entries[cur.entries.length - 1] += ' ' + s;  // resto del título anterior
  else console.error('SIN SEPARADOR', cur.title, s);
}

const q = (s) => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, '’') + "'";
let out = `// Generado por tools/listas.js a partir de las «Listas de los clubs» del libro: no editar a mano.
ANOCHE.chapter({ n: 21, title: 'Listas de los clubs', label: 'Cap. 21 · Listas de los clubs ★' });
ANOCHE.add([
  { id: 'sound-factory', name: 'Junior Vasquez y el Sound Factory', family: 'house', start: 1989, end: 1995, place: 'Sound Factory, Nueva York',
    aka: ['Sound Factory', 'Junior Vasquez'],
    desc: 'Junior Vasquez idolatraba a Larry Levan y construyó el Sound Factory como réplica deliberada del Paradise Garage, hasta colgar en la entrada su letrero iluminado (los fieles del Garage lo denunciaron); en sus mejores noches casi despertó la misma comunidad. Se negó durante años a tocar en el Reino Unido («Yo jamás iría para allá a tocar en el Ministry») y para los británicos se volvió la experiencia de club suprema, hasta que en 1997 tocó en el Cream y el Ministry. Luego vio a su público pasar de negro y gay a blanco, joven y heterosexual.',
    artists: ['Junior Vasquez', 'Larry Levan', 'Rob Di Stefano'],
    labels: ['Sound Factory', 'Cream', 'Ministry of Sound'],
    influences: ['paradise-garage'],
    refs: [
      { q: 'El Sound Factory de Junior era una réplica deliberadamente exacta del Paradise Garage, y en sus mejores momentos casi llegó a despertar los mismos sentimientos de comunidad.', ch: 11 },
      { q: 'Como resultado, para los fanáticos británicos que lo conocían solo por sus producciones y su reputación mitológica, Vasquez y su club Sound Factory llegó a representar lo máximo en la experiencia de clubs.', ch: 19 },
    ] },
`;
let total = 0, reused = 0;
for (const l of lists) {
  const id = MAP[l.title];
  if (!id) { console.error('LISTA SIN ESCENA', l.title); process.exitCode = 1; continue; }
  const name = l.title.replace(/\s*\(programa de radio\)\.?$/, '');
  const seen = new Set();
  const tracks = [];
  for (const e of l.entries) {
    const m = e.match(/^(.+?)\s(?:–|-)\s(.+)$/);
    let a = m[1].trim(), t = m[2].trim();
    const k = match(a, t);
    if (k) { a = k.a; t = k.t; reused++; }
    const key = (a + '|' + t).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tracks.push(`      { a: ${q(a)}, t: ${q(t)}${k && k.y ? `, y: ${k.y}` : ''}, ess: 1 },`);
    total++;
  }
  out += `  { id: '${id}', note: ${q(`Lista «${name}» del libro${l.by ? `, compilada por ${l.by}` : ''}: ${tracks.length} discos.`)},\n    tracks: [\n${tracks.join('\n')}\n    ] },\n`;
}
out += '], 21);\n';
fs.writeFileSync(path.join(root, 'data/21-listas.js'), out);
console.log(`${lists.length} listas, ${total} discos (${reused} ya estaban en los capítulos)`);
