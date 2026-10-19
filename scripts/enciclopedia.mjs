// Reúne fotos y videos reales de Wikimedia Commons para la enciclopedia:
// por especie (bonsáis, hojas, árbol en la naturaleza), por estilo y por técnica.
// Guarda solo los datos (enlace, tamaño, autor, licencia) en www/datos/fotos.json;
// las imágenes se cargan desde Wikimedia al verlas.
//   node scripts/enciclopedia.mjs
// Las fotos que no sirven se excluyen en scripts/fotos-excluir.json (por título).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { ESPECIES } from '../www/js/especies.js';
import { ESTILOS } from '../www/js/guia.js';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'KodamaBonsai/0.1 (app personal de cuidado de bonsai)';
const excluidas = existsSync(new URL('./fotos-excluir.json', import.meta.url)) ? JSON.parse(readFileSync(new URL('./fotos-excluir.json', import.meta.url), 'utf8')) : [];
const excluir = { has: (t) => excluidas.some((x) => t.includes(x)) };
const vale = (f) => !excluir.has(f.archivo);
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const limpiar = (html) => String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function buscar(consulta, { limite = 8, video = false } = {}) {
  const p = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: String(limite),
    gsrsearch: video ? `${consulta} filetype:video` : `${consulta} filetype:bitmap`,
    prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: video ? '640' : '720',
  });
  for (let intento = 0; intento < 5; intento++) {
    try {
      await pausa(900);
      const r = await fetch(`${API}?${p}`, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      const paginas = Object.values(d.query?.pages || {}).sort((a, b) => a.index - b.index);
      return paginas
        .map((pg) => {
          const ii = pg.imageinfo?.[0];
          if (!ii || excluir.has(pg.title)) return null;
          const m = ii.extmetadata || {};
          return {
            titulo: pg.title.replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' '),
            archivo: pg.title,
            src: ii.thumburl || ii.url,
            video: video ? ii.url : undefined,
            ancho: ii.thumbwidth || ii.width,
            alto: ii.thumbheight || ii.height,
            autor: limpiar(m.Artist?.value).slice(0, 80) || 'Desconocido',
            licencia: limpiar(m.LicenseShortName?.value) || '',
            pagina: ii.descriptionurl,
          };
        })
        .filter((x) => x && (video || /jpe?g|png|webp/i.test(x.src)));
    } catch (e) {
      console.warn(`  reintento ${intento + 1} (${consulta}): ${e.message}`);
      await pausa(4000 * (intento + 1));
    }
  }
  return [];
}

const base = (c) => c.replace(/["“”].*$/, '').replace(/\(.*?\)/g, '').split('/')[0].trim().split(' ').slice(0, 2).join(' ');
const sinRepetir = (lista, vistos) => lista.filter((x) => !vistos.has(x.archivo) && vistos.add(x.archivo));

const RUTA = new URL('../www/datos/fotos.json', import.meta.url);
const previo = existsSync(RUTA) ? JSON.parse(readFileSync(RUTA, 'utf8')) : {};
const todo = process.argv.includes('--todo');
const salida = { generado: new Date().toISOString(), especies: {}, estilos: {}, tecnicas: {}, videos: [] };
const ya = (x) => !todo && x && (Array.isArray(x) ? x.length : Object.values(x).some((l) => l.length >= 2));

for (const e of ESPECIES) {
  const p0 = previo.especies?.[e.id];
  if (ya(p0) && p0.bonsai.length && p0.hojas.length && p0.natural.length) { salida.especies[e.id] = p0; continue; }
  const nombre = base(e.cientifico);
  const vistos = new Set();
  const genero = nombre.split(' ')[0];
  let bonsai = sinRepetir(await buscar(`${nombre} bonsai`, { limite: 10 }), vistos).filter((x) => /bonsai|penjing|bonsái/i.test(x.titulo + x.archivo));
  if (bonsai.length < 3) bonsai.push(...sinRepetir(await buscar(`${genero} bonsai`, { limite: 10 }), vistos).filter((x) => /bonsai|penjing|bonsái/i.test(x.titulo + x.archivo)));
  await pausa(300);
  let hojas = sinRepetir(await buscar(`${nombre} ${e.grupo === 'conifera' ? 'foliage' : 'leaves'}`, { limite: 8 }), vistos).filter((x) => !/bonsai/i.test(x.titulo));
  if (hojas.length < 2) hojas.push(...sinRepetir(await buscar(`${nombre} ${e.grupo === 'conifera' ? 'needles' : 'leaf'}`, { limite: 8 }), vistos).filter((x) => !/bonsai/i.test(x.titulo)));
  await pausa(300);
  const natural = sinRepetir(await buscar(`${nombre}`, { limite: 10 }), vistos).filter((x) => !/bonsai|herbarium|herbario|specimen|illustration|drawing|map/i.test(x.titulo));
  if (hojas.length < 2) hojas.push(...sinRepetir(await buscar(`${nombre} close up`, { limite: 8 }), vistos).filter((x) => !/bonsai/i.test(x.titulo)));
  salida.especies[e.id] = { bonsai: bonsai.slice(0, 5), hojas: hojas.slice(0, 3), natural: natural.slice(0, 3) };
  console.log(`${e.id}: ${bonsai.length} bonsái, ${hojas.length} hojas, ${natural.length} naturaleza`);
  await pausa(300);
}

const CONSULTA_ESTILO = {
  chokkan: 'formal upright bonsai', moyogi: 'informal upright bonsai', shakan: 'slanting bonsai', kengai: 'cascade bonsai',
  'han-kengai': 'semi-cascade bonsai', bunjingi: 'literati bonsai', hokidachi: 'broom style bonsai', fukinagashi: 'windswept bonsai',
  sokan: 'twin trunk bonsai', kabudachi: 'multi trunk bonsai', 'yose-ue': 'bonsai forest planting', neagari: 'exposed root bonsai',
  sekijoju: 'root over rock bonsai', shidare: 'weeping bonsai', tachiki: 'bonsai tree museum',
};
for (const id of Object.keys(ESTILOS)) {
  if (ya(previo.estilos?.[id])) { salida.estilos[id] = previo.estilos[id]; continue; }
  salida.estilos[id] = (await buscar(CONSULTA_ESTILO[id] || `${id} bonsai`, { limite: 6 })).filter((x) => /bonsai|penjing/i.test(x.titulo + x.archivo)).slice(0, 3);
  await pausa(300);
}

const CONSULTA_TECNICA = {
  estructural: 'bonsai pruning', mantenimiento: 'bonsai trimming', pinzado: 'juniper bonsai',
  alambrado: 'bonsai wire', defoliado: 'bonsai maple leaves', jin: 'bonsai deadwood', trasplante: 'bonsai repotting roots',
};
for (const [id, q] of Object.entries(CONSULTA_TECNICA)) {
  if (ya(previo.tecnicas?.[id])) { salida.tecnicas[id] = previo.tecnicas[id]; continue; }
  salida.tecnicas[id] = (await buscar(q, { limite: 6 })).slice(0, 3);
  await pausa(300);
}

const vistosV = new Set();
if (ya(previo.videos?.filter((v) => !/framework|diabetes/i.test(v.titulo)))) salida.videos = previo.videos.filter((v) => !/framework|diabetes/i.test(v.titulo));
else
for (const q of ['bonsai', 'bonsai pruning', 'bonsai wiring', 'bonsai juniper']) {
  if (salida.videos.length >= 8) break;
  salida.videos.push(...sinRepetir(await buscar(q, { limite: 10, video: true }), vistosV).filter((v) => /bons[aá]i|bonsaj|carmona|penjing|juniper/i.test(v.titulo) && !/framework|data|diabetes|EHR/i.test(v.titulo)));
  await pausa(300);
}
salida.videos = salida.videos.slice(0, 8);

// Limpieza final: fuera las excluidas; los estilos solo si el título nombra el estilo;
// de las técnicas solo las que de verdad muestran la técnica.
for (const x of Object.values(salida.especies)) for (const k of ['bonsai', 'hojas', 'natural']) x[k] = x[k].filter(vale);
const ESTILO_RE = {
  chokkan: /formal upright|chokkan/i, moyogi: /informal upright|moyogi/i, shakan: /slant|shakan/i, kengai: /(?<!semi[- ])cascade|kengai/i,
  'han-kengai': /semi.?cascade|han.?kengai/i, bunjingi: /literati|bunjin/i, hokidachi: /broom|hokidachi/i, fukinagashi: /windswept|fukinagashi/i,
  sokan: /twin|double trunk|sokan/i, kabudachi: /multi|clump|kabudachi/i, 'yose-ue': /forest|yose|goshin/i, neagari: /exposed root|neagari/i,
  sekijoju: /root over rock|rock|sekijoju|ishitsuki/i, shidare: /weeping|shidare/i, tachiki: /./,
};
for (const [id, l] of Object.entries(salida.estilos)) salida.estilos[id] = l.filter((f) => vale(f) && ESTILO_RE[id]?.test(f.titulo));
const TECNICA_RE = { alambrado: /wire scar|wiring|wired/i, pinzado: /goshin|juniper/i, jin: /jin|deadwood|shari/i, trasplante: /repot|root/i, defoliado: /defoliat/i, estructural: /bonsai.*prun|prun.*bonsai/i, mantenimiento: /bonsai.*(trim|prun)/i };
for (const [id, l] of Object.entries(salida.tecnicas)) salida.tecnicas[id] = l.filter((f) => vale(f) && TECNICA_RE[id]?.test(f.titulo));
salida.videos = salida.videos.filter(vale);

mkdirSync(new URL('../www/datos/', import.meta.url), { recursive: true });
writeFileSync(RUTA, JSON.stringify(salida, null, 1));
console.log(`\nListo: ${Object.values(salida.especies).reduce((n, x) => n + x.bonsai.length + x.hojas.length + x.natural.length, 0)} fotos de especies, ${salida.videos.length} videos.`);
