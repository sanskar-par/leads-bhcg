"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getLeadsByUser } from '@/lib/data-supabase';
import type { Lead } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';

export default function UserLeadsTable() {
    const [userLeads, setUserLeads] = useState<Lead[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchUserLeads = async () => {
            if (user) {
                const leads = await getLeadsByUser(user.id);
                setUserLeads(leads);
            }
        };
        fetchUserLeads();
    }, [user]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">My Added Leads</CardTitle>
                <CardDescription>A list of leads you've recently added to the database.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden sm:table-cell">Company</TableHead>
                                <TableHead className="hidden md:table-cell">Role Type</TableHead>
                                <TableHead className="hidden lg:table-cell">Date Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userLeads.length > 0 ? (
                                userLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell>
                                        <div className="font-medium">{lead.name}</div>
                                        {lead.isBitsian && <Badge variant="secondary" className="mt-1">BITSIAN</Badge>}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{lead.latestCompany}</TableCell>
                                    <TableCell className="hidden md:table-cell">{lead.roleType}</TableCell>
                                    <TableCell className="hidden lg:table-cell">{format(lead.addedAt, 'PPP')}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        You haven't added any leads yet.
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
