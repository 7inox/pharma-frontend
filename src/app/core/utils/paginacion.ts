export function enteroEnRango(valor: unknown, defecto: number, minimo: number, maximo: number): number {
  if (valor === undefined || valor === null || valor === '') return defecto;
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero >= minimo && numero <= maximo ? numero : defecto;
}
