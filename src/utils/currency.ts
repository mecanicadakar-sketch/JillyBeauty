/**
 * Jilly Beauty Lab - Sistema de Moneda Oficial
 * Moneda: Guaraníes Paraguayos (Gs.)
 */

export const CURRENCY_SYMBOL = 'Gs.';

/**
 * Formatea un número o texto con separador de miles usando puntos (.).
 * Ejemplos:
 * 1500 -> "1.500"
 * 15000 -> "15.000"
 * 150000 -> "150.000"
 * 1500000 -> "1.500.000"
 */
export const formatThousands = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || amount === '') return '0';
  const clean = String(amount).replace(/\D/g, '');
  if (!clean) return '0';
  const stripped = clean.replace(/^0+(?=\d)/, '');
  return stripped.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Convierte un texto con puntos separadores de miles a un número entero.
 */
export const parseThousands = (amountStr: string | undefined | null): number => {
  if (!amountStr) return 0;
  const clean = String(amountStr).replace(/\D/g, '');
  return parseInt(clean, 10) || 0;
};

/**
 * Formatea un número como Guaraníes (ej. "Gs. 60.000" o "Gs. 150.000")
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  const num = Math.round(Number(amount) || 0);
  return `Gs. ${formatThousands(num)}`;
};

/**
 * Formatea solo la cifra con separadores de miles
 */
export const formatAmount = (amount: number | string | undefined | null): string => {
  const num = Math.round(Number(amount) || 0);
  return formatThousands(num);
};
