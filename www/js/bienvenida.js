// Bienvenida: en pocos toques, sin escribir casi nada, queda creado tu bonsái
// y tu kodama. También sirve para agregar otro bonsái después.
import { POR_ID, ESPECIES } from './especies.js';
import { arbolSVG } from './arbol.js';
import { fotoEspecie } from './enciclopedia.js';
import { kodamaSVG, COLORES, reaccionar } from './kodama.js';
import { crearBonsai, kodama, guardarKodama, marcarBienvenida } from './almacen.js';
import { reprogramarRiego } from './alertas.js';
import { sonidos, vibrar } from './sonido.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const POPULARES = [
  ['junipero', 'Junípero', 'Pino junípero, enebro', 'conifera'],
  ['ficus-retusa', 'Ficus', 'Retusa, ginseng, microcarpa', 'tropical'],
  ['olmo-chino', 'Olmo chino', 'Hojitas aserradas', 'caducifolio'],
  ['carmona', 'Carmona', 'Té de Fukien', 'tropical'],
  ['portulacaria', 'Portulacaria', 'Árbol de la abundancia', 'suculenta'],
  ['buganvilla', 'Buganvilla', 'Veranera', 'floracion'],
  ['azalea', 'Azalea', 'Satsuki', 'floracion'],
  ['pino-patula', 'Pino', 'Pátula, negro japonés', 'conifera'],
];

export function abrirBienvenida({ primera = true, alTerminar } = {}) {
  const datos = { especieId: '', condiciones: { clima: 'frio', ubicacion: 'exterior', maceta: 'mediana' }, riego: null, nombre: '', avisoRiego: true };
  const k = kodama();
  const raiz = document.createElement('div');
  raiz.className = 'bienvenida';
  raiz.innerHTML = `<div class="bv-progreso"><i></i></div><button class="icono-boton bv-atras" aria-label="Atrás" hidden><svg><use href="#ico-volver"/></svg></button>${primera ? '' : '<button class="icono-boton bv-cerrar" aria-label="Cerrar"><svg><use href="#ico-cerrar"/></svg></button>'}<div class="bv-escena"></div>`;
  document.body.appendChild(raiz);
  requestAnimationFrame(() => raiz.classList.add('abierta'));
  const escena = raiz.querySelector('.bv-escena');
  const historial = [];

  const pasos = {
    hola: () => `
      <div class="bv-centro">
        <div class="bv-duo">
          <div class="bv-arbol">${arbolSVG({ grupo: 'conifera', nace: true })}</div>
          <div class="bv-kodama">${kodamaSVG(k, { expresion: 'feliz' })}</div>
        </div>
        <h1 class="bv-titulo">Hola, soy tu kodama</h1>
        <p class="bv-texto">En Japón, los <strong>kodama</strong> son los espíritus que viven en los árboles. Yo voy a vivir en tu bonsái: te digo cuándo regarlo, cómo podarlo y crezco contigo cada vez que lo cuidas.</p>
        <button class="boton primario grande ancho" data-sig="especie">Empezar</button>
      </div>`,
    especie: () => `
      <h2 class="bv-pregunta">¿Qué árbol tienes?</h2>
      <p class="bv-texto">Toca el tuyo. Si no sabes, después le tomamos una foto.</p>
      <div class="bv-rejilla">${POPULARES.map(([id, n, sub, g], i) => `
        <button class="bv-opcion especie" data-especie="${id}" style="--i:${i}">
          <span class="mini foto-opcion">${fotoEspecie(id === 'junipero' ? 'junipero-procumbens' : id, { perezosa: false })}</span><strong>${n}</strong><small>${sub}</small></button>`).join('')}
      </div>
      <details class="bv-otra"><summary>Otra especie</summary>
        <select data-otra><option value="">— Elige —</option>${ESPECIES.map((e) => `<option value="${e.id}">${esc(e.nombre)}</option>`).join('')}</select></details>
      <button class="boton texto ancho" data-especie="">No sé qué especie es</button>`,
    junipero: () => `
      <h2 class="bv-pregunta">Mira sus hojitas de cerca</h2>
      <p class="bv-texto">Hay dos juníperos muy comunes. ¿Cuál se parece al tuyo?</p>
      <div class="bv-rejilla dos">
        <button class="bv-opcion grande" data-especie="junipero-procumbens" style="--i:0">
          <svg viewBox="0 0 120 90" class="lupa"><circle cx="60" cy="45" r="42" fill="#e8efe2"/>
            <path d="M24 60 Q60 40 96 30" stroke="#7b4a33" stroke-width="4" fill="none"/>
            ${Array.from({ length: 12 }, (_, i) => { const x = 30 + i * 5.6, y = 57 - i * 2.4; return `<path d="M${x},${y} l${-5 + (i % 2) * 2},-12 M${x + 2},${y - 1} l${6 - (i % 3)},-11 M${x + 1},${y} l${3},${10}" stroke="${i % 2 ? '#5d8f8a' : '#4f7d78'}" stroke-width="2" stroke-linecap="round"/>`; }).join('')}</svg>
          <strong>Agujitas que pinchan</strong><small>Verde azulado, crece rastrero</small><em>Junípero procumbens</em></button>
        <button class="bv-opcion grande" data-especie="junipero-chinensis" style="--i:1">
          <svg viewBox="0 0 120 90" class="lupa"><circle cx="60" cy="45" r="42" fill="#e8efe2"/>
            <path d="M24 62 Q60 42 96 30" stroke="#7b4a33" stroke-width="4" fill="none"/>
            ${Array.from({ length: 9 }, (_, i) => { const x = 30 + i * 7.5, y = 58 - i * 3.2; return `<path d="M${x},${y} q6,-12 12,-14 q-2,10 -12,14z" fill="${i % 2 ? '#4f8a5a' : '#3f7a4c'}"/><path d="M${x},${y} q-4,-10 0,-16 q4,8 0,16z" fill="#5f9a68"/>`; }).join('')}</svg>
          <strong>Escamitas suaves</strong><small>Como ciprés, en almohadillas</small><em>Junípero chino / shimpaku</em></button>
      </div>
      <button class="boton texto ancho" data-especie="junipero-procumbens">No estoy seguro (el más común es el primero)</button>`,
    lugar: () => {
      const e = POR_ID[datos.especieId];
      return `
      <h2 class="bv-pregunta">¿Dónde vive?</h2>
      <div class="bv-grupo"><span class="bv-etq">Lugar</span><div class="bv-fila" data-campo="ubicacion">
        ${[['exterior', 'Afuera al sol', 'sol'], ['sombra', 'Afuera en sombra', 'nube'], ['interior', 'Adentro', 'casa']].map(([v, t, ic], i) => `<button class="bv-chip ${datos.condiciones.ubicacion === v ? 'activo' : ''}" data-v="${v}" style="--i:${i}"><svg><use href="#ico-${ic}"/></svg>${t}</button>`).join('')}
      </div></div>
      <div class="bv-alerta" ${e?.ubicacion === 'exterior' && datos.condiciones.ubicacion === 'interior' ? '' : 'hidden'}>
        ${kodamaSVG(k, { expresion: 'sed', clase: 'mini' })}<p><strong>Ojo:</strong> ${esc(e?.nombre.split(' (')[0] || 'Esta especie')} necesita sol directo. Adentro se debilita en pocos meses. Si puedes, ponlo en un balcón o ventana abierta con sol.</p></div>
      <div class="bv-grupo"><span class="bv-etq">Clima</span><div class="bv-fila" data-campo="clima">
        ${[['frio', 'Frío', 'Bogotá, sabana'], ['templado', 'Templado', 'Medellín, Eje'], ['calido', 'Cálido', 'Cali, costa']].map(([v, t, s], i) => `<button class="bv-chip ${datos.condiciones.clima === v ? 'activo' : ''}" data-v="${v}" style="--i:${i + 3}">${t}<small>${s}</small></button>`).join('')}
      </div></div>
      <div class="bv-grupo"><span class="bv-etq">Maceta</span><div class="bv-fila" data-campo="maceta">
        ${[['pequena', 'Pequeña', 14], ['mediana', 'Mediana', 20], ['grande', 'Grande', 27]].map(([v, t, w], i) => `<button class="bv-chip ${datos.condiciones.maceta === v ? 'activo' : ''}" data-v="${v}" style="--i:${i + 6}"><svg viewBox="0 0 30 20" style="width:${w}px;height:auto"><path d="M2 4 H28 L25 18 H5 Z" fill="currentColor" opacity=".7"/></svg>${t}</button>`).join('')}
      </div></div>
      <button class="boton primario grande ancho" data-sig="riego">Siguiente</button>`;
    },
    riego: () => `
      <h2 class="bv-pregunta">¿Cuándo lo regaste por última vez?</h2>
      <div class="bv-lista">
        ${[['0', 'Hoy'], ['1', 'Ayer'], ['3', 'Hace 2 o 3 días'], ['7', 'Hace una semana o más'], ['', 'No me acuerdo']].map(([v, t], i) => `<button class="bv-opcion fila" data-riego="${v}" style="--i:${i}"><svg><use href="#ico-gota"/></svg>${t}</button>`).join('')}
      </div>`,
    nombre: () => `
      <h2 class="bv-pregunta">Ponle nombre</h2>
      <div class="bv-duo chico">
        <div class="bv-arbol">${arbolSVG({ grupo: POR_ID[datos.especieId]?.grupo || 'conifera' })}</div>
        ${primera ? `<div class="bv-kodama vivo">${kodamaSVG(k, { expresion: 'feliz' })}</div>` : ''}
      </div>
      <label class="bv-campo">Tu bonsái<input data-nombre type="text" maxlength="30" value="${esc(datos.nombre || (POR_ID[datos.especieId] ? `Mi ${POR_ID[datos.especieId].nombre.split(/[ (/]/)[0].toLowerCase()}` : 'Mi bonsái'))}"></label>
      ${primera ? `
        <label class="bv-campo">Tu kodama<input data-kodama type="text" maxlength="20" value="${esc(k.nombre)}"></label>
        <div class="bv-colores">${Object.entries(COLORES).filter(([, c]) => c.nivel <= 1).map(([id, c]) => `<button class="color ${k.color === id ? 'activo' : ''}" data-color="${id}" style="--c:${c.cuerpo}" aria-label="${c.nombre}"></button>`).join('')}
          <span class="meta">Más colores y accesorios se desbloquean cuidando tu árbol.</span></div>` : ''}
      <label class="bv-interruptor"><input type="checkbox" data-aviso checked><span></span>Avisarme cuando toque revisar la tierra</label>
      <button class="boton primario grande ancho" data-crear>Listo</button>`,
    fin: () => `
      <div class="bv-centro">
        <div class="bv-duo">
          <div class="bv-arbol">${arbolSVG({ grupo: POR_ID[datos.especieId]?.grupo || 'conifera', nace: true })}</div>
          <div class="bv-kodama">${kodamaSVG(kodama(), { expresion: 'feliz' })}</div>
        </div>
        <h1 class="bv-titulo">¡${esc(datos.nombre)} ya tiene su kodama!</h1>
        <p class="bv-texto">Cada día te muestro qué toca. Cuando lo cuides, gano experiencia y desbloqueo cosas nuevas.</p>
        <button class="boton primario grande ancho" data-cerrar>Ver a ${esc(datos.nombre)}</button>
      </div>`,
  };
  const orden = ['hola', 'especie', 'junipero', 'lugar', 'riego', 'nombre', 'fin'];

  function ir(paso, atras = false) {
    if (!atras && escena.dataset.paso) historial.push(escena.dataset.paso);
    escena.dataset.paso = paso;
    raiz.querySelector('.bv-progreso i').style.width = `${(orden.indexOf(paso) / (orden.length - 1)) * 100}%`;
    raiz.querySelector('.bv-atras').hidden = !historial.length || paso === 'fin';
    escena.classList.remove('entra', 'entra-atras');
    void escena.offsetWidth;
    escena.classList.add(atras ? 'entra-atras' : 'entra');
    escena.innerHTML = pasos[paso]();
    escena.scrollTop = 0;
    enlazar(paso);
  }

  function enlazar(paso) {
    escena.querySelectorAll('[data-sig]').forEach((b) => (b.onclick = () => (sonidos.pop(), ir(b.dataset.sig))));
    escena.querySelectorAll('[data-especie]').forEach((b) =>
      (b.onclick = () => {
        sonidos.pop();
        vibrar(8);
        b.classList.add('elegido');
        const v = b.dataset.especie;
        setTimeout(() => {
          if (v === 'junipero') return ir('junipero');
          datos.especieId = v;
          const e = POR_ID[v];
          if (e?.ubicacion === 'interior') datos.condiciones.ubicacion = 'interior';
          ir('lugar');
        }, 220);
      }),
    );
    escena.querySelector('[data-otra]')?.addEventListener('change', (ev) => {
      datos.especieId = ev.target.value;
      if (datos.especieId) ir('lugar');
    });
    escena.querySelectorAll('[data-campo]').forEach((fila) =>
      fila.querySelectorAll('[data-v]').forEach((b) =>
        (b.onclick = () => {
          sonidos.pop();
          datos.condiciones[fila.dataset.campo] = b.dataset.v;
          fila.querySelectorAll('.bv-chip').forEach((x) => x.classList.toggle('activo', x === b));
          const e = POR_ID[datos.especieId];
          const alerta = escena.querySelector('.bv-alerta');
          const mostrar = e?.ubicacion === 'exterior' && datos.condiciones.ubicacion === 'interior';
          if (mostrar && alerta.hidden) vibrar(20);
          alerta.hidden = !mostrar;
        }),
      ),
    );
    escena.querySelectorAll('[data-riego]').forEach((b) =>
      (b.onclick = () => {
        sonidos.pop();
        datos.riego = b.dataset.riego === '' ? null : Number(b.dataset.riego);
        ir('nombre');
      }),
    );
    escena.querySelectorAll('[data-color]').forEach((b) =>
      (b.onclick = () => {
        guardarKodama({ color: b.dataset.color });
        escena.querySelectorAll('[data-color]').forEach((x) => x.classList.toggle('activo', x === b));
        escena.querySelector('.bv-kodama').innerHTML = kodamaSVG(kodama(), { expresion: 'feliz' });
        reaccionar(escena.querySelector('.bv-kodama'), 'salto');
        sonidos.pop();
      }),
    );
    escena.querySelector('.bv-kodama.vivo')?.addEventListener('click', (ev) => (reaccionar(ev.currentTarget, 'mimo'), sonidos.traqueteo()));
    escena.querySelector('[data-crear]')?.addEventListener('click', async () => {
      datos.nombre = escena.querySelector('[data-nombre]').value.trim() || 'Mi bonsái';
      const nk = escena.querySelector('[data-kodama]')?.value.trim();
      if (nk) guardarKodama({ nombre: nk });
      datos.avisoRiego = escena.querySelector('[data-aviso]').checked;
      const eventos = { riego: datos.riego === null ? [] : [new Date(Date.now() - datos.riego * 864e5).toISOString()] };
      try {
        const b = crearBonsai({ nombre: datos.nombre, especieId: datos.especieId, condiciones: datos.condiciones, avisoRiego: datos.avisoRiego, eventos });
        if (primera) marcarBienvenida();
        reprogramarRiego(b).catch(() => {});
        sonidos.logro();
        ir('fin');
        datos.creado = b;
      } catch (err) {
        alert(err.message);
      }
    });
    escena.querySelector('[data-cerrar]')?.addEventListener('click', () => cerrar(datos.creado));
    if (paso === 'hola' || paso === 'fin') setTimeout(() => reaccionar(escena.querySelector('.bv-kodama'), paso === 'fin' ? 'festejo' : 'salto'), 1400);
  }

  function cerrar(creado) {
    raiz.classList.remove('abierta');
    raiz.classList.add('cerrando');
    setTimeout(() => raiz.remove(), 400);
    alTerminar?.(creado || null);
  }

  raiz.querySelector('.bv-atras').onclick = () => historial.length && ir(historial.pop(), true);
  raiz.querySelector('.bv-cerrar')?.addEventListener('click', () => cerrar(null));
  ir(primera ? 'hola' : 'especie');
}
