export const ITEM_STATUSES = [
  'Disponible',
  'Reservado',
  'En préstamo',
  'Perdido',
] as const;

export const RESERVATION_STATUSES = [
  'Activa',
  'Cancelada',
  'Cumplida',
  'Reclamado',
] as const;

export const CHECKOUT_STATUSES = [
  'Prestado',
  'Entregado',
  'Entregado con retraso',
] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export type CheckoutStatus = (typeof CHECKOUT_STATUSES)[number];
