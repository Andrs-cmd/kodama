// Enciclopedia: especies con fotos reales (Wikimedia Commons), ficha botánica,
// cuidados, videos; técnicas con lecciones animadas; estilos con ejemplos reales.
import { ESPECIES, POR_ID, GRUPOS } from './especies.js';
import { ESTILOS, TECNICAS } from './guia.js';
import { BOTANICA, ICONOS_FICHA, ETIQUETAS_FICHA } from './botanica.js';
import { arbolSVG } from './arbol.js';
import { kodamaSVG } from './kodama.js';
import { htmlFicha } from './analisis.js';
import { textoFrecuencia } from './riego.js';
import { LECCIONES_TECNICA, abrirLeccionTecnica } from './lecciones.js';
import { FLUJOS, abrirHoja } from './flujos.js';
import * as A from './almacen.js';
import { sonidos } from './sonido.js';
import { norm } from './cerebro.js';
import { htmlGuia, enlazarGuia } from './guia-vista.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const corto = (e) => e.nombre.split(' (')[0];
const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const wiki = (q) => `https://es.wikipedia.org/wiki/Especial:Buscar?search=${encodeURIComponent(q)}`;

let FOTOS = { especies: {}, estilos: {}, tecnicas: {}, videos: [] };
export async function cargarFotos() {
  try {
    FOTOS = await (await fetch('datos/fotos.json')).json();
  } catch {}
  return FOTOS;
}
const epiteto = (e) => norm(e.cientifico).split(' ')[1] || '';
// Todas las fotos de una especie, con su etiqueta.
export function galeria(id) {
  const f = FOTOS.especies[id];
  const e = POR_ID[id];
  if (!f) return [];
  const mismaEspecie = (x) => norm(x.titulo).includes(epiteto(e)) || norm(x.titulo).includes(norm(corto(e)));
  const hojas = f.hojas.length ? f.hojas : f.natural.slice(0, 1);
  return [
    ...f.bonsai.map((x) => ({ ...x, tipo: mismaEspecie(x) ? 'Bonsái' : `Bonsái del mismo género` })),
    ...hojas.map((x) => ({ ...x, tipo: f.hojas.length ? 'Hojas' : 'Follaje' })),
    ...f.natural.filter((x) => !hojas.includes(x)).map((x) => ({ ...x, tipo: 'En la naturaleza' })),
  ];
}
// Portada: un bonsái completo antes que acercamientos de vivero.
export const portada = (id) => {
  const f = FOTOS.especies[id];
  if (!f) return null;
  return f.bonsai.find((x) => !/^starr|home depot|nursery|seedling/i.test(x.titulo)) || f.bonsai[0] || f.natural[0] || null;
};
const imgHTML = (f, { clase = '', grupo = 'conifera', perezosa = true } = {}) =>
  f ? `<img class="foto ${clase}" src="${f.src}" alt="${esc(f.titulo)}" ${perezosa ? 'loading="lazy"' : ''} decoding="async" onload="this.classList.add('lista')" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'foto-alterna',innerHTML:this.dataset.alt||''}))" data-alt="${esc(arbolSVG({ grupo, clase: 'mini' }))}">`
    : `<span class="foto-alterna">${arbolSVG({ grupo, clase: 'mini' })}</span>`;
export const fotoEspecie = (id, op) => imgHTML(portada(id), { grupo: POR_ID[id]?.grupo, ...op });

// ---------------- Visor de fotos a pantalla completa ----------------
export function abrirVisor(lista, inicio = 0) {
  if (!lista.length) return;
  let i = inicio;
  const v = document.createElement('div');
  v.className = 'visor-fotos';
  v.innerHTML = `<button class="icono-boton v-cerrar" aria-label="Cerrar"><svg><use href="#ico-cerrar"/></svg></button>
    <button class="v-nav v-ant" aria-label="Anterior"><svg><use href="#ico-volver"/></svg></button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="v-nav v-sig" aria-label="Siguiente"><svg><use href="#ico-volver"/></svg></button>`;
  document.body.appendChild(v);
  document.body.classList.add('con-hoja');
  const img = $('img', v);
  const pintar = (dir = 0) => {
    const f = lista[i];
    img.classList.remove('lista');
    img.style.setProperty('--dir', dir);
    img.src = f.src.replace(/\/\d+px-/, '/1280px-');
    img.onerror = () => (img.src = f.src);
    img.onload = () => img.classList.add('lista');
    $('figcaption', v).innerHTML = `<b>${esc(f.tipo || '')}</b> ${esc(f.titulo)}<br><small>Foto: ${esc(f.autor)} · ${esc(f.licencia)} · <a href="${f.pagina}" target="_blank" rel="noopener">Wikimedia Commons</a> · ${i + 1}/${lista.length}</small>`;
  };
  const mover = (d) => { i = (i + d + lista.length) % lista.length; sonidos.pop(); pintar(d); };
  const cerrar = () => { v.classList.add('cerrando'); document.body.classList.remove('con-hoja'); setTimeout(() => v.remove(), 250); document.removeEventListener('keydown', tecla); };
  const tecla = (e) => (e.key === 'Escape' ? cerrar() : e.key === 'ArrowRight' ? mover(1) : e.key === 'ArrowLeft' ? mover(-1) : 0);
  document.addEventListener('keydown', tecla);
  $('.v-cerrar', v).onclick = cerrar;
  $('.v-ant', v).onclick = () => mover(-1);
  $('.v-sig', v).onclick = () => mover(1);
  let x0 = null;
  v.addEventListener('pointerdown', (e) => (x0 = e.clientX));
  v.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) mover(e.clientX < x0 ? 1 : -1); x0 = null; });
  v.addEventListener('click', (e) => e.target === v && cerrar());
  pintar();
}

// ---------------- Vista principal ----------------
let pestana = 'especies';
let filtro = '';
let grupoFiltro = '';

export function pintarEnciclopedia(cont) {
  cont.innerHTML = `
    <h2 class="titulo-grande">Enciclopedia</h2>
    <p class="bajada">Especies con fotos reales, técnicas animadas paso a paso, estilos y videos.</p>
    <input class="buscador" type="search" placeholder="Buscar especie, técnica o estilo…" value="${esc(filtro)}" aria-label="Buscar en la enciclopedia">
    <div class="pestanas" role="tablist">
      ${[['especies', 'Especies'], ['tecnicas', 'Técnicas'], ['estilos', 'Estilos'], ['videos', 'Videos']].map(([id, t]) => `<button role="tab" data-p="${id}" aria-selected="${id === pestana}">${t}</button>`).join('')}
      <i class="indicador"></i>
    </div>
    <div class="enc-cuerpo"></div>`;
  const cuerpo = $('.enc-cuerpo', cont);
  const moverIndicador = () => {
    const b = $(`[data-p="${pestana}"]`, cont);
    const ind = $('.indicador', cont);
    ind.style.width = `${b.offsetWidth}px`;
    ind.style.transform = `translateX(${b.offsetLeft}px)`;
  };
  const pintarPestana = () => {
    $$('[role="tab"]', cont).forEach((b) => b.setAttribute('aria-selected', b.dataset.p === pestana));
    moverIndicador();
    cuerpo.classList.remove('entra');
    void cuerpo.offsetWidth;
    cuerpo.classList.add('entra');
    ({ especies: pintarEspecies, tecnicas: pintarTecnicas, estilos: pintarEstilos, videos: pintarVideos })[pestana](cuerpo, cont);
  };
  $$('[role="tab"]', cont).forEach((b) => (b.onclick = () => { pestana = b.dataset.p; sonidos.pop(); pintarPestana(); }));
  $('.buscador', cont).addEventListener('input', (e) => {
    filtro = e.target.value;
    if (filtro && pestana === 'videos') pestana = 'especies';
    pintarPestana();
  });
  requestAnimationFrame(moverIndicador);
  pintarPestana();
}

const coincide = (...t) => !filtro || t.some((x) => norm(x).includes(norm(filtro)));

function pintarEspecies(cuerpo, cont) {
  const mia = A.especieDe(A.activo())?.id;
  const lista = ESPECIES.filter((e) => (!grupoFiltro || e.grupo === grupoFiltro) && coincide(e.nombre, e.cientifico, ...e.otros, BOTANICA[e.id]?.familia || ''))
    .sort((a, b) => Number(b.id === mia) - Number(a.id === mia));
  cuerpo.innerHTML = `
    <div class="filtros-grupo">${[['', 'Todas'], ...Object.entries(GRUPOS)].map(([g, t]) => `<button class="chip ${g === grupoFiltro ? 'activo' : ''}" data-g="${g}">${t}</button>`).join('')}</div>
    <div class="rejilla-fichas">${lista.map((e, i) => `
      <button class="ficha-especie" data-id="${e.id}" style="--i:${i}">
        <span class="ficha-foto">${fotoEspecie(e.id)}${e.id === mia ? '<span class="sello-mio">Tu árbol</span>' : ''}</span>
        <span class="ficha-txt"><strong>${esc(corto(e))}</strong><i>${esc(e.cientifico)}</i>
        <span class="ficha-meta">${esc(GRUPOS[e.grupo])} · <span class="dificultad">${'●'.repeat(e.dificultad)}${'○'.repeat(3 - e.dificultad)}</span></span></span>
      </button>`).join('') || '<p class="vacio">No encontré nada con ese nombre.</p>'}</div>`;
  $$('[data-g]', cuerpo).forEach((b) => (b.onclick = () => { grupoFiltro = b.dataset.g; pintarEspecies(cuerpo, cont); }));
  $$('.ficha-especie', cuerpo).forEach((b) => (b.onclick = () => abrirEspecie(b.dataset.id, cont)));
}

export function abrirEspecie(id, cont) {
  pestana = 'especies';
  const e = POR_ID[id];
  const B = BOTANICA[id] || {};
  const fotos = galeria(id);
  const mia = A.especieDe(A.activo())?.id === id;
  const conifera = e.grupo === 'conifera';
  const videos = FOTOS.videos.filter((v) => norm(v.titulo).includes(norm(corto(e)).split(' ')[0]) || norm(v.titulo).includes(norm(e.cientifico).split(' ')[0]));
  const hojas = fotos.filter((f) => f.tipo === 'Hojas' || f.tipo === 'Follaje');
  const abrir = () => {
    cont.innerHTML = `
      <button class="boton texto volver" data-volver><svg><use href="#ico-volver"/></svg>Enciclopedia</button>
      <div class="galeria">
        <div class="galeria-pista">${fotos.length ? fotos.map((f, i) => `<figure data-i="${i}">${imgHTML(f, { grupo: e.grupo, perezosa: i > 1 })}<figcaption><span class="etq-foto">${esc(f.tipo)}</span></figcaption></figure>`).join('') : `<figure>${arbolSVG({ grupo: e.grupo })}</figure>`}</div>
        <div class="galeria-puntos">${fotos.map((_, i) => `<i class="${i ? '' : 'activo'}"></i>`).join('')}</div>
      </div>
      <header class="enc-cabeza">
        <h2 class="titulo-grande">${esc(e.nombre)}</h2>
        <p class="cientifico">${esc(e.cientifico)} · ${esc(B.familia || '')}</p>
        ${mia ? '<span class="sello-mio grande">Es tu árbol</span>' : ''}
        <div class="datos-rapidos">
          <span><b>${'●'.repeat(e.dificultad)}${'○'.repeat(3 - e.dificultad)}</b>Dificultad</span>
          <span><b>${e.ubicacion === 'interior' ? 'Adentro' : e.ubicacion === 'exterior' ? 'Afuera' : 'Ambos'}</b>Dónde vive</span>
          <span><b>${esc(textoFrecuencia(e.riego.dias))}</b>Riego base</span>
        </div>
      </header>
      ${B.curiosidad ? `<div class="sabias"><span class="sabias-k">${kodamaSVG(A.kodama(), { expresion: 'sorpresa', clase: 'mini' })}</span><p><b>¿Sabías que…?</b> ${esc(B.curiosidad)}</p></div>` : ''}
      <h3 class="titulo-medio">Ficha botánica</h3>
      <div class="datos-b">${Object.keys(ETIQUETAS_FICHA).filter((k) => B[k]).map((k, i) => `<div class="dato-b" style="--i:${i}"><span class="dato-ic">${ICONOS_FICHA[k]}</span><small>${ETIQUETAS_FICHA[k]}</small><p>${esc(B[k])}</p></div>`).join('')}</div>
      <h3 class="titulo-medio">Cómo reconocerla</h3>
      <div class="reconocer">
        <ul class="rasgos">${e.rasgos.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        ${hojas.length ? `<div class="mini-galeria">${hojas.slice(0, 2).map((f) => `<button data-foto="${fotos.indexOf(f)}">${imgHTML(f, { grupo: e.grupo })}<span>${esc(f.tipo)}</span></button>`).join('')}</div>` : ''}
      </div>
      ${htmlGuia(id, { clima: A.activo()?.condiciones?.clima || 'frio' })}
      <h3 class="titulo-medio">Aprende haciendo</h3>
      <div class="rejilla-lecciones">
        <button class="leccion" data-flujo="regar" style="--i:0"><span class="burbuja-ic"><svg><use href="#ico-gota"/></svg></span><strong>Regar</strong><small>${esc(e.riego.nota)}</small></button>
        <button class="leccion" data-flujo="pinzar" style="--i:1"><span class="burbuja-ic"><svg><use href="#ico-tijera"/></svg></span><strong>${conifera ? 'Pinzar' : 'Podar'}</strong><small>${esc(e.poda.epoca)}</small></button>
        <button class="leccion" data-flujo="alambrar" style="--i:2"><span class="burbuja-ic"><svg><use href="#ico-alambre"/></svg></span><strong>Alambrar</strong><small>${esc(e.alambrado.epoca)}</small></button>
        <button class="leccion" data-tec="${conifera ? 'jin' : /^s[ií]/i.test(e.defoliado || '') ? 'defoliado' : 'trasplante'}" style="--i:3"><span class="burbuja-ic"><svg><use href="#ico-pincel"/></svg></span><strong>${conifera ? 'Jin y shari' : /^s[ií]/i.test(e.defoliado || '') ? 'Defoliado' : 'Trasplante'}</strong><small>Animación paso a paso</small></button>
      </div>
      <details class="tecnica"><summary><strong>Resumen de cuidados</strong><span>Luz, riego, poda, alambrado y más en una sola lista</span></summary>${htmlFicha(e, { titulo: false })}</details>
      <h3 class="titulo-medio">Videos</h3>
      ${videos.map((v) => `<figure class="video"><video controls preload="none" poster="${v.src}" src="${v.video}"></video><figcaption>${esc(v.titulo)} · ${esc(v.autor)} · ${esc(v.licencia)}</figcaption></figure>`).join('')}
      <div class="enlaces-video">
        <a class="boton secundario" target="_blank" rel="noopener" href="${yt(`bonsai ${corto(e)} cuidados`)}"><svg><use href="#ico-play"/></svg>Cuidados de ${esc(corto(e).toLowerCase())}</a>
        <a class="boton secundario" target="_blank" rel="noopener" href="${yt(`bonsai ${e.cientifico.split(' ').slice(0, 2).join(' ')} ${conifera ? 'pinzado' : 'poda'}`)}"><svg><use href="#ico-play"/></svg>${conifera ? 'Pinzado' : 'Poda'} en video</a>
        <a class="boton secundario" target="_blank" rel="noopener" href="${yt(`bonsai ${corto(e)} alambrado`)}"><svg><use href="#ico-play"/></svg>Alambrado en video</a>
      </div>
      <p class="meta">Los videos abren búsquedas en YouTube con el nombre de la especie.</p>
      <details class="tecnica creditos"><summary><strong>Créditos de las fotos</strong><span>Wikimedia Commons, licencias libres</span></summary>
        <ol>${fotos.map((f) => `<li><a href="${f.pagina}" target="_blank" rel="noopener">${esc(f.titulo)}</a> — ${esc(f.autor)} (${esc(f.licencia)})</li>`).join('')}</ol></details>
      <a class="boton texto" target="_blank" rel="noopener" href="${wiki(e.cientifico.split(' ').slice(0, 2).join(' '))}">Leer más en Wikipedia →</a>`;
    // galería: puntos y visor
    const pista = $('.galeria-pista', cont);
    pista.addEventListener('scroll', () => {
      const i = Math.round(pista.scrollLeft / pista.clientWidth);
      $$('.galeria-puntos i', cont).forEach((p, j) => p.classList.toggle('activo', j === i));
    }, { passive: true });
    $$('.galeria-pista figure[data-i]', cont).forEach((f) => (f.onclick = () => abrirVisor(fotos, Number(f.dataset.i))));
    $$('[data-foto]', cont).forEach((b) => (b.onclick = () => abrirVisor(fotos, Number(b.dataset.foto))));
    $$('[data-flujo]', cont).forEach((b) => (b.onclick = () => FLUJOS[b.dataset.flujo](null)));
    $$('[data-tec]', cont).forEach((b) => (b.onclick = () => abrirLeccionTecnica(b.dataset.tec)));
    enlazarGuia(cont, id);
    $('[data-volver]', cont).onclick = () => (document.startViewTransition ? document.startViewTransition(() => pintarEnciclopedia(cont)) : pintarEnciclopedia(cont));
    window.scrollTo({ top: 0 });
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(abrir);
  else abrir();
}

// ---------------- Técnicas ----------------
const ANIM_TEC = {
  estructural: '<svg viewBox="0 0 120 90" class="anim-tec a-poda"><path d="M60 86 Q54 60 62 40 Q58 26 60 12" stroke="#7b4a33" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M58 56 Q40 50 22 48" stroke="#7b4a33" stroke-width="4" fill="none"/><ellipse cx="22" cy="44" rx="16" ry="7" fill="#4f8a3c"/><path d="M62 42 Q80 36 98 34" stroke="#7b4a33" stroke-width="3.5" fill="none"/><ellipse cx="98" cy="30" rx="15" ry="6" fill="#4f8a3c"/><ellipse cx="60" cy="12" rx="16" ry="9" fill="#4f8a3c"/><g class="cae"><path d="M64 62 Q50 54 34 58" stroke="#7b4a33" stroke-width="3" fill="none"/><ellipse cx="32" cy="58" rx="9" ry="4" fill="#83b660"/></g><g class="tij"><path d="M60 58 l10 -6 M60 64 l10 6" stroke="#c2412d" stroke-width="2.5" stroke-linecap="round"/></g></svg>',
  mantenimiento: '<svg viewBox="0 0 120 90" class="anim-tec a-mant"><ellipse cx="60" cy="50" rx="44" ry="22" fill="#4f8a3c"/><g class="brotes"><path d="M30 34 l-6 -16 M60 28 l0 -18 M90 34 l6 -16" stroke="#83b660" stroke-width="4" stroke-linecap="round"/></g><path class="silueta-mini" d="M16 50 Q16 26 60 26 Q104 26 104 50" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/></svg>',
  pinzado: '<svg viewBox="0 0 120 90" class="anim-tec a-pinza"><ellipse cx="60" cy="56" rx="46" ry="20" fill="#3d6b51"/><path class="brote-p" d="M60 40 L60 14" stroke="#6a9a72" stroke-width="5" stroke-linecap="round"/><ellipse class="dedo-a" cx="50" cy="16" rx="6" ry="9" fill="#e9b892"/><ellipse class="dedo-b" cx="70" cy="16" rx="6" ry="9" fill="#e9b892"/></svg>',
  alambrado: '<svg viewBox="0 0 120 90" class="anim-tec a-alambre"><path class="rama-a" d="M14 60 Q60 40 106 30" stroke="#8a5a3e" stroke-width="7" fill="none" stroke-linecap="round"/><path class="alambre-a" d="M14 60 q4 -8 8 -2 q4 -9 8 -3 q4 -9 8 -3 q4 -9 8 -3 q4 -8 8 -3 q4 -8 8 -3 q4 -8 8 -3 q4 -7 8 -2 q4 -7 8 -2 q4 -7 8 -2" stroke="#d58944" stroke-width="2" fill="none" pathLength="1"/></svg>',
  defoliado: '<svg viewBox="0 0 120 90" class="anim-tec a-defo"><path d="M60 88 L60 40" stroke="#7b4a33" stroke-width="6"/>' + [[40, 34], [52, 26], [66, 24], [80, 32], [46, 44], [74, 42], [60, 34]].map(([x, y], i) => `<ellipse class="h" style="--d:${i * 0.12}s" cx="${x}" cy="${y}" rx="9" ry="5" fill="#5e9c45"/>`).join('') + '</svg>',
  jin: '<svg viewBox="0 0 120 90" class="anim-tec a-jin"><path d="M30 90 Q36 50 30 0" stroke="#7b4a33" stroke-width="18" fill="none"/><path d="M34 60 L96 30" stroke="#e9dfc8" stroke-width="7" stroke-linecap="round"/><path class="corteza-a" d="M34 60 L96 30" stroke="#7b4a33" stroke-width="8" stroke-linecap="round" pathLength="1"/></svg>',
  trasplante: '<svg viewBox="0 0 120 90" class="anim-tec a-tras"><g class="sube"><path d="M60 60 L60 26" stroke="#7b4a33" stroke-width="5"/><ellipse cx="60" cy="22" rx="20" ry="10" fill="#4f8a3c"/><ellipse cx="60" cy="64" rx="18" ry="9" fill="#6d4d36"/><path d="M50 68 q-4 8 -8 12 M60 72 v10 M70 68 q4 8 8 12" stroke="#d9c4a3" stroke-width="1.5" fill="none"/></g><path d="M34 66 H86 L82 86 H38 Z" fill="#6b4a38"/></svg>',
};

function pintarTecnicas(cuerpo) {
  const hechas = A.kodama().lecciones;
  const lista = TECNICAS.filter((t) => coincide(t.titulo, t.resumen, ...t.pasos));
  cuerpo.innerHTML = lista.map((t, i) => {
    const foto = FOTOS.tecnicas?.[t.id]?.[0];
    const leccion = LECCIONES_TECNICA[t.id] ? 'tec' : { pinzado: 'pinzar', mantenimiento: 'pinzar', alambrado: 'alambrar' }[t.id];
    const hecha = hechas.includes(LECCIONES_TECNICA[t.id] ? `tec-${t.id}` : leccion);
    return `<article class="tarjeta tecnica-v" style="--i:${i}">
      <div class="tec-visual">${ANIM_TEC[t.id] || ''}${foto ? `<button class="tec-foto" data-tfoto="${t.id}">${imgHTML(foto)}</button>` : ''}</div>
      <h3>${esc(t.titulo)} ${hecha ? '<span class="sello-l en-linea">✓ Hecha</span>' : ''}</h3>
      <p>${esc(t.resumen)}</p>
      <div class="acciones">
        ${leccion ? `<button class="boton primario" data-lec="${t.id}" data-tipo="${leccion}"><svg><use href="#ico-play"/></svg>Ver animación paso a paso</button>` : ''}
        <a class="boton secundario" target="_blank" rel="noopener" href="${yt(`bonsai ${t.titulo}`)}">Videos</a>
      </div>
      <details class="tecnica"><summary><strong>Pasos por escrito</strong><span>${t.pasos.length} pasos · ${esc(t.herramientas)}</span></summary>
        <ol>${t.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol></details>
    </article>`;
  }).join('') || '<p class="vacio">No encontré esa técnica.</p>';
  $$('[data-lec]', cuerpo).forEach((b) => (b.onclick = () => {
    const al = () => pintarTecnicas(cuerpo);
    if (b.dataset.tipo === 'tec') abrirLeccionTecnica(b.dataset.lec, { alTerminar: al });
    else FLUJOS[b.dataset.tipo](null, { alTerminar: al });
  }));
  $$('[data-tfoto]', cuerpo).forEach((b) => (b.onclick = () => abrirVisor(FOTOS.tecnicas[b.dataset.tfoto].map((f) => ({ ...f, tipo: 'Ejemplo real' })))));
}

// ---------------- Estilos ----------------
function pintarEstilos(cuerpo) {
  const lista = Object.entries(ESTILOS).filter(([, s]) => coincide(s.nombre, s.es, s.desc));
  cuerpo.innerHTML = `<div class="rejilla-estilos grande">${lista.map(([id, s], i) => {
    const [a, i2, d] = s.silueta.map(([x, y]) => [x * 100, y * 100]);
    const foto = FOTOS.estilos?.[id]?.[0];
    return `<button class="estilo" data-estilo="${id}" style="--i:${i}">
      <span class="estilo-vis"><svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon points="${a} ${i2} ${d}" fill="currentColor" opacity=".18" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
        ${s.nombre === 'Sekijoju' ? '<ellipse cx="50" cy="76" rx="16" ry="12" fill="currentColor" opacity=".35"/>' : ''}
        <path class="trazo-estilo" d="${s.tronco}" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>
        <rect x="${s.nombre === 'Kengai' ? 32 : 28}" y="90" width="${s.nombre === 'Kengai' ? 22 : 44}" height="${s.nombre === 'Kengai' ? 10 : 6}" rx="2" fill="currentColor" opacity=".55"/></svg>
        ${foto ? `<span class="estilo-foto">${imgHTML(foto)}</span>` : ''}</span>
      <strong>${esc(s.nombre)}</strong><span>${esc(s.es)}</span></button>`;
  }).join('')}</div>`;
  $$('[data-estilo]', cuerpo).forEach((b) => (b.onclick = () => {
    const s = ESTILOS[b.dataset.estilo];
    const fotos = (FOTOS.estilos?.[b.dataset.estilo] || []).map((f) => ({ ...f, tipo: `Ejemplo de ${s.nombre}` }));
    const especies = ESPECIES.filter((e) => e.estilos.includes(b.dataset.estilo)).map(corto);
    {
      const hoja = abrirHoja(`${s.nombre} · ${s.es}`);
      hoja.cuerpo.innerHTML = `<div class="escena estilo-escena">${b.querySelector('svg').outerHTML}</div>
        <p class="paso-texto">${esc(s.desc)}</p>
        ${especies.length ? `<p class="meta"><b>Especies que le van:</b> ${esc(especies.join(', '))}</p>` : ''}
        ${fotos.length ? `<div class="mini-galeria">${fotos.map((f, i) => `<button data-i="${i}">${imgHTML(f)}<span>Ejemplo real</span></button>`).join('')}</div>` : ''}
        <a class="boton secundario ancho" target="_blank" rel="noopener" href="${yt(`bonsai estilo ${s.nombre} ${s.es}`)}"><svg><use href="#ico-play"/></svg>Ver ejemplos en video</a>`;
      $$('[data-i]', hoja.cuerpo).forEach((x) => (x.onclick = () => abrirVisor(fotos, Number(x.dataset.i))));
    }
  }));
}

// ---------------- Videos ----------------
const TEMAS_VIDEO = [
  ['Cuidados del junípero procumbens', 'bonsai juniperus procumbens nana cuidados'],
  ['Cómo regar un bonsái', 'como regar un bonsai'],
  ['Pinzado de juníperos', 'pinzado junipero bonsai'],
  ['Alambrado básico', 'alambrado bonsai para principiantes'],
  ['Poda estructural', 'poda estructural bonsai'],
  ['Trasplante de bonsái', 'trasplante bonsai paso a paso'],
  ['Jin y shari', 'jin y shari bonsai'],
  ['Estilos de bonsái', 'estilos de bonsai explicados'],
  ['Bonsái en clima de Bogotá', 'bonsai bogota cuidados clima frio'],
];
function pintarVideos(cuerpo) {
  cuerpo.innerHTML = `
    ${FOTOS.videos.length ? `<h3 class="titulo-medio">Videos libres (Wikimedia Commons)</h3>${FOTOS.videos.map((v) => `<figure class="video"><video controls preload="none" poster="${v.src}" src="${v.video}"></video><figcaption>${esc(v.titulo)} · ${esc(v.autor)} · ${esc(v.licencia)}</figcaption></figure>`).join('')}` : ''}
    <h3 class="titulo-medio">Buscar en YouTube</h3>
    <div class="temas-video">${TEMAS_VIDEO.map(([t, q], i) => `<a class="tema-video" style="--i:${i}" target="_blank" rel="noopener" href="${yt(q)}"><span class="play-ic"><svg><use href="#ico-play"/></svg></span>${esc(t)}</a>`).join('')}</div>
    <p class="meta">Abren la búsqueda en YouTube (necesita internet).</p>`;
}
