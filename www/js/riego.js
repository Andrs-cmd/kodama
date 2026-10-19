// Calcula cada cuánto regar a partir de la referencia de la especie
// (maceta mediana, exterior, clima templado) y avisa cuándo toca el próximo riego.

export const MACETAS = { pequena: 'Pequeña (< 15 cm)', mediana: 'Mediana (15-30 cm)', grande: 'Grande (> 30 cm)' };
export const UBICACIONES = { exterior: 'Exterior al sol', sombra: 'Exterior en sombra', interior: 'Interior' };
export const CLIMAS = { frio: 'Frío (Bogotá, sabana)', templado: 'Templado (Medellín, Eje Cafetero)', calido: 'Cálido (Cali, costa, llanos)' };

const F_MACETA = { pequena: 0.6, mediana: 1, grande: 1.5 };
const F_UBICACION = { exterior: 1, sombra: 1.3, interior: 1.4 };
const F_CLIMA = { frio: 1.4, templado: 1, calido: 0.6 };

export function diasEntreRiegos(especie, { maceta = 'mediana', ubicacion = 'exterior', clima = 'frio' } = {}) {
  const base = especie?.riego?.dias ?? 3;
  const d = base * F_MACETA[maceta] * F_UBICACION[ubicacion] * F_CLIMA[clima];
  return Math.max(1, Math.round(d));
}

export function textoFrecuencia(dias) {
  if (dias <= 1) return 'todos los días';
  if (dias === 7) return 'una vez por semana';
  return `cada ${dias} días`;
}

const DIA = 86400000;

// Devuelve { dias: días que faltan (negativo = atrasado), fecha } desde el último riego.
export function proximoRiego(ultimo, dias) {
  if (!ultimo) return null;
  const inicio = new Date(ultimo);
  inicio.setHours(0, 0, 0, 0);
  const fecha = new Date(inicio.getTime() + dias * DIA);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return { fecha, dias: Math.round((fecha - hoy) / DIA) };
}

export function textoProximo(p) {
  if (!p) return 'Aún no has registrado un riego';
  if (p.dias < 0) return `Atrasado ${-p.dias} día${p.dias === -1 ? '' : 's'}: revisa el sustrato`;
  if (p.dias === 0) return 'Toca revisar hoy';
  if (p.dias === 1) return 'Mañana';
  return `En ${p.dias} días`;
}
