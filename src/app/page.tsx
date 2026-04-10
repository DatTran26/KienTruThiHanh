import { redirect } from 'next/navigation';

// proxy.ts handles the redirect — this is a fallback
export default function RootPage() {
  redirect('/dashboard');
}
