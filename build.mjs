// Genera il sito statico multipagina (IT in radice, EN/DE nelle sottocartelle) in site/.
// Uso:  node build.mjs                    sito completo in site/ (indicizzabile, con sitemap.xml)
//       COMING_SOON=1 node build.mjs      avviso "nuovo sito in arrivo" in radice, sito completo in site/anteprima/ (noindex)
//       NOINDEX=1 node build.mjs          anteprima non indicizzabile
//       SITE=https://... node build.mjs   dominio (default https://garnidellalocanda.it)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_URL, LANGS, ROOMS, PAGES } from './src/data.mjs';
import { context, home, rooms, room, breakfast, bar, valdisole, request } from './src/render.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const COMING = !!process.env.COMING_SOON;
const NOINDEX = COMING || !!process.env.NOINDEX;
const siteRoot = join(root, 'site');
const out = COMING ? join(siteRoot, 'anteprima') : siteRoot;

const pages = [
  [PAGES.home, home],
  [PAGES.rooms, rooms],
  ...ROOMS.map((r) => [`${PAGES.rooms}${r.slug}/`, (c) => room(c, r)]),
  [PAGES.breakfast, breakfast],
  [PAGES.bar, bar],
  [PAGES.valdisole, valdisole],
  [PAGES.request, request],
];

rmSync(siteRoot, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'src/assets'), join(out, 'assets'), { recursive: true });

const urls = [];
for (const lang of LANGS) {
  const t = JSON.parse(readFileSync(join(root, `src/i18n/${lang.code}.json`), 'utf8'));
  for (const [path, render] of pages) {
    const dir = join(out, lang.path + path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), render(context(lang, t, path)));
    urls.push(PUBLIC_URL + lang.path + path);
  }
  console.log(`OK  ${lang.code}: ${pages.length} pagine`);
}

const host = new URL(PUBLIC_URL).host;
if (COMING) {
  writeFileSync(join(siteRoot, 'index.html'), readFileSync(join(root, 'src/coming-soon.html')));
  mkdirSync(join(siteRoot, 'assets'), { recursive: true });
  cpSync(join(root, 'src/assets/logo.svg'), join(siteRoot, 'assets/logo.svg'));
  writeFileSync(join(siteRoot, 'robots.txt'), 'User-agent: *\nDisallow: /anteprima/\n');
  console.log('OK  avviso in radice, sito completo in /anteprima/');
} else if (NOINDEX) {
  writeFileSync(join(siteRoot, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
} else {
  writeFileSync(join(siteRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${PUBLIC_URL}sitemap.xml\n`);
  writeFileSync(join(siteRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
}
writeFileSync(join(siteRoot, '.nojekyll'), '');
if (!host.endsWith('.github.io')) writeFileSync(join(siteRoot, 'CNAME'), host + '\n');
console.log('OK  robots.txt e CNAME');
