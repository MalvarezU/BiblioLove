import { Skeleton } from '@/components/ui/skeleton';

// Estado de carga para el dashboard mientras se obtienen las estadisticas
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64 bg-slate-800" />
        <Skeleton className="h-4 w-96 bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg bg-slate-800" />
        ))}
      </div>
    </div>
  );
}

