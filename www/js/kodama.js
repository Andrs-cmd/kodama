// El kodama: el espíritu del árbol, tu compañero tipo tamagochi.
// Se personaliza por partes y desbloquea cosas al subir de nivel.
import { uid } from './geom.js';

const op = (nombre, nivel, extra = {}) => ({ nombre, nivel, ...extra });

export const COLORES = {
  blanco: op('Blanco clásico', 1, { cuerpo: '#f3f1e8', sombra: '#d7d2c3' }),
  musgo: op('Musgo', 1, { cuerpo: '#c5dcae', sombra: '#9fbd85' }),
  sakura: op('Sakura', 1, { cuerpo: '#f8cfdc', sombra: '#e3a9bc' }),
  cielo: op('Cielo', 1, { cuerpo: '#c6e0f2', sombra: '#9ec3dd' }),
  menta: op('Menta', 1, { cuerpo: '#c8f0dc', sombra: '#98d4b6' }),
  lavanda: op('Lavanda', 2, { cuerpo: '#ddd0f4', sombra: '#b9a6e0' }),
  durazno: op('Durazno', 2, { cuerpo: '#fcd9bd', sombra: '#ebb48c' }),
  limon: op('Limón', 2, { cuerpo: '#f6f0a8', sombra: '#dccf6a' }),
  ambar: op('Ámbar', 3, { cuerpo: '#f4d9a2', sombra: '#ddb873' }),
  coral: op('Coral', 3, { cuerpo: '#f7b6a6', sombra: '#e08d78' }),
  arena: op('Arena', 4, { cuerpo: '#e8dcc4', sombra: '#c9b896' }),
  bosque: op('Bosque', 4, { cuerpo: '#8fb47a', sombra: '#6e955c' }),
  noche: op('Noche estrellada', 5, { cuerpo: '#3c4a6e', sombra: '#2c3754', ojosClaros: true }),
  sombra: op('Sombra del bosque', 6, { cuerpo: '#5f6372', sombra: '#474a57', ojosClaros: true }),
  dorado: op('Dorado', 8, { cuerpo: '#f0cf6a', sombra: '#cfa63c', brillo: true }),
  cristal: op('Cristal', 10, { cuerpo: '#e3f3f8', sombra: '#b5dbe8', translucido: true }),
  arcoiris: op('Arcoíris', 12, { cuerpo: 'arcoiris', sombra: '#c9b8e0' }),
};
export const PATRONES = {
  ninguno: op('Liso', 1), pecas: op('Pecas', 1), puntos: op('Lunares', 2), manchas: op('Manchas', 3),
  rayas: op('Rayas', 4), estrellas: op('Estrellitas', 5), hojitas: op('Hojitas', 6), corazones: op('Corazones', 7), luna: op('Luna en la frente', 9),
};
export const CABEZAS = {
  redonda: op('Redonda', 1), alargada: op('Alargada', 1), hongo: op('Hongo', 2), calabaza: op('Calabacita', 3), gota: op('Gota', 4), nube: op('Nube', 6),
};
export const OJOS = {
  puntos: op('Puntitos', 1), ovalados: op('Ovalados', 1), grandes: op('Grandes', 2), dormilones: op('Dormilones', 2), brillantes: op('Brillantes', 3),
  guino: op('Guiño', 4), estrellas: op('Estrellas', 5), lentes: op('Con lentes', 6), corazones: op('Enamorados', 7),
};
export const BOCAS = { o: op('Sorprendida', 1), sonrisa: op('Sonrisa', 1), gatito: op('Gatito', 2), lengua: op('Lengüita', 3), colmillo: op('Colmillito', 4), silbido: op('Silbando', 5) };
export const RUBORES = {
  rosa: op('Rosado', 1, { color: '#f08aa6' }), ninguno: op('Sin rubor', 1), coral: op('Coral', 2, { color: '#f3896b' }),
  durazno: op('Durazno', 2, { color: '#f6b07a' }), brillante: op('Brillante', 4, { color: '#ff7aa8', brillo: true }),
};
export const SOMBREROS = {
  ninguno: op('Nada', 1), hoja: op('Brote', 1), flor: op('Flor de cerezo', 1), lana: op('Gorro de lana', 2), mono: op('Moño', 2),
  bellota: op('Gorro de bellota', 3), hongo: op('Hongo rojo', 4), audifonos: op('Audífonos', 5), kasa: op('Sombrero kasa', 5),
  corona: op('Corona de musgo', 6), cuernos: op('Cuernitos', 6), rana: op('Gorro de rana', 7), bonsai: op('Mini bonsái', 8),
  aureola: op('Aureola', 9), reina: op('Corona dorada', 10), mago: op('Sombrero de mago', 11),
};
export const CUELLOS = { ninguno: op('Nada', 1), bufanda: op('Bufanda', 2), corbatin: op('Corbatín', 2), campanita: op('Campanita', 3), panuelo: op('Pañuelo', 4), flores: op('Collar de flores', 5), capa: op('Capa', 7) };
export const MANOS = { ninguno: op('Nada', 1), regadera: op('Regadera', 1), tijeras: op('Tijeritas', 3), paraguas: op('Hoja paraguas', 4), maceta: op('Mini maceta', 5), farol: op('Farolito', 6), varita: op('Varita', 9) };
export const COMPANEROS = { ninguno: op('Solo', 1), luciernaga: op('Luciérnaga', 2), mariposa: op('Mariposa', 3), caracol: op('Caracol', 5), pajarito: op('Pajarito', 6), minikodama: op('Mini kodama', 10) };
export const AURAS = { ninguna: op('Ninguna', 1), brillitos: op('Brillitos', 2), hojas: op('Hojas al viento', 4), petalos: op('Pétalos de sakura', 5), burbujas: op('Burbujas', 7) };

// Partes personalizables en el orden en que se muestran.
export const PARTES = [
  ['color', 'Color', COLORES], ['patron', 'Patrón', PATRONES], ['cabeza', 'Cabeza', CABEZAS], ['ojos', 'Ojos', OJOS],
  ['boca', 'Boca', BOCAS], ['rubor', 'Mejillas', RUBORES], ['sombrero', 'Sombrero', SOMBREROS], ['cuello', 'Cuello', CUELLOS],
  ['mano', 'En la mano', MANOS], ['companero', 'Compañero', COMPANEROS], ['aura', 'Aura', AURAS],
];
// Compatibilidad: antes se llamaba ACCESORIOS.
export const ACCESORIOS = SOMBREROS;

export const POR_DEFECTO = { nombre: 'Kodama', color: 'blanco', patron: 'ninguno', cabeza: 'redonda', ojos: 'puntos', boca: 'o', rubor: 'rosa', sombrero: 'hoja', cuello: 'ninguno', mano: 'ninguno', companero: 'ninguno', aura: 'ninguna' };

export function normalizarApariencia(a = {}) {
  const x = { ...POR_DEFECTO, ...a };
  if (a.accesorio && !a.sombrero) {
    if (a.accesorio === 'bufanda') { x.cuello = 'bufanda'; x.sombrero = 'ninguno'; }
    else x.sombrero = SOMBREROS[a.accesorio] ? a.accesorio : 'ninguno';
  }
  for (const [k, , mapa] of PARTES) if (!mapa[x[k]]) x[k] = POR_DEFECTO[k];
  return x;
}

// Niveles: 2 → 100 xp, 3 → 250, 4 → 450, 5 → 700…
export const xpPara = (n) => 50 * (n - 1) * (n + 2);
export function nivelDe(xp) {
  let n = 1;
  while (xp >= xpPara(n + 1)) n++;
  return { nivel: n, desde: xpPara(n), hasta: xpPara(n + 1), progreso: (xp - xpPara(n)) / (xpPara(n + 1) - xpPara(n)) };
}

// ---------------- Formas ----------------
const CABEZA = {
  redonda: '<ellipse cx="60" cy="50" rx="35" ry="32"/>',
  alargada: '<ellipse cx="60" cy="46" rx="29" ry="38"/>',
  calabaza: '<path d="M60 18 C40 14 22 26 24 50 C25 72 42 82 60 82 C78 82 95 72 96 50 C98 26 80 14 60 18 Z"/>',
  hongo: '<path d="M18 52 C16 24 40 10 60 10 C80 10 104 24 102 52 C102 60 94 64 88 64 L88 72 C88 81 76 86 60 86 C44 86 32 81 32 72 L32 64 C26 64 18 60 18 52 Z"/>',
  gota: '<path d="M60 6 C70 24 96 38 94 58 C92 76 78 86 60 86 C42 86 28 76 26 58 C24 38 50 24 60 6 Z"/>',
  nube: '<circle cx="38" cy="56" r="22"/><circle cx="82" cy="56" r="22"/><circle cx="60" cy="38" r="27"/><circle cx="60" cy="62" r="24"/><circle cx="44" cy="34" r="16"/><circle cx="76" cy="34" r="16"/>',
};
const ESTRELLA = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(x + rr * Math.cos(a)).toFixed(1)},${(y + rr * Math.sin(a)).toFixed(1)}`; } return `<path d="${d}Z"/>`; };
const CORAZON = (x, y, s) => `<path d="M${x} ${y + s * 0.9} C${x - s * 1.4} ${y} ${x - s * 0.8} ${y - s} ${x} ${y - s * 0.3} C${x + s * 0.8} ${y - s} ${x + s * 1.4} ${y} ${x} ${y + s * 0.9} Z"/>`;

function patron(p, color) {
  const g = (inner, extra = '') => `<g class="k-patron" fill="${color}" ${extra}>${inner}</g>`;
  switch (p) {
    case 'pecas': return g([[36, 62], [41, 66], [32, 66], [84, 62], [79, 66], [88, 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join(''));
    case 'puntos': return g(Array.from({ length: 16 }, (_, i) => `<circle cx="${22 + (i % 4) * 26 + (Math.floor(i / 4) % 2) * 13}" cy="${18 + Math.floor(i / 4) * 20}" r="4.5"/>`).join(''), 'opacity=".55"');
    case 'manchas': return g('<ellipse cx="34" cy="30" rx="12" ry="9"/><ellipse cx="90" cy="44" rx="10" ry="14"/><ellipse cx="70" cy="18" rx="9" ry="6"/>', 'opacity=".6"');
    case 'rayas': return g('<path d="M22 40 Q32 44 30 52 M20 52 Q30 54 28 62 M98 40 Q88 44 90 52 M100 52 Q90 54 92 62 M52 14 Q56 22 60 24 Q64 22 68 14"/>'.replace('<path', '<path stroke="' + color + '" stroke-width="3.5" fill="none" stroke-linecap="round"'), 'opacity=".7"');
    case 'estrellas': return g([[30, 30, 4], [88, 26, 5], [74, 14, 3], [94, 58, 3.5], [24, 56, 3]].map((a) => ESTRELLA(...a)).join(''), 'opacity=".8"');
    case 'hojitas': return g('<path d="M28 34 q8 -10 16 0 q-8 10 -16 0z M86 24 q8 -10 16 0 q-8 10 -16 0z M90 56 q6 -8 12 0 q-6 8 -12 0z"/>', 'opacity=".75"');
    case 'corazones': return g([[30, 34, 4], [90, 30, 4.5], [72, 16, 3]].map((a) => CORAZON(...a)).join(''), 'opacity=".75"');
    case 'luna': return g('<path d="M66 20 a10 10 0 1 1 -12 -2 a8 8 0 1 0 12 2z"/>', 'opacity=".85"');
    default: return '';
  }
}

function ojosNormales(tipo, tinta) {
  const par = (rx, ry) => `<ellipse cx="47" cy="50" rx="${rx}" ry="${ry}"/><ellipse cx="73" cy="50" rx="${rx}" ry="${ry}"/>`;
  switch (tipo) {
    case 'ovalados': return `<g class="k-ojos">${par(4.5, 7.5)}</g>`;
    case 'grandes': return `<g class="k-ojos">${par(7, 8.5)}</g><circle cx="49" cy="47" r="2" fill="#fff"/><circle cx="75" cy="47" r="2" fill="#fff"/>`;
    case 'dormilones': return `<g class="k-ojos">${par(5.5, 6)}</g><path d="M40 47 h14 M66 47 h14" stroke="${tinta}" stroke-width="3.5" stroke-linecap="round"/><path d="M41 44 h12 v4 h-12z M67 44 h12 v4 h-12z" fill="var(--k-cuerpo)"/>`;
    case 'brillantes': return `<g class="k-ojos">${par(7, 9)}</g><circle cx="49.5" cy="46.5" r="2.6" fill="#fff"/><circle cx="45" cy="53" r="1.3" fill="#fff"/><circle cx="75.5" cy="46.5" r="2.6" fill="#fff"/><circle cx="71" cy="53" r="1.3" fill="#fff"/>`;
    case 'guino': return `<g class="k-ojos"><ellipse cx="47" cy="50" rx="4.5" ry="6"/></g><path d="M67 51 Q73 45 79 51" fill="none" stroke="${tinta}" stroke-width="3" stroke-linecap="round"/>`;
    case 'estrellas': return `<g class="k-ojos">${ESTRELLA(47, 50, 7)}${ESTRELLA(73, 50, 7)}</g>`;
    case 'corazones': return `<g class="k-ojos" fill="#e0405f">${CORAZON(47, 50, 6)}${CORAZON(73, 50, 6)}</g>`;
    case 'lentes': return `<g class="k-ojos">${par(3.5, 4)}</g><g fill="none" stroke="#3a3530" stroke-width="2.2"><circle cx="47" cy="50" r="10"/><circle cx="73" cy="50" r="10"/><path d="M57 50 h6 M37 48 l-8 -3 M83 48 l8 -3"/></g>`;
    default: return `<g class="k-ojos">${par(4.5, 4.5)}</g>`;
  }
}

function boca(tipo, tinta) {
  switch (tipo) {
    case 'sonrisa': return `<path d="M53 62 Q60 69 67 62" fill="none" stroke="${tinta}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'gatito': return `<path d="M52 62 Q56 67 60 62 Q64 67 68 62" fill="none" stroke="${tinta}" stroke-width="2.4" stroke-linecap="round"/>`;
    case 'lengua': return `<path d="M53 62 Q60 69 67 62 Z" fill="${tinta}"/><ellipse cx="62" cy="66" rx="3.5" ry="3" fill="#f08aa6"/>`;
    case 'colmillo': return `<path d="M53 62 Q60 69 67 62" fill="none" stroke="${tinta}" stroke-width="2.6" stroke-linecap="round"/><path d="M63 64 l2 4 l2 -3.5z" fill="#fff" stroke="${tinta}" stroke-width=".8"/>`;
    case 'silbido': return `<ellipse cx="64" cy="64" rx="2.5" ry="2.8" fill="${tinta}"/><path class="k-nota" d="M76 60 v-8 l6 -2 v8" fill="none" stroke="${tinta}" stroke-width="1.6"/><circle cx="75" cy="60" r="2" fill="${tinta}"/><circle cx="81" cy="58" r="2" fill="${tinta}"/>`;
    default: return `<ellipse cx="60" cy="64" rx="3.2" ry="3.6" fill="${tinta}"/>`;
  }
}

function caraExpresiones(ojosTipo, bocaTipo, tinta) {
  return `
    <g class="k-cara k-normal">${ojosNormales(ojosTipo, tinta)}${boca(bocaTipo, tinta)}</g>
    <g class="k-cara k-feliz"><path d="M41 52 Q47 44 53 52 M67 52 Q73 44 79 52" fill="none" stroke="${tinta}" stroke-width="3.4" stroke-linecap="round"/><path d="M53 61 Q60 70 67 61 Z" fill="${tinta}"/></g>
    <g class="k-cara k-sed"><ellipse cx="47" cy="52" rx="4.5" ry="3.5"/><ellipse cx="73" cy="52" rx="4.5" ry="3.5"/><path d="M40 42 L53 46 M80 42 L67 46" fill="none" stroke="${tinta}" stroke-width="2.6" stroke-linecap="round"/><path d="M54 68 Q60 62 66 68" fill="none" stroke="${tinta}" stroke-width="2.6" stroke-linecap="round"/></g>
    <g class="k-cara k-dormido"><path d="M41 52 Q47 56 53 52 M67 52 Q73 56 79 52" fill="none" stroke="${tinta}" stroke-width="3" stroke-linecap="round"/><ellipse cx="60" cy="64" rx="2.6" ry="2"/></g>
    <g class="k-cara k-sorpresa"><circle cx="47" cy="49" r="6"/><circle cx="73" cy="49" r="6"/><ellipse cx="60" cy="66" rx="4.5" ry="6"/></g>`;
}

function sombrero(s) {
  switch (s) {
    case 'hoja': return '<g class="k-acc k-mece"><path d="M60 20 Q58 10 62 4" stroke="#4d7a37" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M62 6 Q74 -2 80 6 Q72 14 62 6 Z" fill="#6aa34a"/><path d="M61 9 Q50 2 45 9 Q52 15 61 9 Z" fill="#82b95f"/></g>';
    case 'flor': return `<g class="k-acc" transform="translate(80 22)"><g class="k-mece">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="5" ry="8" cy="-7" fill="#f6a9c3" transform="rotate(${r})"/>`).join('')}<circle r="3.5" fill="#f5d36b"/></g></g>`;
    case 'lana': return '<g class="k-acc"><path d="M24 36 Q24 8 60 6 Q96 8 96 36 Z" fill="#4f86b8"/><rect x="22" y="30" width="76" height="9" rx="4" fill="#3d6a95"/><path d="M30 34 v-6 M38 34 v-8 M46 34 v-9 M54 34 v-10 M62 34 v-10 M70 34 v-9 M78 34 v-8 M86 34 v-6" stroke="#6aa0cc" stroke-width="1.5"/><circle class="k-mece" cx="60" cy="4" r="7" fill="#f3f1e8"/></g>';
    case 'mono': return '<g class="k-acc" transform="translate(84 22)"><g class="k-mece"><path d="M0 0 L-14 -9 L-14 9 Z M0 0 L14 -9 L14 9 Z" fill="#e0607e"/><circle r="4" fill="#c24868"/></g></g>';
    case 'bellota': return '<g class="k-acc"><path d="M28 34 Q60 0 92 34 Q60 24 28 34 Z" fill="#8a5a33"/><path d="M34 30 Q60 10 86 30" stroke="#6b4425" stroke-width="2" fill="none" stroke-dasharray="3 3"/><path d="M60 12 Q62 4 67 3" stroke="#6b4425" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
    case 'hongo': return '<g class="k-acc" transform="translate(74 14)"><g class="k-mece"><rect x="-4" y="0" width="8" height="10" rx="3" fill="#f3ead6"/><path d="M-16 2 Q-16 -14 0 -14 Q16 -14 16 2 Z" fill="#d9402e"/><circle cx="-7" cy="-6" r="2.5" fill="#fff"/><circle cx="5" cy="-9" r="2" fill="#fff"/><circle cx="8" cy="-2" r="2" fill="#fff"/></g></g>';
    case 'audifonos': return '<g class="k-acc"><path d="M26 50 Q26 10 60 10 Q94 10 94 50" fill="none" stroke="#2e3440" stroke-width="5"/><rect x="18" y="42" width="14" height="22" rx="6" fill="#e0607e"/><rect x="88" y="42" width="14" height="22" rx="6" fill="#e0607e"/></g>';
    case 'kasa': return '<g class="k-acc"><path d="M14 30 L60 2 L106 30 Q60 38 14 30 Z" fill="#d9b56a"/><path d="M60 2 L36 31 M60 2 L50 33 M60 2 L70 33 M60 2 L84 31" stroke="#b08a43" stroke-width="1.3"/></g>';
    case 'corona': return `<g class="k-acc">${[30, 42, 54, 66, 78, 90].map((x, i) => `<circle cx="${x}" cy="${24 - Math.sin((i / 5) * Math.PI) * 8}" r="7" fill="${i % 2 ? '#6f9a4a' : '#86b35c'}"/>`).join('')}<circle cx="60" cy="10" r="3.5" fill="#f5d36b"/></g>`;
    case 'cuernos': return '<g class="k-acc"><path d="M42 22 Q36 8 30 6 Q38 10 40 4 Q44 12 46 20Z M78 22 Q84 8 90 6 Q82 10 80 4 Q76 12 74 20Z" fill="#c9a27a" stroke="#9b7650" stroke-width="1"/></g>';
    case 'rana': return '<g class="k-acc"><path d="M24 34 Q26 10 60 10 Q94 10 96 34 Q60 26 24 34Z" fill="#7fb85c"/><circle cx="44" cy="12" r="9" fill="#7fb85c"/><circle cx="76" cy="12" r="9" fill="#7fb85c"/><circle cx="44" cy="11" r="5" fill="#fff"/><circle cx="76" cy="11" r="5" fill="#fff"/><circle cx="45" cy="12" r="2.5" fill="#1f1d1a"/><circle cx="77" cy="12" r="2.5" fill="#1f1d1a"/></g>';
    case 'bonsai': return '<g class="k-acc" transform="translate(60 18)"><g class="k-mece"><rect x="-12" y="-2" width="24" height="6" rx="1.5" fill="#6b4a38"/><path d="M0 -2 Q-3 -9 2 -14 Q5 -18 1 -22" stroke="#7b4a33" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="-8" cy="-14" rx="9" ry="5" fill="#3d6b51"/><ellipse cx="9" cy="-19" rx="8" ry="4.5" fill="#3d6b51"/><ellipse cx="1" cy="-26" rx="8" ry="5" fill="#4f7d5f"/></g></g>';
    case 'aureola': return '<g class="k-acc k-aureola"><ellipse cx="60" cy="2" rx="22" ry="6" fill="none" stroke="#f5d36b" stroke-width="4"/></g>';
    case 'reina': return '<g class="k-acc"><path d="M34 26 L36 6 L48 18 L60 2 L72 18 L84 6 L86 26 Z" fill="#f0c540" stroke="#c99a1e" stroke-width="1.5"/><circle cx="60" cy="16" r="3.5" fill="#e0405f"/><circle cx="46" cy="21" r="2.5" fill="#4f86b8"/><circle cx="74" cy="21" r="2.5" fill="#4f86b8"/></g>';
    case 'mago': return `<g class="k-acc" transform="rotate(-8 60 24)"><path d="M28 28 Q60 36 92 28 Q60 20 28 28Z" fill="#4b3a8c"/><path d="M40 27 L62 -22 L80 27 Z" fill="#5b47a8"/><g fill="#f5d36b">${ESTRELLA(58, 6, 4)}${ESTRELLA(68, 18, 3)}</g><circle cx="62" cy="-22" r="3" fill="#f5d36b"/></g>`;
    default: return '';
  }
}

function cuello(c) {
  switch (c) {
    case 'bufanda': return '<g class="k-acc"><path d="M38 82 Q60 92 82 82 L82 90 Q60 99 38 90 Z" fill="#c2412d"/><path d="M72 88 L78 106 L69 104 Z" fill="#a83524"/><path d="M44 86 L44 92 M52 88 L52 95 M60 89 L60 96 M68 88 L68 95" stroke="#fff" stroke-width="1.6" opacity=".5"/></g>';
    case 'corbatin': return '<g class="k-acc" transform="translate(60 90)"><path d="M0 0 L-10 -6 L-10 6 Z M0 0 L10 -6 L10 6Z" fill="#2e3440"/><circle r="2.5" fill="#1f232b"/></g>';
    case 'campanita': return '<g class="k-acc"><path d="M42 86 Q60 93 78 86" stroke="#c2412d" stroke-width="4" fill="none" stroke-linecap="round"/><g transform="translate(60 92)"><g class="k-mece"><path d="M-5 0 Q-5 -6 0 -6 Q5 -6 5 0 L6 3 H-6Z" fill="#f0c540"/><circle cy="4" r="1.5" fill="#9b7a20"/></g></g></g>';
    case 'panuelo': return '<g class="k-acc"><path d="M40 84 Q60 92 80 84 L60 104 Z" fill="#4f86b8"/>' + [[52, 90], [60, 95], [68, 90], [60, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.5" fill="#fff"/>`).join('') + '</g>';
    case 'flores': return `<g class="k-acc">${[40, 47, 54, 61, 68, 75, 82].map((x, i) => `<circle cx="${x}" cy="${86 + Math.sin((i / 6) * Math.PI) * 6}" r="4.2" fill="${['#f6a9c3', '#f5d36b', '#f3896b', '#b9a6e0'][i % 4]}"/>`).join('')}</g>`;
    default: return '';
  }
}

function mano(m) {
  const t = (inner) => `<g class="k-mano" transform="translate(88 112)">${inner}</g>`;
  switch (m) {
    case 'regadera': return t('<path d="M-6 -6 h12 a2 2 0 0 1 2 2 v10 a3 3 0 0 1 -3 3 h-10 a3 3 0 0 1 -3 -3 v-10 a2 2 0 0 1 2 -2z" fill="#5b8fb0"/><path d="M8 -2 L16 -9 l2 2 L10 3z" fill="#4a7a99"/><circle class="k-gotita" cx="18" cy="-4" r="1.6" fill="#5fb4ea"/>');
    case 'tijeras': return t('<path d="M0 0 L14 -14 M4 2 L16 -10" stroke="#9aa4ad" stroke-width="2.5" stroke-linecap="round"/><circle cx="-2" cy="2" r="3" fill="none" stroke="#c2412d" stroke-width="2"/><circle cx="3" cy="5" r="3" fill="none" stroke="#c2412d" stroke-width="2"/>');
    case 'paraguas': return t('<path d="M0 4 L0 -28" stroke="#4d7a37" stroke-width="2"/><path d="M-18 -26 Q0 -48 18 -26 Q0 -32 -18 -26Z" fill="#6aa34a"/><path d="M0 -44 V-28" stroke="#4d7a37" stroke-width="1"/>');
    case 'maceta': return t('<path d="M-7 -2 h14 l-2 8 h-10z" fill="#6b4a38"/><path d="M0 -2 q-1 -6 2 -9" stroke="#4d7a37" stroke-width="1.6" fill="none"/><ellipse cx="4" cy="-11" rx="4" ry="2.5" fill="#6aa34a"/>');
    case 'farol': return t('<path d="M0 -2 V-10" stroke="#5a4a3a" stroke-width="1.5"/><rect class="k-luz" x="-6" y="-2" width="12" height="14" rx="3" fill="#f6c45a"/><path d="M-6 2 h12 M-6 8 h12" stroke="#c2412d" stroke-width="1.2"/>');
    case 'varita': return t(`<path d="M0 4 L12 -20" stroke="#7b4a33" stroke-width="2.4" stroke-linecap="round"/><g class="k-chispa" fill="#f5d36b">${ESTRELLA(13, -22, 6)}</g>`);
    default: return '';
  }
}

function companero(c, ap) {
  switch (c) {
    case 'luciernaga': return '<g class="k-compa k-vuela"><ellipse cx="108" cy="40" rx="4" ry="3" fill="#3a3530"/><circle class="k-luz" cx="104" cy="42" r="4" fill="#fff3a6"/><ellipse class="k-ala" cx="109" cy="37" rx="3" ry="2" fill="#dfe8f0" opacity=".8"/></g>';
    case 'mariposa': return '<g class="k-compa k-vuela"><g transform="translate(108 34)"><g class="k-ala"><path d="M0 0 Q-10 -12 -12 -2 Q-10 6 0 0Z" fill="#f3896b"/><path d="M0 0 Q-8 8 -10 10 Q-2 10 0 0Z" fill="#f6b07a"/></g><g class="k-ala k-ala-d"><path d="M0 0 Q10 -12 12 -2 Q10 6 0 0Z" fill="#f3896b"/><path d="M0 0 Q8 8 10 10 Q2 10 0 0Z" fill="#f6b07a"/></g><path d="M0 -6 V6" stroke="#3a3530" stroke-width="1.5"/></g></g>';
    case 'caracol': return '<g class="k-compa k-arrastra"><path d="M92 136 h22 q4 0 4 -4" fill="none" stroke="#e8d49e" stroke-width="5" stroke-linecap="round"/><circle cx="104" cy="128" r="8" fill="#c9905a"/><path d="M104 128 m-4 0 a4 4 0 1 1 4 4" fill="none" stroke="#8a5a33" stroke-width="1.5"/><path d="M116 132 l2 -6 M118 132 l4 -5" stroke="#e8d49e" stroke-width="1.5"/></g>';
    case 'pajarito': return '<g class="k-compa k-vuela"><circle cx="108" cy="36" r="8" fill="#f5d36b"/><circle cx="111" cy="34" r="1.6" fill="#1f1d1a"/><path d="M115 36 l5 1.5 l-5 1.5z" fill="#f3896b"/><path class="k-ala" d="M101 36 q-6 -6 -2 4z" fill="#e0b83a"/></g>';
    case 'minikodama': return `<g class="k-compa k-vuela"><g transform="translate(96 22) scale(.28)"><ellipse cx="60" cy="50" rx="35" ry="32" fill="${ap === 'arcoiris' ? '#f3f1e8' : (COLORES[ap]?.cuerpo || '#f3f1e8')}"/><path d="M44 132 Q37 104 46 88 Q60 80 74 88 Q83 104 76 132 Z" fill="${ap === 'arcoiris' ? '#f3f1e8' : (COLORES[ap]?.cuerpo || '#f3f1e8')}"/><circle cx="47" cy="50" r="6" fill="#1f1d1a"/><circle cx="73" cy="50" r="6" fill="#1f1d1a"/></g></g>`;
    default: return '';
  }
}

function aura(a) {
  const parts = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  switch (a) {
    case 'brillitos': return `<g class="k-aura brillitos" fill="#f5d36b">${parts(5, (i) => `<g style="--d:${i * 0.5}s">${ESTRELLA([14, 104, 22, 98, 60][i], [30, 20, 96, 92, -4][i], 4)}</g>`)}</g>`;
    case 'hojas': return `<g class="k-aura caen">${parts(5, (i) => `<path style="--d:${i * 0.8}s;--x:${[10, 40, 70, 100, 25][i]}px" d="M0 0 q5 -6 10 0 q-5 6 -10 0z" fill="${i % 2 ? '#6aa34a' : '#8cc063'}"/>`)}</g>`;
    case 'petalos': return `<g class="k-aura caen">${parts(6, (i) => `<ellipse style="--d:${i * 0.7}s;--x:${[8, 30, 55, 80, 104, 66][i]}px" rx="3.5" ry="2" fill="#f6a9c3"/>`)}</g>`;
    case 'burbujas': return `<g class="k-aura suben">${parts(5, (i) => `<circle style="--d:${i * 0.9}s;--x:${[16, 40, 84, 104, 60][i]}px" r="${3 + (i % 3)}" fill="none" stroke="#9ec3dd" stroke-width="1.2"/>`)}</g>`;
    default: return '';
  }
}

// expresion: normal | feliz | sed | dormido | sorpresa
export function kodamaSVG(apariencia = POR_DEFECTO, { expresion = 'normal', clase = '' } = {}) {
  const a = normalizarApariencia(apariencia);
  const c = COLORES[a.color];
  const id = uid('k');
  const cuerpoFill = c.cuerpo === 'arcoiris' ? `url(#arco${id})` : c.brillo ? `url(#oro${id})` : 'var(--k-cuerpo)';
  const tinta = c.ojosClaros ? '#e9f5c9' : '#1f1d1a';
  const colorPatron = c.ojosClaros ? 'rgba(255,255,255,.55)' : c.sombra;
  const forma = CABEZA[a.cabeza] || CABEZA.redonda;
  const rub = RUBORES[a.rubor];
  return `
  <svg class="kodama ${clase}" viewBox="-14 -26 148 172" data-expresion="${expresion}" style="--k-cuerpo:${c.cuerpo === 'arcoiris' ? '#f3e6f0' : c.cuerpo};--k-sombra:${c.sombra};--k-tinta:${tinta}" role="img" aria-label="${a.nombre}, tu kodama">
    <defs>
      <clipPath id="cl${id}">${forma}</clipPath>
      <linearGradient id="arco${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f9c7d4"/><stop offset=".25" stop-color="#fbe3a6"/><stop offset=".5" stop-color="#c9efc8"/><stop offset=".75" stop-color="#c3dcf6"/><stop offset="1" stop-color="#ddc9f4"/></linearGradient>
      <linearGradient id="oro${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".5" stop-color="#f0cf6a"/><stop offset="1" stop-color="#d9aa3a"/></linearGradient>
    </defs>
    <ellipse class="k-suelo" cx="60" cy="138" rx="26" ry="5" fill="#000" opacity=".15"/>
    ${aura(a.aura)}
    <g class="k-todo" ${c.translucido ? 'opacity=".88"' : ''}>
      ${a.cuello === 'capa' ? '<path class="k-capa" d="M40 88 Q60 84 80 88 L92 128 Q60 136 28 128 Z" fill="#c2412d"/>' : ''}
      <g class="k-cuerpo">
        <path d="M44 132 Q37 104 46 88 Q60 80 74 88 Q83 104 76 132 Q60 136 44 132 Z" fill="${cuerpoFill}"/>
        <path d="M70 90 Q80 104 76 132 Q70 134 66 134 Q72 110 66 92 Z" fill="var(--k-sombra)" opacity=".6"/>
        <path class="k-brazo k-bi" d="M46 98 Q36 106 34 114" stroke="${cuerpoFill}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path class="k-brazo k-bd" d="M74 98 Q84 106 86 114" stroke="${cuerpoFill}" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M52 132 L52 138 M68 132 L68 138" stroke="${cuerpoFill}" stroke-width="6" stroke-linecap="round"/>
        ${cuello(a.cuello)}
        ${mano(a.mano)}
      </g>
      <g class="k-cabeza">
        <g fill="${cuerpoFill}">${forma}</g>
        ${a.cabeza === 'calabaza' ? '<path d="M60 19 C50 30 50 70 60 81 M60 19 C70 30 70 70 60 81" fill="none" stroke="var(--k-sombra)" stroke-width="2"/>' : ''}
        ${a.cabeza === 'hongo' ? '<path d="M24 56 Q60 70 96 56" fill="none" stroke="var(--k-sombra)" stroke-width="2" opacity=".6"/>' : ''}
        <g clip-path="url(#cl${id})">
          <ellipse cx="74" cy="60" rx="26" ry="26" fill="var(--k-sombra)" opacity=".22"/>
          ${patron(a.patron, colorPatron)}
        </g>
        <ellipse cx="44" cy="30" rx="10" ry="6" fill="#fff" opacity="${c.brillo || c.translucido ? 0.7 : 0.35}"/>
        <g fill="${tinta}" stroke="${tinta}" stroke-width="0">${caraExpresiones(a.ojos, a.boca, tinta)}</g>
        ${rub.color ? `<ellipse class="k-rubor" cx="36" cy="62" rx="5.5" ry="3.2" fill="${rub.color}"/><ellipse class="k-rubor" cx="84" cy="62" rx="5.5" ry="3.2" fill="${rub.color}"/>${rub.brillo ? '<circle cx="34" cy="61" r="1.2" fill="#fff"/><circle cx="82" cy="61" r="1.2" fill="#fff"/>' : ''}` : ''}
        ${sombrero(a.sombrero)}
      </g>
    </g>
    ${companero(a.companero, a.color)}
  </svg>`;
}

// Animaciones de reacción: traqueteo de cabeza (como los kodama del bosque), salto, corazones.
export function reaccionar(contenedor, tipo = 'mimo') {
  const svg = contenedor?.querySelector('.kodama');
  if (!svg) return;
  const clase = { mimo: 'traqueteo', salto: 'salta', festejo: 'festeja' }[tipo] || 'traqueteo';
  svg.classList.remove('traqueteo', 'salta', 'festeja');
  void svg.getBoundingClientRect();
  svg.classList.add(clase);
  setTimeout(() => svg.classList.remove(clase), 1200);
  if (tipo === 'mimo' || tipo === 'festejo') particulas(contenedor, tipo === 'festejo' ? ['✦', '❀', '✿', '♥'] : ['♥', '♥', '♡'], tipo === 'festejo' ? 10 : 4);
}

export function particulas(contenedor, simbolos, n = 5) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = contenedor.getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const p = document.createElement('span');
    p.className = 'particula';
    p.textContent = simbolos[i % simbolos.length];
    p.style.left = `${r.width * (0.3 + Math.random() * 0.4)}px`;
    p.style.top = `${r.height * (0.25 + Math.random() * 0.2)}px`;
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
    p.style.setProperty('--dy', `${-60 - Math.random() * 80}px`);
    p.style.animationDelay = `${i * 60}ms`;
    contenedor.appendChild(p);
    setTimeout(() => p.remove(), 1600 + i * 60);
  }
}
