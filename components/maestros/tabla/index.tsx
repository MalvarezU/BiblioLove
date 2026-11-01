'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconBook2,
  IconCalendar,
  IconCheck,
  IconAlertTriangle,
  IconX,
} from '@tabler/icons-react';

type Maestro = {
  id: string;
  nombre: string;
  saldo: number;
  createdAt: Date;
  creadoPor: {
    name: string;
    lastName: string | null;
  };
};

type Props = {
  maestros: Maestro[];
};

// TablaMaestros con buscador interactivo en tiempo real y badges de inventario
export function TablaMaestros({ maestros }: Props) {
  const [busqueda, setBusqueda] = useState('');

  // Filtra los maestros por nombre o persona que lo creo
  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return maestros;
    const term = busqueda.toLowerCase();
    return maestros.filter(
      (m) =>
        m.nombre.toLowerCase().includes(term) ||
        m.creadoPor.name.toLowerCase().includes(term) ||
        (m.creadoPor.lastName && m.creadoPor.lastName.toLowerCase().includes(term))
    );
  }, [maestros, busqueda]);

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de herramientas: buscador y contador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border-b border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Buscar por libro o creador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 bg-slate-950/80 border-slate-700/80 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 h-9"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Mostrando:</span>
          <span className="font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {filtrados.length} de {maestros.length}
          </span>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800/80 bg-slate-950/40 hover:bg-transparent">
              <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold pl-6 w-24">
                Codigo
              </TableHead>
              <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Titulo del Libro / Material
              </TableHead>
              <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold w-40">
                Saldo Disponible
              </TableHead>
              <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
                Registrado Por
              </TableHead>
              <TableHead className="text-slate-400 text-xs uppercase tracking-wider font-semibold pr-6 text-right w-36">
                Fecha de Alta
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length > 0 ? (
              filtrados.map((maestro) => {
                const stockDisponible = maestro.saldo > 5;
                const stockBajo = maestro.saldo > 0 && maestro.saldo <= 5;

                return (
                  <TableRow
                    key={maestro.id}
                    className="border-slate-800/60 hover:bg-slate-800/40 transition-colors"
                  >
                    {/* ID recortado */}
                    <TableCell className="pl-6 font-mono text-xs text-slate-500">
                      <span className="rounded bg-slate-800/80 px-1.5 py-0.5 border border-slate-700/60">
                        {maestro.id.slice(0, 6)}
                      </span>
                    </TableCell>

                    {/* Nombre del libro */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <IconBook2 className="size-4" />
                        </div>
                        <span className="font-medium text-slate-100 text-sm">
                          {maestro.nombre}
                        </span>
                      </div>
                    </TableCell>

                    {/* Saldo con indicador visual */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            stockDisponible
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : stockBajo
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {stockDisponible && <IconCheck className="size-3" />}
                          {stockBajo && <IconAlertTriangle className="size-3" />}
                          {maestro.saldo.toLocaleString('es-CO')} u.
                        </span>
                      </div>
                    </TableCell>

                    {/* Creador */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
                          {maestro.creadoPor.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-300 text-sm">
                          {maestro.creadoPor.name} {maestro.creadoPor.lastName ?? ''}
                        </span>
                      </div>
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="pr-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <IconCalendar className="size-3 text-slate-500" />
                        {new Date(maestro.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <IconBook2 className="size-8 text-slate-600 stroke-1" />
                    <p className="text-sm font-medium text-slate-400">
                      No se encontraron libros
                    </p>
                    <p className="text-xs text-slate-500">
                      {busqueda
                        ? 'Intenta con otro termino de busqueda'
                        : 'El inventario de maestros se encuentra vacio'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
