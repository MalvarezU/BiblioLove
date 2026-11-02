'use client';

import React from 'react';
import { toast } from 'sonner';
import { IconArrowsExchange, IconPlus, IconChartLine } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Maestro = { id: string; nombre: string; saldo: number };
type Movimiento = {
  id: string;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  createdAt: string;
  ejecutadoPor: { name: string; lastName: string | null };
};

function GraficaSaldos({ movimientos, saldoActual }: { movimientos: Movimiento[]; saldoActual: number }) {
  const puntos = React.useMemo(() => {
    if (movimientos.length === 0) return [];
    const ordenados = [...movimientos].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const netoTotal = ordenados.reduce(
      (acc, m) => acc + (m.tipo === 'ENTRADA' ? m.cantidad : -m.cantidad),
      0
    );
    const base = saldoActual - netoTotal;

    const porDia = new Map<string, number>();
    ordenados.forEach((m) => {
      const dia = new Date(m.createdAt).toISOString().slice(0, 10);
      const delta = m.tipo === 'ENTRADA' ? m.cantidad : -m.cantidad;
      porDia.set(dia, (porDia.get(dia) ?? 0) + delta);
    });

    const dias = Array.from(porDia.keys()).sort();
    let acum = base;
    const pts: { valor: number }[] = [];
    dias.forEach((dia) => {
      acum += porDia.get(dia) ?? 0;
      pts.push({ valor: acum });
    });
    return pts;
  }, [movimientos, saldoActual]);

  if (puntos.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Sin movimientos para graficar
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = 30;
  const valores = puntos.map((p) => p.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;

  const xs = puntos.map((_, i) => padding + (i / Math.max(puntos.length - 1, 1)) * (width - 2 * padding));
  const ys = puntos.map((p) => height - padding - ((p.valor - min) / range) * (height - 2 * padding));
  const path = puntos.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-border" strokeWidth="1" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="currentColor" className="text-border" strokeWidth="1" />
      <path d={path} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2" />
      {puntos.map((p, i) => (
        <circle key={i} cx={xs[i]} cy={ys[i]} r="3" fill="currentColor" className="text-primary" />
      ))}
      <text x={padding} y={14} className="fill-muted-foreground text-[10px]">Max: {max}</text>
      <text x={padding} y={height - 4} className="fill-muted-foreground text-[10px]">Min: {min}</text>
    </svg>
  );
}

export default function TransaccionesPage() {
  const [maestros, setMaestros] = React.useState<Maestro[]>([]);
  const [selected, setSelected] = React.useState<string>('');
  const [movimientos, setMovimientos] = React.useState<Movimiento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingMov, setLoadingMov] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [tipo, setTipo] = React.useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [cantidad, setCantidad] = React.useState<number>(1);

  const sessionUser = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('session_user') || 'null');
    } catch {
      return null;
    }
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/maestros');
        const data = await res.json();
        if (cancelled) return;
        setMaestros(data.maestros || []);
        if (data.maestros?.length && !selected) {
          setSelected(data.maestros[0].id);
        }
      } catch {
        if (!cancelled) toast.error('Error al cargar maestros');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    (async () => {
      setLoadingMov(true);
      try {
        const res = await fetch(`/api/movimientos?maestroId=${selected}`);
        const data = await res.json();
        if (!cancelled) setMovimientos(data.movimientos || []);
      } catch {
        if (!cancelled) toast.error('Error al cargar movimientos');
      } finally {
        if (!cancelled) setLoadingMov(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const maestroSeleccionado = maestros.find((m) => m.id === selected);

  async function crearMovimiento() {
    if (!selected || !sessionUser?.id) {
      toast.error('No hay sesion activa');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/movimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maestroId: selected,
          tipo,
          cantidad,
          userId: sessionUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear movimiento');
      toast.success('Movimiento creado exitosamente');
      setOpen(false);
      setCantidad(1);
      setMaestros((prev) =>
        prev.map((m) =>
          m.id === selected ? { ...m, saldo: data.nuevoSaldo } : m
        )
      );
      // Recargar movimientos
      try {
        const res2 = await fetch(`/api/movimientos?maestroId=${selected}`);
        const data2 = await res2.json();
        setMovimientos(data2.movimientos || []);
      } catch {
        // ignore
      }
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || 'Error al crear movimiento');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconArrowsExchange className="size-5" />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Transacciones
          </h1>
          <p className="text-xs text-muted-foreground">
            Historial de movimientos, prestamos y devoluciones
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Maestro</Label>
        <Select value={selected} onValueChange={(v) => setSelected(v as string)}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Selecciona un maestro" />
          </SelectTrigger>
          <SelectContent>
            {maestros.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nombre} (saldo: {m.saldo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="inline-flex items-center gap-2">
                <IconPlus className="size-4" />
                <span>Agregar movimiento</span>
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-bold">
                Agregar movimiento
              </DialogTitle>
              <DialogDescription className="text-xs">
                Maestro: {maestroSeleccionado?.nombre ?? ''}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo de movimiento</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as 'ENTRADA' | 'SALIDA')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRADA">Entrada</SelectItem>
                    <SelectItem value="SALIDA">Salida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cantidad</Label>
                <Input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              {!submitting ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={crearMovimiento}>
                    Crear movimiento
                  </Button>
                </>
              ) : (
                <Button disabled>
                  <Spinner className="size-4 mr-2" />
                  Guardando...
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Movimientos del maestro seleccionado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="pr-6">Ejecutado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading || loadingMov ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Cargando...</TableCell>
                  </TableRow>
                ) : movimientos.length > 0 ? (
                  movimientos.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="pl-6 font-mono text-xs text-muted-foreground">{m.id.slice(0, 8)}</TableCell>
                      <TableCell className="text-xs">{new Date(m.createdAt).toLocaleString('es-CO')}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${m.tipo === 'ENTRADA' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {m.tipo}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{m.cantidad}</TableCell>
                      <TableCell className="pr-6 text-sm">
                        {m.ejecutadoPor.name} {m.ejecutadoPor.lastName ?? ''}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Sin movimientos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconChartLine className="size-4 text-primary" />
            Evolucion de saldos diarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GraficaSaldos movimientos={movimientos} saldoActual={maestroSeleccionado?.saldo ?? 0} />
        </CardContent>
      </Card>
    </div>
  );
}
