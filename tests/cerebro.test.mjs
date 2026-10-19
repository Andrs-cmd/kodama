import { test } from 'node:test';
import assert from 'node:assert/strict';
import { responder, entenderCuando } from '../www/js/cerebro.js';
import { POR_ID } from '../www/js/especies.js';

// Lunes 19 de octubre de 2026, 10:00
const AHORA = new Date(2026, 9, 19, 10, 0);
const ctx = { bonsai: { nombre: 'Mi junípero' }, especie: POR_ID['junipero-procumbens'], riego: { dias: 2, cada: 4 }, kodama: { nombre: 'Kodi', xp: 30 }, nivel: { nivel: 1 }, tareas: [{ titulo: 'Gira la maceta' }] };

test('fechas', () => {
  const f = (t) => entenderCuando(t, AHORA);
  assert.deepEqual([f('mañana a las 7 de la mañana').fecha.getDate(), f('mañana a las 7 de la mañana').fecha.getHours()], [20, 7]);
  assert.equal(f('mañana').fecha.getHours(), 8);
  assert.equal(f('a las 3').fecha.getHours(), 15);
  assert.equal(f('en 2 horas').fecha.getHours(), 12);
  assert.equal(f('el sábado en la tarde').fecha.getDate(), 24);
  assert.equal(f('el sábado en la tarde').fecha.getHours(), 15);
  assert.equal(f('todos los días a las 8 am').repetir, 'dia');
  assert.equal(f('a las 9 de la mañana').fecha.getDate(), 20); // ya pasó hoy → mañana
  assert.equal(f('lo que sea'), null);
});

test('intenciones', () => {
  const r = (t) => responder(t, ctx);
  assert.equal(r('recuérdame abonar el sábado a las 9').acciones[0].tipo, 'alerta');
  assert.match(r('recuérdame abonar el sábado a las 9').acciones[0].titulo, /Abonar Mi junípero/);
  assert.equal(r('avísame regar').pendiente.tipo, 'alerta');
  assert.equal(r('ya lo regué').acciones[0].evento, 'riego');
  assert.equal(r('abre la cámara').acciones[0].vista, 'foto');
  assert.equal(r('enséñame a alambrar').acciones[0].flujo, 'alambrar');
  assert.match(r('cuándo lo riego').texto, /2 días/);
  assert.match(r('tiene las puntas cafés').texto, /coníferas/);
  assert.match(r('qué significa kodama').texto, /espíritu del árbol/);
  assert.match(r('cuánta luz necesita').texto, /Luz/);
  assert.match(r('abono para el ficus').texto, /Abono/);
  assert.match(r('qué es moyogi').texto, /Vertical informal/);
  assert.equal(r('xyzzy plumbus'), null);
});
