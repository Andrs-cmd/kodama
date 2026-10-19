// Alertas y recordatorios. En la APK usa notificaciones nativas (llegan aunque
// la app esté cerrada). En el navegador avisa mientras la app está abierta y
// muestra las pendientes al volver a abrirla.
import { leer, escribir, bonsais, estadoRiego, ajustes } from './almacen.js';

const P = () => window.Capacitor?.Plugins?.LocalNotifications;
export const nativas = () => Boolean(window.Capacitor?.isNativePlatform?.() && P());

const oyentes = new Set();
export const alCambiarAlertas = (fn) => (oyentes.add(fn), () => oyentes.delete(fn));

export const REPETIR = { no: 'Una vez', dia: 'Todos los días', semana: 'Cada semana' };

export const lista = () => leer('kodama.alertas', []).sort((a, b) => new Date(a.cuando) - new Date(b.cuando));
const guardar = (l) => (escribir('kodama.alertas', l), oyentes.forEach((f) => f()));

let siguienteId = () => Math.floor(Date.now() / 1000) % 2000000000;

async function permiso() {
  if (nativas()) {
    const p = await P().checkPermissions();
    if (p.display === 'granted') return true;
    return (await P().requestPermissions()).display === 'granted';
  }
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

async function programarNativa(a) {
  const n = { id: a.id, title: a.titulo, body: a.cuerpo || 'Kodama te recuerda cuidar tu bonsái.', schedule: { at: new Date(a.cuando), allowWhileIdle: true } };
  if (a.repetir === 'dia') n.schedule = { on: { hour: new Date(a.cuando).getHours(), minute: new Date(a.cuando).getMinutes() }, allowWhileIdle: true };
  if (a.repetir === 'semana') n.schedule = { on: { weekday: new Date(a.cuando).getDay() + 1, hour: new Date(a.cuando).getHours(), minute: new Date(a.cuando).getMinutes() }, allowWhileIdle: true };
  await P().schedule({ notifications: [n] });
}

// crea { titulo, cuerpo, cuando: Date|ISO, repetir: 'no'|'dia'|'semana', tipo, bonsaiId }
export async function crear({ titulo, cuerpo = '', cuando, repetir = 'no', tipo = 'personal', bonsaiId = null, id }) {
  const a = { id: id ?? siguienteId(), titulo, cuerpo, cuando: new Date(cuando).toISOString(), repetir, tipo, bonsaiId, creada: new Date().toISOString() };
  const ok = await permiso().catch(() => false);
  if (nativas() && ok) await programarNativa(a).catch(() => {});
  guardar([...lista().filter((x) => x.id !== a.id), a]);
  vigilar();
  return { alerta: a, permiso: ok };
}

export async function borrar(id) {
  if (nativas()) await P().cancel({ notifications: [{ id }] }).catch(() => {});
  guardar(lista().filter((a) => a.id !== id));
}

export async function borrarDeBonsai(bid) {
  for (const a of lista().filter((x) => x.bonsaiId === bid)) await borrar(a.id);
}

// Siguiente vez que suena una alerta repetida.
function siguiente(a, desde = new Date()) {
  let t = new Date(a.cuando);
  const paso = a.repetir === 'dia' ? 864e5 : a.repetir === 'semana' ? 7 * 864e5 : 0;
  if (!paso) return t;
  while (t <= desde) t = new Date(t.getTime() + paso);
  return t;
}
export const proximaVez = (a) => siguiente(a);

// Recordatorio automático de riego de cada bonsái (id fijo por bonsái).
const idRiego = (bid) => 1000000 + (Array.from(bid).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 900000);

export async function reprogramarRiego(b) {
  const id = idRiego(b.id);
  if (!b.avisoRiego) return borrar(id);
  const r = estadoRiego(b);
  const [h, m] = (ajustes().horaAviso || '08:00').split(':').map(Number);
  const cuando = r.proximo ? new Date(r.proximo) : new Date();
  cuando.setHours(h, m, 0, 0);
  if (cuando <= new Date()) cuando.setTime(Date.now() + 60 * 6e4);
  return crear({ id, titulo: `${b.nombre}: revisa la tierra`, cuerpo: 'Si está seca, riégalo hasta que salga agua por abajo.', cuando, tipo: 'riego', bonsaiId: b.id });
}

export async function reprogramarTodo() {
  for (const b of bonsais()) await reprogramarRiego(b).catch(() => {});
}

// --------- Navegador: avisar mientras la app está abierta ---------
let temporizador = null;
const vistas = () => leer('kodama.alertas.vistas', {});

export function pendientes() {
  const v = vistas();
  const ahora = new Date();
  return lista().filter((a) => {
    if (a.repetir !== 'no') {
      const anterior = new Date(siguiente(a, ahora).getTime() - (a.repetir === 'dia' ? 864e5 : 7 * 864e5));
      return anterior >= new Date(a.cuando) && anterior <= ahora && (!v[a.id] || new Date(v[a.id]) < anterior);
    }
    return new Date(a.cuando) <= ahora && !v[a.id];
  });
}
export const marcarVista = (id) => escribir('kodama.alertas.vistas', { ...vistas(), [id]: new Date().toISOString() });

export function vigilar(alSonar) {
  if (alSonar) vigilar.fn = alSonar;
  if (nativas()) return;
  clearTimeout(temporizador);
  const futuras = lista().map((a) => siguiente(a)).filter((t) => t > new Date());
  const prox = Math.min(...futuras.map((t) => t.getTime()));
  if (Number.isFinite(prox)) temporizador = setTimeout(() => {
    for (const a of pendientes()) {
      try { if (Notification.permission === 'granted') new Notification(a.titulo, { body: a.cuerpo, icon: 'icons/kodama.svg' }); } catch {}
      vigilar.fn?.(a);
    }
    vigilar();
  }, Math.min(prox - Date.now() + 500, 2147483000));
}
