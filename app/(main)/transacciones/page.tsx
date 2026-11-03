import { redirect } from 'next/navigation';

// Ruta legada: los prestamos y reservas ahora tienen pantallas separadas.
export default function TransaccionesPage() {
  redirect('/prestamos');
}
