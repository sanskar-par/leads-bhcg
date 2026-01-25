"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, Trophy, LogOut, Briefcase, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/database', label: 'Database', icon: Database },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    // Admin link will be conditionally added
];

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const items = [...navItems];
    // Show admin link only for the exact authorized admin email
    if (user?.email && user.email === 'bhcg@hyderabad.bits-pilani.ac.in') {
        items.push({ href: '/admin', label: 'Admin', icon: Shield });
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Link href="/" className="mr-8 flex items-center space-x-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span className="font-headline font-bold text-lg">BHCG Leads Central</span>
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {items.map((item) => (
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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => logout()} 
                        className="hidden md:flex"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                    
                    {/* Mobile Hamburger Menu */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-primary" />
                                    BHCG Leads
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 mt-8">
                                {user && (
                                    <div className="pb-4 border-b">
                                        <p className="text-sm text-muted-foreground">Welcome,</p>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                )}
                                <nav className="flex flex-col gap-3">
                                    {items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-accent",
                                                pathname === item.href ? "bg-accent text-primary font-medium" : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start mt-4" 
                                    onClick={() => {
                                        setOpen(false);
                                        logout();
                                    }}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
