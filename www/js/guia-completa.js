// Guía completa por especie: calendario por temporadas (clima andino colombiano),
// plan de abono, sustrato, clima, crecimiento, propagación, variedades, plagas,
// errores y toxicidad. Lo común va por grupo y cada especie ajusta lo suyo.
import { POR_ID } from './especies.js';

// ---------- Temporadas en los Andes colombianos (régimen bimodal) ----------
export const EPOCAS = [
  { id: 'seca1', nombre: 'Seca de inicio de año', meses: [11, 0, 1], rango: 'dic – feb', clima: 'Días soleados y secos, noches frías. En la sabana puede haber heladas al amanecer.', icono: '☀️' },
  { id: 'lluvias1', nombre: 'Primeras lluvias', meses: [2, 3, 4], rango: 'mar – may', clima: 'Lluvias y nubosidad. Es la gran brotación del año.', icono: '🌧️' },
  { id: 'seca2', nombre: 'Mitad de año', meses: [5, 6, 7], rango: 'jun – ago', clima: 'Vientos y veranillo: el sustrato se seca rápido.', icono: '🌬️' },
  { id: 'lluvias2', nombre: 'Segundas lluvias', meses: [8, 9, 10], rango: 'sep – nov', clima: 'Lluvias fuertes, segunda brotación y más hongos.', icono: '⛈️' },
];
export const epocaActual = (f = new Date()) => EPOCAS.find((e) => e.meses.includes(f.getMonth()));

const CAL = {
  conifera: {
    seca1: { riego: 'Más seguido: sol y viento secan rápido. Pulveriza el follaje al atardecer.', abono: 'Equilibrado cada 3 semanas.', poda: 'Pinza solo los brotes que se escapen.', alambre: 'Buena época para alambrar: crece despacio y marca menos.', trasplante: 'No.', extra: 'Si hay helada en la sabana, sube la maceta del suelo y cúbrelo de noche.' },
    lluvias1: { riego: 'Menos: revisa con el dedo, la lluvia ya moja. Que drene bien.', abono: 'Empieza el abono de crecimiento cuando veas brotes nuevos.', poda: 'Pinzado frecuente de los brotes que alargan.', alambre: 'Revisa alambres: en brotación marcan rápido.', trasplante: 'MEJOR ÉPOCA: al inicio (marzo), cuando empiezan a hinchar las yemas.', extra: 'Vigila hongos por humedad: buena ventilación.' },
    seca2: { riego: 'Más seguido por el viento. No dejes que el cepellón se seque del todo.', abono: 'Equilibrado cada 2–3 semanas.', poda: 'Poda estructural y trabajo de jin/shari.', alambre: 'Buena época para alambrado fuerte.', trasplante: 'No (solo si es urgente).', extra: 'Gira la maceta cada semana para que crezca parejo.' },
    lluvias2: { riego: 'Menos; protege de aguaceros que encharquen.', abono: 'Hasta mediados de noviembre; luego bajo en nitrógeno y alto en potasio.', poda: 'Pinzado de la segunda brotación.', alambre: 'Retira alambres que lleven 4–6 meses.', trasplante: 'Solo de emergencia (septiembre).', extra: 'Revisa hongos (puntas cafés que avanzan) y araña roja.' },
  },
  tropical: {
    seca1: { riego: 'Adentro el aire es seco: bandeja de humedad y revisa la tierra cada 2 días.', abono: 'Cada 3–4 semanas a media dosis.', poda: 'Solo mantenimiento ligero.', alambre: 'Posible, crece lento en frío.', trasplante: 'No en Bogotá (hace frío de noche).', extra: 'Aléjalo de la ventana fría por la noche y de corrientes de aire.' },
    lluvias1: { riego: 'Normal; no encharques.', abono: 'Cada 2 semanas: es su época fuerte.', poda: 'Poda de mantenimiento y estructural.', alambre: 'Buena época.', trasplante: 'MEJOR ÉPOCA, con días templados.', extra: 'Defoliado parcial si está muy sano (solo ficus y schefflera).' },
    seca2: { riego: 'Más seguido.', abono: 'Cada 2 semanas.', poda: 'Poda de mantenimiento.', alambre: 'Revisa marcas cada 2–3 semanas.', trasplante: 'Posible si es urgente.', extra: 'Araña roja y trips aparecen con aire seco: pulveriza.' },
    lluvias2: { riego: 'Normal.', abono: 'Cada 2–3 semanas, más espaciado a fin de año.', poda: 'Mantenimiento.', alambre: 'Posible.', trasplante: 'No.', extra: 'Revisa cochinilla en el envés de las hojas.' },
  },
  caducifolio: {
    seca1: { riego: 'Moderado: con poca hoja bebe menos.', abono: 'No abones si está sin hojas.', poda: 'Poda estructural: con menos hoja se ve la estructura.', alambre: 'MEJOR ÉPOCA (sin hojas o con pocas).', trasplante: 'Al final (febrero), cuando hinchen las yemas.', extra: 'En la sabana muchos se vuelven semicaducos con el frío: es normal.' },
    lluvias1: { riego: 'Normal; la hoja tierna se quema si se seca.', abono: 'Espera a que endurezcan las primeras hojas; luego abono de crecimiento.', poda: 'Pinza el centro de cada brote al abrir el primer par de hojas.', alambre: 'Con cuidado, la madera nueva es tierna.', trasplante: 'Al inicio, si no lo hiciste.', extra: 'Protege los brotes del granizo.' },
    seca2: { riego: 'Más seguido; protege del viento.', abono: 'Equilibrado cada 2 semanas.', poda: 'Defoliado (solo árboles sanos) y poda de mantenimiento.', alambre: 'Revisa marcas.', trasplante: 'No.', extra: 'Sombra en la tarde para evitar hojas quemadas.' },
    lluvias2: { riego: 'Normal.', abono: 'Bajo en nitrógeno, alto en potasio.', poda: 'Mantenimiento de la segunda brotación.', alambre: 'Retira alambres viejos.', trasplante: 'No.', extra: 'Vigila oídio (polvillo blanco) por la humedad.' },
  },
  floracion: {
    seca1: { riego: 'Más seguido con sol fuerte.', abono: 'Si se acerca la floración: alto en fósforo y potasio.', poda: 'Poda después de cada floración, no antes.', alambre: 'Ramas jóvenes, con cuidado.', trasplante: 'Solo después de florecer.', extra: 'Pleno sol para que florezca.' },
    lluvias1: { riego: 'Normal; no encharques.', abono: 'De crecimiento tras la floración.', poda: 'Poda tras florecer y recorta brotes largos.', alambre: 'Buena época.', trasplante: 'MEJOR ÉPOCA si ya floreció.', extra: 'Retira flores marchitas para que no gaste energía.' },
    seca2: { riego: 'Más seguido.', abono: 'Equilibrado; 6–8 semanas antes de florecer cambia a fósforo y potasio.', poda: 'Mantenimiento ligero (no quites botones florales).', alambre: 'Revisa marcas.', trasplante: 'No.', extra: 'Pulgón en brotes tiernos.' },
    lluvias2: { riego: 'Normal.', abono: 'Fósforo y potasio si va a florecer.', poda: 'Solo lo que estorbe.', alambre: 'Posible.', trasplante: 'No.', extra: 'Hongos en flores con lluvia: retíralas.' },
  },
  suculenta: {
    seca1: { riego: 'Solo cuando la tierra esté totalmente seca.', abono: 'Mensual, bajo en nitrógeno.', poda: 'Buena época para podar (cicatriza rápido en seco).', alambre: 'Mejor no alambrar.', trasplante: 'MEJOR ÉPOCA: con calor y seco.', extra: 'Pleno sol.' },
    lluvias1: { riego: 'Casi nada: protégela de la lluvia constante.', abono: 'Mensual.', poda: 'Mantenimiento.', alambre: 'No.', trasplante: 'No con lluvias.', extra: 'Ojo con la pudrición: tallos blandos = exceso de agua.' },
    seca2: { riego: 'Cuando seque del todo.', abono: 'Mensual.', poda: 'Poda estructural.', alambre: 'Tensores si quieres mover ramas.', trasplante: 'Posible.', extra: 'Deja secar los cortes al aire.' },
    lluvias2: { riego: 'Mínimo; bajo techo.', abono: 'Suspende a fin de año.', poda: 'Ligera.', alambre: 'No.', trasplante: 'No.', extra: 'Cochinilla en las axilas de las hojas.' },
  },
};
CAL.perenne = CAL.conifera;

// ---------- Sustrato ----------
const C = { akadama: '#b9875a', pomice: '#e2ddd0', lava: '#8a4b3c', cascarilla: '#3d352d', arena: '#cdb68d', compost: '#5a4430', kanuma: '#e8d49e', perlita: '#f5f5f0', corteza: '#7a5236' };
const SUSTRATO = {
  conifera: { mezcla: [['Akadama', 40, C.akadama], ['Pómice (piedra pómez)', 30, C.pomice], ['Grava volcánica', 30, C.lava]], sin: 'Pómice 50 % + arena de río lavada o gravilla 30 % + cascarilla de arroz quemada 20 %.', ph: 'Ligeramente ácido (6–6,5).' },
  tropical: { mezcla: [['Akadama', 40, C.akadama], ['Pómice', 25, C.pomice], ['Grava volcánica', 15, C.lava], ['Compost o humus', 20, C.compost]], sin: 'Pómice 40 % + cascarilla de arroz quemada 30 % + tierra negra cernida o humus 30 %.', ph: 'Neutro (6,5–7).' },
  caducifolio: { mezcla: [['Akadama', 60, C.akadama], ['Pómice', 20, C.pomice], ['Grava volcánica', 20, C.lava]], sin: 'Pómice 50 % + cascarilla quemada 25 % + arena de río 25 %.', ph: 'Ligeramente ácido (6–6,5).' },
  floracion: { mezcla: [['Akadama', 50, C.akadama], ['Pómice', 25, C.pomice], ['Compost', 25, C.compost]], sin: 'Pómice 40 % + cascarilla quemada 30 % + humus de lombriz 30 %.', ph: 'Neutro (6,5–7).' },
  suculenta: { mezcla: [['Pómice', 50, C.pomice], ['Grava volcánica', 25, C.lava], ['Akadama', 25, C.akadama]], sin: 'Pómice 50 % + arena gruesa de río 30 % + cascarilla quemada 20 %.', ph: 'Neutro.' },
  perenne: { mezcla: [['Akadama', 40, C.akadama], ['Pómice', 30, C.pomice], ['Grava volcánica', 30, C.lava]], sin: 'Pómice 50 % + gravilla 30 % + cascarilla quemada 20 %.', ph: 'Neutro a ligeramente alcalino (olivo).' },
  acido: { mezcla: [['Kanuma', 80, C.kanuma], ['Pómice', 20, C.pomice]], sin: 'Turba rubia 50 % + perlita 30 % + corteza de pino compostada 20 %. Nunca tierra caliza.', ph: 'Ácido (4,5–5,5).' },
};
export const DONDE_SUSTRATO = 'En Colombia: la akadama y el kanuma son importados y se consiguen en tiendas de bonsái (Bogotá, Medellín, Cali) o por internet. La piedra pómez, la cascarilla de arroz quemada, la arena de río y la gravilla se consiguen en viveros y ferreterías. Cierne todo para quitar el polvo: el polvo tapa el drenaje.';

// ---------- Abono ----------
const ABONO = {
  conifera: {
    etapas: [
      ['Brotación (primeras lluvias)', 'Rico en nitrógeno: orgánico sólido (bolitas de abono para bonsái o gallinaza compostada) + líquido equilibrado a media dosis.', 'cada 15 días'],
      ['Crecimiento pleno', 'Equilibrado: 10-10-10 o triple 15 (15-15-15) a 1/4 de la dosis de la etiqueta.', 'cada 15–20 días'],
      ['Antes de la seca / endurecer', 'Bajo en nitrógeno, alto en potasio (p. ej. 4-6-8 o 0-10-10).', 'cada 3 semanas'],
    ],
    cambio: 'Pasa del abono de crecimiento al equilibrado cuando las agujas nuevas se pongan verde oscuro y firmes. Cambia a bajo nitrógeno 4–6 semanas antes de la temporada seca. En árboles ya formados usa menos nitrógeno: agujas más cortas y compactas.',
    no: 'No abones las 4 semanas después de un trasplante, ni con la tierra seca (riega primero), ni si el árbol está débil.',
  },
  tropical: {
    etapas: [
      ['Crecimiento (casi todo el año)', 'Equilibrado: 20-20-20 o triple 15 diluido a 1/4, o abono líquido para bonsái.', 'cada 2 semanas'],
      ['Con frío (Bogotá, adentro)', 'El mismo a 1/4 de dosis.', 'cada 4 semanas'],
      ['De fondo', 'Humus de lombriz o bocashi sobre la superficie.', 'cada 2 meses'],
    ],
    cambio: 'En frío o con poca luz espacia el abono: crece menos y no lo aprovecha. Si las hojas amarillean con nervios verdes, usa uno con micronutrientes (hierro).',
    no: 'No abones recién trasplantado, enfermo o defoliado hasta que rebrote.',
  },
  caducifolio: {
    etapas: [
      ['Brotación', 'Nada hasta que endurezcan las primeras hojas (si no, los entrenudos se alargan).', '—'],
      ['Crecimiento', 'Equilibrado 10-10-10 a media dosis u orgánico sólido.', 'cada 15 días'],
      ['Final del ciclo', 'Bajo en nitrógeno, alto en potasio (0-10-10).', 'cada 3 semanas'],
    ],
    cambio: 'Cambia a bajo nitrógeno cuando quieras que la madera madure y las hojas se queden pequeñas. Los árboles en formación aguantan más nitrógeno que los ya refinados.',
    no: 'No abones sin hojas, recién trasplantado o tras el defoliado hasta que rebrote.',
  },
  floracion: {
    etapas: [
      ['Después de florecer', 'Equilibrado o algo más de nitrógeno para crecer.', 'cada 15 días'],
      ['6–8 semanas antes de florecer', 'Alto en fósforo y potasio: 10-30-10 o 5-10-10 a 1/4 de dosis.', 'cada 15 días'],
      ['En floración', 'Nada (o muy poco): las flores duran más.', '—'],
    ],
    cambio: 'El cambio clave es pasar a fósforo y potasio antes de la floración; si das mucho nitrógeno, echa hojas y no flores.',
    no: 'No abones en plena floración ni recién trasplantado.',
  },
  suculenta: {
    etapas: [
      ['Con calor y crecimiento', 'Abono para cactus (bajo en nitrógeno), a media dosis.', 'mensual'],
      ['Con lluvias o frío', 'Nada.', '—'],
    ],
    cambio: 'Menos es más: el exceso de abono la estira y la ablanda.',
    no: 'Nunca con la tierra mojada ni recién trasplantada.',
  },
};
ABONO.perenne = ABONO.conifera;
ABONO.acido = {
  etapas: [
    ['Después de florecer', 'Abono para plantas acidófilas (azaleas) líquido o en bolitas.', 'cada 15 días'],
    ['Crecimiento', 'Acidófilas a media dosis, con hierro quelatado si amarillea.', 'cada 15–20 días'],
    ['En floración', 'Nada.', '—'],
  ],
  cambio: 'Usa siempre abono para acidófilas y agua sin cal (lluvia o filtrada). Si las hojas amarillean con nervios verdes, añade hierro quelatado.',
  no: 'Nunca abono común ni agua dura; no en floración.',
};

// ---------- Datos por especie ----------
const E = {
  'ficus-retusa': { velocidad: 'Rápido', temp: [10, 18, 30, 35], luz: '4–6 h de luz fuerte', humedad: '50–70 %', propagacion: 'Esquejes de 10 cm en cualquier época cálida (enraízan en 3–4 semanas en agua o sustrato húmedo); acodo aéreo.', variedades: ['Ficus "Ginseng" (raíces engrosadas)', 'Tigerbark (corteza rayada)', 'Green Island (hoja redonda, muy compacta)'], errores: ['Moverlo de sitio a cada rato: bota hojas.', 'Regarlo por calendario sin tocar la tierra.', 'Dejarlo en un rincón oscuro.'], toxicidad: 'La savia (látex) es tóxica para perros y gatos e irrita la piel.' },
  'ficus-benjamina': { velocidad: 'Rápido', temp: [12, 18, 30, 35], luz: '4–6 h de luz brillante', humedad: '50–70 %', propagacion: 'Esquejes semileñosos o acodo aéreo.', variedades: ['"Natasja" (hoja pequeña)', '"Starlight" (variegado)', '"Kinky"'], errores: ['Cambiarlo de lugar.', 'Corrientes de aire frío.'], toxicidad: 'Tóxico para perros y gatos (látex); puede causar alergias en personas sensibles.' },
  carmona: { velocidad: 'Medio', temp: [12, 18, 28, 32], luz: 'Luz fuerte, sol de mañana', humedad: '60–80 %', propagacion: 'Esquejes semileñosos en calor.', variedades: ['Hoja pequeña (microphylla)', 'Hoja grande'], errores: ['Dejar secar la tierra.', 'Aire seco sin bandeja de humedad.'], toxicidad: 'No se reportan intoxicaciones graves.' },
  portulacaria: { velocidad: 'Rápido', temp: [5, 18, 30, 38], luz: 'Pleno sol, 6 h o más', humedad: 'Baja (30–50 %)', propagacion: 'Esquejes muy fáciles: deja secar el corte 2–3 días y plántalo en sustrato seco.', variedades: ['Verde', 'Variegada (más lenta)', '"Prostrata" (rastrera)'], errores: ['Regar como si fuera un árbol normal.', 'Alambrar tallos blandos.'], toxicidad: 'Se considera no tóxica para mascotas.' },
  serissa: { velocidad: 'Medio', temp: [10, 16, 26, 30], luz: 'Luz fuerte sin sol de mediodía', humedad: '60–80 %', propagacion: 'Esquejes en cualquier época templada.', variedades: ['"Variegata" (borde blanco)', 'Flor doble', '"Pink Mountain" (flor rosada)'], errores: ['Cambios de lugar y de temperatura.', 'Encharcar.'], toxicidad: 'No se reportan intoxicaciones graves.' },
  schefflera: { velocidad: 'Rápido', temp: [10, 18, 28, 32], luz: 'Media a alta; tolera sombra', humedad: '50–60 %', propagacion: 'Esquejes y acodo; brota de madera vieja.', variedades: ['Verde', '"Gold Capella" (variegada)'], errores: ['Hojas enormes por exceso de abono y poca luz.'], toxicidad: 'Tóxica para perros y gatos (oxalatos): irrita boca y estómago.' },
  murraya: { velocidad: 'Medio', temp: [10, 18, 30, 35], luz: 'Luz fuerte, sol de mañana', humedad: '50–70 %', propagacion: 'Semillas (de sus bayas rojas) y esquejes.', variedades: ['Murraya paniculata', 'Murraya koenigii (curry, otra especie)'], errores: ['Hojas amarillas por falta de hierro o de luz.'], toxicidad: 'No se reportan intoxicaciones graves.', flor: 'Florece varias veces al año tras las lluvias, con aroma a azahar.' },
  buganvilla: { velocidad: 'Rápido', temp: [5, 20, 32, 38], luz: 'Pleno sol (sin sol no florece)', humedad: 'Baja a media', propagacion: 'Esquejes leñosos en época cálida; acodo.', variedades: ['Glabra (hoja pequeña, ideal)', 'Spectabilis', 'Enanas "Pink Pixie"'], errores: ['Mucho nitrógeno: solo hojas.', 'Desarmar el cepellón al trasplantar (raíces frágiles).'], toxicidad: 'Levemente tóxica: savia irritante y espinas.', flor: 'Florece en madera nueva tras un periodo seco; en tierra templada casi todo el año.' },
  'olmo-chino': { velocidad: 'Rápido', temp: [-5, 15, 28, 35], luz: 'Sol o semisombra', humedad: 'Media', propagacion: 'Esquejes en brotación, semillas y acodo.', variedades: ['"Seiju" (corteza corchosa)', '"Hokkaido" (hoja diminuta)', '"Catlin"'], errores: ['Dejarlo adentro todo el año: es de exterior.'], toxicidad: 'Se considera no tóxico.' },
  'arce-japones': { velocidad: 'Medio', temp: [-10, 12, 25, 30], luz: 'Sol de mañana, sombra en la tarde', humedad: 'Media', propagacion: 'Injerto (variedades), acodo aéreo y semillas.', variedades: ['"Deshojo" (rojo en brotación)', '"Kiyohime" (enano, escoba)', '"Arakawa" (corteza corchosa)', '"Seigen"'], errores: ['Sol fuerte de la tarde: hojas quemadas.', 'Abonar en plena brotación: entrenudos largos.'], toxicidad: 'Se considera no tóxico para perros y gatos.', flor: 'Flores pequeñas rojizas en brotación.' },
  'arce-tridente': { velocidad: 'Rápido', temp: [-10, 14, 28, 35], luz: 'Sol pleno', humedad: 'Media', propagacion: 'Esquejes, acodo, semillas; raíz sobre roca.', variedades: ['Tridente común', '"Mino Yatsubusa" (enano)'], errores: ['No controlar el vigor del ápice.'], toxicidad: 'Se considera no tóxico.' },
  'junipero-procumbens': { velocidad: 'Lento a medio', temp: [-15, 12, 26, 32], luz: 'Pleno sol: mínimo 5 h directas', humedad: 'Media (pulverizar en seco)', propagacion: 'Esquejes de 8–10 cm con "talón" en las primeras lluvias; enraízan en 2–3 meses con hormona de enraizamiento.', variedades: ['"Nana" (la más usada en bonsái, compacta)', '"Bonin Isles"', '"Variegata"'], errores: ['Tenerlo adentro: en 2–6 meses se seca desde adentro.', 'Cortar el follaje con tijera por la mitad (se pone café).', 'Dejar ramas sin verde en la punta: se secan.', 'Regar todos los días aunque la tierra esté húmeda.'], toxicidad: 'Baja: si una mascota lo mastica puede vomitar; la savia y las agujas irritan la piel sensible.' },
  'junipero-chinensis': { velocidad: 'Medio', temp: [-20, 12, 26, 32], luz: 'Pleno sol', humedad: 'Media', propagacion: 'Esquejes con talón y acodo.', variedades: ['Shimpaku "Itoigawa"', '"Kishu"', '"San José"'], errores: ['Cortar las escamas con tijera.', 'Pinzar todo el árbol a la vez.'], toxicidad: 'Baja: puede causar vómito si se ingiere.' },
  'pino-negro': { velocidad: 'Medio a rápido', temp: [-15, 15, 30, 35], luz: 'Pleno sol todo el día', humedad: 'Baja a media', propagacion: 'Semillas (estratificar 1–2 meses en nevera).', variedades: ['"Kotobuki" (enano)', '"Mikawa"', '"Kyokko" (variegado)'], errores: ['Sombra: agujas largas y débiles.', 'Desarmar el cepellón (pierde micorrizas).'], toxicidad: 'Baja; las agujas pueden irritar a las mascotas.' },
  'pino-patula': { velocidad: 'Rápido', temp: [-3, 14, 26, 32], luz: 'Pleno sol', humedad: 'Media', propagacion: 'Semillas (germinan fácil); plántulas de vivero.', variedades: ['Pátula (agujas colgantes)'], errores: ['Agujas enormes por exceso de agua y abono.'], toxicidad: 'Baja.' },
  azalea: { velocidad: 'Medio', temp: [-5, 15, 25, 30], luz: 'Sol de mañana, sombra en la tarde', humedad: '60–80 %', propagacion: 'Esquejes de brotes tiernos tras florecer.', variedades: ['Satsuki "Kinsai"', '"Kaho"', '"Hakurei"'], errores: ['Agua de la llave dura y abono común.', 'Podar tarde: pierde la floración siguiente.'], toxicidad: 'MUY TÓXICA para perros, gatos y personas (grayanotoxinas): mantenla fuera de su alcance.', flor: 'Florece una vez al año (en Colombia la época varía); poda justo después.', sustrato: 'acido', abono: 'acido' },
  olivo: { velocidad: 'Medio', temp: [-5, 16, 32, 40], luz: 'Pleno sol', humedad: 'Baja', propagacion: 'Esquejes semileñosos y acodo.', variedades: ['Acebuche (hoja pequeña)', '"Arbequina"'], errores: ['Poca luz: bota hojas.', 'Exceso de agua.'], toxicidad: 'No tóxico.' },
  jade: { velocidad: 'Medio', temp: [5, 18, 30, 38], luz: 'Pleno sol', humedad: 'Baja', propagacion: 'Una hoja o un esqueje secado 2–3 días enraíza solo.', variedades: ['"Hobbit"', '"Gollum"', '"Minima"'], errores: ['Regar seguido.', 'Alambrar.'], toxicidad: 'Tóxica para perros y gatos (vómito, decaimiento).' },
  granado: { velocidad: 'Medio', temp: [-5, 18, 32, 38], luz: 'Pleno sol', humedad: 'Media', propagacion: 'Esquejes leñosos, semillas y acodo.', variedades: ['"Nana" (enano, ideal)', 'Flor doble'], errores: ['Riego irregular: caen las flores.'], toxicidad: 'Fruto comestible; corteza y raíz no se deben ingerir.', flor: 'Flores rojo naranja en la época cálida; necesita sol y algo de frío para florecer bien.' },
  pyracantha: { velocidad: 'Rápido', temp: [-10, 15, 28, 35], luz: 'Pleno sol', humedad: 'Media', propagacion: 'Esquejes semileñosos y semillas.', variedades: ['Coccinea (naranja)', '"Mohave" (roja)', '"Soleil d’Or" (amarilla)'], errores: ['Podar los ramilletes florales.'], toxicidad: 'Bayas levemente tóxicas crudas; espinas.', flor: 'Florece en madera del año anterior; luego da bayas que duran meses.' },
  cotoneaster: { velocidad: 'Medio', temp: [-15, 14, 26, 32], luz: 'Sol pleno', humedad: 'Media', propagacion: 'Esquejes y acodo.', variedades: ['Horizontalis', 'Microphyllus', 'Dammeri'], errores: ['Sombra: pocas bayas.'], toxicidad: 'Bayas levemente tóxicas para mascotas.' },
  ginkgo: { velocidad: 'Lento', temp: [-20, 14, 28, 35], luz: 'Sol o semisombra', humedad: 'Media', propagacion: 'Semillas y esquejes en brotación.', variedades: ['"Chi-Chi" (enano)', '"Mariken"'], errores: ['Alambrar (ramas que se quiebran).', 'Podar fuera de reposo.'], toxicidad: 'Las semillas crudas son tóxicas; las hojas no se deben comer.' },
  podocarpus: { velocidad: 'Lento', temp: [-5, 16, 28, 32], luz: 'Semisombra a sol suave', humedad: '50–70 %', propagacion: 'Esquejes semileñosos (lentos) y semillas.', variedades: ['Macrophyllus "Maki"', 'Romerón andino (oleifolius)'], errores: ['Sol fuerte de mediodía sin acostumbrarlo.'], toxicidad: 'TÓXICO para perros y gatos (vómito, diarrea).' },
  sageretia: { velocidad: 'Medio', temp: [8, 18, 28, 32], luz: 'Luz fuerte', humedad: '60–80 %', propagacion: 'Esquejes en calor.', variedades: ['Theezans / thea'], errores: ['Dejar secar las raíces finas.'], toxicidad: 'No se reportan intoxicaciones.' },
  zelkova: { velocidad: 'Rápido', temp: [-15, 15, 28, 35], luz: 'Sol o semisombra', humedad: 'Media', propagacion: 'Semillas, esquejes y acodo.', variedades: ['Serrata "Goblin" (enano)', 'Nire'], errores: ['No seleccionar ramas en escoba temprano.'], toxicidad: 'No tóxico.' },
  guayacan: { velocidad: 'Medio', temp: [10, 20, 32, 38], luz: 'Pleno sol', humedad: 'Media', propagacion: 'Semillas aladas (germinan en 1–3 semanas).', variedades: ['Ocobo (rosado)', 'Guayacán amarillo (chrysanthus)', 'Guayacán de Manizales (Lafoensia, otra especie)'], errores: ['Esperar flores pronto: en bonsái florece tras años.'], toxicidad: 'No tóxico conocido.', flor: 'Florece sin hojas en la época seca, todo el árbol a la vez.' },
};

const PLAGAS = {
  cochinilla: ['Cochinilla', 'Bolitas blancas algodonosas o escamas cafés en tallos y envés', 'Copito con alcohol y jabón potásico o aceite de neem cada 5 días, 3 veces.'],
  arana: ['Araña roja', 'Puntitos amarillos, telarañas finas, follaje opaco', 'Pulveriza agua a diario y aplica jabón potásico o neem; sube la humedad.'],
  pulgon: ['Pulgón', 'Insectos verdes o negros en brotes tiernos que se enroscan', 'Chorro de agua y jabón potásico.'],
  trips: ['Trips', 'Hojas plateadas con puntitos negros', 'Neem o jabón potásico; trampas azules adhesivas.'],
  'mosca blanca': ['Mosca blanca', 'Moscas diminutas que vuelan al mover la planta', 'Trampas amarillas y jabón potásico.'],
  escama: ['Escama', 'Caparazones cafés pegados a los tallos', 'Retíralas con un palillo y alcohol; luego neem.'],
  hongo: ['Hongos', 'Manchas, polvillo blanco o puntas que se secan avanzando', 'Más aire y sol, menos agua; fungicida de cobre o azufre.'],
  repilo: ['Repilo', 'Manchas circulares en hojas de olivo', 'Fungicida de cobre en épocas húmedas.'],
  fuego: ['Fuego bacteriano', 'Brotes que se ennegrecen como quemados', 'Corta 20 cm por debajo con tijera desinfectada.'],
};
function plagasDe(e) {
  const t = (e.plagas || '').toLowerCase();
  const l = Object.entries(PLAGAS).filter(([k]) => t.includes(k) || (k === 'arana' && t.includes('araña')) || (k === 'fuego' && t.includes('fuego'))).map(([, v]) => v);
  l.push(PLAGAS.hongo);
  return l;
}

export function guiaDe(id) {
  const e = POR_ID[id];
  if (!e) return null;
  const x = E[id] || {};
  const grupo = e.grupo;
  const cal = CAL[grupo] || CAL.conifera;
  return {
    especie: e,
    velocidad: x.velocidad,
    temperatura: x.temp ? { minima: x.temp[0], idealMin: x.temp[1], idealMax: x.temp[2], maxima: x.temp[3] } : null,
    luz: x.luz,
    humedad: x.humedad,
    calendario: EPOCAS.map((ep) => ({ ...ep, tareas: cal[ep.id] })),
    flor: x.flor,
    abono: ABONO[x.abono || grupo] || ABONO.tropical,
    sustrato: SUSTRATO[x.sustrato || grupo] || SUSTRATO.tropical,
    propagacion: x.propagacion,
    variedades: x.variedades || [],
    plagas: plagasDe(e),
    errores: x.errores || [],
    toxicidad: x.toxicidad,
  };
}
