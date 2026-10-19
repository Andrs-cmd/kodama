// Foto del bonsái con las marcas de trabajo: cortes numerados, alambrado con
// flecha de destino y silueta objetivo. Si no hay análisis con IA, guía manual
// con la silueta del estilo que se ajusta arrastrando los puntos.
import { ESPECIES, POR_ID, GRUPOS } from './especies.js';
import { ESTILOS, TIPOS_CORTE } from './guia.js';
import { curva, NS } from './geom.js';
import { textoFrecuencia } from './riego.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const $ = (s, r) => r.querySelector(s);
const $$ = (s, r) => [...r.querySelectorAll(s)];

function el(tag, attrs = {}, padre) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  padre?.appendChild(n);
  return n;
}

function crearLienzo(foto) {
  const W = 1000;
  const H = Math.round((1000 * foto.h) / foto.w);
  const caja = document.createElement('div');
  caja.className = 'lienzo';
  caja.innerHTML = `<img src="${foto.url}" alt="Foto del bonsái con las marcas de trabajo">`;
  const svg = el('svg', { class: 'marcas', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none' }, caja);
  const defs = el('defs', {}, svg);
  const flecha = el('marker', { id: 'punta', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, defs);
  el('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'var(--cobre)' }, flecha);
  const sombra = el('filter', { id: 'sombra', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
  el('feDropShadow', { dx: 0, dy: 1, stdDeviation: 2.5, 'flood-color': '#000', 'flood-opacity': 0.45 }, sombra);
  const P = (p) => [Math.round(p.x * W), Math.round(p.y * H)];
  return { caja, svg, W, H, P };
}

function dibujarSilueta(capa, P, s, W) {
  const a = P(s.apice), i = P(s.izquierda), d = P(s.derecha);
  el('polygon', { class: 'silueta-guia', points: `${a} ${i} ${d}` }, capa);
  const base = Math.max(i[1], d[1]);
  for (const f of [1 / 3, 2 / 3]) {
    const y = a[1] + (base - a[1]) * f;
    el('line', { class: 'tercios', x1: W * 0.04, x2: W * 0.96, y1: y, y2: y }, capa);
  }
  return { a, i, d };
}

function dibujarMarcas(lienzo, analisis, alTocar) {
  const { svg, P, W } = lienzo;
  const capas = {
    silueta: el('g', { 'data-capa': 'silueta', class: 'aparece', style: '--d:.1s' }, svg),
    alambrado: el('g', { 'data-capa': 'alambrado' }, svg),
    cortes: el('g', { 'data-capa': 'cortes' }, svg),
  };
  if (analisis.silueta) dibujarSilueta(capas.silueta, P, analisis.silueta, W);

  analisis.alambrado.forEach((w, n) => {
    const pts = w.trazo.map(P);
    const g = el('g', { filter: 'url(#sombra)', class: 'aparece', style: `--d:${0.4 + n * 0.15}s` }, capas.alambrado);
    el('path', { class: 'alambre traza', d: curva(pts), stroke: 'var(--cobre)', 'stroke-width': 14, pathLength: 1 }, g);
    el('path', { class: 'alambre', d: curva(pts), stroke: '#fff', 'stroke-width': 14, 'stroke-dasharray': '3 11', opacity: 0.5 }, g);
    const fin = pts.at(-1), dest = P(w.destino);
    const medio = [(fin[0] + dest[0]) / 2 + (dest[1] - fin[1]) * 0.25, (fin[1] + dest[1]) / 2 - (dest[0] - fin[0]) * 0.25];
    el('path', { class: 'flecha', d: `M${fin} Q${medio} ${dest}`, stroke: 'var(--cobre)', 'marker-end': 'url(#punta)' }, g);
    el('circle', { cx: dest[0], cy: dest[1], r: 14, fill: 'none', stroke: 'var(--cobre)', 'stroke-width': 4, 'stroke-dasharray': '5 4' }, g);
    const et = el('g', { class: 'marca-corte', 'data-id': `a${n}` }, g);
    el('circle', { cx: pts[0][0], cy: pts[0][1], r: 32, fill: 'var(--cobre)' }, et);
    el('text', { class: 'etiqueta-alambre', x: pts[0][0], y: pts[0][1], 'font-size': 28 }, et).textContent = `A${n + 1}`;
    et.addEventListener('click', () => alTocar(`a${n}`));
  });

  analisis.cortes.forEach((c, n) => {
    const [x, y] = P(c);
    const color = TIPOS_CORTE[c.tipo]?.color || 'var(--corte)';
    const g = el('g', { class: 'marca-corte aparece-pop', 'data-id': `c${n}`, style: `--d:${0.25 + n * 0.12}s;transform-origin:${x}px ${y}px` }, capas.cortes);
    el('circle', { class: 'halo', cx: x, cy: y, r: 36, stroke: color }, g);
    el('path', { d: `M${x - 15},${y - 15} L${x + 15},${y + 15} M${x + 15},${y - 15} L${x - 15},${y + 15}`, stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    const bx = x + (x > W - 90 ? -52 : 52), by = y + (y < 90 ? 52 : -52);
    el('line', { x1: x + Math.sign(bx - x) * 25, y1: y + Math.sign(by - y) * 25, x2: bx, y2: by, stroke: color, 'stroke-width': 4 }, g);
    el('circle', { cx: bx, cy: by, r: 34, fill: color, filter: 'url(#sombra)' }, g);
    el('text', { class: 'num', x: bx, y: by, 'font-size': 36 }, g).textContent = n + 1;
    g.addEventListener('click', () => alTocar(`c${n}`));
  });
  return capas;
}

function resaltar(raiz, id) {
  $$('.resaltada', raiz).forEach((n) => n.classList.remove('resaltada'));
  $$(`[data-id="${id}"]`, raiz).forEach((n) => {
    void n.getBoundingClientRect();
    n.classList.add('resaltada');
  });
}

// ---------- Guía de la IA para este árbol ----------
const NOMBRE_EPOCA = { seca1: '☀️ Seca (dic–feb)', lluvias1: '🌧️ Primeras lluvias (mar–may)', seca2: '🌬️ Mitad de año (jun–ago)', lluvias2: '⛈️ Segundas lluvias (sep–nov)' };
function htmlGuiaIA(g) {
  return `<article class="tarjeta guia-ia"><h3>Guía completa para este árbol</h3>
    <p><b>Crecimiento:</b> ${esc(g.crecimiento)}</p><p><b>Temperatura:</b> ${esc(g.temperatura)}</p>
    <h4>Temporadas</h4>${g.temporadas.map((t) => `<details class="plaga"><summary><b>${NOMBRE_EPOCA[t.epoca] || esc(t.epoca)}</b></summary><ul class="tareas-ep compacta">
      ${[['💧', 'Riego', t.riego], ['🌱', 'Abono', t.abono], ['✂️', 'Poda', t.poda], ['🧵', 'Alambrado', t.alambrado], ['🪴', 'Trasplante', t.trasplante]].map(([i, n, v]) => `<li><span>${i}</span><div><b>${n}</b><p>${esc(v)}</p></div></li>`).join('')}</ul></details>`).join('')}
    <h4>Abono</h4><ol class="etapas-abono">${g.abono.etapas.map((x, i) => `<li style="--i:${i}"><span class="etapa-n">${i + 1}</span><div><b>${esc(x.etapa)}</b><p>${esc(x.producto)}</p><small>${esc(x.frecuencia)}</small></div></li>`).join('')}</ol>
    <div class="regla"><span>🔄</span><div><b>Cuándo cambiar:</b> ${esc(g.abono.cambio)}</div></div>
    <h4>Sustrato</h4><p>${esc(g.sustrato.mezcla)}</p><p class="meta"><b>Alternativa:</b> ${esc(g.sustrato.alternativa)}</p>
    <h4>Plagas</h4><ul>${g.plagas.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <p><b>Propagación:</b> ${esc(g.propagacion)}</p>
    <div class="alerta"><b>🐾 Toxicidad:</b> ${esc(g.toxicidad)}</div></article>`;
}

// ---------- Ficha de especie ----------
const puntos = (n) => '●'.repeat(n) + '○'.repeat(3 - n);
const NIVEL = ['', 'Fácil', 'Intermedia', 'Exigente'];

export function htmlFicha(e, { titulo = true } = {}) {
  if (!e) return '';
  const fila = (ico, t, v) => (v ? `<dt>${ico ? `<svg><use href="#${ico}"/></svg>` : ''}${t}</dt><dd>${esc(v)}</dd>` : '');
  return `
  <article class="tarjeta ficha">
    ${titulo ? `<div class="ident"><p class="nombre">${esc(e.nombre)}</p><p class="cientifico">${esc(e.cientifico)}</p>
      <div class="etiquetas"><span class="etiqueta musgo">${esc(GRUPOS[e.grupo])}</span><span class="etiqueta">${e.ubicacion === 'ambos' ? 'Interior o exterior' : e.ubicacion === 'interior' ? 'Interior' : 'Exterior'}</span><span class="etiqueta">Dificultad: ${NIVEL[e.dificultad]} <span class="dificultad">${puntos(e.dificultad)}</span></span></div>
      ${e.otros.length ? `<p class="meta">También: ${esc(e.otros.join(', '))}</p>` : ''}</div>` : ''}
    <h4>Cómo reconocerlo</h4>
    <ul>${e.rasgos.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    <dl>
      ${fila('ico-sol', 'Luz', e.luz)}
      ${fila('ico-gota', 'Riego', `${e.riego.nota} ${e.riego.senales}`)}
      ${fila('', 'Humedad', e.humedad)}
      ${fila('', 'Sustrato', e.sustrato)}
      ${fila('', 'Abono', e.abono)}
      ${fila('', 'Trasplante', e.trasplante)}
      ${fila('ico-tijera', 'Poda de mantenimiento', e.poda.mantenimiento)}
      ${fila('ico-tijera', 'Poda estructural', e.poda.estructural)}
      ${fila('', 'Época de poda', e.poda.epoca)}
      ${fila('', 'Pinzado', e.pinzado)}
      ${fila('ico-alambre', 'Alambrado', `${e.alambrado.epoca} ${e.alambrado.consejo} Retirar: ${e.alambrado.retirar}`)}
      ${fila('', 'Defoliado', e.defoliado)}
      ${fila('', 'Estilos que le van', e.estilos.map((s) => (ESTILOS[s] ? `${ESTILOS[s].nombre} (${ESTILOS[s].es})` : s)).join(', '))}
      ${fila('', 'Plagas', e.plagas)}
      ${fila('', 'En clima andino', e.andino)}
    </dl>
  </article>`;
}

// registro: { foto, analisis, especieId, manual }
// op: { acciones: html de botones, alAccion(nombre, registro), alVolver, textoVolver }
export function pintarResultado(registro, cont, op) {
  if (registro.analisis) pintarAnalisis(registro, cont, op);
  else pintarManual(registro, cont, op);
}

function enlazarComunes(registro, cont, op) {
  $('[data-volver]', cont)?.addEventListener('click', () => op.alVolver?.());
  $$('[data-accion]', cont).forEach((b) => b.addEventListener('click', () => op.alAccion?.(b.dataset.accion, registro)));
}
const volver = (op) => (op.alVolver ? `<button class="boton texto volver" data-volver><svg><use href="#ico-volver"/></svg>${esc(op.textoVolver || 'Volver')}</button>` : '');

function pintarAnalisis(registro, cont, op) {
  const a = registro.analisis;
  const id = a.identificacion;
  const especie = POR_ID[registro.especieId || id.especieId];
  const estilo = ESTILOS[a.estiloRecomendado.id];
  cont.innerHTML = `
    ${volver(op)}
    <div class="dos-col">
      <div class="pegado">
        <div data-hueco></div>
        <div class="capas" role="group" aria-label="Capas">
          <button class="chip" data-capa="cortes" aria-pressed="true"><i style="background:var(--corte)"></i>Cortes (${a.cortes.length})</button>
          <button class="chip" data-capa="alambrado" aria-pressed="true"><i style="background:var(--cobre)"></i>Alambrado (${a.alambrado.length})</button>
          <button class="chip" data-capa="silueta" aria-pressed="true"><i style="background:var(--silueta)"></i>Silueta</button>
        </div>
        <p class="meta">Toca un número para ver el detalle. Las marcas son aproximadas: confírmalas mirando el árbol antes de cortar.</p>
      </div>
      <div class="lista-escalonada">
        <article class="tarjeta ident">
          <span class="meta">${a.esBonsai ? 'Identificado como' : 'Ojo'}</span>
          <p class="nombre">${esc(id.nombreComun || 'Especie no identificada')}</p>
          <p class="cientifico">${esc(id.cientifico)}</p>
          <div class="etiquetas"><span class="etiqueta musgo">Confianza ${esc(id.confianza)}</span>${a.estiloActual && ESTILOS[a.estiloActual] ? `<span class="etiqueta">Hoy: ${esc(ESTILOS[a.estiloActual].nombre)}</span>` : ''}</div>
          ${id.rasgos.length ? `<ul>${id.rasgos.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
          ${id.alternativas.length ? `<p class="meta">También podría ser: ${esc(id.alternativas.join(', '))}</p>` : ''}
        </article>
        <article class="tarjeta">
          <h3>Estado</h3><p>${esc(a.estado.resumen)}</p>
          ${a.estado.alertas.map((t) => `<div class="alerta">${esc(t)}</div>`).join('')}
          ${a.estado.observaciones.length ? `<ul>${a.estado.observaciones.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
          ${a.frente ? `<p class="meta"><strong>Frente:</strong> ${esc(a.frente)}</p>` : ''}
        </article>
        <article class="tarjeta"><h3>💧 Riego: ${esc(textoFrecuencia(a.riego.dias))}</h3><p>${esc(a.riego.como)}</p><p class="meta">${esc(a.riego.senales)}</p></article>
        ${a.cortes.length ? `<article class="tarjeta"><h3>Cortes y poda</h3><ol class="lista-marcas">
          ${a.cortes.map((c, n) => `<li data-id="c${n}"><span class="n" style="background:${TIPOS_CORTE[c.tipo]?.color}">${n + 1}</span>
            <div><span class="que">${esc(c.que)}</span><div class="meta">${esc(TIPOS_CORTE[c.tipo]?.nombre)} · prioridad ${esc(c.prioridad)} · ${esc(c.cuando)}</div><div>${esc(c.porque)}</div></div></li>`).join('')}
        </ol></article>` : ''}
        <article class="tarjeta"><h3>Alambrado</h3>
          ${a.alambrado.length ? `<ol class="lista-marcas">${a.alambrado.map((w, n) => `<li data-id="a${n}"><span class="n" style="background:var(--cobre)">A${n + 1}</span>
            <div><span class="que">${esc(w.que)}</span><div class="meta">Alambre de ${esc(w.calibreMm)} mm · ${esc(w.cuando)}</div><div>${esc(w.como)}</div></div></li>`).join('')}</ol>
            <p class="meta">La línea de cobre es la rama a alambrar; la flecha muestra hacia dónde llevar la punta.</p>` : '<p>Para este árbol no se recomienda alambrar ahora.</p>'}
        </article>
        <article class="tarjeta"><h3>Estilo recomendado: ${esc(estilo?.nombre)} <span class="meta">(${esc(estilo?.es)})</span></h3><p>${esc(a.estiloRecomendado.porque)}</p><p class="meta">${esc(estilo?.desc)}</p></article>
        ${a.plan.length ? `<article class="tarjeta"><h3>Plan de trabajo</h3><ol class="plan">${a.plan.map((p) => `<li><strong>${esc(p.cuando)}</strong><ul>${p.tareas.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></li>`).join('')}</ol></article>` : ''}
        <article class="tarjeta ficha"><h3>Cuidados</h3><dl>
          <dt><svg><use href="#ico-sol"/></svg>Luz</dt><dd>${esc(a.cuidados.luz)}</dd><dt>Sustrato</dt><dd>${esc(a.cuidados.sustrato)}</dd>
          <dt>Abono</dt><dd>${esc(a.cuidados.abono)}</dd><dt>Trasplante</dt><dd>${esc(a.cuidados.trasplante)}</dd></dl></article>
        ${a.guia ? htmlGuiaIA(a.guia) : ''}
        ${especie ? `<details class="tecnica"><summary><strong>Ficha completa: ${esc(especie.nombre)}</strong><span>Poda, alambrado, plagas y clima andino</span></summary>${htmlFicha(especie, { titulo: false })}</details>` : ''}
        <div class="acciones">${op.acciones || ''}</div>
      </div>
    </div>`;
  const lienzo = crearLienzo(registro.foto);
  $('[data-hueco]', cont).replaceWith(lienzo.caja);
  const tocar = (i) => {
    resaltar(cont, i);
    $(`li[data-id="${i}"]`, cont)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const capas = dibujarMarcas(lienzo, a, tocar);
  $$('.chip', cont).forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', on);
    capas[b.dataset.capa].style.display = on ? '' : 'none';
  }));
  $$('li[data-id]', cont).forEach((li) => li.addEventListener('click', () => {
    resaltar(cont, li.dataset.id);
    if (matchMedia('(max-width: 759px)').matches) lienzo.caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  enlazarComunes(registro, cont, op);
}

function pintarManual(registro, cont, op) {
  registro.manual ??= { estilo: POR_ID[registro.especieId]?.estilos?.[0] || 'moyogi' };
  const especie = POR_ID[registro.especieId];
  const estilo = ESTILOS[registro.manual.estilo];
  if (!registro.manual.silueta) {
    const [a, i, d] = estilo.silueta;
    registro.manual.silueta = { apice: { x: a[0], y: a[1] }, izquierda: { x: i[0], y: i[1] }, derecha: { x: d[0], y: d[1] } };
  }
  cont.innerHTML = `
    ${volver(op)}
    <div class="dos-col">
      <div class="pegado">
        <div data-hueco></div>
        <p class="meta">Arrastra los tres puntos verdes para ajustar la silueta a tu árbol: arriba el ápice, a los lados las puntas de la copa. Las líneas marcan los tercios.</p>
      </div>
      <div class="lista-escalonada">
        ${op.aviso ? `<article class="tarjeta"><h3>Guía manual</h3><p>${op.aviso}</p></article>` : ''}
        <article class="tarjeta">
          <label class="meta">Especie<select data-especie><option value="">— Elige la especie —</option>${ESPECIES.map((e) => `<option value="${e.id}" ${e.id === registro.especieId ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select></label>
          <label class="meta" style="display:block;margin-top:10px">Estilo objetivo<select data-estilo>${Object.entries(ESTILOS).map(([k, s]) => `<option value="${k}" ${k === registro.manual.estilo ? 'selected' : ''}>${esc(s.nombre)} · ${esc(s.es)}</option>`).join('')}</select></label>
          <p class="meta" style="margin-top:10px">${esc(estilo.desc)}</p>
        </article>
        <article class="tarjeta"><h3>Qué cortar (revisa en tu árbol)</h3>
          <ol class="lista-marcas">
            ${[
              ['estructural', 'Ramas cruzadas', 'Si una rama cruza el tronco u otra rama, quita la que peor encaje en la silueta.'],
              ['estructural', 'Dos o más ramas del mismo punto', 'Deja máximo dos; con tres o más se forma un engrosamiento feo.'],
              ['estructural', 'Ramas al frente en el tercio bajo', 'Tapan el tronco: abajo, las ramas van a los lados y atrás.'],
              ['estructural', 'Ramas por dentro de una curva', 'Las ramas buenas nacen por fuera de cada curva del tronco.'],
              ['estructural', 'Chupones y ramas verticales', 'Brotes muy fuertes que suben recto: quítalos o redúcelos.'],
              [especie?.grupo === 'conifera' ? 'pinzado' : 'mantenimiento', 'Lo que sale de la silueta', especie?.grupo === 'conifera' ? 'Pinza con los dedos las puntas que se salgan del triángulo verde.' : 'Recorta lo que se salga del triángulo verde, dejando 1-3 hojas.'],
            ].map(([t, q, p], n) => `<li><span class="n" style="background:${TIPOS_CORTE[t].color}">${n + 1}</span><div><span class="que">${q}</span><div>${p}</div></div></li>`).join('')}
          </ol>
          <p class="meta">Nunca quites más de un tercio del follaje en una sesión.</p>
        </article>
        ${especie ? htmlFicha(especie) : ''}
        <div class="acciones">${op.acciones || ''}</div>
      </div>
    </div>`;
  const lienzo = crearLienzo(registro.foto);
  $('[data-hueco]', cont).replaceWith(lienzo.caja);
  siluetaEditable(lienzo, registro, op);
  $('[data-especie]', cont).addEventListener('change', (e) => {
    registro.especieId = e.target.value;
    registro.manual = { estilo: POR_ID[registro.especieId]?.estilos?.[0] || registro.manual.estilo };
    pintarManual(registro, cont, op);
  });
  $('[data-estilo]', cont).addEventListener('change', (e) => {
    registro.manual = { estilo: e.target.value };
    pintarManual(registro, cont, op);
  });
  enlazarComunes(registro, cont, op);
}

function siluetaEditable(lienzo, registro, op) {
  const { svg, W, H } = lienzo;
  const capa = el('g', {}, svg);
  const s = registro.manual.silueta;
  const redibujar = () => {
    capa.innerHTML = '';
    const pts = dibujarSilueta(capa, (p) => [p.x * W, p.y * H], s, W);
    [['apice', pts.a], ['izquierda', pts.i], ['derecha', pts.d]].forEach(([k, [x, y]]) => {
      const asa = el('circle', { class: 'asa', cx: x, cy: y, r: 30 }, capa);
      asa.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        asa.setPointerCapture(ev.pointerId);
        const mover = (m) => {
          const pt = new DOMPoint(m.clientX, m.clientY).matrixTransform(svg.getScreenCTM().inverse());
          s[k] = { x: Math.min(1, Math.max(0, pt.x / W)), y: Math.min(1, Math.max(0, pt.y / H)) };
          asa.setAttribute('cx', pt.x);
          asa.setAttribute('cy', pt.y);
          const otros = capa.querySelector('.silueta-guia');
          const a = [s.apice.x * W, s.apice.y * H], i = [s.izquierda.x * W, s.izquierda.y * H], d = [s.derecha.x * W, s.derecha.y * H];
          otros.setAttribute('points', `${a} ${i} ${d}`);
        };
        const soltar = () => {
          asa.removeEventListener('pointermove', mover);
          redibujar();
          op.alCambiarManual?.(registro);
        };
        asa.addEventListener('pointermove', mover);
        asa.addEventListener('pointerup', soltar, { once: true });
        asa.addEventListener('pointercancel', soltar, { once: true });
      });
    });
  };
  redibujar();
}
