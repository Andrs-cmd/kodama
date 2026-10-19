// Conexión con el servidor de Kodama en el PC (análisis de fotos e Iris).
// En el navegador es el mismo sitio; en la APK, la IP del PC en la red Wi-Fi.
import { ajustes } from './almacen.js';
import { SERVIDOR_POR_DEFECTO } from './config.js';

export const enApk = () => Boolean(window.Capacitor?.isNativePlatform?.());
export const base = () => (enApk() ? (ajustes().servidor || SERVIDOR_POR_DEFECTO || '').replace(/\/$/, '') : '');
export const url = (ruta) => `${base()}/${ruta.replace(/^\//, '')}`;

let estado = { ia: false, iris: false, conectado: false };
export const estadoServidor = () => estado;

export async function revisarServidor() {
  if (enApk() && !base()) return (estado = { ia: false, iris: false, conectado: false });
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3500);
    const r = await fetch(url('api/estado'), { signal: ctl.signal });
    clearTimeout(t);
    const d = await r.json();
    estado = { ia: !!d.ia, iris: !!d.iris, conectado: true };
  } catch {
    estado = { ia: false, iris: false, conectado: false };
  }
  return estado;
}
