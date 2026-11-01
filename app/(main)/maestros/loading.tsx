import { Skeleton } from '@/components/ui/skeleton';

// Estado de carga para la pagina de maestros mientras se obtienen los datos
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-36 bg-slate-800" />
          <Skeleton className="h-4 w-64 bg-slate-800" />
        </div>
        <Skeleton className="h-9 w-36 bg-slate-800" />
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden p-4">
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

