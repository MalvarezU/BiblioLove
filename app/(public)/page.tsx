import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  IconBook2,
  IconHeartFilled,
  IconStarFilled,
} from '@tabler/icons-react';
import { ShelfTour } from '@/components/landing/shelf-tour';

function compacto(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')}k`;
  return String(n);
}

async function getLandingStats() {
  const [libros, lectores, prestamos] = await Promise.all([
    prisma.maestro.count({ where: { deleted: false } }),
    prisma.user.count({ where: { deleted: false } }),
    prisma.movimiento.count({ where: { tipo: 'SALIDA' } }),
  ]);
  return { libros, lectores, prestamos };
}

// Landing publica en "/": con sesion activa se redirige al dashboard.
export default async function LandingPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('session_user_id')?.value) {
    redirect('/home');
  }

  const stats = await getLandingStats();

  return (
    <div>
      {/* Banner principal */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-background via-background to-muted/30">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <IconHeartFilled className="absolute -left-10 top-24 size-40 -rotate-12 text-primary/[0.04]" />
          <IconHeartFilled className="absolute right-10 top-10 size-16 rotate-12 text-primary/[0.06]" />
          <IconHeartFilled className="absolute bottom-10 left-1/3 size-24 -rotate-6 text-primary/[0.05]" />
          <div className="absolute -right-24 top-1/2 size-96 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl" />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pt-8 pb-16 md:pt-12 md:pb-20 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Texto */}
          <div>
            <h1 className="font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Un lugar para{' '}
              <span className="italic text-primary">amar más la lectura</span>.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Descubre, guarda y comparte los libros que te roban el corazón.
              Tu estantería personal, más cálida que nunca.
            </p>

            <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-5 border-t border-border/70 pt-6">
              <div>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {compacto(stats.libros)}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Libros
                </p>
              </div>
              <div>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {compacto(stats.lectores)}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Lectores activos
                </p>
              </div>
              <div>
                <p className="font-heading text-3xl font-semibold tracking-tight">
                  {compacto(stats.prestamos)}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Préstamos con amor
                </p>
              </div>
            </div>
          </div>

          {/* Libro destacado */}
          <div className="relative mx-auto flex w-full max-w-md justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-2xl" aria-hidden />

              <div className="relative w-64 rotate-[-5deg] overflow-hidden rounded-l-sm rounded-r-2xl shadow-2xl shadow-primary/20 transition-transform duration-500 hover:rotate-[-2deg] sm:w-72 md:w-80">
                <div
                  className="aspect-[2/3]"
                  style={{
                    background:
                      'linear-gradient(145deg, #d48a34 0%, #b96a22 45%, #8a4714 100%)',
                  }}
                >
                  <div className="flex h-full flex-col justify-between p-7 text-[#fff7e8]">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#ffe6b8]/80">
                      <span>BiblioLove</span>
                      <IconHeartFilled className="size-4 text-[#ffe6b8]/80" />
                    </div>

                    <div className="text-center">
                      <p className="font-heading text-3xl font-semibold leading-tight">
                        Cien años de soledad
                      </p>
                      <div className="mx-auto mt-4 h-px w-12 bg-[#ffe6b8]/60" />
                      <p className="mt-4 text-[10px] uppercase tracking-[0.24em] text-[#ffe6b8]/80">
                        Gabriel García Márquez
                      </p>
                    </div>

                    <div className="flex items-center justify-center">
                      <IconBook2 className="size-5 text-[#ffe6b8]/60" />
                    </div>
                  </div>
                </div>

                {/* Lomo */}
                <div className="absolute inset-y-0 left-0 w-3 bg-black/20" aria-hidden />
                <div className="absolute inset-y-0 left-3 w-px bg-white/20" aria-hidden />
              </div>

              {/* Valoración */}
              <div className="absolute -left-2 top-16 rounded-xl border border-border bg-card px-4 py-2.5 shadow-lg sm:-left-12">
                <div className="flex items-center gap-1 text-primary">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <IconStarFilled key={i} className="size-3.5" />
                  ))}
                </div>
                <p className="mt-1 text-xs font-semibold">4.8 · 2.3k reseñas</p>
              </div>

              {/* Notificación */}
              <div className="absolute -right-1 bottom-16 flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg sm:-right-8">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <IconHeartFilled className="size-4" />
                </span>
                <div className="text-xs">
                  <p className="font-semibold">Luciana</p>
                  <p className="text-muted-foreground">terminó este libro ♥</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recorrido inmersivo por las estanterías */}
      <ShelfTour />

    </div>
  );
}
