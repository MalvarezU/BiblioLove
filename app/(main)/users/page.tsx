import React from 'react';
import { Button } from '@/components/ui/button';
import { TableActions } from '@/components/users/table';
import { DialogDemo } from '@/components/users/dialog';

type users = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  enabled: boolean;
  deleted: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

async function getUsers(): Promise<users[]> {
  const response = await fetch('http://localhost:3000/api/users');
  const data = await response.json();
  return data.users;
}

export default async function Users() {
  const Data = await getUsers();

  return (
    <div>
      <div className='flex flex-row justify-around items-center'>
        <div>
          <h1 className='text-5xl font-bold'>MAESTRO DE USUARIOS</h1>
        </div>
        <div>
          <DialogDemo />
        </div>
      </div>
      <div>
        <TableActions users={Data} />
      </div>
    </div>
  );
}
