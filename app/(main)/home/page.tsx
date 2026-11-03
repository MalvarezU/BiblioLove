import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  IconBook2,
  IconUsers,
  IconArrowRight,
  IconPackage,
  IconArrowsExchange,
  IconChartBar,
  IconAlertTriangle,
  IconCalendarEvent,
} from '@tabler/icons-react';

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function lastMonths(n: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

function buildMonthlyCounts(dates: Date[], months: string[]) {
  const map = new Map(months.map((m) => [m, 0]));
  dates.forEach((d) => {
    const k = monthKey(new Date(d));
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  });
  return months.map((m) => ({ mes: m, valor: map.get(m) ?? 0 }));
}

function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.valor));
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.mes} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary/80 transition-all"
            style={{
              height: `${(d.valor / max) * 100}%`,
              minHeight: d.valor > 0 ? '4px' : '0',
            }}
            title={`${d.mes}: ${d.valor}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.mes.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

function formatFecha(dateInput: Date | string | null): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CO');
}

type CheckoutVista = {
  id: string;
  checkoutDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: string;
  userId: string;
  item: { book: { title: string } };
  user: { name: string; lastName: string | null };
};

function estadoPrestamo(c: CheckoutVista, hoy: Date) {
  if (c.returnDate) {
    return new Date(c.returnDate).getTime() > new Date(c.dueDate).getTime()
      ? { texto: 'Devuelto con retraso', clase: 'bg-warning/10 text-warning' }
      : { texto: 'Devuelto', clase: 'bg-success/10 text-success' };
  }
  if (new Date(c.dueDate).getTime() < hoy.getTime()) {
    return { texto: 'Retrasado', clase: 'bg-destructive/10 text-destructive' };
  }
  return { texto: 'Activo', clase: 'bg-primary/10 text-primary' };
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;
  const hoy = new Date();

  const usuario = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true, email: true, createdAt: true },
      })
    : null;

  const isAdmin = usuario?.role === 'ADMIN';

  const [totalLibros, totalEjemplares, totalUsuarios, checkouts, reservasActivas] =
    await Promise.all([
      prisma.book.count(),
      prisma.item.count({ where: { deleted: false, enabled: true } }),
      prisma.user.count({ where: { deleted: false } }),
      prisma.checkout.findMany({
        where: isAdmin ? {} : { userId: userId ?? '' },
        orderBy: { checkoutDate: 'desc' },
        select: {
          id: true,
          checkoutDate: true,
          dueDate: true,
          returnDate: true,
          status: true,
          userId: true,
          item: { select: { book: { select: { title: true } } } },
          user: { select: { name: true, lastName: true } },
        },
      }),
      prisma.reservation.count({
        where: isAdmin
          ? { status: 'Activa' }
          : { userId: userId ?? '', status: 'Activa' },
      }),
    ]);

  const months = lastMonths(6);
  const activos = checkouts.filter((c) => !c.returnDate);
  const retrasados = checkouts.filter((c) => {
    const fin = c.returnDate ?? hoy;
    return new Date(fin).getTime() > new Date(c.dueDate).getTime();
  });

  const monthlyCheckouts = buildMonthlyCounts(
    checkouts.map((c) => c.checkoutDate),
    months
  );
  const monthlyOverdue = buildMonthlyCounts(
    retrasados.map((c) => c.dueDate),
    months
  );

  const mesesActivo = Math.max(
    1,
    (hoy.getFullYear() - new Date(usuario?.createdAt ?? hoy).getFullYear()) * 12 +
      (hoy.getMonth() - new Date(usuario?.createdAt ?? hoy).getMonth()) +
      1
  );

  const promedioMensual = checkouts.length / (isAdmin ? months.length : mesesActivo);
  const promedioRetrasos = retrasados.length / (isAdmin ? months.length : mesesActivo);

  const metricas = [
    {
      titulo: 'Libros registrados',
      valor: totalLibros,
      detalle: 'Obras únicas en el catálogo',
      icono: IconBook2,
    },
    {
      titulo: 'Ejemplares activos',
      valor: totalEjemplares,
      detalle: 'Unidades disponibles para préstamo',
      icono: IconPackage,
    },
    {
      titulo: 'Usuarios activos',
      valor: totalUsuarios,
      detalle: 'Administradores y lectores',
      icono: IconUsers,
    },
    {
      titulo: 'Préstamos activos',
      valor: activos.length,
      detalle: 'Préstamos pendientes de devolución',
      icono: IconArrowsExchange,
    },
    {
      titulo: 'Reservas activas',
      valor: reservasActivas,
      detalle: 'Reservas pendientes de retiro',
      icono: IconCalendarEvent,
    },
  ];

  const recientes = checkouts.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Bienvenido de nuevo, {usuario?.name ?? 'Usuario'}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            {isAdmin
              ? 'Panel de administración: catálogo, ejemplares y préstamos de toda la biblioteca.'
              : 'Tu historial de préstamos, retrasos y actividad personal.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button nativeButton={false} render={<Link href="/maestros" />}>
            Ver catálogo
            <IconArrowRight />
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/reservas" />}
          >
            {isAdmin ? 'Reservas' : 'Mis reservas'}
            <IconCalendarEvent />
          </Button>
        </div>
      </div>

      {isAdmin && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {metricas.map((metrica) => (
              <Card key={metrica.titulo}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardDescription className="text-xs font-medium uppercase tracking-wide">
                    {metrica.titulo}
                  </CardDescription>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <metrica.icono className="size-5" />
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="font-heading text-3xl font-semibold">
                    {metrica.valor}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {metrica.detalle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Préstamos por mes
                </CardTitle>
                <CardDescription>
                  Total: {checkouts.length} · Promedio mensual: {promedioMensual.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={monthlyCheckouts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconAlertTriangle className="size-4 text-primary" />
                  Retrasos por mes
                </CardTitle>
                <CardDescription>
                  Total: {retrasados.length} · Promedio mensual: {promedioRetrasos.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={monthlyOverdue} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardAction>
                <Button
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                  render={<Link href="/prestamos" />}
                >
                  Ver todos
                  <IconArrowRight />
                </Button>
              </CardAction>
              <CardTitle className="flex items-center gap-2">
                <IconArrowsExchange className="size-4 text-primary" />
                Préstamos recientes
              </CardTitle>
              <CardDescription>Movimientos de toda la biblioteca</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {recientes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aún no hay préstamos registrados.
                </p>
              ) : (
                recientes.map((c) => {
                  const estado = estadoPrestamo(c as CheckoutVista, hoy);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <IconBook2 className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {c.item.book.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.user.name} {c.user.lastName ?? ''} ·{' '}
                            {formatFecha(c.checkoutDate)}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clase}`}>
                        {estado.texto}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!isAdmin && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Libros prestados por mes
                </CardTitle>
                <CardDescription>
                  Total desde tu registro: {checkouts.length} · Promedio mensual:{' '}
                  {promedioMensual.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={monthlyCheckouts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconAlertTriangle className="size-4 text-primary" />
                  Retrasos en entregas por mes
                </CardTitle>
                <CardDescription>
                  Total retrasos: {retrasados.length} · Promedio mensual:{' '}
                  {promedioRetrasos.toFixed(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={monthlyOverdue} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardAction>
                <Button
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                  render={<Link href="/prestamos" />}
                >
                  Ver todos
                  <IconArrowRight />
                </Button>
              </CardAction>
              <CardTitle className="flex items-center gap-2">
                <IconArrowsExchange className="size-4 text-primary" />
                Mis préstamos activos
              </CardTitle>
              <CardDescription>Préstamos pendientes de devolución</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {activos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-8 text-center">
                  <IconBook2 className="size-8 text-muted-foreground stroke-1" />
                  <div>
                    <p className="text-sm font-medium">No tienes préstamos activos</p>
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      Explora el catálogo y reserva tu próximo título.
                    </p>
                  </div>
                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    render={<Link href="/maestros" />}
                  >
                    Reservar libro
                    <IconArrowRight />
                  </Button>
                </div>
              ) : (
                activos.map((c) => {
                  const estado = estadoPrestamo(c as CheckoutVista, hoy);
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <IconBook2 className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {c.item.book.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Vence: {formatFecha(c.dueDate)}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clase}`}>
                        {estado.texto}
                      </span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
