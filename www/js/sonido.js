// Sonidos sintetizados suaves (sin archivos) y vibración.
import { ajustes } from './almacen.js';

let ctx = null;
const audio = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

function tono(f, dur = 0.12, { tipo = 'sine', vol = 0.12, glide = 0, retraso = 0 } = {}) {
  if (!ajustes().sonido) return;
  try {
    const a = audio();
    const t = a.currentTime + retraso;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {}
}

export const sonidos = {
  pop: () => tono(660, 0.09, { glide: 1.6 }),
  gota: () => tono(900 + Math.random() * 300, 0.07, { glide: 0.5, vol: 0.05 }),
  pinza: () => tono(1200, 0.05, { tipo: 'triangle', glide: 0.6, vol: 0.08 }),
  traqueteo: () => [0, 0.07, 0.14, 0.21].forEach((r, i) => tono(260 + i * 40, 0.05, { tipo: 'square', vol: 0.025, retraso: r })),
  logro: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.18, { retraso: i * 0.09, vol: 0.09 })),
  suave: () => tono(440, 0.2, { vol: 0.06, glide: 1.2 }),
};

export function vibrar(ms = 12) {
  const H = window.Capacitor?.Plugins?.Haptics;
  if (H) H.impact({ style: ms > 20 ? 'MEDIUM' : 'LIGHT' }).catch(() => {});
  else if (navigator.userActivation?.hasBeenActive !== false) navigator.vibrate?.(ms);
}
