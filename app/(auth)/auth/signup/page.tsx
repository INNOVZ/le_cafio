import { SignupForm } from '@/components/dashboard/SignUpForm';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata = buildNoIndexMetadata('Sign Up');

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
