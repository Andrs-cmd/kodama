# Kodama · bonsái

Plataforma interactiva para cuidar tu bonsái con un **kodama**: el espíritu del árbol, tu compañero tipo tamagochi.

> **Kodama (木霊)** significa "espíritu del árbol". En el folclor japonés son seres que viven dentro de los árboles: cuidarlos trae buena fortuna y talar un árbol con kodama, mala suerte. También se dice que el eco en las montañas es su voz. Se hicieron famosos con *La princesa Mononoke*, como espíritus blancos que hacen sonar su cabeza.

## Qué hace

- **Bienvenida guiada**: en pocos toques eliges tu árbol (con ayuda visual para distinguir juníperos de agujas o de escamas), dónde vive, cuándo lo regaste y le pones nombre a tu kodama.
- **Hoy**: escenario animado (el cielo cambia con la hora, nubes, sol o luna y luciérnagas de noche), tu árbol se mece y "respira" y se pone gris si tiene sed. El kodama flota, parpadea, te habla y traquetea la cabeza si lo tocas.
- **Barras tipo tamagochi**: agua, cariño y nivel. El kodama gana experiencia cuando cuidas el árbol de verdad y desbloquea colores, cabezas, ojos y accesorios.
- **Guías interactivas**: regar (revisa la tierra con el dedo y mantén presionado para regar), pinzar o podar (toca los brotes que se salen de la nube), alambrar (línea de tiempo para ver el alambre enrollarse y la rama doblarse) y abonar.
- **Tareas del día y alertas**: riego, abono, pinzado, revisar el alambre, girar la maceta. Alertas propias y recordatorio automático de riego (en la APK llegan como notificación aunque la app esté cerrada).
- **Chat con tu kodama (IA local)**: entiende frases en español sin internet: "¿cuándo lo riego?", "tiene las puntas cafés", "recuérdame abonar el sábado a las 9", "ya lo regué", "abre la cámara", "enséñame a alambrar". Si Iris está abierta en el PC, le pasa lo que no sepa.
- **Foto**: con `ANTHROPIC_API_KEY` identifica la especie y marca sobre la foto los cortes, el alambrado y la silueta objetivo. Sin clave, guía manual con la silueta del estilo que ajustas arrastrando.
- **Enciclopedia**: 26 especies con fotos reales de Wikimedia Commons (bonsáis, hojas y árbol en la naturaleza, con visor a pantalla completa y créditos), ficha botánica (familia, origen, hojas, flores, fruto, corteza, curiosidad), cuidados, lecciones y videos; 7 técnicas con animación paso a paso (poda estructural interactiva, defoliado, jin y shari, trasplante, pinzado, alambrado); 15 estilos con ejemplos reales.
- **Minijuego** "Lluvia para el bosque".

Las fotos se actualizan con `node scripts/enciclopedia.mjs` (guarda solo enlaces y créditos en `www/datos/fotos.json`; las que no sirven se excluyen en `scripts/fotos-excluir.json`). Se cargan desde Wikimedia, así que necesitan internet.

## Arrancar

```
npm install
npm start
```

Abre http://localhost:8830 (o `iniciar-servidor.cmd`). Para el análisis de fotos, copia `.env.example` como `.env` y pon tu `ANTHROPIC_API_KEY`.

## APK

```
npm run apk
```

Deja `Kodama.apk` en la raíz. La IP de este PC queda como servidor por defecto (se cambia en Jardín → Ajustes). En el celular funciona todo sin el PC (cuidados, alertas, chat local, juego); el análisis de fotos con IA y las preguntas a Iris necesitan el servidor encendido en la misma red Wi-Fi.

## Estructura

- `server/index.mjs` — servidor: sirve `www/`, `/api/analizar` (Claude) y `/api/iris/chat` (puente a Iris).
- `www/js/app.js` — vistas Hoy, Foto, Aprender, Jardín y Kodama.
- `www/js/arbol.js`, `kodama.js` — ilustraciones animadas del bonsái y del kodama.
- `www/js/flujos.js` — guías interactivas. `bienvenida.js` — primera configuración.
- `www/js/cerebro.js` — IA local del chat. `asistente.js` — chat e Iris.
- `www/js/almacen.js`, `tareas.js`, `alertas.js`, `riego.js` — datos, tareas, notificaciones y riego.
- `www/js/especies.js`, `guia.js` — catálogo de especies, técnicas y estilos.
- `tests/` — pruebas del cerebro local (`npm test`).
