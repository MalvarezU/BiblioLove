import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

// Pagina raiz: redirige al home si hay sesion activa, de lo contrario al login
export default async function RootPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_user_id')?.value;

  if (userId) {
    redirect('/home');
  } else {
    redirect('/login');
  }
}
