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

function claseStock(saldo: number) {
  if (saldo > 5) return 'bg-success/10 text-success';
  if (saldo > 0) return 'bg-warning/10 text-warning';
  return 'bg-destructive/10 text-destructive';
}

// TablaMaestros con buscador interactivo en tiempo real y badges de inventario
export function TablaMaestros({ maestros }: Props) {
  const [busqueda, setBusqueda] = useState('');

  // Filtra los libros por nombre o persona que lo registro
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
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por libro o creador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              aria-label="Limpiar busqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Mostrando:</span>
          <span className="font-medium text-foreground">
            {filtrados.length} de {maestros.length}
          </span>
        </div>
      </div>

      {/* Tabla de registros */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6 w-24">Codigo</TableHead>
              <TableHead>Titulo del Libro / Material</TableHead>
              <TableHead className="w-40">Saldo Disponible</TableHead>
              <TableHead>Registrado Por</TableHead>
              <TableHead className="w-36 pr-6 text-right">Fecha de Alta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length > 0 ? (
              filtrados.map((maestro) => {
                const stockDisponible = maestro.saldo > 5;
                const stockBajo = maestro.saldo > 0 && maestro.saldo <= 5;

                return (
                  <TableRow key={maestro.id}>
                    <TableCell className="pl-6">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {maestro.id.slice(0, 6)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <IconBook2 className="size-4" />
                        </span>
                        <span className="text-sm font-medium">{maestro.nombre}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${claseStock(maestro.saldo)}`}
                      >
                        {stockDisponible && <IconCheck className="size-3" />}
                        {stockBajo && <IconAlertTriangle className="size-3" />}
                        {maestro.saldo.toLocaleString('es-CO')} u.
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                          {maestro.creadoPor.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm">
                          {maestro.creadoPor.name} {maestro.creadoPor.lastName ?? ''}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <IconCalendar className="size-3" />
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
                <TableCell colSpan={5} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <IconBook2 className="size-8 stroke-1" />
                    <p className="text-sm font-medium">No se encontraron libros</p>
                    <p className="text-xs">
                      {busqueda
                        ? 'Intenta con otro termino de busqueda'
                        : 'El catalogo se encuentra vacio'}
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
