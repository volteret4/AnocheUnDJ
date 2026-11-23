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

// Líneas del ePub con dos discos pegados (o con uno partido): cómo leerlas. `prefix` pasa a la línea siguiente.
const FIX = {
  'Eddie Kendricks – Date With The Rain Labelle – What Can I Do For You': ['Eddie Kendricks – Date With The Rain', 'Labelle – What Can I Do For You'],
  'The O’Jays – For The Love Of Money Teddy Pendergrass – You Can’t Hide': ['The O’Jays – For The Love Of Money', 'Teddy Pendergrass – You Can’t Hide'],
  'Southshore Commission – Free Man The Supremes – Up The Ladder To The Roof': ['Southshore Commission – Free Man', 'The Supremes – Up The Ladder To The Roof'],
  'Jorge Ben – Ponta de Lanca Africano Brian Briggs – Aeo': ['Jorge Ben – Ponta de Lanca Africano', 'Brian Briggs – Aeo'],
  'Fuhrs & Frohling – Happiness (@45). Gilberto Gil – Toda Menina Baiana': ['Fuhrs & Frohling – Happiness (@45)', 'Gilberto Gil – Toda Menina Baiana'],
  'Osibisa – Raghupati Raghava Rajaram Ozo – Anambra': ['Osibisa – Raghupati Raghava Rajaram', 'Ozo – Anambra'],
  '‘Fusion Mix’: Mohawks – Champ, James Brown – Get Up, Get Into It, Get Involved, Dyke & The Blazers – Let A Woman Be A Woman, Let A Man Be A Man':
    ['The Mohawks – The Champ', 'James Brown – Get Up, Get Into It, Get Involved', 'Dyke & The Blazers – Let A Woman Be A Woman, Let A Man Be A Man'],
  'Grand Funk Railroad – Inside Looking Out Grandmaster Flash & the Furious': ['Grand Funk Railroad – Inside Looking Out', { prefix: 'Grandmaster Flash & the Furious ' }],
  'Whitney Houston – I’m Every Woman Kiwi Dreams – Y?': ['Whitney Houston – I’m Every Woman', 'Kiwi Dreams – Y?'],
  'Jasper Street Company – A Feeling – Basement Boys': ['Jasper Street Company – A Feeling (Basement Boys)'],
  'Melissa Morgan – Still In Love – Maw': ['Melissa Morgan – Still In Love (Maw)'],
  'Nu Colours – My Desire – Maw Dub 3': ['Nu Colours – My Desire (Maw Dub 3)'],
  'Boom Boom Satellites – Dub Me Crazy Coldcut – Atomic Moog': ['Boom Boom Satellites – Dub Me Crazy', 'Coldcut – Atomic Moog'],
  'Ocean Colour Scene – The Riverboat Photek – Seven Samurai/Hidden Camera': ['Ocean Colour Scene – The Riverboat Song', 'Photek – The Hidden Camera'],
  'Primal Scream – Don’t Fight It, Feel It Primal Scream – Trainspotting': ['Primal Scream – Don’t Fight It, Feel It', 'Primal Scream – Trainspotting'],
  'Squarepusher – Male Pills mixed with… Dream Warriors – My Definition Of A Boombastic Jazz Style – (acappella).':
    ['Squarepusher – Male Pill', 'Dream Warriors – My Definition Of A Boombastic Jazz Style (acappella)'],
  'Barbara Lewis – Think A Little Sugar Marvin Jenkins – I’ve Got The Blues (Parts 1 & 2).': ['Barbara Lewis – Think A Little Sugar', 'Marvin Jenkins – I’ve Got The Blues (Parts 1 & 2)'],
  'The Blues Busters – I Won’t Let You Go South Central Avenue Municipal': ['The Blues Busters – I Won’t Let You Go', { prefix: 'South Central Avenue Municipal ' }],
  'Red Tyler & The Gyros – Junk Village Spooners Crowd – Two In The Morning': ['Red Tyler & The Gyros – Junk Village', 'Spooners Crowd – Two In The Morning'],
};
// «Todo lo de…», «(en directo)»: sin vídeo concreto.
// Consultas de YouTube corregidas tras revisar los DUDOSO de tools/yt.py ('-' = sin vídeo).
const YQ = {
  'Jeannie Brown|Can’t Stop Talking': '-',
  'Steve Silk Hurley|Jungle DJ': '-',
  'Stereo MC’s|Non-Stop': '-',
  'Guy Simone|You’re Mine': '-',
  'Depeche Mode|Shout': '-',
  'Edwin Starr|S. O. S. (Stop Her On Sight) aka Scott On Swingers': 'Edwin Starr Stop Her On Sight SOS',
  'Dean Cortney|I’ll Always Need You': 'Dean Courtney I’ll Always Need You',
  'Yellowman|Zuzuzangzang': 'Yellowman Zungguzungguguzungguzeng',
  'Johnny Dangerous|Reasons To Be Dismal': '-',
  'Marc Kinchen|MK EP': '-',
  'Ron Trent|Aftermath': '-',
  'African Dreams|It All Begins Here': '-',
  'Factory Kids|I’m Simian Dammit!': '-',
  'Headrush|Underground': '-',
  'The Soundman|The Factory': '-',
  'Yo Yo Honey|Higher (DJ Pierre Mix)': '-',
  'Atavistic Rhythms|Snackwitch': '-',
  '4E|Temple Trax': '-',
  'Glowball|Frequency': '-',
  'Jedi Knights|Ruak Et & Kok-Bah': '-',
  'Solaris|Slow Burn Dub': '-',
  'Witchman|Leviathan?': '-',
  'Double G|Twisted Future': '-',
  'Dreem Teem|Dreem Teem Theme': '-',
  '500 Rekords|Find The Path EP': '-',
  'Reservoir Dogs|What To Do About Us': '-',
};
const NOVIDEO = /^(all tracks|any track|\(live performance\))$/i;

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
  if (FIX[s]) { for (const e of FIX[s]) { if (typeof e === 'string') cur.entries.push(e); else prefix = e.prefix; } continue; }
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
    let a = m[1].trim(), t = m[2].trim().replace(/\s*\(@(33|45)\)/, '').replace(/[.,]+$/, '').trim();
    const k = match(a, t);
    if (k) { a = k.a; t = k.t; reused++; }
    const key = (a + '|' + t).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tracks.push(`      { a: ${q(a)}, t: ${q(t)}${k && k.y ? `, y: ${k.y}` : ''}${YQ[a + '|' + t] ? `, yq: ${q(YQ[a + '|' + t])}` : NOVIDEO.test(t) ? ", yq: '-'" : ''}, ess: 1 },`);
    total++;
  }
  out += `  { id: '${id}', note: ${q(`Lista «${name}» del libro${l.by ? `, compilada por ${l.by}` : ''}: ${tracks.length} discos.`)},\n    tracks: [\n${tracks.join('\n')}\n    ] },\n`;
}
out += '], 21);\n';
fs.writeFileSync(path.join(root, 'data/21-listas.js'), out);
console.log(`${lists.length} listas, ${total} discos (${reused} ya estaban en los capítulos)`);
