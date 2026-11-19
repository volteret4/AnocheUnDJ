#!/usr/bin/env python3
"""Texto por capítulos de Anoche un DJ me salvó la vida. Brevísima historia de los verdaderos dioses de la
música (Bill Brewster y Frank Broughton; ePub de Epublibre de la edición en español de la ampliada de 2006).

Uso: python3 -I tools/split.py <dir_xhtml> <dir_salida>

Lee directamente los XHTML del ePub (OEBPS/Text). Capítulo 1: los dos prefacios y «Uno: introducción»;
2-20: los capítulos dos-veinte del libro (en el ePub, cada uno es una portadilla eplNN con la parte, «DOS:
LOS COMIENZOS - LA RADIO», y el texto en el fichero siguiente); 21: «Listas de los clubs». Las cabeceras
salen como «## …» (en las listas, los nombres de club en negrita); las llamadas a nota se descartan.
Escribe <dir>/NN.txt y <dir>/book.json (párrafos {ch, sec, segs: [[pág, texto]]}, el formato de
tools/refs.py). El ePub no trae paginación impresa: la página se estima a 300 palabras desde el primer
prefacio.
"""
import html
import json
import re
import sys
from pathlib import Path

WORDS_PER_PAGE = 300
FILES = {1: ['epl01', 'epl02', 'epl05']} | {n: [f'epl{2 * n + 3:02d}'] for n in range(2, 22)}
BLOCK = re.compile(r'<(p|h[1-6])\b([^>]*)>(.*?)</\1>', re.S)


def clean(s):
    s = re.sub(r'<a href="notas\.xhtml[^>]*>.*?</a>|<sup[^>]*>.*?</sup>', '', s, flags=re.S)
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = html.unescape(re.sub(r'<[^>]+>', '', s)).replace('⁠', '').replace('\xad', '')
    return re.sub(r'\s+', ' ', s).strip()


def main(src, out):
    src, out = Path(src), Path(out)
    out.mkdir(parents=True, exist_ok=True)
    paras, words = [], 0
    for ch, names in FILES.items():
        sec, text = None, []
        for name in names:
            doc = (src / f'{name}.xhtml').read_text()
            for m in BLOCK.finditer(doc[doc.index('<body'):]):
                tag, attrs, inner = m.groups()
                line = clean(inner)
                if not line:
                    continue
                if tag != 'p' or ('asangre' in attrs and inner.strip().startswith('<b>')):
                    sec = line
                    text.append(f'## {line}')
                    continue
                page = words // WORDS_PER_PAGE + 1
                paras.append({'ch': ch, 'sec': sec, 'segs': [[page, line]]})
                text.append(f'[pág. ≈{page}] {line}')
                words += len(line.split())
        (out / f'{ch:02d}.txt').write_text('\n\n'.join(text) + '\n')
        n = sum(len(p['segs'][0][1].split()) for p in paras if p['ch'] == ch)
        print(f'cap. {ch}: {n} palabras, págs. ≈{next((p["segs"][0][0] for p in paras if p["ch"] == ch), "?")}–{words // WORDS_PER_PAGE + 1}')
    (out / 'book.json').write_text(json.dumps(paras, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:])
