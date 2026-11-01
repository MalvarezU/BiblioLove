import { IconArrowsExchange, IconClock } from '@tabler/icons-react';

export default function TransaccionesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Encabezado */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/20">
          <IconArrowsExchange className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Transacciones de Inventario
          </h1>
          <p className="text-xs text-slate-400">
            Historial de movimientos, prestamos y devoluciones de libros
          </p>
        </div>
      </div>

      {/* Contenedor principal */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-12 text-center backdrop-blur-sm shadow-xl flex flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-slate-800 text-slate-500 border border-slate-700">
          <IconClock className="size-6" />
        </div>
        <p className="text-sm font-medium text-slate-300">
          Modulo de Transacciones
        </p>
        <p className="text-xs text-slate-500 max-w-sm">
          Este modulo esta reservado para el registro de entradas y salidas de inventario de los libros.
        </p>
      </div>
    </div>
  );
}
