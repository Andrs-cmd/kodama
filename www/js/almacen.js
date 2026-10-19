// Todo lo que la app recuerda vive en este dispositivo (localStorage).
import { POR_ID } from './especies.js';
import { diasEntreRiegos } from './riego.js';
import { POR_DEFECTO, nivelDe } from './kodama.js';

const leer = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

const oyentes = new Set();
export const alCambiar = (fn) => (oyentes.add(fn), () => oyentes.delete(fn));
const avisar = (que) => oyentes.forEach((fn) => fn(que));

export const TIPOS_EVENTO = ['riego', 'abono', 'pinzado', 'alambre', 'retiroAlambre', 'giro', 'revision', 'foto'];
export const XP = { riego: 20, abono: 25, pinzado: 30, alambre: 40, retiroAlambre: 15, giro: 10, revision: 10, foto: 30, leccion: 15, juego: 15, mimo: 2 };

// ---------- Bonsáis ----------
function normalizar(b) {
  b.eventos ??= {};
  for (const t of TIPOS_EVENTO) b.eventos[t] ??= [];
  if (b.riegos) {
    b.eventos.riego = [...new Set([...b.eventos.riego, ...b.riegos])].sort();
    delete b.riegos;
  }
  b.condiciones ??= { clima: 'frio', ubicacion: 'exterior', maceta: 'mediana' };
  b.avisoRiego ??= true;
  return b;
}

export const bonsais = () => leer('kodama.bonsais', []).map(normalizar);
export function guardarBonsais(lista) {
  const ok = escribir('kodama.bonsais', lista);
  avisar('bonsais');
  return ok;
}
export const porId = (id) => bonsais().find((b) => b.id === id) || null;

export function activo() {
  const lista = bonsais();
  const id = leer('kodama.activo', null);
  return lista.find((b) => b.id === id) || lista[0] || null;
}
export function fijarActivo(id) {
  escribir('kodama.activo', id);
  avisar('activo');
}

export function crearBonsai(datos) {
  const b = normalizar({ id: crypto.randomUUID(), creado: new Date().toISOString(), ...datos });
  const lista = bonsais();
  lista.unshift(b);
  if (!guardarBonsais(lista)) throw new Error('No hay espacio en este dispositivo para guardar otro bonsái.');
  fijarActivo(b.id);
  return b;
}

export function actualizarBonsai(id, cambios) {
  const lista = bonsais().map((b) => (b.id === id ? normalizar({ ...b, ...(typeof cambios === 'function' ? cambios(b) : cambios) }) : b));
  if (!guardarBonsais(lista)) throw new Error('No hay espacio en este dispositivo.');
  return lista.find((b) => b.id === id);
}

export function borrarBonsai(id) {
  guardarBonsais(bonsais().filter((b) => b.id !== id));
  if (leer('kodama.activo', null) === id) fijarActivo(bonsais()[0]?.id ?? null);
}

export const especieDe = (b) => POR_ID[b?.especieId] || POR_ID[b?.analisis?.identificacion?.especieId] || null;
export const diasRiego = (b) => b?.analisis?.riego?.dias || diasEntreRiegos(especieDe(b), b?.condiciones);

// ---------- Fechas ----------
export const hoyISO = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const DIA = 864e5;
export function diasEntre(a, b = new Date()) {
  const x = new Date(a); x.setHours(0, 0, 0, 0);
  const y = new Date(b); y.setHours(0, 0, 0, 0);
  return Math.round((y - x) / DIA);
}
export const ultimo = (b, tipo) => (b?.eventos?.[tipo]?.length ? new Date(b.eventos[tipo].at(-1)) : null);
export const hechoHoy = (b, tipo) => b?.eventos?.[tipo]?.some((f) => hoyISO(new Date(f)) === hoyISO());

// Estado del riego: dias = días que faltan (negativo = atrasado), nivel de agua 0-1.
export function estadoRiego(b) {
  const cada = diasRiego(b);
  const u = ultimo(b, 'riego');
  if (!u) return { cada, dias: 0, agua: 0.35, sinDatos: true };
  let proximo = new Date(u.getTime() + cada * DIA);
  const pos = b.posponerRiego ? new Date(b.posponerRiego) : null;
  if (pos && pos > u && pos > proximo) proximo = pos;
  const dias = diasEntre(new Date(), proximo);
  const pasados = diasEntre(u);
  const agua = Math.max(0, Math.min(1, 1 - pasados / (cada + 1.5)));
  return { cada, dias, agua, proximo, ultimo: u };
}

// ---------- Registro de cuidados (también da experiencia al kodama) ----------
export function registrar(id, tipo, fecha = new Date()) {
  const b = actualizarBonsai(id, (x) => ({
    eventos: { ...x.eventos, [tipo]: [...(x.eventos[tipo] || []), fecha.toISOString()] },
    ...(tipo === 'riego' ? { posponerRiego: null } : {}),
  }));
  const yaHoy = (b.eventos[tipo] || []).filter((f) => hoyISO(new Date(f)) === hoyISO()).length > 1;
  const ganada = yaHoy ? 0 : XP[tipo] || 0;
  sumarXP(ganada, tipo);
  marcarDiaDeCuidado();
  return { bonsai: b, xp: ganada };
}

// ---------- Kodama (tamagochi) ----------
export function kodama() {
  const k = leer('kodama.personaje', null) || { ...POR_DEFECTO, xp: 0, mimos: {}, diasCuidado: [], lecciones: [], juego: {} };
  k.mimos ??= {};
  k.diasCuidado ??= [];
  k.lecciones ??= [];
  k.juego ??= {};
  return k;
}
export function guardarKodama(cambios) {
  const k = { ...kodama(), ...cambios };
  escribir('kodama.personaje', k);
  avisar('kodama');
  return k;
}

const subidas = new Set();
export const alSubirNivel = (fn) => (subidas.add(fn), () => subidas.delete(fn));

export function sumarXP(n, motivo) {
  if (!n) return kodama();
  const k = kodama();
  const antes = nivelDe(k.xp).nivel;
  const nuevo = guardarKodama({ xp: k.xp + n });
  const despues = nivelDe(nuevo.xp).nivel;
  if (despues > antes) subidas.forEach((fn) => fn(despues, motivo));
  return nuevo;
}

function marcarDiaDeCuidado() {
  const k = kodama();
  const hoy = hoyISO();
  if (!k.diasCuidado.includes(hoy)) guardarKodama({ diasCuidado: [...k.diasCuidado, hoy].slice(-400) });
}

// Mimos: hasta 5 al día dan experiencia y llenan el cariño.
export function mimar() {
  const k = kodama();
  const hoy = hoyISO();
  const veces = (k.mimos[hoy] || 0) + 1;
  guardarKodama({ mimos: { [hoy]: veces } });
  if (veces <= 5) sumarXP(XP.mimo, 'mimo');
  return veces;
}
export const carino = () => Math.min(1, (kodama().mimos[hoyISO()] || 0) / 3);

export function leccionHecha(id) {
  const k = kodama();
  if (k.lecciones.includes(id)) return 0;
  guardarKodama({ lecciones: [...k.lecciones, id] });
  sumarXP(XP.leccion, 'leccion');
  return XP.leccion;
}

export function puntajeJuego(puntos) {
  const k = kodama();
  const hoy = hoyISO();
  const yaHoy = k.juego.dia === hoy;
  const ganada = yaHoy ? 0 : Math.min(XP.juego, Math.round(puntos / 2));
  guardarKodama({ juego: { dia: hoy, mejor: Math.max(k.juego.mejor || 0, puntos) } });
  sumarXP(ganada, 'juego');
  return { ganada, mejor: Math.max(k.juego.mejor || 0, puntos) };
}

// ---------- Ajustes ----------
export const ajustes = () => leer('kodama.ajustes', { servidor: '', usarIris: true, sonido: true, horaAviso: '08:00' });
export const guardarAjustes = (c) => (escribir('kodama.ajustes', { ...ajustes(), ...c }), avisar('ajustes'));
export const bienvenidaHecha = () => leer('kodama.bienvenida', false);
export const marcarBienvenida = () => escribir('kodama.bienvenida', true);
export { leer, escribir };
