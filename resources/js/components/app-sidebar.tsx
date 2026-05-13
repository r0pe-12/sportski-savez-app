import { Link } from '@inertiajs/react';
import {
    Building,
    Calendar,
    FileCheck2,
    GraduationCap,
    LayoutGrid,
    ScrollText,
    Trophy,
    Users,
    Users2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

// AppSidebar se renderuje SAMO za admin korisnike (vidi app-layout.tsx),
// pa nav stavke pokrivaju isključivo admin sekcije.
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Korisnici',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Škole',
        href: '/admin/schools',
        icon: Building,
    },
    {
        title: 'Sportovi',
        href: '/admin/sports',
        icon: Trophy,
    },
    {
        title: 'Takmičenja',
        href: '/admin/competitions',
        icon: Calendar,
    },
    {
        title: 'Ekipe',
        href: '/admin/teams',
        icon: Users2,
    },
    {
        title: 'Učenici (verifikacija)',
        href: '/admin/students',
        icon: GraduationCap,
    },
    {
        title: 'Sertifikati',
        href: '/admin/certificates',
        icon: FileCheck2,
    },
    {
        title: 'Audit log',
        href: '/admin/audit-log',
        icon: ScrollText,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
