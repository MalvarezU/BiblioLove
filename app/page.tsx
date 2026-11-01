import Image from 'next/image';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const allusers = await prisma.user.findMany();
  return (
    <div className='flex flex-co gap-5 flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      {allusers.map((user) => (
        <div className='flex flex-col justify-center itemcente gap-5'>
          <div>{user.name}</div>
          <div>{user.email}</div>
        </div>
      ))}
    </div>
  );
}
