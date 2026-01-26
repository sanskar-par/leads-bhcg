"use client";

import React, { useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import AdminEmailSender from '@/components/admin/email-sender';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Only allow the exact admin email
      if (!user || !user.email || user.email !== 'bhcg@hyderabad.bits-pilani.ac.in') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="container py-8">
        <Card className="max-w-7xl mx-auto mb-6">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Admin Dashboard</CardTitle>
            <CardDescription>Email campaign management and database administration</CardDescription>
          </CardHeader>
        </Card>
        
        <div className="max-w-7xl mx-auto">
          <AdminEmailSender />
        </div>
      </div>
    </AppLayout>
  );
}
