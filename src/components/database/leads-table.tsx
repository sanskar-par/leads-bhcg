"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Download, ExternalLink } from "lucide-react";
import { getLeads, findUserById } from '@/lib/data-supabase';
import type { Lead, User } from '@/lib/types';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

type SortKey = keyof Lead | 'addedBy';

export default function LeadsTable() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<{[id: string]: User}>({});
    const [filter, setFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'addedAt', direction: 'descending' });
    
    useEffect(() => {
        const fetchLeadsAndUsers = async () => {
            const allLeads = await getLeads();
            setLeads(allLeads);
            
            const userIds = [...new Set(allLeads.map(lead => lead.addedBy))];
            const userMap: {[id: string]: User} = {};
            await Promise.all(userIds.map(async (id) => {
                const user = await findUserById(id);
                if (user) userMap[id] = user;
            }));
            setUsers(userMap);
        };
        fetchLeadsAndUsers();
    }, []);

    const sortedLeads = useMemo(() => {
        let sortableLeads = [...leads];
        if (sortConfig !== null) {
            sortableLeads.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Lead];
                let bValue: any = b[sortConfig.key as keyof Lead];
                
                // Handle dates
                if (aValue instanceof Date && bValue instanceof Date) {
                    aValue = aValue.getTime();
                    bValue = bValue.getTime();
                }
                
                // Handle undefined values
                if (aValue === undefined) aValue = '';
                if (bValue === undefined) bValue = '';
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableLeads;
    }, [leads, sortConfig]);

    const filteredLeads = useMemo(() => {
        return sortedLeads.filter(lead => 
            Object.values(lead).some(value => 
                String(value).toLowerCase().includes(filter.toLowerCase())
            ) || users[lead.addedBy]?.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [sortedLeads, filter, users]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        }
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const exportToExcel = () => {
        const exportData = filteredLeads.map(lead => ({
            'Name': lead.name,
            'LinkedIn URL': lead.linkedinUrl,
            'Company': lead.latestCompany,
            'Role Type': lead.roleType,
            'Industry': lead.industry,
            'Email': lead.email,
            'Alternate Email': lead.alternateEmail || '',
            'Phone': lead.phoneNumber || '',
            'BITSIAN': lead.isBitsian ? 'Yes' : 'No',
            'Remarks': lead.remarks || '',
            'Added By': users[lead.addedBy]?.name || 'Unknown',
            'Date Added': format(lead.addedAt, 'PPp')
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
        
        XLSX.writeFile(workbook, `BHCG_Leads_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">Central Database</CardTitle>
                        <CardDescription>Browse, filter, and export all leads in the database.</CardDescription>
                    </div>
                    <Button onClick={exportToExcel} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export to Excel
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Search leads..."
                        value={filter}
                        onChange={(event) => setFilter(event.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <div className="border rounded-md overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">
                                    <Button variant="ghost" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                    <Button variant="ghost" onClick={() => requestSort('linkedinUrl')}>LinkedIn {getSortIndicator('linkedinUrl')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    <Button variant="ghost" onClick={() => requestSort('latestCompany')}>Company {getSortIndicator('latestCompany')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    <Button variant="ghost" onClick={() => requestSort('roleType')}>Role Type {getSortIndicator('roleType')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                    <Button variant="ghost" onClick={() => requestSort('industry')}>Industry {getSortIndicator('industry')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[200px]">
                                    <Button variant="ghost" onClick={() => requestSort('email')}>Email {getSortIndicator('email')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[180px]">Alternate Email</TableHead>
                                <TableHead className="min-w-[140px]">Phone</TableHead>
                                <TableHead className="min-w-[100px]">
                                    <Button variant="ghost" onClick={() => requestSort('isBitsian')}>BITSIAN {getSortIndicator('isBitsian')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[200px]">Remarks</TableHead>
                                <TableHead className="min-w-[140px]">
                                    <Button variant="ghost" onClick={() => requestSort('addedBy')}>Added By {getSortIndicator('addedBy')}</Button>
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                    <Button variant="ghost" onClick={() => requestSort('addedAt')}>Date Added {getSortIndicator('addedAt')}</Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.length > 0 ? (
                                filteredLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell>
                                        <a 
                                            href={lead.linkedinUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                            View <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </TableCell>
                                    <TableCell>{lead.latestCompany}</TableCell>
                                    <TableCell>{lead.roleType}</TableCell>
                                    <TableCell>{lead.industry}</TableCell>
                                    <TableCell className="text-sm">{lead.email}</TableCell>
                                    <TableCell className="text-sm">{lead.alternateEmail || '-'}</TableCell>
                                    <TableCell className="text-sm">{lead.phoneNumber || '-'}</TableCell>
                                    <TableCell>
                                        {lead.isBitsian ? (
                                            <Badge variant="secondary">BITSIAN</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">{lead.remarks || '-'}</TableCell>
                                    <TableCell className="text-sm">{users[lead.addedBy]?.name || 'Unknown'}</TableCell>
                                    <TableCell className="text-sm">{format(lead.addedAt, 'PPp')}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-24 text-center">
                                        No results found.
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
