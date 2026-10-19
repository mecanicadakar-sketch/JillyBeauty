import React, { useState, useEffect, useRef } from 'react';

export interface FormattedNumberInputProps {
  value: number | string | undefined | null;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  ariaLabel?: string;
}

/**
 * Formatea una cadena de dígitos con puntos de miles (ej. 150000 -> 150.000).
 * Si la cadena es "0", devuelve "0".
 * Si tiene ceros a la izquierda seguidos de dígitos (ej. "05"), sobrepone el cero y devuelve "5".
 */
export const formatThousandsDigits = (val: string): string => {
  if (!val) return '';
  // Eliminar todo lo que no sea dígito
  let clean = val.replace(/\D/g, '');
  if (!clean) return '';

  // Si tiene más de 1 dígito y comienza con cero, sobreponer al cero (ej: "05" -> "5")
  if (clean.length > 1 && clean.startsWith('0')) {
    clean = clean.replace(/^0+/, '') || '0';
  }

  // Si es solo 0, devolver "0"
  if (clean === '0') return '0';

  // Al superar los 3 dígitos colocar punto separador de miles
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Convierte una cadena formateada con puntos a número entero puro.
 */
export const parseThousandsToNumber = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/\D/g, '');
  if (!clean) return 0;
  return parseInt(clean, 10) || 0;
};

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '0',
  min,
  max,
  disabled = false,
  required = false,
  name,
  id,
  autoFocus = false,
  prefix,
  suffix,
  ariaLabel,
}) => {
  // Convertimos el value entrante a string formateado
  const formatIncoming = (v: number | string | undefined | null): string => {
    if (v === undefined || v === null || v === '') return '';
    const num = typeof v === 'number' ? v : parseThousandsToNumber(String(v));
    if (num === 0) return '0';
    return formatThousandsDigits(String(num));
  };

  const [displayValue, setDisplayValue] = useState<string>(() => formatIncoming(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar cuando el prop value cambia externamente
  useEffect(() => {
    // Si el usuario está escribiendo activamente y borró todo (displayValue === ''),
    // no forzar a mostrar '0' si el value entrante es 0 para permitirle borrar el cero libremente.
    if (isFocused && displayValue === '' && (value === 0 || value === '0' || !value)) {
      return;
    }

    const currentParsed = parseThousandsToNumber(displayValue);
    const incomingParsed = typeof value === 'number' ? value : parseThousandsToNumber(String(value ?? 0));

    // Si coinciden en número, no pisar displayValue para mantener selección/cursor
    if (currentParsed === incomingParsed && displayValue !== '') {
      return;
    }

    setDisplayValue(formatIncoming(value));
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const input = e.target;
    const prevCursor = input.selectionStart || 0;

    // Contar cuántos dígitos numéricos había antes del cursor en el texto crudo
    const digitsBeforeCursor = raw.slice(0, prevCursor).replace(/\D/g, '').length;

    // 1. Al borrar números permitir borrar también el cero (queda string vacío "")
    if (raw === '' || raw.trim() === '') {
      setDisplayValue('');
      onChange(min !== undefined && min > 0 ? min : 0);
      return;
    }

    // 2. Extraer dígitos limpios
    let digits = raw.replace(/\D/g, '');
    if (!digits) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // 3. Al agregar un número sobreponer al cero:
    // Si el texto anterior era "0" o comenzaba con 0 seguido de otros dígitos (ej. "05"),
    // se remueve el cero inicial para sobreponer el nuevo número
    if (digits.length > 1 && digits.startsWith('0')) {
      digits = digits.replace(/^0+/, '') || '0';
    }

    // 4. Al superar los 3 dígitos colocar punto separador de miles
    const formatted = digits === '0' ? '0' : digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    let numericVal = parseInt(digits, 10) || 0;
    if (max !== undefined && numericVal > max) {
      numericVal = max;
    }

    setDisplayValue(formatted);
    onChange(numericVal);

    // 5. Restaurar posición de cursor inteligente considerando los puntos añadidos
    requestAnimationFrame(() => {
      if (!input) return;
      let newCursor = 0;
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          counted++;
        }
        if (counted >= digitsBeforeCursor) {
          newCursor = i + 1;
          break;
        }
      }
      if (counted < digitsBeforeCursor) {
        newCursor = formatted.length;
      }
      input.setSelectionRange(newCursor, newCursor);
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Si el valor actual es 0, seleccionar todo para que cualquier tecla sobreponga al cero de inmediato
    if (displayValue === '0') {
      e.target.select();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Si quedó vacío, reflejarlo o normalizar según min
    if (displayValue === '') {
      const defaultVal = min !== undefined ? min : 0;
      if (defaultVal === 0) {
        // Dejarlo como 0 formateado o vacío si requerido
        setDisplayValue('0');
        onChange(0);
      } else {
        setDisplayValue(formatThousandsDigits(String(defaultVal)));
        onChange(defaultVal);
      }
    } else {
      let num = parseThousandsToNumber(displayValue);
      if (min !== undefined && num < min) {
        num = min;
      }
      if (max !== undefined && num > max) {
        num = max;
      }
      setDisplayValue(formatThousandsDigits(String(num)));
      onChange(num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si tiene '0' seleccionado o el valor es '0' y presiona Backspace o Delete, borrar el 0 inmediatamente
    if (displayValue === '0' && (e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      setDisplayValue('');
      onChange(0);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {prefix}
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        className={`${className} ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''}`}
      />

      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          {suffix}
        </div>
      )}
    </div>
  );
};
