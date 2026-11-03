import { prisma } from '../lib/prisma';

function diasAtras(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function diasAdelante(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

const categoriasBase = [
  'literatura infantil',
  'literatura universal',
  'literatura latinoamericana',
  'clásicos',
];

const generosBase = [
  'romance',
  'drama',
  'ciencia ficción',
  'terror',
  'poesía',
  'fantasía',
  'misterio',
  'historia',
  'aventura',
  'ensayo',
  'realismo mágico',
];

const autoresBase = [
  { name: 'Gabriel', lastName: 'García Márquez', biography: 'Escritor colombiano, premio Nobel de Literatura.' },
  { name: 'Julio', lastName: 'Cortázar', biography: 'Escritor argentino, figura del boom latinoamericano.' },
  { name: 'Isabel', lastName: 'Allende', biography: 'Escritora chilena de narrativa contemporánea.' },
  { name: 'Antoine', lastName: 'de Saint-Exupéry', biography: 'Escritor y aviador francés, autor de El Principito.' },
  { name: 'Jane', lastName: 'Austen', biography: 'Novelista británica de la época georgiana.' },
  { name: 'George', lastName: 'Orwell', biography: 'Escritor británico, autor de 1984 y Rebelión en la granja.' },
  { name: 'Mary', lastName: 'Shelley', biography: 'Escritora británica, precursora de la ciencia ficción.' },
  { name: 'Franz', lastName: 'Kafka', biography: 'Escritor checo de lengua alemana.' },
  { name: 'Pablo', lastName: 'Neruda', biography: 'Poeta chileno, premio Nobel de Literatura.' },
  { name: 'Umberto', lastName: 'Eco', biography: 'Escritor y semiólogo italiano.' },
  { name: 'Yuval Noah', lastName: 'Harari', biography: 'Historiador y escritor israelí.' },
];

const librosBase = [
  { title: 'Cien años de soledad', category: 'literatura latinoamericana', genre: 'realismo mágico', author: 'Gabriel García Márquez', publisher: 'Sudamericana', copies: 4 },
  { title: 'El amor en los tiempos del cólera', category: 'literatura latinoamericana', genre: 'romance', author: 'Gabriel García Márquez', publisher: 'Oveja Negra', copies: 3 },
  { title: 'Rayuela', category: 'literatura latinoamericana', genre: 'drama', author: 'Julio Cortázar', publisher: 'Sudamericana', copies: 2 },
  { title: 'La casa de los espíritus', category: 'literatura latinoamericana', genre: 'drama', author: 'Isabel Allende', publisher: 'Plaza & Janés', copies: 3 },
  { title: 'El principito', category: 'literatura infantil', genre: 'fantasía', author: 'Antoine de Saint-Exupéry', publisher: 'Reynal & Hitchcock', copies: 5 },
  { title: 'Orgullo y prejuicio', category: 'clásicos', genre: 'romance', author: 'Jane Austen', publisher: 'T. Egerton', copies: 3 },
  { title: '1984', category: 'literatura universal', genre: 'ciencia ficción', author: 'George Orwell', publisher: 'Secker & Warburg', copies: 4 },
  { title: 'Frankenstein', category: 'clásicos', genre: 'terror', author: 'Mary Shelley', publisher: 'Lackington', copies: 2 },
  { title: 'La metamorfosis', category: 'literatura universal', genre: 'drama', author: 'Franz Kafka', publisher: 'Kurt Wolff', copies: 3 },
  { title: 'Veinte poemas de amor y una canción desesperada', category: 'literatura latinoamericana', genre: 'poesía', author: 'Pablo Neruda', publisher: 'Nascimento', copies: 2 },
  { title: 'El nombre de la rosa', category: 'literatura universal', genre: 'misterio', author: 'Umberto Eco', publisher: 'Bompiani', copies: 2 },
  { title: 'Sapiens: De animales a dioses', category: 'literatura universal', genre: 'ensayo', author: 'Yuval Noah Harari', publisher: 'Debate', copies: 3 },
];

async function main() {
  console.log('Iniciando seed de BiblioLove...');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: { role: 'ADMIN', enabled: true, deleted: false },
    create: {
      name: 'Admin',
      lastName: 'BiblioLove',
      email: 'admin@biblioteca.com',
      password: 'admin123',
      address: 'Sede principal',
      phone: '3000000000',
      role: 'ADMIN',
      enabled: true,
      deleted: false,
    },
  });

  const lector = await prisma.user.upsert({
    where: { email: 'lector@biblioteca.com' },
    update: { role: 'USER', enabled: true, deleted: false },
    create: {
      name: 'Lector',
      lastName: 'BiblioLove',
      email: 'lector@biblioteca.com',
      password: 'user123',
      address: 'Calle 1 # 2-3',
      phone: '3000000001',
      role: 'USER',
      enabled: true,
      deleted: false,
    },
  });

  const lectores = [lector];
  for (const [name, lastName, email] of [
    ['Ana María', 'Rodríguez', 'ana@biblioteca.com'],
    ['Carlos', 'Pérez', 'carlos@biblioteca.com'],
    ['Lucía', 'Gómez', 'lucia@biblioteca.com'],
  ]) {
    lectores.push(
      await prisma.user.upsert({
        where: { email },
        update: { enabled: true, deleted: false },
        create: {
          name,
          lastName,
          email,
          password: 'user123',
          address: 'Biblioteca municipal',
          phone: '3000000002',
          role: 'USER',
          enabled: true,
          deleted: false,
        },
      })
    );
  }

  const categorias = new Map<string, number>();
  for (const name of categoriasBase) {
    const existente = await prisma.category.findFirst({ where: { name } });
    const categoria = existente ?? (await prisma.category.create({ data: { name } }));
    categorias.set(name, categoria.id);
  }

  const generos = new Map<string, number>();
  for (const name of generosBase) {
    const existente = await prisma.genre.findFirst({ where: { name } });
    const genero = existente ?? (await prisma.genre.create({ data: { name } }));
    generos.set(name, genero.id);
  }

  const autores = new Map<string, number>();
  for (const autor of autoresBase) {
    const nombreCompleto = `${autor.name} ${autor.lastName}`;
    const existente = await prisma.author.findFirst({
      where: { name: autor.name, lastName: autor.lastName },
    });
    const creado =
      existente ??
      (await prisma.author.create({
        data: {
          name: autor.name,
          lastName: autor.lastName,
          biography: autor.biography,
        },
      }));
    autores.set(nombreCompleto, creado.id);
  }

  for (const libro of librosBase) {
    const existente = await prisma.book.findFirst({ where: { title: libro.title } });
    if (existente) continue;

    const categoryId = categorias.get(libro.category);
    const genreId = generos.get(libro.genre);
    const authorId = autores.get(libro.author);

    if (!categoryId || !genreId || !authorId) {
      console.warn(`No se pudo crear el libro ${libro.title}: faltan relaciones.`);
      continue;
    }

    const book = await prisma.book.create({
      data: {
        title: libro.title,
        categoryId,
        genreId,
        authorId,
      },
    });

    await prisma.item.createMany({
      data: Array.from({ length: libro.copies }, () => ({
        bookId: book.id,
        status: 'Disponible',
        createdById: admin.id,
        publisher: libro.publisher,
      })),
    });
  }

  const items = await prisma.item.findMany({
    where: { deleted: false },
    include: { book: true },
    orderBy: { createdAt: 'asc' },
  });

  const itemPorTitulo = (title: string, index = 0) =>
    items.filter((item) => item.book.title === title)[index];

  if ((await prisma.checkout.count()) === 0 && items.length > 0) {
    const prestamos = [
      {
        item: itemPorTitulo('Cien años de soledad'),
        user: lectores[0],
        checkoutDate: diasAtras(48),
        dueDate: diasAtras(18),
        returnDate: null,
        status: 'Prestado',
      },
      {
        item: itemPorTitulo('1984'),
        user: lectores[1],
        checkoutDate: diasAtras(35),
        dueDate: diasAtras(5),
        returnDate: null,
        status: 'Prestado',
      },
      {
        item: itemPorTitulo('El principito'),
        user: lectores[2],
        checkoutDate: diasAtras(70),
        dueDate: diasAtras(40),
        returnDate: diasAtras(30),
        status: 'Entregado',
      },
      {
        item: itemPorTitulo('Orgullo y prejuicio'),
        user: lectores[3],
        checkoutDate: diasAtras(25),
        dueDate: diasAtras(10),
        returnDate: diasAtras(12),
        status: 'Entregado con retraso',
      },
      {
        item: itemPorTitulo('Rayuela'),
        user: lectores[0],
        checkoutDate: diasAtras(12),
        dueDate: diasAdelante(6),
        returnDate: null,
        status: 'Prestado',
      },
      {
        item: itemPorTitulo('Sapiens: De animales a dioses'),
        user: lectores[2],
        checkoutDate: diasAtras(5),
        dueDate: diasAdelante(15),
        returnDate: null,
        status: 'Prestado',
      },
    ];

    for (const prestamo of prestamos) {
      if (!prestamo.item) continue;
      await prisma.checkout.create({
        data: {
          itemId: prestamo.item.id,
          userId: prestamo.user.id,
          checkoutDate: prestamo.checkoutDate,
          dueDate: prestamo.dueDate,
          returnDate: prestamo.returnDate,
          status: prestamo.status,
        },
      });
      await prisma.item.update({
        where: { id: prestamo.item.id },
        data: { status: prestamo.returnDate ? 'Disponible' : 'En préstamo' },
      });
    }
  }

  if ((await prisma.reservation.count()) === 0 && items.length > 0) {
    const reservas = [
      {
        item: itemPorTitulo('La casa de los espíritus'),
        user: lectores[1],
        issuedDate: diasAtras(4),
        minCheckout: diasAdelante(1),
        maxCheckout: diasAdelante(4),
        status: 'Activa',
      },
      {
        item: itemPorTitulo('El nombre de la rosa'),
        user: lectores[3],
        issuedDate: diasAtras(2),
        minCheckout: diasAdelante(2),
        maxCheckout: diasAdelante(5),
        status: 'Cancelada',
      },
    ];

    for (const reserva of reservas) {
      if (!reserva.item) continue;
      await prisma.reservation.create({
        data: {
          itemId: reserva.item.id,
          userId: reserva.user.id,
          issuedDate: reserva.issuedDate,
          minCheckout: reserva.minCheckout,
          maxCheckout: reserva.maxCheckout,
          status: reserva.status,
        },
      });
      await prisma.item.update({
        where: { id: reserva.item.id },
        data: { status: reserva.status === 'Activa' ? 'Reservado' : 'Disponible' },
      });
    }
  }

  console.log('Seed completado con éxito.');
  console.log(`Categorías: ${categorias.size} · Géneros: ${generos.size} · Autores: ${autores.size}`);
}

main()
  .catch((error) => {
    console.error('Error durante el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
