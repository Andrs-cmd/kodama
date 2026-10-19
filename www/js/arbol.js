// Ilustración animada del bonsái. Cambia según el grupo de la especie
// (conífera, tropical, flor, suculenta…) y según su ánimo (bien, sed, revive).
import { cuerpo, curva, nube, semilla, uid } from './geom.js';

const PALETAS = {
  conifera: { hoja: ['#24493a', '#3d6b51', '#6a9a72'], textura: 'agujas', corteza: '#7b4a33', sombraCorteza: '#4e2c1d', forma: { k: 8, alto: 0.8, bulto: 0.42 }, maceta: 'rect', jin: true },
  tropical: { hoja: ['#2a5a26', '#468a37', '#7db457'], textura: 'hojas', corteza: '#8b8172', sombraCorteza: '#5d5549', forma: { k: 6, alto: 1.05, bulto: 0.6 }, maceta: 'ovalo' },
  perenne: { hoja: ['#43593f', '#68845e', '#a3ba94'], textura: 'hojas', corteza: '#7f776a', sombraCorteza: '#57504a', forma: { k: 6, alto: 1, bulto: 0.55 }, maceta: 'ovalo' },
  caducifolio: { hoja: ['#355f24', '#5b9439', '#93c35d'], textura: 'hojas', corteza: '#6e5d4f', sombraCorteza: '#4a3d33', forma: { k: 6, alto: 0.95, bulto: 0.58 }, maceta: 'ovalo' },
  floracion: { hoja: ['#2f5d2b', '#4f8a3c', '#83b660'], textura: 'hojas', corteza: '#6f5544', sombraCorteza: '#49362b', forma: { k: 6, alto: 1, bulto: 0.58 }, maceta: 'ovalo', flores: '#ee6fa3' },
  suculenta: { hoja: ['#4a7526', '#6c9b35', '#a3cb5f'], textura: 'hojas', corteza: '#80493a', sombraCorteza: '#552b21', forma: { k: 5, alto: 1.1, bulto: 0.7 }, maceta: 'ovalo' },
};

const TRONCO = [[150, 224], [139, 200], [156, 172], [142, 142], [154, 112], [148, 86]];
const RAMAS = [
  { pts: [[141, 197], [118, 191], [93, 182], [70, 177]], w: [10, 3], nube: [70, 168, 88, 30] },
  { pts: [[155, 169], [179, 161], [204, 151], [228, 147]], w: [9, 3], nube: [228, 140, 82, 30] },
  { pts: [[145, 140], [127, 130], [104, 122]], w: [6.5, 2], nube: [103, 114, 64, 25] },
  { pts: [[152, 116], [171, 108], [190, 102]], w: [5, 2], nube: [192, 97, 54, 22] },
];
const APICE = [148, 76, 74, 40];

export function arbolSVG({ grupo = 'conifera', animo = 'bien', nace = false, clase = '' } = {}) {
  const P = PALETAS[grupo] || PALETAS.conifera;
  const id = uid('a');
  const rnd = semilla(7);
  const [oscuro, medio, claro] = P.hoja;

  const textura =
    P.textura === 'agujas'
      ? `<pattern id="tx${id}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
           <path d="M1 6 L3 1 M4 7 L6 2" stroke="${oscuro}" stroke-width=".9" stroke-linecap="round" opacity=".55"/>
           <path d="M2.5 6.5 L4 3" stroke="${claro}" stroke-width=".7" stroke-linecap="round" opacity=".6"/></pattern>`
      : `<pattern id="tx${id}" width="11" height="9" patternUnits="userSpaceOnUse">
           <ellipse cx="3" cy="3" rx="2.6" ry="1.5" fill="${oscuro}" opacity=".35" transform="rotate(-25 3 3)"/>
           <ellipse cx="8.5" cy="7" rx="2.6" ry="1.5" fill="${claro}" opacity=".45" transform="rotate(20 8.5 7)"/></pattern>`;

  const almohadilla = ([cx, cy, w, h], i, delante = true) => {
    h *= P.forma.alto;
    const base = nube(cx, cy, w, h, { k: P.forma.k, rnd, bulto: P.forma.bulto });
    const luz = nube(cx - w * 0.06, cy - h * 0.16, w * 0.72, h * 0.62, { k: P.forma.k - 1, rnd, bulto: P.forma.bulto });
    const flores = P.flores
      ? Array.from({ length: 4 }, () => `<circle cx="${(cx + (rnd() - 0.5) * w * 0.7).toFixed(1)}" cy="${(cy - rnd() * h * 0.5).toFixed(1)}" r="2.6" fill="${P.flores}"/>`).join('')
      : '';
    return `<g class="brote" style="--d:${(i * 0.12 + (nace ? 1.1 : 0)).toFixed(2)}s"><g class="nube" style="--r:${(i * 0.7).toFixed(1)}s">
        <path d="${base}" fill="${oscuro}" transform="translate(0 3.5)"/>
        <path d="${base}" fill="${medio}"/>
        <path d="${luz}" fill="${claro}" opacity="${delante ? 0.85 : 0.5}"/>
        <path d="${base}" fill="url(#tx${id})"/>${flores}
      </g></g>`;
  };

  const maceta =
    P.maceta === 'rect'
      ? `<rect x="60" y="221" width="180" height="11" rx="3" fill="#86604a"/>
         <path d="M67 232 H233 L225 262 H75 Z" fill="#6b4a38"/>
         <path d="M67 232 H233 L231 240 H69 Z" fill="#000" opacity=".14"/>
         <rect x="86" y="262" width="20" height="6" rx="2" fill="#4f3528"/><rect x="194" y="262" width="20" height="6" rx="2" fill="#4f3528"/>`
      : `<path d="M58 222 Q150 234 242 222 L242 228 Q150 240 58 228 Z" fill="#4f7396"/>
         <path d="M60 228 Q150 240 240 228 L228 257 Q150 270 72 257 Z" fill="#3d5d80"/>
         <path d="M70 236 Q150 247 230 236" stroke="#fff" stroke-width="2" fill="none" opacity=".18"/>`;

  const jin = P.jin
    ? `<path class="jin" d="${cuerpo([[143, 147], [129, 151], [118, 146], [113, 139]], 4, 1)}" fill="#e3dccb"/>
       <path d="${curva([[149, 218], [142, 196], [153, 172], [144, 150]])}" stroke="#e3dccb" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".9"/>`
    : '';

  return `
  <svg class="arbol ${nace ? 'nace' : ''} ${clase}" viewBox="0 0 300 290" data-grupo="${grupo}" data-animo="${animo}" role="img" aria-label="Ilustración de tu bonsái">
    <defs>${textura}
      <linearGradient id="tr${id}" x1="0" x2="1"><stop offset="0" stop-color="${P.sombraCorteza}"/><stop offset=".45" stop-color="${P.corteza}"/><stop offset="1" stop-color="${P.sombraCorteza}"/></linearGradient>
    </defs>
    <ellipse class="sombra-suelo" cx="150" cy="272" rx="104" ry="9" fill="#000" opacity=".13"/>
    <g class="maceta">${maceta}</g>
    <g class="fx-atras"></g>
    <g class="planta">
      <g class="tronco">
        <path d="${cuerpo([[150, 222], [130, 225], [112, 229]], 11, 2)}" fill="url(#tr${id})"/>
        <path d="${cuerpo([[152, 222], [172, 226], [192, 229]], 10, 2)}" fill="url(#tr${id})"/>
        <path d="${cuerpo(TRONCO, 32, 7)}" fill="url(#tr${id})"/>
        ${jin}
      </g>
      ${RAMAS.map((r, i) => `<g class="rama" style="transform-origin:${r.pts[0][0]}px ${r.pts[0][1]}px;--d:${(0.55 + i * 0.12).toFixed(2)}s"><path d="${cuerpo(r.pts, r.w[0], r.w[1])}" fill="url(#tr${id})"/></g>`).join('')}
      <g class="copa">
        ${almohadilla(RAMAS[2].nube, 0, false)}${almohadilla(RAMAS[3].nube, 1, false)}
        ${almohadilla(RAMAS[0].nube, 2)}${almohadilla(RAMAS[1].nube, 3)}${almohadilla(APICE, 4)}
      </g>
    </g>
    <rect class="tierra" x="64" y="214" width="172" height="10" rx="5"/>
    <g class="musgo">${[78, 96, 200, 222].map((x, i) => `<ellipse cx="${x}" cy="${215 + (i % 2)}" rx="${7 + (i % 2) * 3}" ry="3.2" fill="#6f9a4a"/>`).join('')}</g>
    <g class="fx"></g>
  </svg>`;
}

// Hace "revivir" la copa (después de regar o cuidar).
export function revivir(svg) {
  if (!svg) return;
  svg.classList.remove('revive');
  void svg.getBoundingClientRect();
  svg.classList.add('revive');
  setTimeout(() => svg.classList.remove('revive'), 1300);
}

export const coloresHoja = (grupo) => (PALETAS[grupo] || PALETAS.conifera).hoja;
