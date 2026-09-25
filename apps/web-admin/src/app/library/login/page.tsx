import { redirect } from 'next/navigation';
import { currentAdmin } from '@/features/library/server';
import { LoginForm } from '@/features/library/login-form';
export default async function Login() {
  if (await currentAdmin()) redirect('/library');
  return <LoginForm />;
}
