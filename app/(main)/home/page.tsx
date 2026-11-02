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

// Historial de prestamos (salidas de inventario) del usuario en sesion
async function getPrestamosUsuario(userId: string) {
  return prisma.movimiento.findMany({
    where: { tipo: 'SALIDA', userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      cantidad: true,
      createdAt: true,
      maestro: { select: { nombre: true } },
    },
  });
}

function claseStock(saldo: number) {
  if (saldo > 5) return 'bg-success/10 text-success';
  if (saldo > 0) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  const [data, usuario, prestamos] = await Promise.all([
    getDashboardData(),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, role: true, email: true },
        })
      : Promise.resolve(null),
    userId ? getPrestamosUsuario(userId) : Promise.resolve([]),
  ]);

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
            Panel general de control bibliotecario. Monitorea titulos en el
            catalogo, existencias y cuentas activas.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/maestros" />}>
          Ver catalogo
          <IconArrowRight />
        </Button>
      </div>

      {/* Metricas */}
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

      {/* Historial de prestamos */}
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
            Mis prestamos
          </CardTitle>
          <CardDescription>Historial de tus ultimos prestamos</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {prestamos.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <IconBook2 className="size-8 text-muted-foreground stroke-1" />
              <div>
                <p className="text-sm font-medium">
                  Aun no has realizado prestamos
                </p>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Explora el catalogo de libros y reserva tu proximo titulo para
                  comenzar tu historial de lecturas.
                </p>
              </div>
              <Button
                nativeButton={false}
                variant="outline"
                size="sm"
                render={<Link href="/maestros" />}
              >
                Explorar catalogo
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

      {/* Ultimos titulos */}
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
    </div>
  );
}
