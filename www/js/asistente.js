// Chat con tu kodama. Primero responde el cerebro local (sin internet, en el
// celular). Si no sabe y Iris está encendida en el PC, le pregunta a Iris, que
// puede usar las mismas acciones de la app (navegar, alertas, anotar cuidados).
import { responder, SUGERENCIAS, entenderCuando, describirCuando } from './cerebro.js';
import { kodamaSVG, reaccionar } from './kodama.js';
import { kodama, ajustes, leer, escribir } from './almacen.js';
import { url, estadoServidor } from './api.js';
import { sonidos } from './sonido.js';
import { reducirMovimiento } from './geom.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const HERRAMIENTAS = [
  { nombre: 'ir_a', descripcion: 'Abre una sección de la app Kodama.', parametros: { vista: { type: 'string', enum: ['hoy', 'foto', 'aprender', 'jardin', 'alertas', 'kodama', 'juego', 'ajustes'] } } },
  { nombre: 'abrir_guia', descripcion: 'Abre una guía interactiva paso a paso.', parametros: { guia: { type: 'string', enum: ['regar', 'pinzar', 'alambrar', 'abonar'] } } },
  { nombre: 'crear_alerta', descripcion: 'Crea un recordatorio en el celular. fecha_hora en formato ISO local (AAAA-MM-DDTHH:MM).', parametros: { titulo: { type: 'string' }, fecha_hora: { type: 'string' }, repetir: { type: 'string', enum: ['no', 'dia', 'semana'] } } },
  { nombre: 'registrar_cuidado', descripcion: 'Anota un cuidado que el usuario ya hizo hoy al bonsái activo.', parametros: { tipo: { type: 'string', enum: ['riego', 'abono', 'pinzado', 'alambre', 'retiroAlambre', 'giro'] } } },
];
const aOpenAI = (h) => ({ type: 'function', function: { name: h.nombre, description: h.descripcion, parameters: { type: 'object', properties: h.parametros, required: Object.keys(h.parametros) } } });

export function montarAsistente({ contexto, ejecutar, contextoTexto }) {
  const boton = document.createElement('button');
  boton.className = 'boton-kodama';
  boton.setAttribute('aria-label', 'Hablar con tu kodama');
  document.body.appendChild(boton);
  const pintarBoton = () => (boton.innerHTML = `${kodamaSVG(kodama(), { expresion: 'normal', clase: 'mini' })}<span class="punto" hidden></span>`);
  pintarBoton();

  const panel = document.createElement('section');
  panel.className = 'chat';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat con tu kodama');
  panel.innerHTML = `
    <header class="chat-cabeza">
      <div class="chat-avatar"></div>
      <div><b class="chat-nombre"></b><small class="chat-modo"></small></div>
      <button class="icono-boton" data-limpiar aria-label="Nueva conversación"><svg><use href="#ico-escoba"/></svg></button>
      <button class="icono-boton" data-cerrar aria-label="Cerrar"><svg><use href="#ico-cerrar"/></svg></button>
    </header>
    <div class="chat-mensajes" aria-live="polite"></div>
    <div class="chat-chips"></div>
    <form class="chat-form"><input type="text" placeholder="Pregúntame o pídeme algo…" aria-label="Mensaje" autocomplete="off"><button class="enviar" aria-label="Enviar"><svg><use href="#ico-enviar"/></svg></button></form>`;
  document.body.appendChild(panel);
  const $m = panel.querySelector('.chat-mensajes');
  const $chips = panel.querySelector('.chat-chips');
  const $input = panel.querySelector('input');

  let historial = leer('kodama.chat', []);
  let irisHist = [];
  let pendiente = null;
  let ocupado = false;

  const pintarCabeza = () => {
    const k = kodama();
    panel.querySelector('.chat-avatar').innerHTML = kodamaSVG(k, { expresion: 'feliz' });
    panel.querySelector('.chat-nombre').textContent = k.nombre;
    const s = estadoServidor();
    panel.querySelector('.chat-modo').textContent = s.iris && ajustes().usarIris ? 'IA local en el celular + Iris en tu PC' : 'IA local · funciona sin internet';
  };

  function burbuja(quien, texto, { animar = false } = {}) {
    const d = document.createElement('div');
    d.className = `msj ${quien}`;
    if (quien === 'kodama') d.innerHTML = `<span class="msj-avatar">${kodamaSVG(kodama(), { expresion: 'normal', clase: 'mini' })}</span><p></p>`;
    else d.innerHTML = '<p></p>';
    $m.appendChild(d);
    const p = d.querySelector('p');
    if (!animar || reducirMovimiento()) p.textContent = texto;
    else {
      let i = 0;
      const tick = () => {
        i = Math.min(texto.length, i + 3);
        p.textContent = texto.slice(0, i);
        $m.scrollTop = $m.scrollHeight;
        if (i < texto.length) setTimeout(tick, 14);
      };
      tick();
    }
    $m.scrollTop = $m.scrollHeight;
    return p;
  }

  function pintarChips(chips) {
    $chips.innerHTML = (chips || []).map((c) => `<button type="button">${esc(c)}</button>`).join('');
    $chips.querySelectorAll('button').forEach((b) => (b.onclick = () => enviar(b.textContent)));
  }

  function pintarHistorial() {
    $m.innerHTML = '';
    if (!historial.length) {
      const k = kodama();
      burbuja('kodama', `¡Hola! Soy ${k.nombre}. Pregúntame lo que quieras de tu bonsái, o pídeme que te recuerde algo.`);
      pintarChips(SUGERENCIAS);
    } else historial.forEach((h) => burbuja(h.quien, h.texto));
  }

  const guardar = () => escribir('kodama.chat', (historial = historial.slice(-40)));

  async function correrAcciones(acciones = []) {
    const resultados = [];
    for (const a of acciones) resultados.push(await ejecutar(a, { cerrarChat: cerrar }));
    return resultados;
  }

  async function enviar(texto) {
    texto = String(texto || '').trim();
    if (!texto || ocupado) return;
    $input.value = '';
    pintarChips([]);
    burbuja('yo', texto);
    historial.push({ quien: 'yo', texto });
    ocupado = true;
    const pensando = document.createElement('div');
    pensando.className = 'msj kodama pensando';
    pensando.innerHTML = '<span class="msj-avatar"></span><p><i></i><i></i><i></i></p>';
    $m.appendChild(pensando);
    $m.scrollTop = $m.scrollHeight;
    await new Promise((r) => setTimeout(r, 350));

    let r = null;
    if (pendiente?.tipo === 'alerta') {
      const cuando = entenderCuando(texto);
      if (cuando) r = { texto: `Listo: te recuerdo "${pendiente.titulo}" ${describirCuando(cuando)}`.replace(/\.?$/, '.'), acciones: [{ tipo: 'alerta', titulo: pendiente.titulo, cuando: cuando.fecha.toISOString(), repetir: cuando.repetir }], reaccion: 'salto' };
      pendiente = null;
    }
    r ??= responder(texto, contexto());

    try {
      if (!r) {
        const s = estadoServidor();
        if (s.iris && ajustes().usarIris) {
          pensando.remove();
          await preguntarIris(texto);
          return;
        }
        r = { texto: 'Eso todavía no lo sé. Puedo ayudarte con riego, luz, abono, poda, alambre, plagas, síntomas, alertas y llevarte a cualquier sección.' + (s.conectado ? ' Si abres Iris en tu PC, le pregunto a ella.' : ''), chips: SUGERENCIAS.slice(0, 3) };
      }
      pensando.remove();
      burbuja('kodama', r.texto, { animar: true });
      historial.push({ quien: 'kodama', texto: r.texto });
      if (r.pendiente) pendiente = r.pendiente;
      pintarChips(r.chips);
      sonidos.pop();
      if (r.reaccion) reaccionar(panel.querySelector('.chat-avatar'), r.reaccion === 'festejo' ? 'festejo' : r.reaccion === 'mimo' ? 'mimo' : 'salto');
      if (r.acciones?.length) setTimeout(() => correrAcciones(r.acciones), 700);
    } finally {
      pensando.remove();
      ocupado = false;
      guardar();
    }
  }

  // ---------- Iris (en el PC, a través del servidor de Kodama) ----------
  async function preguntarIris(texto) {
    const p = burbuja('kodama', 'Le pregunto a Iris en tu PC…');
    p.parentElement.classList.add('iris');
    irisHist.push({ role: 'user', content: texto });
    let respuesta = '';
    try {
      for (let vuelta = 0; vuelta < 4; vuelta++) {
        const fin = await llamarIris((t) => {
          respuesta += t;
          p.textContent = respuesta;
          $m.scrollTop = $m.scrollHeight;
        }, (et) => (p.textContent = respuesta || `${et}…`), () => (respuesta = ''));
        const terminaEnUsuario = irisHist.at(-1).role === 'user';
        irisHist = [...(terminaEnUsuario ? irisHist.slice(0, -1) : irisHist), ...fin.mensajes];
        if (!fin.pendientes?.length) break;
        for (const ll of fin.pendientes) irisHist.push({ role: 'tool', tool_call_id: ll.id, content: await herramientaIris(ll) });
      }
      if (!respuesta) p.textContent = 'Listo.';
      historial.push({ quien: 'kodama', texto: p.textContent });
    } catch (e) {
      p.textContent = 'No pude hablar con Iris. Revisa que esté abierta en tu PC.';
      irisHist.pop();
    } finally {
      ocupado = false;
      irisHist = irisHist.slice(-16);
      guardar();
    }
  }

  async function llamarIris(onTexto, onEstado, onDescartar) {
    const r = await fetch(url('api/iris/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: 'Kodama', mensajes: irisHist, herramientas: HERRAMIENTAS.map(aOpenAI), base: [], contexto: contextoTexto() }),
    });
    if (!r.ok || !r.body) throw new Error(`Iris respondió ${r.status}`);
    const lector = r.body.getReader();
    const dec = new TextDecoder();
    let resto = '';
    for (;;) {
      const { value, done } = await lector.read();
      if (done) break;
      resto += dec.decode(value, { stream: true });
      const lineas = resto.split('\n');
      resto = lineas.pop() ?? '';
      for (const l of lineas) {
        if (!l.startsWith('data:')) continue;
        const e = JSON.parse(l.slice(5));
        if (e.tipo === 'texto') onTexto(e.texto);
        else if (e.tipo === 'descartar') onDescartar();
        else if (e.tipo === 'herramienta') onEstado(e.etiqueta);
        else if (e.tipo === 'error') throw new Error(e.error);
        else if (e.tipo === 'fin') return e;
      }
    }
    throw new Error('la conexión con Iris se cortó');
  }

  async function herramientaIris(ll) {
    let a = {};
    try { a = JSON.parse(ll.function.arguments || '{}'); } catch {}
    const mapa = {
      ir_a: () => ({ tipo: 'ir', vista: a.vista }),
      abrir_guia: () => ({ tipo: 'flujo', flujo: a.guia }),
      crear_alerta: () => ({ tipo: 'alerta', titulo: a.titulo, cuando: new Date(a.fecha_hora).toISOString(), repetir: a.repetir || 'no' }),
      registrar_cuidado: () => ({ tipo: 'registrar', evento: a.tipo }),
    };
    if (!mapa[ll.function.name]) return `La herramienta ${ll.function.name} no existe.`;
    try {
      const [res] = await correrAcciones([mapa[ll.function.name]()]);
      return typeof res === 'string' ? res : 'Hecho.';
    } catch (e) {
      return `Error: ${e.message}`;
    }
  }

  // ---------- Abrir / cerrar ----------
  function abrir(texto) {
    pintarCabeza();
    pintarHistorial();
    panel.classList.add('abierto');
    boton.classList.add('oculto');
    document.body.classList.add('con-chat');
    setTimeout(() => (texto ? enviar(texto) : matchMedia('(pointer: fine)').matches && $input.focus()), 280);
  }
  function cerrar() {
    panel.classList.remove('abierto');
    boton.classList.remove('oculto');
    document.body.classList.remove('con-chat');
  }
  boton.addEventListener('click', () => (sonidos.pop(), abrir()));
  panel.querySelector('[data-cerrar]').onclick = cerrar;
  panel.querySelector('[data-limpiar]').onclick = () => {
    historial = [];
    irisHist = [];
    pendiente = null;
    guardar();
    pintarHistorial();
  };
  panel.querySelector('.chat-avatar').addEventListener('click', (e) => (reaccionar(e.currentTarget, 'mimo'), sonidos.traqueteo()));
  panel.querySelector('form').addEventListener('submit', (e) => (e.preventDefault(), enviar($input.value)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && panel.classList.contains('abierto') && cerrar());

  return {
    abrir,
    cerrar,
    refrescar: pintarBoton,
    avisar: (on) => (boton.querySelector('.punto').hidden = !on),
  };
}
