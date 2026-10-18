/**
 * Jilly Beauty Lab - Sistema de Moneda Oficial
 * Moneda: Guaraníes Paraguayos (Gs.)
 */

export const CURRENCY_SYMBOL = 'Gs.';

/**
 * Formatea un número como Guaraníes (ej. "Gs. 60.000" o "Gs. 150.000")
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  const num = Number(amount) || 0;
  if (num % 1 !== 0) {
    return `Gs. ${num.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `Gs. ${num.toLocaleString('es-PY')}`;
};

/**
 * Formatea solo la cifra con separadores de miles
 */
export const formatAmount = (amount: number | string | undefined | null): string => {
  const num = Number(amount) || 0;
  if (num % 1 !== 0) {
    return num.toLocaleString('es-PY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return num.toLocaleString('es-PY');
};
