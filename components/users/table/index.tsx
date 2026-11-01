import { MoreHorizontalIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
import Link from 'next/link';

export function TableActions({ users }: { users: any }) {
  console.log('users :>> ', users);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellido</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Habilitado</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className='text-right'>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length ? (
          users.map((user: users) => (
            <TableRow id={user.id}>
              <TableCell className='font-medium'>{user.name}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.enabled}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant='ghost' size='icon' className='size-8'>
                        <MoreHorizontalIcon />
                        <span className='sr-only'>Open menu</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align='end'>
                    <Link href={`/users/${user.id}`}>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell className='h-24 text-center'>No results.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
