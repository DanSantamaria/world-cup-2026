import { redirect } from 'next/navigation';

// Dashboard now lives at /groups — redirect for any direct hits
export default function DashboardPage(): never {
  redirect('/groups');
}
