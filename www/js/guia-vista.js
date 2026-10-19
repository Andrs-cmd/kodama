// Vista de la guía completa de una especie, con partes interactivas.
import { guiaDe, EPOCAS, epocaActual, DONDE_SUSTRATO } from './guia-completa.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const $ = (s, r) => r.querySelector(s);
const $$ = (s, r) => [...r.querySelectorAll(s)];

let EN_LINEA = null;
export async function cargarEnLinea() {
  if (EN_LINEA) return EN_LINEA;
  try { EN_LINEA = await (await fetch('datos/en-linea.json')).json(); } catch { EN_LINEA = { especies: {} }; }
  return EN_LINEA;
}

const TEMP_CLIMA = { frio: ['Tu clima (frío)', 14], templado: ['Tu clima (templado)', 21], calido: ['Tu clima (cálido)', 27] };
const IUCN = { LC: 'Preocupación menor', NT: 'Casi amenazada', VU: 'Vulnerable', EN: 'En peligro', CR: 'En peligro crítico', EW: 'Extinta en estado silvestre', DD: 'Datos insuficientes', NE: 'No evaluada', NOT_EVALUATED: 'No evaluada', LEAST_CONCERN: 'Preocupación menor', NEAR_THREATENED: 'Casi amenazada', VULNERABLE: 'Vulnerable', ENDANGERED: 'En peligro', CRITICALLY_ENDANGERED: 'En peligro crítico', DATA_DEFICIENT: 'Datos insuficientes' };
const TAREAS = [['riego', '💧', 'Riego'], ['abono', '🌱', 'Abono'], ['poda', '✂️', 'Poda'], ['alambre', '🧵', 'Alambrado'], ['trasplante', '🪴', 'Trasplante'], ['extra', '👀', 'Ojo con']];

function ruedaAnio(epActual) {
  const mes = new Date().getMonth();
  // 12 meses en círculo; diciembre arriba a la izquierda para que cada temporada sea un bloque.
  const ang = (m) => ((m + 1) % 12) * 30 - 90;
  const arco = (m0, n, r, color, id) => {
    const a0 = ((ang(m0) - 15) * Math.PI) / 180, a1 = ((ang(m0) - 15 + n * 30) * Math.PI) / 180;
    const p = (a, rr) => `${(60 + rr * Math.cos(a)).toFixed(1)},${(60 + rr * Math.sin(a)).toFixed(1)}`;
    return `<path data-ep="${id}" class="segmento ${id === epActual.id ? 'actual' : ''}" d="M${p(a0, r)} A${r},${r} 0 0 1 ${p(a1, r)} L${p(a1, r - 18)} A${r - 18},${r - 18} 0 0 0 ${p(a0, r - 18)} Z" fill="${color}"/>`;
  };
  const colores = { seca1: '#f2c45a', lluvias1: '#6fb3d9', seca2: '#e6a15c', lluvias2: '#4f86b8' };
  const letras = 'EFMAMJJASOND';
  return `<svg viewBox="0 0 120 120" class="rueda" aria-label="Temporadas del año">
    ${EPOCAS.map((e) => arco(e.meses[0], 3, 56, colores[e.id], e.id)).join('')}
    ${Array.from({ length: 12 }, (_, m) => { const a = (ang(m) * Math.PI) / 180; return `<text x="${(60 + 47 * Math.cos(a)).toFixed(1)}" y="${(60 + 47 * Math.sin(a) + 2.5).toFixed(1)}" class="letra-mes ${m === mes ? 'hoy' : ''}">${letras[m]}</text>`; }).join('')}
    <g class="aguja" style="--ang:${ang(mes)}deg"><line x1="60" y1="60" x2="${60 + 30}" y2="60" stroke="var(--tinta)" stroke-width="2.5" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="var(--tinta)"/></g>
    <text x="60" y="88" class="rueda-hoy">hoy</text>
  </svg>`;
}

export function htmlGuia(id, { clima = 'frio' } = {}) {
  const g = guiaDe(id);
  if (!g) return '';
  const ep = epocaActual();
  const t = g.temperatura;
  const escala = (v) => ((v + 20) / 60) * 100;
  const [climaTxt, climaT] = TEMP_CLIMA[clima] || TEMP_CLIMA.frio;
  return `
  <nav class="indice-guia" aria-label="Secciones de la guía">
    ${[['g-temporadas', 'Temporadas'], ['g-clima', 'Clima'], ['g-abono', 'Abono'], ['g-sustrato', 'Sustrato'], ['g-propagar', 'Propagar'], ['g-plagas', 'Plagas'], ['g-internet', 'Internet']].map(([a, t2]) => `<a href="#${a}" class="chip">${t2}</a>`).join('')}
  </nav>

  <h3 class="titulo-medio" id="g-temporadas">Temporadas del año</h3>
  <p class="meta">Calendario para los Andes colombianos (dos épocas secas y dos de lluvias).</p>
  <div class="temporadas tarjeta">
    ${ruedaAnio(ep)}
    <div class="temporada-lista">${EPOCAS.map((e) => `<button class="temporada-chip ${e.id === ep.id ? 'activo' : ''}" data-ep="${e.id}"><span>${e.icono}</span><b>${esc(e.nombre)}</b><small>${e.rango}${e.id === ep.id ? ' · ahora' : ''}</small></button>`).join('')}</div>
  </div>
  <div class="temporada-detalle tarjeta" aria-live="polite"></div>
  ${g.flor ? `<div class="regla"><span>🌸</span>${esc(g.flor)}</div>` : ''}

  <h3 class="titulo-medio" id="g-clima">Clima, luz y crecimiento</h3>
  ${t ? `<div class="termometro tarjeta">
    <div class="term-barra"><i class="term-ideal" style="--a:${escala(t.idealMin)}%;--b:${escala(t.idealMax)}%"></i>
      <span class="term-pin" style="--p:${escala(climaT)}%"><b>${climaT} °C</b></span></div>
    <div class="term-escala"><span>-20°</span><span>0°</span><span>20°</span><span>40°</span></div>
    <p><b>Ideal:</b> ${t.idealMin}–${t.idealMax} °C · <b>Aguanta:</b> de ${t.minima} °C a ${t.maxima} °C</p>
    <p class="meta">📍 ${climaTxt}: promedio de ${climaT} °C ${climaT < t.idealMin ? '— más frío que su ideal: crecerá más lento.' : climaT > t.idealMax ? '— más caliente que su ideal: más riego y sombra en la tarde.' : '— dentro de su rango ideal.'}</p>
  </div>` : ''}
  <div class="datos-b">
    <div class="dato-b"><span class="dato-ic">☀️</span><small>Luz</small><p>${esc(g.luz)}</p></div>
    <div class="dato-b"><span class="dato-ic">💦</span><small>Humedad</small><p>${esc(g.humedad)}</p></div>
    <div class="dato-b"><span class="dato-ic">📈</span><small>Crecimiento</small><p>${esc(g.velocidad)}</p></div>
    <div class="dato-b"><span class="dato-ic">🪴</span><small>Trasplante</small><p>${esc(g.especie.trasplante)}</p></div>
  </div>

  <h3 class="titulo-medio" id="g-abono">Abono: cuál y cuándo cambiarlo</h3>
  <ol class="etapas-abono">${g.abono.etapas.map(([etapa, que, cada], i) => `<li style="--i:${i}"><span class="etapa-n">${i + 1}</span><div><b>${esc(etapa)}</b><p>${esc(que)}</p><small>${esc(cada)}</small></div></li>`).join('')}</ol>
  <div class="regla"><span>🔄</span><div><b>Cuándo cambiar de abono:</b> ${esc(g.abono.cambio)}</div></div>
  <div class="alerta"><b>No abones:</b> ${esc(g.abono.no)}</div>
  <p class="meta">Los números (10-10-10, 15-15-15…) son nitrógeno-fósforo-potasio: el nitrógeno hace crecer hojas, el fósforo raíces y flores, el potasio fortalece la madera. En bonsái siempre a media o un cuarto de la dosis de la etiqueta.</p>

  <h3 class="titulo-medio" id="g-sustrato">Sustrato (tierra)</h3>
  <div class="tarjeta">
    <div class="mezcla" role="img" aria-label="Mezcla de sustrato">${g.sustrato.mezcla.map(([n, p, c], i) => `<i style="--w:${p}%;--c:${c};--i:${i}" title="${esc(n)} ${p}%"><span>${p}%</span></i>`).join('')}</div>
    <ul class="leyenda-mezcla">${g.sustrato.mezcla.map(([n, p, c]) => `<li><i style="background:${c}"></i>${esc(n)} <b>${p} %</b></li>`).join('')}</ul>
    <p><b>Sin akadama (fácil de conseguir):</b> ${esc(g.sustrato.sin)}</p>
    <p class="meta"><b>pH:</b> ${esc(g.sustrato.ph)}</p>
    <p class="meta">${esc(DONDE_SUSTRATO)}</p>
  </div>

  <h3 class="titulo-medio" id="g-propagar">Propagación y variedades</h3>
  <div class="tarjeta"><p>🌱 ${esc(g.propagacion)}</p>
    ${g.variedades.length ? `<div class="etiquetas">${g.variedades.map((v) => `<span class="etiqueta musgo">${esc(v)}</span>`).join('')}</div>` : ''}</div>

  <h3 class="titulo-medio" id="g-plagas">Plagas y enfermedades</h3>
  <div class="plagas">${g.plagas.map(([n, s, tr], i) => `<details class="plaga" style="--i:${i}"><summary><b>${esc(n)}</b><small>${esc(s)}</small></summary><p>💊 ${esc(tr)}</p></details>`).join('')}</div>
  ${g.errores.length ? `<h3 class="titulo-medio">Errores comunes</h3><ul class="errores">${g.errores.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  ${g.toxicidad ? `<div class="alerta toxicidad"><b>🐾 Mascotas y niños:</b> ${esc(g.toxicidad)}</div>` : ''}

  <h3 class="titulo-medio" id="g-internet">Desde internet</h3>
  <div class="en-linea" data-id="${id}"><p class="meta">Cargando datos en línea…</p></div>`;
}

function htmlEnLinea(d, e) {
  if (!d) return `<p class="meta">Sin datos en línea guardados para esta especie.</p>`;
  const w = d.wikipedia, g = d.gbif;
  const busca = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  return `
    ${w ? `<article class="tarjeta wiki"><span class="etiqueta">${w.lang === 'es' ? 'Wikipedia' : 'Wikipedia (en inglés)'}</span><h4>${esc(w.titulo)}</h4><p>${esc(w.extracto)}</p><a class="boton texto" target="_blank" rel="noopener" href="${w.url}">Leer el artículo completo →</a></article>` : ''}
    ${g ? `<article class="tarjeta">
      <h4>Taxonomía (GBIF)</h4>
      <dl class="taxonomia">${[['Reino', g.taxonomia.reino], ['Filo', g.taxonomia.filo], ['Clase', g.taxonomia.clase], ['Orden', g.taxonomia.orden], ['Familia', g.taxonomia.familia], ['Género', g.taxonomia.genero], ['Especie', g.taxonomia.especie]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${g.nombresEs.length ? `<p class="meta"><b>Nombres en español:</b> ${esc(g.nombresEs.join(', '))}</p>` : ''}
      <div class="cifras">
        ${g.registros != null ? `<div><b class="contador" data-n="${g.registros}">0</b><small>registros en el mundo</small></div>` : ''}
        ${g.registrosColombia != null ? `<div><b class="contador" data-n="${g.registrosColombia}">0</b><small>registros en Colombia</small></div>` : ''}
        ${g.iucn ? `<div><b>${esc(IUCN[g.iucn] || g.iucn)}</b><small>estado de conservación (UICN)</small></div>` : ''}
      </div>
      <a class="boton texto" target="_blank" rel="noopener" href="${g.url}">Ver mapa y registros en GBIF →</a>
    </article>` : ''}
    <div class="enlaces-guias">
      ${(d.guias || []).map((x) => `<a class="boton secundario" target="_blank" rel="noopener" href="${x.url}">📘 ${esc(x.titulo)}</a>`).join('')}
      <a class="boton secundario" target="_blank" rel="noopener" href="${busca(`bonsai ${e.cientifico.split(' ').slice(0, 2).join(' ')} cuidados`)}">🔎 Más en la web</a>
      <a class="boton secundario" target="_blank" rel="noopener" href="${busca(`${e.cientifico.split(' ').slice(0, 2).join(' ')} bonsai foro`)}">💬 Foros y experiencias</a>
    </div>`;
}

function contar(el) {
  const n = Number(el.dataset.n);
  const t0 = performance.now();
  const paso = (t) => {
    const k = Math.min(1, (t - t0) / 1200);
    el.textContent = Math.round(n * (1 - (1 - k) ** 3)).toLocaleString('es-CO');
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

// Enlaza la interacción una vez insertado el HTML.
export function enlazarGuia(raiz, id) {
  const g = guiaDe(id);
  if (!g) return;
  const det = $('.temporada-detalle', raiz);
  const mostrar = (epId) => {
    const ep = g.calendario.find((x) => x.id === epId);
    $$('.temporada-chip', raiz).forEach((b) => b.classList.toggle('activo', b.dataset.ep === epId));
    $$('.segmento', raiz).forEach((s) => s.classList.toggle('elegido', s.dataset.ep === epId));
    det.innerHTML = `<h4>${ep.icono} ${esc(ep.nombre)} <small>${ep.rango}</small></h4><p class="meta">${esc(ep.clima)}</p>
      <ul class="tareas-ep">${TAREAS.map(([k, ic, n], i) => `<li style="--i:${i}"><span>${ic}</span><div><b>${n}</b><p>${esc(ep.tareas[k])}</p></div></li>`).join('')}</ul>`;
  };
  $$('[data-ep]', raiz).forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.ep)));
  mostrar(epocaActual().id);
  $$('.indice-guia a', raiz).forEach((a) => a.addEventListener('click', (ev) => {
    ev.preventDefault();
    raiz.querySelector(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  cargarEnLinea().then((d) => {
    const cont = $('.en-linea', raiz);
    if (!cont) return;
    cont.innerHTML = htmlEnLinea(d.especies?.[id], g.especie);
    const obs = new IntersectionObserver((ents) => ents.forEach((en) => en.isIntersecting && (contar(en.target), obs.unobserve(en.target))));
    $$('.contador', cont).forEach((c) => obs.observe(c));
  });
}

// Resumen de la temporada actual para la pantalla Hoy.
export function htmlTemporadaHoy(id) {
  const g = guiaDe(id);
  if (!g) return '';
  const ep = g.calendario.find((x) => x.id === epocaActual().id);
  return `<article class="tarjeta temporada-hoy">
    <span class="meta">${ep.icono} Ahora: ${esc(ep.nombre)} (${ep.rango})</span>
    <ul class="tareas-ep compacta">${TAREAS.filter(([k]) => k !== 'extra').map(([k, ic, n]) => `<li><span>${ic}</span><div><b>${n}</b><p>${esc(ep.tareas[k])}</p></div></li>`).join('')}</ul>
    <button class="boton secundario ancho" data-guia-completa><svg><use href="#ico-libro"/></svg>Todo sobre tu ${esc(g.especie.nombre.split(' (')[0].toLowerCase())}</button>
  </article>`;
}
