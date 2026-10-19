// Utilidades de dibujo para las ilustraciones SVG.

export const NS = 'http://www.w3.org/2000/svg';
export const r1 = (n) => Math.round(n * 10) / 10;

// Curva suave que pasa por todos los puntos (Catmull-Rom a Bézier).
// Con mover=false empieza con una línea, para encadenarla a otro trazo.
export function curva(pts, mover = true) {
  const p = (q) => `${r1(q[0])},${r1(q[1])}`;
  let d = `${mover ? 'M' : 'L'}${p(pts[0])}`;
  if (pts.length < 3) return d + pts.slice(1).map((q) => ` L${p(q)}`).join('');
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${p(c1)} ${p(c2)} ${p(p2)}`;
  }
  return d;
}

// Forma rellena que sigue una línea central y se afina de w0 a w1 (troncos y ramas).
export function cuerpo(pts, w0, w1) {
  const n = pts.length;
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push([p[0] + nx * w, p[1] + ny * w]);
    R.push([p[0] - nx * w, p[1] - ny * w]);
  });
  const fin = pts[n - 1];
  return `${curva(L)} Q${r1(fin[0] + (fin[0] - pts[n - 2][0]) * 0.15)},${r1(fin[1] + (fin[1] - pts[n - 2][1]) * 0.15)} ${r1(R[n - 1][0])},${r1(R[n - 1][1])}${curva(R.reverse(), false).replace(/^L[^ ]+/, '')} Z`;
}

// Generador pseudoaleatorio determinista (mismas formas en cada dibujo).
export function semilla(s = 1) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Nube de follaje estilo bonsái: lomo con bultos arriba y base casi plana.
export function nube(cx, cy, w, h, { k = 6, rnd = Math.random, bulto = 0.55 } = {}) {
  const rx = w / 2, ry = h / 2;
  const pts = [];
  for (let i = 0; i <= k; i++) {
    const t = Math.PI - (Math.PI * i) / k;
    pts.push([cx + rx * Math.cos(t), cy + ry * 0.3 - ry * 0.9 * Math.sin(t)]);
  }
  let d = `M${r1(pts[0][0])},${r1(pts[0][1])}`;
  for (let i = 1; i <= k; i++) {
    const a = pts[i - 1], b = pts[i];
    const tm = Math.PI - (Math.PI * (i - 0.5)) / k;
    const sale = ry * bulto * (0.75 + 0.5 * rnd());
    const cxp = (a[0] + b[0]) / 2 + Math.cos(tm) * sale * 0.7;
    const cyp = (a[1] + b[1]) / 2 - Math.max(0.35, Math.sin(tm)) * sale;
    d += ` Q${r1(cxp)},${r1(cyp)} ${r1(b[0])},${r1(b[1])}`;
  }
  d += ` Q${r1(cx + rx * 0.5)},${r1(cy + ry * 0.95)} ${r1(cx)},${r1(cy + ry * 0.75)} Q${r1(cx - rx * 0.5)},${r1(cy + ry * 0.95)} ${r1(pts[0][0])},${r1(pts[0][1])} Z`;
  return d;
}

export const lerp = (a, b, t) => a + (b - a) * t;

export function mezclarColor(a, b, t) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const x = h(a), y = h(b);
  return `#${x.map((v, i) => Math.round(lerp(v, y[i], t)).toString(16).padStart(2, '0')).join('')}`;
}

export const reducirMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let contador = 0;
export const uid = (p = 'k') => `${p}${++contador}${Math.random().toString(36).slice(2, 6)}`;
