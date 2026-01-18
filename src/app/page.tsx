"use client";

import AppLayout from "@/components/layout/app-layout";
import AddLeadForm from "@/components/dashboard/add-lead-form";
import UserLeadsTable from "@/components/dashboard/user-leads-table";
import { useState } from "react";

export default function DashboardPage() {
  // This state is used to trigger a re-render of UserLeadsTable when a new lead is added.
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLeadAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <AddLeadForm onLeadAdded={handleLeadAdded} />
          </div>
          <div className="lg:col-span-2">
            <UserLeadsTable key={refreshKey} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
