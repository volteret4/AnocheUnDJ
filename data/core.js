// Registro de escenas, clubs, DJ y discos de Anoche un DJ me salvó la vida de Bill Brewster y Frank Broughton (la historia del disc jockey). Cada fichero de capítulo (data/NN-*.js,
// escritos a mano leyendo el libro) llama a ANOCHE.chapter({...}) y ANOCHE.add([...], n).
// Los datos se fusionan por id: los arrays se unen y cada capítulo puede añadir
// discos, citas (refs) y una nota propia sobre una escena ya definida en otro.
window.ANOCHE = (function () {
  const genres = new Map();
  const chapters = [];

  const FAMILIES = {
    radio:     { name: 'El DJ de radio: de los primeros discos en antena al rock’n’roll', color: '#60a5fa' },
    clubs:     { name: 'Primeros clubs: jukebox, sock hops, discotecas, twist y mods', color: '#facc15' },
    northern:  { name: 'Northern soul y la cultura del disco raro británica', color: '#f472b6' },
    jamaica:   { name: 'Jamaica: sistemas de sonido, toasting, dub y su diáspora', color: '#22c55e' },
    disco:     { name: 'Disco: el Loft, la remezcla, el doce pulgadas y el hi-NRG', color: '#e879f9' },
    hiphop:    { name: 'Hip-hop: breaks del Bronx, rap y electro', color: '#fb923c' },
    house:     { name: 'Garage y house: Paradise Garage, Chicago, Nueva Jersey', color: '#38bdf8' },
    tecno:     { name: 'Tecno: Detroit, Europa, new beat y cosmic', color: '#a3e635' },
    britanico: { name: 'Reino Unido: Baleares, acid house, raves, jungle, garage, dubstep', color: '#f87171' },
    oficio:    { name: 'El oficio y la industria: técnica, remezcla, estrellas, ley', color: '#e5e7eb' },
  };

  const key = (t) => (t.a + '|' + t.t).toLowerCase();

  function mergeArr(a = [], b = [], k = (x) => (typeof x === 'string' ? x.toLowerCase() : JSON.stringify(x))) {
    const seen = new Set(a.map(k));
    const out = a.slice();
    for (const x of b) if (!seen.has(k(x))) { seen.add(k(x)); out.push(x); }
    return out;
  }

  // Anota en cada disco los capítulos que lo citan.
  function cite(tracks, t, ch) {
    const m = tracks.find((x) => key(x) === key(t));
    if (m && ch != null) m.chs = mergeArr(m.chs, [ch]);
  }

  function add(list, chapter) {
    for (const g of list) {
      let cur = genres.get(g.id);
      if (!cur) {
        cur = { id: g.id, aka: [], influences: [], artists: [], tracks: [], labels: [], refs: [], notes: [], chapters: [] };
        genres.set(g.id, cur);
      }
      for (const f of ['aka', 'influences', 'artists', 'labels']) cur[f] = mergeArr(cur[f], g[f]);
      cur.tracks = mergeArr(cur.tracks, (g.tracks || []).map((t) => ({ ...t })), key);
      for (const t of g.tracks || []) {
        if (t.ess) { const m = cur.tracks.find((x) => key(x) === key(t)); if (m) m.ess = 1; }
        cite(cur.tracks, t, chapter);
      }
      cur.refs = mergeArr(cur.refs, (g.refs || []).map((r) => ({ ch: chapter, ...r })), (r) => r.q);
      for (const f of ['name', 'family', 'start', 'end', 'place', 'desc']) if (g[f] != null && cur[f] == null) cur[f] = g[f];
      if (g.desc != null) cur.descCh = cur.descCh ?? chapter;
      if (g.note) cur.notes.push({ ch: chapter, text: g.note });
      if (chapter != null && !cur.chapters.includes(chapter)) cur.chapters.push(chapter);
    }
  }

  return {
    FAMILIES,
    chapters,
    genres,
    chapter(meta) { chapters.push(meta); },
    add,
  };
})();
