import { Skeleton } from '@/components/ui/skeleton';

// Estado de carga para el catalogo de libros mientras se obtienen los datos
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
