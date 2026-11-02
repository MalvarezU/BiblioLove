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
} from '@tabler/icons-react';

async function getDashboardData() {
  const [totalMaestros, totalUsuarios, maestrosRecientes, sumSaldoResult] =
    await Promise.all([
      prisma.maestro.count({ where: { deleted: false } }),
      prisma.user.count({ where: { deleted: false } }),
      prisma.maestro.findMany({
        where: { deleted: false },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          nombre: true,
          saldo: true,
          createdAt: true,
          creadoPor: {
            select: { name: true, lastName: true },
          },
        },
      }),
      prisma.maestro.aggregate({
        where: { deleted: false },
        _sum: { saldo: true },
      }),
    ]);

  return {
    totalMaestros,
    totalUsuarios,
    maestrosRecientes,
    totalUnidades: sumSaldoResult._sum.saldo ?? 0,
  };
}

async function getPrestamosUsuario(userId: string) {
  return prisma.movimiento.findMany({
    where: { tipo: 'SALIDA', userId },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      cantidad: true,
      createdAt: true,
      maestro: { select: { nombre: true } },
    },
  });
}

async function getAllPrestamos() {
  return prisma.movimiento.findMany({
    where: { tipo: 'SALIDA' },
    orderBy: { createdAt: 'desc' },
    take: 8,
    select: {
      id: true,
      cantidad: true,
      createdAt: true,
      userId: true,
      maestro: { select: { nombre: true } },
      ejecutadoPor: { select: { name: true, lastName: true } },
    },
  });
}

function claseStock(saldo: number) {
  if (saldo > 5) return 'bg-success/10 text-success';
  if (saldo > 0) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
}

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

function buildMonthly(data: { createdAt: Date; cantidad: number }[], months: string[]) {
  const map = new Map(months.map((m) => [m, 0]));
  data.forEach((d) => {
    const k = monthKey(new Date(d.createdAt));
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + d.cantidad);
  });
  return months.map((m) => ({ mes: m, valor: map.get(m) ?? 0 }));
}

function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.valor));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-primary/80 transition-all"
            style={{ height: `${(d.valor / max) * 100}%`, minHeight: d.valor > 0 ? '4px' : '0' }}
            title={`${d.mes}: ${d.valor}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.mes.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  const [data, usuario, prestamos, allPrestamos] = await Promise.all([
    getDashboardData(),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, role: true, email: true, createdAt: true },
        })
      : Promise.resolve(null),
    userId ? getPrestamosUsuario(userId) : Promise.resolve([]),
    getAllPrestamos(),
  ]);

  const isAdmin = usuario?.role === 'ADMIN';
  const months = lastMonths(6);

  // Usuario: historial de prestamos
  const userLoans = await (userId
    ? prisma.movimiento.findMany({ where: { tipo: 'SALIDA', userId }, select: { createdAt: true, cantidad: true } })
    : Promise.resolve([]));
  const totalUserLoans = userLoans.reduce((a, m) => a + m.cantidad, 0);
  const monthsSince = Math.max(
    1,
    (new Date().getFullYear() - new Date(usuario?.createdAt ?? new Date()).getFullYear()) * 12 +
      (new Date().getMonth() - new Date(usuario?.createdAt ?? new Date()).getMonth()) +
      1
  );
  const avgUserPerMonth = totalUserLoans / monthsSince;
  const hoy = new Date();
  const overdueUser = userLoans.filter((m) => (hoy.getTime() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24) > 30);
  const totalOverdueUser = overdueUser.reduce((a, m) => a + m.cantidad, 0);
  const avgOverdueUserPerMonth = totalOverdueUser / monthsSince;
  const userMonthly = buildMonthly(userLoans, months);
  const userOverdueMonthly = buildMonthly(overdueUser, months);

  // Admin: todos los prestamos
  const allLoansList = await prisma.movimiento.findMany({ where: { tipo: 'SALIDA' }, select: { createdAt: true, cantidad: true, userId: true } });
  const totalAllLoans = allLoansList.reduce((a, m) => a + m.cantidad, 0);
  const activeAll = allLoansList.filter((m) => (hoy.getTime() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 30);
  const overdueAll = allLoansList.filter((m) => (hoy.getTime() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24) > 30);
  const totalOverdueAll = overdueAll.reduce((a, m) => a + m.cantidad, 0);
  const allMonthly = buildMonthly(allLoansList, months);
  const allOverdueMonthly = buildMonthly(overdueAll, months);
  const monthsGlobal = Math.max(1, months.length);
  const avgAllPerMonth = totalAllLoans / monthsGlobal;
  const avgOverdueAllPerMonth = totalOverdueAll / monthsGlobal;

  const metricas = [
    {
      titulo: 'Titulos registrados',
      valor: data.totalMaestros,
      detalle: 'Libros y materiales en el catalogo',
      icono: IconBook2,
    },
    {
      titulo: 'Unidades disponibles',
      valor: data.totalUnidades,
      detalle: 'Ejemplares listos para prestar',
      icono: IconPackage,
    },
    {
      titulo: 'Usuarios activos',
      valor: data.totalUsuarios,
      detalle: 'Administradores y lectores',
      icono: IconUsers,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Bienvenida */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            Bienvenido de nuevo, {usuario?.name ?? 'Usuario'}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            {isAdmin
              ? 'Panel de administracion bibliotecaria. Totales y prestamos globales.'
              : 'Tu historial de prestamos y actividad personal.'}
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/maestros" />}>
          Ver catalogo
          <IconArrowRight />
        </Button>
      </div>

      {isAdmin && (
        <>
          {/* Metricas admin */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

          {/* Graficas admin prestamos */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Prestamos totales por mes
                </CardTitle>
                <CardDescription>Total: {totalAllLoans} unidades</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={allMonthly} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Promedio mensual: {avgAllPerMonth.toFixed(1)} u.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Prestamos vigentes (ultimos 30 dias)
                </CardTitle>
                <CardDescription>
                  {activeAll.reduce((a, m) => a + m.cantidad, 0)} unidades activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl font-semibold">
                  {activeAll.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Movimientos de salida recientes
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Prestamos con retraso
                </CardTitle>
                <CardDescription>Total: {totalOverdueAll} unidades</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={allOverdueMonthly} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Promedio mensual de retrasos: {avgOverdueAllPerMonth.toFixed(1)} u.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ultimos prestamos globales */}
          <Card>
            <CardHeader>
              <CardAction>
                <Button
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                  render={<Link href="/transacciones" />}
                >
                  Ver todos
                  <IconArrowRight />
                </Button>
              </CardAction>
              <CardTitle className="flex items-center gap-2">
                <IconArrowsExchange className="size-4 text-primary" />
                Prestamos recientes
              </CardTitle>
              <CardDescription>Ultimos movimientos de salida</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {allPrestamos.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aun no hay prestamos.
                </p>
              ) : (
                allPrestamos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <IconBook2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {p.maestro.nombre}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.ejecutadoPor.name} ·{' '}
                          {new Date(p.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {p.cantidad} u.
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!isAdmin && (
        <>
          {/* Graficas usuario */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Libros prestados por mes
                </CardTitle>
                <CardDescription>
                  Total desde tu registro: {totalUserLoans} u.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={userMonthly} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Promedio mensual: {avgUserPerMonth.toFixed(1)} u.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconChartBar className="size-4 text-primary" />
                  Retrasos en entregas por mes
                </CardTitle>
                <CardDescription>
                  Total retrasos: {totalOverdueUser} u.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={userOverdueMonthly} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Promedio mensual de retrasos: {avgOverdueUserPerMonth.toFixed(1)} u.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mis prestamos activos */}
          <Card>
            <CardHeader>
              <CardAction>
                <Button
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                  render={<Link href="/transacciones" />}
                >
                  Ver todos
                  <IconArrowRight />
                </Button>
              </CardAction>
              <CardTitle className="flex items-center gap-2">
                <IconArrowsExchange className="size-4 text-primary" />
                Mis prestamos activos
              </CardTitle>
              <CardDescription>Prestamos recientes (ultimos 30 dias)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {prestamos.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-8 text-center">
                  <IconBook2 className="size-8 text-muted-foreground stroke-1" />
                  <div>
                    <p className="text-sm font-medium">
                      No tienes prestamos activos
                    </p>
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">
                      Explora el catalogo y reserva tu proximo titulo.
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
                prestamos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <IconBook2 className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {p.maestro.nombre}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {p.cantidad} u.
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Ultimos titulos (solo admin maybe) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardAction>
              <Button
                nativeButton={false}
                variant="ghost"
                size="sm"
                render={<Link href="/maestros" />}
              >
                Ver todos
                <IconArrowRight />
              </Button>
            </CardAction>
            <CardTitle>Ultimos titulos registrados</CardTitle>
            <CardDescription>
              Altas recientes en el inventario bibliotecario
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.maestrosRecientes.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aun no hay titulos registrados.
              </p>
            )}
            {data.maestrosRecientes.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <IconBook2 className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Por {m.creadoPor.name} ·{' '}
                      {new Date(m.createdAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${claseStock(m.saldo)}`}
                >
                  {m.saldo} en stock
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
