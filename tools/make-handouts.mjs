#!/usr/bin/env node
/* Class PDFs: renders the HTML slide decks to two study handouts,
     slides/machine_learning_class_ppt.pdf   (slides/machine_learning/NN_*.html, in order)
     slides/neural_networks_class_ppt.pdf    (slides/neural_networks/NN_*.html, in order)
   A4 portrait, two slides per page with blank space under each slide for notes. Every .step is revealed and every
   scripted widget (data-auto) is left on its last step, so the PDF carries the full derivations and the captions that
   quote the widget readouts. Page numbers run through the whole PDF; bookmarks list each deck and each slide.

   Needs the dependencies in tools/package.json (cd tools && npm ci) and a Chrome that can run headless. On the
   author's machine the system Chrome hangs (managed policies): point CHROME_PATH at a Chrome for Testing. The decks
   load MathJax from a CDN, so the machine must be online.

     CHROME_PATH=/path/to/chrome node tools/make-handouts.mjs [--out DIR] [deck.html ...]

   --out DIR     where the PDFs go (default: slides/)
   deck.html...  build only these decks (one PDF per parent folder, same file name), for quick checks */
import {createRequire} from 'node:module';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const {PDFDocument, PDFName, PDFHexString, StandardFonts, rgb} = require('pdf-lib');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* the decks' relative links (notes, index pages) would print as file:// paths of the build machine: aim them here */
const SITE = 'https://imagra93.github.io/ML-course-labs/';

const PARTS = {
  machine_learning: {course: 'Machine learning', title: 'Machine learning – class slides'},
  neural_networks: {course: 'Neural networks', title: 'Neural networks – class slides'},
};

/* A4 portrait. The slide is SLIDE_W wide; the rest of the 210 mm is the side margins. Two items must fit in the
   content height: 2 * (SLIDE_W * 9/16 + NOTES_H) + SHEET_GAP <= 297 - top - bottom margins. */
const SLIDE_W = 170, NOTES_H = 34.5, SHEET_GAP = 3;
const MARGIN = {top: 15, bottom: 14}, SIDE = (210 - SLIDE_W) / 2;

const argv = process.argv.slice(2);
let outDir = path.join(root, 'slides');
const given = [];
for (let i = 0; i < argv.length; i++) argv[i] === '--out' ? (outDir = path.resolve(argv[++i])) : given.push(path.resolve(argv[i]));

const byPart = {};
if (given.length) {
  for (const f of given) (byPart[path.basename(path.dirname(f))] ||= []).push(f);
} else {
  for (const part of Object.keys(PARTS)) {
    const dir = path.join(root, 'slides', part);
    byPart[part] = fs.readdirSync(dir).sort().filter(f => /^\d\d_.*\.html$/.test(f)).map(f => path.join(dir, f));
  }
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const name of ['google-chrome-stable', 'google-chrome', 'chromium', 'chromium-browser']) {
    try { return execFileSync('which', [name], {encoding: 'utf8'}).trim(); } catch { /* next */ }
  }
  console.error('No Chrome found: set CHROME_PATH to a headless-capable Chrome (Chrome for Testing).');
  process.exit(1);
}

const CSS = `
@page{size:A4;margin:${MARGIN.top}mm ${SIDE}mm ${MARGIN.bottom}mm}
*{-webkit-print-color-adjust:exact;print-color-adjust:exact}
html,body{height:auto!important;overflow:visible!important;background:#fff!important}
body{margin:0!important;padding:0!important}
#bar{display:none!important}
#viewport{position:static!important;display:block!important;overflow:visible!important}
#stage{width:auto!important;height:auto!important;transform:none!important;display:block!important}
.hsheet{display:flex;flex-direction:column;gap:${SHEET_GAP}mm;break-after:page}
.hsheet:last-child{break-after:auto}
.hitem{break-inside:avoid}
.hitem .slide{position:relative!important;inset:auto!important;width:1280px;height:720px;visibility:visible!important;opacity:1!important;
  transition:none!important;box-shadow:none!important;zoom:${SLIDE_W * 96 / 25.4 / 1280};outline:3px solid #9a9a9a;outline-offset:-3px}
.step,.demo-cap{transition:none!important}
/* MathJax draws glyphs as stroke-width="0" groups; Skia exports that as a hairline stroke and viewers thicken it to 1 px */
mjx-container svg g[stroke-width="0"]{stroke:none!important}
.cover .go{display:none}  /* "Press → to continue": web navigation hint */
.hnotes{height:${NOTES_H}mm}`;

const chrome = findChrome();
const browser = await puppeteer.launch({
  executablePath: chrome, headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking'],
});

/* One deck -> {pdf: Buffer, label, slides: [title, ...]} */
async function renderDeck(file, course) {
  const page = await browser.newPage();
  try {
    await page.setViewport({width: 1280, height: 720});
    /* the decks switch to a stacked phone layout below 760 px, and the print width is below that: pin the query off */
    await page.evaluateOnNewDocument(() => {
      const mm = window.matchMedia.bind(window);
      window.matchMedia = q => /max-width:\s*760px/.test(q)
        ? {matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}} : mm(q);
      window.addEventListener('resize', e => e.stopImmediatePropagation(), true);
    });
    page.on('pageerror', e => console.error('  page error:', e.message));
    await page.goto('about:blank');
    await page.goto(pathToFileURL(file).href, {waitUntil: 'networkidle0'});
    await page.waitForFunction('window.MathJax && MathJax.startup && MathJax.startup.promise && window.DECK', {timeout: 60000});
    await page.evaluate(() => MathJax.startup.promise);
    const slides = await page.evaluate(() => {
      for (let i = 0; i < DECK.slides; i++) DECK.go(i, true);
      const stage = document.getElementById('stage');
      const all = [...stage.querySelectorAll(':scope > .slide')];
      const titles = all.map((s, i) => {
        const h = s.querySelector('h2, h1');
        return (h ? h.textContent.replace(/\s+/g, ' ').trim() : '') || 'Slide ' + (i + 1);
      });
      const el = cls => Object.assign(document.createElement('div'), {className: cls});
      for (let i = 0; i < all.length; i += 2) {
        const sheet = el('hsheet');
        for (const s of all.slice(i, i + 2)) {
          const item = el('hitem');
          item.append(s, el('hnotes')); sheet.appendChild(item);
        }
        stage.appendChild(sheet);
      }
      document.body.classList.remove('flow');
      return titles;
    });
    await page.evaluate((base, site) => {
      for (const a of document.querySelectorAll('a[href]')) if (a.href.startsWith(base)) a.href = site + a.href.slice(base.length);
    }, pathToFileURL(root + path.sep).href, SITE);
    await page.addStyleTag({content: CSS});
    await page.evaluate(() => document.fonts.ready);
    const label = await page.evaluate(() => document.body.dataset.deck || document.title);
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const bar = 'font-size:8px;color:#777;width:100%;padding:0 ' + SIDE + 'mm;display:flex;font-family:Arial,sans-serif;';
    const pdf = await page.pdf({
      preferCSSPageSize: true, printBackground: true, displayHeaderFooter: true,
      headerTemplate: `<div style="${bar}justify-content:space-between"><span>${course} – ${esc(label)}</span><span>${slides.length} slides</span></div>`,
      footerTemplate: '<div></div>',  /* page numbers are drawn after merging, so they run through the whole PDF */
    });
    return {pdf: Buffer.from(pdf), label, slides};
  } finally {
    await page.close();
  }
}

/* PDF outline: one entry per deck, with one child per slide (pointing at the page that holds it) */
function addOutline(doc, decks) {
  const ctx = doc.context;
  const dest = pageIndex => ctx.obj([doc.getPage(pageIndex).ref, PDFName.of('XYZ'), null, null, null]);
  const node = (title, parent, pageIndex) => ({
    ref: ctx.nextRef(), kids: [],
    dict: ctx.obj({Title: PDFHexString.fromText(title), Parent: parent, Dest: dest(pageIndex)}),
  });
  const link = nodes => nodes.forEach((n, i) => {
    if (i > 0) n.dict.set(PDFName.of('Prev'), nodes[i - 1].ref);
    if (i < nodes.length - 1) n.dict.set(PDFName.of('Next'), nodes[i + 1].ref);
    if (n.kids.length) {
      n.dict.set(PDFName.of('First'), n.kids[0].ref);
      n.dict.set(PDFName.of('Last'), n.kids.at(-1).ref);
      n.dict.set(PDFName.of('Count'), ctx.obj(n.kids.length));
      link(n.kids);
    }
    ctx.assign(n.ref, n.dict);
  });
  const outlines = ctx.nextRef();
  const top = decks.map(d => {
    const n = node(d.label, outlines, d.firstPage);
    n.kids = d.slides.map((t, i) => node(`${i + 1}. ${t}`, n.ref, d.firstPage + Math.floor(i / 2)));
    return n;
  });
  link(top);
  ctx.assign(outlines, ctx.obj({Type: 'Outlines', First: top[0].ref, Last: top.at(-1).ref, Count: top.length}));
  doc.catalog.set(PDFName.of('Outlines'), outlines);
  doc.catalog.set(PDFName.of('PageMode'), PDFName.of('UseOutlines'));
}

async function buildPart(part, files) {
  const info = PARTS[part] || {course: part, title: part};
  const doc = await PDFDocument.create({updateMetadata: false});
  const decks = [];
  for (const file of files) {
    const d = await renderDeck(file, info.course);
    const src = await PDFDocument.load(d.pdf);
    const firstPage = doc.getPageCount();
    (await doc.copyPages(src, src.getPageIndices())).forEach(p => doc.addPage(p));
    const pages = doc.getPageCount() - firstPage;
    if (pages !== Math.ceil(d.slides.length / 2)) throw new Error(`${file}: ${pages} pages for ${d.slides.length} slides`);
    decks.push({label: d.label, slides: d.slides, firstPage});
    console.log(`  ${path.relative(root, file)}: ${d.slides.length} slides, ${pages} pages`);
  }
  const font = await doc.embedFont(StandardFonts.Helvetica), total = doc.getPageCount();
  doc.getPages().forEach((p, i) => {
    const text = `${i + 1} / ${total}`, size = 8;
    p.drawText(text, {x: (p.getWidth() - font.widthOfTextAtSize(text, size)) / 2, y: 24, size, font, color: rgb(0.47, 0.47, 0.47)});
  });
  addOutline(doc, decks);
  /* fixed metadata, so an unchanged deck gives a byte-identical PDF (no pointless commits in the publish pipeline) */
  doc.setTitle(info.title); doc.setCreator('tools/make-handouts.mjs'); doc.setProducer('pdf-lib + Chrome');
  doc.setCreationDate(new Date(0)); doc.setModificationDate(new Date(0));
  const out = path.join(outDir, `${part}_class_ppt.pdf`);
  fs.mkdirSync(outDir, {recursive: true});
  fs.writeFileSync(out, await doc.save({useObjectStreams: false}));
  console.log(`${path.relative(root, out)} — ${decks.reduce((n, d) => n + d.slides.length, 0)} slides, ${total} pages, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB`);
}

try {
  for (const [part, files] of Object.entries(byPart)) await buildPart(part, files);
} finally {
  await browser.close();
}
