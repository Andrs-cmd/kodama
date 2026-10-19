import { ESPECIES, POR_ID, GRUPOS, buscarEspecies } from './especies.js';
import { ESTILOS, TECNICAS } from './guia.js';
import { MACETAS, UBICACIONES, CLIMAS, textoFrecuencia } from './riego.js';
import { arbolSVG, revivir } from './arbol.js';
import { kodamaSVG, reaccionar, nivelDe, PARTES, normalizarApariencia, particulas } from './kodama.js';
import * as A from './almacen.js';
import { tareasDe, animoDe } from './tareas.js';
import { FLUJOS, abrirHoja } from './flujos.js';
import { abrirBienvenida } from './bienvenida.js';
import { montarAsistente } from './asistente.js';
import { montarJuego } from './juego.js';
import { pintarResultado } from './analisis.js';
import { pintarEnciclopedia, cargarFotos, fotoEspecie, abrirEspecie } from './enciclopedia.js';
import { htmlTemporadaHoy } from './guia-vista.js';
import * as Alertas from './alertas.js';
import { describirCuando } from './cerebro.js';
import { url, enApk, revisarServidor, estadoServidor } from './api.js';
import { sonidos, vibrar } from './sonido.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const corto = (e) => e?.nombre.split(' (')[0] || 'Especie sin elegir';

function aviso(texto) {
  const el = $('#aviso');
  el.textContent = texto;
  el.hidden = false;
  el.classList.remove('entra');
  void el.offsetWidth;
  el.classList.add('entra');
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => (el.hidden = true), 3200);
}

// ============ Navegación (con transición de vista) ============
let vistaActual = 'hoy';
let limpiarJuego = null;
function irA(vista, { ancla } = {}) {
  const cambiar = () => {
    vistaActual = vista;
    $$('.vista').forEach((v) => v.classList.toggle('activa', v.id === `ver-${vista}`));
    $$('.navegacion button').forEach((b) => b.classList.toggle('activa', b.dataset.vista === vista || (vista === 'kodama' && b.dataset.vista === 'hoy')));
    limpiarJuego?.();
    limpiarJuego = null;
    if (vista === 'hoy') pintarHoy();
    if (vista === 'jardin') pintarJardin();
    if (vista === 'kodama') pintarKodama();
    if (vista === 'aprender') pintarEnciclopedia($('#ver-aprender'));
    if (vista === 'foto') pintarEstadoFoto();
    window.scrollTo({ top: 0 });
    if (ancla) setTimeout(() => document.getElementById(ancla)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches && vista !== vistaActual) document.startViewTransition(cambiar);
  else cambiar();
}
$$('.navegacion button').forEach((b) => b.addEventListener('click', () => (sonidos.pop(), irA(b.dataset.vista))));

function abrirFlujo(nombre, b = A.activo()) {
  FLUJOS[nombre]?.(b, {
    alTerminar: (tipo) => {
      asistente.refrescar();
      if (vistaActual === 'hoy') setTimeout(() => {
        pintarHoy();
        reaccionar($('.esc-kodama'), 'festejo');
        revivir($('.esc-arbol .arbol'));
      }, 50);
      if (tipo === 'leccion') pintarLecciones();
    },
  });
}

// ============ HOY ============
const momento = (h = new Date().getHours()) => (h < 6 ? 'noche' : h < 8 ? 'amanecer' : h < 17 ? 'dia' : h < 19 ? 'atardecer' : 'noche');
const saludo = (h = new Date().getHours()) => (h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches');
const haceTexto = (f) => {
  if (!f) return 'Nunca';
  const d = A.diasEntre(f);
  return d === 0 ? 'Hoy' : d === 1 ? 'Ayer' : `Hace ${d} días`;
};
const ICONO_TAREA = { gota: 'ico-gota', sol: 'ico-sol', tijera: 'ico-tijera', abono: 'ico-abono', alambre: 'ico-alambre', giro: 'ico-giro' };

function pintarHoy() {
  const cont = $('#ver-hoy');
  const b = A.activo();
  if (!b) {
    cont.innerHTML = `<div class="vacio grande">${kodamaSVG(A.kodama(), { expresion: 'normal', clase: 'grande' })}<h2 class="titulo-grande">Aún no tienes un bonsái</h2><p class="bajada">Cuéntame cuál es y empezamos.</p><button class="boton primario grande" data-agregar>Agregar mi bonsái</button></div>`;
    $('[data-agregar]', cont).onclick = () => abrirBienvenida({ primera: !A.bienvenidaHecha(), alTerminar: () => pintarHoy() });
    return;
  }
  const e = A.especieDe(b);
  const k = A.kodama();
  const nv = nivelDe(k.xp);
  const { animo, expresion, frase } = animoDe(b);
  const r = A.estadoRiego(b);
  const tareas = tareasDe(b);
  const lista = A.bonsais();
  const conifera = (e?.grupo || 'conifera') === 'conifera';
  const consejos = e ? [e.luz, e.riego.senales, e.poda.mantenimiento, e.alambrado.consejo, e.andino, e.humedad, e.plagas].filter(Boolean) : ['Toma una foto de tu árbol para saber qué especie es.'];
  const consejo = consejos[Math.floor(Date.now() / 864e5) % consejos.length];
  const anillo = 2 * Math.PI * 34;

  cont.innerHTML = `
    <header class="hoy-cabeza">
      <div><p class="meta">${saludo()} · ${new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 class="titulo-grande">${esc(b.nombre)}</h1>
        <p class="meta">${esc(corto(e))}${e ? ` · ${esc(GRUPOS[e.grupo])}` : ''}</p></div>
      <button class="icono-boton" data-editar aria-label="Editar ${esc(b.nombre)}"><svg><use href="#ico-editar"/></svg></button>
    </header>
    ${lista.length > 1 ? `<div class="selector-bonsai">${lista.map((x) => `<button class="chip ${x.id === b.id ? 'activo' : ''}" data-elegir="${x.id}">${esc(x.nombre)}</button>`).join('')}</div>` : ''}

    <div class="escenario" data-momento="${momento()}">
      <div class="cielo"><div class="astro"></div><div class="nube-c n1"></div><div class="nube-c n2"></div><div class="nube-c n3"></div>
        <div class="luciernagas">${Array.from({ length: 7 }, (_, i) => `<i style="--x:${10 + i * 13}%;--y:${20 + ((i * 37) % 50)}%;--d:${i * 0.7}s"></i>`).join('')}</div></div>
      <div class="suelo"></div>
      <div class="esc-arbol" role="button" tabindex="0" aria-label="Tocar el árbol">${arbolSVG({ grupo: e?.grupo || 'conifera', animo })}</div>
      <div class="esc-kodama" role="button" tabindex="0" aria-label="Mimar a ${esc(k.nombre)}">${kodamaSVG(k, { expresion })}</div>
      <div class="globo" role="status"><b>${esc(k.nombre)}:</b> ${esc(frase)}</div>
    </div>

    <div class="estadisticas">
      <div class="stat agua"><span><svg><use href="#ico-gota"/></svg>Agua</span><div class="barra"><i style="--v:${r.agua.toFixed(2)}"></i></div></div>
      <div class="stat carino"><span>♥ Cariño</span><div class="barra"><i style="--v:${A.carino().toFixed(2)}"></i></div></div>
      <button class="stat nivel" data-ir="kodama"><span>★ Nivel ${nv.nivel}</span><div class="barra"><i style="--v:${nv.progreso.toFixed(2)}"></i></div><small>${k.xp} / ${nv.hasta} XP</small></button>
    </div>

    <div class="fila-riego tarjeta">
      <svg class="anillo" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" class="pista"/><circle cx="40" cy="40" r="34" class="valor" style="stroke-dasharray:${anillo};--off:${anillo * (1 - r.agua)}"/>
        <text x="40" y="38" class="anillo-n">${r.sinDatos ? '?' : r.dias <= 0 ? '¡Hoy!' : r.dias}</text><text x="40" y="54" class="anillo-t">${r.sinDatos || r.dias <= 0 ? '' : r.dias === 1 ? 'día' : 'días'}</text></svg>
      <div><strong>${r.sinDatos ? 'Cuéntame cuándo lo regaste' : r.dias < 0 ? 'Riego atrasado' : r.dias === 0 ? 'Toca revisar la tierra' : 'Próximo riego'}</strong>
        <p class="meta">Le va bien ${esc(textoFrecuencia(r.cada))} · último: ${haceTexto(r.ultimo).toLowerCase()}</p></div>
      <button class="boton primario" data-flujo="regar"><svg><use href="#ico-gota"/></svg>Regar</button>
    </div>

    <div class="acciones-rapidas">
      ${[
        ['regar', 'ico-gota', 'Regar', A.ultimo(b, 'riego')],
        ['pinzar', 'ico-tijera', conifera ? 'Pinzar' : 'Podar', A.ultimo(b, 'pinzado')],
        ['alambrar', 'ico-alambre', 'Alambrar', A.ultimo(b, 'alambre')],
        ['abonar', 'ico-abono', 'Abonar', A.ultimo(b, 'abono')],
      ].map(([f, ic, t, u], i) => `<button class="accion" data-flujo="${f}" style="--i:${i}"><span class="burbuja-ic"><svg><use href="#${ic}"/></svg></span>${t}<small>${haceTexto(u)}</small></button>`).join('')}
    </div>

    <h3 class="titulo-medio">Para hoy</h3>
    <ul class="tareas">${tareas.map((t, i) => `
      <li class="tarea ${t.hecha ? 'hecha' : ''} ${t.urgente ? 'urgente' : ''}" style="--i:${i}" data-tarea="${t.id}">
        <span class="t-ic"><svg><use href="#${ICONO_TAREA[t.icono] || 'ico-hoja'}"/></svg></span>
        <div><strong>${esc(t.titulo)}</strong>${t.detalle ? `<small>${esc(t.detalle)}</small>` : ''}</div>
        ${t.hecha ? '<span class="check-ok" aria-label="Hecho"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>'
          : t.flujo ? `<button class="boton secundario chico" data-flujo="${t.flujo}">Empezar</button>`
          : `<button class="check" data-accion-tarea="${t.accion}" aria-label="Marcar hecho"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`}
      </li>`).join('') || '<li class="tarea hecha"><div><strong>Nada pendiente hoy</strong><small>Disfruta tu árbol 🌿</small></div></li>'}
    </ul>

    ${e ? htmlTemporadaHoy(e.id) : ''}

    <div class="dos-tarjetas">
      <button class="tarjeta tarjeta-foto" data-ir="foto">
        ${b.foto ? `<img src="${b.foto.url}" alt="">` : `<span class="foto-vacia"><svg><use href="#ico-camara"/></svg></span>`}
        <span><strong>${b.foto ? 'Plan de trabajo' : 'Tómale una foto'}</strong><small>${b.foto ? 'Cortes y alambrado sobre tu foto' : 'Te marco dónde cortar y alambrar'}</small></span>
      </button>
      <button class="tarjeta tarjeta-juego" data-ir="kodama"><span class="mini-k">${kodamaSVG(k, { expresion: 'feliz', clase: 'mini' })}</span>
        <span><strong>${esc(k.nombre)}</strong><small>Personalízalo y juega</small></span></button>
    </div>

    <article class="tarjeta consejo"><span class="meta">Consejo del día</span><p>${esc(consejo)}</p></article>`;

  // Interacciones
  const kod = $('.esc-kodama', cont);
  const mimar = () => {
    const veces = A.mimar();
    sonidos.traqueteo();
    vibrar(10);
    reaccionar(kod, 'mimo');
    const globo = $('.globo', cont);
    const frases = ['¡Jiji! Eso me hace cosquillas.', '♥ Me gusta estar contigo.', '¿Sabías que en Japón decimos que el eco es nuestra voz?', 'Cuidar un bonsái es cuidar el tiempo.', '¡Más, más!'];
    globo.innerHTML = `<b>${esc(k.nombre)}:</b> ${esc(veces > 5 ? 'Ya me diste mucho cariño hoy. ¡Gracias!' : frases[(veces - 1) % frases.length])}`;
    globo.classList.remove('salta');
    void globo.offsetWidth;
    globo.classList.add('salta');
    $('.stat.carino i', cont).style.setProperty('--v', A.carino().toFixed(2));
    const nv2 = nivelDe(A.kodama().xp);
    $('.stat.nivel i', cont).style.setProperty('--v', nv2.progreso.toFixed(2));
    $('.stat.nivel small', cont).textContent = `${A.kodama().xp} / ${nv2.hasta} XP`;
  };
  kod.addEventListener('click', mimar);
  kod.addEventListener('keydown', (ev) => ev.key === 'Enter' && mimar());
  $('.esc-arbol', cont).addEventListener('click', () => {
    revivir($('.esc-arbol .arbol', cont));
    sonidos.suave();
    particulas($('.esc-arbol', cont), conifera ? ['·', '✦', '·'] : ['❀', '·', '✿'], 4);
  });
  $$('[data-flujo]', cont).forEach((x) => x.addEventListener('click', () => (sonidos.pop(), abrirFlujo(x.dataset.flujo, b))));
  $$('[data-ir]', cont).forEach((x) => x.addEventListener('click', () => (x.dataset.ir === 'foto' && b.foto ? verPlanGuardado(b) : irA(x.dataset.ir))));
  $$('[data-elegir]', cont).forEach((x) => x.addEventListener('click', () => (A.fijarActivo(x.dataset.elegir), pintarHoy())));
  $('[data-editar]', cont).addEventListener('click', () => editarBonsai(b));
  $('[data-guia-completa]', cont)?.addEventListener('click', () => verGuia(e.id));
  $$('[data-accion-tarea]', cont).forEach((x) => x.addEventListener('click', () => accionTarea(x.dataset.accionTarea, b, x.closest('.tarea'))));
}

function accionTarea(accion, b, li) {
  li?.classList.add('completando');
  sonidos.pop();
  vibrar(12);
  setTimeout(() => {
    if (accion === 'girar') {
      A.registrar(b.id, 'giro');
      aviso('Maceta girada. +10 XP');
      setTimeout(() => $('.esc-arbol .arbol')?.classList.add('gira'), 80);
    } else if (accion === 'sacar') {
      A.actualizarBonsai(b.id, { condiciones: { ...b.condiciones, ubicacion: 'exterior' } });
      A.sumarXP(10, 'sol');
      aviso('¡Gracias! Al sol va a estar mucho mejor.');
    } else if (accion === 'retirar') {
      A.registrar(b.id, 'retiroAlambre');
      aviso('Anotado: alambre retirado.');
    }
    pintarHoy();
    reaccionar($('.esc-kodama'), 'salto');
  }, 450);
}

// Editar o borrar un bonsái
function editarBonsai(b) {
  const h = abrirHoja(`Editar ${b.nombre}`);
  const sel = (nombre, mapa, valor) => `<select name="${nombre}">${Object.entries(mapa).map(([k, v]) => `<option value="${k}" ${k === valor ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>`;
  h.cuerpo.innerHTML = `
    <form class="formulario">
      <label>Nombre<input name="nombre" value="${esc(b.nombre)}" maxlength="30"></label>
      <label>Especie<select name="especieId"><option value="">— No sé —</option>${ESPECIES.map((e) => `<option value="${e.id}" ${e.id === b.especieId ? 'selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select></label>
      <label>Lugar${sel('ubicacion', UBICACIONES, b.condiciones.ubicacion)}</label>
      <label>Clima${sel('clima', CLIMAS, b.condiciones.clima)}</label>
      <label>Maceta${sel('maceta', MACETAS, b.condiciones.maceta)}</label>
      <label class="bv-interruptor"><input type="checkbox" name="avisoRiego" ${b.avisoRiego ? 'checked' : ''}><span></span>Avisarme cuando toque revisar la tierra</label>
      <button class="boton primario grande ancho">Guardar</button>
      <button type="button" class="boton texto ancho peligro" data-borrar>Eliminar este bonsái</button>
    </form>`;
  const f = $('form', h.cuerpo);
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const nuevo = A.actualizarBonsai(b.id, { nombre: d.nombre.trim() || b.nombre, especieId: d.especieId, condiciones: { ubicacion: d.ubicacion, clima: d.clima, maceta: d.maceta }, avisoRiego: f.avisoRiego.checked });
    await Alertas.reprogramarRiego(nuevo).catch(() => {});
    h.cerrar();
    pintarHoy();
    aviso('Cambios guardados.');
  });
  $('[data-borrar]', h.cuerpo).onclick = () => {
    if (!confirm(`¿Eliminar "${b.nombre}"? Se borran su foto y sus cuidados anotados.`)) return;
    Alertas.borrarDeBonsai(b.id).catch(() => {});
    A.borrarBonsai(b.id);
    h.cerrar();
    irA('hoy');
  };
}

// ============ FOTO ============
function pintarEstadoFoto() {
  const s = estadoServidor();
  $('#estado-ia').textContent = s.ia
    ? '✓ Análisis con IA activo: identifica la especie y marca los cortes.'
    : s.conectado
      ? 'Sin clave de IA en el servidor: te muestro la guía manual sobre tu foto.'
      : enApk()
        ? 'Sin conexión con tu PC: te muestro la guía manual. (Para el análisis con IA, conecta en Jardín → Ajustes).'
        : 'Te muestro la guía manual sobre tu foto.';
}

function cargarImagen(archivo) {
  return new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => mal(new Error('No pude abrir esa imagen.'));
    img.src = URL.createObjectURL(archivo);
  });
}
function reducir(img, lado, calidad) {
  const k = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * k);
  c.height = Math.round(img.naturalHeight * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return { url: c.toDataURL('image/jpeg', calidad), w: c.width, h: c.height };
}

const FRASES = ['Mirando la forma de las hojas y la corteza…', 'Buscando el ápice y la primera rama…', 'Revisando ramas cruzadas y paralelas…', 'Pensando qué ramas se pueden alambrar…', 'Calculando cada cuánto regarlo donde vive…', 'Un buen bonsái se hace en años, no en minutos. Ya casi…'];

async function alElegirFoto(ev) {
  const archivo = ev.target.files?.[0];
  ev.target.value = '';
  if (!archivo) return;
  let img;
  try { img = await cargarImagen(archivo); } catch (err) { return aviso(err.message); }
  const envio = reducir(img, 1568, 0.85);
  const vista = reducir(img, 1000, 0.78);
  const foto = { url: vista.url, w: vista.w, h: vista.h };
  const b = A.activo();
  if (!estadoServidor().ia) return mostrarFoto({ foto, analisis: null, especieId: b?.especieId || '' });
  $('#foto-inicio').hidden = true;
  $('#foto-resultado').hidden = true;
  $('#foto-cargando').hidden = false;
  $('#img-cargando').src = foto.url;
  let i = 0;
  $('#frase-carga').textContent = FRASES[0];
  const t = setInterval(() => ($('#frase-carga').textContent = FRASES[++i % FRASES.length]), 3800);
  try {
    const c = b?.condiciones || { clima: 'frio', ubicacion: 'exterior', maceta: 'mediana' };
    const r = await fetch(url('api/analizar'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagen: envio.url.split(',')[1], tipo: 'image/jpeg', contexto: { clima: CLIMAS[c.clima], ubicacion: UBICACIONES[c.ubicacion], maceta: MACETAS[c.maceta], nota: b && A.especieDe(b) ? `El usuario cree que es ${A.especieDe(b).nombre}.` : '' } }),
    });
    const datos = await r.json();
    if (!r.ok) throw new Error(datos.error || 'No se pudo analizar la foto.');
    mostrarFoto({ foto, analisis: datos, especieId: b?.especieId || datos.identificacion.especieId });
  } catch (err) {
    aviso(`${err.message} Te dejo la guía manual.`);
    mostrarFoto({ foto, analisis: null, especieId: b?.especieId || '' });
  } finally {
    clearInterval(t);
    $('#foto-cargando').hidden = true;
  }
}
$('#in-camara').addEventListener('change', alElegirFoto);
$('#in-galeria').addEventListener('change', alElegirFoto);

function volverFotoInicio() {
  $('#foto-resultado').hidden = true;
  $('#foto-resultado').innerHTML = '';
  $('#foto-inicio').hidden = false;
  window.scrollTo({ top: 0 });
}

function mostrarFoto(registro) {
  const b = A.activo();
  $('#foto-inicio').hidden = true;
  const cont = $('#foto-resultado');
  cont.hidden = false;
  pintarResultado(registro, cont, {
    alVolver: volverFotoInicio,
    textoVolver: 'Otra foto',
    aviso: estadoServidor().ia ? '' : 'Elige la especie y el estilo, y ajusta la silueta sobre tu foto. Con la IA conectada te marco cada corte automáticamente.',
    acciones: `${POR_ID[registro.especieId || registro.analisis?.identificacion?.especieId] ? '<button class="boton secundario grande" data-accion="guia"><svg><use href="#ico-libro"/></svg>Guía completa de la especie</button>' : ''}${b ? `<button class="boton primario grande" data-accion="activo"><svg><use href="#ico-maceta"/></svg>Guardar en ${esc(b.nombre)}</button>` : ''}<button class="boton secundario grande" data-accion="nuevo">Guardar como bonsái nuevo</button>`,
    alAccion: (accion, reg) => {
      if (accion === 'guia') return verGuia(reg.especieId || reg.analisis?.identificacion?.especieId);
      const datos = { foto: reg.foto, analisis: reg.analisis, manual: reg.manual };
      try {
        if (accion === 'activo') {
          A.actualizarBonsai(b.id, { ...datos, especieId: b.especieId || reg.especieId || reg.analisis?.identificacion.especieId || '' });
          A.registrar(b.id, 'foto');
        } else {
          const e = POR_ID[reg.especieId || reg.analisis?.identificacion.especieId];
          const nuevo = A.crearBonsai({ nombre: e ? `Mi ${corto(e).split(' ')[0].toLowerCase()}` : 'Mi bonsái', especieId: e?.id || '', ...datos });
          A.registrar(nuevo.id, 'foto');
        }
      } catch (err) {
        return aviso(err.message);
      }
      volverFotoInicio();
      aviso('Foto guardada. +30 XP');
      irA('hoy');
    },
  });
  window.scrollTo({ top: 0 });
}

function verPlanGuardado(b) {
  irA('foto');
  $('#foto-inicio').hidden = true;
  const cont = $('#foto-resultado');
  cont.hidden = false;
  pintarResultado({ foto: b.foto, analisis: b.analisis, especieId: b.especieId, manual: b.manual }, cont, {
    alVolver: () => (volverFotoInicio(), irA('hoy')),
    textoVolver: b.nombre,
    acciones: `${A.especieDe(b) ? '<button class="boton secundario grande" data-accion="guia"><svg><use href="#ico-libro"/></svg>Guía completa</button>' : ''}<button class="boton secundario grande" data-accion="otra">Tomar otra foto</button>`,
    alAccion: (accion) => (accion === 'guia' ? verGuia(A.especieDe(b).id) : volverFotoInicio()),
    alCambiarManual: (reg) => A.actualizarBonsai(b.id, { manual: reg.manual }),
  });
}

// ============ ENCICLOPEDIA ============
function verGuia(id) {
  irA('aprender');
  setTimeout(() => abrirEspecie(id, $('#ver-aprender')), 60);
}

function pintarLecciones() {
  if (vistaActual === 'aprender') pintarEnciclopedia($('#ver-aprender'));
}

// ============ JARDÍN ============
function pintarJardin() {
  const lista = A.bonsais();
  const activo = A.activo();
  $('#lista-jardin').innerHTML = lista.map((b, i) => {
    const r = A.estadoRiego(b);
    const e = A.especieDe(b);
    return `<button class="tarjeta mi-bonsai ${b.id === activo?.id ? 'activo' : ''}" data-id="${b.id}" style="--i:${i}">
      ${b.foto ? `<img src="${b.foto.url}" alt="">` : e ? `<span class="mini">${fotoEspecie(e.id)}</span>` : `<span class="mini">${arbolSVG({ grupo: 'conifera', clase: 'mini' })}</span>`}
      <span><span class="nombre">${esc(b.nombre)}</span><span class="meta">${esc(corto(e))}</span>
      <span class="proximo ${!r.sinDatos && r.dias <= 0 ? 'tarde' : ''}"><svg><use href="#ico-gota"/></svg> ${r.sinDatos ? 'Sin riegos anotados' : r.dias < 0 ? 'Riego atrasado' : r.dias === 0 ? 'Revisar hoy' : `En ${r.dias} días`}</span></span>
    </button>`;
  }).join('') || '<p class="vacio">Aún no tienes bonsáis.</p>';
  $$('.mi-bonsai').forEach((x) => (x.onclick = () => { A.fijarActivo(x.dataset.id); irA('hoy'); }));
  pintarAlertas();
  pintarAjustes();
}
$('#agregar-bonsai').onclick = () => abrirBienvenida({ primera: false, alTerminar: (b) => b && irA('hoy') });

function pintarAlertas() {
  const l = Alertas.lista();
  $('#lista-alertas').innerHTML = l.length
    ? `<ul class="alertas">${l.map((a) => `<li><span class="t-ic"><svg><use href="#${a.tipo === 'riego' ? 'ico-gota' : a.tipo === 'alambre' ? 'ico-alambre' : 'ico-campana'}"/></svg></span>
        <div><strong>${esc(a.titulo)}</strong><small>${esc(describirCuando({ fecha: Alertas.proximaVez(a), repetir: a.repetir }))}</small></div>
        <button class="icono-boton" data-borrar-alerta="${a.id}" aria-label="Borrar alerta"><svg><use href="#ico-cerrar"/></svg></button></li>`).join('')}</ul>`
    : '<p class="meta">No tienes alertas. Pídele a tu kodama: "recuérdame abonar el sábado".</p>';
  $$('[data-borrar-alerta]').forEach((x) => (x.onclick = async () => { await Alertas.borrar(Number(x.dataset.borrarAlerta)); pintarAlertas(); }));
  $('#nota-alertas').textContent = Alertas.nativas() ? 'Las alertas llegan como notificación aunque la app esté cerrada.' : 'En el navegador, las alertas suenan mientras la app está abierta. En la APK llegan como notificación.';
}
$('#nueva-alerta').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const d = Object.fromEntries(new FormData(f));
  const { permiso } = await Alertas.crear({ titulo: d.titulo.trim(), cuando: new Date(d.cuando), repetir: d.repetir, bonsaiId: A.activo()?.id });
  f.reset();
  pintarAlertas();
  sonidos.pop();
  aviso(permiso ? 'Alerta creada.' : 'Alerta guardada (activa las notificaciones para que te llegue).');
});

function pintarAjustes() {
  const a = A.ajustes();
  const s = estadoServidor();
  $('#panel-ajustes').innerHTML = `
    <label class="bv-interruptor"><input type="checkbox" data-aj="sonido" ${a.sonido ? 'checked' : ''}><span></span>Sonidos</label>
    <label>Hora de los avisos de riego<input type="time" data-aj="horaAviso" value="${esc(a.horaAviso)}"></label>
    <h4>Conexión con tu PC</h4>
    <p class="meta">El análisis de fotos con IA y las preguntas a Iris usan el servidor de Kodama en tu PC. Todo lo demás (incluido el chat del kodama) funciona en el celular sin internet.</p>
    ${enApk() ? `<label>Dirección del servidor<input type="url" data-aj="servidor" placeholder="http://192.168.1.92:8830" value="${esc(a.servidor)}"></label>` : ''}
    <label class="bv-interruptor"><input type="checkbox" data-aj="usarIris" ${a.usarIris ? 'checked' : ''}><span></span>Preguntarle a Iris lo que el kodama no sepa</label>
    <p class="estado-conexion"><span class="${s.conectado ? 'ok' : ''}">${s.conectado ? '● Conectado al PC' : '○ Sin conexión al PC'}</span> · <span class="${s.ia ? 'ok' : ''}">Fotos con IA: ${s.ia ? 'sí' : 'no'}</span> · <span class="${s.iris ? 'ok' : ''}">Iris: ${s.iris ? 'sí' : 'no'}</span></p>
    <button type="button" class="boton secundario" data-probar>Probar conexión</button>
    <button type="button" class="boton texto" data-bienvenida>Ver la bienvenida otra vez</button>`;
  $$('[data-aj]').forEach((x) => x.addEventListener('change', () => {
    A.guardarAjustes({ [x.dataset.aj]: x.type === 'checkbox' ? x.checked : x.value.trim() });
    if (x.dataset.aj === 'horaAviso') Alertas.reprogramarTodo().then(pintarAlertas);
    if (x.dataset.aj === 'servidor') revisarServidor().then(pintarAjustes);
  }));
  $('[data-probar]').onclick = async (ev) => {
    ev.target.textContent = 'Probando…';
    await revisarServidor();
    pintarAjustes();
    pintarEstadoFoto();
  };
  $('[data-bienvenida]').onclick = () => abrirBienvenida({ primera: true, alTerminar: () => irA('hoy') });
}

// ============ KODAMA (tamagochi) ============
let parteK = 'color';
function pintarKodama() {
  const cont = $('#ver-kodama');
  const k = A.kodama();
  const ap = normalizarApariencia(k);
  const nv = nivelDe(k.xp);
  const total = PARTES.reduce((n, [, , m]) => n + Object.keys(m).length, 0);
  const libres = PARTES.reduce((n, [, , m]) => n + Object.values(m).filter((o) => o.nivel <= nv.nivel).length, 0);
  const proximos = PARTES.flatMap(([, t, m]) => Object.values(m).filter((o) => o.nivel === nv.nivel + 1).map((o) => o.nombre));
  cont.innerHTML = `
    <button class="boton texto volver" data-volver><svg><use href="#ico-volver"/></svg>Hoy</button>
    <div class="kodama-perfil">
      <div class="kodama-grande" role="button" tabindex="0" aria-label="Mimar">${kodamaSVG(ap, { expresion: 'feliz' })}</div>
      <input class="nombre-k" value="${esc(k.nombre)}" maxlength="20" aria-label="Nombre de tu kodama">
      <div class="stat nivel"><span>★ Nivel ${nv.nivel}</span><div class="barra"><i style="--v:${nv.progreso.toFixed(2)}"></i></div><small>${k.xp} / ${nv.hasta} XP · faltan ${nv.hasta - k.xp} para el nivel ${nv.nivel + 1}</small></div>
      <div class="logros"><span><b>${libres}/${total}</b> cosas desbloqueadas</span><span><b>${k.diasCuidado.length}</b> días de cuidado</span><span><b>${k.juego?.mejor || 0}</b> récord de gotas</span></div>
      ${proximos.length ? `<div class="desbloqueo">🔓 En el nivel ${nv.nivel + 1}: <b>${esc(proximos.join(', '))}</b></div>` : ''}
    </div>
    <div class="personaliza-cabeza"><h3 class="titulo-medio">Personaliza</h3><button class="boton secundario chico" data-azar>🎲 Sorpréndeme</button></div>
    <div class="partes" role="tablist">${PARTES.map(([clave, t, m]) => `<button class="chip ${clave === parteK ? 'activo' : ''}" data-parte="${clave}">${t} <small>${Object.values(m).filter((o) => o.nivel <= nv.nivel).length}/${Object.keys(m).length}</small></button>`).join('')}</div>
    <div class="opciones-k"></div>
    <details class="tecnica"><summary><strong>¿Cómo gana experiencia?</strong><span>Cuidando tu árbol de verdad</span></summary>
      <ol><li>Regar: +20 · Pinzar o podar: +30 · Alambrar: +40 · Abonar: +25</li><li>Girar la maceta o revisar la tierra: +10</li><li>Foto de tu árbol: +30 · Cada lección: +15</li><li>Mimos (hasta 5 al día): +2 · Juego (1 vez al día): hasta +15</li></ol></details>
    <h3 class="titulo-medio">Juego del día</h3>
    <div id="hueco-juego"></div>`;
  const grande = $('.kodama-grande', cont);
  const refrescarGrande = (reaccion = 'salto') => {
    grande.innerHTML = kodamaSVG(normalizarApariencia(A.kodama()), { expresion: 'feliz' });
    reaccionar(grande, reaccion);
    asistente.refrescar();
  };
  const pintarOpciones = () => {
    const actual = normalizarApariencia(A.kodama());
    const [clave, , mapa] = PARTES.find(([c]) => c === parteK);
    const caja = $('.opciones-k', cont);
    caja.classList.remove('entra');
    void caja.offsetWidth;
    caja.classList.add('entra');
    caja.innerHTML = Object.entries(mapa).map(([id, o], i) => {
      const bloqueado = o.nivel > nv.nivel;
      return `<button class="opcion-k ${actual[clave] === id ? 'activo' : ''}" style="--i:${i}" data-valor="${id}" ${bloqueado ? 'disabled' : ''}>
        <span class="mini-k">${kodamaSVG({ ...actual, [clave]: id }, { clase: 'mini', expresion: clave === 'ojos' || clave === 'boca' ? 'normal' : 'feliz' })}</span>${esc(o.nombre)}
        ${bloqueado ? `<span class="candado"><svg><use href="#ico-candado"/></svg>Nivel ${o.nivel}</span>` : ''}</button>`;
    }).join('');
    $$('.opcion-k', caja).forEach((x) => x.addEventListener('click', () => {
      A.guardarKodama({ [clave]: x.dataset.valor, ...(clave === 'sombrero' || clave === 'cuello' ? { accesorio: undefined } : {}) });
      sonidos.pop();
      $$('.opcion-k', caja).forEach((o) => o.classList.toggle('activo', o === x));
      refrescarGrande();
    }));
  };
  $$('[data-parte]', cont).forEach((b) => b.addEventListener('click', () => {
    parteK = b.dataset.parte;
    $$('[data-parte]', cont).forEach((x) => x.classList.toggle('activo', x === b));
    sonidos.pop();
    pintarOpciones();
  }));
  $('[data-azar]', cont).onclick = () => {
    const cambio = {};
    for (const [clave, , mapa] of PARTES) {
      const libres2 = Object.entries(mapa).filter(([, o]) => o.nivel <= nv.nivel).map(([id]) => id);
      cambio[clave] = libres2[Math.floor(Math.random() * libres2.length)];
    }
    A.guardarKodama({ ...cambio, accesorio: undefined });
    sonidos.logro();
    refrescarGrande('festejo');
    pintarOpciones();
  };
  const mimar = () => { A.mimar(); sonidos.traqueteo(); reaccionar(grande, 'mimo'); };
  grande.addEventListener('click', mimar);
  grande.addEventListener('keydown', (e) => e.key === 'Enter' && mimar());
  $('.nombre-k', cont).addEventListener('change', (e) => { A.guardarKodama({ nombre: e.target.value.trim() || 'Kodama' }); asistente.refrescar(); });
  $('[data-volver]', cont).onclick = () => irA('hoy');
  pintarOpciones();
  limpiarJuego = montarJuego($('#hueco-juego', cont), { alTerminar: () => {} });
}

// Subir de nivel: celebración con lo desbloqueado.
A.alSubirNivel((n) => {
  const nuevos = PARTES.flatMap(([, , m]) => Object.values(m)).filter((o) => o.nivel === n).map((o) => o.nombre);
  setTimeout(() => {
    const h = abrirHoja('¡Subiste de nivel!');
    h.cuerpo.innerHTML = `<div class="celebra"><div class="celebra-kodama">${kodamaSVG(A.kodama(), { expresion: 'sorpresa', clase: 'grande' })}</div>
      <h3 class="titulo-grande">Nivel ${n}</h3><p>${nuevos.length ? `Desbloqueaste: <strong>${esc(nuevos.join(', '))}</strong>.` : 'Tu kodama está más fuerte.'}</p>
      <button class="boton primario grande ancho" data-k>Personalizar</button><button class="boton texto ancho" data-c>Después</button></div>`;
    sonidos.logro();
    vibrar(40);
    setTimeout(() => reaccionar($('.celebra-kodama', h.cuerpo), 'festejo'), 200);
    $('[data-k]', h.cuerpo).onclick = () => (h.cerrar(), irA('kodama'));
    $('[data-c]', h.cuerpo).onclick = h.cerrar;
  }, 900);
});

// ============ Asistente ============
function contextoCerebro() {
  const b = A.activo();
  const k = A.kodama();
  return { bonsai: b, especie: A.especieDe(b), riego: b ? A.estadoRiego(b) : null, kodama: k, nivel: nivelDe(k.xp), tareas: tareasDe(b) };
}
function contextoTexto() {
  const b = A.activo();
  if (!b) return 'El usuario aún no ha agregado su bonsái.';
  const e = A.especieDe(b);
  const r = A.estadoRiego(b);
  return [
    `Bonsái activo: "${b.nombre}", especie ${e ? `${e.nombre} (${e.cientifico})` : 'desconocida'}. Vive: ${UBICACIONES[b.condiciones.ubicacion]}, clima ${CLIMAS[b.condiciones.clima]}, maceta ${MACETAS[b.condiciones.maceta]}.`,
    `Riego ${textoFrecuencia(r.cada)}; ${r.sinDatos ? 'sin riegos anotados' : `próximo en ${r.dias} días`}.`,
    `Pendiente hoy: ${tareasDe(b).filter((t) => !t.hecha).map((t) => t.titulo).join('; ') || 'nada'}.`,
    e ? `Cuidados de la especie. Luz: ${e.luz} Abono: ${e.abono} Poda: ${e.poda.mantenimiento} Alambrado: ${e.alambrado.consejo} Clima andino: ${e.andino}` : '',
    `Fecha y hora actual: ${new Date().toLocaleString('es-CO')}.`,
  ].join('\n');
}

async function ejecutarAccion(a, { cerrarChat }) {
  const b = A.activo();
  if (a.tipo === 'ir') {
    cerrarChat();
    const destino = { alertas: ['jardin', 'alertas'], ajustes: ['jardin', 'ajustes'], juego: ['kodama'] }[a.vista] || [a.vista];
    irA(destino[0], { ancla: destino[1] || (a.vista === 'juego' ? 'hueco-juego' : undefined) });
    return `Abrí ${a.vista}.`;
  }
  if (a.tipo === 'flujo') {
    cerrarChat();
    abrirFlujo(a.flujo, b);
    return `Abrí la guía de ${a.flujo}.`;
  }
  if (a.tipo === 'registrar') {
    if (!b) return 'No hay bonsái.';
    const { bonsai, xp } = A.registrar(b.id, a.evento);
    if (a.evento === 'riego') await Alertas.reprogramarRiego(bonsai).catch(() => {});
    if (vistaActual === 'hoy') pintarHoy();
    aviso(xp ? `+${xp} XP para ${A.kodama().nombre}` : 'Anotado.');
    return 'Anotado.';
  }
  if (a.tipo === 'alerta') {
    const { permiso } = await Alertas.crear({ titulo: a.titulo, cuando: a.cuando, repetir: a.repetir, bonsaiId: b?.id });
    if (vistaActual === 'jardin') pintarAlertas();
    if (!permiso) aviso('Activa las notificaciones para que la alerta te llegue.');
    return 'Alerta creada.';
  }
}

const asistente = montarAsistente({ contexto: contextoCerebro, ejecutar: ejecutarAccion, contextoTexto });

// ============ Arranque ============
A.alCambiar((que) => {
  if (que === 'kodama' || que === 'bonsais') {
    const b = A.activo();
    asistente.avisar(b ? tareasDe(b).some((t) => t.urgente && !t.hecha) : false);
  }
});

Alertas.vigilar((a) => {
  aviso(`🔔 ${a.titulo}`);
  Alertas.marcarVista(a.id);
  sonidos.logro();
});

function alertasPendientes() {
  for (const a of Alertas.pendientes()) {
    aviso(`🔔 ${a.titulo}`);
    Alertas.marcarVista(a.id);
  }
}

pintarHoy();
cargarFotos().then(() => {
  if (vistaActual === 'aprender') pintarEnciclopedia($('#ver-aprender'));
  if (vistaActual === 'jardin') pintarJardin();
});
revisarServidor().then(() => {
  pintarEstadoFoto();
  if (vistaActual === 'jardin') pintarAjustes();
});
alertasPendientes();
{
  const b = A.activo();
  asistente.avisar(b ? tareasDe(b).some((t) => t.urgente && !t.hecha) : false);
}
if (!A.bienvenidaHecha() && !A.bonsais().length) cargarFotos().then(() => abrirBienvenida({ primera: true, alTerminar: () => irA('hoy') }));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    alertasPendientes();
    if (vistaActual === 'hoy') pintarHoy();
  }
});

// Botón atrás de Android: cierra lo que esté abierto antes de salir.
window.Capacitor?.Plugins?.App?.addListener?.('backButton', () => {
  const hoja = document.querySelector('.hoja.abierta [data-cerrar]');
  if (hoja) return hoja.click();
  if (document.querySelector('.chat.abierto')) return asistente.cerrar();
  const atras = document.querySelector('.bienvenida .bv-atras');
  if (atras && !atras.hidden) return atras.click();
  if (document.querySelector('.bienvenida')) return;
  if (vistaActual !== 'hoy') return irA('hoy');
  window.Capacitor.Plugins.App.exitApp();
});
