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
  const [hover, setHover] = React.useState<number | null>(null);

  const data = React.useMemo(() => {
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
    return dias.map((dia) => {
      acum += porDia.get(dia) ?? 0;
      return { dia, valor: acum };
    });
  }, [movimientos, saldoActual]);

  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>Sin movimientos para graficar</span>
        <span className="text-xs">Agrega un movimiento para ver la evolucion del saldo.</span>
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const valores = data.map((d) => d.valor);
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;

  const xs = data.map((_, i) => padding.left + (i / Math.max(data.length - 1, 1)) * plotW);
  const ys = data.map((d) => padding.top + plotH - ((d.valor - min) / range) * plotH);

  const linePath = data.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
  const areaPath = `${linePath} L ${xs[xs.length - 1]} ${padding.top + plotH} L ${xs[0]} ${padding.top + plotH} Z`;

  const hovered = hover !== null ? data[hover] : null;
  const hx = hover !== null ? xs[hover] : 0;
  const hy = hover !== null ? ys[hover] : 0;

  const fmt = (n: number) => n.toLocaleString('es-CO');

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * width;
            let nearest = 0;
            let best = Infinity;
            xs.forEach((px, i) => {
              const d = Math.abs(px - x);
              if (d < best) {
                best = d;
                nearest = i;
              }
            });
            setHover(nearest);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" className="text-primary" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" className="text-primary" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const y = padding.top + plotH * (1 - t);
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}

          <line x1={padding.left} y1={padding.top + plotH} x2={width - padding.right} y2={padding.top + plotH} stroke="currentColor" className="text-border" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotH} stroke="currentColor" className="text-border" strokeWidth="1" />

          <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmt(max)}</text>
          <text x={padding.left - 6} y={padding.top + plotH + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{fmt(min)}</text>

          <path d={areaPath} fill="url(#areaGrad)" />

          <path d={linePath} fill="none" stroke="currentColor" className="text-primary" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {data.map((_, i) => (
            <circle
              key={i}
              cx={xs[i]}
              cy={ys[i]}
              r={hover === i ? 5 : 3}
              fill="currentColor"
              className="text-primary transition-all"
            />
          ))}

          {hover !== null && (
            <line
              x1={hx}
              y1={padding.top}
              x2={hx}
              y2={padding.top + plotH}
              stroke="currentColor"
              className="text-primary"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.5"
            />
          )}
        </svg>

        {hover !== null && hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md"
            style={{
              left: `${(hx / width) * 100}%`,
              top: `${(hy / height) * 100}%`,
              transform: 'translate(-50%, -120%)',
            }}
          >
            <div className="font-medium text-foreground">{hovered.dia}</div>
            <div className="font-mono text-primary">{fmt(hovered.valor)} u.</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          Saldo diario
        </span>
        <span>Puntos: <span className="font-mono text-foreground">{data.length}</span></span>
        <span>Min: <span className="font-mono text-foreground">{fmt(min)}</span></span>
        <span>Max: <span className="font-mono text-foreground">{fmt(max)}</span></span>
        <span>Actual: <span className="font-mono text-foreground">{fmt(data[data.length - 1].valor)}</span></span>
      </div>
    </div>
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
                Agregar movimiento — {maestroSeleccionado?.nombre ?? ''}
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
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Saldo disponible: <span className="font-mono font-semibold text-foreground">{maestroSeleccionado?.saldo ?? 0}</span>
                {tipo === 'SALIDA' && cantidad > (maestroSeleccionado?.saldo ?? 0) && (
                  <span className="ml-2 text-destructive">La cantidad supera el saldo disponible.</span>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              {!submitting ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={crearMovimiento}
                    disabled={tipo === 'SALIDA' && cantidad > (maestroSeleccionado?.saldo ?? 0)}
                  >
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
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="hidden sm:table-cell pl-6">ID</TableHead>
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
                      <TableCell className="hidden sm:table-cell pl-6 font-mono text-xs text-muted-foreground">{m.id.slice(0, 8)}</TableCell>
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
