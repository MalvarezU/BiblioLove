import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { IconArrowDown, IconArrowRight, IconBook2 } from '@tabler/icons-react';
import { ShelfTour } from '@/components/landing/shelf-tour';

// Landing publica en "/": con sesion activa se redirige al dashboard.
export default async function LandingPage() {
  const cookieStore = await cookies();
  if (cookieStore.get('session_user_id')?.value) {
    redirect('/home');
  }

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-14 text-center md:pt-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <IconBook2 className="size-3.5 text-primary" />
          Biblioteca digital
        </span>
        <h1 className="font-heading mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
          BiblioLove
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Explora nuestro catalogo, descubre nuevos titulos y vive la gestion
          de tu biblioteca con el calidez de una tarde de otoño.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
            Iniciar sesion
            <IconArrowRight />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="#estanterias" />}
          >
            Recorrer las estanterias
            <IconArrowDown />
          </Button>
        </div>
      </section>

      {/* Recorrido por las estanterias */}
      <section id="estanterias" className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
              Un recorrido por nuestras estanterías
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Cada repisa es un genero esperando por ti. Deslizate y descubre
              que tipo de historias encontraras en las estanterías de BiblioLove.
            </p>
          </div>
          <ShelfTour />
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          ¿Listo para tu proxima lectura?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Inicia sesion para explorar el catalogo completo y administrar tus
          prestamos.
        </p>
        <div className="mt-6">
          <Button size="lg" nativeButton={false} render={<Link href="/login" />}>
            Iniciar sesion
            <IconArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
