import Link from "next/link";
import {
    History,
    LayoutDashboard,
    LogOut,
    Plus,
    Settings,
    Shield,
    User,
    Search,
    FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { HeaderTitle } from "@/components/dashboard/header-title";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Default to patient links if unknown, but normally middleware protects this
    let role = 'patient';
    let sidebarLinks: any[] = [];

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (profile) role = profile.role;
    }

    // Dynamic Links Configuration
    if (role === 'hospital') {
        sidebarLinks = [
            { href: "/hospital", label: "Patient Search", icon: <Search className="h-5 w-5" /> },
            { href: "http://127.0.0.1:5000/scan", label: "NFC Scanner", icon: <LayoutDashboard className="h-5 w-5" />, external: true },
        ];
    } else if (role === 'insurance') {
        // Insurance Portal has its own self-contained layout
        return <div className="min-h-screen bg-[#0a0e1a]">{children}</div>;
    } else if (role === 'admin' || role === 'service_role') {
        sidebarLinks = [
            { href: "/admin", label: "Admin Console", icon: <LayoutDashboard className="h-5 w-5" /> },
            { href: "/admin/create-org", label: "Register Org", icon: <Plus className="h-5 w-5" /> },
        ];
    } else {
        // Patient (Default)
        sidebarLinks = [
            { href: "/dashboard", label: "My Health ID", icon: <User className="h-5 w-5" /> },
        ];
    }

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
                <div className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">HealthOne</span>
                    </div>
                </div>

                <SidebarNav links={sidebarLinks} />

                <div className="p-4 border-t border-border/50">
                    <form action="/auth/signout" method="post">
                        <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg font-medium transition-colors">
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm bg-card/80">
                    <HeaderTitle role={role} />
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shadow-sm">
                            {role.slice(0, 2)}
                        </div>
                    </div>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
