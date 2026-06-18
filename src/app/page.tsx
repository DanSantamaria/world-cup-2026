import { redirect } from 'next/navigation';
import { auth } from '@/infrastructure/auth';

export default async function RootPage(): Promise<never> {
  const session = await auth();
  redirect(session?.user ? '/dashboard' : '/login');
}
