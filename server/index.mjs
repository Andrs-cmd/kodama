// Servidor de Kodama: sirve la app (www/) y la API. La APK del celular lo usa
// por la red Wi-Fi para el análisis de fotos y para hablar con Iris.
//   GET  /api/estado                            -> { ia, iris }
//   POST /api/analizar {imagen, tipo, contexto} -> diagnóstico + cortes y alambrado sobre la foto
//   POST /api/iris/chat {...}                   -> puente al chat de Iris (eventos SSE)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { iaDisponible, analizarFoto } from './claude.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');
const PUERTO = Number(process.env.PORT) || 8830;
const IRIS = (process.env.IRIS_URL || 'http://127.0.0.1:8740').replace(/\/$/, '');
const MAX_CUERPO = 12 * 1024 * 1024;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

// La APK carga la app desde http://localhost (Capacitor), así que la API acepta otros orígenes.
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

function responder(res, estado, datos) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', ...CORS });
  res.end(JSON.stringify(datos));
}

async function leerCuerpo(req) {
  let tam = 0;
  const partes = [];
  for await (const p of req) {
    tam += p.length;
    if (tam > MAX_CUERPO) throw Object.assign(new Error('La foto es muy pesada (máx. 12 MB).'), { status: 413 });
    partes.push(p);
  }
  return partes.length ? Buffer.concat(partes) : Buffer.from('{}');
}

async function irisDisponible() {
  try {
    const r = await fetch(`${IRIS}/v1/iris/estado`, { signal: AbortSignal.timeout(1500) });
    return r.ok;
  } catch {
    return false;
  }
}

// Reenvía el chat a Iris y devuelve su flujo de eventos tal cual.
function puenteIris(cuerpo, res) {
  const destino = new URL(`${IRIS}/v1/iris/chat`);
  const pet = http.request(
    { hostname: destino.hostname, port: destino.port, path: destino.pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': cuerpo.length } },
    (r) => {
      res.writeHead(r.statusCode || 502, { 'Content-Type': r.headers['content-type'] || 'text/event-stream', 'Cache-Control': 'no-cache', ...CORS });
      r.pipe(res);
    },
  );
  pet.setTimeout(300000, () => pet.destroy(new Error('Iris tardó demasiado.')));
  pet.on('error', (e) => (res.headersSent ? res.end() : responder(res, 502, { error: `No encuentro a Iris: ${e.message}` })));
  pet.end(cuerpo);
}

const rutas = {
  'GET /api/estado': async () => ({ ia: iaDisponible(), iris: await irisDisponible() }),
  'POST /api/analizar': async (_url, req) => analizarFoto(JSON.parse((await leerCuerpo(req)).toString('utf8'))),
};

async function servirArchivo(res, ruta) {
  let archivo = path.join(RAIZ, decodeURIComponent(ruta));
  if (!archivo.startsWith(RAIZ)) return responder(res, 403, { error: 'Prohibido' });
  try {
    if ((await stat(archivo)).isDirectory()) archivo = path.join(archivo, 'index.html');
    const datos = await readFile(archivo);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(datos);
  } catch {
    responder(res, 404, { error: 'No encontrado' });
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') return res.writeHead(204, CORS).end();
    if (req.method === 'POST' && url.pathname === '/api/iris/chat') {
      try {
        return puenteIris(await leerCuerpo(req), res);
      } catch (e) {
        return responder(res, e.status || 500, { error: e.message });
      }
    }
    const ruta = rutas[`${req.method} ${url.pathname}`];
    if (!ruta) return servirArchivo(res, url.pathname);
    try {
      responder(res, 200, await ruta(url, req));
    } catch (e) {
      console.error(e);
      responder(res, e.status && e.status < 600 ? e.status : 500, { error: e.message || 'Error inesperado' });
    }
  })
  .listen(PUERTO, '0.0.0.0', () => console.log(`Kodama en http://localhost:${PUERTO} — análisis con IA: ${iaDisponible() ? 'sí' : 'no (falta ANTHROPIC_API_KEY)'}`));
