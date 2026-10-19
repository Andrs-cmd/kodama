// Cerebro local del kodama: entiende frases comunes en español y responde con el
// conocimiento de la app (especies, técnicas, estado del árbol). Funciona sin
// internet, dentro del celular. Lo que no entiende se lo pasa a Iris (si está).
import { ESPECIES, POR_ID } from './especies.js';
import { ESTILOS, TECNICAS } from './guia.js';
import { textoFrecuencia } from './riego.js';

export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[¿?¡!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();

const NUM = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, quince: 15, veinte: 20, treinta: 30 };
const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const n = (x) => (/^\d+$/.test(x) ? Number(x) : NUM[x] ?? null);

// "mañana a las 7", "en 2 horas", "el sábado en la tarde", "todos los días a las 8 am"
export function entenderCuando(texto, ahora = new Date()) {
  const t = norm(texto);
  let fecha = new Date(ahora);
  let hayFecha = false, hayHora = false;
  let repetir = 'no';
  if (/(todos los dias|cada dia|diari|todas las mananas|todas las noches)/.test(t)) repetir = 'dia';
  if (/(cada semana|todas las semanas|semanal|todos los (lunes|martes|miercoles|jueves|viernes|sabados|domingos))/.test(t)) repetir = 'semana';

  const rel = t.match(/\ben (\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince|veinte|treinta) (minuto|hora|dia|semana|mes)/);
  if (rel) {
    const k = n(rel[1]);
    const ms = { minuto: 6e4, hora: 36e5, dia: 864e5, semana: 6048e5, mes: 2592e6 }[rel[2]];
    fecha = new Date(ahora.getTime() + k * ms);
    hayFecha = true;
    hayHora = rel[2] === 'minuto' || rel[2] === 'hora';
  } else if (/pasado manana/.test(t)) { fecha.setDate(fecha.getDate() + 2); hayFecha = true; }
  else if (/\bmanana\b/.test(t.replace(/(de|en|por) la manana/g, ''))) { fecha.setDate(fecha.getDate() + 1); hayFecha = true; }
  else if (/\b(hoy|esta noche|esta tarde)\b/.test(t)) hayFecha = true;
  const dia = DIAS.findIndex((d) => new RegExp(`\\b${d}s?\\b`).test(t));
  if (dia >= 0 && !rel) {
    const dif = (dia - ahora.getDay() + 7) % 7 || 7;
    fecha = new Date(ahora);
    fecha.setDate(ahora.getDate() + dif);
    hayFecha = true;
  }

  const h = t.match(/a las? (\d{1,2})(?:[: ](\d{2}))?\s*(am|pm|a m|p m|de la manana|de la tarde|de la noche|en la manana|en la tarde|en la noche)?/);
  if (h) {
    let hora = Number(h[1]);
    const min = Number(h[2] || 0);
    const suf = h[3] || '';
    if (/(pm|p m|tarde|noche)/.test(suf) && hora < 12) hora += 12;
    if (/(am|a m|manana)/.test(suf) && hora === 12) hora = 0;
    if (!suf && hora >= 1 && hora <= 6) hora += 12; // "a las 3" → 3 pm
    fecha.setHours(hora, min, 0, 0);
    hayHora = true;
  } else if (/mediodia/.test(t)) { fecha.setHours(12, 0, 0, 0); hayHora = true; }
  else if (/(en|por) la manana|temprano/.test(t)) { fecha.setHours(8, 0, 0, 0); hayHora = true; }
  else if (/(en|por) la tarde|esta tarde/.test(t)) { fecha.setHours(15, 0, 0, 0); hayHora = true; }
  else if (/(en|por) la noche|esta noche/.test(t)) { fecha.setHours(20, 0, 0, 0); hayHora = true; }

  if (!hayFecha && !hayHora && repetir === 'no') return null;
  if (!hayHora) fecha.setHours(8, 0, 0, 0);
  if (hayHora && !hayFecha && fecha <= ahora && !rel) fecha.setDate(fecha.getDate() + 1);
  return { fecha, repetir };
}

function queRecordar(texto, bonsai) {
  let t = norm(texto)
    .replace(/^.*?(recuerdame|recordarme|recuerda|avisame|avisarme|ponme|pon|crea|programa)\b(?: (una|un)\b)?(?: (alarma|alerta|recordatorio)\b)?(?: (para|de|que|a)\b)?\s*/, '')
    .replace(/\b(pasado manana|manana|hoy|esta noche|esta tarde|todos los dias|cada dia|cada semana|todas las semanas)\b/g, '')
    .replace(/\ben (\d+|un|una|dos|tres|cuatro|cinco|diez|quince|veinte|treinta) (minutos?|horas?|dias?|semanas?|mes(es)?)\b/g, '')
    .replace(/\ba las? \d{1,2}([: ]\d{2})?\s*(am|pm|a m|p m|de la manana|de la tarde|de la noche)?/g, '')
    .replace(/\b(el|los) (lunes|martes|miercoles|jueves|viernes|sabado|domingo)s?\b/g, '')
    .replace(/\b(en|por) la (manana|tarde|noche)\b|\bal mediodia\b/g, '')
    .replace(/\s+/g, ' ').trim();
  const nombre = bonsai?.nombre || 'el bonsái';
  if (!t || /^(eso|esto)$/.test(t)) return `Revisar ${nombre}`;
  if (/^(regar|riego|echarle agua|el riego)/.test(t)) return `Revisar la tierra y regar ${nombre}`;
  if (/^abon/.test(t)) return `Abonar ${nombre}`;
  if (/^(pinzar|podar)/.test(t)) return `${t[0].toUpperCase()}${t.slice(1)} ${nombre}`;
  if (/alambre/.test(t)) return `Revisar el alambre de ${nombre}`;
  return t[0].toUpperCase() + t.slice(1);
}

const VISTAS = [
  [/(alertas|recordatorios|alarmas)/, 'alertas', 'Tus alertas'],
  [/(personaliz|vestir|color|sombrero|accesorio|apariencia|ropa)/, 'kodama', 'Personalizar tu kodama'],
  [/(jugar|juego|minijuego)/, 'juego', 'El juego de las gotas'],
  [/(foto|camara|escanear|analiza|identifica)/, 'foto', 'Tomar una foto'],
  [/(aprender|tecnicas|estilos|especies|guias|lecciones|catalogo)/, 'aprender', 'Aprender'],
  [/(jardin|mis bonsais|mis arboles|otro bonsai|agregar bonsai)/, 'jardin', 'Tu jardín'],
  [/(ajustes|configuracion|servidor|sonido)/, 'ajustes', 'Ajustes'],
  [/(inicio|hoy|mi bonsai|mi arbol|principal)/, 'hoy', 'Hoy'],
];

const FLUJOS = [
  [/(regar|riego|echarle agua)/, 'regar', 'regar'],
  [/(pinz|podar|poda de mant|recortar|cortar brotes)/, 'pinzar', 'pinzar'],
  [/(alambr|alambre)/, 'alambrar', 'alambrar'],
  [/(abon|fertiliz)/, 'abonar', 'abonar'],
];

const REGISTROS = [
  [/(ya )?(lo |la |le )?(regue|le di agua|le eche agua)/, 'riego', 'Anoté el riego'],
  [/(ya )?(lo |la |le )?(abone|le eche abono|fertilice)/, 'abono', 'Anoté el abono'],
  [/(ya )?(lo |la |le )?(pinze|pince|pode|recorte)/, 'pinzado', 'Anoté la poda'],
  [/(le puse alambre|alambre hoy|lo alambre|la alambre)/, 'alambre', 'Anoté el alambre. Te aviso para revisarlo'],
  [/(le quite el alambre|retire el alambre|quite el alambre)/, 'retiroAlambre', 'Anoté que retiraste el alambre'],
  [/(lo gire|la gire|gire la maceta)/, 'giro', 'Anoté el giro de la maceta'],
];

const SINTOMAS = [
  { re: /(amarill)/, titulo: 'Hojas amarillas', conifera: 'En juníperos y pinos, el amarillo por dentro suele ser falta de luz (necesitan sol directo). Si amarillea todo y la tierra está siempre húmeda, es exceso de agua: deja secar la superficie entre riegos.', otro: 'Lo más común es exceso de agua o poca luz. Revisa que la maceta drene bien y que la tierra se seque un poco entre riegos. Si los nervios quedan verdes, falta hierro (abono con micronutrientes).' },
  { re: /(cafe|marron|puntas secas|se seca|seco|quemad)/, titulo: 'Puntas cafés o secas', conifera: 'En coníferas: si el café empieza en las puntas, puede ser sed o viento seco; si empieza por dentro y la tierra está mojada, raíces ahogadas. Nunca cortes el follaje con tijera por la mitad: también lo pone café. Pinza con los dedos.', otro: 'Bordes secos suelen ser sed, sol muy fuerte o viento. Revisa la tierra con el dedo más seguido y protégelo del sol del mediodía.' },
  { re: /(se caen|se le caen|bota (las )?hojas|caida de hojas|pierde hojas|se deshoja)/, titulo: 'Se le caen las hojas', conifera: 'Las coníferas botan agujas viejas de adentro de vez en cuando: es normal. Si caen las nuevas, revisa riego y luz.', otro: 'Suele pasar por cambio de lugar, corrientes de aire frío, poca luz o riego irregular. Déjalo quieto en un sitio luminoso y riega solo cuando la superficie esté seca.' },
  { re: /(blanc|algodon|cochinilla|escama)/, titulo: 'Bolitas blancas o algodón', conifera: 'Es cochinilla. Retírala con un copito con alcohol y pulveriza jabón potásico cada 5 días, tres veces.', otro: 'Es cochinilla. Límpiala con un copito con alcohol y aplica jabón potásico o aceite de neem cada 5 días, tres veces.' },
  { re: /(telarana|arana|punticos|puntitos)/, titulo: 'Telarañas finas o puntitos', conifera: 'Puede ser araña roja, muy común en juníperos con ambiente seco. Pulveriza el follaje con agua a diario y aplica jabón potásico o neem.', otro: 'Puede ser araña roja. Sube la humedad (pulverizar) y aplica jabón potásico o neem.' },
  { re: /(pulgon|bicho|insecto|plaga|gusano)/, titulo: 'Plagas', conifera: 'Revisa debajo de las ramas. Para casi todo sirve jabón potásico o aceite de neem, al atardecer, cada 5–7 días.', otro: 'Revisa el envés de las hojas. Jabón potásico o neem al atardecer, cada 5–7 días, suele bastar.' },
  { re: /(moho|hongo|tierra blanca|mal olor|pudr|blando)/, titulo: 'Hongos o pudrición', conifera: 'Casi siempre es exceso de agua y poco drenaje. Deja secar más entre riegos, ponlo con más sol y aire, y en el próximo trasplante usa sustrato más drenante (pómice, akadama).', otro: 'Casi siempre es exceso de agua. Riega menos, más aire y luz, y revisa que la maceta drene.' },
  { re: /(no crece|no brota|no echa|esta quieto|parado)/, titulo: 'No crece', conifera: 'Necesita sol directo varias horas al día y abono cada 3–4 semanas. En Bogotá crece más lento por el frío: es normal.', otro: 'Revisa luz (casi todos los bonsáis quieren mucha), abono regular y si la maceta está llena de raíces (toca trasplante).' },
];

function especieEnTexto(t) {
  for (const e of ESPECIES) {
    const nombres = [e.nombre, e.cientifico, ...e.otros].map(norm);
    if (nombres.some((x) => x.split(/[ /()]+/).some((w) => w.length > 4 && new RegExp(`\\b${w}\\b`).test(t)))) return e;
  }
  if (/(junipero|enebro)/.test(t)) return POR_ID['junipero-procumbens'];
  return null;
}

const corto = (e) => e.nombre.split(' (')[0];
const TEMAS = [
  [/(luz|sol|sombra|donde (lo )?pongo|adentro|afuera|interior|exterior)/, (e) => `☀️ Luz para ${corto(e)}: ${e.luz} ${e.ubicacion === 'exterior' ? 'Es de exterior: adentro se debilita.' : e.ubicacion === 'interior' ? 'Vive bien en interior luminoso.' : 'Puede vivir adentro o afuera.'}`],
  [/(abono|abonar|fertiliz|comida)/, (e) => `🌱 Abono: ${e.abono}`],
  [/(sustrato|tierra|akadama|pomice)/, (e) => `🪨 Sustrato ideal: ${e.sustrato}`],
  [/(trasplant|cambiar de maceta|maceta nueva)/, (e) => `🪴 Trasplante: ${e.trasplante}`],
  [/(alambr)/, (e) => `🧵 Alambrado: ${e.alambrado.epoca} ${e.alambrado.consejo} Retirar: ${e.alambrado.retirar}`],
  [/(poda|podar|cortar|pinz)/, (e) => `✂️ Mantenimiento: ${e.poda.mantenimiento}\nEstructural: ${e.poda.estructural}\nÉpoca: ${e.poda.epoca}`],
  [/(humedad|pulveriz)/, (e) => `💦 Humedad: ${e.humedad}`],
  [/(plaga)/, (e) => `🐛 Plagas comunes: ${e.plagas}`],
  [/(defoli)/, (e) => `🍂 Defoliado: ${e.defoliado}`],
  [/(clima|bogota|frio|andino)/, (e) => `🏔️ En clima andino: ${e.andino}`],
  [/(estilo)/, (e) => `🎋 Estilos que le van: ${e.estilos.map((s) => ESTILOS[s]?.nombre + ' (' + ESTILOS[s]?.es + ')').join(', ')}.`],
  [/(como reconozco|identific|que especie|rasgos)/, (e) => `🔍 Cómo reconocer ${corto(e)}: ${e.rasgos.join('; ')}.`],
];

export const SUGERENCIAS = ['¿Cuándo lo riego?', 'Hojas cafés en las puntas', 'Recuérdame abonar el sábado', 'Enséñame a alambrar', '¿Qué significa kodama?'];

// ctx: { bonsai, especie, riego: {dias, cada, sinDatos}, kodama, nivel, tareas }
export function responder(texto, ctx = {}) {
  const t = norm(texto);
  const b = ctx.bonsai;
  const enTexto = especieEnTexto(t);
  const e = enTexto || ctx.especie;
  const nombre = b?.nombre || 'tu bonsái';

  if (!t) return null;
  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que mas|quiubo)/.test(t) && t.split(' ').length <= 4)
    return { texto: `¡Hola! Soy ${ctx.kodama?.nombre || 'tu kodama'}. Puedo decirte qué toca hoy, explicarte cuidados, crear alertas o llevarte a cualquier parte de la app.`, chips: SUGERENCIAS.slice(0, 4), reaccion: 'salto' };
  if (/(que puedes|que sabes|ayuda|como funciona|que haces)/.test(t))
    return { texto: 'Esto sé hacer:\n• Decirte cuándo regar y qué toca hoy\n• Responder sobre luz, abono, poda, alambre, plagas y síntomas\n• Crear alertas ("recuérdame abonar el sábado a las 9")\n• Anotar cuidados ("ya lo regué")\n• Llevarte a una sección ("abre la cámara")\n• Enseñarte con guías interactivas ("enséñame a pinzar")', chips: SUGERENCIAS };
  if (/(kodama)/.test(t) && /(que es|que significa|significado|quien eres|que eres|de donde)/.test(t))
    return { texto: 'Kodama (木霊) significa "espíritu del árbol". En el folclor japonés son seres que viven dentro de los árboles viejos: cuidarlos trae buena fortuna y talar un árbol con kodama, mala suerte. También se dice que el eco en las montañas es su voz. Son famosos por la película La princesa Mononoke, donde aparecen como espíritus blancos que hacen sonar su cabeza. Yo vivo en tu bonsái 🌳', reaccion: 'mimo' };
  if (/^(gracias|muchas gracias|te quiero|que lindo|eres lindo)/.test(t)) return { texto: '¡Con gusto! 💚 Los árboles agradecen la constancia.', reaccion: 'mimo' };

  // Alertas
  if (/(recuerd|avis|alarma|alerta|recordatorio|notific)/.test(t)) {
    if (/(mis|que|cuales|ver|lista de) (alertas|recordatorios|alarmas)/.test(t) || /^(alertas|recordatorios)$/.test(t))
      return { texto: 'Aquí están tus alertas.', acciones: [{ tipo: 'ir', vista: 'alertas' }] };
    const cuando = entenderCuando(t);
    const titulo = queRecordar(texto, b);
    if (!cuando) return { texto: `¿Para cuándo te recuerdo "${titulo}"? Por ejemplo: "mañana a las 7" o "el sábado en la tarde".`, chips: ['Mañana a las 8', 'En 2 horas', 'Todos los días a las 7 am'], pendiente: { tipo: 'alerta', titulo } };
    return { texto: `Listo: te recuerdo "${titulo}" ${describirCuando(cuando)}`.replace(/\.?$/, '.'), acciones: [{ tipo: 'alerta', titulo, cuando: cuando.fecha.toISOString(), repetir: cuando.repetir }], reaccion: 'salto' };
  }

  // Anotar cuidados
  for (const [re, tipo, txt] of REGISTROS) if (re.test(t) && !/(como|cuando|debo|tengo que)/.test(t)) {
    if (!b) return { texto: 'Primero agrega tu bonsái para poder anotar sus cuidados.', acciones: [{ tipo: 'ir', vista: 'jardin' }] };
    return { texto: `${txt} para ${nombre}. ¡Gracias por cuidarlo!`, acciones: [{ tipo: 'registrar', evento: tipo }], reaccion: 'festejo' };
  }

  // Estado del riego
  if (/(cuando|cada cuanto|toca|debo|tengo que|hay que|necesita).*(regar|riego|agua)|(regar|riego) (hoy|manana)/.test(t)) {
    if (e && ctx.especie && e.id !== ctx.especie.id) return { texto: `💧 ${corto(e)}: riego base ${textoFrecuencia(e.riego.dias)} (maceta mediana, afuera, clima templado). ${e.riego.nota}`, chips: [`Luz para ${corto(e)}`] };
    if (!b) return { texto: e ? `💧 ${corto(e)}: ${e.riego.nota}` : 'Riega cuando el primer centímetro de tierra esté seco, hasta que salga agua por abajo.', chips: ['Enséñame a regar'] };
    const r = ctx.riego;
    const cuando = r.sinDatos ? 'Aún no me has dicho cuándo lo regaste.' : r.dias < 0 ? `Ya debiste revisarlo hace ${-r.dias} día${r.dias === -1 ? '' : 's'}.` : r.dias === 0 ? 'Hoy toca revisar la tierra.' : r.dias === 1 ? 'Mañana toca revisar la tierra.' : `Toca revisar en ${r.dias} días.`;
    return { texto: `💧 ${cuando} A ${nombre} le va bien ${textoFrecuencia(r.cada)}, pero manda la tierra: riega solo si el primer centímetro está seco.`, chips: ['Enséñame a regar', 'Ya lo regué'] };
  }

  // Qué toca hoy
  if (/(que (toca|hago|debo hacer|hay que hacer)|tareas|pendientes|que le hago)/.test(t)) {
    const p = (ctx.tareas || []).filter((x) => !x.hecha);
    return { texto: p.length ? `Para hoy:\n${p.map((x) => `• ${x.titulo}`).join('\n')}` : 'Hoy no hay nada pendiente. ¡Disfrútalo! 🌿', acciones: [{ tipo: 'ir', vista: 'hoy' }] };
  }

  // Guías interactivas
  for (const [re, flujo, verbo] of FLUJOS)
    if (re.test(t) && /(como|ensena|ensename|quiero|ayudame|vamos|guia|muestrame|practicar|aprender)/.test(t))
      return { texto: `¡Vamos! Te enseño a ${verbo} paso a paso.`, acciones: [{ tipo: 'flujo', flujo }] };

  // Síntomas
  for (const s of SINTOMAS)
    if (s.re.test(t)) {
      const con = (e?.grupo || 'conifera') === 'conifera';
      return { texto: `🩺 ${s.titulo}${e ? ` en ${corto(e)}` : ''}: ${con ? s.conifera : s.otro}\n\nSi puedes, tómale una foto y lo reviso con más detalle.`, chips: ['Tomar una foto', '¿Cuándo lo riego?'] };
    }

  // Navegación
  if (/(abre|abrir|ve a|ir a|vamos a|llevame|muestrame|mostrar|ver|entra|quiero ver|pasame a)/.test(t) || t.split(' ').length <= 2)
    for (const [re, vista, nombreVista] of VISTAS) if (re.test(t)) return { texto: `Te llevo a ${nombreVista}.`, acciones: [{ tipo: 'ir', vista }] };

  // Estilos
  for (const [id, s] of Object.entries(ESTILOS))
    if (t.includes(norm(s.nombre)) || t.includes(norm(s.es))) return { texto: `🎋 ${s.nombre} (${s.es}): ${s.desc}` };

  // Técnicas por nombre
  for (const tec of TECNICAS)
    if (/(trasplant|jin|shari|defoli)/.test(t) && norm(tec.titulo).split(' ').some((w) => w.length > 3 && t.includes(w.slice(0, 6))))
      return { texto: `📖 ${tec.titulo}: ${tec.resumen}\n${tec.pasos.map((p, i) => `${i + 1}. ${p}`).join('\n')}` };

  // Temas de cuidado de la especie
  if (e) for (const [re, fn] of TEMAS) if (re.test(t)) return { texto: fn(e), chips: ['¿Cuándo lo riego?', 'Enséñame a pinzar'] };

  // Nivel del kodama
  if (/(nivel|experiencia|xp|desbloque)/.test(t))
    return { texto: `${ctx.kodama?.nombre || 'Tu kodama'} está en nivel ${ctx.nivel?.nivel || 1} (${ctx.kodama?.xp || 0} XP). Cuidar el árbol, completar lecciones y jugar da experiencia.`, acciones: [{ tipo: 'ir', vista: 'kodama' }] };

  if (enTexto && t.split(' ').length <= 3) return { texto: `🌳 ${e.nombre} (${e.cientifico}). ${e.luz} Riego base ${textoFrecuencia(e.riego.dias)}.`, chips: [`Abono para ${corto(e)}`, `Poda de ${corto(e)}`] };

  return null;
}

export function describirCuando({ fecha, repetir }) {
  const hoy = new Date();
  const d = Math.round((new Date(fecha).setHours(0, 0, 0, 0) - new Date(hoy).setHours(0, 0, 0, 0)) / 864e5);
  const hora = new Date(fecha).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
  const diaTxt = d === 0 ? 'hoy' : d === 1 ? 'mañana' : d === 2 ? 'pasado mañana' : `el ${new Date(fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`;
  if (repetir === 'dia') return `todos los días a las ${hora}`;
  if (repetir === 'semana') return `cada ${new Date(fecha).toLocaleDateString('es-CO', { weekday: 'long' })} a las ${hora}`;
  return `${diaTxt} a las ${hora}`;
}
