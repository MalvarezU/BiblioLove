'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from 'cn';

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
    nombre: 'Fantasia',
    descripcion: 'Reinos olvidados, magia antigua y heroes que desafian el destino.',
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
    descripcion: 'Secretos, pistas y giros inesperados hasta la ultima pagina.',
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
    descripcion: 'Del cosmos a la celula: el conocimiento explicado con claridad.',
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
    descripcion: 'Cronicas de civilizaciones, batallas y personajes que forjaron el mundo.',
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
    descripcion: 'Cuentos e ilustraciones para despertar la imaginacion mas pequena.',
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
    nombre: 'Poesia',
    descripcion: 'Versos que respiran: emociones contadas con musica y pausa.',
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
    descripcion: 'Ideas para pensar el mundo: reflexion, critica y cultura.',
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

function Estante({ genero }: { genero: Genero }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <span
            className="size-3 rounded-sm ring-1 ring-black/10"
            style={{ backgroundColor: genero.libros[0].color }}
            aria-hidden
          />
          <h3 className="font-heading text-xl font-semibold">{genero.nombre}</h3>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {genero.descripcion}
        </p>
      </div>

      {/* Repisa con lomos de libros */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex min-h-[150px] items-end justify-center gap-1.5 px-2">
          {genero.libros.map((libro, i) => (
            <div
              key={i}
              className={cn(
                'relative rounded-t-[2px] border border-black/10 shadow-sm transition-all duration-500 ease-out motion-reduce:transition-none',
                visible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0'
              )}
              style={{
                width: libro.ancho,
                height: libro.alto,
                backgroundColor: libro.color,
                transitionDelay: visible ? `${i * 70}ms` : '0ms',
              }}
            >
              <span className="absolute inset-x-1 top-4 h-px bg-white/25" />
              <span className="absolute inset-x-1 bottom-6 h-px bg-black/15" />
            </div>
          ))}
        </div>
        {/* Repisa de madera */}
        <div className="mt-1.5 h-2.5 rounded-sm bg-[#9a7554] dark:bg-[#574028]" />
        <div className="mx-auto h-1.5 w-[94%] rounded-b-sm bg-[#8a6a4f]/70 dark:bg-[#4a3828]/70" />
      </div>
    </div>
  );
}

// Recorrido por las estanterias: cada estante presenta un genero literario
// y sus lomos aparecen cuando el estante entra en pantalla.
export function ShelfTour() {
  return (
    <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
      {generos.map((genero) => (
        <Estante key={genero.nombre} genero={genero} />
      ))}
    </div>
  );
}
