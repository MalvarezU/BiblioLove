import { IconArrowsExchange, IconClock } from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Placeholder del modulo de transacciones (prestamos y movimientos)
export default function TransaccionesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconArrowsExchange className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Prestamos
          </h1>
          <p className="text-xs text-muted-foreground">
            Historial de prestamos, devoluciones y movimientos del inventario
          </p>
        </div>
      </div>

      {/* Modulo pendiente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="size-4 text-primary" />
            Modulo en construccion
          </CardTitle>
          <CardDescription>
            Aqui podras registrar los prestamos fisicos de libros y sus
            devoluciones cuando se realicen de forma presencial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Por ahora puedes gestionar el catalogo de libros y los usuarios en
            las secciones del menu lateral.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
