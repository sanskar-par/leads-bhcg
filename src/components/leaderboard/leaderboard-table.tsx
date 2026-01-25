"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLeaderboard } from '@/lib/data-supabase';
import type { LeaderboardEntry } from '@/lib/types';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaderboardTable() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                console.log('Fetching leaderboard data...');
                const data = await getLeaderboard();
                if (mounted) {
                    console.log('Leaderboard data fetched:', data.length, 'entries');
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchLeaderboard();
        
        return () => {
            mounted = false;
        };
    }, []);

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-yellow-700';
        return 'text-muted-foreground';
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Leaderboard</CardTitle>
                <CardDescription>Users with the highest number of leads added.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Leads Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Loading leaderboard...
                                    </TableCell>
                                </TableRow>
                            ) : leaderboard.length > 0 ? (
                                leaderboard.map((entry, index) => (
                                <TableRow key={entry.user.id} className={cn(index === 0 && "bg-accent")}>
                                    <TableCell className="font-bold text-lg">
                                        <div className={cn("flex items-center gap-2", getRankColor(index + 1))}>
                                            {index === 0 && <Crown className="h-5 w-5 fill-current" />}
                                            {index + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium">{entry.user.name}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-lg font-semibold">{entry.leadCount}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No leads have been added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
