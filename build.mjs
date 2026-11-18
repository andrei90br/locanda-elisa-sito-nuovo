// Genera il sito statico multipagina (IT in radice, EN in /en/, DE in /de/) da src/layout.html + src/pages/*.html + src/lang/*.json
// Uso:  node build.mjs                      sito completo in site/ (indicizzabile, con sitemap.xml)
//       COMING_SOON=1 node build.mjs        avviso "nuovo sito in arrivo" in radice, sito completo in site/anteprima/ (noindex)
//       NOINDEX=1 node build.mjs            anteprima non indicizzabile
//       SITE=https://... node build.mjs     dominio (default https://garnidellalocanda.it)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), 'utf8');
const PUBLIC = (process.env.SITE || 'https://garnidellalocanda.it').replace(/\/$/, '');
const COMING = !!process.env.COMING_SOON;
const NOINDEX = COMING || !!process.env.NOINDEX;
const IMG = 'https://locandaelisa.it/wp-content/uploads';
const MAPS = 'https://www.google.com/maps/search/?api=1&amp;query=Piazza+Centrale+11,+38025+Dimaro+Folgarida+TN';
const siteRoot = join(root, 'site');
const out = COMING ? join(siteRoot, 'anteprima') : siteRoot;
const SITE = COMING ? `${PUBLIC}/anteprima` : PUBLIC;

const LANGS = [
  { code: 'it', path: '' },
  { code: 'en', path: 'en/' },
  { code: 'de', path: 'de/' },
];

// Camere: foto (percorsi sotto IMG) e dati che non cambiano con la lingua
const ROOMS = [
  { slug: 'doppia', n: 1, key: 'r1', other: 'tripla', otherKey: 'g2_h',
    img: ['2024/01/063-Locanda-Elisa-Dic-2023-1-jpg.webp', '2024/01/065-Locanda-Elisa-Dic-2023-jpg.webp', '2024/03/074-Locanda-Elisa-Dic-2023-jpg.webp', '2024/01/066-Locanda-Elisa-Dic-2023-jpg.webp'] },
  { slug: 'tripla', n: 2, key: 'r2', other: 'doppia', otherKey: 'g1_h',
    img: ['2024/03/057-Locanda-Elisa-Dic-2023-jpg.webp', '2024/01/072-Locanda-Elisa-Dic-2023-jpg.webp', '2024/03/074-Locanda-Elisa-Dic-2023-jpg.webp', '2024/01/076-Locanda-Elisa-Dic-2023-jpg.webp'] },
];

// Pagine: percorso (uguale in tutte le lingue), file, chiavi di titolo/descrizione, voce di menu attiva, foto per la condivisione
const PAGES = [
  { path: '', file: 'home', title: 'meta_title', desc: 'meta_desc', cur: 'home', og: 'ingresso-garni.webp' },
  { path: 'camere/', file: 'camere', title: 'cam_title', desc: 'cam_desc', cur: 'camere', og: 'ingresso-garni.webp', crumb: 'm_rooms' },
  ...ROOMS.map((r) => ({ path: `camere/${r.slug}/`, file: 'camera', title: `${r.key}_title`, desc: `${r.key}_desc`, cur: 'camere', og: 'ingresso-garni.webp', room: r, crumb: 'm_rooms', crumb2: r.n === 1 ? 'g1_h' : 'g2_h' })),
  { path: 'colazione/', file: 'colazione', title: 'col_title', desc: 'col_desc', cur: 'colazione', og: 'sala-colazione.webp', crumb: 'm_breakfast' },
  { path: 'bar/', file: 'bar', title: 'bar_title', desc: 'bar_desc', cur: 'bar', og: 'colazione-croissant.webp', crumb: 'm_bar' },
  { path: 'val-di-sole/', file: 'val-di-sole', title: 'vds_title', desc: 'vds_desc', cur: 'val', og: 'ingresso-garni.webp', crumb: 'm_valdisole' },
  { path: 'contatti/', file: 'contatti', title: 'con_title', desc: 'con_desc', cur: 'contatti', og: 'ingresso-garni.webp', crumb: 'm_contact' },
];

const layout = read('src/layout.html');
const fin = read('src/fin.html');
const bodies = Object.fromEntries(PAGES.map((p) => [p.file, read(`src/pages/${p.file}.html`)]));

rmSync(siteRoot, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'src/assets'), join(out, 'assets'), { recursive: true });

const fill = (html, map) => html.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (m, k) => (k in map ? map[k] : m));
const urls = [];

for (const l of LANGS) {
  const t = JSON.parse(read(`src/lang/${l.code}.json`));
  const labels = { name: t.lbl_name, email: t.lbl_email, phone: t.lbl_phone, checkin: t.lbl_checkin, checkout: t.lbl_checkout, adults: t.lbl_adults, kids: t.lbl_kids, room: t.lbl_room };
  for (const p of PAGES) {
    const depth = (l.path + p.path).split('/').filter(Boolean).length;
    const ROOT = '../'.repeat(depth);
    const HOME = ROOT + l.path;
    const m = { ...t };
    Object.assign(m, {
      SITE, IMG, MAPS, ROOT, HOME, ROBOTS: NOINDEX ? '<meta name="robots" content="noindex, nofollow">' : '',
      mail_labels: JSON.stringify(labels), path: '/' + l.path + p.path, page: p.path,
      page_title: t[p.title], page_desc: t[p.desc], og_img: p.og,
      ROOT_IT: ROOT + p.path || './', ROOT_EN: ROOT + 'en/' + p.path, ROOT_DE: ROOT + 'de/' + p.path,
    });
    for (const c of ['it', 'en', 'de']) m[`cur_${c}`] = c === l.code ? 'aria-current="true"' : '';
    for (const c of ['home', 'camere', 'colazione', 'bar', 'val', 'contatti']) m[`cur_${c}`] = c === p.cur ? 'aria-current="page"' : '';
    // Briciole di pane
    const sep = '<i></i>';
    let crumb = p.crumb ? `<a href="${HOME}">${t.cr_home}</a>` : `<span aria-current="page">${t.cr_home}</span>`;
    if (p.crumb2) crumb += `${sep}<a href="${HOME}camere/">${t[p.crumb]}</a>${sep}<span aria-current="page">${t[p.crumb2]}</span>`;
    else if (p.crumb) crumb += `${sep}<span aria-current="page">${t[p.crumb]}</span>`;
    m.CRUMB = crumb;
    if (p.room) {
      const r = p.room, k = r.key;
      Object.assign(m, {
        R_N: String(r.n), R_NAME: t[r.n === 1 ? 'g1_h' : 'g2_h'], R_SUB: t[`${k}_sub`], R_H: t[`${k}_h`], R_P1: t[`${k}_p1`], R_P2: t[`${k}_p2`],
        R_OTHER_SLUG: r.other, R_OTHER_NAME: t[r.otherKey],
      });
      for (let i = 1; i <= 4; i++) {
        m[`R_IMG${i}`] = r.img[i - 1]; m[`R_ALT${i}`] = t[`${k}_alt${i}`];
        m[`R_F${i}N`] = t[`${k}_f${i}n`]; m[`R_F${i}T`] = t[`${k}_f${i}t`];
      }
    }
    let html = layout.replace('{{BODY}}', bodies[p.file].replace('{{FIN}}', fin));
    html = fill(fill(html, m), m);
    const left = [...new Set(html.match(/\{\{[A-Za-z0-9_]+\}\}/g) || [])];
    if (left.length) throw new Error(`[${l.code}/${p.path}] segnaposto non risolti: ${left.join(', ')}`);
    const dir = join(out, l.path + p.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), html);
    urls.push(`${PUBLIC}/${l.path}${p.path}`);
  }
  console.log(`OK  ${l.code}: ${PAGES.length} pagine`);
}

// File in radice per il dominio pubblico
const host = new URL(PUBLIC).host;
if (COMING) {
  writeFileSync(join(siteRoot, 'index.html'), read('src/coming-soon.html'));
  mkdirSync(join(siteRoot, 'assets'), { recursive: true });
  cpSync(join(root, 'src/assets/logo.svg'), join(siteRoot, 'assets/logo.svg'));
  writeFileSync(join(siteRoot, 'robots.txt'), 'User-agent: *\nDisallow: /anteprima/\n');
  console.log('OK  avviso in radice, sito completo in /anteprima/');
} else if (NOINDEX) {
  writeFileSync(join(siteRoot, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
} else {
  writeFileSync(join(siteRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${PUBLIC}/sitemap.xml\n`);
  writeFileSync(join(siteRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
}
if (!host.endsWith('.github.io')) writeFileSync(join(siteRoot, 'CNAME'), host + '\n');
console.log('OK  robots.txt e CNAME');
