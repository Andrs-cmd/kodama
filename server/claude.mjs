// Análisis de la foto con Claude: identifica la especie, revisa su estado y marca
// sobre la imagen dónde cortar, qué pinzar y qué ramas alambrar (coordenadas 0-1).
import Anthropic from '@anthropic-ai/sdk';
import { ESPECIES } from '../www/js/especies.js';
import { ESTILOS } from '../www/js/guia.js';

const MODELO = 'claude-opus-5-5';
let cliente = null;

export const iaDisponible = () => Boolean(process.env.ANTHROPIC_API_KEY);

function claude() {
  if (!iaDisponible()) throw Object.assign(new Error('Falta ANTHROPIC_API_KEY en el archivo .env para analizar fotos.'), { status: 503 });
  cliente ??= new Anthropic();
  return cliente;
}

const CATALOGO = ESPECIES.map((e) => `${e.id} | ${e.nombre} | ${e.cientifico}`).join('\n');
const LISTA_ESTILOS = Object.entries(ESTILOS).map(([id, s]) => `${id} | ${s.nombre} (${s.es})`).join('\n');

// Estable entre peticiones para que se cachee.
const SISTEMA = `Eres un maestro de bonsái que asesora en español de Colombia, con lenguaje claro para principiantes.
Recibes la foto de un bonsái (o de un árbol/planta candidato a bonsái) y devuelves un diagnóstico completo y un plan de trabajo marcado sobre la foto.

Coordenadas: todas las posiciones son fracciones de la imagen, x de 0 (borde izquierdo) a 1 (borde derecho) e y de 0 (borde superior) a 1 (borde inferior). Sé preciso: el punto de un corte va exactamente sobre la rama, en el lugar donde entra la tijera. Si una marca no la puedes ubicar con seguridad, no la inventes: omítela y explícalo en las observaciones.

Cortes (tipo):
- estructural: quitar una rama o parte del tronco para definir el diseño (ramas cruzadas, paralelas, en "barra", que salen al frente en el tercio bajo, chupones, dos o más del mismo punto, que salen del interior de una curva, ápice demasiado alto).
- mantenimiento: recortar brotes largos para conservar la silueta.
- pinzado: puntas a pinzar.
- jin: una rama que conviene convertir en madera muerta en vez de cortarla (sobre todo coníferas).
Marca entre 3 y 10 cortes, los más importantes primero. Numera por prioridad.

Alambrado: para cada rama o tramo de tronco a alambrar, "trazo" recorre la rama tal como está hoy, desde su base hasta la punta (2 a 6 puntos sobre la rama), y "destino" es dónde debería quedar la punta después de doblarla. Calibre en mm del alambre de aluminio (1/3 del grosor de la rama). Si la especie no se alambra bien (suculentas, ginkgo), devuelve la lista vacía y explica la alternativa (tensores, cortar y dejar crecer).

Silueta: el triángulo objetivo del diseño (ápice, extremo izquierdo y extremo derecho de la copa), según el estilo recomendado.

Riego: "dias" son los días entre riegos para ESTE árbol en las condiciones que indica el usuario (maceta que se ve, ubicación y clima). Aclara siempre que se riega cuando la superficie del sustrato está seca, no solo por calendario.

Guía completa ("guia"): datos exactos para ESTA especie y estas condiciones. Las temporadas son las de los Andes colombianos: seca1 (dic–feb, seco, heladas en la sabana), lluvias1 (mar–may, gran brotación), seca2 (jun–ago, vientos y veranillo), lluvias2 (sep–nov, segunda brotación). Para cada una di qué hacer con riego, abono, poda, alambrado y trasplante. En abono indica tipo y fórmula NPK (p. ej. 10-10-10, 15-15-15 a 1/4 de dosis, 10-30-10 para floración, acidófilas) con frecuencia, y cuándo cambiar de uno a otro. En sustrato da la mezcla en porcentajes y una alternativa con materiales fáciles de conseguir en Colombia (piedra pómez, cascarilla de arroz quemada, arena de río lavada, gravilla). Incluye temperatura ideal y límites, plagas típicas con tratamiento y toxicidad para mascotas.

Si la especie está en el catálogo usa su id exacto en especieId; si no, deja especieId vacío ("") y da igual todos los cuidados. Si la foto no es un árbol o planta, marca esBonsai=false, deja las listas vacías y explica en estado.resumen qué foto tomar.

Catálogo de especies (id | nombre | científico):
${CATALOGO}

Estilos (id | nombre):
${LISTA_ESTILOS}`;

const PUNTO = {
  type: 'object',
  additionalProperties: false,
  required: ['x', 'y'],
  properties: { x: { type: 'number' }, y: { type: 'number' } },
};
const TEXTOS = { type: 'array', items: { type: 'string' } };

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['esBonsai', 'identificacion', 'estado', 'estiloActual', 'estiloRecomendado', 'frente', 'riego', 'cuidados', 'cortes', 'alambrado', 'silueta', 'plan', 'guia'],
  properties: {
    esBonsai: { type: 'boolean' },
    identificacion: {
      type: 'object',
      additionalProperties: false,
      required: ['especieId', 'nombreComun', 'cientifico', 'confianza', 'rasgos', 'alternativas'],
      properties: {
        especieId: { type: 'string', enum: ['', ...ESPECIES.map((e) => e.id)] },
        nombreComun: { type: 'string' },
        cientifico: { type: 'string' },
        confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
        rasgos: { ...TEXTOS, description: 'Rasgos visibles en la foto que justifican la identificación' },
        alternativas: { ...TEXTOS, description: 'Otras especies posibles si hay duda' },
      },
    },
    estado: {
      type: 'object',
      additionalProperties: false,
      required: ['resumen', 'observaciones', 'alertas'],
      properties: { resumen: { type: 'string' }, observaciones: TEXTOS, alertas: { ...TEXTOS, description: 'Problemas de salud, plagas o urgencias' } },
    },
    estiloActual: { type: 'string', description: 'id del estilo que tiene hoy o ""' },
    estiloRecomendado: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'porque'],
      properties: { id: { type: 'string', enum: Object.keys(ESTILOS) }, porque: { type: 'string' } },
    },
    frente: { type: 'string', description: 'Si este es un buen frente o hacia dónde girar el árbol' },
    riego: {
      type: 'object',
      additionalProperties: false,
      required: ['dias', 'frecuencia', 'como', 'senales'],
      properties: { dias: { type: 'integer' }, frecuencia: { type: 'string' }, como: { type: 'string' }, senales: { type: 'string' } },
    },
    cuidados: {
      type: 'object',
      additionalProperties: false,
      required: ['luz', 'sustrato', 'abono', 'trasplante'],
      properties: { luz: { type: 'string' }, sustrato: { type: 'string' }, abono: { type: 'string' }, trasplante: { type: 'string' } },
    },
    cortes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['tipo', 'x', 'y', 'que', 'porque', 'cuando', 'prioridad'],
        properties: {
          tipo: { type: 'string', enum: ['estructural', 'mantenimiento', 'pinzado', 'jin'] },
          x: { type: 'number' },
          y: { type: 'number' },
          que: { type: 'string', description: 'Qué cortar, en pocas palabras' },
          porque: { type: 'string' },
          cuando: { type: 'string' },
          prioridad: { type: 'string', enum: ['alta', 'media', 'baja'] },
        },
      },
    },
    alambrado: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['trazo', 'destino', 'calibreMm', 'que', 'como', 'cuando'],
        properties: {
          trazo: { type: 'array', items: PUNTO },
          destino: PUNTO,
          calibreMm: { type: 'number' },
          que: { type: 'string' },
          como: { type: 'string', description: 'Cómo enrollar y hacia dónde doblar' },
          cuando: { type: 'string' },
        },
      },
    },
    silueta: {
      type: 'object',
      additionalProperties: false,
      required: ['apice', 'izquierda', 'derecha'],
      properties: { apice: PUNTO, izquierda: PUNTO, derecha: PUNTO },
    },
    guia: {
      type: 'object',
      additionalProperties: false,
      required: ['crecimiento', 'temperatura', 'temporadas', 'abono', 'sustrato', 'plagas', 'propagacion', 'toxicidad'],
      properties: {
        crecimiento: { type: 'string', description: 'Velocidad de crecimiento y cuándo brota' },
        temperatura: { type: 'string', description: 'Rango ideal y límites en °C' },
        temporadas: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['epoca', 'riego', 'abono', 'poda', 'alambrado', 'trasplante'],
            properties: {
              epoca: { type: 'string', enum: ['seca1', 'lluvias1', 'seca2', 'lluvias2'] },
              riego: { type: 'string' }, abono: { type: 'string' }, poda: { type: 'string' }, alambrado: { type: 'string' }, trasplante: { type: 'string' },
            },
          },
        },
        abono: {
          type: 'object',
          additionalProperties: false,
          required: ['etapas', 'cambio'],
          properties: {
            etapas: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['etapa', 'producto', 'frecuencia'], properties: { etapa: { type: 'string' }, producto: { type: 'string' }, frecuencia: { type: 'string' } } } },
            cambio: { type: 'string', description: 'Cuándo y por qué cambiar de abono' },
          },
        },
        sustrato: {
          type: 'object',
          additionalProperties: false,
          required: ['mezcla', 'alternativa'],
          properties: { mezcla: { type: 'string' }, alternativa: { type: 'string' } },
        },
        plagas: TEXTOS,
        propagacion: { type: 'string' },
        toxicidad: { type: 'string' },
      },
    },
    plan: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['cuando', 'tareas'],
        properties: { cuando: { type: 'string' }, tareas: TEXTOS },
      },
    },
  },
};

const TIPOS_IMAGEN = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function analizarFoto({ imagen, tipo = 'image/jpeg', contexto = {} }) {
  if (!imagen) throw Object.assign(new Error('Falta la foto.'), { status: 400 });
  if (!TIPOS_IMAGEN.has(tipo)) throw Object.assign(new Error('Formato de imagen no soportado.'), { status: 400 });

  const condiciones = [
    contexto.clima && `Clima: ${contexto.clima}`,
    contexto.ubicacion && `Ubicación: ${contexto.ubicacion}`,
    contexto.maceta && `Maceta: ${contexto.maceta}`,
    contexto.nota && `Nota del usuario: ${contexto.nota}`,
  ].filter(Boolean).join('\n');

  const peticion = {
    model: MODELO,
    max_tokens: 16000,
    system: [{ type: 'text', text: SISTEMA, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: tipo, data: imagen } },
          { type: 'text', text: `Analiza este bonsái y marca el plan de trabajo sobre la foto.\n${condiciones}` },
        ],
      },
    ],
    output_config: { effort: 'high', format: { type: 'json_schema', schema: ESQUEMA } },
  };

  let respuesta;
  try {
    // Si un clasificador de seguridad rechaza la petición, la API la reintenta en otro modelo.
    respuesta = await claude().beta.messages.create({ ...peticion, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
  } catch (e) {
    if (!(e instanceof Anthropic.BadRequestError) || !/fallback/i.test(e.message)) throw e;
    respuesta = await claude().messages.create(peticion);
  }
  if (respuesta.stop_reason === 'refusal') throw Object.assign(new Error('Claude no pudo analizar esta foto.'), { status: 422 });
  if (respuesta.stop_reason === 'max_tokens') throw Object.assign(new Error('El análisis quedó incompleto; intenta de nuevo.'), { status: 502 });

  const texto = respuesta.content.find((b) => b.type === 'text')?.text;
  if (!texto) throw Object.assign(new Error('Respuesta vacía de Claude.'), { status: 502 });
  return limpiar(JSON.parse(texto));
}

// Asegura que ninguna marca quede fuera de la foto.
const acotar = (v) => Math.min(1, Math.max(0, Number(v) || 0));
const punto = (p) => ({ x: acotar(p?.x), y: acotar(p?.y) });

function limpiar(a) {
  a.cortes = (a.cortes || []).map((c) => ({ ...c, x: acotar(c.x), y: acotar(c.y) }));
  a.alambrado = (a.alambrado || []).filter((w) => w.trazo?.length >= 2).map((w) => ({ ...w, trazo: w.trazo.map(punto), destino: punto(w.destino) }));
  a.silueta = { apice: punto(a.silueta?.apice), izquierda: punto(a.silueta?.izquierda), derecha: punto(a.silueta?.derecha) };
  a.riego.dias = Math.max(1, Math.round(a.riego.dias || 3));
  return a;
}
