'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';

type Libro = {
  color: string;
  ancho: number;
  alto: number;
};

type Genero = {
  nombre: string;
  descripcion: string;
  libros: Libro[];
};

// Colores apagados armonizados con la paleta otonal de la pagina.
const generos: Genero[] = [
  {
    nombre: 'Fantasía',
    descripcion: 'Reinos olvidados, magia antigua y héroes que desafían el destino.',
    libros: [
      { color: '#6f5a74', ancho: 18, alto: 128 },
      { color: '#7a6a5c', ancho: 14, alto: 112 },
      { color: '#5f6b5a', ancho: 22, alto: 134 },
      { color: '#8a7560', ancho: 16, alto: 106 },
      { color: '#6b5b6e', ancho: 20, alto: 124 },
      { color: '#74625a', ancho: 15, alto: 118 },
      { color: '#65705e', ancho: 19, alto: 98 },
    ],
  },
  {
    nombre: 'Misterio y thriller',
    descripcion: 'Secretos, pistas y giros inesperados hasta la última página.',
    libros: [
      { color: '#4f5b60', ancho: 20, alto: 130 },
      { color: '#5c5348', ancho: 15, alto: 116 },
      { color: '#6b5b4f', ancho: 17, alto: 124 },
      { color: '#46505a', ancho: 22, alto: 108 },
      { color: '#575e5a', ancho: 14, alto: 132 },
      { color: '#53493f', ancho: 19, alto: 102 },
      { color: '#5e6a6d', ancho: 16, alto: 120 },
    ],
  },
  {
    nombre: 'Ciencia',
    descripcion: 'Del cosmos a la célula: el conocimiento explicado con claridad.',
    libros: [
      { color: '#566b70', ancho: 17, alto: 126 },
      { color: '#5f6f63', ancho: 21, alto: 134 },
      { color: '#6b6f5c', ancho: 15, alto: 110 },
      { color: '#4f6167', ancho: 19, alto: 122 },
      { color: '#64726b', ancho: 16, alto: 104 },
      { color: '#58635f', ancho: 23, alto: 130 },
      { color: '#6a756c', ancho: 14, alto: 114 },
    ],
  },
  {
    nombre: 'Historia',
    descripcion: 'Crónicas de civilizaciones, batallas y personajes que forjaron el mundo.',
    libros: [
      { color: '#7a5c4a', ancho: 22, alto: 132 },
      { color: '#8a6b52', ancho: 16, alto: 118 },
      { color: '#6b5344', ancho: 18, alto: 126 },
      { color: '#93705a', ancho: 14, alto: 108 },
      { color: '#84654e', ancho: 20, alto: 134 },
      { color: '#715a48', ancho: 17, alto: 100 },
      { color: '#8f7159', ancho: 15, alto: 120 },
    ],
  },
  {
    nombre: 'Romance',
    descripcion: 'Historias de afecto, encuentros y corazones que se encuentran.',
    libros: [
      { color: '#96686a', ancho: 16, alto: 124 },
      { color: '#a67b6b', ancho: 20, alto: 132 },
      { color: '#8a5f68', ancho: 15, alto: 110 },
      { color: '#a98478', ancho: 18, alto: 126 },
      { color: '#9c7269', ancho: 22, alto: 104 },
      { color: '#8f6a63', ancho: 14, alto: 120 },
      { color: '#a17871', ancho: 17, alto: 114 },
    ],
  },
  {
    nombre: 'Infantil',
    descripcion: 'Cuentos e ilustraciones para despertar la imaginación más pequeña.',
    libros: [
      { color: '#a68855', ancho: 18, alto: 118 },
      { color: '#93855a', ancho: 15, alto: 130 },
      { color: '#b09560', ancho: 21, alto: 106 },
      { color: '#8f7a4d', ancho: 16, alto: 124 },
      { color: '#a08c58', ancho: 19, alto: 112 },
      { color: '#9a8455', ancho: 14, alto: 128 },
      { color: '#ab9260', ancho: 20, alto: 100 },
    ],
  },
  {
    nombre: 'Poesía',
    descripcion: 'Versos que respiran: emociones contadas con música y pausa.',
    libros: [
      { color: '#5f6b55', ancho: 15, alto: 128 },
      { color: '#6b7361', ancho: 18, alto: 112 },
      { color: '#55605a', ancho: 20, alto: 134 },
      { color: '#737861', ancho: 14, alto: 104 },
      { color: '#657058', ancho: 17, alto: 122 },
      { color: '#5c6652', ancho: 22, alto: 116 },
      { color: '#6e7864', ancho: 16, alto: 108 },
    ],
  },
  {
    nombre: 'Ensayo',
    descripcion: 'Ideas para pensar el mundo: reflexión, crítica y cultura.',
    libros: [
      { color: '#6b5b4f', ancho: 21, alto: 130 },
      { color: '#73624f', ancho: 16, alto: 116 },
      { color: '#5c5044', ancho: 18, alto: 124 },
      { color: '#7d6a55', ancho: 15, alto: 106 },
      { color: '#6e6152', ancho: 20, alto: 132 },
      { color: '#655748', ancho: 14, alto: 110 },
      { color: '#75644f', ancho: 19, alto: 120 },
    ],
  },
];

type CategoriaOverlay = {
  texto: string;
  side: 'left' | 'right';
  top: string;
  from: number;
  to: number;
};

// Categorias que aparecen y desaparecen mientras se recorre el pasillo.
const categoriasOverlay: CategoriaOverlay[] = [
  { texto: 'Poesía', side: 'left', top: '16%', from: 0.02, to: 0.11 },
  { texto: 'Terror', side: 'right', top: '30%', from: 0.1, to: 0.19 },
  { texto: 'Ciencia ficción', side: 'left', top: '56%', from: 0.18, to: 0.27 },
  { texto: 'Romance', side: 'right', top: '14%', from: 0.26, to: 0.35 },
  { texto: 'Fantasía', side: 'left', top: '34%', from: 0.34, to: 0.43 },
  { texto: 'Misterio', side: 'right', top: '58%', from: 0.42, to: 0.51 },
  { texto: 'Historia', side: 'left', top: '20%', from: 0.5, to: 0.59 },
  { texto: 'Aventura', side: 'right', top: '36%', from: 0.58, to: 0.67 },
  { texto: 'Filosofía', side: 'left', top: '60%', from: 0.66, to: 0.75 },
  { texto: 'Drama', side: 'right', top: '22%', from: 0.74, to: 0.83 },
];

function opacidadVentana(progress: number, from: number, to: number) {
  const fade = 0.025;
  const entrada = Math.min(1, Math.max(0, (progress - from) / fade));
  const salida = Math.min(1, Math.max(0, (to - progress) / fade));
  return Math.min(entrada, salida);
}

const BAY_WIDTH = 520;
const BAY_COUNT = 14;
const TRAVEL = BAY_WIDTH * 6;
const CORRIDOR_WIDTH = 860;
const WALL_HEIGHT = 460;

function librosDeFila(genero: Genero, fila: number) {
  return Array.from({ length: 24 }, (_, i) => {
    const base = genero.libros[(i + fila * 2) % genero.libros.length];
    return {
      color: base.color,
      ancho: 10 + ((i * 7 + fila * 5) % 9),
      alto: 70 + ((i * 13 + fila * 17) % 42),
    };
  });
}

function WallBay({ genero }: { genero: Genero }) {
  return (
    <div
      className="relative h-full shrink-0 border-r-[6px] border-[#3f2614] bg-[linear-gradient(180deg,#6b4528_0%,#54331c_100%)] shadow-[inset_0_0_40px_rgba(0,0,0,0.55)]"
      style={{ width: BAY_WIDTH }}
    >
      <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,#7a5130,#5a3820)] shadow-md" />
      <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-sm border border-[#2a1a10]/60 bg-[#2a1a10]/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#f0dcc0]">
        {genero.nombre}
      </div>

      <div className="absolute inset-x-3 bottom-2 top-12 flex flex-col justify-end gap-1.5">
        {[0, 1, 2].map((fila) => (
          <div
            key={fila}
            className="relative flex h-[118px] items-end gap-[2px] overflow-hidden border-b-[8px] border-[#8a5a33] bg-[#24160d]/70 px-2 shadow-[inset_0_6px_14px_rgba(0,0,0,0.45)]"
          >
            {librosDeFila(genero, fila).map((libro, i) => (
              <div
                key={i}
                className="relative shrink-0 rounded-t-[1px] border border-black/20"
                style={{
                  width: libro.ancho,
                  height: libro.alto,
                  backgroundColor: libro.color,
                }}
              >
                <span className="absolute inset-x-[1px] top-2 h-px bg-white/20" />
                <span className="absolute inset-x-[1px] bottom-3 h-px bg-black/20" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CorridorWall({ side, offset }: { side: 'left' | 'right'; offset: number }) {
  const isLeft = side === 'left';
  const bays = Array.from({ length: BAY_COUNT }, (_, i) => generos[i % generos.length]);

  return (
    <div
      className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
      style={{
        width: BAY_WIDTH * BAY_COUNT,
        height: WALL_HEIGHT,
        transform: `translate(-50%, -50%) translateX(${isLeft ? -CORRIDOR_WIDTH / 2 : CORRIDOR_WIDTH / 2}px) rotateY(${isLeft ? 90 : -90}deg)`,
      }}
    >
      <div
        className="flex h-full will-change-transform [transform-style:preserve-3d]"
        style={{ transform: `translateX(${isLeft ? -offset : offset}px)` }}
      >
        {bays.map((genero, i) => (
          <WallBay key={`${side}-${i}`} genero={genero} />
        ))}
      </div>
    </div>
  );
}

function ReadingRoomBack({ z }: { z: number }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
      style={{
        width: CORRIDOR_WIDTH,
        height: WALL_HEIGHT,
        transform: `translate(-50%, -50%) translateZ(${z}px)`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden border-8 border-[#3f2614] bg-[linear-gradient(180deg,#d9bb8c_0%,#c19c6a_60%,#9c7448_100%)] shadow-[0_0_80px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-6 bg-[#6b4528]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[#5a3820]" />
        <div className="absolute inset-x-0 bottom-16 h-2 bg-[#3f2614]/60" />

        {/* Ventana de la sala de lectura */}
        <div className="absolute left-1/2 top-10 h-52 w-72 -translate-x-1/2 border-[10px] border-[#6b4528] bg-[linear-gradient(180deg,#ffe0a8_0%,#e3a95e_55%,#b97636_100%)] shadow-[inset_0_0_50px_rgba(255,230,180,0.55)]">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="border-r-4 border-b-4 border-[#6b4528]/80" />
            <div className="border-b-4 border-[#6b4528]/80" />
            <div className="border-r-4 border-[#6b4528]/80" />
            <div />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#7a4a26]/40" />
        </div>

        {/* Lamparas de pared */}
        {[14, 86].map((left) => (
          <div
            key={left}
            className="absolute top-24 -translate-x-1/2"
            style={{ left: `${left}%` }}
          >
            <div className="mx-auto size-3 rounded-full bg-[#ffe6b8] shadow-[0_0_22px_9px_rgba(255,220,150,0.55)]" />
            <div className="mx-auto h-9 w-1 bg-[#6b4528]" />
          </div>
        ))}

        {/* Cuadros */}
        <div className="absolute left-10 top-16 h-20 w-16 border-4 border-[#6b4528] bg-[#8a5a33]">
          <div className="m-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] bg-[#b98a5a]" />
        </div>
        <div className="absolute right-10 top-16 h-20 w-16 border-4 border-[#6b4528] bg-[#8a5a33]">
          <div className="m-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] bg-[#a67b4e]" />
        </div>
      </div>
    </div>
  );
}

function ReadingTable({ x, z }: { x: number; z: number }) {
  const patas = [
    [-100, -48],
    [100, -48],
    [-100, 48],
    [100, 48],
  ];

  return (
    <div
      className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
      style={{ transform: `translate(-50%, -50%) translate3d(${x}px, 150px, ${z}px)` }}
    >
      {/* Tablero */}
      <div
        className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
        style={{
          width: 240,
          height: 130,
          transform: 'translate(-50%, -50%) rotateX(90deg)',
        }}
      >
        <div className="h-full w-full rounded-sm bg-[linear-gradient(180deg,#a9743f,#7a4a26)] shadow-[0_0_24px_rgba(0,0,0,0.5)]" />
      </div>

      {/* Canto frontal */}
      <div
        className="absolute left-1/2 top-1/2 h-3 w-[240px]"
        style={{ transform: 'translate(-50%, -50%) translate3d(0, 6px, 65px)' }}
      >
        <div className="h-full w-full bg-[#5a3820]" />
      </div>

      {/* Patas */}
      {patas.map(([lx, lz], i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 h-20 w-1.5"
          style={{ transform: `translate(-50%, -50%) translate3d(${lx}px, 40px, ${lz}px)` }}
        >
          <div className="h-full w-full bg-[#4a2f1b]" />
        </div>
      ))}

      {/* Libros sobre la mesa */}
      {[
        { x: -70, z: -20, color: '#6f5a74', h: 18, w: 6 },
        { x: -58, z: -20, color: '#5f6b5a', h: 16, w: 5 },
        { x: -48, z: -20, color: '#8a7560', h: 20, w: 7 },
      ].map((libro, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: libro.w,
            height: libro.h,
            backgroundColor: libro.color,
            transform: `translate(-50%, -50%) translate3d(${libro.x}px, -12px, ${libro.z}px)`,
          }}
        />
      ))}
    </div>
  );
}

function Chair({
  x,
  z,
  rotation = 0,
}: {
  x: number;
  z: number;
  rotation?: number;
}) {
  const patas = [
    [-22, -22],
    [22, -22],
    [-22, 22],
    [22, 22],
  ];

  return (
    <div
      className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
      style={{ transform: `translate(-50%, -50%) translate3d(${x}px, 170px, ${z}px) rotateY(${rotation}deg)` }}
    >
      {/* Asiento */}
      <div
        className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
        style={{ width: 56, height: 56, transform: 'translate(-50%, -50%) rotateX(90deg)' }}
      >
        <div className="h-full w-full rounded-sm bg-[#7a4a26] shadow-[0_0_16px_rgba(0,0,0,0.4)]" />
      </div>

      {/* Respaldo */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: 56,
          height: 64,
          transform: 'translate(-50%, -50%) translate3d(0, -32px, -26px)',
        }}
      >
        <div className="h-full w-full rounded-sm bg-[#7a4a26]" />
      </div>

      {/* Patas */}
      {patas.map(([lx, lz], i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 h-[60px] w-1"
          style={{ transform: `translate(-50%, -50%) translate3d(${lx}px, 30px, ${lz}px)` }}
        >
          <div className="h-full w-full bg-[#4a2f1b]" />
        </div>
      ))}
    </div>
  );
}

function ReadingRoom({ z }: { z: number }) {
  return (
    <>
      <ReadingRoomBack z={z} />

      {/* Alfombra */}
      <div
        className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
        style={{
          width: 620,
          height: 1100,
          transform: `translate(-50%, -50%) translate3d(0, 229px, ${z + 550}px) rotateX(90deg)`,
        }}
      >
        <div className="h-full w-full rounded-[45%] border-[6px] border-[#7a1f32]/40 bg-[#8a2a3f]/20" />
      </div>

      <ReadingTable x={-140} z={z + 380} />
      <Chair x={-140} z={z + 270} />
      <Chair x={-140} z={z + 490} rotation={180} />

      <ReadingTable x={150} z={z + 720} />
      <Chair x={60} z={z + 720} rotation={90} />
      <Chair x={240} z={z + 720} rotation={-90} />
    </>
  );
}

// Recorrido inmersivo: un pasillo 3D de estanterias que avanza al hacer scroll
// hacia abajo y retrocede al hacer scroll hacia arriba. Sin textos superpuestos.
export function ShelfTour() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const reduceMotion = useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) {
          setProgress(0);
          return;
        }
        const p = Math.min(1, Math.max(0, -rect.top / total));
        setProgress(p);
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const offset = reduceMotion ? 0 : progress * TRAVEL;
  const backZ = -BAY_WIDTH * (BAY_COUNT / 2) + offset;
  const fade = Math.min(1, Math.max(0, (progress - 0.9) / 0.1));

  return (
    <section
      ref={sectionRef}
      id="estanterias"
      className="relative h-[900vh] border-y border-border/60 bg-[#eadfce] dark:bg-[#140d08]"
    >
      <p className="sr-only">
        Recorrido visual por estanterías de fantasía, misterio, ciencia,
        historia, romance, literatura infantil, poesía y ensayo.
      </p>

      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ opacity: 1 - fade }}>
          <div
            className="absolute inset-0"
            style={{ perspective: '1100px', perspectiveOrigin: '50% 48%' }}
          >
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            {/* Piso de madera */}
            <div
              className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
              style={{
                width: CORRIDOR_WIDTH,
                height: 9000,
                transform: 'translate(-50%, -50%) translateY(230px) rotateX(90deg)',
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #6b4528 0 46px, #5a3820 46px 50px)',
                  backgroundPositionY: `${progress * 900}px`,
                }}
              />
              <div className="absolute inset-y-0 left-1/2 w-52 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(116,28,48,0.55),transparent)]" />
            </div>

            {/* Techo */}
            <div
              className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
              style={{
                width: CORRIDOR_WIDTH,
                height: 9000,
                transform: 'translate(-50%, -50%) translateY(-230px) rotateX(90deg)',
              }}
            >
              <div className="h-full w-full bg-[#2a1a10]" />
            </div>

            {/* Paredes de estanterias */}
            <CorridorWall side="left" offset={offset} />
            <CorridorWall side="right" offset={offset} />

            {/* Sala de lectura al final del pasillo */}
            <ReadingRoom z={backZ} />
            </div>
          </div>

          {/* Ambiente y viñeta */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(20,13,8,0.45)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#140d08]/50 to-transparent"
            aria-hidden
          />
        </div>

        {/* Categorias grandes que aparecen y desaparecen */}
        <div
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          style={{ opacity: 1 - fade }}
          aria-hidden
        >
          {categoriasOverlay.map((categoria) => {
            const visibilidad = opacidadVentana(progress, categoria.from, categoria.to);
            return (
              <div
                key={categoria.texto}
                className={`absolute w-[58%] md:w-[42%] ${
                  categoria.side === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{
                  top: categoria.top,
                  left: categoria.side === 'left' ? '5%' : undefined,
                  right: categoria.side === 'right' ? '5%' : undefined,
                  opacity: visibilidad,
                  transform: `translateY(${(1 - visibilidad) * 14}px)`,
                }}
              >
                <span className="font-heading text-3xl font-semibold tracking-tight text-[#f7efe3] drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] sm:text-4xl md:text-6xl lg:text-7xl">
                  {categoria.texto}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cierre: la imagen se desvanece y aparece el acceso */}
        <div
          className="absolute inset-0 z-20 flex items-center justify-center px-6"
          style={{
            opacity: fade,
            pointerEvents: fade > 0.85 ? 'auto' : 'none',
          }}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-border/70 bg-background/85 p-8 text-center shadow-2xl backdrop-blur-md"
            style={{ transform: `translateY(${(1 - fade) * 18}px)` }}
          >
            <h2 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
              Explora muchas más
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Inicia sesión para explorar el catálogo completo y administrar tus
              préstamos.
            </p>
            <div className="mt-6">
              <Button
                size="lg"
                className="rounded-full px-6"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Iniciar sesión
                <IconArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
