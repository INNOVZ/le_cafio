import { LoginForm } from "@/components/dashboard/LoginForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <LoginForm />
    </div>
  );
}
