// Tipos compartidos del sistema BiblioLove.

export type Role = 'ADMIN' | 'USER';

export type UsuarioPublico = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  role: Role;
  enabled: boolean;
  deleted: boolean;
  createdAt: Date;
};

export type LibroConRelaciones = {
  id: string;
  title: string;
  author: { id: number; name: string; lastName: string };
  category: { id: number; name: string };
  genre: { id: number; name: string };
  items: {
    id: string;
    status: string;
    enabled: boolean;
    deleted: boolean;
    publisher: string;
  }[];
};

export type CheckoutConRelaciones = {
  id: string;
  checkoutDate: Date;
  dueDate: Date;
  returnDate: Date | null;
  status: string;
  item: { book: { title: string } };
  user: { name: string; lastName: string | null };
};

export type ReservaConRelaciones = {
  id: string;
  issuedDate: Date;
  minCheckout: Date;
  maxCheckout: Date;
  status: string;
  item: { book: { title: string } };
  user: { name: string; lastName: string | null };
};

export type SesionUsuario = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
