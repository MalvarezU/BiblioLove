-- Normaliza los estados a los valores en espanol definidos para cada tabla.

UPDATE "item" SET "status" = CASE "status"
    WHEN 'AVAILABLE' THEN 'Disponible'
    WHEN 'RESERVED' THEN 'Reservado'
    WHEN 'CHECKED_OUT' THEN 'En préstamo'
    WHEN 'LOST' THEN 'Perdido'
    ELSE "status"
END;

UPDATE "reservation" SET "status" = CASE "status"
    WHEN 'ACTIVE' THEN 'Activa'
    WHEN 'PENDING' THEN 'Activa'
    WHEN 'CANCELLED' THEN 'Cancelada'
    WHEN 'FULFILLED' THEN 'Cumplida'
    ELSE "status"
END;

UPDATE "checkout" SET "status" = CASE "status"
    WHEN 'CHECKED_OUT' THEN 'Prestado'
    WHEN 'RETURNED' THEN 'Entregado'
    ELSE "status"
END;

ALTER TABLE "item" ALTER COLUMN "status" SET DEFAULT 'Disponible';
ALTER TABLE "reservation" ALTER COLUMN "status" SET DEFAULT 'Activa';
ALTER TABLE "checkout" ALTER COLUMN "status" SET DEFAULT 'Prestado';

ALTER TABLE "item" DROP CONSTRAINT IF EXISTS "item_status_check";
ALTER TABLE "item" ADD CONSTRAINT "item_status_check"
    CHECK ("status" IN ('Disponible', 'Reservado', 'En préstamo', 'Perdido'));

ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "reservation_status_check";
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_status_check"
    CHECK ("status" IN ('Activa', 'Cancelada', 'Cumplida'));

ALTER TABLE "checkout" DROP CONSTRAINT IF EXISTS "checkout_status_check";
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_status_check"
    CHECK ("status" IN ('Prestado', 'Entregado'));
