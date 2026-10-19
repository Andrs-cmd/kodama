// Qué toca hacer hoy con cada bonsái, en lenguaje sencillo.
import { especieDe, estadoRiego, ultimo, diasEntre, hechoHoy } from './almacen.js';

const CADA_ABONO = { suculenta: 30, conifera: 28 };

export function tareasDe(b) {
  if (!b) return [];
  const e = especieDe(b);
  const t = [];
  const r = estadoRiego(b);

  if (hechoHoy(b, 'riego')) t.push({ id: 'riego', titulo: 'Regado hoy', detalle: 'Bien hecho. Mañana no hace falta revisar.', flujo: 'regar', hecha: true, icono: 'gota' });
  else if (r.sinDatos) t.push({ id: 'riego', titulo: 'Revisa la tierra', detalle: 'Cuéntame si lo regaste y desde ahí te aviso.', flujo: 'regar', urgente: true, icono: 'gota' });
  else if (r.dias <= 0) t.push({ id: 'riego', titulo: r.dias < 0 ? 'Revisa la tierra: el riego está atrasado' : 'Revisa la tierra y riega', detalle: 'Si está seca, riega hasta que el agua salga por abajo.', flujo: 'regar', urgente: true, icono: 'gota' });

  if (e?.ubicacion === 'exterior' && b.condiciones.ubicacion === 'interior') {
    t.push({ id: 'sol', titulo: `Sácalo al sol`, detalle: `${e.nombre.split(' (')[0]} es de exterior: adentro se debilita en pocos meses.`, accion: 'sacar', urgente: true, icono: 'sol' });
  }

  const pinza = e && !/^no/i.test(e.pinzado || '');
  if (pinza) {
    const u = ultimo(b, 'pinzado');
    if (hechoHoy(b, 'pinzado')) t.push({ id: 'pinzado', titulo: e.grupo === 'conifera' ? 'Pinzado hecho' : 'Poda hecha', flujo: 'pinzar', hecha: true, icono: 'tijera' });
    else if (!u || diasEntre(u) >= 14) t.push({ id: 'pinzado', titulo: e.grupo === 'conifera' ? 'Busca brotes largos para pinzar' : 'Recorta los brotes largos', detalle: 'Solo los que se salen de la silueta.', flujo: 'pinzar', icono: 'tijera' });
  }

  const cadaAbono = CADA_ABONO[e?.grupo] || 21;
  const ua = ultimo(b, 'abono');
  if (hechoHoy(b, 'abono')) t.push({ id: 'abono', titulo: 'Abonado hoy', flujo: 'abonar', hecha: true, icono: 'abono' });
  else if (!ua || diasEntre(ua) >= cadaAbono) t.push({ id: 'abono', titulo: 'Toca abonar', detalle: `Cada ${cadaAbono} días mientras crece.`, flujo: 'abonar', icono: 'abono' });

  const al = ultimo(b, 'alambre');
  const retiro = ultimo(b, 'retiroAlambre');
  if (al && (!retiro || retiro < al)) {
    const d = diasEntre(al);
    if (d >= 21) t.push({ id: 'alambre', titulo: 'Revisa que el alambre no marque', detalle: `Lo pusiste hace ${d} días. Si empieza a hundirse en la corteza, córtalo en trocitos.`, accion: 'retirar', icono: 'alambre' });
  }

  const ug = ultimo(b, 'giro');
  if (hechoHoy(b, 'giro')) t.push({ id: 'giro', titulo: 'Maceta girada', hecha: true, icono: 'giro' });
  else if (!ug || diasEntre(ug) >= 7) t.push({ id: 'giro', titulo: 'Gira la maceta un cuarto de vuelta', detalle: 'Así crece parejo hacia la luz.', accion: 'girar', icono: 'giro' });

  return t.sort((a, b2) => Number(!!a.hecha) - Number(!!b2.hecha) || Number(!!b2.urgente) - Number(!!a.urgente));
}

// Qué siente el árbol (y por lo tanto el kodama).
export function animoDe(b) {
  if (!b) return { animo: 'bien', frase: '' };
  const e = especieDe(b);
  const r = estadoRiego(b);
  const hora = new Date().getHours();
  if (hechoHoy(b, 'riego')) return { animo: 'bien', expresion: 'feliz', frase: '¡Gracias por el agua! Me siento fresco.' };
  if (!r.sinDatos && r.dias < 0) return { animo: 'sed', expresion: 'sed', frase: 'Tengo sed… ¿me revisas la tierra?' };
  if (e?.ubicacion === 'exterior' && b.condiciones.ubicacion === 'interior') return { animo: 'bien', expresion: 'sed', frase: 'Extraño el sol de afuera.' };
  if (hora >= 22 || hora < 6) return { animo: 'bien', expresion: 'dormido', frase: 'Zzz… los árboles también descansan.' };
  if (r.sinDatos) return { animo: 'bien', expresion: 'normal', frase: '¿Cuándo me regaste por última vez?' };
  if (r.dias === 0) return { animo: 'bien', expresion: 'normal', frase: 'Hoy toca revisar mi tierra.' };
  return { animo: 'bien', expresion: 'feliz', frase: r.dias === 1 ? 'Estoy bien. Mañana revisas mi tierra.' : `Estoy bien. Próximo riego en ${r.dias} días.` };
}
