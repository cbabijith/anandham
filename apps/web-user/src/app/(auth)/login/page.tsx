import { redirect } from 'next/navigation';

// The public library is open to everyone and does not collect reader credentials.
export default function LoginPage() {
  redirect('/');
}
