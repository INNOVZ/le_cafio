'use client';

import { signout } from '@/lib/auth-actions';
import type { DashboardUser } from '@/lib/dashboard-user';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ChevronsUpDownIcon, LogOutIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <DropdownMenuItem asChild variant="destructive">
      <button
        type="submit"
        className="flex w-full items-center gap-2"
        disabled={pending}
      >
        <LogOutIcon />
        {pending ? 'Logging out...' : 'Log out'}
      </button>
    </DropdownMenuItem>
  );
}

export function NavUser({
  user,
}: {
  user: DashboardUser;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-2 py-2.5 text-left">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {user.role ? (
                    <span className="mt-1 inline-flex w-fit rounded-full bg-sidebar-accent px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                      {user.role}
                    </span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-3 px-2 py-2">
              <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                <div className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  User Details
                </div>
                <div className="space-y-2 text-sm">
                  <div className="grid gap-0.5">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <span className="break-all font-medium">{user.email}</span>
                  </div>
                  {user.role ? (
                    <div className="grid gap-0.5">
                      <span className="text-xs text-muted-foreground">Role</span>
                      <span>{user.role}</span>
                    </div>
                  ) : null}
                  <div className="grid gap-0.5">
                    <span className="text-xs text-muted-foreground">User ID</span>
                    <code className="break-all text-[11px] text-muted-foreground">
                      {user.id}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <form action={signout}>
              <LogoutButton />
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
