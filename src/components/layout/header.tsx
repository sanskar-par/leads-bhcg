"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, Trophy, LogOut, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/database', label: 'Database', icon: Database },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Link href="/" className="mr-8 flex items-center space-x-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span className="font-headline font-bold text-lg">BHCG Leads Central</span>
                </Link>
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 transition-colors hover:text-primary",
                                pathname === item.href ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex flex-1 items-center justify-end space-x-4">
                    {user && (
                        <span className="hidden sm:inline text-sm text-muted-foreground">
                            Welcome, {user.name}
                        </span>
                    )}
                    <Button variant="outline" size="sm" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </header>
    );
}
