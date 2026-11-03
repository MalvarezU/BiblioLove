import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { expirarReservasVencidas } from '@/lib/reservations';
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
import { DialogNuevaReserva } from '@/components/reservas/new-reservation-dialog';
import { BotonReclamarReserva } from '@/components/reservas/claim-button';
import {
  IconBookmark,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconX,
} from '@tabler/icons-react';

function formatFecha(dateInput: Date | string | null): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO');
}

function claseEstado(status: string) {
  if (status === 'Activa') return 'bg-primary/10 text-primary';
  if (status === 'Cumplida' || status === 'Reclamado')
    return 'bg-success/10 text-success';
  return 'bg-destructive/10 text-destructive';
}

export default async function ReservasPage() {
  const usuario = await getSessionUser();
  if (!usuario) redirect('/login');

  const esAdmin = usuario.role === 'ADMIN';
  await expirarReservasVencidas();
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const reservas = await prisma.reservation.findMany({
    where: esAdmin ? {} : { userId: usuario.id },
    orderBy: { issuedDate: 'desc' },
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

  const activas = reservas.filter((r) => r.status === 'Activa');
  const canceladas = reservas.filter((r) => r.status === 'Cancelada');
  const cumplidas = reservas.filter((r) => r.status === 'Cumplida');
  const reclamadas = reservas.filter((r) => r.status === 'Reclamado');
  const historial = esAdmin ? reservas.filter((r) => r.status !== 'Activa') : reservas;

  const resumen = [
    { titulo: 'Reservas totales', valor: reservas.length, icono: IconCalendarEvent },
    { titulo: 'Activas', valor: activas.length, icono: IconClock },
    { titulo: 'Reclamadas', valor: reclamadas.length, icono: IconBookmark },
    { titulo: 'Cumplidas', valor: cumplidas.length, icono: IconCheck },
    { titulo: 'Canceladas', valor: canceladas.length, icono: IconX },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconCalendarEvent className="size-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {esAdmin ? 'Reservas de la Biblioteca' : 'Mis Reservas'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {esAdmin
                ? 'Todas las reservas y su estado en el sistema'
                : 'Reservas asociadas a tu cuenta'}
            </p>
          </div>
        </div>
        {esAdmin && (
          <DialogNuevaReserva
            libros={librosDisponibles}
            usuarios={usuariosActivos}
            usuariosRetrasados={usuariosRetrasados}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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
            <CardTitle className="text-sm">Reservas activas</CardTitle>
            <CardDescription>
              Reservas pendientes de reclamo por parte de los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Libro</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Emitida</TableHead>
                    <TableHead>Fecha de reclamo</TableHead>
                    <TableHead>Fecha final de reclamo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="pr-6 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No hay reservas activas
                      </TableCell>
                    </TableRow>
                  ) : (
                    activas.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="pl-6 text-xs font-medium">
                          {r.item.book.title}
                        </TableCell>
                        <TableCell className="text-xs">
                          {r.user.name} {r.user.lastName ?? ''}
                        </TableCell>
                        <TableCell className="text-xs">{formatFecha(r.issuedDate)}</TableCell>
                        <TableCell className="text-xs">{formatFecha(r.minCheckout)}</TableCell>
                        <TableCell className="text-xs">{formatFecha(r.maxCheckout)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${claseEstado(r.status)}`}>
                            {r.status}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6">
                          <div className="flex justify-end">
                            <BotonReclamarReserva reserva={r} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
            {esAdmin ? 'Historial de reservas' : 'Historial de mis reservas'}
          </CardTitle>
          <CardDescription>
            {esAdmin
              ? 'Reservas finalizadas o canceladas'
              : 'Reservas asociadas a tu cuenta'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Libro</TableHead>
                  {esAdmin && <TableHead>Usuario</TableHead>}
                  <TableHead>Emitida</TableHead>
                  <TableHead>Fecha de reclamo</TableHead>
                  <TableHead>Fecha final de reclamo</TableHead>
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
                      No hay reservas en el historial
                    </TableCell>
                  </TableRow>
                ) : (
                  historial.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="pl-6 text-xs font-medium">
                        {r.item.book.title}
                      </TableCell>
                      {esAdmin && (
                        <TableCell className="text-xs">
                          {r.user.name} {r.user.lastName ?? ''}
                        </TableCell>
                      )}
                      <TableCell className="text-xs">{formatFecha(r.issuedDate)}</TableCell>
                      <TableCell className="text-xs">{formatFecha(r.minCheckout)}</TableCell>
                      <TableCell className="text-xs">{formatFecha(r.maxCheckout)}</TableCell>
                      <TableCell className="pr-6">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${claseEstado(r.status)}`}>
                          {r.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
