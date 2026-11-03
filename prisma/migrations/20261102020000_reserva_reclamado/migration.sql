-- Agrega el estado Reclamado para reservas que ya fueron efectivas.
ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "reservation_status_check";
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_status_check"
    CHECK ("status" IN ('Activa', 'Cancelada', 'Cumplida', 'Reclamado'));
