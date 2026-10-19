import { Appointment } from '../types';

/**
 * Convierte un string de hora "HH:MM" a minutos desde la medianoche.
 * Ej. "10:30" -> 630
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(n => parseInt(n, 10) || 0);
  return h * 60 + m;
};

/**
 * Convierte minutos desde la medianoche a formato "HH:MM".
 * Ej. 630 -> "10:30"
 */
export const minutesToTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const padH = h.toString().padStart(2, '0');
  const padM = m.toString().padStart(2, '0');
  return `${padH}:${padM}`;
};

/**
 * Lista de horarios estándar de atención del spa (cada 30 min de 08:00 a 19:30).
 */
export const STANDARD_HOURLY_SLOTS: string[] = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

/**
 * Verifica si dos intervalos de tiempo se solapan: [startA, startA + durA) y [startB, startB + durB).
 */
export const isTimeOverlapping = (
  timeA: string,
  durationA: number,
  timeB: string,
  durationB: number
): boolean => {
  const startA = timeToMinutes(timeA);
  const endA = startA + (durationA > 0 ? durationA : 30);

  const startB = timeToMinutes(timeB);
  const endB = startB + (durationB > 0 ? durationB : 30);

  // Hay solapamiento si startA < endB y startB < endA
  return startA < endB && startB < endA;
};

export interface ConflictResult {
  hasConflict: boolean;
  conflictingAppointment?: Appointment;
  reason?: string;
}

/**
 * Detecta si existe colisión de horario para una fecha, hora, duración y especialista.
 * Las citas canceladas NO generan colisión.
 */
export const checkScheduleConflict = (
  appointments: Appointment[],
  date: string,
  time: string,
  durationMin: number,
  specialistId: string,
  excludeAppointmentId?: string
): ConflictResult => {
  if (!date || !time) return { hasConflict: false };

  const activeAppointmentsOnDate = appointments.filter(a => 
    a.date === date && 
    a.status !== 'cancelled' &&
    (!excludeAppointmentId || a.id !== excludeAppointmentId)
  );

  // Buscar cita que colisione con el mismo especialista (o colisión general)
  for (const apt of activeAppointmentsOnDate) {
    // Si se especificó una especialista y coincide, o si es la misma cabina
    const sameSpecialist = specialistId === 'any' || apt.specialistId === specialistId;
    if (sameSpecialist) {
      const overlaps = isTimeOverlapping(time, durationMin, apt.time, apt.durationMin || 30);
      if (overlaps) {
        const aptEnd = minutesToTime(timeToMinutes(apt.time) + (apt.durationMin || 30));
        return {
          hasConflict: true,
          conflictingAppointment: apt,
          reason: `Horario ocupado por "${apt.clientName}" (${apt.serviceName}) con ${apt.specialistName} de ${apt.time} a ${aptEnd}.`
        };
      }
    }
  }

  return { hasConflict: false };
};

export interface SlotStatus {
  time: string;
  isOccupied: boolean;
  appointment?: Appointment;
  endTime?: string;
  clientName?: string;
  serviceName?: string;
  specialistName?: string;
}

/**
 * Genera el estado (Libre / Ocupado) de cada franja horaria para una fecha y especialista dados.
 */
export const getSlotsAvailability = (
  appointments: Appointment[],
  date: string,
  specialistId: string = 'all',
  slotDuration: number = 30
): SlotStatus[] => {
  const activeAppointments = appointments.filter(a => 
    a.date === date && 
    a.status !== 'cancelled' &&
    (specialistId === 'all' || specialistId === 'any' || a.specialistId === specialistId)
  );

  return STANDARD_HOURLY_SLOTS.map(slotTime => {
    // Buscar si alguna cita ocupa este horario
    const slotMin = timeToMinutes(slotTime);
    const occupyingApt = activeAppointments.find(a => {
      const aptStart = timeToMinutes(a.time);
      const aptEnd = aptStart + (a.durationMin || 30);
      return slotMin >= aptStart && slotMin < aptEnd;
    });

    if (occupyingApt) {
      const aptStart = timeToMinutes(occupyingApt.time);
      const endTime = minutesToTime(aptStart + (occupyingApt.durationMin || 30));
      return {
        time: slotTime,
        isOccupied: true,
        appointment: occupyingApt,
        endTime,
        clientName: occupyingApt.clientName,
        serviceName: occupyingApt.serviceName,
        specialistName: occupyingApt.specialistName,
      };
    }

    return {
      time: slotTime,
      isOccupied: false,
    };
  });
};
