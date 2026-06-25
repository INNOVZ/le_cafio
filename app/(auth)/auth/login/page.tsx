import { LoginForm } from '@/components/dashboard/LoginForm';
import { buildNoIndexMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = buildNoIndexMetadata('Login');

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <LoginForm />
    </div>
  );
}
