import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  IconBook2,
  IconUsers,
  IconArrowRight,
  IconPackage,
  IconShieldCheck,
  IconClock,
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

export default async function HomePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  const [data, usuario] = await Promise.all([
    getDashboardData(),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, role: true, email: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Banner superior de bienvenida con diseño moderno */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-xs font-mono text-blue-400">
                <IconShieldCheck className="size-3.5" />
                Sesion activa: {usuario?.role ?? 'USER'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              Bienvenido de nuevo, {usuario?.name ?? 'Usuario'}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Panel general de control bibliotecario. Monitorea libros en inventario, existencias actuales y cuentas activas.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/maestros"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-900/30 hover:bg-blue-500 transition-colors"
            >
              <IconBook2 className="size-4" />
              <span>Ver Maestros</span>
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Brillo decorativo */}
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Tarjetas de metricas clave */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metrica: Libros / Maestros */}
        <div className="group rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Titulos Registrados
            </span>
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <IconBook2 className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-100">{data.totalMaestros}</p>
            <span className="text-xs text-slate-500 font-mono">maestros</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Libros y materiales en catalogo
          </p>
        </div>

        {/* Metrica: Total de Unidades en Inventario */}
        <div className="group rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Unidades Disponibles
            </span>
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <IconPackage className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-100">{data.totalUnidades}</p>
            <span className="text-xs text-slate-500 font-mono">ejemplares</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Saldo acumulado en inventario
          </p>
        </div>

        {/* Metrica: Usuarios */}
        <div className="group rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-950/30">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Usuarios Activos
            </span>
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
              <IconUsers className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-100">{data.totalUsuarios}</p>
            <span className="text-xs text-slate-500 font-mono">cuentas</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Administradores y usuarios estándar
          </p>
        </div>
      </div>

      {/* Seccion: Ultimos Maestros Registrados */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Maestros Recientes
            </h2>
            <p className="text-xs text-slate-400">
              Ultimos titulos dados de alta en el inventario bibliotecario
            </p>
          </div>
          <Link
            href="/maestros"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            Ver todos
            <IconArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.maestrosRecientes.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/50 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-blue-600/15 text-blue-400 shrink-0 font-mono text-xs font-bold">
                  LIB
                </div>
                <div className="space-y-0.5 max-w-xs sm:max-w-md">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {m.nombre}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Por {m.creadoPor.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IconClock className="size-3" />
                      {new Date(m.createdAt).toLocaleDateString('es-CO')}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                    m.saldo > 5
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : m.saldo > 0
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-red-500/15 text-red-300 border border-red-500/30'
                  }`}
                >
                  {m.saldo} en stock
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
