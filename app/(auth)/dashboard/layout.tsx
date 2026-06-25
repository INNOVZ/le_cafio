import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/nav/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getDashboardUser } from '@/lib/dashboard-user';
import { buildNoIndexMetadata } from '@/lib/seo';
import { createClient } from '@/utils/supabase/server';
import '@/app/globals.css';

export const metadata = buildNoIndexMetadata('Dashboard');

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const dashboardUser = getDashboardUser(user);

  return (
    <div className="">
      <SidebarProvider>
        <AppSidebar user={dashboardUser} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
