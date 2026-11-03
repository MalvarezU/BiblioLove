import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DialogNuevoPrestamo } from '@/components/prestamos/new-checkout-dialog';
import { BotonRecibirPrestamo } from '@/components/prestamos/return-button';
import {
  IconArrowsExchange,
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
} from '@tabler/icons-react';

function formatFecha(dateInput: Date | string | null): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO');
}

function estadoCheckout(checkout: { dueDate: Date; returnDate: Date | null }, hoy: Date) {
  if (checkout.returnDate) {
    return new Date(checkout.returnDate).getTime() > new Date(checkout.dueDate).getTime()
      ? { texto: 'Entregado con retraso', clase: 'bg-warning/10 text-warning' }
      : { texto: 'Entregado', clase: 'bg-success/10 text-success' };
  }
  if (new Date(checkout.dueDate).getTime() < hoy.getTime()) {
    return { texto: 'Retrasado', clase: 'bg-destructive/10 text-destructive' };
  }
  return { texto: 'Prestado', clase: 'bg-primary/10 text-primary' };
}

export default async function PrestamosPage() {
  const usuario = await getSessionUser();
  if (!usuario) redirect('/login');

  const esAdmin = usuario.role === 'ADMIN';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const checkouts = await prisma.checkout.findMany({
    where: esAdmin ? {} : { userId: usuario.id },
    orderBy: { checkoutDate: 'desc' },
    include: {
      item: { include: { book: { select: { title: true } } } },
      user: { select: { name: true, lastName: true } },
    },
  });

  const datosAdmin = esAdmin
    ? await Promise.all([
        prisma.book.findMany({
          where: {
            items: { some: { status: 'Disponible', enabled: true, deleted: false } },
          },
          select: {
            id: true,
            title: true,
            items: {
              where: { status: 'Disponible', enabled: true, deleted: false },
              select: { id: true, publisher: true },
            },
          },
          orderBy: { title: 'asc' },
        }),
        prisma.user.findMany({
          where: { deleted: false, enabled: true },
          select: { id: true, name: true, lastName: true, email: true },
          orderBy: { name: 'asc' },
        }),
        prisma.checkout.findMany({
          where: { returnDate: null, dueDate: { lt: hoy } },
          select: { userId: true },
        }),
      ])
    : null;

  const librosDisponibles = datosAdmin?.[0] ?? [];
  const usuariosActivos = datosAdmin?.[1] ?? [];
  const usuariosRetrasados = datosAdmin
    ? [...new Set(datosAdmin[2].map((c) => c.userId))]
    : [];

  const activos = checkouts.filter((c) => !c.returnDate);
  const retrasados = checkouts.filter((c) => {
    const fin = c.returnDate ?? hoy;
    return new Date(fin).getTime() > new Date(c.dueDate).getTime();
  });
  const entregados = checkouts.filter((c) => c.returnDate);
  const historial = esAdmin ? entregados : checkouts;

  const resumen = [
    { titulo: 'Préstamos totales', valor: checkouts.length, icono: IconArrowsExchange },
    { titulo: 'Activos', valor: activos.length, icono: IconCalendar },
    { titulo: 'Con retraso', valor: retrasados.length, icono: IconAlertTriangle },
    { titulo: 'Entregados', valor: entregados.length, icono: IconCheck },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconArrowsExchange className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {esAdmin ? 'Préstamos de la Biblioteca' : 'Mis Préstamos'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {esAdmin
                ? 'Todos los préstamos, devoluciones y retrasos del sistema'
                : 'Historial personal de préstamos y devoluciones'}
            </p>
          </div>
        </div>
        {esAdmin && (
          <DialogNuevoPrestamo
            libros={librosDisponibles}
            usuarios={usuariosActivos}
            usuariosRetrasados={usuariosRetrasados}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {resumen.map((item) => (
          <Card key={item.titulo}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {item.titulo}
                </p>
                <item.icono className="size-4 text-primary" />
              </div>
              <p className="mt-1 font-heading text-2xl font-semibold">{item.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {esAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Préstamos activos</CardTitle>
            <CardDescription>
              Préstamos pendientes de devolución física
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Libro</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Préstamo</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="pr-6 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No hay préstamos activos
                      </TableCell>
                    </TableRow>
                  ) : (
                    activos.map((c) => {
                      const estado = estadoCheckout(c, hoy);
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="pl-6 text-xs font-medium">
                            {c.item.book.title}
                          </TableCell>
                          <TableCell className="text-xs">
                            {c.user.name} {c.user.lastName ?? ''}
                          </TableCell>
                          <TableCell className="text-xs">{formatFecha(c.checkoutDate)}</TableCell>
                          <TableCell className="text-xs">{formatFecha(c.dueDate)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${estado.clase}`}>
                              {estado.texto}
                            </span>
                          </TableCell>
                          <TableCell className="pr-6">
                            <div className="flex justify-end">
                              <BotonRecibirPrestamo checkout={c} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {esAdmin ? 'Historial de préstamos' : 'Historial de mis préstamos'}
          </CardTitle>
          <CardDescription>
            {esAdmin
              ? 'Préstamos entregados por todos los usuarios'
              : 'Préstamos asociados a tu cuenta'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Libro</TableHead>
                  {esAdmin && <TableHead>Usuario</TableHead>}
                  <TableHead>Préstamo</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Devolución</TableHead>
                  <TableHead className="pr-6">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historial.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={esAdmin ? 6 : 5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No hay préstamos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  historial.map((c) => {
                    const estado = estadoCheckout(c, hoy);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-6 text-xs font-medium">
                          {c.item.book.title}
                        </TableCell>
                        {esAdmin && (
                          <TableCell className="text-xs">
                            {c.user.name} {c.user.lastName ?? ''}
                          </TableCell>
                        )}
                        <TableCell className="text-xs">{formatFecha(c.checkoutDate)}</TableCell>
                        <TableCell className="text-xs">{formatFecha(c.dueDate)}</TableCell>
                        <TableCell className="text-xs">{formatFecha(c.returnDate)}</TableCell>
                        <TableCell className="pr-6">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${estado.clase}`}
                          >
                            {estado.texto}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
