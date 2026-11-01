// Tipos compartidos del sistema BiblioLove.
// Se usan tanto en las API routes como en los componentes del cliente.

// Roles del sistema
export type Role = 'ADMIN' | 'USER';

// Tipo de movimiento de inventario
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

// Usuario del sistema (sin password)
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

// Maestro (libro o material de biblioteca) con datos de creador
export type MaestroConCreador = {
  id: string;
  nombre: string;
  saldo: number;
  createdAt: Date;
  creadoPor: {
    name: string;
    lastName: string | null;
  };
};

// Movimiento de inventario con datos del ejecutor
export type MovimientoConEjecutor = {
  id: string;
  tipo: TipoMovimiento;
  cantidad: number;
  createdAt: Date;
  ejecutadoPor: {
    name: string;
    lastName: string | null;
  };
};

// Usuario que tiene sesion activa (guardado en localStorage y cookie)
export type SesionUsuario = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

