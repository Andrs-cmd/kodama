// Guías interactivas paso a paso, en una hoja que sube desde abajo:
// regar (mantén presionado), pinzar (toca los brotes), alambrar (desliza la línea
// de tiempo) y abonar. Si hay un bonsái, al final se anota el cuidado.
import { arbolSVG, revivir } from './arbol.js';
import { kodamaSVG, reaccionar } from './kodama.js';
import { cuerpo, curva, nube, semilla, lerp, mezclarColor, reducirMovimiento } from './geom.js';
import { registrar, actualizarBonsai, especieDe, estadoRiego, leccionHecha, kodama } from './almacen.js';
import { crear as crearAlerta, reprogramarRiego } from './alertas.js';
import { sonidos, vibrar } from './sonido.js';
import { textoFrecuencia } from './riego.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const $ = (s, r) => r.querySelector(s);

// ---------- Hoja inferior ----------
export function abrirHoja(titulo, { alCerrar } = {}) {
  const raiz = document.createElement('div');
  raiz.className = 'hoja';
  raiz.innerHTML = `
    <div class="hoja-fondo"></div>
    <section class="hoja-panel" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
      <div class="hoja-asa" aria-hidden="true"></div>
      <header class="hoja-cabeza"><h2>${esc(titulo)}</h2><div class="pasos-puntos"></div>
        <button class="icono-boton" data-cerrar aria-label="Cerrar"><svg><use href="#ico-cerrar"/></svg></button></header>
      <div class="hoja-cuerpo"></div>
    </section>`;
  document.body.appendChild(raiz);
  document.body.classList.add('con-hoja');
  requestAnimationFrame(() => raiz.classList.add('abierta'));
  const cerrar = () => {
    raiz.classList.remove('abierta');
    raiz.classList.add('cerrando');
    document.body.classList.remove('con-hoja');
    document.removeEventListener('keydown', tecla);
    setTimeout(() => raiz.remove(), 320);
    alCerrar?.();
  };
  const tecla = (e) => e.key === 'Escape' && cerrar();
  document.addEventListener('keydown', tecla);
  $('.hoja-fondo', raiz).addEventListener('click', cerrar);
  $('[data-cerrar]', raiz).addEventListener('click', cerrar);
  return { raiz, cuerpo: $('.hoja-cuerpo', raiz), puntos: $('.pasos-puntos', raiz), cerrar };
}

// Corre una lista de pasos dentro de una hoja.
function correrPasos(titulo, pasos, ctxBase = {}) {
  const hoja = abrirHoja(titulo, { alCerrar: () => ctx.limpiar?.() });
  const ctx = { ...ctxBase, hoja, cerrar: hoja.cerrar };
  const visibles = pasos.filter((p) => !p.oculto);
  ctx.ir = (nombre) => {
    ctx.limpiar?.();
    ctx.limpiar = null;
    const paso = pasos.find((p) => p.id === nombre) || pasos[0];
    const i = visibles.indexOf(paso);
    hoja.puntos.innerHTML = visibles.map((_, j) => `<i class="${j < i ? 'hecho' : j === i ? 'actual' : ''}"></i>`).join('');
    hoja.cuerpo.classList.remove('entra');
    void hoja.cuerpo.offsetWidth;
    hoja.cuerpo.classList.add('entra');
    hoja.cuerpo.scrollTop = 0;
    paso.pintar(hoja.cuerpo, ctx);
  };
  ctx.ir(pasos[0].id);
  return ctx;
}

// Pantalla final con el kodama festejando.
function celebrar(cuerpoEl, { titulo, texto, xp = 0, ctx }) {
  cuerpoEl.innerHTML = `
    <div class="celebra">
      <div class="celebra-kodama">${kodamaSVG(kodama(), { expresion: 'feliz', clase: 'grande' })}</div>
      <svg class="check-dibujo" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27 l8 8 l15 -17"/></svg>
      <h3 class="titulo-medio">${esc(titulo)}</h3>
      <p>${texto}</p>
      ${xp ? `<p class="xp-ganada">+${xp} XP para ${esc(kodama().nombre)}</p>` : ''}
      <button class="boton primario grande ancho" data-fin>Listo</button>
    </div>`;
  sonidos.logro();
  vibrar(30);
  setTimeout(() => reaccionar($('.celebra-kodama', cuerpoEl), 'festejo'), 250);
  $('[data-fin]', cuerpoEl).addEventListener('click', ctx.cerrar);
}

// Gotas, granos, chispas: partículas DOM que caen con la Web Animations API.
function lanzar(escena, { desde, hasta, clase = 'gota-p', dur = 650, curvaY = 0 }) {
  const p = document.createElement('i');
  p.className = clase;
  escena.appendChild(p);
  const a = p.animate(
    [
      { transform: `translate(${desde[0]}px, ${desde[1]}px) scale(.8)`, opacity: 0.95 },
      { transform: `translate(${(desde[0] + hasta[0]) / 2}px, ${(desde[1] + hasta[1]) / 2 - curvaY}px) scale(1)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${hasta[0]}px, ${hasta[1]}px) scale(.6, .4)`, opacity: 0.2 },
    ],
    { duration: dur, easing: 'cubic-bezier(.45,0,.9,.6)' },
  );
  a.onfinish = () => p.remove();
}

const REGADERA = `
  <svg class="regadera" viewBox="0 0 120 90" aria-hidden="true">
    <path d="M30 30 h46 a6 6 0 0 1 6 6 v34 a10 10 0 0 1 -10 10 h-38 a10 10 0 0 1 -10 -10 v-34 a6 6 0 0 1 6 -6z" fill="#5b8fb0"/>
    <path d="M82 46 L112 22 l5 6 L86 58z" fill="#4a7a99"/><ellipse cx="114" cy="24" rx="5" ry="8" transform="rotate(-38 114 24)" fill="#3d6a87"/>
    <path d="M40 30 q13 -22 30 0" stroke="#4a7a99" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M32 44 h48" stroke="#fff" stroke-width="3" opacity=".25"/></svg>`;

const DEDO = `
  <svg class="dedo" viewBox="0 0 40 90" aria-hidden="true">
    <rect x="8" y="0" width="24" height="86" rx="12" fill="#e9b892"/><rect x="11" y="62" width="18" height="20" rx="8" fill="#f6d5c0"/>
    <path d="M10 20 h20 M10 40 h20" stroke="#c99472" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>`;

// ======================= REGAR =======================
export function flujoRegar(b, { alTerminar } = {}) {
  const e = especieDe(b);
  const grupo = e?.grupo || 'conifera';
  const pasos = [
    {
      id: 'revisar',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena escena-tierra">
            <svg viewBox="0 0 300 170" class="corte-maceta" aria-hidden="true">
              <path d="M40 40 H260 L246 160 H54 Z" fill="#6b4a38"/>
              <rect x="44" y="36" width="212" height="34" rx="4" fill="#8a6a4e"/>
              <rect x="44" y="70" width="212" height="70" fill="#5a4030"/>
              ${Array.from({ length: 26 }, (_, i) => `<circle cx="${52 + (i * 37) % 200}" cy="${44 + ((i * 53) % 90)}" r="${1.6 + (i % 3)}" fill="#c8b39a" opacity=".55"/>`).join('')}
              <path d="M44 36 h212" stroke="#3a2a20" stroke-width="2"/>
              <text x="262" y="56" class="marca-cm">1–2 cm</text><path d="M258 38 v28" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/>
            </svg>
            ${DEDO}
          </div>
          <p class="paso-texto"><strong>Antes de regar, toca la tierra.</strong> Mete un dedo (o un palillo) 1–2 cm. ${grupo === 'suculenta' ? 'Esta especie quiere la tierra totalmente seca.' : ''}</p>
          <div class="opciones-grandes">
            <button class="opcion-grande" data-r="seca"><span class="muestra seca"></span>Está seca<small>se siente polvosa, no se pega</small></button>
            <button class="opcion-grande" data-r="humeda"><span class="muestra humeda"></span>Está húmeda<small>fresca, se pega al dedo</small></button>
          </div>`;
        c.querySelector('[data-r="seca"]').onclick = () => (sonidos.pop(), ctx.ir('regar'));
        c.querySelector('[data-r="humeda"]').onclick = () => (sonidos.pop(), ctx.ir('esperar'));
      },
    },
    {
      id: 'esperar',
      oculto: true,
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena">${arbolSVG({ grupo, animo: 'bien' })}</div>
          <p class="paso-texto"><strong>Hoy no lo riegues.</strong> Si la tierra sigue húmeda, las raíces todavía tienen agua. Regar de más las pudre: es lo que más mata bonsáis.</p>
          ${b ? '<button class="boton primario grande ancho" data-manana>Recuérdame revisar mañana</button>' : ''}
          <button class="boton secundario grande ancho" data-cerrar-hoja>Entendido</button>`;
        c.querySelector('[data-cerrar-hoja]').onclick = ctx.cerrar;
        c.querySelector('[data-manana]')?.addEventListener('click', async () => {
          const manana = new Date(Date.now() + 864e5);
          manana.setHours(8, 0, 0, 0);
          actualizarBonsai(b.id, { posponerRiego: manana.toISOString() });
          const { xp } = registrar(b.id, 'revision');
          await reprogramarRiego({ ...b, posponerRiego: manana.toISOString() }).catch(() => {});
          alTerminar?.('revision');
          celebrar(c, { titulo: 'Te aviso mañana', texto: 'Revisar antes de regar es el mejor hábito de un bonsaísta.', xp, ctx });
        });
      },
    },
    {
      id: 'regar',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena escena-riego">
            ${arbolSVG({ grupo, animo: 'sed' })}
            ${REGADERA}
          </div>
          <div class="barra-agua" aria-hidden="true"><i></i></div>
          <p class="paso-texto" data-msg><strong>Mantén presionado el botón</strong> para regar despacio, por toda la superficie.</p>
          <button class="boton primario grande ancho boton-mantener" data-regar><svg><use href="#ico-gota"/></svg><span>Mantén presionado para regar</span></button>
          <button class="boton primario grande ancho" data-sig hidden>Siguiente</button>`;
        const escena = c.querySelector('.escena-riego');
        const arbol = escena.querySelector('.arbol');
        const tierra = arbol.querySelector('.tierra');
        const barra = c.querySelector('.barra-agua i');
        const boton = c.querySelector('[data-regar]');
        const msg = c.querySelector('[data-msg]');
        let progreso = 0, presionado = false, ultimoT = 0, ultimaGota = 0, raf = 0, listo = false;
        tierra.style.fill = '#a07d5c';

        const paso = (t) => {
          raf = requestAnimationFrame(paso);
          const dt = ultimoT ? t - ultimoT : 16;
          ultimoT = t;
          if (!presionado || listo) return;
          progreso = Math.min(1, progreso + dt / 3200);
          barra.style.width = `${progreso * 100}%`;
          tierra.style.fill = mezclarColor('#a07d5c', '#3b2a1e', progreso);
          if (progreso > 0.45) arbol.dataset.animo = 'bien';
          const r = escena.getBoundingClientRect();
          if (t - ultimaGota > 55) {
            ultimaGota = t;
            sonidos.gota();
            lanzar(escena, { desde: [r.width * 0.74, r.height * 0.2], hasta: [r.width * (0.3 + Math.random() * 0.4), r.height * 0.74], dur: 520 + Math.random() * 200, curvaY: 10 });
          }
          if (progreso >= 1) {
            listo = true;
            presionado = false;
            escena.classList.remove('vertiendo');
            revivir(arbol);
            vibrar(25);
            for (let i = 0; i < 6; i++) setTimeout(() => lanzar(escena, { desde: [r.width * (0.4 + Math.random() * 0.2), r.height * 0.9], hasta: [r.width * (0.4 + Math.random() * 0.2), r.height * 1.02], clase: 'gota-p chica', dur: 600 }), i * 140);
            msg.innerHTML = '<strong>¡Así!</strong> El agua salió por los agujeros de abajo: la tierra quedó mojada de arriba a abajo.';
            boton.hidden = true;
            c.querySelector('[data-sig]').hidden = false;
          }
        };
        raf = requestAnimationFrame(paso);
        const iniciar = (ev) => {
          ev.preventDefault();
          if (listo) return;
          presionado = true;
          escena.classList.add('vertiendo');
          boton.classList.add('presionado');
          vibrar(8);
        };
        const soltar = () => {
          presionado = false;
          escena.classList.remove('vertiendo');
          boton.classList.remove('presionado');
          if (!listo && progreso > 0.05) msg.innerHTML = `<strong>Sigue un poco más…</strong> ${Math.round(progreso * 100)} %. Hasta que el agua salga por abajo.`;
        };
        boton.addEventListener('pointerdown', iniciar);
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => boton.addEventListener(ev, soltar));
        boton.addEventListener('keydown', (ev) => (ev.key === ' ' || ev.key === 'Enter') && !ev.repeat && iniciar(ev));
        boton.addEventListener('keyup', soltar);
        ctx.limpiar = () => cancelAnimationFrame(raf);
        c.querySelector('[data-sig]').onclick = () => ctx.ir(grupo === 'conifera' ? 'pulverizar' : 'fin');
      },
    },
    {
      id: 'pulverizar',
      oculto: grupo !== 'conifera',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena escena-niebla">${arbolSVG({ grupo, animo: 'bien' })}</div>
          <p class="paso-texto"><strong>Extra para tu ${esc((e?.nombre || 'conífera').split(' (')[0].toLowerCase())}:</strong> le encanta que le pulvericen el follaje. Limpia el polvo y le da humedad. Toca el botón un par de veces.</p>
          <button class="boton primario grande ancho" data-spray>Pulverizar</button>
          <button class="boton texto ancho" data-sig>Saltar</button>`;
        const escena = c.querySelector('.escena-niebla');
        let veces = 0;
        c.querySelector('[data-spray]').onclick = () => {
          veces++;
          sonidos.suave();
          vibrar(6);
          const r = escena.getBoundingClientRect();
          for (let i = 0; i < 14; i++) lanzar(escena, { desde: [r.width * 0.92, r.height * 0.4], hasta: [r.width * (0.2 + Math.random() * 0.6), r.height * (0.15 + Math.random() * 0.4)], clase: 'niebla-p', dur: 900 + Math.random() * 500 });
          revivir(escena.querySelector('.arbol'));
          if (veces >= 2) c.querySelector('[data-sig]').textContent = 'Siguiente';
        };
        c.querySelector('[data-sig]').onclick = () => ctx.ir('fin');
      },
    },
    {
      id: 'fin',
      pintar: async (c, ctx) => {
        if (!b) {
          const xp = leccionHecha('regar');
          return celebrar(c, { titulo: '¡Aprendiste a regar!', texto: 'Revisa la tierra, y si está seca, riega hasta que salga agua por abajo.', xp, ctx });
        }
        const { bonsai, xp } = registrar(b.id, 'riego');
        await reprogramarRiego(bonsai).catch(() => {});
        alTerminar?.('riego');
        const r = estadoRiego(bonsai);
        celebrar(c, { titulo: 'Riego anotado', texto: `Próxima revisión: <strong>${r.dias <= 1 ? 'mañana' : `en ${r.dias} días`}</strong> (${esc(textoFrecuencia(r.cada))}). Te aviso cuando toque.`, xp, ctx });
      },
    },
  ];
  return correrPasos(b ? `Regar a ${b.nombre}` : 'Cómo regar', pasos);
}

// ======================= PINZAR / PODAR =======================
export function flujoPinzar(b, { alTerminar } = {}) {
  const e = especieDe(b);
  const conifera = (e?.grupo || 'conifera') === 'conifera';
  const nombre = conifera ? 'pinzar' : 'podar';
  const herramienta = conifera ? 'los dedos' : 'la tijera';
  const pasos = [
    {
      id: 'intro',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena escena-mano">
            <svg viewBox="0 0 300 200" aria-hidden="true">
              <path d="M40 150 Q140 120 230 92" stroke="#7b4a33" stroke-width="9" fill="none" stroke-linecap="round"/>
              <path class="brote-demo" d="M228 92 Q250 80 270 66" stroke="${conifera ? '#4f8a5f' : '#4f8a3c'}" stroke-width="6" fill="none" stroke-linecap="round"/>
              ${conifera ? '' : '<ellipse cx="258" cy="70" rx="10" ry="5" fill="#5e9c45" transform="rotate(-30 258 70)"/><ellipse cx="246" cy="84" rx="10" ry="5" fill="#5e9c45" transform="rotate(20 246 84)"/>'}
              <g class="pinza-demo">
                ${conifera
                  ? '<ellipse class="yema-a" cx="248" cy="58" rx="9" ry="13" fill="#e9b892"/><ellipse class="yema-b" cx="262" cy="96" rx="9" ry="13" fill="#e9b892"/>'
                  : '<g class="tijera-demo"><path d="M236 50 L254 80" stroke="#9aa4ad" stroke-width="5" stroke-linecap="round"/><path d="M270 54 L250 82" stroke="#9aa4ad" stroke-width="5" stroke-linecap="round"/><circle cx="232" cy="44" r="7" fill="none" stroke="#c2412d" stroke-width="4"/><circle cx="274" cy="48" r="7" fill="none" stroke="#c2412d" stroke-width="4"/></g>'}
              </g>
            </svg>
          </div>
          <p class="paso-texto"><strong>${conifera ? 'Pinzar es quitar la puntica de los brotes que se alargan.' : 'Podar es recortar los brotes que se salen de la forma.'}</strong>
          ${esc(conifera ? (e?.poda?.mantenimiento || 'Con los dedos, tira de las puntas que sobresalen. Nunca cortes el follaje con tijera por la mitad: se pone café.') : e?.poda?.mantenimiento || 'Deja crecer el brote y córtalo dejando 2 hojas.')}</p>
          <div class="regla"><svg><use href="#ico-info"/></svg>${conifera ? 'Deja siempre verde en la punta de cada rama: una rama sin verde en la punta se seca.' : 'Corta justo encima de una hoja que mire hacia afuera.'}</div>
          <button class="boton primario grande ancho" data-sig>Practicar aquí</button>`;
        c.querySelector('[data-sig]').onclick = () => ctx.ir('practica');
      },
    },
    {
      id: 'practica',
      pintar: (c, ctx) => {
        const rnd = semilla(3);
        // Nacen en el borde de la nube (cx 160, cy 140, 250 × 96) y salen hacia afuera.
        const brotes = [[54, 138, -150], [98, 122, -115], [160, 117, -88], [222, 122, -62], [271, 140, -28]];
        const color = conifera ? ['#24493a', '#3d6b51', '#6a9a72'] : ['#2f6a2c', '#4b8b3b', '#7db457'];
        c.innerHTML = `
          <div class="escena escena-practica">
            <svg viewBox="0 0 320 210" class="pad-practica">
              <path d="${curva([[0, 196], [80, 186], [160, 170], [210, 160]])}" stroke="#7b4a33" stroke-width="12" fill="none" stroke-linecap="round"/>
              <path d="${nube(160, 140, 250, 96, { k: 9, rnd, bulto: 0.4 })}" fill="${color[0]}" transform="translate(0 5)"/>
              <path class="pad-zona" d="${nube(160, 140, 250, 96, { k: 9, rnd: semilla(3), bulto: 0.4 })}" fill="${color[1]}"/>
              <path d="${nube(150, 128, 170, 56, { k: 7, rnd, bulto: 0.4 })}" fill="${color[2]}" opacity=".8" pointer-events="none"/>
              ${brotes.map(([x, y, ang], i) => {
                const rad = (ang * Math.PI) / 180;
                const m = [x + Math.cos(rad) * 18, y + Math.sin(rad) * 18];
                const f = [x + Math.cos(rad) * 42, y + Math.sin(rad) * 42];
                return `<g class="brote-largo" data-i="${i}" tabindex="0" role="button" aria-label="Brote largo ${i + 1}">
                  <circle cx="${f[0]}" cy="${f[1]}" r="22" fill="transparent"/>
                  <path class="tallo" d="M${x},${y} L${m[0]},${m[1]}" stroke="${color[2]}" stroke-width="7" stroke-linecap="round"/>
                  <path class="punta" d="M${m[0]},${m[1]} L${f[0]},${f[1]}" stroke="${color[2]}" stroke-width="6" stroke-linecap="round" style="transform-origin:${m[0]}px ${m[1]}px"/>
                  ${conifera ? '' : `<ellipse class="punta" cx="${f[0]}" cy="${f[1]}" rx="9" ry="5" fill="${color[2]}" transform="rotate(${ang} ${f[0]} ${f[1]})"/>`}
                  <circle class="pulso" cx="${f[0]}" cy="${f[1]}" r="10" fill="none" stroke="#fff" stroke-width="2"/>
                </g>`;
              }).join('')}
            </svg>
            <div class="aviso-burbuja" hidden></div>
          </div>
          <p class="paso-texto"><strong>Toca las puntas que se salen de la nube</strong> para ${nombre}las con ${herramienta}. <span class="contador">0 / ${brotes.length}</span></p>`;
        let hechos = 0;
        const svg = c.querySelector('.pad-practica');
        const aviso = c.querySelector('.aviso-burbuja');
        const decir = (t) => {
          aviso.textContent = t;
          aviso.hidden = false;
          clearTimeout(decir.t);
          decir.t = setTimeout(() => (aviso.hidden = true), 2200);
        };
        svg.querySelectorAll('.brote-largo').forEach((g) => {
          const pinzar = (ev) => {
            ev.stopPropagation();
            if (g.classList.contains('pinzado')) return;
            g.classList.add('pinzado');
            sonidos.pinza();
            vibrar(15);
            hechos++;
            c.querySelector('.contador').textContent = `${hechos} / ${brotes.length}`;
            if (hechos === 1) decir(conifera ? '¡Eso! Una puntica, con los dedos.' : '¡Bien! Justo encima de la hoja.');
            if (hechos === brotes.length) {
              decir('¡Perfecto! La nube quedó compacta.');
              setTimeout(() => ctx.ir('fin'), 1100);
            }
          };
          g.addEventListener('click', pinzar);
          g.addEventListener('keydown', (ev) => ev.key === 'Enter' && pinzar(ev));
        });
        svg.querySelector('.pad-zona').addEventListener('click', () =>
          decir(conifera ? 'Esa parte déjala: solo se pinzan las puntas que sobresalen.' : 'Ahí no: solo lo que se sale de la forma.'),
        );
      },
    },
    {
      id: 'fin',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="celebra">
            <div class="celebra-kodama">${kodamaSVG(kodama(), { expresion: 'feliz', clase: 'grande' })}</div>
            <h3 class="titulo-medio">¡Lo hiciste muy bien!</h3>
            <p>Ahora hazlo en tu árbol: busca las puntas que se salen de cada nube. ${conifera ? 'Pinza poco a poco, nunca todo el árbol el mismo día.' : 'No quites más de un tercio del follaje a la vez.'}</p>
            ${b ? `<button class="boton primario grande ancho" data-hice>Ya lo hice en ${esc(b.nombre)}</button>` : ''}
            <button class="boton secundario grande ancho" data-practica>${b ? 'Solo estaba practicando' : 'Terminar'}</button>
          </div>`;
        reaccionar(c.querySelector('.celebra-kodama'), 'salto');
        c.querySelector('[data-hice]')?.addEventListener('click', () => {
          const { xp } = registrar(b.id, 'pinzado');
          alTerminar?.('pinzado');
          celebrar(c, { titulo: conifera ? 'Pinzado anotado' : 'Poda anotada', texto: 'Vuelve a revisar los brotes en dos semanas.', xp, ctx });
        });
        c.querySelector('[data-practica]').onclick = () => {
          const xp = leccionHecha('pinzar');
          alTerminar?.('leccion');
          if (xp) celebrar(c, { titulo: 'Lección aprendida', texto: 'Ya sabes cómo se hace.', xp, ctx });
          else ctx.cerrar();
        };
      },
    },
  ];
  return correrPasos(conifera ? 'Pinzar' : 'Poda de mantenimiento', pasos);
}

// ======================= ALAMBRAR =======================
export function flujoAlambrar(b, { alTerminar } = {}) {
  const e = especieDe(b);
  const etapas = [
    { hasta: 20, titulo: '1. Elige el alambre', texto: 'Debe tener 1/3 del grosor de la rama. Aluminio para empezar: es blando y fácil de quitar.' },
    { hasta: 65, titulo: '2. Enróllalo a 45°', texto: 'Ancla el alambre en el tronco y enróllalo en espiral hasta la punta: ni apretado ni flojo, sin cruzar alambres.' },
    { hasta: 101, titulo: '3. Dobla despacio', texto: 'Con los pulgares por fuera de la curva, baja la rama poco a poco. Si cruje, para ahí.' },
  ];
  const pasos = [
    {
      id: 'leccion',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena escena-alambre"><svg viewBox="0 0 320 220" aria-hidden="true">
            <rect x="0" y="0" width="320" height="220" fill="transparent"/>
            <path d="${cuerpo([[52, 220], [56, 150], [50, 80], [56, 0]], 40, 28)}" fill="#7b4a33"/>
            <g class="calibre"><path d="M120 196 h70" stroke="#c87a3a" stroke-width="4" stroke-linecap="round"/><text x="196" y="200" class="etq">1/3 del grosor</text></g>
            <path class="ancla" d="" stroke="#c87a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path class="rama-l" fill="#8a5a3e"/>
            <path class="alambre-l" stroke="#d58944" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path class="alambre-brillo" stroke="#ffd9a8" stroke-width="1" fill="none" stroke-linecap="round" opacity=".7"/>
            <g class="nube-l"><path d="${nube(0, 0, 70, 30, { k: 6, rnd: semilla(5), bulto: 0.45 })}" fill="#3d6b51"/><path d="${nube(-4, -5, 48, 18, { k: 5, rnd: semilla(9), bulto: 0.45 })}" fill="#6a9a72"/></g>
            <g class="angulo"><circle r="16" fill="#1d1b18" opacity=".75"/><text class="etq-b" text-anchor="middle" dy="4">45°</text></g>
          </svg></div>
          <h3 class="titulo-etapa"></h3>
          <p class="paso-texto texto-etapa"></p>
          <div class="linea-tiempo">
            <button class="icono-boton play" aria-label="Reproducir"><svg><use href="#ico-play"/></svg></button>
            <input type="range" min="0" max="100" value="0" aria-label="Avance de la lección">
          </div>
          <p class="meta centro">Desliza o dale play para ver cómo se hace.</p>
          <button class="boton primario grande ancho" data-sig hidden>Siguiente</button>`;
        const svg = c.querySelector('svg');
        const rango = c.querySelector('input');
        const rama = svg.querySelector('.rama-l');
        const alambre = svg.querySelector('.alambre-l');
        const brillo = svg.querySelector('.alambre-brillo');
        const ancla = svg.querySelector('.ancla');
        const nubeL = svg.querySelector('.nube-l');
        const ang = svg.querySelector('.angulo');
        const calibre = svg.querySelector('.calibre');
        const lim = (x) => Math.max(0, Math.min(1, x));
        let etapaActual = -1;

        const dibujar = (p) => {
          const doblez = lim((p - 65) / 35);
          const espiral = lim((p - 20) / 45);
          const centro = Array.from({ length: 26 }, (_, i) => {
            const t = i / 25;
            return [62 + 225 * t, 132 - 34 * t + doblez * (52 * Math.sin(Math.PI * t * 0.85)) - doblez * 22 * t ** 3];
          });
          rama.setAttribute('d', cuerpo(centro, 15, 5));
          const fin = centro.at(-1);
          nubeL.setAttribute('transform', `translate(${fin[0] + 4} ${fin[1] - 8}) rotate(${doblez * 6})`);
          // Espiral: sinusoide alrededor de la línea central.
          const vueltas = 11;
          const N = 260;
          const pts = [];
          for (let i = 0; i <= N * espiral; i++) {
            const t = 0.02 + (i / N) * 0.9;
            const k = Math.min(24, Math.floor(t * 25));
            const a = centro[k], bb = centro[Math.min(25, k + 1)];
            const f = t * 25 - k;
            const x = lerp(a[0], bb[0], f), y = lerp(a[1], bb[1], f);
            const dx = bb[0] - a[0], dy = bb[1] - a[1], l = Math.hypot(dx, dy) || 1;
            const w = lerp(15, 5, t) / 2 + 1.5;
            const s = Math.sin(2 * Math.PI * vueltas * t);
            pts.push([x + (-dy / l) * w * s + (dx / l) * 2.2 * Math.cos(2 * Math.PI * vueltas * t), y + (dx / l) * w * s]);
          }
          const d = pts.length > 1 ? `M${pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L')}` : '';
          alambre.setAttribute('d', d);
          brillo.setAttribute('d', d);
          ancla.setAttribute('d', espiral > 0 ? 'M70 128 Q50 150 58 178 Q66 196 54 214' : '');
          calibre.style.opacity = p < 22 ? 1 : 0;
          calibre.setAttribute('transform', `translate(${(1 - lim(p / 18)) * 40} 0)`);
          const last = pts.at(-1) || centro[1];
          ang.setAttribute('transform', `translate(${last[0] + 10} ${last[1] - 24})`);
          ang.style.opacity = espiral > 0 && espiral < 1 ? 1 : 0;
          const i = etapas.findIndex((x) => p < x.hasta);
          if (i !== etapaActual) {
            etapaActual = i;
            c.querySelector('.titulo-etapa').textContent = etapas[i].titulo;
            const tx = c.querySelector('.texto-etapa');
            tx.textContent = etapas[i].texto;
            tx.animate?.([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
            if (i > 0) sonidos.pop();
          }
          if (p >= 99) c.querySelector('[data-sig]').hidden = false;
        };
        dibujar(0);
        rango.addEventListener('input', () => dibujar(Number(rango.value)));
        let raf = 0;
        const play = c.querySelector('.play');
        play.onclick = () => {
          cancelAnimationFrame(raf);
          const inicio = performance.now();
          const desde = Number(rango.value) >= 100 ? 0 : Number(rango.value);
          const dur = reducirMovimiento() ? 1 : (100 - desde) * 70;
          const cuadro = (t) => {
            const v = Math.min(100, desde + ((t - inicio) / dur) * (100 - desde));
            rango.value = v;
            dibujar(v);
            if (v < 100) raf = requestAnimationFrame(cuadro);
          };
          raf = requestAnimationFrame(cuadro);
        };
        ctx.limpiar = () => cancelAnimationFrame(raf);
        c.querySelector('[data-sig]').onclick = () => ctx.ir('especie');
      },
    },
    {
      id: 'especie',
      pintar: (c, ctx) => {
        const al = e?.alambrado;
        c.innerHTML = `
          <h3 class="titulo-medio">${e ? `Alambrar tu ${esc(e.nombre.split(' (')[0].toLowerCase())}` : 'Antes de alambrar'}</h3>
          <div class="fichas-mini">
            <div><svg><use href="#ico-calendario"/></svg><strong>Cuándo</strong><span>${esc(al?.epoca || 'Cuando la especie lo permita.')}</span></div>
            <div><svg><use href="#ico-info"/></svg><strong>Ojo</strong><span>${esc(al?.consejo || 'Dobla despacio y protege la corteza.')}</span></div>
            <div><svg><use href="#ico-reloj"/></svg><strong>Retirar</strong><span>${esc(al?.retirar || 'Antes de que marque la corteza.')} Córtalo en trocitos, nunca lo desenrolles.</span></div>
          </div>
          ${b ? `<button class="boton primario grande ancho" data-puse>Le puse alambre hoy</button><p class="meta centro">Te pondré una alerta para revisarlo en 3 semanas.</p>` : ''}
          <button class="boton secundario grande ancho" data-solo>${b ? 'Solo estaba aprendiendo' : 'Terminar'}</button>`;
        c.querySelector('[data-puse]')?.addEventListener('click', async () => {
          const { xp } = registrar(b.id, 'alambre');
          const cuando = new Date(Date.now() + 21 * 864e5);
          cuando.setHours(9, 0, 0, 0);
          await crearAlerta({ titulo: `Revisa el alambre de ${b.nombre}`, cuerpo: 'Si empieza a marcar la corteza, córtalo en trocitos.', cuando, tipo: 'alambre', bonsaiId: b.id }).catch(() => {});
          alTerminar?.('alambre');
          celebrar(c, { titulo: 'Alambre anotado', texto: 'Te aviso en 3 semanas para revisar que no marque la corteza.', xp, ctx });
        });
        c.querySelector('[data-solo]').onclick = () => {
          const xp = leccionHecha('alambrar');
          alTerminar?.('leccion');
          if (xp) celebrar(c, { titulo: 'Lección aprendida', texto: 'Ya sabes alambrar una rama.', xp, ctx });
          else ctx.cerrar();
        };
      },
    },
  ];
  return correrPasos('Alambrar una rama', pasos);
}

// ======================= ABONAR =======================
export function flujoAbonar(b, { alTerminar } = {}) {
  const e = especieDe(b);
  const grupo = e?.grupo || 'conifera';
  const pasos = [
    {
      id: 'abonar',
      pintar: (c, ctx) => {
        c.innerHTML = `
          <div class="escena escena-abono">${arbolSVG({ grupo, animo: 'bien' })}</div>
          <p class="paso-texto"><strong>El abono es su comida.</strong> ${esc(e?.abono || 'Abona cada 2–4 semanas mientras crece.')}</p>
          <div class="regla"><svg><use href="#ico-info"/></svg>No abones si está enfermo, recién trasplantado o con la tierra seca: riega primero.</div>
          <button class="boton primario grande ancho" data-echar>Echar abono</button>
          <button class="boton primario grande ancho" data-sig hidden>${b ? `Aboné a ${esc(b.nombre)}` : 'Terminar'}</button>`;
        const escena = c.querySelector('.escena-abono');
        const fx = escena.querySelector('.fx');
        let veces = 0;
        c.querySelector('[data-echar]').onclick = () => {
          veces++;
          const r = escena.getBoundingClientRect();
          for (let i = 0; i < 5; i++) {
            const x = 0.28 + Math.random() * 0.44;
            setTimeout(() => {
              lanzar(escena, { desde: [r.width * x, r.height * 0.05], hasta: [r.width * x, r.height * 0.735], clase: 'grano-p', dur: 700 });
              setTimeout(() => {
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                Object.entries({ cx: 300 * x, cy: 216 + Math.random() * 4, r: 2.6, fill: '#d9c8a0', class: 'grano-queda' }).forEach(([k, v]) => g.setAttribute(k, v));
                fx.appendChild(g);
                sonidos.gota();
              }, 680);
            }, i * 110);
          }
          vibrar(10);
          if (veces >= 2) {
            c.querySelector('[data-echar]').hidden = true;
            c.querySelector('[data-sig]').hidden = false;
            setTimeout(() => revivir(escena.querySelector('.arbol')), 900);
          }
        };
        c.querySelector('[data-sig]').onclick = () => {
          if (!b) {
            const xp = leccionHecha('abonar');
            return celebrar(c, { titulo: 'Lección aprendida', texto: 'Abono poco y seguido, mejor que mucho de una vez.', xp, ctx });
          }
          const { xp } = registrar(b.id, 'abono');
          alTerminar?.('abono');
          celebrar(c, { titulo: 'Abono anotado', texto: 'Te recuerdo la próxima vez en la lista de tareas.', xp, ctx });
        };
      },
    },
  ];
  return correrPasos(b ? `Abonar a ${b.nombre}` : 'Cómo abonar', pasos);
}

export const FLUJOS = { regar: flujoRegar, pinzar: flujoPinzar, alambrar: flujoAlambrar, abonar: flujoAbonar };
