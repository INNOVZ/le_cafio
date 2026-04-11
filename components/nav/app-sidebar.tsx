'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav/nav-main';
import { NavUser } from '@/components/nav/nav-user';
import type { DashboardUser } from '@/lib/dashboard-user';
import Image from 'next/image';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
} from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Products',
      url: '/dashboard/products',
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [],
    },
    {
      title: 'Categories',
      url: '/dashboard/categories',
      icon: <BotIcon />,
      items: [],
    },
    {
      title: 'Orders',
      url: '/dashboard/orders',
      icon: <BookOpenIcon />,
      items: [
        {
          title: 'All Orders',
          url: '/dashboard/orders',
        },
        {
          title: 'Fulfilled',
          url: '/dashboard/orders/fulfilled',
        },
        {
          title: 'Unfulfilled',
          url: '/dashboard/orders/unfulfilled',
        },
        {
          title: 'Cancelled',
          url: '/dashboard/orders/cancelled',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: DashboardUser;
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Image src="/logo.svg" alt="Logo" width={24} height={24} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Le Cafio </span>
                  <span className="truncate text-xs"></span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
