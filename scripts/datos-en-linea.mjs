// Datos reales de internet para cada especie: resumen de Wikipedia (español si
// existe), taxonomía, nombres comunes, estado de conservación y número de
// registros en el mundo y en Colombia (GBIF). Guarda en www/datos/en-linea.json.
//   node scripts/datos-en-linea.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { ESPECIES } from '../www/js/especies.js';

const UA = 'KodamaBonsai/0.1 (app personal de cuidado de bonsai)';
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
async function json(url) {
  for (let i = 0; i < 4; i++) {
    try {
      await pausa(400);
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      await pausa(2500 * (i + 1));
    }
  }
  return null;
}
const sinTildes = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const base = (c) => c.replace(/["“”].*$/, '').replace(/\(.*?\)/g, '').split('/')[0].trim().split(' ').slice(0, 2).join(' ');

// Wikipedia: el resumen sirve solo si de verdad es de esta especie (no un redireccionamiento a otra).
async function wiki(nombre) {
  for (const lang of ['es', 'en']) {
    const d = await json(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nombre.replace(/ /g, '_'))}`);
    if (d?.extract && sinTildes(d.title).includes(sinTildes(nombre.split(' ')[1] || nombre)) && d.type !== 'disambiguation')
      return { lang, titulo: d.title, extracto: d.extract, url: d.content_urls?.desktop?.page, imagen: d.thumbnail?.source || null };
  }
  return null;
}

async function gbif(nombre) {
  const m = await json(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(nombre)}`);
  if (!m?.usageKey || m.matchType === 'NONE') return null;
  const clave = m.acceptedUsageKey || m.usageKey;
  const [vern, iucn, mundo, co] = await Promise.all([
    json(`https://api.gbif.org/v1/species/${clave}/vernacularNames?limit=200`),
    json(`https://api.gbif.org/v1/species/${clave}/iucnRedListCategory`),
    json(`https://api.gbif.org/v1/occurrence/search?taxonKey=${clave}&limit=0`),
    json(`https://api.gbif.org/v1/occurrence/search?taxonKey=${clave}&country=CO&limit=0`),
  ]);
  const nombres = [...new Set((vern?.results || []).filter((v) => v.language === 'spa').map((v) => v.vernacularName.trim()))].slice(0, 8);
  return {
    clave,
    url: `https://www.gbif.org/species/${clave}`,
    taxonomia: { reino: m.kingdom, filo: m.phylum, clase: m.class, orden: m.order, familia: m.family, genero: m.genus, especie: m.species || m.canonicalName },
    nombresEs: nombres,
    iucn: iucn?.category || null,
    registros: mundo?.count ?? null,
    registrosColombia: co?.count ?? null,
  };
}

// Guías de cuidado de Bonsai Empire: solo se guardan las que existen.
const SLUG = {
  'ficus-retusa': 'ficus', 'ficus-benjamina': 'ficus', carmona: 'fukien-tea', portulacaria: 'dwarf-jade', serissa: 'serissa',
  schefflera: 'schefflera', murraya: 'murraya', buganvilla: 'bougainvillea', 'olmo-chino': 'chinese-elm', 'arce-japones': 'japanese-maple',
  'arce-tridente': 'trident-maple', 'junipero-procumbens': 'juniper', 'junipero-chinensis': 'juniper', 'pino-negro': 'japanese-black-pine',
  'pino-patula': 'pine', azalea: 'azalea', olivo: 'olive', jade: 'jade', granado: 'pomegranate', pyracantha: 'firethorn',
  cotoneaster: 'cotoneaster', ginkgo: 'ginkgo', podocarpus: 'podocarpus', sageretia: 'sageretia', zelkova: 'zelkova',
};
async function existe(url) {
  for (let i = 0; i < 3; i++) {
    try {
      await pausa(500);
      const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (r.status === 404) return null;
      const html = await r.text();
      const titulo = (html.match(/<title>([^<]*)/i) || [])[1] || '';
      if (r.ok && !/not found|oops/i.test(titulo)) return r.url;
      return null;
    } catch {
      await pausa(2500 * (i + 1));
    }
  }
  return null;
}

const salida = { generado: new Date().toISOString(), especies: {} };
for (const e of ESPECIES) {
  const nombre = base(e.cientifico);
  const [w, g] = [await wiki(nombre), await gbif(nombre)];
  const guia = SLUG[e.id] ? await existe(`https://www.bonsaiempire.com/tree-species/${SLUG[e.id]}`) : null;
  salida.especies[e.id] = { nombre, wikipedia: w, gbif: g, guias: guia ? [{ titulo: 'Guía de cuidado (Bonsai Empire, inglés)', url: guia }] : [] };
  console.log(`${e.id}: wiki ${w ? w.lang : '—'} · gbif ${g ? `${g.registros} registros, ${g.registrosColombia} en Colombia` : '—'} · guía ${guia ? 'sí' : 'no'}`);
}
mkdirSync(new URL('../www/datos/', import.meta.url), { recursive: true });
writeFileSync(new URL('../www/datos/en-linea.json', import.meta.url), JSON.stringify(salida, null, 1));
console.log('Listo.');
