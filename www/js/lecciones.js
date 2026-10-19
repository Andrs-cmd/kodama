// Lecciones animadas de técnicas, paso a paso. Cada paso agrega una clase pN a la
// escena y el CSS anima lo que cambia; algunos pasos esperan a que toques la
// rama marcada. Pinzado y alambrado usan las guías interactivas de flujos.js.
import { abrirHoja } from './flujos.js';
import { cuerpo, curva, nube, semilla } from './geom.js';
import { leccionHecha } from './almacen.js';
import { sonidos, vibrar } from './sonido.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const CORTEZA = '#7b4a33';
const HOJA = ['#2f5d2b', '#4f8a3c', '#83b660'];

const almohadilla = (cx, cy, w, h, sem = 1) => {
  const r = semilla(sem);
  return `<path d="${nube(cx, cy, w, h, { k: 6, rnd: r, bulto: 0.5 })}" fill="${HOJA[0]}" transform="translate(0 2.5)"/><path d="${nube(cx, cy, w, h, { k: 6, rnd: semilla(sem), bulto: 0.5 })}" fill="${HOJA[1]}"/><path d="${nube(cx - w * 0.05, cy - h * 0.15, w * 0.7, h * 0.6, { k: 5, rnd: r, bulto: 0.5 })}" fill="${HOJA[2]}" opacity=".85"/>`;
};
const maceta = (x = 90, w = 140, y = 200) => `<rect x="${x - 4}" y="${y}" width="${w + 8}" height="8" rx="2" fill="#86604a"/><path d="M${x} ${y + 8} H${x + w} L${x + w - 6} ${y + 30} H${x + 6} Z" fill="#6b4a38"/><rect x="${x + 2}" y="${y - 5}" width="${w - 4}" height="7" rx="3" fill="#8c6a4c"/>`;

// ---------------- Escenas ----------------
function escenaPoda() {
  const rama = (cls, pts, w0, w1, pad, sem) => `<g class="${cls}" style="transform-origin:${pts[0][0]}px ${pts[0][1]}px"><path d="${cuerpo(pts, w0, w1)}" fill="${CORTEZA}"/>${pad ? almohadilla(...pad, sem) : ''}</g>`;
  return `<svg viewBox="0 0 320 240" class="leccion-svg">
    <polygon class="silueta-l" points="160,38 58,160 262,148" pathLength="1"/>
    ${maceta()}
    <g class="arbol-l">
      ${rama('rama-ok', [[154, 112], [136, 104], [116, 100]], 6, 2, [112, 93, 50, 18], 3)}
      <path d="${cuerpo([[160, 200], [150, 172], [166, 142], [153, 112], [160, 80]], 26, 7)}" fill="${CORTEZA}"/>
      ${rama('rama-ok', [[152, 166], [122, 158], [92, 151]], 9, 3, [86, 143, 72, 24], 5)}
      ${rama('rama-ok', [[164, 141], [195, 133], [226, 127]], 8, 3, [228, 119, 66, 24], 7)}
      ${rama('rama-barra', [[152, 170], [128, 180], [102, 186]], 6, 2, [98, 181, 36, 13], 9)}
      ${rama('rama-chupon', [[198, 134], [199, 112], [202, 88]], 4, 1.5, [202, 84, 22, 12], 11)}
      <g class="apice">${almohadilla(160, 70, 62, 30, 13)}</g>
      ${rama('rama-cruzada', [[168, 156], [150, 141], [130, 132], [108, 126]], 8, 3, [104, 120, 40, 15], 15)}
    </g>
    <g class="pastas"><circle cx="160" cy="153" r="4.5"/><circle cx="151" cy="170" r="4.5"/><circle cx="198" cy="134" r="3.5"/></g>
  </svg>`;
}

function escenaDefoliado() {
  const r = semilla(21);
  const grandes = [];
  const chicas = [];
  const zonas = [[90, 128, 60, 22], [228, 112, 56, 22], [160, 70, 60, 28], [120, 96, 40, 16]];
  zonas.forEach(([cx, cy, w, h], z) => {
    for (let i = 0; i < 8; i++) {
      const x = cx + (r() - 0.5) * w, y = cy + (r() - 0.6) * h, a = Math.round((r() - 0.5) * 120);
      grandes.push(`<g class="hoja-g" style="--d:${(z * 8 + i) * 0.04}s;--x:${Math.round((r() - 0.5) * 60)}px;transform-origin:${x}px ${y}px"><ellipse cx="${x}" cy="${y}" rx="11" ry="6" fill="${HOJA[1 + (i % 2)]}" transform="rotate(${a} ${x} ${y})"/></g><line class="peciolo" x1="${x}" y1="${y}" x2="${x + 3}" y2="${y + 3}" stroke="#6b8f4a" stroke-width="1.5"/>`);
    }
    for (let i = 0; i < 14; i++) {
      const x = cx + (r() - 0.5) * w * 1.05, y = cy + (r() - 0.6) * h, a = Math.round((r() - 0.5) * 140);
      chicas.push(`<ellipse class="hoja-c" style="--d:${(z * 14 + i) * 0.025}s;transform-origin:${x}px ${y}px" cx="${x}" cy="${y}" rx="5" ry="2.8" fill="${HOJA[i % 3]}" transform="rotate(${a} ${x} ${y})"/>`);
    }
  });
  return `<svg viewBox="0 0 320 240" class="leccion-svg">
    ${maceta()}
    <path d="${cuerpo([[160, 200], [152, 170], [164, 140], [156, 110], [160, 78]], 24, 6)}" fill="${CORTEZA}"/>
    <path d="${cuerpo([[154, 160], [120, 140], [92, 130]], 8, 2)}" fill="${CORTEZA}"/>
    <path d="${cuerpo([[162, 138], [196, 120], [228, 114]], 7, 2)}" fill="${CORTEZA}"/>
    <path d="${cuerpo([[157, 112], [138, 100], [120, 97]], 5, 2)}" fill="${CORTEZA}"/>
    <g>${chicas.join('')}</g><g>${grandes.join('')}</g>
    <g class="tijera-l"><path d="M0 0 L16 10 M0 12 L16 2" stroke="#9aa4ad" stroke-width="3" stroke-linecap="round"/><circle cx="-3" cy="-1" r="3.5" fill="none" stroke="#c2412d" stroke-width="2.5"/><circle cx="-3" cy="13" r="3.5" fill="none" stroke="#c2412d" stroke-width="2.5"/></g>
    <text class="rotulo-l r-semanas" x="160" y="30">3–5 semanas después</text>
  </svg>`;
}

function escenaJin() {
  const tocon = [[92, 150], [124, 128], [158, 112]];
  const resto = [[158, 112], [196, 96], [236, 84]];
  return `<svg viewBox="0 0 320 240" class="leccion-svg">
    <path d="${cuerpo([[70, 240], [76, 180], [66, 120], [74, 40], [70, 0]], 52, 40)}" fill="${CORTEZA}"/>
    <path class="shari-madera" d="M70 230 Q82 180 72 130 Q66 90 74 50" stroke="#e9dfc8" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path class="shari-corteza" d="M70 230 Q82 180 72 130 Q66 90 74 50" stroke="${CORTEZA}" stroke-width="13" fill="none" stroke-linecap="round" pathLength="1"/>
    <g class="rama-jin-resto" style="transform-origin:158px 112px"><path d="${cuerpo(resto, 11, 4)}" fill="${CORTEZA}"/>${almohadilla(240, 76, 60, 22, 4)}</g>
    <path class="madera-rom" d="${cuerpo(tocon, 15, 11)}" fill="#e9dfc8"/>
    <path class="madera-fina" d="${cuerpo([[92, 150], [118, 130], [140, 112], [152, 96], [150, 86]], 15, 1.5)}" fill="#e9dfc8"/>
    <path class="corteza-jin" d="${curva(tocon)}" stroke="${CORTEZA}" stroke-width="16" fill="none" stroke-linecap="round" pathLength="1"/>
    <g class="virutas">${[0, 1, 2, 3].map((i) => `<path style="--d:${0.3 + i * 0.25}s;--x:${20 + i * 14}px" d="M${110 + i * 12} ${138 - i * 8} q6 -6 10 0 q-4 6 -10 0" fill="#8a5a3e"/>`).join('')}</g>
    <g class="pincel-l"><rect x="-3" y="-30" width="6" height="26" rx="2" fill="#c49a6c"/><path d="M-5 -6 h10 l-2 12 h-6 z" fill="#f4f1e6"/></g>
    <g class="flecha-l"><circle cx="196" cy="96" r="16" fill="none" stroke="#c2412d" stroke-width="3" stroke-dasharray="5 4"/></g>
  </svg>`;
}

function escenaTrasplante() {
  const raices = Array.from({ length: 9 }, (_, i) => {
    const x = 132 + i * 7;
    return `<path class="raiz ${i % 3 === 0 ? 'raiz-larga' : ''}" d="M${x} 196 q${(i - 4) * 3} 14 ${(i - 4) * 5} ${26 + (i % 3) * 6}" stroke="#d9c4a3" stroke-width="2" fill="none"/>`;
  }).join('');
  return `<svg viewBox="0 0 320 240" class="leccion-svg">
    <g class="maceta-vieja">${maceta(110, 100, 196)}</g>
    <g class="sustrato-nuevo"><rect x="112" y="200" width="96" height="26" fill="#9a7a58"/>${Array.from({ length: 16 }, (_, i) => `<circle cx="${116 + (i * 13) % 90}" cy="${204 + (i * 7) % 20}" r="2" fill="#c8b39a"/>`).join('')}</g>
    <g class="arbol-t">
      <ellipse class="cepellon" cx="160" cy="208" rx="40" ry="20" fill="#6d4d36"/>
      <g class="raices">${raices}</g>
      <path d="${cuerpo([[160, 200], [154, 176], [164, 150], [158, 124]], 18, 5)}" fill="${CORTEZA}"/>
      <path d="${cuerpo([[157, 170], [132, 160], [110, 156]], 6, 2)}" fill="${CORTEZA}"/>
      <path d="${cuerpo([[162, 150], [188, 140], [210, 136]], 6, 2)}" fill="${CORTEZA}"/>
      ${almohadilla(108, 150, 50, 18, 2)}${almohadilla(212, 130, 48, 18, 6)}${almohadilla(158, 116, 50, 26, 8)}
    </g>
    <g class="maceta-frente"><path d="M110 204 H210 L204 226 H116 Z" fill="#6b4a38"/></g>
    <circle class="gota-tapada" cx="150" cy="190" r="5" fill="#5fb4ea"/>
    <g class="rastrillo"><rect x="-2.5" y="-44" width="5" height="38" rx="2" fill="#5d6770"/><path d="M-12 -6 h24 M-10 -6 v10 M-4 -6 v10 M2 -6 v10 M8 -6 v10" stroke="#5d6770" stroke-width="3" stroke-linecap="round"/></g>
    <g class="palillo"><rect x="-2" y="-46" width="4" height="46" rx="2" fill="#c49a6c"/></g>
    <g class="sombra-l"><path d="M120 40 h80 a14 14 0 0 1 0 28 h-80 a14 14 0 0 1 0 -28z" fill="#cfd6dc"/><text x="160" y="58" class="rotulo-l">semisombra · sin abono</text></g>
  </svg>`;
}

export const LECCIONES_TECNICA = {
  estructural: {
    titulo: 'Poda estructural',
    escena: escenaPoda,
    pasos: [
      { titulo: 'Observa tu árbol', texto: 'Antes de cortar, mira el árbol de frente. Busca el ápice y fíjate qué ramas estorban la forma.' },
      { titulo: 'Ramas cruzadas', texto: 'Esta rama cruza por delante del tronco y lo tapa. Toca la rama marcada para cortarla.', objetivo: '.rama-cruzada' },
      { titulo: 'Ramas que bajan o salen del mismo punto', texto: 'Dos o más ramas del mismo punto hacen un engrosamiento feo, y las que apuntan hacia abajo no suman. Tócala.', objetivo: '.rama-barra' },
      { titulo: 'Chupones', texto: 'Brotes muy fuertes que suben rectos desde una rama: le roban fuerza al resto. Tócalo.', objetivo: '.rama-chupon' },
      { titulo: 'Sella los cortes grandes', texto: 'Cubre los cortes gruesos con pasta cicatrizante para que no se sequen ni entren hongos.' },
      { titulo: 'El resultado', texto: 'Queda un triángulo claro, con ramas alternas y aire entre ellas. Nunca quites más de 1/3 del follaje en una sesión.' },
    ],
  },
  defoliado: {
    titulo: 'Defoliado',
    escena: escenaDefoliado,
    pasos: [
      { titulo: 'Hojas grandes', texto: 'Solo en árboles sanos de hoja ancha (arces, olmos, ficus) y en pleno crecimiento. Nunca en coníferas como tu junípero.' },
      { titulo: 'Corta cada hoja, deja el pecíolo', texto: 'Con tijera fina, corta cada hoja dejando el tallito (pecíolo). Él solo se caerá después.' },
      { titulo: 'Rebrotan más pequeñas', texto: 'En 3 a 5 semanas salen hojas nuevas, más pequeñas y numerosas: la copa se ve más fina.' },
      { titulo: 'Después del defoliado', texto: 'Riega menos (sin hojas casi no evapora), no abones hasta que rebrote y no lo hagas el mismo año del trasplante.' },
    ],
  },
  jin: {
    titulo: 'Jin y shari',
    escena: escenaJin,
    pasos: [
      { titulo: 'Elige la rama que sobra', texto: 'En coníferas como tu junípero, en vez de cortar al ras una rama que sobra, se convierte en madera muerta (jin).' },
      { titulo: 'Córtala dejando un tocón', texto: 'Deja un tocón más largo de lo que quieres al final. Toca la rama marcada.', objetivo: '.rama-jin-resto' },
      { titulo: 'Quítale la corteza', texto: 'Aprieta la corteza con el alicate de jin y pélala: debajo aparece la madera clara.' },
      { titulo: 'Afínalo y dale forma', texto: 'Con el alicate y gubias, afina la punta y retuércela para que parezca natural, como quebrada por un rayo.' },
      { titulo: 'Shari en el tronco', texto: 'El shari es una franja de tronco sin corteza. Nunca más de 1/3 del contorno, y siempre dejando vivas las venas que alimentan las ramas.' },
      { titulo: 'Protégelo con cal-azufre', texto: 'Tras unas semanas de secado, pinta la madera con líquido de cal-azufre: la blanquea y la protege de hongos.' },
    ],
  },
  trasplante: {
    titulo: 'Trasplante',
    escena: escenaTrasplante,
    pasos: [
      { titulo: '¿Cuándo toca?', texto: 'Cuando el agua tarda en bajar o salen raíces por los agujeros. En juníperos, cada 2–3 años.' },
      { titulo: 'Saca el árbol', texto: 'Corta el alambre que lo sujeta y sácalo con cuidado junto con su cepellón.' },
      { titulo: 'Peina las raíces', texto: 'Con un rastrillo, peina desde el centro hacia afuera para desenredar las raíces que dan vueltas.' },
      { titulo: 'Corta hasta 1/3', texto: 'Recorta las raíces más largas y gruesas. Nunca más de un tercio. En juníperos, no desarmes todo el cepellón.' },
      { titulo: 'Sustrato nuevo', texto: 'Pon malla en los agujeros, una capa de sustrato nuevo y el árbol encima. Fíjalo con alambre a la maceta.' },
      { titulo: 'Palillo y riego', texto: 'Mete y saca un palillo para que el sustrato llene los huecos, y riega hasta que salga el agua limpia.' },
      { titulo: 'Recuperación', texto: '3 a 4 semanas en semisombra, sin abono y protegido del viento. Después vuelve a su sitio.' },
    ],
  },
};

export function abrirLeccionTecnica(id, { alTerminar } = {}) {
  const L = LECCIONES_TECNICA[id];
  if (!L) return;
  const hoja = abrirHoja(L.titulo);
  hoja.cuerpo.innerHTML = `
    <div class="escena escena-leccion">${L.escena()}<div class="toca-aqui" hidden>Toca la rama marcada</div></div>
    <p class="paso-n"></p>
    <h3 class="titulo-etapa"></h3>
    <p class="paso-texto"></p>
    <div class="botones-paso">
      <button class="boton secundario" data-ant>Anterior</button>
      <button class="icono-boton" data-repetir aria-label="Repetir animación"><svg><use href="#ico-giro"/></svg></button>
      <button class="boton primario" data-sig>Siguiente</button>
    </div>`;
  const svg = hoja.cuerpo.querySelector('.leccion-svg');
  const aviso = hoja.cuerpo.querySelector('.toca-aqui');
  let actual = 0;
  const cortados = new Set();

  const pintar = (n, repetir = false) => {
    actual = n;
    const p = L.pasos[n];
    // clases acumuladas p1..pn: lo de pasos anteriores queda hecho
    for (let i = 1; i <= L.pasos.length; i++) svg.classList.toggle(`p${i}`, i <= n + 1 && !(repetir && i === n + 1));
    if (repetir) { void svg.getBoundingClientRect(); svg.classList.add(`p${n + 1}`); }
    L.pasos.forEach((q, i) => {
      if (!q.objetivo) return;
      const el = svg.querySelector(q.objetivo);
      el.classList.toggle('objetivo', i === n && !cortados.has(i));
      el.classList.toggle('cortada', i < n || (i === n && cortados.has(i)));
      if (i < n) cortados.add(i);
      if (i > n) cortados.delete(i);
    });
    aviso.hidden = !(p.objetivo && !cortados.has(n));
    hoja.cuerpo.querySelector('.paso-n').textContent = `Paso ${n + 1} de ${L.pasos.length}`;
    hoja.cuerpo.querySelector('.titulo-etapa').textContent = p.titulo;
    const t = hoja.cuerpo.querySelector('.paso-texto');
    t.textContent = p.texto;
    t.animate?.([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
    hoja.puntos.innerHTML = L.pasos.map((_, j) => `<i class="${j < n ? 'hecho' : j === n ? 'actual' : ''}"></i>`).join('');
    hoja.cuerpo.querySelector('[data-ant]').disabled = n === 0;
    hoja.cuerpo.querySelector('[data-sig]').textContent = n === L.pasos.length - 1 ? 'Terminar' : 'Siguiente';
  };

  L.pasos.forEach((q, i) => {
    if (!q.objetivo) return;
    svg.querySelector(q.objetivo).addEventListener('click', () => {
      if (actual !== i || cortados.has(i)) return;
      cortados.add(i);
      sonidos.pinza();
      vibrar(15);
      pintar(i);
      setTimeout(() => actual === i && i < L.pasos.length - 1 && pintar(i + 1), 1100);
    });
  });
  hoja.cuerpo.querySelector('[data-ant]').onclick = () => actual > 0 && pintar(actual - 1);
  hoja.cuerpo.querySelector('[data-repetir]').onclick = () => {
    cortados.delete(actual);
    pintar(actual, true);
  };
  hoja.cuerpo.querySelector('[data-sig]').onclick = () => {
    sonidos.pop();
    if (actual < L.pasos.length - 1) {
      if (L.pasos[actual].objetivo) cortados.add(actual);
      return pintar(actual + 1);
    }
    const xp = leccionHecha(`tec-${id}`);
    alTerminar?.(xp);
    hoja.cerrar();
  };
  pintar(0);
}
