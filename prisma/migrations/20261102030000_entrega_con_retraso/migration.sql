-- Agrega el estado Entregado con retraso para devoluciones tardias.
ALTER TABLE "checkout" DROP CONSTRAINT IF EXISTS "checkout_status_check";
ALTER TABLE "checkout" ADD CONSTRAINT "checkout_status_check"
    CHECK ("status" IN ('Prestado', 'Entregado', 'Entregado con retraso'));

UPDATE "checkout"
SET "status" = 'Entregado con retraso'
WHERE "return_date" IS NOT NULL
  AND "return_date" > "due_date"
  AND "status" = 'Entregado';

UPDATE "checkout"
SET "status" = 'Entregado'
WHERE "return_date" IS NOT NULL
  AND "return_date" <= "due_date"
  AND "status" = 'Entregado';
