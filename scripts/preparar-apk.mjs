// Antes de compilar la APK: deja la IP de este PC como servidor por defecto
// (www/js/config.js). En el celular se puede cambiar en Jardín → Ajustes.
import os from 'node:os';
import { writeFileSync } from 'node:fs';

const privada = (ip) => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
const candidatas = Object.entries(os.networkInterfaces())
  .flatMap(([nombre, lista]) => (lista || []).filter((i) => i.family === 'IPv4' && !i.internal && privada(i.address)).map((i) => ({ nombre, ip: i.address })))
  // El Wi-Fi primero: es la red que comparte el celular.
  .sort((a, b) => Number(/wi-?fi|wlan/i.test(b.nombre)) - Number(/wi-?fi|wlan/i.test(a.nombre)));

const puerto = process.env.PORT || 8830;
const servidor = candidatas[0] ? `http://${candidatas[0].ip}:${puerto}` : '';
writeFileSync(
  new URL('../www/js/config.js', import.meta.url),
  `// Generado por scripts/preparar-apk.mjs al compilar la APK. No editar a mano.\nexport const SERVIDOR_POR_DEFECTO = ${JSON.stringify(servidor)};\n`,
);
console.log(servidor ? `Servidor por defecto de la APK: ${servidor} (${candidatas[0].nombre})` : 'No encontré una IP de red local: configura el servidor en Ajustes de la app.');
