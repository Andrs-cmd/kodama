// Estilos clásicos y técnicas. Cada estilo trae una silueta de referencia
// (coordenadas 0-1 sobre la foto) para la guía manual cuando no hay análisis con IA,
// y un trazo del tronco (0-100) para el dibujo del estilo.

export const ESTILOS = {
  chokkan: { nombre: 'Chokkan', es: 'Vertical formal', desc: 'Tronco recto que se afina de la base al ápice. Ramas alternas, la primera es la más larga y gruesa, a 1/3 de la altura.', tronco: 'M50 90 L50 12', silueta: [[0.5, 0.08], [0.18, 0.78], [0.82, 0.78]] },
  moyogi: { nombre: 'Moyogi', es: 'Vertical informal', desc: 'Tronco con curvas suaves que se cierran hacia el ápice, que queda sobre la base. Ramas en el exterior de cada curva.', tronco: 'M50 90 C40 72 62 58 48 40 S52 20 48 12', silueta: [[0.46, 0.08], [0.15, 0.78], [0.85, 0.74]] },
  shakan: { nombre: 'Shakan', es: 'Inclinado', desc: 'Tronco inclinado 60-80° respecto al suelo; raíces fuertes del lado contrario a la inclinación.', tronco: 'M38 90 Q46 52 72 16', silueta: [[0.7, 0.12], [0.18, 0.62], [0.9, 0.7]] },
  kengai: { nombre: 'Kengai', es: 'Cascada', desc: 'El tronco cae por debajo de la base de la maceta, como un árbol en un acantilado. Maceta alta.', tronco: 'M40 90 Q38 68 50 60 Q70 54 80 74 Q86 86 90 98', silueta: [[0.5, 0.5], [0.76, 0.99], [0.98, 0.68]] },
  'han-kengai': { nombre: 'Han-kengai', es: 'Semicascada', desc: 'El tronco cae por debajo del borde de la maceta pero no por debajo de su base.', tronco: 'M42 90 Q42 70 54 64 Q74 60 90 72', silueta: [[0.5, 0.54], [0.8, 0.84], [0.98, 0.6]] },
  bunjingi: { nombre: 'Bunjingi', es: 'Literati', desc: 'Tronco largo, delgado y expresivo, con poco follaje concentrado arriba. Mucha madera muerta.', tronco: 'M48 90 C38 62 70 46 58 10', silueta: [[0.6, 0.06], [0.42, 0.42], [0.82, 0.32]] },
  hokidachi: { nombre: 'Hokidachi', es: 'Escoba', desc: 'Tronco recto y corto; las ramas salen radiales a la misma altura y forman una copa redonda.', tronco: 'M50 90 L50 50 M50 50 L30 30 M50 50 L70 30 M50 50 L50 22', silueta: [[0.5, 0.08], [0.1, 0.55], [0.9, 0.55]] },
  fukinagashi: { nombre: 'Fukinagashi', es: 'Barrido por el viento', desc: 'Todas las ramas se van hacia un mismo lado, como azotadas por el viento.', tronco: 'M40 90 Q44 60 60 46 Q74 34 92 30', silueta: [[0.85, 0.2], [0.2, 0.5], [0.95, 0.5]] },
  sokan: { nombre: 'Sokan', es: 'Tronco doble', desc: 'Dos troncos de la misma raíz; el principal más alto y grueso.', tronco: 'M46 90 C42 62 54 40 49 12 M50 88 Q62 70 66 42', silueta: [[0.48, 0.08], [0.12, 0.78], [0.88, 0.78]] },
  kabudachi: { nombre: 'Kabudachi', es: 'Multitronco', desc: 'Tres o más troncos (en número impar) de una misma base.', tronco: 'M50 90 L49 12 M48 90 Q36 72 30 40 M52 90 Q64 72 70 44', silueta: [[0.5, 0.08], [0.08, 0.75], [0.92, 0.75]] },
  'yose-ue': { nombre: 'Yose-ue', es: 'Bosque', desc: 'Varios árboles (impares) de la misma especie, con alturas distintas para dar profundidad.', tronco: 'M28 90 L28 34 M44 90 L44 14 M58 90 L58 30 M74 90 L74 48', silueta: [[0.42, 0.06], [0.04, 0.8], [0.96, 0.8]] },
  neagari: { nombre: 'Neagari', es: 'Raíces expuestas', desc: 'Las raíces se elevan sobre la superficie como si la tierra se hubiera lavado.', tronco: 'M50 70 L50 14 M50 70 L38 90 M50 70 L62 90 M50 72 L47 90 M50 72 L54 90', silueta: [[0.5, 0.08], [0.15, 0.6], [0.85, 0.6]] },
  sekijoju: { nombre: 'Sekijoju', es: 'Raíz sobre roca', desc: 'Las raíces abrazan una roca y bajan hasta el sustrato.', tronco: 'M50 64 L50 14 M50 64 Q38 72 36 90 M50 64 Q62 72 64 90', silueta: [[0.5, 0.08], [0.15, 0.6], [0.85, 0.6]] },
  shidare: { nombre: 'Shidare-zukuri', es: 'Llorón', desc: 'Ramas que caen como un sauce.', tronco: 'M50 90 L50 22 M50 32 Q30 30 22 64 M50 32 Q70 30 78 64 M50 44 Q38 46 34 70', silueta: [[0.5, 0.1], [0.12, 0.8], [0.88, 0.8]] },
  tachiki: { nombre: 'Tachiki', es: 'Natural / libre', desc: 'Forma de árbol maduro sin reglas estrictas.', tronco: 'M50 90 C46 64 56 40 50 14', silueta: [[0.5, 0.08], [0.15, 0.7], [0.85, 0.7]] },
};

// Tipos de marca que puede devolver el análisis de la foto.
export const TIPOS_CORTE = {
  estructural: { nombre: 'Poda estructural', color: 'var(--corte)', desc: 'Quita ramas o partes del tronco para definir la forma.' },
  mantenimiento: { nombre: 'Poda de mantenimiento', color: 'var(--mantener)', desc: 'Recorta brotes para conservar la silueta y ramificar.' },
  pinzado: { nombre: 'Pinzado', color: 'var(--pinzar)', desc: 'Quita la yema terminal con los dedos o tijera fina.' },
  jin: { nombre: 'Jin / shari', color: 'var(--jin)', desc: 'Convertir en madera muerta en vez de cortar al ras.' },
};

export const TECNICAS = [
  {
    id: 'estructural',
    titulo: 'Poda estructural',
    resumen: 'Define el diseño: qué ramas se quedan y cuáles se van.',
    pasos: [
      'Mira el árbol de frente y elige el frente: donde se ve mejor el nebari (raíces) y el tronco tiene movimiento sin que una rama te apunte a la cara.',
      'Busca el ápice: debe quedar más o menos sobre la base.',
      'Elimina primero las ramas problemáticas: cruzadas, que salen hacia el frente en el tercio bajo, paralelas una sobre otra, varias del mismo punto (deja 2) y las que salen del interior de una curva.',
      'Elige la primera rama (la más baja y gruesa, a 1/3 de la altura), luego la segunda hacia el lado contrario y una trasera para dar profundidad.',
      'Corta con cóncava pegado al tronco en ramas gruesas; así la herida cierra plana. Sella con pasta cicatrizante.',
      'Nunca quites más de 1/3 del follaje en una sesión; espera a que el árbol se recupere.',
    ],
    herramientas: 'Tijera de bonsái, alicate cóncavo, pasta cicatrizante.',
  },
  {
    id: 'mantenimiento',
    titulo: 'Poda de mantenimiento',
    resumen: 'Conserva la silueta y hace que ramifique fino.',
    pasos: [
      'Deja que cada brote crezca (por lo general 4-8 hojas según la especie).',
      'Córtalo dejando 1-3 hojas, por encima de una yema que apunte hacia afuera o hacia donde quieres que siga la rama.',
      'Equilibra fuerzas: el ápice y las puntas son más vigorosas, pódalas más; deja crecer más las ramas bajas y débiles.',
      'Quita brotes que salen hacia abajo o del tronco donde no los quieres.',
    ],
    herramientas: 'Tijera de bonsái fina.',
  },
  {
    id: 'pinzado',
    titulo: 'Pinzado',
    resumen: 'Detiene el alargamiento del brote y obliga a brotar yemas internas.',
    pasos: [
      'Cuando el brote nuevo esté tierno, retira con los dedos o pinza la yema central.',
      'En coníferas de escamas (junípero) tira de la punta en vez de cortarla con tijera.',
      'Hazlo de forma escalonada: primero las zonas fuertes, días después las débiles.',
    ],
    herramientas: 'Dedos o pinzas.',
  },
  {
    id: 'alambrado',
    titulo: 'Alambrado',
    resumen: 'Doblar ramas y tronco para darles posición y movimiento.',
    pasos: [
      'Elige el calibre: el alambre debe ser 1/3 del grosor de la rama (aluminio) o un poco menos si es cobre.',
      'Ancla el alambre: o en el tronco, o alambrando dos ramas de altura parecida con el mismo trozo.',
      'Enrolla a 45°, ni muy apretado ni flojo, sin cruzar alambres.',
      'En cada curva, el alambre debe quedar apoyado en la parte exterior (la que se estira al doblar): es lo que sostiene la rama y evita que se raje.',
      'Dobla poco a poco, con los pulgares en la parte exterior de la curva para no rajarla. Escucha: un crujido indica que llegaste al límite.',
      'Revisa cada 2-3 semanas y retira el alambre cortándolo en trocitos (no desenrollándolo) cuando empiece a marcar la corteza.',
    ],
    herramientas: 'Alambre de aluminio anodizado (1-6 mm) o cobre recocido, cortaalambres, rafia para curvas fuertes.',
  },
  {
    id: 'defoliado',
    titulo: 'Defoliado',
    resumen: 'Quitar las hojas para que salgan más pequeñas y ramifique.',
    pasos: [
      'Solo en árboles sanos y caducifolios o ficus, en pleno crecimiento.',
      'Corta cada hoja dejando el pecíolo (el tallito).',
      'Durante unas semanas riega menos (no hay hojas que evaporen) y no abones hasta que rebrote.',
      'No lo hagas el mismo año del trasplante.',
    ],
    herramientas: 'Tijera fina.',
  },
  {
    id: 'jin',
    titulo: 'Jin y shari',
    resumen: 'Madera muerta que cuenta la historia del árbol (sobre todo en coníferas).',
    pasos: [
      'Jin: en vez de cortar una rama sobrante, deja un tocón y retírale la corteza.',
      'Shari: franja de tronco sin corteza; nunca más de 1/3 de la circunferencia y siempre conectada a las venas vivas que alimentan ramas.',
      'Deja secar unas semanas y aplica líquido de cal-azufre para blanquear y proteger.',
    ],
    herramientas: 'Alicate de jin, gubias, líquido jin (cal-azufre).',
  },
  {
    id: 'trasplante',
    titulo: 'Trasplante',
    resumen: 'Renovar el sustrato y podar raíces.',
    pasos: [
      'Hazlo cuando las raíces llenen la maceta y el agua tarde en drenar, en la época de la especie.',
      'Saca el árbol, peina las raíces desde el centro hacia afuera y corta las gruesas y las que dan vueltas.',
      'No quites más de 1/3 de las raíces.',
      'Fija el árbol a la maceta con alambre, rellena con sustrato nuevo y trabájalo con un palillo para eliminar bolsas de aire.',
      'Riega hasta que el agua salga limpia y deja el árbol en semisombra, sin abono, por 3-4 semanas.',
    ],
    herramientas: 'Rastrillo de raíces, palillo, malla, alambre, sustrato.',
  },
];
